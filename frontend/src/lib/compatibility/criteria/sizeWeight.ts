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
 * `food.size` viene del scraper (clasificacion.tamano): el tamaño de
 * raza recomendado, no el tamaño del envase (eso es `formats`). Valores
 * posibles: "pequeno" | "mediano" | "grande" | "mediano-grande" |
 * "todos" | "". "mediano-grande" calza con cualquiera de los dos
 * buckets adyacentes; "todos" calza con cualquier mascota.
 */
function matchesStructuredSize(
  foodSize: string,
  petBucket: SizeBucket
): boolean | null {
  if (!foodSize) return null;
  if (foodSize === "todos") return true;
  if (foodSize === "mediano-grande") {
    return petBucket === "mediano" || petBucket === "grande";
  }

  const normalized = foodSize === "pequeno" ? "pequeño" : foodSize;
  return normalized === petBucket;
}

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

  const petBucket = weightBucket(pet.weightKg);

  if (food.size) {
    const match = matchesStructuredSize(food.size, petBucket);
    const sizeLabel = food.size.replace("-", " y ");

    if (match === true) {
      return {
        key: "tamano_peso",
        score: 1,
        explanation: `Pensado para razas de tamaño ${sizeLabel}, como la tuya.`,
      };
    }

    if (match === false) {
      return {
        key: "tamano_peso",
        score: 0.3,
        explanation: `Pensado para razas de tamaño ${sizeLabel}, tu mascota es ${petBucket}.`,
      };
    }
  }

  // Respaldo: el catálogo no trae el dato estructurado para este
  // producto, se busca una mención de tamaño en su nombre.
  const foodBucket = nameBucket(food.name);
  if (!foodBucket) {
    return {
      key: "tamano_peso",
      score: null,
      explanation: "El alimento no indica para qué tamaño de perro está pensado.",
    };
  }

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
