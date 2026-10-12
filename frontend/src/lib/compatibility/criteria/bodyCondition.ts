import { normalize } from "../normalize";
import { kcalTertile } from "../energy";
import type { CriterionEvaluator } from "../types";

// El scraper casi no trae `conditions` todavía (hoy solo "control_peso"
// aparece, en 1 de 43 productos), pero el mapeo queda listo para cuando
// tenga más cobertura.
const CONDITION_KEYWORDS: Record<string, string[]> = {
  control_peso: ["control de peso", "sobrepeso", "peso"],
};

function matchesSpecialCondition(
  specialCondition: string,
  foodConditions: string[]
): boolean {
  const normalized = normalize(specialCondition);

  return foodConditions.some((code) => {
    const keywords = CONDITION_KEYWORDS[code] || [code];
    return keywords.some((kw) => normalized.includes(normalize(kw)));
  });
}

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

  if (pet.bodyCondition === "Sobrepeso") {
    if (food.conditions.includes("control_peso")) {
      score = Math.max(score, 1);
      notes.push("formulado para control de peso");
    }
  } else if (pet.bodyCondition === "Bajo peso") {
    const tertile = kcalTertile(food, context.catalog);
    if (tertile === "alta") {
      score = Math.max(score, 1);
      notes.push("energía elevada, adecuado para recuperar peso");
    }
  }

  if (
    pet.specialCondition &&
    matchesSpecialCondition(pet.specialCondition, food.conditions)
  ) {
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
