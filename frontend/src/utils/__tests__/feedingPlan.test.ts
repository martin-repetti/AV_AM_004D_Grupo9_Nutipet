import { describe, expect, it } from "vitest";
import { ageInMonths, dailyGrams, energyFactor, estimateEnergy, planOffers, type FeedingPet } from "@/utils/feedingPlan";

function pet(overrides: Partial<FeedingPet> = {}): FeedingPet {
  return {
    species: "Perro",
    weightKg: 20,
    ageMonths: 48,
    sterilized: true,
    activityLevel: "Moderada",
    bodyCondition: "Peso adecuado",
    ...overrides,
  };
}

describe("energía diaria", () => {
  it("usa RER = 70 × peso^0,75", () => {
    expect(estimateEnergy(pet({ weightKg: 10 })).restingKcal).toBe(394);
  });

  it("elige el factor según etapa, esterilización, actividad y condición", () => {
    expect(energyFactor(pet()).factor).toBe(1.6);
    expect(energyFactor(pet({ sterilized: false })).factor).toBe(1.8);
    expect(energyFactor(pet({ activityLevel: "Alta" })).factor).toBe(2);
    expect(energyFactor(pet({ ageMonths: 3 })).factor).toBe(3);
    expect(energyFactor(pet({ ageMonths: 8 })).factor).toBe(2);
    expect(energyFactor(pet({ bodyCondition: "Sobrepeso" })).factor).toBe(1.4);
    expect(energyFactor(pet({ species: "Gato", weightKg: 4 })).factor).toBe(1.2);
    expect(energyFactor(pet({ species: "Gato", ageMonths: 6 })).factor).toBe(2.5);
  });

  it("nunca baja de 1 × RER", () => {
    expect(energyFactor(pet({ species: "Gato", ageMonths: 150, activityLevel: "Baja" })).factor).toBe(1);
  });
});

describe("ración y plan de compra", () => {
  it("calcula los gramos diarios según la energía del alimento", () => {
    expect(dailyGrams(1000, 4000)).toBe(250);
  });

  it("calcula días por envase, envases al mes y gasto, del más barato al más caro", () => {
    const plans = planOffers(250, [
      { format: "15 kg", price: 60000, store: "a.cl", url: null },
      { format: "3 kg", price: 15000, store: "b.cl", url: null },
      { format: "", price: 9990, store: "c.cl", url: null },
    ]);
    expect(plans.map((p) => p.format)).toEqual(["15 kg", "3 kg"]);
    expect(plans[0]).toMatchObject({ daysPerPack: 60, packsPerMonth: 1, monthlyCost: 30400 });
    expect(plans[1]).toMatchObject({ daysPerPack: 12, packsPerMonth: 3, monthlyCost: 38000 });
  });
});

describe("edad", () => {
  it("cuenta meses cumplidos", () => {
    expect(ageInMonths("2026-01-15", new Date("2026-11-14T12:00:00"))).toBe(9);
    expect(ageInMonths("2026-01-14", new Date("2026-11-14T12:00:00"))).toBe(10);
    expect(ageInMonths(null)).toBeNull();
    expect(ageInMonths(new Date(2026, 0, 14), new Date("2026-11-14T12:00:00"))).toBe(10);
  });
});
