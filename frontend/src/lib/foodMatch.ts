import type { AllergenKey, CatalogFood } from "@/types/catalogFood";
import { ALLERGEN_KEYS } from "@/types/catalogFood";
import { getFoodsBySpecies } from "@/services/foodCatalog";

export type ComparisonPet = {
  species: "Perro" | "Gato";
  allergies: string | null;
  specialCondition: string | null;
  birthDate: string | null;
};

export type ExcludedFood = {
  food: CatalogFood;
  allergen: AllergenKey;
};

export type ScoredFood = {
  food: CatalogFood;
  score: number;
  matchedStage: boolean;
  matchedCondition: boolean;
};

export type ComparisonResult = {
  eligible: ScoredFood[];
  excluded: ExcludedFood[];
  best: ScoredFood | null;
  bestWithinBudget: ScoredFood | null;
};

// Variantes en español que un dueño podría escribir para cada alérgeno.
const ALLERGEN_SYNONYMS: Record<AllergenKey, string[]> = {
  pollo: ["pollo", "gallina", "ave"],
  pavo: ["pavo"],
  vacuno: [
    "vacuno",
    "res",
    "vaca",
    "buey",
    "ternera",
    "carne de res",
    "carne de vacuno",
  ],
  cerdo: ["cerdo", "chancho", "puerco"],
  cordero: ["cordero", "oveja", "carnero"],
  pescado: ["pescado", "pez"],
  salmon: ["salmon", "salmón"],
  atun: ["atun", "atún"],
  huevo: ["huevo"],
  maiz: ["maiz", "maíz", "choclo"],
  trigo: ["trigo", "gluten"],
  arroz: ["arroz"],
  soya: ["soya", "soja"],
  lacteos: ["lacteos", "lácteos", "leche", "queso", "lactosa"],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/**
 * Convierte el texto libre de alergias de una mascota (ej. "pollo, trigo")
 * en alérgenos conocidos del catálogo. El catálogo ya marca un alimento
 * como `pollo: true` aunque el ingrediente diga "subproductos de pollo",
 * así que no hace falta volver a buscar derivados acá.
 */
export function parseAllergyTokens(allergiesText: string | null): AllergenKey[] {
  if (!allergiesText?.trim()) return [];

  const pieces = allergiesText
    .split(/[,;/]+| y /i)
    .map((piece) => normalize(piece))
    .filter(Boolean);

  const matched = new Set<AllergenKey>();

  for (const piece of pieces) {
    for (const key of ALLERGEN_KEYS) {
      const synonyms = ALLERGEN_SYNONYMS[key].map(normalize);
      if (synonyms.some((syn) => piece.includes(syn) || syn.includes(piece))) {
        matched.add(key);
      }
    }
  }

  return [...matched];
}

const STAGE_RANGES: { maxYears: number; stage: string }[] = [
  { maxYears: 1, stage: "cachorro" },
  { maxYears: 7, stage: "adulto" },
  { maxYears: Infinity, stage: "senior" },
];

function petStage(birthDate: string | null): string | null {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const years =
    (Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  return STAGE_RANGES.find((range) => years < range.maxYears)?.stage ?? null;
}

// El scraper casi no trae `condiciones` todavía (hoy solo "control_peso"
// aparece), pero dejamos el mapeo listo para cuando tenga más cobertura.
const CONDITION_KEYWORDS: Record<string, string[]> = {
  control_peso: ["control de peso", "sobrepeso", "peso"],
};

function matchesSpecialCondition(
  pet: ComparisonPet,
  food: CatalogFood
): boolean {
  if (!pet.specialCondition?.trim() || food.conditions.length === 0) {
    return false;
  }

  const normalizedCondition = normalize(pet.specialCondition);

  return food.conditions.some((code) => {
    const keywords = CONDITION_KEYWORDS[code] || [code];
    return keywords.some((kw) => normalizedCondition.includes(normalize(kw)));
  });
}

function scoreFood(pet: ComparisonPet, food: CatalogFood): ScoredFood {
  let score = 100;

  const stage = petStage(pet.birthDate);
  const matchedStage = Boolean(stage && food.stage && stage === food.stage);
  const mismatchedStage = Boolean(stage && food.stage && stage !== food.stage);

  if (matchedStage) score += 15;
  else if (mismatchedStage) score -= 10;

  const matchedCondition = matchesSpecialCondition(pet, food);
  if (matchedCondition) score += 20;

  return { food, score, matchedStage, matchedCondition };
}

/**
 * Compara el catálogo contra una mascota:
 * 1. Descarta alimentos de otra especie.
 * 2. Descarta alimentos que contienen un alérgeno de la mascota.
 * 3. Ordena el resto con un puntaje heurístico (no es el algoritmo
 *    clínico definitivo, solo una base demostrable).
 * 4. Si se entrega presupuesto, separa la mejor opción dentro de ese
 *    presupuesto de la mejor opción general.
 */
export function compareFoods(
  pet: ComparisonPet,
  budget: number | null
): ComparisonResult {
  const allergens = parseAllergyTokens(pet.allergies);
  const candidates = getFoodsBySpecies(pet.species);

  const eligible: ScoredFood[] = [];
  const excluded: ExcludedFood[] = [];

  for (const food of candidates) {
    // Solo se considera seguro un alérgeno si el scraper confirmó que el
    // alimento NO lo contiene (`false`). Si el dato vino `null` (no se
    // pudo leer la ficha de ingredientes), se trata como no verificado y
    // se descarta igual: más vale prevenir que recomendar algo riesgoso.
    const conflictingAllergen = allergens.find(
      (allergen) => food.allergens[allergen] !== false
    );

    if (conflictingAllergen) {
      excluded.push({ food, allergen: conflictingAllergen });
      continue;
    }

    eligible.push(scoreFood(pet, food));
  }

  eligible.sort((a, b) => b.score - a.score || a.food.price - b.food.price);

  const best = eligible[0] ?? null;

  const bestWithinBudget =
    budget !== null
      ? eligible.find((item) => item.food.price <= budget) ?? null
      : null;

  return { eligible, excluded, best, bestWithinBudget };
}
