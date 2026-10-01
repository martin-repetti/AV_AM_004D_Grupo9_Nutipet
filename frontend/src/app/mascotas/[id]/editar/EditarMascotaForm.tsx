"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setFlashMessage } from "@/components/ui/FlashMessage";
// Reutiliza los mismos estilos que el formulario de "Agregar mascota":
// es visualmente el mismo formulario, solo que precargado y con PATCH.
import styles from "../../nueva/NuevaMascota.module.css";

type Breed = {
  id: number;
  name: string;
};

const OTHER_BREED = "Otra raza / No aparece en la lista";

type PetData = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  custom_breed: string | null;
  sex: string | null;
  birth_date: string | null;
  weight_kg: string | number | null;
  activity_level: string | null;
  body_condition: string | null;
  sterilized: boolean | null;
  food_preference: string | null;
  allergies: string | null;
  special_condition: string | null;
};

type EditarMascotaFormProps = {
  pet: PetData;
};

export default function EditarMascotaForm({ pet }: EditarMascotaFormProps) {
  const router = useRouter();

  const [species, setSpecies] = useState(pet.species);
  const [breed, setBreed] = useState(pet.breed || "");
  const [breeds, setBreeds] = useState<Breed[]>([]);

  const [loadingBreeds, setLoadingBreeds] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // En la primera carga no queremos perder la raza que ya tenía la
  // mascota mientras se cargan las opciones; solo se reinicia cuando el
  // usuario cambia la especie manualmente.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (!species) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBreeds([]);
      setBreed("");
      return;
    }

    const keepCurrentBreed = isFirstRun.current;
    isFirstRun.current = false;

    const loadBreeds = async () => {
      try {
        setLoadingBreeds(true);

        if (!keepCurrentBreed) {
          setBreed("");
        }

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
        breed === OTHER_BREED ? formData.get("customBreed") : null,
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
      const response = await fetch(`/api/pets/${pet.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(petData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo actualizar la mascota.");
        return;
      }

      router.push(`/mascotas/${pet.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error actualizando mascota:", error);

      setError(
        "No fue posible conectar con el servidor. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a ${pet.name}? Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/pets/${pet.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "No se pudo eliminar la mascota.");
        return;
      }

      setFlashMessage(`${pet.name} fue eliminada correctamente.`);
      router.push("/mascotas");
      router.refresh();
    } catch (error) {
      console.error("Error eliminando mascota:", error);

      setError(
        "No fue posible conectar con el servidor. Inténtalo nuevamente."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div>
            <span className={styles.eyebrow}>MASCOTAS</span>

            <h1>Editar mascota</h1>

            <p>Actualiza las características de {pet.name}.</p>
          </div>

          <Link href={`/mascotas/${pet.id}`} className={styles.backButton}>
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
                  defaultValue={pet.name}
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
                  <label htmlFor="customBreed">¿Cuál es la raza?</label>

                  <input
                    id="customBreed"
                    name="customBreed"
                    type="text"
                    maxLength={100}
                    placeholder="Ej: Toyger"
                    defaultValue={pet.custom_breed || ""}
                    required
                  />
                </div>
              )}

              <div className={styles.field}>
                <label htmlFor="sex">Sexo</label>

                <select id="sex" name="sex" defaultValue={pet.sex || ""}>
                  <option value="" disabled>
                    Selecciona
                  </option>

                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                  <option value="Desconocido">Desconocido</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="birthdate">Fecha de nacimiento</label>

                <input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  defaultValue={pet.birth_date || ""}
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
                    defaultValue={pet.weight_kg ?? ""}
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
                <label htmlFor="activity">Nivel de actividad</label>

                <select
                  id="activity"
                  name="activity"
                  defaultValue={pet.activity_level || ""}
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
                <label htmlFor="bodyCondition">Condición corporal</label>

                <select
                  id="bodyCondition"
                  name="bodyCondition"
                  defaultValue={pet.body_condition || ""}
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
                <label htmlFor="sterilized">Esterilización</label>

                <select
                  id="sterilized"
                  name="sterilized"
                  defaultValue={
                    pet.sterilized === true
                      ? "yes"
                      : pet.sterilized === false
                      ? "no"
                      : ""
                  }
                >
                  <option value="" disabled>
                    Selecciona
                  </option>

                  <option value="yes">Sí</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="foodType">Preferencia de alimento</label>

                <select
                  id="foodType"
                  name="foodType"
                  defaultValue={pet.food_preference || ""}
                >
                  <option value="">Sin preferencia</option>

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
                  defaultValue={pet.allergies || ""}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="condition">
                  Condición o necesidad especial
                </label>

                <select
                  id="condition"
                  name="condition"
                  defaultValue={pet.special_condition || ""}
                >
                  <option value="">Ninguna</option>

                  <option value="Sensibilidad digestiva">
                    Sensibilidad digestiva
                  </option>

                  <option value="Control de peso">Control de peso</option>

                  <option value="Piel y pelaje">Piel y pelaje</option>

                  <option value="Articulaciones">Articulaciones</option>

                  <option value="Cuidado urinario">Cuidado urinario</option>
                </select>
              </div>
            </div>

            <div className={styles.notice}>
              NutriPet entrega recomendaciones orientativas. En mascotas con
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
            </p>
          )}

          <div className={styles.actions}>
            <Link href={`/mascotas/${pet.id}`} className={styles.cancelButton}>
              Cancelar
            </Link>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading || loadingBreeds}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>

        <div className={styles.dangerZone}>
          <div>
            <h2>Eliminar mascota</h2>
            <p>
              Esta acción es permanente y no se puede deshacer.
            </p>
          </div>

          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Eliminando..." : "Eliminar mascota"}
          </button>
        </div>
      </div>
    </main>
  );
}
