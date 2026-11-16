"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Payment, UserPlan } from "@/services/plans";
import { formatPlanDate } from "@/utils/planDates";
import styles from "./Cuenta.module.css";

type SubscriptionCardProps = {
  plan: UserPlan;
  payments: Payment[];
};

export default function SubscriptionCard({ plan, payments }: SubscriptionCardProps) {
  const router = useRouter();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const premium = plan.code === "premium";

  const cancel = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/subscription", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "No se pudo cancelar la suscripción.");
        return;
      }
      setConfirmingCancel(false);
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.planHeader}>
        <h2>Tu plan</h2>
        <span className={premium ? styles.planPremium : styles.planFree}>Plan {plan.name}</span>
      </div>

      {!premium ? (
        <>
          <p className={styles.planText}>
            Puedes registrar hasta {plan.maxPets} mascotas y comparar {plan.maxCompare} alimentos a
            la vez. Con Premium sumas simulador de presupuesto, alertas de precio, historial de peso,
            seguimiento nutricional, reporte descargable y comparación avanzada.
          </p>
          <Link href="/planes" className={styles.planButton}>
            Ver planes
          </Link>
        </>
      ) : (
        <>
          <div className={styles.infoRow}>
            <span>Estado</span>
            <strong>{plan.status === "canceled" ? "Cancelado (sin renovación)" : "Activo"}</strong>
          </div>
          <div className={styles.infoRow}>
            <span>{plan.status === "canceled" ? "Premium hasta" : "Próxima renovación"}</span>
            <strong>{formatPlanDate(plan.endsAt)}</strong>
          </div>
          <div className={styles.infoRow}>
            <span>Valor</span>
            <strong>${plan.priceMonthly.toLocaleString("es-CL")} al mes</strong>
          </div>

          {plan.status === "canceled" ? (
            <Link href="/planes/premium" className={styles.planButton}>
              Reactivar Premium
            </Link>
          ) : !confirmingCancel ? (
            <button type="button" className={styles.planLinkButton} onClick={() => setConfirmingCancel(true)}>
              Cancelar suscripción
            </button>
          ) : (
            <div className={styles.cancelBox}>
              <p>
                Mantienes Premium hasta el {formatPlanDate(plan.endsAt)}. Después vuelves al plan
                Gratis: tus mascotas y registros se conservan, pero no podrás agregar más mascotas
                sobre el límite ni usar las funciones Premium.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setConfirmingCancel(false)}
                  disabled={busy}
                >
                  Mantener Premium
                </button>
                <button type="button" className={styles.deleteButton} onClick={cancel} disabled={busy}>
                  {busy ? "Cancelando…" : "Confirmar cancelación"}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {error && <p className={styles.errorText}>{error}</p>}

      {payments.length > 0 && (
        <div className={styles.payments}>
          <h3>Pagos</h3>
          <ul>
            {payments.map((payment) => (
              <li key={payment.id}>
                <span>{formatPlanDate(payment.paidAt)}</span>
                <span className={styles.paymentRef}>{payment.reference} · {payment.method}</span>
                <strong>${payment.amount.toLocaleString("es-CL")}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
