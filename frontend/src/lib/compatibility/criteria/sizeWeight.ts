import { normalize } from "../normalize";
import type { CriterionEvaluator } from "../types";

type SizeBucket = "pequeño" | "mediano" | "grande";

const SIZE_KEYWORDS: Record<SizeBucket, string[]> = {
  pequeño: ["pequena", "pequeño", "mini", "toy"],
  mediano: ["mediana", "mediano"],
  grande: ["grande", "maxi"],
};

function weightBucket(weightKg: number): SizeBucket {
  if (weightKg < 10) return "pequeño";
  if (weightKg <= 25) return "mediano";
  return "grande";
}

function nameBucket(name: string): SizeBucket | null {
  const normalized = normalize(name);
  for (const [bucket, keywords] of Object.entries(SIZE_KEYWORDS) as [
    SizeBucket,
    string[]
  ][]) {
    if (keywords.some((kw) => normalized.includes(kw))) return bucket;
  }
  return null;
}

/**
 * No existe "tamaño de raza" estructurado ni en la mascota ni en el
 * catálogo. Se aproxima con el peso de la mascota y menciones de
 * tamaño en el nombre del producto cuando existen — si el producto no
 * menciona tamaño, se marca como no evaluable en vez de asumir que
 * sirve para cualquier tamaño.
 */
export const evaluateSizeWeight: CriterionEvaluator = (pet, food) => {
  if (pet.species === "Gato") {
    return {
      key: "tamano_peso",
      score: null,
      explanation: "El tamaño varía poco entre gatos; no se evalúa por ahora.",
    };
  }

  if (pet.weightKg == null) {
    return {
      key: "tamano_peso",
      score: null,
      explanation: "No se registró el peso de la mascota.",
    };
  }

  const foodBucket = nameBucket(food.name);
  if (!foodBucket) {
    return {
      key: "tamano_peso",
      score: null,
      explanation: "El alimento no indica para qué tamaño de perro está pensado.",
    };
  }

  const petBucket = weightBucket(pet.weightKg);

  if (foodBucket === petBucket) {
    return {
      key: "tamano_peso",
      score: 1,
      explanation: `Pensado para perros de tamaño ${foodBucket}, como el tuyo.`,
    };
  }

  return {
    key: "tamano_peso",
    score: 0.3,
    explanation: `Pensado para perros de tamaño ${foodBucket}, tu mascota es ${petBucket}.`,
  };
};
