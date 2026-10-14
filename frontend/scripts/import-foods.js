/**
 * Importa el catálogo scrapeado (productos.json) a la tabla `foods`.
 * Uso único por entorno: cada integrante lo corre una vez contra su
 * propia base local después de aplicar database/schema.sql.
 *
 * Uso:
 *   node scripts/import-foods.js <ruta-a-productos.json>
 *
 * Si no se entrega la ruta, usa la última ubicación conocida del
 * scraper en este equipo (ajustar si cambia).
 */
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const DEFAULT_SOURCE =
  "C:/Users/pract/Downloads/scraper_mascotas/scraper_mascotas/datos/salida/productos.json";

function readEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const content = fs.readFileSync(envPath, "utf8");
  const get = (key) => {
    const line = content.split("\n").find((l) => l.startsWith(`${key}=`));
    if (!line) return undefined;
    return line.split("=").slice(1).join("=").trim();
  };
  return {
    host: get("DB_HOST"),
    port: Number(get("DB_PORT")),
    user: get("DB_USER"),
    password: get("DB_PASSWORD"),
    database: get("DB_NAME"),
  };
}

function mapSpecies(especie) {
  if (especie === "gato") return "Gato";
  if (especie === "perro") return "Perro";
  return "";
}

// El scraper a veces deja el valor crudo de un nutriente aunque él mismo
// detectó que es implausible (ej. un alimento húmedo con humedad=1.5%)
// y lo anota en `notas` como "proteina=X fuera de rango". Tratamos esos
// campos como no verificados (null) en vez de puntuar con un dato que
// sabemos que está mal.
function parseOutOfRangeNutrients(notas) {
  if (!notas) return new Set();
  const matches = notas.matchAll(/(proteina|grasa|fibra|humedad)=[\d.]+ fuera de rango/g);
  return new Set([...matches].map((m) => m[1]));
}

function sanitizeNutricion(nutricion, notas) {
  const outOfRange = parseOutOfRangeNutrients(notas);
  if (outOfRange.size === 0) return nutricion;

  const sanitized = { ...nutricion };
  for (const key of outOfRange) sanitized[key] = null;

  // proteina_ms/grasa_ms/fibra_ms se calculan a partir del valor crudo Y
  // de humedad: si cualquiera de los dos es inválido, el valor en base
  // materia seca tampoco es confiable.
  if (outOfRange.has("proteina") || outOfRange.has("humedad")) sanitized.proteina_ms = null;
  if (outOfRange.has("grasa") || outOfRange.has("humedad")) sanitized.grasa_ms = null;
  if (outOfRange.has("fibra") || outOfRange.has("humedad")) sanitized.fibra_ms = null;

  return sanitized;
}

// Productos sin ningún dato aprovechable por el motor de compatibilidad
// (ni nutrición, ni kcal, ni precio): no aportan nada y solo ensucian la
// lista de resultados, así que no se importan.
function hasUsableData(item) {
  const n = item.nutricion || {};
  const hasNutrition = n.proteina != null || n.grasa != null || n.kcal_kg != null;
  const hasPrice = item.precio_min != null;
  return hasNutrition || hasPrice;
}

// Fórmula de Atwater: estima kcal/kg cuando el scraper no trae kcal_kg
// real. proteína y grasa en kcal/g según factores estándar; el resto
// (humedad + fibra + cenizas, lo no-graso-no-proteico) se aproxima a 4
// kcal/g como carbohidratos. Es una ESTIMACIÓN, se marca como tal.
function estimateKcalPerKg(nutricion) {
  const { proteina, grasa, humedad, fibra, cenizas } = nutricion;
  if (proteina == null || grasa == null) return null;

  const knownPct =
    proteina + grasa + (humedad ?? 0) + (fibra ?? 0) + (cenizas ?? 0);
  const carbsPct = Math.max(0, 100 - knownPct);

  const kcalPer100g = proteina * 4 + grasa * 9 + carbsPct * 4;
  return Math.round(kcalPer100g * 10); // kcal/100g -> kcal/kg
}

// "catálogo kamanpet.cl" -> "kamanpet.cl"; "sitio oficial" -> "sitio
// oficial de la marca". Se usa solo cuando el scraper no trajo una
// tienda/url específica del precio (precio_fuente vacío), para no dejar
// el precio sin decir de dónde salió.
function deriveFallbackStore(fuenteTipo) {
  if (!fuenteTipo) return null;
  if (fuenteTipo === "sitio oficial") return "sitio oficial de la marca";
  const match = fuenteTipo.match(/^catálogo (.+)$/);
  return match ? match[1] : fuenteTipo;
}

function mapPricesByFormat(preciosPorFormato) {
  if (!preciosPorFormato || preciosPorFormato.length === 0) return [];

  return preciosPorFormato.map((p) => ({
    format: p.formato,
    price: p.precio,
    pricePerKg: p.precio_por_kg != null ? Math.round(p.precio_por_kg) : null,
    store: p.tienda || null,
    url: p.url || null,
  }));
}

