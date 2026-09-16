import Link from "next/link";
import styles from "./MascotaPerfil.module.css";

export default function MascotaPerfilPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <Link href="/mascotas" className={styles.back}>
            ← Mis mascotas
          </Link>

          <Link href="/mascotas/max/editar" className={styles.editButton}>
            Editar perfil
          </Link>
        </div>

        <section className={styles.profileHeader}>
          <div className={styles.petIcon}>🐶</div>

          <div>
            <span className={styles.species}>PERRO</span>
            <h1>Max</h1>
            <p>Labrador Retriever</p>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.card}>
            <h2>Información general</h2>

            <div className={styles.infoGrid}>
              <div>
                <span>Edad</span>
                <strong>4 años</strong>
              </div>

              <div>
                <span>Peso</span>
                <strong>22 kg</strong>
              </div>

              <div>
                <span>Sexo</span>
                <strong>Macho</strong>
              </div>

              <div>
                <span>Actividad</span>
                <strong>Alta</strong>
              </div>

              <div>
                <span>Condición corporal</span>
                <strong>Peso adecuado</strong>
              </div>

              <div>
                <span>Esterilizado</span>
                <strong>Sí</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h2>Necesidades especiales</h2>

            <div className={styles.specialItem}>
              <span>Alergias o restricciones</span>
              <strong>Pollo</strong>
            </div>

            <div className={styles.specialItem}>
              <span>Condición especial</span>
              <strong>Ninguna</strong>
            </div>

            <div className={styles.specialItem}>
              <span>Preferencia</span>
              <strong>Alimento seco</strong>
            </div>
          </section>
        </div>

        <section className={styles.recommendation}>
          <div>
            <span className={styles.recommendationLabel}>
              RECOMENDACIÓN PERSONALIZADA
            </span>

            <h2>Encuentra alimentos compatibles con Max</h2>

            <p>
              Analizaremos sus características para mostrar alternativas
              ordenadas por nivel de compatibilidad.
            </p>
          </div>

          <Link href="/comparar?mascota=max" className={styles.primaryButton}>
            Buscar alimentos compatibles
          </Link>
        </section>
      </div>
    </main>
  );
}