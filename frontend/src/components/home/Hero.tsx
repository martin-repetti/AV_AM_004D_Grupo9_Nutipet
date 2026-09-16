import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>
            Compara y elige el mejor alimento para{" "}
            <span>tu mascota</span>
          </h1>

          <p>
            Información clara, actualizada y confiable para cuidar su salud
            y tu presupuesto.
          </p>

          <div className={styles.actions}>
            <Link href="/comparar" className={styles.primaryButton}>
              Comparar alimentos
            </Link>

            <Link href="/mascotas" className={styles.secondaryButton}>
              Mis mascotas
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.visualPlaceholder}>
            🐶 🐱
          </div>
        </div>
      </div>
    </section>
  );
}