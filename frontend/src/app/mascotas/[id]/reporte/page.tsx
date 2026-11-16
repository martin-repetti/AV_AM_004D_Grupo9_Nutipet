import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getUserPlan, isPremium } from "@/services/plans";
import { getFoodLogs, getWeightLogs } from "@/services/petTracking";
import { foodLabel, getPetRecommendations, type RecommendablePet } from "@/services/petRecommendations";
import WeightChart from "@/components/petTracking/WeightChart";
import { ageInMonths, dailyGrams, estimateEnergy, planOffers } from "@/utils/feedingPlan";
import { formatAge, formatBreed, formatWeight } from "@/utils/pet";
import { formatHistoryDate } from "@/utils/priceHistory";
import PrintButton from "./PrintButton";
import styles from "./Reporte.module.css";

export const metadata: Metadata = { title: "Reporte de mascota" };

type ReportPet = RecommendablePet & {
  id: string;
  name: string;
  breed: string | null;
  custom_breed: string | null;
  sex: string | null;
  sterilized: boolean | null;
};

const TOP = 5;

function money(value: number): string {
  return `$${value.toLocaleString("es-CL")}`;
}

export default async function ReportePage({ params }: { params: Promise<{ id: string }> }) {
  const petId = Number((await params).id);
  if (!Number.isInteger(petId)) notFound();

  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const result = await pool.query<ReportPet>(
    `
      SELECT id, name, species, breed, custom_breed, sex, birth_date::text AS birth_date, weight_kg,
             activity_level, body_condition, sterilized, food_preference, allergies, special_condition
      FROM pets WHERE id = $1 AND user_id = $2
    `,
    [petId, userId]
  );
  const pet = result.rows[0];
  if (!pet) notFound();

  if (!isPremium(await getUserPlan(pool, userId))) redirect("/planes");

  const [weights, foodLogs, recommendations] = await Promise.all([
    getWeightLogs(pool, petId),
    getFoodLogs(pool, petId),
    getPetRecommendations(pool, pet, TOP),
  ]);

  const weightKg = pet.weight_kg === null ? null : Number(pet.weight_kg);
  const energy =
    weightKg && weightKg > 0
      ? estimateEnergy({
          species: pet.species === "Gato" ? "Gato" : "Perro",
          weightKg,
          ageMonths: ageInMonths(pet.birth_date),
          sterilized: pet.sterilized,
          activityLevel: pet.activity_level,
          bodyCondition: pet.body_condition,
        })
      : null;

  const generatedOn = new Date().toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago",
  });

  const facts: [string, string][] = [
    ["Especie", pet.species],
    ["Raza", formatBreed(pet)],
    ["Edad", formatAge(pet.birth_date)],
    ["Peso actual", formatWeight(pet.weight_kg)],
    ["Sexo", pet.sex || "No indicado"],
    ["Esterilizado", pet.sterilized === true ? "Sí" : pet.sterilized === false ? "No" : "No indicado"],
    ["Actividad", pet.activity_level || "No indicada"],
    ["Condición corporal", pet.body_condition || "No indicada"],
    ["Necesidad especial", pet.special_condition || "Ninguna"],
    ["Alergias", pet.allergies || "Ninguna"],
    ["Preferencia", pet.food_preference || "Sin preferencia"],
  ];

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        <Link href={`/mascotas/${petId}`}>← Volver al perfil</Link>
        <PrintButton />
      </div>

      <article className={styles.sheet}>
        <header className={styles.header}>
          <Image src="/brand/huellafit-logo.png" alt="HuellaFit" width={900} height={267} className={styles.logo} />
          <div>
            <h1>Reporte de {pet.name}</h1>
            <p>Generado el {generatedOn}</p>
          </div>
        </header>

        <section>
          <h2>Perfil</h2>
          <dl className={styles.facts}>
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {energy && (
            <p className={styles.energy}>
              Energía diaria estimada: <strong>{energy.dailyKcal.toLocaleString("es-CL")} kcal</strong> (
              {energy.restingKcal} kcal en reposo × {String(energy.factor).replace(".", ",")}, {energy.factorReason}).
            </p>
          )}
        </section>

        <section>
          <h2>Evolución del peso</h2>
          <WeightChart weights={weights} foods={foodLogs} />
          {weights.length > 0 && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Peso</th>
                  <th scope="col">Nota</th>
                </tr>
              </thead>
              <tbody>
                {[...weights].reverse().map((log) => (
                  <tr key={log.id}>
                    <td>{formatHistoryDate(log.recordedOn)}</td>
                    <td>{String(log.weightKg).replace(".", ",")} kg</td>
                    <td>{log.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2>Alimentación</h2>
          {foodLogs.length === 0 ? (
            <p className={styles.muted}>No hay cambios de alimento registrados.</p>
          ) : (
            <ol className={styles.foodLog}>
              {foodLogs.map((log) => (
                <li key={log.id}>
                  <strong>{log.foodName}</strong> · desde {formatHistoryDate(log.startedOn)}
                  {log.note && <span> · {log.note}</span>}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2>Alimentos más compatibles</h2>
          {recommendations.length === 0 ? (
            <p className={styles.muted}>No encontramos alimentos compatibles con este perfil.</p>
          ) : (
            <ol className={styles.recommendations}>
              {recommendations.map(({ food, score, coverage, positives, considerations }) => {
                const grams = energy && food.kcalKg ? dailyGrams(energy.dailyKcal, food.kcalKg) : null;
                const cheapest = grams ? planOffers(grams, food.pricesByFormat)[0] : undefined;
                return (
                  <li key={food.id}>
                    <div className={styles.recoHead}>
                      <strong>{foodLabel(food)}</strong>
                      <span>
                        {Math.round(score)}% compatible · {Math.round(coverage)}% de datos verificados
                      </span>
                    </div>
                    <p className={styles.recoFacts}>
                      Proteína {food.protein ?? "—"}% · Grasa {food.fat ?? "—"}% · Fibra {food.fiber ?? "—"}%
                      {grams && ` · Ración estimada ${grams} g/día`}
                      {cheapest && ` · Desde ${money(cheapest.monthlyCost)} al mes (${cheapest.format})`}
                      {!cheapest && food.priceMin !== null && ` · Desde ${money(food.priceMin)}`}
                    </p>
                    {positives.length > 0 && <p className={styles.good}>A favor: {positives.join(" ")}</p>}
                    {considerations.length > 0 && (
                      <p className={styles.consider}>A considerar: {considerations.join(" ")}</p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <footer className={styles.disclaimer}>
          HuellaFit entrega información orientativa para apoyar la elección de alimentos. No reemplaza la
          evaluación ni las indicaciones de un médico veterinario. Raciones y gastos son estimaciones.
        </footer>
      </article>
    </main>
  );
}
