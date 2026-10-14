import { describe, expect, it } from "vitest";
import { evaluateSizeWeight } from "../criteria/sizeWeight";
import type { ComparisonPet } from "../types";
import type { FoodRow } from "@/types/catalogFood";

function makeFood(overrides: Partial<FoodRow> = {}): FoodRow {
  return {
    id: 1,
    brand: "Marca",
    name: "Alimento",
    species: "Perro",
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
    ...overrides,
  };
}

function makePet(overrides: Partial<ComparisonPet> = {}): ComparisonPet {
  return {
    species: "Perro",
    stage: "adulto",
    weightKg: 5, // pequeño: < 10kg
    activityLevel: "Moderada",
    bodyCondition: "Peso adecuado",
    specialCondition: null,
    allergies: null,
    ...overrides,
  };
}

describe("evaluateSizeWeight", () => {
  it("usa food.size (dato estructurado del scraper) cuando coincide con el bucket de la mascota", () => {
    const pet = makePet({ weightKg: 30 }); // grande
    const food = makeFood({ size: "grande", name: "Royal Canin Maxi Adulto" });

    const result = evaluateSizeWeight(pet, food, { catalog: [], budget: null, nutritionRanges: [] });

    expect(result.score).toBe(1);
  });

  it("baja el puntaje si food.size no coincide con el bucket de la mascota", () => {
    const pet = makePet({ weightKg: 5 }); // pequeño
    const food = makeFood({ size: "grande", name: "Royal Canin Maxi Adulto" });

    const result = evaluateSizeWeight(pet, food, { catalog: [], budget: null, nutritionRanges: [] });

    expect(result.score).toBe(0.3);
  });

  it('"mediano-grande" calza con mascotas medianas Y grandes', () => {
    const food = makeFood({ size: "mediano-grande" });
    const context = { catalog: [], budget: null, nutritionRanges: [] };

    const mediano = evaluateSizeWeight(makePet({ weightKg: 15 }), food, context);
    const grande = evaluateSizeWeight(makePet({ weightKg: 30 }), food, context);
    const pequeno = evaluateSizeWeight(makePet({ weightKg: 5 }), food, context);

    expect(mediano.score).toBe(1);
    expect(grande.score).toBe(1);
    expect(pequeno.score).toBe(0.3);
  });

  it('"todos" calza con cualquier tamaño de mascota', () => {
    const food = makeFood({ size: "todos" });
    const context = { catalog: [], budget: null, nutritionRanges: [] };

    expect(evaluateSizeWeight(makePet({ weightKg: 3 }), food, context).score).toBe(1);
    expect(evaluateSizeWeight(makePet({ weightKg: 40 }), food, context).score).toBe(1);
  });

  it("cae al respaldo por nombre cuando food.size está vacío (producto sin el dato estructurado)", () => {
    const pet = makePet({ weightKg: 30 }); // grande
    const food = makeFood({ size: "", name: "Alimento para perros raza grande" });

    const result = evaluateSizeWeight(pet, food, { catalog: [], budget: null, nutritionRanges: [] });

    expect(result.score).toBe(1);
  });

  it("no evaluable si no hay dato estructurado NI mención de tamaño en el nombre", () => {
    const pet = makePet({ weightKg: 15 });
    const food = makeFood({ size: "", name: "Alimento genérico para perros" });

    const result = evaluateSizeWeight(pet, food, { catalog: [], budget: null, nutritionRanges: [] });

    expect(result.score).toBeNull();
  });

  it("no se evalúa para gatos", () => {
    const pet = makePet({ species: "Gato", weightKg: 4 });
    const food = makeFood({ species: "Gato", size: "grande" });

    const result = evaluateSizeWeight(pet, food, { catalog: [], budget: null, nutritionRanges: [] });

    expect(result.score).toBeNull();
  });
});
