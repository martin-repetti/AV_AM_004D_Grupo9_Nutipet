import { describe, expect, it } from "vitest";
import { effectiveMonthlyPrice, estimateMonthlyCost } from "../monthlyCost";
import type { FoodRow } from "@/types/catalogFood";

function makeFood(overrides: Partial<FoodRow> = {}): FoodRow {
  return {
    id: 1,
    brand: "Marca",
    name: "Alimento",
    species: "Gato",
    type: "seco",
    stage: "adulto",
    conditions: [],
    protein: 30,
    fat: 12,
    fiber: 3,
    moisture: 10,
    proteinMs: 33,
    fatMs: 13,
    fiberMs: 3.3,
    kcalKg: 3500,
    kcalKgEstimated: false,
    allergens: {
      pollo: false,
      pavo: false,
      vacuno: false,
      cerdo: false,
      cordero: false,
      pescado: false,
      salmon: false,
      atun: false,
      huevo: false,
      maiz: false,
      trigo: false,
      arroz: false,
      soya: false,
      lacteos: false,
    },
    firstIngredient: "Pollo",
    formats: [],
    priceMin: 10000,
    pricePerKg: 5000,
    priceStore: "tienda",
    priceUrl: null,
    sourceUrl: null,
    ...overrides,
  };
}

describe("estimateMonthlyCost", () => {
  it("devuelve null si falta el peso, el kcal/kg o el precio por kilo", () => {
    expect(estimateMonthlyCost(null, makeFood())).toBeNull();
    expect(estimateMonthlyCost(4, makeFood({ kcalKg: null }))).toBeNull();
    expect(estimateMonthlyCost(4, makeFood({ pricePerKg: null }))).toBeNull();
  });

  it("calcula un costo mensual positivo cuando hay todos los datos", () => {
    const cost = estimateMonthlyCost(4, makeFood({ kcalKg: 3500, pricePerKg: 5000 }));
    expect(cost).not.toBeNull();
    expect(cost!).toBeGreaterThan(0);
  });
});

describe("effectiveMonthlyPrice", () => {
  it("prioriza el costo mensual estimado sobre el precio del paquete", () => {
    const food = makeFood({ priceMin: 3000, pricePerKg: 40000, kcalKg: 3500 });
    const price = effectiveMonthlyPrice(4, food);

    expect(price?.isMonthly).toBe(true);
    // El gasto mensual real (precio por kilo alto) es mucho mayor que
    // el precio de etiqueta del paquete chico.
    expect(price!.amount).toBeGreaterThan(food.priceMin!);
  });

  it("cae al precio del paquete si no se puede estimar el costo mensual", () => {
    const food = makeFood({ priceMin: 8490, pricePerKg: null });
    const price = effectiveMonthlyPrice(4, food);

    expect(price).toEqual({ amount: 8490, isMonthly: false });
  });

  it("devuelve null si tampoco hay precio de paquete", () => {
    const food = makeFood({ priceMin: null, pricePerKg: null });
    expect(effectiveMonthlyPrice(4, food)).toBeNull();
  });
});
