import type { PriceRecord } from "@/types/priceHistory";

export type PriceAlert = {
  foodId: number;
  format: string;
  store: string;
  /** "baja": más barato que el registro anterior de esa tienda. "minimo": además es el más bajo registrado para el formato. */
  kind: "baja" | "minimo";
  previousPrice: number;
  currentPrice: number;
  /** Porcentaje de baja respecto del registro anterior (positivo). */
  dropPercent: number;
  date: string;
};

/**
 * Alertas de un alimento: por cada tienda y formato, compara el último
 * precio registrado con el anterior de esa misma tienda. Comparar entre
 * tiendas daría falsas bajas: el scraper no lee todas las tiendas cada
 * día, y "apareció una tienda más barata" no es que el precio haya bajado.
 */
export function priceAlertsFor(foodId: number, records: PriceRecord[]): PriceAlert[] {
  const series = new Map<string, PriceRecord[]>();
  for (const record of records) {
    if (!record.format) continue;
    const key = `${record.store}|${record.format}`;
    if (!series.has(key)) series.set(key, []);
    series.get(key)!.push(record);
  }

  const alerts: PriceAlert[] = [];
  for (const storeRecords of series.values()) {
    const sorted = [...storeRecords].sort((a, b) => a.date.localeCompare(b.date));
    if (sorted.length < 2) continue;

    const current = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    if (current.price >= previous.price) continue;

    // "Más bajo registrado": menor que cualquier precio anterior de ese formato, en cualquier tienda.
    const lowestBefore = Math.min(
      ...records.filter((r) => r.format === current.format && r.date < current.date).map((r) => r.price)
    );
    alerts.push({
      foodId,
      format: current.format,
      store: current.store,
      kind: current.price < lowestBefore ? "minimo" : "baja",
      previousPrice: previous.price,
      currentPrice: current.price,
      dropPercent: Math.round(((previous.price - current.price) / previous.price) * 1000) / 10,
      date: current.date,
    });
  }

  return alerts.sort((a, b) => b.dropPercent - a.dropPercent);
}
