import Link from "next/link";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getFavoriteFoodIds } from "@/services/favorites";
import { getAllFoods } from "@/services/foods";
import { getNutritionRanges } from "@/services/nutritionRanges";
import { getActiveRuleSetWeights } from "@/lib/compatibility/ruleSet";
import CompararClient, { type ComparablePet } from "./CompararClient";
import styles from "./Comparar.module.css";

async function getPets(userId: number): Promise<ComparablePet[]> {
  const result = await pool.query<{
    // `pets.id` es BIGINT: el driver `pg` lo devuelve como string, no
    // como number (aunque TS no lo refleje) — hay que convertirlo antes
    // de compararlo con un número en el cliente (ver ComparablePet.id).
    id: string;
    name: string;
    species: string;
    allergies: string | null;
    special_condition: string | null;
    birth_date: string | null;
    weight_kg: string | null;
    activity_level: string | null;
    body_condition: string | null;
    food_preference: string | null;
  }>(
    `
      SELECT
        id, name, species, allergies, special_condition,
        birth_date::text AS birth_date,
        weight_kg, activity_level, body_condition, food_preference
      FROM pets
      WHERE user_id = $1
      ORDER BY id ASC
    `,
    [userId]
  );

  return result.rows.map((pet) => ({
    id: Number(pet.id),
    name: pet.name,
    species: pet.species === "Gato" ? "Gato" : "Perro",
    allergies: pet.allergies,
    specialCondition: pet.special_condition,
    birthDate: pet.birth_date,
    weightKg: pet.weight_kg !== null ? Number(pet.weight_kg) : null,
    activityLevel: pet.activity_level,
    bodyCondition: pet.body_condition,
    foodPreference: pet.food_preference,
  }));
}

export default async function CompararPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const initialSearch = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const userId = await getSessionUserId();
  const pets = userId ? await getPets(userId) : [];
  const isGuest = !userId;

  if (!isGuest && pets.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🐾</div>
            <h2>Agrega una mascota para comparar alimentos.</h2>
            <p>
              Usamos su especie, alergias y necesidades especiales para
              descartar alimentos que no le sirven.
            </p>
            <Link href="/mascotas/nueva" className={styles.emptyButton}>
              + Agregar mascota
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [catalog, nutritionRanges, weights, favoriteIds] = await Promise.all([
    getAllFoods(pool),
    getNutritionRanges(pool),
    getActiveRuleSetWeights(pool),
    userId ? getFavoriteFoodIds(pool, userId) : Promise.resolve(null),
  ]);

  return (
    <CompararClient
      // Una búsqueda nueva desde el navbar reinicia la página con ese texto.
      key={initialSearch}
      initialSearch={initialSearch}
      pets={pets}
      catalog={catalog}
      nutritionRanges={nutritionRanges}
      weights={weights}
      isGuest={isGuest}
      initialFavoriteIds={favoriteIds}
    />
  );
}
