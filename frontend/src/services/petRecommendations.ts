import type { Pool } from "pg";
import { compareFoods } from "@/lib/compatibility/engine";
import { petStage } from "@/lib/compatibility/petStage";
import { getActiveRuleSetWeights } from "@/lib/compatibility/ruleSet";
import type { ScoredFood } from "@/lib/compatibility/types";
import { getFoodsBySpecies } from "@/services/foods";
import { getNutritionRanges } from "@/services/nutritionRanges";
import type { FoodRow } from "@/types/catalogFood";
import type { SimulatorFood } from "@/components/petTracking/BudgetSimulator";
import { formatDisplayName } from "@/utils/productName";

export type RecommendablePet = {
  species: string;
  birth_date: string | Date | null;
  weight_kg: string | number | null;
  activity_level: string | null;
  body_condition: string | null;
  special_condition: string | null;
  allergies: string | null;
  food_preference: string | null;
};

/**
 * Los alimentos más compatibles con la mascota, con el mismo motor y los
 * mismos filtros que /comparar (incluida su preferencia seco/húmedo).
 */
export async function getPetRecommendations(
  pool: Pool,
  pet: RecommendablePet,
  limit: number
): Promise<ScoredFood[]> {
  const species = pet.species === "Gato" ? "Gato" : "Perro";
  const [catalog, ranges, weights] = await Promise.all([
    getFoodsBySpecies(pool, species),
    getNutritionRanges(pool),
    getActiveRuleSetWeights(pool),
  ]);

  const { eligible } = compareFoods(
    {
      species,
      stage: petStage(pet.birth_date),
      weightKg: pet.weight_kg === null ? null : Number(pet.weight_kg),
      activityLevel: pet.activity_level,
      bodyCondition: pet.body_condition,
      specialCondition: pet.special_condition,
      allergies: pet.allergies,
    },
    catalog,
    weights,
    null,
    ranges
  );

  const preference = (pet.food_preference ?? "").toLowerCase();
  const type = preference === "seco" ? "seco" : preference === "húmedo" ? "humedo" : "";
  return eligible.filter(({ food }) => !type || food.type === type).slice(0, limit);
}

export function foodLabel(food: Pick<FoodRow, "brand" | "name">): string {
  const name = formatDisplayName(food.name);
  return food.brand ? `${food.brand} — ${name}` : name;
}

/** Datos que necesita el simulador de presupuesto para un alimento. */
export function toSimulatorFood(food: FoodRow): SimulatorFood {
  return {
    id: food.id,
    label: foodLabel(food),
    kcalKg: food.kcalKg,
    kcalKgEstimated: food.kcalKgEstimated,
    offers: food.pricesByFormat.map((offer) => ({
      format: offer.format,
      price: offer.price,
      store: offer.store,
      url: offer.url,
    })),
  };
}
