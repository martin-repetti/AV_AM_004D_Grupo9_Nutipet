"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import styles from "./Registro.module.css";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "El nombre es obligatorio.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "El apellido es obligatorio.";
  }

  if (!values.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (values.password.length < 8) {
    errors.password = "Debe tener al menos 8 caracteres.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
}

export default function RegistroPage() {
  const router = useRouter();

  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange =
    (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Limpiar el error del campo cuando el usuario vuelve a escribir
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));

      setServerError("");
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);

    setErrors(validationErrors);
    setServerError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${values.firstName.trim()} ${values.lastName.trim()}`,
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(
          data.message || "No se pudo crear la cuenta."
        );
        return;
      }

      // Registro exitoso: redirige de inmediato al login, sin quedarse
      // en el formulario.
      router.push("/login");
    } catch (error) {
      console.error("Error registrando usuario:", error);

      setServerError(
        "No fue posible conectar con el servidor. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="Regístrate para guardar tus mascotas y alimentos favoritos."
    >
      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.row}>
          <div
            className={`${styles.field} ${
              errors.firstName ? styles.fieldError : ""
            }`}
          >
            <label htmlFor="firstName">Nombre</label>

            <input
              id="firstName"
              type="text"
              placeholder="Ej: Cristopher"
              value={values.firstName}
              onChange={handleChange("firstName")}
              disabled={loading}
            />

            {errors.firstName && (
              <p className={styles.errorText}>
                {errors.firstName}
              </p>
            )}
          </div>

          <div
            className={`${styles.field} ${
              errors.lastName ? styles.fieldError : ""
            }`}
          >
            <label htmlFor="lastName">Apellido</label>

            <input
              id="lastName"
              type="text"
              placeholder="Ej: Vial"
              value={values.lastName}
              onChange={handleChange("lastName")}
              disabled={loading}
            />

            {errors.lastName && (
              <p className={styles.errorText}>
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        <div
          className={`${styles.field} ${
            errors.email ? styles.fieldError : ""
          }`}
        >
          <label htmlFor="email">Correo electrónico</label>

          <input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            value={values.email}
            onChange={handleChange("email")}
            disabled={loading}
          />

          {errors.email && (
            <p className={styles.errorText}>
              {errors.email}
            </p>
          )}
        </div>

        <div
          className={`${styles.field} ${
            errors.password ? styles.fieldError : ""
          }`}
        >
          <label htmlFor="password">Contraseña</label>

          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange("password")}
              disabled={loading}
            />

            <button
              type="button"
              className={styles.eyeButton}
              aria-label="Mantén presionado para ver la contraseña"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              onTouchStart={() => setShowPassword(true)}
              onTouchEnd={() => setShowPassword(false)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {errors.password && (
            <p className={styles.errorText}>
              {errors.password}
            </p>
          )}
        </div>

        <div
          className={`${styles.field} ${
            errors.confirmPassword ? styles.fieldError : ""
          }`}
        >
          <label htmlFor="confirmPassword">
            Confirmar contraseña
          </label>

          <div className={styles.passwordField}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={handleChange("confirmPassword")}
              disabled={loading}
            />

            <button
              type="button"
              className={styles.eyeButton}
              aria-label="Mantén presionado para ver la contraseña"
              onMouseDown={() => setShowConfirmPassword(true)}
              onMouseUp={() => setShowConfirmPassword(false)}
              onMouseLeave={() => setShowConfirmPassword(false)}
              onTouchStart={() => setShowConfirmPassword(true)}
              onTouchEnd={() => setShowConfirmPassword(false)}
            >
              {showConfirmPassword ? "🙈" : "👁"}
            </button>
          </div>

          {errors.confirmPassword && (
            <p className={styles.errorText}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        {serverError && (
          <p className={styles.errorText}>
            {serverError}
          </p>
        )}
      </form>

      <p className={styles.footerText}>
        ¿Ya tienes cuenta?{" "}
        <Link href="/login">
          Iniciar sesión
        </Link>
      </p>
    </AuthCard>
  );
}