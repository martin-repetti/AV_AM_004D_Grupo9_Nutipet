import type { FoodRow } from "@/types/catalogFood";

/**
 * Estima el costo mensual de alimentar a la mascota con `food`, usando
 * el requerimiento energético en reposo (RER = 70 × peso_kg^0.75, una
 * fórmula veterinaria estándar y ampliamente publicada) y el precio por
 * kilo real del alimento. Solo se calcula si hay peso, densidad
 * energética y precio por kilo — si falta alguno, se devuelve `null` en
 * vez de aproximar con datos incompletos.
 */
export function estimateMonthlyCost(
  weightKg: number | null,
  food: FoodRow
): number | null {
  if (weightKg == null || food.kcalKg == null || food.pricePerKg == null) {
    return null;
  }

  const restingEnergyKcalPerDay = 70 * Math.pow(weightKg, 0.75);
  const dailyGrams = (restingEnergyKcalPerDay / food.kcalKg) * 1000;
  const monthlyKg = (dailyGrams * 30) / 1000;

  return Math.round(monthlyKg * food.pricePerKg);
}
