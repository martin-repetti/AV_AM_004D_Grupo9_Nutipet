import Link from "next/link";
import { cookies } from "next/headers";
import PetCard from "@/components/ui/PetCard";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { speciesIcon, formatAge, formatWeight, formatBreed } from "@/utils/pet";
import styles from "./Mascotas.module.css";

type PetRow = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  custom_breed: string | null;
  birth_date: string | null;
  weight_kg: string | number | null;
  activity_level: string | null;
};

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

async function getPets(userId: number): Promise<PetRow[]> {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        species,
        breed,
        custom_breed,
        birth_date,
        weight_kg,
        activity_level
      FROM pets
      WHERE user_id = $1
      ORDER BY id DESC
    `,
    [userId]
  );

  return result.rows;
}

export default async function MascotasPage() {
  const userId = await getSessionUserId();

  const pets = userId
    ? await getPets(userId)
    : [];

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <div className={styles.top}>
          <div>
            <h1>Mis mascotas</h1>
            <p>
              Administra los perfiles y características de tus mascotas.
            </p>
          </div>

          {pets.length > 0 && (
            <Link
              href="/mascotas/nueva"
              className={styles.addButton}
            >
              + Agregar mascota
            </Link>
          )}
        </div>

        {!userId ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              🔒
            </div>

            <h2>
              Inicia sesión para ver tus mascotas.
            </h2>

            <p>
              Crea una cuenta o inicia sesión para registrar
              y administrar los perfiles de tus mascotas.
            </p>

            <Link
              href="/login"
              className={styles.emptyButton}
            >
              Iniciar sesión
            </Link>
          </div>
        ) : pets.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              🐾
            </div>

            <h2>
              No tienes mascotas registradas todavía.
            </h2>

            <p>
              Agrega a tu primera mascota para empezar
              a recibir recomendaciones de alimentos
              a su medida.
            </p>

            <Link
              href="/mascotas/nueva"
              className={styles.emptyButton}
            >
              + Agregar mascota
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                id={pet.id}
                name={pet.name}
                species={pet.species}
                breed={formatBreed(pet)}
                age={formatAge(pet.birth_date)}
                weight={formatWeight(pet.weight_kg)}
                activity={
                  pet.activity_level || "No indicada"
                }
                icon={speciesIcon(pet.species)}
              />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}