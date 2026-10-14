/** Un formato con su precio, cuando el scraper trae el desglose real por tamaño. */
export type PriceByFormat = {
  format: string;
  price: number;
  pricePerKg: number | null;
  store: string | null;
  url: string | null;
};

/** "3 kg" -> 3, "500 g" -> 0.5. null si el texto no se pudo interpretar. */
export function parseFormatToKg(format: string): number | null {
  const match = format.trim().match(/^([\d.,]+)\s*(kg|g)$/i);
  if (!match) return null;

  const value = Number(match[1].replace(",", "."));
  if (!Number.isFinite(value)) return null;

  return match[2].toLowerCase() === "kg" ? value : value / 1000;
}

export const FORMAT_RANGES = [
  { key: "1-5", label: "1 - 5 kg", min: 1, max: 5 },
  { key: "5-15", label: "5 - 15 kg", min: 5, max: 15 },
  { key: "15+", label: "Más de 15 kg", min: 15, max: Infinity },
] as const;

export type FormatRangeKey = (typeof FORMAT_RANGES)[number]["key"];

function inRange(kg: number, range: (typeof FORMAT_RANGES)[number]): boolean {
  return kg >= range.min && kg < range.max;
}

/**
 * Formatos deduplicados, ordenados por peso y recortados a `maxVisible`
 * para que la tabla no se llene con decenas de tamaños repetidos (algunos
 * productos del scraper traen el listado de tamaños de toda una familia
 * de variantes, no solo el del producto mostrado).
 */
export function summarizeFormats(
  formats: string[],
  maxVisible = 6
): { visible: string[]; hiddenCount: number } {
  const unique = [...new Set(formats)];

  const sorted = unique.sort((a, b) => {
    const kgA = parseFormatToKg(a);
    const kgB = parseFormatToKg(b);
    if (kgA === null && kgB === null) return 0;
    if (kgA === null) return 1;
    if (kgB === null) return -1;
    return kgA - kgB;
  });

  return {
    visible: sorted.slice(0, maxVisible),
    hiddenCount: Math.max(0, sorted.length - maxVisible),
  };
}

/** El precio más barato entre los formatos que caen dentro del rango elegido. */
export function cheapestInRange(
  prices: PriceByFormat[],
  rangeKey: FormatRangeKey
): PriceByFormat | null {
  const range = FORMAT_RANGES.find((r) => r.key === rangeKey);
  if (!range) return null;

  const matching = prices.filter((p) => {
    const kg = parseFormatToKg(p.format);
    return kg !== null && inRange(kg, range);
  });

  if (matching.length === 0) return null;

  return matching.reduce((a, b) => (a.price <= b.price ? a : b));
}

/** true si alguno de los formatos conocidos del producto cae en el rango, aunque no tengamos su precio. */
export function hasFormatInRange(formats: string[], rangeKey: FormatRangeKey): boolean {
  const range = FORMAT_RANGES.find((r) => r.key === rangeKey);
  if (!range) return false;

  return formats.some((format) => {
    const kg = parseFormatToKg(format);
    return kg !== null && inRange(kg, range);
  });
}

/** El formato con mejor precio por kilo, cuando el scraper lo trae. */
export function bestPricePerKgFormat(prices: PriceByFormat[]): PriceByFormat | null {
  const withPerKg = prices.filter((p) => p.pricePerKg !== null);
  if (withPerKg.length === 0) return null;

  return withPerKg.reduce((a, b) => (a.pricePerKg! <= b.pricePerKg! ? a : b));
}
