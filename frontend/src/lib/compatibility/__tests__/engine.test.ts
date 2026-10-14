import { describe, expect, it } from "vitest";
import { compareFoods, computeWeightedScore } from "../engine";
import { DEFAULT_WEIGHTS } from "../defaultWeights";
import type { ComparisonPet, CriterionResult } from "../types";
import type { FoodRow } from "@/types/catalogFood";

function makeFood(overrides: Partial<FoodRow> = {}): FoodRow {
  return {
    id: 1,
    brand: "Marca",
    name: "Alimento",
    species: "Gato",
    type: "seco",
    stage: "adulto",
    size: "",
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
    pricesByFormat: [],
    ...overrides,
  };
}

function makePet(overrides: Partial<ComparisonPet> = {}): ComparisonPet {
  return {
    species: "Gato",
    stage: "adulto",
    weightKg: 4,
    activityLevel: "Moderada",
    bodyCondition: "Peso adecuado",
    specialCondition: null,
    allergies: null,
    ...overrides,
  };
}

describe("computeWeightedScore", () => {
  it("replica el ejemplo numérico del prompt: 86.5%", () => {
    const criteria: CriterionResult[] = [
      { key: "edad", score: 1.0, explanation: "" },
      { key: "tamano_peso", score: 0.9, explanation: "" },
      { key: "actividad", score: 0.8, explanation: "" },
      { key: "condicion", score: 0.8, explanation: "" },
      { key: "nutricion", score: 0.9, explanation: "" },
      { key: "presupuesto", score: 0.7, explanation: "" },
    ];

    const { score, coverage } = computeWeightedScore(criteria, DEFAULT_WEIGHTS);

    expect(score).toBeCloseTo(86.5, 5);
    expect(coverage).toBe(100);
  });

  it("no infla ni castiga a 0 cuando falta un criterio: renormaliza entre los evaluables", () => {
    const criteria: CriterionResult[] = [
      { key: "edad", score: 1.0, explanation: "" },
      { key: "tamano_peso", score: null, explanation: "" },
      { key: "actividad", score: null, explanation: "" },
      { key: "condicion", score: 1.0, explanation: "" },
      { key: "nutricion", score: 1.0, explanation: "" },
      { key: "presupuesto", score: null, explanation: "" },
    ];

    const { score, coverage } = computeWeightedScore(criteria, DEFAULT_WEIGHTS);

    // Solo edad(.20) + condicion(.25) + nutricion(.25) = .70 de peso evaluable,
    // todos con score 1.0 -> score debe ser 100, no 0 ni artificialmente mayor.
    expect(score).toBeCloseTo(100, 5);
    expect(coverage).toBeCloseTo(70, 5);
  });
});

describe("compareFoods", () => {
  it("excluye alimentos de otra especie", () => {
    const pet = makePet({ species: "Gato" });
    const catalog = [makeFood({ id: 1, species: "Perro" }), makeFood({ id: 2, species: "Gato" })];

    const result = compareFoods(pet, catalog, DEFAULT_WEIGHTS, null, []);

    expect(result.eligible.map((f) => f.food.id)).toEqual([2]);
    expect(result.excluded).toEqual([
      { food: catalog[0], reason: "especie" },
    ]);
  });

  it("excluye alimentos con un alérgeno confirmado de la mascota", () => {
    const pet = makePet({ allergies: "pollo" });
    const withPollo = makeFood({
      id: 1,
      allergens: { ...makeFood().allergens, pollo: true },
    });
    const sinPollo = makeFood({ id: 2 });

    const result = compareFoods(pet, [withPollo, sinPollo], DEFAULT_WEIGHTS, null, []);

    expect(result.eligible.map((f) => f.food.id)).toEqual([2]);
    expect(result.excluded).toEqual([
      { food: withPollo, reason: "alergia", allergen: "pollo" },
    ]);
  });

  it("trata un alérgeno no verificado (null) como no seguro, no como ausente", () => {
    const pet = makePet({ allergies: "pollo" });
    const unverified = makeFood({
      id: 1,
      allergens: { ...makeFood().allergens, pollo: null },
    });

    const result = compareFoods(pet, [unverified], DEFAULT_WEIGHTS, null, []);

    expect(result.eligible).toHaveLength(0);
    expect(result.excluded).toEqual([
      { food: unverified, reason: "alergia", allergen: "pollo" },
    ]);
  });

  it("separa la mejor opción general de la mejor opción dentro del presupuesto", () => {
    const pet = makePet();
    // Sin pricePerKg/kcalKg no se puede estimar costo mensual, así que
    // el presupuesto compara directo contra priceMin (caso de prueba
    // enfocado en la selección, no en el cálculo del costo mensual).
    const caro = makeFood({
      id: 1,
      name: "Caro",
      stage: "adulto",
      priceMin: 50000,
      pricePerKg: null,
      kcalKg: null,
    });
    const barato = makeFood({
      id: 2,
      name: "Barato",
      stage: "cachorro",
      priceMin: 5000,
      pricePerKg: null,
      kcalKg: null,
    });

    const result = compareFoods(pet, [caro, barato], DEFAULT_WEIGHTS, 10000, []);

    // "caro" coincide mejor con la etapa (adulto) -> mejor score general.
    expect(result.best?.food.id).toBe(1);
    // pero no entra en el presupuesto de 10000, así que la mejor opción
    // dentro del presupuesto debe ser la otra.
    expect(result.bestWithinBudget?.food.id).toBe(2);
  });

  it("compara el presupuesto contra el costo MENSUAL estimado, no contra el precio de un solo paquete", () => {
    const pet = makePet({ weightKg: 4 });

    // Paquete barato ($3.000) pero muy caro por kilo -> el gasto mensual
    // real termina siendo alto.
    const paqueteChicoCaroPorKilo = makeFood({
      id: 1,
      name: "Paquete chico",
      priceMin: 3000,
      pricePerKg: 40000,
      kcalKg: 3500,
    });

    // Paquete más caro ($15.000) pero barato por kilo -> el gasto
    // mensual real es más bajo.
    const paqueteGrandeBaratoPorKilo = makeFood({
      id: 2,
      name: "Paquete grande",
      priceMin: 15000,
      pricePerKg: 4000,
      kcalKg: 3500,
    });

    // Presupuesto mensual de 10.000: por priceMin "sola" el chico
    // parecería la mejor opción, pero su gasto MENSUAL real supera el
    // presupuesto, mientras que el grande sí entra.
    const result = compareFoods(
      pet,
      [paqueteChicoCaroPorKilo, paqueteGrandeBaratoPorKilo],
      DEFAULT_WEIGHTS,
      10000,
      []
    );

    expect(result.bestWithinBudget?.food.id).toBe(2);
  });
});
