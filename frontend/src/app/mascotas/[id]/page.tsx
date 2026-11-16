import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { speciesIcon, formatAge, formatWeight, formatBreed } from "@/utils/pet";
import { getUserPlan, isPremium } from "@/services/plans";
import { getFoodLogs, getWeightLogs } from "@/services/petTracking";
import { getFavoriteFoods } from "@/services/favorites";
import { foodLabel, getPetRecommendations, toSimulatorFood } from "@/services/petRecommendations";
import { ageInMonths, type FeedingPet } from "@/utils/feedingPlan";
import PetTracker from "@/components/petTracking/PetTracker";
import BudgetSimulator from "@/components/petTracking/BudgetSimulator";
import PremiumLock from "@/components/premium/PremiumLock";
import styles from "./MascotaPerfil.module.css";

type PetRow = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  custom_breed: string | null;
  sex: string | null;
  birth_date: string | null;
  weight_kg: string | number | null;
  activity_level: string | null;
  body_condition: string | null;
  sterilized: boolean | null;
  food_preference: string | null;
  allergies: string | null;
  special_condition: string | null;
};

async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const session = await verifySessionToken(token);
    return Number(session.userId) || null;
  } catch {
    return null;
  }
}

export default async function MascotaPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const petId = Number(id);

  if (!Number.isInteger(petId)) {
    notFound();
  }

  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const result = await pool.query<PetRow>(
    `
      SELECT
        id,
        name,
        species,
        breed,
        custom_breed,
        sex,
        birth_date,
        weight_kg,
        activity_level,
        body_condition,
        sterilized,
        food_preference,
        allergies,
        special_condition
      FROM pets
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [petId, userId]
  );

  const pet = result.rows[0];

  if (!pet) {
    notFound();
  }

  const plan = await getUserPlan(pool, userId);
  const premium = isPremium(plan);

  // Datos de las herramientas Premium: solo se consultan si el plan las incluye.
  const tools = premium ? await loadPremiumTools(pet, userId) : null;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <Link href="/mascotas" className={styles.back}>
            ← Mis mascotas
          </Link>

          <Link href={`/mascotas/${pet.id}/editar`} className={styles.editButton}>
            Editar perfil
          </Link>
        </div>

        <section className={styles.profileHeader}>
          <div className={styles.petIcon}>{speciesIcon(pet.species)}</div>

          <div>
            <span className={styles.species}>{pet.species.toUpperCase()}</span>
            <h1>{pet.name}</h1>
            <p>{formatBreed(pet)}</p>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.card}>
            <h2>Información general</h2>

            <div className={styles.infoGrid}>
              <div>
                <span>Edad</span>
                <strong>{formatAge(pet.birth_date)}</strong>
              </div>

              <div>
                <span>Peso</span>
                <strong>{formatWeight(pet.weight_kg)}</strong>
              </div>

              <div>
                <span>Sexo</span>
                <strong>{pet.sex || "No indicado"}</strong>
              </div>

              <div>
                <span>Actividad</span>
                <strong>{pet.activity_level || "No indicada"}</strong>
              </div>

              <div>
                <span>Condición corporal</span>
                <strong>{pet.body_condition || "No indicada"}</strong>
              </div>

              <div>
                <span>Esterilizado</span>
                <strong>
                  {pet.sterilized === true
                    ? "Sí"
                    : pet.sterilized === false
                    ? "No"
                    : "No indicado"}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Necesidades especiales</h2>

            <div className={styles.specialItem}>
              <span>Alergias o restricciones</span>
              <strong>{pet.allergies || "Ninguna"}</strong>
            </div>

            <div className={styles.specialItem}>
              <span>Condición especial</span>
              <strong>{pet.special_condition || "Ninguna"}</strong>
            </div>

            <div className={styles.specialItem}>
              <span>Preferencia</span>
              <strong>{pet.food_preference || "Sin preferencia"}</strong>
            </div>
          </section>
        </div>

        <section className={styles.toolsSection}>
          <div className={styles.toolsHeader}>
            <h2>Seguimiento y planificación</h2>
            {premium ? (
              <Link href={`/mascotas/${pet.id}/reporte`} className={styles.reportButton}>
                Descargar reporte
              </Link>
            ) : (
              <span className={styles.premiumTag}>Premium</span>
            )}
          </div>

          {tools ? (
            <>
              <div className={styles.toolCard}>
                <h3>Simulador de presupuesto mensual</h3>
                <p className={styles.toolIntro}>
                  Cuánto come {pet.name} al día y cuánto gastarías al mes con
                  cada formato y tienda.
                </p>
                <BudgetSimulator petName={pet.name} pet={tools.feedingPet} foods={tools.simulatorFoods} />
              </div>

              <PetTracker
                petId={Number(pet.id)}
                petName={pet.name}
                weights={tools.weights}
                foods={tools.foodLogs}
                foodOptions={tools.foodOptions}
              />
            </>
          ) : (
            <div className={styles.locks}>
              <PremiumLock feature="presupuesto" />
              <PremiumLock feature="peso" />
              <PremiumLock feature="seguimiento" />
              <PremiumLock feature="reporte" />
            </div>
          )}
        </section>

        <section className={styles.recommendation}>
          <div>
            <span className={styles.recommendationLabel}>
              RECOMENDACIÓN PERSONALIZADA
            </span>

            <h2>Encuentra alimentos compatibles con {pet.name}</h2>

            <p>
              Analizaremos sus características para mostrar alternativas
              ordenadas por nivel de compatibilidad.
            </p>
          </div>

          <Link
            href={`/comparar?mascota=${pet.id}`}
            className={styles.primaryButton}
          >
            Buscar alimentos compatibles
          </Link>
        </section>
      </div>
    </main>
  );
}

const SIMULATOR_FOODS = 12;
const FOOD_OPTIONS = 20;

async function loadPremiumTools(pet: PetRow, userId: number) {
  const [weights, foodLogs, recommendations, favorites] = await Promise.all([
    getWeightLogs(pool, pet.id),
    getFoodLogs(pool, pet.id),
    getPetRecommendations(pool, pet, FOOD_OPTIONS),
    getFavoriteFoods(pool, userId),
  ]);

  // Favoritos de su especie primero (son los que el tutor ya está mirando), luego las recomendaciones.
  const ownSpecies = favorites
    .filter(({ food, isActive }) => isActive && food.species === pet.species)
    .map(({ food }) => food);
  const seen = new Set<number>();
  const candidates = [...ownSpecies, ...recommendations.map(({ food }) => food)].filter((food) => {
    if (seen.has(food.id)) return false;
    seen.add(food.id);
    return true;
  });

  const weightKg = pet.weight_kg === null ? null : Number(pet.weight_kg);
  const feedingPet: FeedingPet | null =
    weightKg && weightKg > 0
      ? {
          species: pet.species === "Gato" ? "Gato" : "Perro",
          weightKg,
          ageMonths: ageInMonths(pet.birth_date),
          sterilized: pet.sterilized,
          activityLevel: pet.activity_level,
          bodyCondition: pet.body_condition,
        }
      : null;

  return {
    weights,
    foodLogs,
    feedingPet,
    simulatorFoods: candidates
      .filter((food) => food.pricesByFormat.some((offer) => offer.format))
      .slice(0, SIMULATOR_FOODS)
      .map(toSimulatorFood),
    foodOptions: candidates.map((food) => ({ id: food.id, label: foodLabel(food) })),
  };
}
