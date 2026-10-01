"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          remember,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo iniciar sesión.");
        return;
      }

      // Login correcto.
      // La cookie HttpOnly ya fue creada por /api/auth/login.
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error iniciando sesión:", error);

      setError(
        "No fue posible conectar con el servidor. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Inicia sesión"
      subtitle="Accede a tu cuenta para gestionar tus mascotas y favoritos."
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="email">Correo electrónico</label>

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Contraseña</label>

          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
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

        <div className={styles.optionsRow}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
            />
            Recordarme
          </label>

          <Link href="#" className={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>

        {error && (
          <p className={styles.formNote}>
            {error}
          </p>
        )}
      </form>

      <p className={styles.footerText}>
        ¿No tienes cuenta?{" "}
        <Link href="/registro">
          Crear cuenta
        </Link>
      </p>
    </AuthCard>
  );
}