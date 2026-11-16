import { kcalTertile } from "../energy";
import { codesForSpecialCondition, foodConditionCodes } from "../conditions";
import type { CriterionEvaluator } from "../types";

export const evaluateBodyCondition: CriterionEvaluator = (pet, food, context) => {
  if (!pet.bodyCondition && !pet.specialCondition) {
    return {
      key: "condicion",
      score: null,
      explanation: "No se registró condición corporal ni necesidad especial.",
    };
  }

  let score = 0.6;
  const notes: string[] = [];
  const foodCodes = foodConditionCodes(food);

  if (pet.bodyCondition === "Sobrepeso") {
    if (foodCodes.has("control_peso")) {
      score = Math.max(score, 1);
      notes.push("formulado para control de peso");
    }
  } else if (pet.bodyCondition === "Bajo peso") {
    const tertile = kcalTertile(food, context.catalog);
    if (foodCodes.has("control_peso")) {
      // La única contradicción clara: un alimento para bajar de peso.
      score = 0.2;
      notes.push("de control de peso, no recomendado para una mascota con bajo peso");
    } else if (tertile === "alta") {
      score = Math.max(score, 1);
      notes.push("energía elevada, adecuado para recuperar peso");
    }
  }

  if (codesForSpecialCondition(pet.specialCondition).some((code) => foodCodes.has(code))) {
    score = Math.max(score, 1);
    notes.push(`coincide con la necesidad especial "${pet.specialCondition}"`);
  }

  return {
    key: "condicion",
    score,
    explanation:
      notes.length > 0
        ? `Alimento ${notes.join("; ")}.`
        : "Sin coincidencia ni contradicción con la condición registrada.",
  };
};
