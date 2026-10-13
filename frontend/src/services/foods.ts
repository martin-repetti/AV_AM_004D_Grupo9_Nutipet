import type { Pool } from "pg";
import type { FoodRow } from "@/types/catalogFood";

type FoodDbRow = {
  // `foods.id` es BIGINT en Postgres: el driver `pg` lo devuelve como
  // string (no cabe garantizado en un JS number), aunque TS no lo vea.
  id: string;
  brand: string;
  name: string;
  species: string;
  type: string;
  stage: string;
  conditions: string[];
  protein: string | null;
  fat: string | null;
  fiber: string | null;
  moisture: string | null;
  protein_ms: string | null;
  fat_ms: string | null;
  fiber_ms: string | null;
  kcal_kg: string | null;
  kcal_kg_estimated: boolean;
  allergens: Record<string, boolean | null>;
  first_ingredient: string | null;
  formats: string[];
  price_min: string | null;
  price_per_kg: string | null;
  price_store: string | null;
  price_url: string | null;
  source_url: string | null;
};

function toNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapRow(row: FoodDbRow): FoodRow {
  return {
    id: Number(row.id),
    brand: row.brand,
    name: row.name,
    species: row.species === "Gato" || row.species === "Perro" ? row.species : "",
    type: row.type === "seco" || row.type === "humedo" ? row.type : "",
    stage: row.stage,
    conditions: row.conditions ?? [],
    protein: toNumber(row.protein),
    fat: toNumber(row.fat),
    fiber: toNumber(row.fiber),
    moisture: toNumber(row.moisture),
    proteinMs: toNumber(row.protein_ms),
    fatMs: toNumber(row.fat_ms),
    fiberMs: toNumber(row.fiber_ms),
    kcalKg: toNumber(row.kcal_kg),
    kcalKgEstimated: row.kcal_kg_estimated,
    allergens: row.allergens as FoodRow["allergens"],
    firstIngredient: row.first_ingredient,
    formats: row.formats ?? [],
    priceMin: toNumber(row.price_min),
    pricePerKg: toNumber(row.price_per_kg),
    priceStore: row.price_store,
    priceUrl: row.price_url,
    sourceUrl: row.source_url,
  };
}

const SELECT_FOOD_COLUMNS = `
  id, brand, name, species, type, stage, conditions,
  protein, fat, fiber, moisture,
  protein_ms, fat_ms, fiber_ms,
  kcal_kg, kcal_kg_estimated,
  allergens, first_ingredient, formats,
  price_min, price_per_kg, price_store, price_url, source_url
`;

/**
 * Catálogo de alimentos (tabla `foods`, importada del scraper vía
 * scripts/import-foods.js). Solo trae alimentos con especie detectada:
 * los que el scraper no pudo etiquetar (ej. golosinas sin "perro"/"gato"
 * en la ficha) quedan fuera para no recomendar un producto equivocado
 * por error de categorización, en vez de mostrarlo "por si acaso".
 */
export async function getFoodsBySpecies(
  pool: Pool,
  species: "Perro" | "Gato"
): Promise<FoodRow[]> {
  const result = await pool.query<FoodDbRow>(
    `SELECT ${SELECT_FOOD_COLUMNS} FROM foods WHERE species = $1 ORDER BY id ASC`,
    [species]
  );

  return result.rows.map(mapRow);
}

/**
 * Todo el catálogo con especie detectada (Perro + Gato). Se usa cuando
 * el motor de comparación corre en el cliente y necesita poder cambiar
 * de mascota (y por lo tanto de especie) sin volver a pedirle datos al
 * servidor.
 */
export async function getAllFoods(pool: Pool): Promise<FoodRow[]> {
  const result = await pool.query<FoodDbRow>(
    `SELECT ${SELECT_FOOD_COLUMNS} FROM foods WHERE species != '' ORDER BY id ASC`
  );

  return result.rows.map(mapRow);
}
