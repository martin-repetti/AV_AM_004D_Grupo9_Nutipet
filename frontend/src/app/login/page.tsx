"use client";
import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import styles from "./Login.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // MOCK: aquí se conectará la llamada real de autenticación al backend
    // (NestJS). Por ahora solo se simula el envío del formulario.
    console.log("Login mock submit", { email, password, remember });
    setSubmitted(true);
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
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Contraseña</label>
          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles.toggleButton}
              onClick={() => setShowPassword((prev) => !prev)}
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
            />
            Recordarme
          </label>

          <Link href="#" className={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button type="submit" className={styles.submitButton}>
          Iniciar sesión
        </button>

        {submitted && (
          <p className={styles.formNote}>
            Inicio de sesión simulado: aún no hay backend conectado.
          </p>
        )}
      </form>

      <p className={styles.footerText}>
        ¿No tienes cuenta? <Link href="/registro">Crear cuenta</Link>
      </p>
    </AuthCard>
  );
}
