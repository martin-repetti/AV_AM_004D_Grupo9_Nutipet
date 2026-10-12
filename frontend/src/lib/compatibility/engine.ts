import type { FoodRow } from "@/types/catalogFood";
import { parseAllergyTokens } from "./allergies";
import { CRITERIA } from "./criteria";
import { CRITERION_KEYS } from "./types";
import type {
  ComparisonPet,
  ComparisonResult,
  CriterionResult,
  ExcludedFood,
  NutritionRange,
  RuleSetWeights,
  ScoredFood,
} from "./types";
import { buildExplanation } from "./explain";
import { estimateMonthlyCost } from "./monthlyCost";

/**
 * Compatibilidad (%) = 100 × Σ(peso × compatibilidad) entre los
 * criterios evaluables, renormalizado por el peso disponible. Cobertura
 * (%) = peso evaluable / peso total. Extraída como función pura para
 * poder probar la fórmula exacta del prompt sin depender de que una
 * combinación mascota+alimento real produzca esos números.
 */
export function computeWeightedScore(
  criteria: CriterionResult[],
  weights: RuleSetWeights
): { score: number; coverage: number } {
  let weightedSum = 0;
  let availableWeight = 0;
  let totalWeight = 0;

  for (const criterion of criteria) {
    const weight = weights[criterion.key];
    totalWeight += weight;

    if (criterion.score != null) {
      weightedSum += weight * criterion.score;
      availableWeight += weight;
    }
  }

  const score = availableWeight > 0 ? (weightedSum / availableWeight) * 100 : 0;
  const coverage = totalWeight > 0 ? (availableWeight / totalWeight) * 100 : 0;

  return { score, coverage };
}

function scoreFood(
  pet: ComparisonPet,
  food: FoodRow,
  weights: RuleSetWeights,
  catalog: FoodRow[],
  budget: number | null,
  nutritionRanges: NutritionRange[]
): ScoredFood {
  const context = { catalog, budget, nutritionRanges };
  const criteria: CriterionResult[] = CRITERIA.map(({ evaluate }) =>
    evaluate(pet, food, context)
  );

  const { score, coverage } = computeWeightedScore(criteria, weights);

  const { positives, considerations, warnings } = buildExplanation(criteria);

  return {
    food,
    score,
    coverage,
    estimatedMonthlyCost: estimateMonthlyCost(pet.weightKg, food),
    positives,
    considerations,
    warnings,
    criteria,
  };
}

/**
 * Compara el catálogo contra una mascota:
 * 1. Descarta alimentos de otra especie y alimentos con un alérgeno de
 *    la mascota (incluye los que el scraper no pudo verificar: `null`
 *    se trata como no seguro, no como "sin alérgeno").
 * 2. Puntúa el resto con los criterios ponderados configurables.
 * 3. Ordena por compatibilidad, cobertura como desempate.
 * 4. Si hay presupuesto, separa la mejor opción dentro de ese
 *    presupuesto de la mejor opción general.
 */
export function compareFoods(
  pet: ComparisonPet,
  catalog: FoodRow[],
  weights: RuleSetWeights,
  budget: number | null,
  nutritionRanges: NutritionRange[]
): ComparisonResult {
  const allergens = parseAllergyTokens(pet.allergies);

  const candidates = catalog.filter((food) => food.species === pet.species);
  const excluded: ExcludedFood[] = catalog
    .filter((food) => food.species !== pet.species)
    .map((food) => ({ food, reason: "especie" as const }));

  const eligible: ScoredFood[] = [];

  for (const food of candidates) {
    const conflictingAllergen = allergens.find(
      (allergen) => food.allergens[allergen] !== false
    );

    if (conflictingAllergen) {
      excluded.push({ food, reason: "alergia", allergen: conflictingAllergen });
      continue;
    }

    eligible.push(scoreFood(pet, food, weights, candidates, budget, nutritionRanges));
  }

  eligible.sort((a, b) => b.score - a.score || b.coverage - a.coverage);

  const best = eligible[0] ?? null;

  const bestWithinBudget =
    budget != null
      ? eligible.find((item) => item.food.priceMin != null && item.food.priceMin <= budget) ?? null
      : null;

  return { eligible, excluded, best, bestWithinBudget };
}

export { CRITERION_KEYS };
