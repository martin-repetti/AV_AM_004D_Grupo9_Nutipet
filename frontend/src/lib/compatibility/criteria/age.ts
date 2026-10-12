import type { CriterionEvaluator } from "../types";

export const evaluateAge: CriterionEvaluator = (pet, food) => {
  if (!pet.stage) {
    return {
      key: "edad",
      score: null,
      explanation: "No se pudo determinar la etapa de vida (falta fecha de nacimiento).",
    };
  }

  if (!food.stage) {
    return {
      key: "edad",
      score: 0.5,
      explanation: "El alimento no especifica etapa de vida.",
    };
  }

  if (food.stage === pet.stage) {
    return {
      key: "edad",
      score: 1,
      explanation: `Formulado para la etapa "${pet.stage}" de tu mascota.`,
    };
  }

  return {
    key: "edad",
    score: 0.2,
    explanation: `Formulado para etapa "${food.stage}", no para "${pet.stage}".`,
  };
};
