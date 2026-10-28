/**
 * Importa el catálogo scrapeado (productos.json) a la tabla `foods`.
 * Se puede correr cada vez que el scraper genere un archivo nuevo: actualiza
 * los alimentos (sin cambiarles el id) y agrega sus precios al historial.
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
const { mergeProducts } = require("./merge-products");

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
  const hasPrice = item.precio_min != null && item.precio_min >= MIN_VALID_PRICE;
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

// Ningún alimento para mascotas cuesta menos que esto: un precio menor es
// un error de lectura del scraper (ej. "Pack 3×2 Tiki Cat" leído como $3).
const MIN_VALID_PRICE = 500;

// "jumbo_cat" -> "jumbo.cl", "superzoo" -> "superzoo.cl": el scraper usa
// identificadores distintos para la misma tienda según la fuente.
function normalizeStore(tienda) {
  if (!tienda) return null;
  let store = tienda.trim().toLowerCase().replace(/_(cat|dog|gato|perro)$/, "");
  if (!store.includes(".")) store += ".cl";
  return store;
}

function isSingleFormat(formato) {
  return /^\s*[\d.,]+\s*(kg|g)\s*$/i.test(formato || "");
}

// El scraper trae precio_por_kg solo para algunas ofertas; con un formato
// único se puede calcular igual a partir del tamaño.
function pricePerKg(offer) {
  if (offer.precio_por_kg != null) return Math.round(offer.precio_por_kg);
  const match = offer.formato.trim().match(/^([\d.,]+)\s*(kg|g)$/i);
  const kg = Number(match[1].replace(",", ".")) / (match[2].toLowerCase() === "g" ? 1000 : 1);
  return kg > 0 ? Math.round(offer.precio / kg) : null;
}

/**
 * Une `ofertas` (precios del producto en todas las tiendas) con
 * `precios_por_formato`, sin duplicados. Una oferta con formato ambiguo
 * ("80 g | 70 g | 1 kg") se guarda sin formato ni precio/kg: no se sabe a
 * qué tamaño corresponde el precio, así que no se inventa.
 */
