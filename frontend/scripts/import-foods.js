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

function bestPrice(preciosPorFormato, precioMin) {
  if (!preciosPorFormato || preciosPorFormato.length === 0) {
    return { min: precioMin ?? null, perKg: null, store: null, url: null };
  }

  const withPerKg = preciosPorFormato.filter((p) => p.precio_por_kg != null);
  const cheapestPerKg = withPerKg.length
    ? withPerKg.reduce((a, b) => (a.precio_por_kg <= b.precio_por_kg ? a : b))
    : null;

  const cheapestOverall = preciosPorFormato.reduce((a, b) =>
    a.precio <= b.precio ? a : b
  );

  return {
    min: precioMin ?? cheapestOverall.precio ?? null,
    perKg: cheapestPerKg ? Math.round(cheapestPerKg.precio_por_kg) : null,
    store: (cheapestPerKg || cheapestOverall).tienda ?? null,
    url: (cheapestPerKg || cheapestOverall).url ?? null,
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
  let estimatedKcalCount = 0;
  let withPriceCount = 0;

  try {
    await pool.query("BEGIN");
    await pool.query("DELETE FROM foods"); // import idempotente: reemplaza el catálogo completo

    for (const item of items) {
      const nutricion = item.nutricion || {};
      const ingredientes = item.ingredientes || {};
      const clasificacion = item.clasificacion || {};

      let kcalKg = nutricion.kcal_kg;
      let kcalEstimated = false;

      if (kcalKg == null) {
        kcalKg = estimateKcalPerKg(nutricion);
        kcalEstimated = kcalKg != null;
        if (kcalEstimated) estimatedKcalCount += 1;
      }

      const price = bestPrice(item.precios_por_formato, item.precio_min);
      if (price.min != null) withPriceCount += 1;

      await pool.query(
        `
          INSERT INTO foods (
            brand, name, species, type, stage, conditions,
            protein, fat, fiber, moisture,
            protein_ms, fat_ms, fiber_ms,
            kcal_kg, kcal_kg_estimated,
            allergens, first_ingredient, formats,
            price_min, price_per_kg, price_store, price_url,
            source_url, scraped_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10,
            $11, $12, $13,
            $14, $15,
            $16, $17, $18,
            $19, $20, $21, $22,
            $23, $24
          )
        `,
        [
          item.marca,
          item.nombre,
          mapSpecies(item.especie),
          clasificacion.tipo || "",
          clasificacion.etapa || "",
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
  console.log(`Con precio real: ${withPriceCount}/${inserted}`);
  console.log(`Con kcal/kg estimado (Atwater, no real): ${estimatedKcalCount}/${inserted}`);
}

main().catch((error) => {
  console.error("Error importando alimentos:", error.message);
  process.exit(1);
});
