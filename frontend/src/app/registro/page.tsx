"use client";
import { useState } from "react";
import Link from "next/link";
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

  if (!values.firstName.trim()) errors.firstName = "El nombre es obligatorio.";
  if (!values.lastName.trim()) errors.lastName = "El apellido es obligatorio.";

  if (!values.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (values.password.length < 6) {
    errors.password = "Debe tener al menos 6 caracteres.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
}

export default function RegistroPage() {
  const [values, setValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const handleChange =
    (field: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    setSuccess(false);

    if (Object.keys(validationErrors).length === 0) {
      // MOCK: aquí se conectará la creación real de cuenta en el backend
      // (NestJS). Por ahora no se almacena ningún usuario.
      console.log("Registro mock submit", values);
      setSuccess(true);
    }
  };

  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="Regístrate para guardar tus mascotas y alimentos favoritos."
    >
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.row}>
          <div className={`${styles.field} ${errors.firstName ? styles.fieldError : ""}`}>
            <label htmlFor="firstName">Nombre</label>
            <input
              id="firstName"
              type="text"
              placeholder="Ej: Cristopher"
              value={values.firstName}
              onChange={handleChange("firstName")}
            />
            {errors.firstName && (
              <p className={styles.errorText}>{errors.firstName}</p>
            )}
          </div>

          <div className={`${styles.field} ${errors.lastName ? styles.fieldError : ""}`}>
            <label htmlFor="lastName">Apellido</label>
            <input
              id="lastName"
              type="text"
              placeholder="Ej: Vial"
              value={values.lastName}
              onChange={handleChange("lastName")}
            />
            {errors.lastName && (
              <p className={styles.errorText}>{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className={`${styles.field} ${errors.email ? styles.fieldError : ""}`}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="tu@correo.com"
            value={values.email}
            onChange={handleChange("email")}
          />
          {errors.email && <p className={styles.errorText}>{errors.email}</p>}
        </div>

        <div className={`${styles.field} ${errors.password ? styles.fieldError : ""}`}>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange("password")}
          />
          {errors.password && (
            <p className={styles.errorText}>{errors.password}</p>
          )}
        </div>

        <div
          className={`${styles.field} ${
            errors.confirmPassword ? styles.fieldError : ""
          }`}
        >
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={values.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className={styles.errorText}>{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>
          Crear cuenta
        </button>

        {success && (
          <p className={styles.successNote}>
            Cuenta creada correctamente (simulado). Ya puedes iniciar sesión.
          </p>
        )}
      </form>

      <p className={styles.footerText}>
        ¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link>
      </p>
    </AuthCard>
  );
}
