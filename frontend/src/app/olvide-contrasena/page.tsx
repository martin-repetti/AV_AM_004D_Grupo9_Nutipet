"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import styles from "../login/Login.module.css";

export default function OlvideContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");
    setDevResetUrl(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo procesar la solicitud.");
        return;
      }

      setMessage(data.message);
      if (data.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch (err) {
      console.error("Error solicitando recuperación de contraseña:", err);
      setError("No fue posible conectar con el servidor. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo y te enviaremos instrucciones para crear una nueva."
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
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? "Enviando..." : "Enviar instrucciones"}
        </button>

        {message && <p className={styles.formNote}>{message}</p>}

        {devResetUrl && (
          <p className={styles.formNote}>
            Modo desarrollo (todavía no hay envío de correo configurado):{" "}
            <Link href={devResetUrl}>abrir enlace de recuperación</Link>
          </p>
        )}

        {error && <p className={styles.formNote}>{error}</p>}
      </form>

      <p className={styles.footerText}>
        <Link href="/login">Volver a iniciar sesión</Link>
      </p>
    </AuthCard>
  );
}
