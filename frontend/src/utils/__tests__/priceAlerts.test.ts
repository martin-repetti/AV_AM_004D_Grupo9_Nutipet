import { describe, expect, it } from "vitest";
import type { PriceRecord } from "@/types/priceHistory";
import { priceAlertsFor } from "@/utils/priceAlerts";

function r(date: string, price: number, format = "3 kg", store = "a.cl"): PriceRecord {
  return { date, price, format, store, url: null };
}

describe("alertas de precio", () => {
  it("avisa cuando una tienda baja su precio respecto de su registro anterior", () => {
    const [alert] = priceAlertsFor(1, [r("2026-10-01", 9000), r("2026-10-10", 10000), r("2026-10-20", 9500)]);
    expect(alert).toMatchObject({ kind: "baja", previousPrice: 10000, currentPrice: 9500, dropPercent: 5 });
  });

  it("marca el precio más bajo registrado del formato", () => {
    const [alert] = priceAlertsFor(1, [r("2026-10-01", 10000), r("2026-10-10", 9000)]);
    expect(alert.kind).toBe("minimo");
  });

  it("no avisa subidas, precios iguales ni tiendas con un solo registro", () => {
    expect(priceAlertsFor(1, [r("2026-10-01", 9000), r("2026-10-10", 9500)])).toEqual([]);
    expect(priceAlertsFor(1, [r("2026-10-01", 9000), r("2026-10-10", 9000)])).toEqual([]);
    expect(priceAlertsFor(1, [r("2026-10-01", 9000, "1 kg")])).toEqual([]);
  });

  it("no confunde una tienda más barata leída otro día con una baja de precio", () => {
    // Caso real: braloy no cambió su precio; el 28 solo se leyó kamanpet, más cara.
    expect(
      priceAlertsFor(1, [
        r("2026-10-14", 18490, "2.5 kg", "braloy.cl"),
        r("2026-10-14", 20990, "2.5 kg", "kamanpet.cl"),
        r("2026-10-28", 20990, "2.5 kg", "kamanpet.cl"),
        r("2026-10-29", 18490, "2.5 kg", "braloy.cl"),
      ])
    ).toEqual([]);
  });

  it("una tienda nueva más barata no es una baja de precio", () => {
    expect(
      priceAlertsFor(1, [
        r("2026-10-14", 4800, "400 g", "kamanpet.cl"),
        r("2026-10-28", 4800, "400 g", "kamanpet.cl"),
        r("2026-10-28", 4490, "400 g", "razaspet.cl"),
      ])
    ).toEqual([]);
  });

  it("avisa por cada tienda que bajó", () => {
    const alerts = priceAlertsFor(1, [
      r("2026-10-01", 10000, "3 kg", "a.cl"),
      r("2026-10-10", 9000, "3 kg", "a.cl"),
      r("2026-10-01", 10500, "3 kg", "b.cl"),
      r("2026-10-10", 10200, "3 kg", "b.cl"),
    ]);
    expect(alerts.map((a) => [a.store, a.kind])).toEqual([
      ["a.cl", "minimo"],
      ["b.cl", "baja"],
    ]);
  });
});
