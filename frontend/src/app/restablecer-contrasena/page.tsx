"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import { setFlashMessage } from "@/components/ui/FlashMessage";
import styles from "../login/Login.module.css";

function RestablecerContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("El enlace no es válido. Solicita uno nuevo.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo actualizar la contraseña.");
        return;
      }

      setFlashMessage("Contraseña actualizada. Ya puedes iniciar sesión.");
      router.push("/login");
    } catch (err) {
      console.error("Error restableciendo contraseña:", err);
      setError("No fue posible conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Crea una nueva contraseña"
      subtitle="Elige una contraseña nueva para tu cuenta."
    >
      {!token && (
        <p className={styles.formNote}>
          Este enlace no tiene un token válido. Pide uno nuevo desde{" "}
          <Link href="/olvide-contrasena">recuperar contraseña</Link>.
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="password">Nueva contraseña</label>

          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="confirmPassword">Confirmar contraseña</label>

          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading || !token}
        >
          {loading ? "Guardando..." : "Guardar nueva contraseña"}
        </button>

        {error && <p className={styles.formNote}>{error}</p>}
      </form>

      <p className={styles.footerText}>
        <Link href="/login">Volver a iniciar sesión</Link>
      </p>
    </AuthCard>
  );
}

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={null}>
      <RestablecerContrasenaForm />
    </Suspense>
  );
}
