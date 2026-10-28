/**
 * Une los registros del scraper que son el mismo alimento: la misma
 * tienda suele listar cada tamaño como un producto aparte ("Prairie
 * 12,7 kg" y "Prairie 6,35 kg"), y varias tiendas venden el mismo
 * producto. Sin unirlos, la comparación mostraría el mismo alimento
 * varias veces con el mismo puntaje. Unidos, cada tamaño y cada tienda
 * queda como una oferta del mismo alimento.
 */

// "12,7 kg", "1250 Gr", "4 kg.", "85 grs"
const SIZE_RE = /(\d+(?:[.,]\d+)?)\s*(kgs?|kilos?|grs?|gramos|g)\b\.?/gi;

// Más formatos que esto en un solo producto es la lista de tallas de toda
// una familia de variantes (bug conocido del scraper), no las del producto.
const MAX_TRUSTED_FORMATS = 10;

function normalizeText(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatToGrams(format) {
  const match = String(format || "").trim().match(/^(\d+(?:[.,]\d+)?)\s*(kgs?|kilos?|grs?|gramos|g)\.?$/i);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  return /^k/i.test(match[2]) ? value * 1000 : value;
}

/**
 * "12,7 kg" -> "12.7 kg", "1250 Gr" -> "1.25 kg", "0,3 kg" -> "300 g":
 * una sola forma de escribir cada tamaño, para que "300 g" y "0.3 kg" no
 * aparezcan como dos formatos. null si no es un tamaño en kg/g.
 */
function normalizeFormat(format) {
  const grams = formatToGrams(format);
  if (grams == null || grams <= 0) return null;
  if (grams >= 1000) return `${Math.round(grams) / 1000} kg`;
  return `${Math.round(grams * 10) / 10} g`;
}

function sortBySize(formats) {
  return formats.sort((a, b) => formatToGrams(a) - formatToGrams(b));
}

/** El tamaño que trae el nombre, solo si hay exactamente uno. */
function sizeFromName(nombre) {
  const matches = [...String(nombre || "").matchAll(SIZE_RE)];
  if (matches.length !== 1) return null;
  return normalizeFormat(`${matches[0][1]} ${matches[0][2]}`);
}

function stripSize(nombre) {
  const stripped = String(nombre || "")
    .replace(SIZE_RE, " ")
    .replace(/\(\s*\)/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/[\s,.\-–|]+$/, "")
    .trim();
  return stripped || String(nombre || "").trim();
}

function productKey(item) {
  return [
    normalizeText(item.marca),
    normalizeText(stripSize(item.nombre)),
    item.especie || "",
    item.clasificacion?.tipo || "",
  ].join("|");
}

/** Cuánta información útil trae un registro; el más completo es la base del grupo. */
function dataScore(item) {
  const n = item.nutricion || {};
  return (
    (n.proteina != null ? 3 : 0) +
    (item.ingredientes?.originales?.trim() ? 3 : 0) +
    (n.kcal_kg != null ? 1 : 0) +
    (item.clasificacion?.etapa ? 1 : 0) +
    (item.clasificacion?.tamano ? 1 : 0)
  );
}

/** Tamaños respaldados por un precio o por el nombre del producto. */
function evidencedFormats(item) {
  const formats = [...(item.ofertas || []), ...(item.precios_por_formato || [])]
    .map((o) => normalizeFormat(o.formato))
    .filter(Boolean);
  const fromName = sizeFromName(item.nombre);
  if (fromName) formats.push(fromName);
  return formats;
}

/**
 * La lista `formatos` del scraper a veces mezcla tallas de otras variantes
 * o gramos de la tabla nutricional ("35 g" en un saco de 12 kg). Por eso
 * se prefieren los tamaños con respaldo (una oferta o el nombre) y la
 * lista propia solo se usa cuando no hay ninguno y no viene inflada.
 */
function groupFormats(group) {
  const evidenced = group.flatMap(evidencedFormats);
  if (evidenced.length) return sortBySize([...new Set(evidenced)]);
  const own = group
    .filter((item) => (item.formatos || []).length <= MAX_TRUSTED_FORMATS)
    .flatMap((item) => (item.formatos || []).map(normalizeFormat))
    .filter(Boolean);
  return sortBySize([...new Set(own)]);
}

/**
 * Ofertas del registro; a las que no traen formato se les pone el tamaño
 * de su nombre. Cada oferta guarda la fecha en que se leyó su registro,
 * porque al unir tiendas distintas cada una pudo scrapearse otro día.
 */
function offersWithFormat(item) {
  const nameSize = sizeFromName(item.nombre);
  const fecha = item.fuente?.fecha_extraccion || null;
  return [...(item.ofertas || []), ...(item.precios_por_formato || [])].map((o) => {
    const formato = o.formato && o.formato.trim() ? o.formato : nameSize || "";
    return { ...o, formato: normalizeFormat(formato) || formato, fecha };
  });
}

function mergeGroup(group, key) {
  const base = group.reduce((best, item) => (dataScore(item) > dataScore(best) ? item : best));
  const firstWith = (pick) => group.map(pick).find((value) => value) || "";

  const validPrices = group
    .map((item) => item.precio_min)
    .filter((price) => price != null && price >= 500);

  const ingredientsSource =
    base.ingredientes?.originales?.trim()
      ? base
      : group.find((item) => item.ingredientes?.originales?.trim()) || base;

  return {
    ...base,
    nombre: stripSize(base.nombre),
    clasificacion: {
      ...base.clasificacion,
      etapa: base.clasificacion?.etapa || firstWith((item) => item.clasificacion?.etapa),
      tamano: base.clasificacion?.tamano || firstWith((item) => item.clasificacion?.tamano),
    },
    ingredientes: ingredientsSource.ingredientes,
    formatos: groupFormats(group),
    ofertas: group.flatMap(offersWithFormat),
    precios_por_formato: [],
    precio_min: validPrices.length ? Math.min(...validPrices) : null,
    productKey: key,
    mergedFrom: group.length,
  };
}

function mergeProducts(items) {
  const groups = new Map();
  for (const item of items) {
    const key = productKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups].map(([key, group]) => mergeGroup(group, key));
}

module.exports = {
  mergeProducts,
  normalizeFormat,
  sizeFromName,
  stripSize,
  MAX_TRUSTED_FORMATS,
};
