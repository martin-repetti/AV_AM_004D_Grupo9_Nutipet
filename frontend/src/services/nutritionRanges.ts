import type { Pool } from "pg";
import type { NutritionRange } from "@/lib/compatibility/types";

type NutritionRangeDbRow = {
  species: string;
  stage: string;
  nutrient: string;
  min_value: string | null;
  ideal_min: string | null;
  ideal_max: string | null;
  max_value: string | null;
};

function toNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getNutritionRanges(pool: Pool): Promise<NutritionRange[]> {
  const result = await pool.query<NutritionRangeDbRow>(
    `SELECT species, stage, nutrient, min_value, ideal_min, ideal_max, max_value FROM nutrition_reference_ranges`
  );

  return result.rows.map((row) => ({
    species: row.species as "Perro" | "Gato",
    stage: row.stage,
    nutrient: row.nutrient as "protein" | "fat" | "fiber",
    minValue: toNumber(row.min_value),
    idealMin: toNumber(row.ideal_min),
    idealMax: toNumber(row.ideal_max),
    maxValue: toNumber(row.max_value),
  }));
}
