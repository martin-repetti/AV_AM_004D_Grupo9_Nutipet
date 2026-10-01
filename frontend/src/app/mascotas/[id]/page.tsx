import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { speciesIcon, formatAge, formatWeight, formatBreed } from "@/utils/pet";
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
  const token = cookieStore.get("nutripet_session")?.value;

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
