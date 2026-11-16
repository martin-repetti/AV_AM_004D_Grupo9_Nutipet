import { normalize } from "../normalize";
import { hasWordStartingWith } from "../conditions";
import type { CriterionEvaluator } from "../types";

type SizeBucket = "pequeño" | "mediano" | "grande";

// Menciones de tamaño en el nombre, incluidas razas cuyo alimento
// específico solo sirve para ese tamaño ("Royal Canin Shih Tzu Puppy").
// "small bites" no cuenta: es el tamaño de la croqueta, no de la raza.
const SIZE_KEYWORDS: Record<SizeBucket, string[]> = {
  pequeño: [
    "pequena", "pequeno", "mini", "toy", "small breed", "small dog", "x-small",
    "chihuahua", "yorkshire", "yorkie", "shih tzu", "maltes", "maltese", "pomerania",
    "pomeranian", "bichon", "dachshund", "teckel", "poodle", "caniche", "pug",
    "bulldog frances", "french bulldog", "jack russell", "west highland", "westie",
    "cavalier", "schnauzer mini",
  ],
  mediano: ["mediana", "mediano", "medium", "beagle", "cocker", "border collie"],
  grande: [
    "grande", "maxi", "large", "giant", "gigante", "labrador", "golden retriever",
    "pastor aleman", "german shepherd", "rottweiler", "boxer", "doberman", "gran danes",
  ],
};

function weightBucket(weightKg: number): SizeBucket {
  if (weightKg < 10) return "pequeño";
  if (weightKg <= 25) return "mediano";
  return "grande";
}

/** Tamaños que menciona el nombre; "Large/Medium breed" menciona dos. */
function nameBuckets(name: string): SizeBucket[] {
  const normalized = normalize(name);
  return (Object.entries(SIZE_KEYWORDS) as [SizeBucket, string[]][])
    .filter(([, keywords]) => keywords.some((kw) => hasWordStartingWith(normalized, kw)))
    .map(([bucket]) => bucket);
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
  const foodBuckets = nameBuckets(food.name);
  if (foodBuckets.length === 0) {
    return {
      key: "tamano_peso",
      score: null,
      explanation: "El alimento no indica para qué tamaño de perro está pensado.",
    };
  }

  const foodLabel = foodBuckets.join(" y ");
  if (foodBuckets.includes(petBucket)) {
    return {
      key: "tamano_peso",
      score: 1,
      explanation: `Pensado para perros de tamaño ${foodLabel}, como el tuyo.`,
    };
  }

  return {
    key: "tamano_peso",
    score: 0.3,
    explanation: `Pensado para perros de tamaño ${foodLabel}, tu mascota es ${petBucket}.`,
  };
};
