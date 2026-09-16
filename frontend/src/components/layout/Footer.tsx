import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandIcon}>🐾</span>
              <span>NutriPet</span>
            </Link>

            <p>
              Compara alimentos, revisa información nutricional y encuentra
              alternativas compatibles con las necesidades de tu mascota.
            </p>
          </div>

          <div className={styles.linksGroup}>
            <h3>Plataforma</h3>

            <Link href="/comparar">Comparar alimentos</Link>
            <Link href="/mascotas">Mis mascotas</Link>
            <Link href="/favoritos">Favoritos</Link>
            <Link href="/historial-precios">Historial de precios</Link>
          </div>

          <div className={styles.linksGroup}>
            <h3>Cuenta</h3>

            <Link href="/login">Iniciar sesión</Link>
            <Link href="/registro">Crear cuenta</Link>
          </div>

          <div className={styles.linksGroup}>
            <h3>Información</h3>

            <Link href="/sobre-nutripet">Sobre NutriPet</Link>
            <Link href="/terminos">Términos y condiciones</Link>
            <Link href="/privacidad">Privacidad</Link>
          </div>
        </div>

        <div className={styles.disclaimer}>
          <strong>Importante:</strong> NutriPet entrega información orientativa
          para apoyar la elección de alimentos. No reemplaza la evaluación ni
          las recomendaciones de un médico veterinario.
        </div>

        <div className={styles.bottom}>
          <span>© 2026 NutriPet. Todos los derechos reservados.</span>

          <span>Proyecto académico</span>
        </div>
      </div>
    </footer>
  );
}