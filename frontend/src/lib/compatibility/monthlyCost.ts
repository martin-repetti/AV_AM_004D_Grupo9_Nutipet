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

export type EffectivePrice = {
  amount: number;
  /** true = es un gasto mensual estimado; false = es el precio de un
   * solo paquete (porque no se pudo estimar el gasto mensual). */
  isMonthly: boolean;
};

/**
 * Precio a usar para comparar contra el presupuesto del usuario. Un
 * presupuesto de mascotas es naturalmente mensual ("cuánto gasto al
 * mes"), así que se prioriza el costo mensual estimado sobre el precio
 * de un paquete suelto — comparar un presupuesto mensual contra el
 * precio del paquete más barato disponible (a veces el más chico) no
 * es la comparación que el usuario espera. Si no se puede estimar el
 * costo mensual (falta peso, kcal/kg o precio por kilo), se cae al
 * precio del paquete como mejor dato disponible.
 */
export function effectiveMonthlyPrice(
  weightKg: number | null,
  food: FoodRow
): EffectivePrice | null {
  const monthlyCost = estimateMonthlyCost(weightKg, food);
  if (monthlyCost !== null) {
    return { amount: monthlyCost, isMonthly: true };
  }

  if (food.priceMin !== null) {
    return { amount: food.priceMin, isMonthly: false };
  }

  return null;
}
