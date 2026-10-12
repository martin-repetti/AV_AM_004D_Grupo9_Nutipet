import Link from "next/link";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { getAllFoods } from "@/services/foods";
import { getNutritionRanges } from "@/services/nutritionRanges";
import { getActiveRuleSetWeights } from "@/lib/compatibility/ruleSet";
import CompararClient, { type ComparablePet } from "./CompararClient";
import styles from "./Comparar.module.css";

async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nutripet_session")?.value;

  if (!token) return null;

  try {
    const session = await verifySessionToken(token);
    return Number(session.userId) || null;
  } catch {
    return null;
  }
}

async function getPets(userId: number): Promise<ComparablePet[]> {
  const result = await pool.query<{
    id: number;
    name: string;
    species: string;
    allergies: string | null;
    special_condition: string | null;
    birth_date: string | null;
    weight_kg: string | null;
    activity_level: string | null;
    body_condition: string | null;
  }>(
    `
      SELECT
        id, name, species, allergies, special_condition,
        birth_date::text AS birth_date,
        weight_kg, activity_level, body_condition
      FROM pets
      WHERE user_id = $1
      ORDER BY id ASC
    `,
    [userId]
  );

  return result.rows.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species === "Gato" ? "Gato" : "Perro",
    allergies: pet.allergies,
    specialCondition: pet.special_condition,
    birthDate: pet.birth_date,
    weightKg: pet.weight_kg !== null ? Number(pet.weight_kg) : null,
    activityLevel: pet.activity_level,
    bodyCondition: pet.body_condition,
  }));
}

export default async function CompararPage() {
  const userId = await getSessionUserId();
  const pets = userId ? await getPets(userId) : [];

  if (!userId) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔒</div>
            <h2>Inicia sesión para comparar alimentos.</h2>
            <p>
              Necesitamos saber las características de tu mascota para
              descartar alimentos con alérgenos y recomendarte el resto.
            </p>
            <Link href="/login" className={styles.emptyButton}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (pets.length === 0) {
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

  const [catalog, nutritionRanges, weights] = await Promise.all([
    getAllFoods(pool),
    getNutritionRanges(pool),
    getActiveRuleSetWeights(pool),
  ]);

  return (
    <CompararClient
      pets={pets}
      catalog={catalog}
      nutritionRanges={nutritionRanges}
      weights={weights}
    />
  );
}
