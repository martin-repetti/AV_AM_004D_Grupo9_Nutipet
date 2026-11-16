"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setFlashMessage } from "@/components/ui/FlashMessage";
import styles from "./Checkout.module.css";

export default function ConfirmSubscription({ reactivating }: { reactivating: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/subscription", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "No se pudo completar la suscripción.");
        return;
      }
      setFlashMessage(reactivating ? "Reactivaste tu plan Premium." : "¡Listo! Ya tienes el plan Premium.");
      router.push("/cuenta");
      router.refresh();
    } catch {
      setError("No fue posible conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="button" className={styles.confirm} onClick={confirm} disabled={loading}>
        {loading
          ? "Procesando…"
          : reactivating
            ? "Reactivar Premium"
            : "Confirmar suscripción (simulada)"}
      </button>
    </>
  );
}
