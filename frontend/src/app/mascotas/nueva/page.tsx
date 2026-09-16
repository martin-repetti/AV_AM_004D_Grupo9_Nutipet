import Link from "next/link";
import styles from "./NuevaMascota.module.css";

export default function NuevaMascotaPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <span className={styles.eyebrow}>MASCOTAS</span>
            <h1>Agregar mascota</h1>
            <p>
              Registra sus características para obtener recomendaciones más
              precisas.
            </p>
          </div>

          <Link href="/mascotas" className={styles.backButton}>
            ← Volver
          </Link>
        </div>

        <form className={styles.form}>
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.icon}>🐾</div>

              <div>
                <h2>Información básica</h2>
                <p>Datos principales de tu mascota.</p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ej: Max"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="species">Especie</label>
                <select id="species" defaultValue="">
                  <option value="" disabled>
                    Selecciona una especie
                  </option>
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="breed">Raza</label>
                <input
                  id="breed"
                  type="text"
                  placeholder="Ej: Labrador Retriever"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="sex">Sexo</label>
                <select id="sex" defaultValue="">
                  <option value="" disabled>
                    Selecciona
                  </option>
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                  <option value="unknown">Desconocido</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="birthdate">Fecha de nacimiento</label>
                <input id="birthdate" type="date" />
              </div>

              <div className={styles.field}>
                <label htmlFor="weight">Peso actual</label>

                <div className={styles.inputWithUnit}>
                  <input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ej: 22"
                  />

                  <span>kg</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.icon}>⚡</div>

              <div>
                <h2>Actividad y condición</h2>
                <p>
                  Esta información ayudará a calcular alimentos más adecuados.
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="activity">Nivel de actividad</label>

                <select id="activity" defaultValue="">
                  <option value="" disabled>
                    Selecciona
                  </option>
                  <option value="low">Baja</option>
                  <option value="medium">Moderada</option>
                  <option value="high">Alta</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="bodyCondition">
                  Condición corporal
                </label>

                <select id="bodyCondition" defaultValue="">
                  <option value="" disabled>
                    Selecciona
                  </option>
                  <option value="low">Bajo peso</option>
                  <option value="normal">Peso adecuado</option>
                  <option value="overweight">Sobrepeso</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="sterilized">Esterilización</label>

                <select id="sterilized" defaultValue="">
                  <option value="" disabled>
                    Selecciona
                  </option>
                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="foodType">Preferencia de alimento</label>

                <select id="foodType" defaultValue="">
                  <option value="" disabled>
                    Sin preferencia
                  </option>
                  <option value="dry">Seco</option>
                  <option value="wet">Húmedo</option>
                  <option value="mixed">Mixto</option>
                </select>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div className={styles.icon}>🩺</div>

              <div>
                <h2>Necesidades especiales</h2>
                <p>
                  Agrega información relevante para descartar alimentos
                  incompatibles.
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label htmlFor="allergies">
                  Alergias o ingredientes restringidos
                </label>

                <input
                  id="allergies"
                  type="text"
                  placeholder="Ej: pollo, trigo"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="condition">
                  Condición o necesidad especial
                </label>

                <select id="condition" defaultValue="">
                  <option value="" disabled>
                    Ninguna
                  </option>
                  <option value="digestive">Sensibilidad digestiva</option>
                  <option value="weight-control">
                    Control de peso
                  </option>
                  <option value="skin">Piel y pelaje</option>
                  <option value="joints">Articulaciones</option>
                  <option value="urinary">Cuidado urinario</option>
                </select>
              </div>
            </div>

            <div className={styles.notice}>
              NutriPet entrega recomendaciones orientativas. En mascotas con
              condiciones clínicas, la alimentación debe ser revisada con un
              médico veterinario.
            </div>
          </section>

          <div className={styles.actions}>
            <Link href="/mascotas" className={styles.cancelButton}>
              Cancelar
            </Link>

            <button type="submit" className={styles.saveButton}>
              Guardar mascota
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}