import { describe, expect, it } from "vitest";
import type { PriceRecord } from "@/types/priceHistory";
import {
  defaultHistoryFormat,
  formatHistoryDate,
  historyFormats,
  historySeries,
  historyStats,
  latestPriceByStore,
} from "@/utils/priceHistory";

function record(overrides: Partial<PriceRecord>): PriceRecord {
  return { date: "2026-10-12", store: "jumbo.cl", format: "3 kg", price: 10000, url: null, ...overrides };
}

const records: PriceRecord[] = [
  record({ date: "2026-10-12", format: "3 kg", price: 10490 }),
  record({ date: "2026-10-13", format: "3 kg", price: 10990 }),
  record({ date: "2026-10-13", format: "3 kg", price: 9990, store: "superzoo.cl" }),
  record({ date: "2026-10-14", format: "3 kg", price: 11290 }),
  record({ date: "2026-10-14", format: "1 kg", price: 3990 }),
  record({ date: "2026-10-14", format: "", price: 3990 }),
];

describe("historial de precios", () => {
  it("ordena los formatos por tamaño e ignora el precio sin formato si hay otros", () => {
    expect(historyFormats(records)).toEqual(["1 kg", "3 kg"]);
    expect(historyFormats([record({ format: "" })])).toEqual([""]);
  });

  it("elige por defecto el formato con más días registrados", () => {
    expect(defaultHistoryFormat(records)).toBe("3 kg");
    expect(defaultHistoryFormat([])).toBeNull();
  });

  it("toma el precio más bajo de cada día entre tiendas", () => {
    expect(historySeries(records, "3 kg").map((p) => [p.date, p.price, p.store])).toEqual([
      ["2026-10-12", 10490, "jumbo.cl"],
      ["2026-10-13", 9990, "superzoo.cl"],
      ["2026-10-14", 11290, "jumbo.cl"],
    ]);
  });

  it("calcula la variación desde el primer día", () => {
    const stats = historyStats(historySeries(records, "3 kg"));
    expect(stats).toMatchObject({ current: 11290, min: 9990, max: 11290 });
    expect(stats?.variation).toBeCloseTo(7.63, 1);
  });

  it("con un solo día no inventa una variación", () => {
    expect(historyStats(historySeries(records, "1 kg"))?.variation).toBeNull();
  });

  it("muestra el último precio de cada tienda", () => {
    expect(latestPriceByStore(records, "3 kg").map((r) => [r.store, r.price])).toEqual([
      ["superzoo.cl", 9990],
      ["jumbo.cl", 11290],
    ]);
  });

  it("formatea fechas", () => {
    expect(formatHistoryDate("2026-10-02")).toBe("2 oct 2026");
  });
});
