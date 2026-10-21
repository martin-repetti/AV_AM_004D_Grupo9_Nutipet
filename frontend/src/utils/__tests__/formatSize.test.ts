import { describe, expect, it } from "vitest";
import {
  bestPricePerKgFormat,
  cheapestInRange,
  comesInRange,
  hasFormatInRange,
  parseFormatToKg,
  summarizeFormats,
  type PriceByFormat,
} from "../formatSize";

describe("parseFormatToKg", () => {
  it("interpreta kg y g", () => {
    expect(parseFormatToKg("3 kg")).toBe(3);
    expect(parseFormatToKg("500 g")).toBe(0.5);
    expect(parseFormatToKg("11.35 kg")).toBeCloseTo(11.35, 5);
  });

  it("devuelve null si el texto no se puede interpretar", () => {
    expect(parseFormatToKg("talla única")).toBeNull();
    expect(parseFormatToKg("")).toBeNull();
  });
});

describe("summarizeFormats", () => {
  it("deduplica, ordena por peso y recorta a maxVisible", () => {
    const formats = ["3 kg", "500 g", "500 g", "1 kg", "15 kg", "2 kg", "10 kg", "7 kg"];
    const { visible, hiddenCount } = summarizeFormats(formats, 4);

    expect(visible).toEqual(["500 g", "1 kg", "2 kg", "3 kg"]);
    expect(hiddenCount).toBe(3); // 7 únicos - 4 visibles
  });

  it("no recorta cuando hay menos formatos que el máximo", () => {
    const { visible, hiddenCount } = summarizeFormats(["3 kg", "1 kg"], 6);
    expect(visible).toEqual(["1 kg", "3 kg"]);
    expect(hiddenCount).toBe(0);
  });
});

describe("hasFormatInRange", () => {
  it("detecta un formato dentro del rango elegido", () => {
    expect(hasFormatInRange(["500 g", "3 kg", "15 kg"], "1-5")).toBe(true);
    expect(hasFormatInRange(["500 g", "15 kg"], "1-5")).toBe(false);
    expect(hasFormatInRange(["20 kg"], "15+")).toBe(true);
  });
});

describe("cheapestInRange", () => {
  const prices: PriceByFormat[] = [
    { format: "3 kg", price: 12000, pricePerKg: 4000, store: "Tienda A", url: null },
    { format: "10 kg", price: 22000, pricePerKg: 2200, store: "Tienda B", url: null },
    { format: "20 kg", price: 38000, pricePerKg: 1900, store: "Tienda C", url: null },
  ];

  it("elige el más barato dentro del rango, no el más barato en general", () => {
    // en el rango 5-15 solo entra el de 10kg
    expect(cheapestInRange(prices, "5-15")?.format).toBe("10 kg");
  });

  it("devuelve null si ningún formato cae en el rango", () => {
    expect(cheapestInRange(prices, "15+")?.format).toBe("20 kg");
    expect(
      cheapestInRange(
        prices.filter((p) => p.format !== "20 kg"),
        "15+"
      )
    ).toBeNull();
  });
});

describe("comesInRange", () => {
  const offer = (format: string): PriceByFormat => ({
    format,
    price: 10000,
    pricePerKg: null,
    store: null,
    url: null,
  });

  it("acepta el producto si la lista de formatos o los precios por formato caen en el rango", () => {
    expect(comesInRange(["3 kg"], [], "1-5")).toBe(true);
    expect(comesInRange([], [offer("10 kg")], "5-15")).toBe(true);
  });

  it("lo descarta si ningún formato conocido cae en el rango", () => {
    expect(comesInRange(["500 g"], [offer("20 kg")], "1-5")).toBe(false);
  });

  it("lo descarta si no hay ninguna información de formato", () => {
    expect(comesInRange([], [offer("")], "1-5")).toBe(false);
  });
});

describe("bestPricePerKgFormat", () => {
  it("elige el formato con mejor precio por kilo, aunque el paquete sea más caro", () => {
    const prices: PriceByFormat[] = [
      { format: "3 kg", price: 12000, pricePerKg: 4000, store: null, url: null },
      { format: "10 kg", price: 22000, pricePerKg: 2200, store: null, url: null },
    ];

    const best = bestPricePerKgFormat(prices);
    expect(best?.format).toBe("10 kg");
  });

  it("devuelve null si ningún formato tiene precio por kilo", () => {
    const prices: PriceByFormat[] = [
      { format: "3 kg", price: 12000, pricePerKg: null, store: null, url: null },
    ];
    expect(bestPricePerKgFormat(prices)).toBeNull();
  });
});
