import type { CriterionEvaluator, NutritionRange } from "../types";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function nutrientScore(value: number | null, range: NutritionRange | undefined): number | null {
  if (value == null || !range) return null;

  const { minValue, idealMin, idealMax, maxValue } = range;

  if (idealMin != null && idealMax != null && value >= idealMin && value <= idealMax) {
    return 1;
  }

  if (minValue != null && value < minValue) return 0.2;
  if (maxValue != null && value > maxValue) return 0.2;

  if (idealMin != null && minValue != null && value < idealMin) {
    return 0.2 + 0.8 * clamp01((value - minValue) / (idealMin - minValue));
  }

  if (idealMax != null && maxValue != null && value > idealMax) {
    return 0.2 + 0.8 * clamp01((maxValue - value) / (maxValue - idealMax));
  }

  return 0.6;
}

/**
 * Usa los valores en base materia seca (protein_ms/fat_ms/fiber_ms) para
 * poder comparar alimento seco y húmedo con el mismo rango de
 * referencia — comparar los valores crudos los haría ver injustamente
 * distintos solo por la humedad.
 */
export const evaluateNutrition: CriterionEvaluator = (pet, food, context) => {
  if (!pet.stage) {
    return {
      key: "nutricion",
      score: null,
      explanation: "No se pudo determinar la etapa de vida para elegir el rango de referencia.",
    };
  }

  const rangesForPet = context.nutritionRanges.filter(
    (range) => range.species === pet.species && range.stage === pet.stage
  );

  const proteinRange = rangesForPet.find((r) => r.nutrient === "protein");
  const fatRange = rangesForPet.find((r) => r.nutrient === "fat");
  const fiberRange = rangesForPet.find((r) => r.nutrient === "fiber");

  const scores = [
    nutrientScore(food.proteinMs, proteinRange),
    nutrientScore(food.fatMs, fatRange),
    nutrientScore(food.fiberMs, fiberRange),
  ].filter((score): score is number => score != null);

  if (scores.length === 0) {
    return {
      key: "nutricion",
      score: null,
      explanation: "Faltan datos nutricionales del alimento o rangos de referencia para su etapa.",
    };
  }

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  return {
    key: "nutricion",
    score: average,
    explanation:
      average >= 0.75
        ? "Proteína, grasa y fibra dentro del rango orientativo para su etapa."
        : "Algunos valores nutricionales se alejan del rango orientativo para su etapa.",
  };
};
