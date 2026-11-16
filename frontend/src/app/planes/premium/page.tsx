import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { BILLING_DAYS, getPlans, getUserPlan, isPremium } from "@/services/plans";
import { PLAN_FEATURES } from "@/utils/planFeatures";
import ConfirmSubscription from "./ConfirmSubscription";
import styles from "./Checkout.module.css";

export const metadata: Metadata = { title: "Hazte Premium" };

export default async function PremiumCheckoutPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const [plans, userPlan] = await Promise.all([getPlans(pool), getUserPlan(pool, userId)]);
  // Con Premium vigente y renovándose no hay nada que pagar.
  if (isPremium(userPlan) && userPlan.status === "active") redirect("/cuenta");

  const premium = plans.find((plan) => plan.code === "premium");
  if (!premium) redirect("/planes");
  const reactivating = isPremium(userPlan) && userPlan.status === "canceled";
  const extras = PLAN_FEATURES.filter((feature) => feature.free !== true);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/planes" className={styles.back}>
          ← Volver a planes
        </Link>

        <div className={styles.grid}>
          <section className={styles.summary}>
            <span className={styles.eyebrow}>Resumen</span>
            <h1>Plan {premium.name}</h1>
            <ul>
              {extras.map((feature) => (
                <li key={feature.key}>
                  <strong>{feature.title}</strong>
                  <span>{feature.description}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.payment}>
            <h2>{reactivating ? "Reactivar suscripción" : "Pago"}</h2>

            <dl className={styles.lines}>
              <div>
                <dt>Plan {premium.name} · {BILLING_DAYS} días</dt>
                <dd>${premium.priceMonthly.toLocaleString("es-CL")}</dd>
              </div>
              <div className={styles.total}>
                <dt>Total {reactivating ? "hoy" : ""}</dt>
                <dd>{reactivating ? "$0" : `$${premium.priceMonthly.toLocaleString("es-CL")}`}</dd>
              </div>
            </dl>

            <p className={styles.simulated}>
              <strong>Pago de demostración.</strong> HuellaFit es un proyecto
              académico: al confirmar no se realiza ningún cobro ni se piden
              datos de tarjeta. Se registra la suscripción como si el pago se
              hubiera aprobado.
            </p>

            <ConfirmSubscription reactivating={reactivating} />

            <p className={styles.fineprint}>
              Puedes cancelar cuando quieras desde Mi cuenta. Si cancelas,
              mantienes Premium hasta el fin del periodo.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
