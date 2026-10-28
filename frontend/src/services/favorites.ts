import type { Pool } from "pg";
import type { FoodRow } from "@/types/catalogFood";
import { getFoodsByIds } from "@/services/foods";

export type FavoriteFood = {
  food: FoodRow;
  /** false = el scraper dejó de encontrarlo; se conserva para no perder el favorito. */
  isActive: boolean;
};

export async function getFavoriteFoodIds(pool: Pool, userId: number): Promise<number[]> {
  const result = await pool.query<{ food_id: string }>(
    `SELECT food_id FROM favorite_foods WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map((row) => Number(row.food_id));
}

/** Favoritos del usuario, del más reciente al más antiguo. */
export async function getFavoriteFoods(pool: Pool, userId: number): Promise<FavoriteFood[]> {
  const ids = await getFavoriteFoodIds(pool, userId);
  const foods = await getFoodsByIds(pool, ids);
  const byId = new Map(foods.map((entry) => [entry.food.id, entry]));
  return ids.map((id) => byId.get(id)).filter((entry): entry is FavoriteFood => !!entry);
}

/** Devuelve false si el alimento no existe. Guardarlo dos veces no es un error. */
export async function addFavorite(pool: Pool, userId: number, foodId: number): Promise<boolean> {
  const result = await pool.query(
    `
      INSERT INTO favorite_foods (user_id, food_id)
      SELECT $1, id FROM foods WHERE id = $2
      ON CONFLICT DO NOTHING
      RETURNING food_id
    `,
    [userId, foodId]
  );
  if (result.rowCount) return true;

  const exists = await pool.query(`SELECT 1 FROM foods WHERE id = $1`, [foodId]);
  return (exists.rowCount ?? 0) > 0;
}

export async function removeFavorite(pool: Pool, userId: number, foodId: number): Promise<void> {
  await pool.query(`DELETE FROM favorite_foods WHERE user_id = $1 AND food_id = $2`, [
    userId,
    foodId,
  ]);
}
