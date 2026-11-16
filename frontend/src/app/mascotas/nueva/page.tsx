"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./NuevaMascota.module.css";

type Breed = {
  id: number;
  name: string;
};

const OTHER_BREED = "Otra raza / No aparece en la lista";

export default function NuevaMascotaPage() {
  const router = useRouter();

  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [breeds, setBreeds] = useState<Breed[]>([]);

  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Si el plan no permite más mascotas, el error ofrece pasarse a Premium.
  const [upgradeUrl, setUpgradeUrl] = useState<string | null>(null);

  // Cargar razas cuando cambia la especie
  useEffect(() => {
    if (!species) {
      // Reinicio de estado derivado al cambiar la especie, no una
      // sincronización en cascada.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBreeds([]);
      setBreed("");
      return;
    }

    const loadBreeds = async () => {
      try {
        setLoadingBreeds(true);
        setBreed("");
        setError("");

        const response = await fetch(
          `/api/breeds?species=${encodeURIComponent(species)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "No se pudieron cargar las razas.");
          setBreeds([]);
          return;
        }

        setBreeds(data.breeds);
      } catch (error) {
        console.error("Error cargando razas:", error);
        setError("No se pudieron cargar las razas.");
        setBreeds([]);
      } finally {
        setLoadingBreeds(false);
      }
    };

    loadBreeds();
  }, [species]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const weightValue = formData.get("weight") as string;

    const petData = {
      name: formData.get("name"),
      species,
      breed,
      customBreed:
        breed === OTHER_BREED
          ? formData.get("customBreed")
          : null,
      sex: formData.get("sex"),
      birthDate: formData.get("birthdate"),
      weightKg: weightValue ? Number(weightValue) : null,
      activityLevel: formData.get("activity"),
      bodyCondition: formData.get("bodyCondition"),

      sterilized:
        formData.get("sterilized") === "yes"
          ? true
          : formData.get("sterilized") === "no"
          ? false
          : null,

      foodPreference: formData.get("foodType"),
      allergies: formData.get("allergies"),
      specialCondition: formData.get("condition"),
    };

    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo registrar la mascota.");
        setUpgradeUrl(data.upgradeUrl ?? null);
        return;
      }

      router.push("/mascotas");
      router.refresh();
    } catch (error) {
      console.error("Error registrando mascota:", error);

      setError(
        "No fue posible conectar con el servidor. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

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

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* INFORMACIÓN BÁSICA */}

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
                  name="name"
                  type="text"
                  placeholder="Ej: Max"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="species">Especie</label>

                <select
                  id="species"
                  name="species"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecciona una especie
                  </option>

                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
                </select>
              </div>

              {/* RAZA */}

              <div className={styles.field}>
                <label htmlFor="breed">Raza</label>

                <select
                  id="breed"
                  name="breed"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  disabled={!species || loadingBreeds}
                  required
                >
                  <option value="" disabled>
                    {!species
                      ? "Primero selecciona una especie"
                      : loadingBreeds
                      ? "Cargando razas..."
                      : "Selecciona una raza"}
                  </option>

                  {breeds.map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* OTRA RAZA */}

              {breed === OTHER_BREED && (
                <div className={styles.field}>
                  <label htmlFor="customBreed">
                    ¿Cuál es la raza?
                  </label>

                  <input
                    id="customBreed"
                    name="customBreed"
                    type="text"
                    maxLength={100}
                    placeholder="Ej: Toyger"
                    required
                  />
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="sex">Sexo</label>

                <select id="sex" name="sex" defaultValue="">
                  <option value="" disabled>
                    Selecciona
                  </option>

                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                  <option value="Desconocido">Desconocido</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="birthdate">
                  Fecha de nacimiento
                </label>

                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="weight">Peso actual</label>

                <div className={styles.inputWithUnit}>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0.1"
                    step="0.1"
                    placeholder="Ej: 22"
                  />

                  <span>kg</span>
                </div>
              </div>
            </div>
          </section>

          {/* ACTIVIDAD */}

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
                <label htmlFor="activity">
                  Nivel de actividad
                </label>

                <select
                  id="activity"
                  name="activity"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona
                  </option>

                  <option value="Baja">Baja</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="bodyCondition">
                  Condición corporal
                </label>

                <select
                  id="bodyCondition"
                  name="bodyCondition"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona
                  </option>

                  <option value="Bajo peso">Bajo peso</option>
                  <option value="Peso adecuado">Peso adecuado</option>
                  <option value="Sobrepeso">Sobrepeso</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="sterilized">
                  Esterilización
                </label>

                <select
                  id="sterilized"
                  name="sterilized"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona
                  </option>

                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="foodType">
                  Preferencia de alimento
                </label>

                <select
                  id="foodType"
                  name="foodType"
                  defaultValue=""
                >
                  <option value="">
                    Sin preferencia
                  </option>

                  <option value="Seco">Seco</option>
                  <option value="Húmedo">Húmedo</option>
                  <option value="Mixto">Mixto</option>
                </select>
              </div>
            </div>
          </section>

          {/* NECESIDADES ESPECIALES */}

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
                  name="allergies"
                  type="text"
                  placeholder="Ej: pollo, trigo"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="condition">
                  Condición o necesidad especial
                </label>

                <select
                  id="condition"
                  name="condition"
                  defaultValue=""
                >
                  <option value="">Ninguna</option>

                  <option value="Sensibilidad digestiva">
                    Sensibilidad digestiva
                  </option>

                  <option value="Control de peso">
                    Control de peso
                  </option>

                  <option value="Piel y pelaje">
                    Piel y pelaje
                  </option>

                  <option value="Articulaciones">
                    Articulaciones
                  </option>

                  <option value="Cuidado urinario">
                    Cuidado urinario
                  </option>
                </select>
              </div>
            </div>

            <div className={styles.notice}>
              HuellaFit entrega recomendaciones orientativas. En mascotas con
              condiciones clínicas, la alimentación debe ser revisada con un
              médico veterinario.
            </div>
          </section>

          {error && (
            <p
              style={{
                color: "crimson",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              {error}
              {upgradeUrl && (
                <>
                  {" "}
                  <Link href={upgradeUrl}>Ver planes</Link>
                </>
              )}
            </p>
          )}

          <div className={styles.actions}>
            <Link
              href="/mascotas"
              className={styles.cancelButton}
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading || loadingBreeds}
            >
              {loading ? "Guardando..." : "Guardar mascota"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}