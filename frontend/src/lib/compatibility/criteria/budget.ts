import { effectiveMonthlyPrice } from "../monthlyCost";
import type { CriterionEvaluator } from "../types";

export const evaluateBudget: CriterionEvaluator = (pet, food, context) => {
  if (context.budget == null) {
    return {
      key: "presupuesto",
      score: null,
      explanation: "No ingresaste un presupuesto.",
    };
  }

  const price = effectiveMonthlyPrice(pet.weightKg, food);

  if (price == null) {
    return {
      key: "presupuesto",
      score: null,
      explanation: "El alimento no tiene precio disponible todavía.",
    };
  }

  const ratio = price.amount / context.budget;
  const unit = price.isMonthly
    ? "tu presupuesto mensual"
    : "tu presupuesto (precio de un paquete, no pudimos estimar el gasto mensual)";

  if (ratio <= 0.7) {
    return {
      key: "presupuesto",
      score: 1,
      explanation: `Bien dentro de ${unit}.`,
    };
  }

  if (ratio <= 1) {
    const score = 1 - ((ratio - 0.7) / 0.3) * 0.7; // 1.0 en 0.7 -> 0.3 en 1.0
    return {
      key: "presupuesto",
      score,
      explanation: `Cerca del límite de ${unit}.`,
    };
  }

  return {
    key: "presupuesto",
    score: 0.1,
    explanation: `Supera ${unit}.`,
  };
};
