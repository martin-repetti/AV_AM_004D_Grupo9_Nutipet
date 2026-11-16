import type { Metadata } from "next";
import Link from "next/link";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getPlans, getUserPlan, isPremium } from "@/services/plans";
import { PLAN_FEATURES, type PlanFeature } from "@/utils/planFeatures";
import { formatPlanDate } from "@/utils/planDates";
import styles from "./Planes.module.css";

export const metadata: Metadata = {
  title: "Planes",
  description: "Compara el plan Gratis y el plan Premium de HuellaFit.",
};

function FeatureValue({ value }: { value: PlanFeature["free"] }) {
  if (value === true) return <span className={styles.yes} aria-label="Incluido">✓</span>;
  if (value === false) return <span className={styles.no} aria-label="No incluido">—</span>;
  return <span className={styles.text}>{value}</span>;
}

export default async function PlanesPage() {
  const userId = await getSessionUserId();
  const [plans, userPlan] = await Promise.all([
    getPlans(pool),
    userId ? getUserPlan(pool, userId) : Promise.resolve(null),
  ]);
  const free = plans.find((plan) => plan.code === "gratis");
  const premium = plans.find((plan) => plan.code === "premium");
  const userIsPremium = userPlan !== null && isPremium(userPlan);
  // Lo que Premium agrega sobre Gratis (las mascotas ya van en su propia línea).
  const premiumExtras = PLAN_FEATURES.filter(
    (feature) => feature.free !== true && feature.key !== "mascotas"
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Planes</span>
          <h1>Elige cómo cuidar la alimentación de tu mascota</h1>
          <p>
            Compara y recibe recomendaciones gratis. Con Premium sumas
            seguimiento, alertas y herramientas para planificar tu gasto.
          </p>
        </header>

        <div className={styles.cards}>
          <section className={styles.card}>
            <h2>{free?.name ?? "Gratis"}</h2>
            <p className={styles.price}>
              <strong>$0</strong>
              <span>para siempre</span>
            </p>
            <ul className={styles.list}>
              <li>Recomendaciones personalizadas con su explicación</li>
              <li>Hasta {free?.maxPets ?? 2} mascotas registradas</li>
              <li>Comparación de hasta {free?.maxCompare ?? 4} alimentos</li>
              <li>Favoritos e historial de precios</li>
            </ul>
            {userPlan === null ? (
              <Link href="/registro" className={styles.secondaryButton}>
                Crear cuenta gratis
              </Link>
            ) : !userIsPremium ? (
              <span className={styles.currentTag}>Tu plan actual</span>
            ) : null}
          </section>

          <section className={`${styles.card} ${styles.featured}`}>
            <span className={styles.ribbon}>Recomendado</span>
            <h2>{premium?.name ?? "Premium"}</h2>
            <p className={styles.price}>
              <strong>${(premium?.priceMonthly ?? 1990).toLocaleString("es-CL")}</strong>
              <span>al mes</span>
            </p>
            <ul className={styles.list}>
              <li>Todo lo del plan Gratis</li>
              <li>Hasta {premium?.maxPets ?? 10} mascotas registradas</li>
              {premiumExtras.map((feature) => (
                <li key={feature.key}>{feature.title}</li>
              ))}
            </ul>

            {userPlan === null ? (
              <Link href="/registro" className={styles.primaryButton}>
                Crea una cuenta para empezar
              </Link>
            ) : userIsPremium ? (
              <div className={styles.activeBox}>
                <span className={styles.currentTag}>Tu plan actual</span>
                <p>
                  {userPlan.status === "canceled"
                    ? `Cancelado: tienes Premium hasta el ${formatPlanDate(userPlan.endsAt)}.`
                    : `Se renueva el ${formatPlanDate(userPlan.endsAt)}.`}
                </p>
                <Link href="/cuenta">Administrar en Mi cuenta</Link>
              </div>
            ) : (
              <Link href="/planes/premium" className={styles.primaryButton}>
                Hazte Premium
              </Link>
            )}
          </section>
        </div>

        <section className={styles.compare}>
          <h2>Comparación completa</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Funcionalidad</th>
                  <th scope="col">Gratis</th>
                  <th scope="col">Premium</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((feature) => (
                  <tr key={feature.key}>
                    <th scope="row">
                      <strong>{feature.title}</strong>
                      <span>{feature.description}</span>
                    </th>
                    <td><FeatureValue value={feature.free} /></td>
                    <td><FeatureValue value={feature.premium} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>
            Proyecto académico: el pago de Premium es una simulación y no
            realiza cobros reales.
          </p>
        </section>
      </div>
    </main>
  );
}
