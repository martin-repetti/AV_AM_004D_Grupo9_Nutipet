import { kcalTertile, type EnergyTertile } from "../energy";
import type { CriterionEvaluator } from "../types";

/**
 * Dirección de densidad energética esperada según etapa + actividad.
 * Pendiente de validar con la veterinaria del equipo, especialmente el
 * caso "senior + Alta actividad" (ver plan del motor de compatibilidad).
 */
function energyDirection(
  stage: string | null,
  activityLevel: string | null
): EnergyTertile | null {
  if (stage === "cachorro") return "alta";

  if (stage === "senior") {
    return activityLevel === "Alta" ? "media" : "baja";
  }

  if (activityLevel === "Alta") return "alta";
  if (activityLevel === "Baja") return "baja";
  if (activityLevel === "Moderada") return "media";

  return null;
}

const ADJACENT: Record<EnergyTertile, EnergyTertile[]> = {
  alta: ["media"],
  media: ["alta", "baja"],
  baja: ["media"],
};

export const evaluateActivity: CriterionEvaluator = (pet, food, context) => {
  const direction = energyDirection(pet.stage, pet.activityLevel);

  if (!direction) {
    return {
      key: "actividad",
      score: null,
      explanation: "Falta etapa de vida o nivel de actividad de la mascota.",
    };
  }

  const tertile = kcalTertile(food, context.catalog);

  if (!tertile) {
    return {
      key: "actividad",
      score: null,
      explanation: "No hay suficiente información de energía para compararlo con el resto del catálogo.",
    };
  }

  const estimatedNote = food.kcalKgEstimated ? " (energía estimada, no confirmada por el fabricante)" : "";

  if (tertile === direction) {
    return {
      key: "actividad",
      score: 1,
      explanation: `Densidad energética ${tertile} acorde a su etapa y actividad${estimatedNote}.`,
    };
  }

  if (ADJACENT[direction].includes(tertile)) {
    return {
      key: "actividad",
      score: 0.6,
      explanation: `Densidad energética ${tertile}, se esperaba ${direction}${estimatedNote}.`,
    };
  }

  return {
    key: "actividad",
    score: 0.3,
    explanation: `Densidad energética ${tertile}, opuesta a la esperada (${direction})${estimatedNote}.`,
  };
};
