import type { Pool } from "pg";

export type WeightLog = {
  id: number;
  weightKg: number;
  /** "YYYY-MM-DD" */
  recordedOn: string;
  note: string | null;
};

export type FoodLog = {
  id: number;
  foodId: number | null;
  foodName: string;
  /** "YYYY-MM-DD" */
  startedOn: string;
  note: string | null;
};

/** true si la mascota existe y es del usuario. */
export async function ownsPet(pool: Pool, petId: number, userId: number): Promise<boolean> {
  const result = await pool.query(`SELECT 1 FROM pets WHERE id = $1 AND user_id = $2`, [petId, userId]);
  return (result.rowCount ?? 0) > 0;
}

export async function getWeightLogs(pool: Pool, petId: number): Promise<WeightLog[]> {
  const result = await pool.query<{ id: string; weight_kg: string; recorded_on: string; note: string | null }>(
    `
      SELECT id, weight_kg, recorded_on::text AS recorded_on, note
      FROM pet_weight_logs WHERE pet_id = $1 ORDER BY recorded_on ASC
    `,
    [petId]
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    weightKg: Number(row.weight_kg),
    recordedOn: row.recorded_on,
    note: row.note,
  }));
}

/**
 * Registra (o corrige, si ya hay uno ese día) el peso de la mascota. Si es
 * el registro más reciente, también actualiza el peso del perfil, que es
 * el que usa el motor de recomendación.
 */
export async function saveWeightLog(
  pool: Pool,
  petId: number,
  input: { weightKg: number; recordedOn: string; note: string | null }
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `
        INSERT INTO pet_weight_logs (pet_id, weight_kg, recorded_on, note)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (pet_id, recorded_on) DO UPDATE SET weight_kg = EXCLUDED.weight_kg, note = EXCLUDED.note
      `,
      [petId, input.weightKg, input.recordedOn, input.note]
    );
    await syncProfileWeight(client, petId);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteWeightLog(pool: Pool, petId: number, logId: number): Promise<boolean> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(`DELETE FROM pet_weight_logs WHERE id = $1 AND pet_id = $2`, [logId, petId]);
    await syncProfileWeight(client, petId);
    await client.query("COMMIT");
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/** El peso del perfil es el del registro más reciente (si hay registros). */
async function syncProfileWeight(client: { query: Pool["query"] }, petId: number): Promise<void> {
  await client.query(
    `
      UPDATE pets SET weight_kg = latest.weight_kg, updated_at = CURRENT_TIMESTAMP
      FROM (
        SELECT weight_kg FROM pet_weight_logs WHERE pet_id = $1 ORDER BY recorded_on DESC LIMIT 1
      ) AS latest
      WHERE pets.id = $1
    `,
    [petId]
  );
}

export async function getFoodLogs(pool: Pool, petId: number): Promise<FoodLog[]> {
  const result = await pool.query<{
    id: string;
    food_id: string | null;
    food_name: string;
    started_on: string;
    note: string | null;
  }>(
    `
      SELECT id, food_id, food_name, started_on::text AS started_on, note
      FROM pet_food_logs WHERE pet_id = $1 ORDER BY started_on ASC, id ASC
    `,
    [petId]
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    foodId: row.food_id === null ? null : Number(row.food_id),
    foodName: row.food_name,
    startedOn: row.started_on,
    note: row.note,
  }));
}

/** Con foodId toma el nombre del catálogo; sin él, el nombre escrito (un alimento que no está en el catálogo). */
export async function addFoodLog(
  pool: Pool,
  petId: number,
  input: { foodId: number | null; foodName: string; startedOn: string; note: string | null }
): Promise<boolean> {
  let name = input.foodName.trim();
  if (input.foodId !== null) {
    const food = await pool.query<{ brand: string; name: string }>(`SELECT brand, name FROM foods WHERE id = $1`, [
      input.foodId,
    ]);
    if (!food.rows[0]) return false;
    name = [food.rows[0].brand, food.rows[0].name].filter(Boolean).join(" — ");
  }
  if (!name) return false;

  await pool.query(
    `INSERT INTO pet_food_logs (pet_id, food_id, food_name, started_on, note) VALUES ($1, $2, $3, $4, $5)`,
    [petId, input.foodId, name.slice(0, 300), input.startedOn, input.note]
  );
  return true;
}

export async function deleteFoodLog(pool: Pool, petId: number, logId: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM pet_food_logs WHERE id = $1 AND pet_id = $2`, [logId, petId]);
  return (result.rowCount ?? 0) > 0;
}
