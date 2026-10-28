import type { PriceRecord } from "@/types/priceHistory";
import { parseFormatToKg } from "@/utils/formatSize";

export type HistoryPoint = {
  date: string;
  /** El precio más bajo de ese día para el formato, entre todas las tiendas. */
  price: number;
  store: string;
};

export type HistoryStats = {
  current: number;
  min: number;
  max: number;
  /** null con un solo día registrado: todavía no hay con qué comparar. */
  variation: number | null;
};

/**
 * Formatos con precio registrado, de menor a mayor tamaño. Los precios sin
 * formato ("") solo cuentan si no hay ninguno con formato: comparar un
 * precio de tamaño desconocido con uno de 15 kg no dice nada.
 */
export function historyFormats(records: PriceRecord[]): string[] {
  const withFormat = [...new Set(records.map((r) => r.format).filter(Boolean))];
  if (withFormat.length === 0) return records.length ? [""] : [];
  return withFormat.sort((a, b) => (parseFormatToKg(a) ?? 0) - (parseFormatToKg(b) ?? 0));
}

/** El formato con más días registrados: el que mejor muestra la evolución. */
export function defaultHistoryFormat(records: PriceRecord[]): string | null {
  const formats = historyFormats(records);
  if (formats.length === 0) return null;

  const days = (format: string) =>
    new Set(records.filter((r) => r.format === format).map((r) => r.date)).size;
  return formats.reduce((best, format) => (days(format) > days(best) ? format : best));
}

export function historySeries(records: PriceRecord[], format: string): HistoryPoint[] {
  const byDate = new Map<string, HistoryPoint>();
  for (const record of records) {
    if (record.format !== format) continue;
    const current = byDate.get(record.date);
    if (!current || record.price < current.price) {
      byDate.set(record.date, { date: record.date, price: record.price, store: record.store });
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function historyStats(series: HistoryPoint[]): HistoryStats | null {
  if (series.length === 0) return null;

  const prices = series.map((point) => point.price);
  const first = prices[0];
  const current = prices[prices.length - 1];

  return {
    current,
    min: Math.min(...prices),
    max: Math.max(...prices),
    variation: series.length > 1 ? ((current - first) / first) * 100 : null,
  };
}

/** El último precio de cada tienda para el formato, del más barato al más caro. */
export function latestPriceByStore(records: PriceRecord[], format: string): PriceRecord[] {
  const byStore = new Map<string, PriceRecord>();
  for (const record of records) {
    if (record.format !== format) continue;
    const current = byStore.get(record.store);
    if (!current || record.date > current.date) byStore.set(record.store, record);
  }
  return [...byStore.values()].sort((a, b) => a.price - b.price);
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-10-22" -> "22 oct 2026". */
export function formatHistoryDate(date: string): string {
  const [year, month, day] = date.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1] ?? month} ${year}`;
}
