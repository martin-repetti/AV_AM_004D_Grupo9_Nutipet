import type { Pool } from "pg";
import type { PriceHistoryFood, PriceRecord } from "@/types/priceHistory";

/** Todos los precios registrados de un alimento, del más antiguo al más reciente. */
export async function getPriceHistory(pool: Pool, foodId: number): Promise<PriceRecord[]> {
  const result = await pool.query<{
    recorded_on: string;
    store: string;
    format: string;
    price: string;
    url: string | null;
  }>(
    `
      SELECT recorded_on::text AS recorded_on, store, format, price, url
      FROM food_price_history
      WHERE food_id = $1
      ORDER BY recorded_on ASC, price ASC
    `,
    [foodId]
  );

  return result.rows.map((row) => ({
    date: row.recorded_on,
    store: row.store,
    format: row.format,
    price: Number(row.price),
    url: row.url,
  }));
}

/** Alimentos activos cuyo nombre o marca contiene todas las palabras buscadas. */
export async function searchFoods(
  pool: Pool,
  query: string,
  limit = 12
): Promise<PriceHistoryFood[]> {
  const words = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6)
    // % y _ son comodines de LIKE: se buscan como texto.
    .map((word) => word.replace(/[\\%_]/g, (char) => `\\${char}`));
  if (words.length === 0) return [];

  // Sin tildes en ambos lados, para que "salmon" encuentre "Salmón".
  const searchable = `translate(lower(brand || ' ' || name), 'áéíóúüñ', 'aeiouun')`;
  const conditions = words.map((_, i) => `${searchable} LIKE '%' || $${i + 1} || '%'`);

  const result = await pool.query<{ id: string; brand: string; name: string }>(
    `
      SELECT id, brand, name
      FROM foods
      WHERE is_active AND species != '' AND ${conditions.join(" AND ")}
      ORDER BY (SELECT count(DISTINCT recorded_on) FROM food_price_history h WHERE h.food_id = foods.id) DESC,
               brand, name
      LIMIT ${Number(limit)}
    `,
    words
  );

  return result.rows.map((row) => ({ id: Number(row.id), brand: row.brand, name: row.name }));
}

/** El alimento con más días de precios registrados: el ejemplo que se muestra sin elegir nada. */
export async function getFoodWithLongestHistory(pool: Pool): Promise<PriceHistoryFood | null> {
  const result = await pool.query<{ id: string; brand: string; name: string }>(
    `
      SELECT f.id, f.brand, f.name
      FROM foods f
      JOIN food_price_history h ON h.food_id = f.id
      WHERE f.is_active
      GROUP BY f.id
      ORDER BY count(DISTINCT h.recorded_on) DESC, f.id
      LIMIT 1
    `
  );
  const row = result.rows[0];
  return row ? { id: Number(row.id), brand: row.brand, name: row.name } : null;
}