function bestPrice(preciosPorFormato, precioMin, fuente) {
  const fallbackStore = deriveFallbackStore(fuente?.tipo);
  const fallbackUrl = fuente?.url || null;

  if (!preciosPorFormato || preciosPorFormato.length === 0) {
    return {
      min: precioMin ?? null,
      perKg: null,
      store: fallbackStore,
      url: fallbackUrl,
    };
  }

  const withPerKg = preciosPorFormato.filter((p) => p.precio_por_kg != null);
  const cheapestPerKg = withPerKg.length
    ? withPerKg.reduce((a, b) => (a.precio_por_kg <= b.precio_por_kg ? a : b))
    : null;

  const cheapestOverall = preciosPorFormato.reduce((a, b) =>
    a.precio <= b.precio ? a : b
  );

  const source = cheapestPerKg || cheapestOverall;

  return {
    min: precioMin ?? cheapestOverall.precio ?? null,
    perKg: cheapestPerKg ? Math.round(cheapestPerKg.precio_por_kg) : null,
    store: source.tienda || fallbackStore,
    url: source.url || fallbackUrl,
  };
}

async function main() {
  const sourcePath = process.argv[2] || DEFAULT_SOURCE;

  if (!fs.existsSync(sourcePath)) {
    console.error(`No se encontró el archivo del scraper en: ${sourcePath}`);
    console.error(
      "Pásalo como argumento: node scripts/import-foods.js <ruta>"
    );
    process.exit(1);
  }

  const items = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
  const pool = new Pool(readEnvLocal());

  let inserted = 0;
  let skipped = 0;
  let sanitizedCount = 0;
  let estimatedKcalCount = 0;
  let withPriceCount = 0;
  let withPriceUrlCount = 0;
  let withPricesByFormatCount = 0;

  try {
    await pool.query("BEGIN");
    await pool.query("DELETE FROM foods"); // import idempotente: reemplaza el catálogo completo

    for (const item of items) {
      if (!hasUsableData(item)) {
        skipped += 1;
        continue;
      }

      const rawNutricion = item.nutricion || {};
      const nutricion = sanitizeNutricion(rawNutricion, item.notas);
      if (nutricion !== rawNutricion) sanitizedCount += 1;

      const ingredientes = item.ingredientes || {};
      const clasificacion = item.clasificacion || {};

      let kcalKg = nutricion.kcal_kg;
      let kcalEstimated = false;

      if (kcalKg == null) {
        kcalKg = estimateKcalPerKg(nutricion);
        kcalEstimated = kcalKg != null;
        if (kcalEstimated) estimatedKcalCount += 1;
      }

      const price = bestPrice(item.precios_por_formato, item.precio_min, item.fuente);
      if (price.min != null) withPriceCount += 1;
      if (price.url != null) withPriceUrlCount += 1;

      const pricesByFormat = mapPricesByFormat(item.precios_por_formato);
      if (pricesByFormat.length > 0) withPricesByFormatCount += 1;

      await pool.query(
        `
          INSERT INTO foods (
            brand, name, species, type, stage, size, conditions,
            protein, fat, fiber, moisture,
            protein_ms, fat_ms, fiber_ms,
            kcal_kg, kcal_kg_estimated,
            allergens, first_ingredient, formats,
            price_min, price_per_kg, price_store, price_url,
            source_url, scraped_at, prices_by_format
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14,
            $15, $16,
            $17, $18, $19,
            $20, $21, $22, $23,
            $24, $25, $26
          )
        `,
        [
          item.marca,
          item.nombre,
          mapSpecies(item.especie),
          clasificacion.tipo || "",
          clasificacion.etapa || "",
          clasificacion.tamano || "",
          clasificacion.condiciones || [],
          nutricion.proteina,
          nutricion.grasa,
          nutricion.fibra,
          nutricion.humedad,
          nutricion.proteina_ms,
          nutricion.grasa_ms,
          nutricion.fibra_ms,
          kcalKg,
          kcalEstimated,
          JSON.stringify(ingredientes.contiene || {}),
          ingredientes.primer_ingrediente || null,
          item.formatos || [],
          price.min,
          price.perKg,
          price.store,
          price.url,
          item.fuente?.url || null,
          item.fuente?.fecha_extraccion || null,
          JSON.stringify(pricesByFormat),
        ]
      );

      inserted += 1;
    }

    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }

  console.log(`Importados ${inserted} alimentos desde ${sourcePath}`);
  console.log(`Omitidos por no tener nutrición ni precio: ${skipped}`);
  console.log(`Con precio real: ${withPriceCount}/${inserted}`);
  console.log(`Con página de origen del precio: ${withPriceUrlCount}/${inserted}`);
  console.log(`Con desglose de precio por formato: ${withPricesByFormatCount}/${inserted}`);
  console.log(`Con kcal/kg estimado (Atwater, no real): ${estimatedKcalCount}/${inserted}`);
  console.log(`Con algún nutriente anulado por venir "fuera de rango": ${sanitizedCount}/${inserted}`);
}

main().catch((error) => {
  console.error("Error importando alimentos:", error.message);
  process.exit(1);
});
