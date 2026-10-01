import type { Pool } from "pg";

export const OTHER_BREED = "Otra raza / No aparece en la lista";

// Normaliza una raza escrita manualmente.
// Ejemplos:
// "TOYGER" -> "Toyger"
// "  golden   retriever " -> "Golden Retriever"
function formatBreedName(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-CL")
    .replace(/(^|\s|-)\p{L}/gu, (letter) => letter.toLocaleUpperCase("es-CL"));
}

export type PetInput = {
  name?: string;
  species?: string;
  breed?: string;
  customBreed?: string | null;
  sex?: string | null;
  birthDate?: string | null;
  weightKg?: number | string | null;
  activityLevel?: string | null;
  bodyCondition?: string | null;
  sterilized?: boolean | null;
  foodPreference?: string | null;
  allergies?: string | null;
  specialCondition?: string | null;
};

export type NormalizedPet = {
  name: string;
  species: string;
  breed: string;
  customBreed: string | null;
  sex: string | null;
  birthDate: string | null;
  weightKg: number | null;
  activityLevel: string | null;
  bodyCondition: string | null;
  sterilized: boolean | null;
  foodPreference: string | null;
  allergies: string | null;
  specialCondition: string | null;
};

export type PetValidationResult =
  | { error: { message: string; status: number } }
  | { data: NormalizedPet };

/**
 * Valida y normaliza los datos de una mascota. Se usa tanto al crear
 * (POST /api/pets) como al editar (PATCH /api/pets/[id]) para no
 * duplicar las mismas reglas en ambos endpoints.
 */
export async function validatePetInput(
  pool: Pool,
  body: PetInput
): Promise<PetValidationResult> {
  const {
    name,
    species,
    breed,
    customBreed,
    sex,
    birthDate,
    weightKg,
    activityLevel,
    bodyCondition,
    sterilized,
    foodPreference,
    allergies,
    specialCondition,
  } = body;

  if (!name?.trim()) {
    return {
      error: { message: "El nombre de la mascota es obligatorio.", status: 400 },
    };
  }

  if (!species?.trim()) {
    return {
      error: { message: "Debes seleccionar una especie.", status: 400 },
    };
  }

  if (species !== "Gato" && species !== "Perro") {
    return {
      error: { message: "La especie seleccionada no es válida.", status: 400 },
    };
  }

  if (!breed?.trim()) {
    return {
      error: { message: "Debes seleccionar una raza.", status: 400 },
    };
  }

  // Verificar que la raza seleccionada exista para esa especie.
  const breedResult = await pool.query(
    `
      SELECT id, name
      FROM breeds
      WHERE species = $1
        AND name = $2
        AND active = TRUE
      LIMIT 1
    `,
    [species, breed]
  );

  if (breedResult.rowCount === 0) {
    return {
      error: { message: "La raza seleccionada no es válida.", status: 400 },
    };
  }

  // Usamos el nombre guardado en la BD.
  const selectedBreed = breedResult.rows[0].name;

  let formattedCustomBreed: string | null = null;

  if (selectedBreed === OTHER_BREED) {
    if (!customBreed?.trim()) {
      return {
        error: { message: "Debes escribir la raza de tu mascota.", status: 400 },
      };
    }

    formattedCustomBreed = formatBreedName(customBreed);

    if (formattedCustomBreed.length > 100) {
      return {
        error: {
          message: "La raza ingresada no puede superar los 100 caracteres.",
          status: 400,
        },
      };
    }
  }

  let normalizedWeight: number | null = null;

  if (weightKg !== null && weightKg !== undefined && weightKg !== "") {
    normalizedWeight = Number(weightKg);

    if (!Number.isFinite(normalizedWeight) || normalizedWeight <= 0) {
      return {
        error: { message: "El peso debe ser mayor que 0.", status: 400 },
      };
    }
  }

  return {
    data: {
      name: name.trim(),
      species,
      breed: selectedBreed,
      customBreed: formattedCustomBreed,
      sex: sex?.trim() || null,
      birthDate: birthDate || null,
      weightKg: normalizedWeight,
      activityLevel: activityLevel?.trim() || null,
      bodyCondition: bodyCondition?.trim() || null,
      sterilized: typeof sterilized === "boolean" ? sterilized : null,
      foodPreference: foodPreference?.trim() || null,
      allergies: allergies?.trim() || null,
      specialCondition: specialCondition?.trim() || null,
    },
  };
}
