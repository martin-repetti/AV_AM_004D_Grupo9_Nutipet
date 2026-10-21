"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setFlashMessage } from "@/components/ui/FlashMessage";
import styles from "./Cuenta.module.css";

type CuentaClientProps = {
  user: { name: string; email: string };
};

export default function CuentaClient({ user }: CuentaClientProps) {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDeleting(true);

    try {
      const response = await fetch("/api/auth/me", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo eliminar la cuenta.");
        return;
      }

      setFlashMessage("Tu cuenta y tus datos fueron eliminados.");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error eliminando cuenta:", error);
      setError("No fue posible conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <span className={styles.eyebrow}>CUENTA</span>
          <h1>Mi cuenta</h1>
        </div>

        <section className={styles.card}>
          <h2>Tus datos</h2>

          <div className={styles.infoRow}>
            <span>Nombre</span>
            <strong>{user.name}</strong>
          </div>

          <div className={styles.infoRow}>
            <span>Correo</span>
            <strong>{user.email}</strong>
          </div>
        </section>

        <section className={styles.dangerZone}>
          <div className={styles.dangerHeader}>
            <h2>Eliminar cuenta</h2>
            <p>
              Esto borra tu cuenta, tus mascotas y todos los datos
              asociados de forma permanente. No se puede deshacer.
            </p>
          </div>

          {!confirming ? (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => setConfirming(true)}
            >
              Eliminar mi cuenta
            </button>
          ) : (
            <form className={styles.confirmForm} onSubmit={handleDelete}>
              <label htmlFor="deletePassword">
                Ingresa tu contraseña para confirmar
              </label>

              <input
                id="deletePassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                required
              />

              {error && <p className={styles.errorText}>{error}</p>}

              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setConfirming(false);
                    setPassword("");
                    setError("");
                  }}
                  disabled={deleting}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles.deleteButton}
                  disabled={deleting}
                >
                  {deleting ? "Eliminando..." : "Confirmar eliminación"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
