import type { CriterionEvaluator } from "../types";

export const evaluateBudget: CriterionEvaluator = (_pet, food, context) => {
  if (context.budget == null) {
    return {
      key: "presupuesto",
      score: null,
      explanation: "No ingresaste un presupuesto.",
    };
  }

  if (food.priceMin == null) {
    return {
      key: "presupuesto",
      score: null,
      explanation: "El alimento no tiene precio disponible todavía.",
    };
  }

  const ratio = food.priceMin / context.budget;

  if (ratio <= 0.7) {
    return {
      key: "presupuesto",
      score: 1,
      explanation: "Bien dentro de tu presupuesto.",
    };
  }

  if (ratio <= 1) {
    const score = 1 - ((ratio - 0.7) / 0.3) * 0.7; // 1.0 en 0.7 -> 0.3 en 1.0
    return {
      key: "presupuesto",
      score,
      explanation: "Cerca del límite de tu presupuesto.",
    };
  }

  return {
    key: "presupuesto",
    score: 0.1,
    explanation: "Supera tu presupuesto.",
  };
};