function collectOffers(item) {
  const raw = [...(item.ofertas || []), ...(item.precios_por_formato || [])];
  const seen = new Set();
  const offers = [];

  for (const o of raw) {
    if (o.precio == null || o.precio < MIN_VALID_PRICE) continue;

    const singleFormat = isSingleFormat(o.formato);
    const offer = {
      format: singleFormat ? o.formato.trim() : "",
      price: o.precio,
      pricePerKg: singleFormat ? pricePerKg(o) : null,
      store: normalizeStore(o.tienda),
      url: o.url || null,
      // Solo para el historial de precios; no se guarda en prices_by_format.
      recordedOn: o.fecha || null,
    };

    const key = `${offer.store}|${offer.format}|${offer.price}|${offer.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    offers.push(offer);
  }

  return offers;
}

function bestPrice(offers, precioMin, precioFuente, fuente) {
  const fallbackStore =
    normalizeStore(precioFuente?.tienda) || deriveFallbackStore(fuente?.tipo);
  const fallbackUrl = precioFuente?.url || fuente?.url || null;
  const validPrecioMin = precioMin != null && precioMin >= MIN_VALID_PRICE ? precioMin : null;

  if (offers.length === 0) {
    return { min: validPrecioMin, perKg: null, store: fallbackStore, url: fallbackUrl };
  }

  const cheapest = offers.reduce((a, b) => (a.price <= b.price ? a : b));
  const withPerKg = offers.filter((o) => o.pricePerKg != null);
  const cheapestPerKg = withPerKg.length
    ? withPerKg.reduce((a, b) => (a.pricePerKg <= b.pricePerKg ? a : b))
    : null;

  // La tienda y el link acompañan al precio que se muestra (el más barato),
  // no al de mejor precio por kilo, que puede ser otra oferta.
  return {
    min: cheapest.price,
    perKg: cheapestPerKg ? cheapestPerKg.pricePerKg : null,
    store: cheapest.store || fallbackStore,
    url: cheapest.url || fallbackUrl,
  };
}

// Precios antiguos que el scraper guardó antes de existir el historial en
// la base (historial_precios.csv, junto a la carpeta salida/). Se cruzan
// con el catálogo por la URL de la oferta.
function readLegacyHistory(sourcePath) {
  const csvPath = path.join(path.dirname(sourcePath), "..", "historial_precios.csv");
  if (!fs.existsSync(csvPath)) return [];

  const lines = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(",");
  const column = (name) => header.indexOf(name);
  const [priceCol, storeCol, urlCol, dateCol] = ["precio", "tienda", "url", "fecha_extraccion"].map(column);

  return lines.slice(1).map((line) => {
    // Los nombres pueden traer comas; precio, tienda, url y fecha no.
    const cells = line.split(",");
    const fromEnd = (col) => cells[cells.length - (header.length - col)];
    return {
      price: Math.round(Number(fromEnd(priceCol))),
      store: normalizeStore(fromEnd(storeCol)),
      url: fromEnd(urlCol),
      recordedOn: fromEnd(dateCol),
    };
  });
}

async function recordPrice(pool, foodId, offer, recordedOn) {
  await pool.query(
    `
      INSERT INTO food_price_history (food_id, store, format, price, url, recorded_on)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (food_id, store, format, recorded_on)
      DO UPDATE SET price = LEAST(food_price_history.price, EXCLUDED.price)
    `,
    [foodId, offer.store || "", offer.format || "", offer.price, offer.url, recordedOn]
  );
}

// Un ingrediente es un nombre corto ("Pollo deshidratado"); cuando el
// scraper deja una frase de la descripción del producto, se descarta.
const MAX_INGREDIENT_LENGTH = 80;

function firstIngredient(ingredientes) {
  const value = ingredientes.primer_ingrediente?.trim();
  return value && value.length <= MAX_INGREDIENT_LENGTH ? value : null;
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

  const rawItems = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

  // Las notas "fuera de rango" son de cada registro, así que se sanea
  // antes de unir los registros del mismo alimento.
  let sanitizedCount = 0;
  const sanitizedItems = rawItems.map((item) => {
    const raw = item.nutricion || {};
    const nutricion = sanitizeNutricion(raw, item.notas);
    if (nutricion !== raw) sanitizedCount += 1;
    return { ...item, nutricion };
  });
  const items = mergeProducts(sanitizedItems);
  const mergedGroups = items.filter((item) => item.mergedFrom > 1).length;

  const pool = new Pool(readEnvLocal());

  let inserted = 0;
  let skipped = 0;
  let estimatedKcalCount = 0;
  let withPriceCount = 0;
  let withPriceUrlCount = 0;
  let withPricesByFormatCount = 0;
  let discardedPriceCount = 0;
  let historyCount = 0;
  const today = new Date().toISOString().slice(0, 10);
  // URL de cada oferta -> alimento y formato, para cruzar el historial antiguo.
  const offersByUrl = new Map();

  try {
    await pool.query("BEGIN");
    // Alimentos de imports anteriores a product_key: se reemplazan una única vez.
    await pool.query("DELETE FROM foods WHERE product_key IS NULL");
    // Los que esta corrida no traiga quedan inactivos (no se borran: pueden
    // ser favoritos de alguien y tienen historial de precios).
    await pool.query("UPDATE foods SET is_active = false");

    for (const item of items) {
      if (!hasUsableData(item)) {
        skipped += 1;
        continue;
      }

      const nutricion = item.nutricion;

      const ingredientes = item.ingredientes || {};
      const clasificacion = item.clasificacion || {};

      let kcalKg = nutricion.kcal_kg;
      let kcalEstimated = false;

      if (kcalKg == null) {
        kcalKg = estimateKcalPerKg(nutricion);
        kcalEstimated = kcalKg != null;
        if (kcalEstimated) estimatedKcalCount += 1;
      }

      const pricesByFormat = collectOffers(item);
      if (pricesByFormat.some((o) => o.format)) withPricesByFormatCount += 1;

      const price = bestPrice(pricesByFormat, item.precio_min, item.precio_fuente, item.fuente);
      if (price.min != null) withPriceCount += 1;
      if (price.min != null && price.url != null) withPriceUrlCount += 1;
      if (item.precio_min != null && price.min == null) discardedPriceCount += 1;

      const result = await pool.query(
        `
          INSERT INTO foods (
            brand, name, species, type, stage, size, conditions,
            protein, fat, fiber, moisture,
            protein_ms, fat_ms, fiber_ms,
            kcal_kg, kcal_kg_estimated,
            allergens, first_ingredient, formats,
            price_min, price_per_kg, price_store, price_url,
            source_url, scraped_at, prices_by_format,
            product_key, is_active
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11,
            $12, $13, $14,
            $15, $16,
            $17, $18, $19,
            $20, $21, $22, $23,
            $24, $25, $26,
            $27, true
          )
          ON CONFLICT (product_key) DO UPDATE SET
            brand = EXCLUDED.brand, name = EXCLUDED.name, species = EXCLUDED.species,
            type = EXCLUDED.type, stage = EXCLUDED.stage, size = EXCLUDED.size,
            conditions = EXCLUDED.conditions,
            protein = EXCLUDED.protein, fat = EXCLUDED.fat, fiber = EXCLUDED.fiber,
            moisture = EXCLUDED.moisture,
            protein_ms = EXCLUDED.protein_ms, fat_ms = EXCLUDED.fat_ms, fiber_ms = EXCLUDED.fiber_ms,
            kcal_kg = EXCLUDED.kcal_kg, kcal_kg_estimated = EXCLUDED.kcal_kg_estimated,
            allergens = EXCLUDED.allergens, first_ingredient = EXCLUDED.first_ingredient,
            formats = EXCLUDED.formats,
            price_min = EXCLUDED.price_min, price_per_kg = EXCLUDED.price_per_kg,
            price_store = EXCLUDED.price_store, price_url = EXCLUDED.price_url,
            source_url = EXCLUDED.source_url, scraped_at = EXCLUDED.scraped_at,
            prices_by_format = EXCLUDED.prices_by_format,
            is_active = true
          RETURNING id
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
          firstIngredient(ingredientes),
          item.formatos || [],
          price.min,
          price.perKg,
          price.store,
          price.url,
          item.fuente?.url || null,
          item.fuente?.fecha_extraccion || null,
          JSON.stringify(pricesByFormat.map(({ recordedOn: _recordedOn, ...offer }) => offer)),
          item.productKey,
        ]
      );

      const foodId = result.rows[0].id;
      for (const offer of pricesByFormat) {
        await recordPrice(pool, foodId, offer, offer.recordedOn || item.fuente?.fecha_extraccion || today);
        historyCount += 1;
        if (offer.url) offersByUrl.set(offer.url, { foodId, format: offer.format });
      }

      inserted += 1;
    }

    for (const legacy of readLegacyHistory(sourcePath)) {
      const match = offersByUrl.get(legacy.url);
      if (!match || !(legacy.price >= MIN_VALID_PRICE) || !legacy.recordedOn) continue;
      await recordPrice(pool, match.foodId, { ...legacy, format: match.format }, legacy.recordedOn);
      historyCount += 1;
    }

    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }

  console.log(`Importados ${inserted} alimentos desde ${sourcePath}`);
  console.log(
    `Registros del scraper: ${rawItems.length} -> ${items.length} alimentos (${mergedGroups} unidos por ser el mismo producto en otro tamaño o tienda)`
  );
  console.log(`Omitidos por no tener nutrición ni precio: ${skipped}`);
  console.log(`Con precio real: ${withPriceCount}/${inserted}`);
  console.log(`Con página de origen del precio: ${withPriceUrlCount}/${inserted}`);
  console.log(`Con desglose de precio por formato: ${withPricesByFormatCount}/${inserted}`);
  console.log(`Precio descartado por ser inválido (< $${MIN_VALID_PRICE}): ${discardedPriceCount}`);
  console.log(`Precios registrados en el historial: ${historyCount}`);
  console.log(`Con kcal/kg estimado (Atwater, no real): ${estimatedKcalCount}/${inserted}`);
  console.log(`Registros con algún nutriente anulado por venir "fuera de rango": ${sanitizedCount}/${rawItems.length}`);
}

main().catch((error) => {
  console.error("Error importando alimentos:", error.message);
  process.exit(1);
});
