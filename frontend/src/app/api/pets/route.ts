import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { validatePetInput } from "@/lib/petValidation";

export async function GET() {
  try {
    // 1. Obtener sesión
    const cookieStore = await cookies();
    const token = cookieStore.get("nutripet_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // 2. Verificar sesión
    const session = await verifySessionToken(token);
    const userId = Number(session.userId);

    if (!userId) {
      return NextResponse.json(
        { message: "Sesión inválida." },
        { status: 401 }
      );
    }

    // 3. Obtener solamente las mascotas del usuario conectado
    const result = await pool.query(
      `
        SELECT
          id,
          name,
          species,
          breed,
          custom_breed,
          sex,
          birth_date,
          weight_kg,
          activity_level,
          body_condition,
          sterilized,
          food_preference,
          allergies,
          special_condition,
          created_at,
          updated_at
        FROM pets
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
      `,
      [userId]
    );

    // 4. Preparar datos para el frontend
    const pets = result.rows.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,

      // Si indicó una raza personalizada mostramos esa.
      breed:
        pet.custom_breed ||
        pet.breed ||
        "Sin raza definida",

      breedType: pet.breed,
      customBreed: pet.custom_breed,

      sex: pet.sex,
      birthDate: pet.birth_date,
      weightKg:
        pet.weight_kg !== null
          ? Number(pet.weight_kg)
          : null,

      activityLevel: pet.activity_level,
      bodyCondition: pet.body_condition,
      sterilized: pet.sterilized,
      foodPreference: pet.food_preference,
      allergies: pet.allergies,
      specialCondition: pet.special_condition,
      createdAt: pet.created_at,
      updatedAt: pet.updated_at,
    }));

    return NextResponse.json({
      pets,
    });
  } catch (error) {
    console.error("Error obteniendo mascotas:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Obtener sesión
    const cookieStore = await cookies();
    const token = cookieStore.get("nutripet_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // 2. Verificar sesión y obtener usuario
    const session = await verifySessionToken(token);
    const userId = Number(session.userId);

    if (!userId) {
      return NextResponse.json(
        { message: "Sesión inválida." },
        { status: 401 }
      );
    }

    // 3. Validar y normalizar los datos enviados por el formulario
    const body = await request.json();
    const validation = await validatePetInput(pool, body);

    if ("error" in validation) {
      return NextResponse.json(
        { message: validation.error.message },
        { status: validation.error.status }
      );
    }

    const pet = validation.data;

    // 4. Comprobar cantidad actual de mascotas
    const petCountResult = await pool.query(
      `
        SELECT COUNT(*)::int AS total
        FROM pets
        WHERE user_id = $1
      `,
      [userId]
    );

    const totalPets = petCountResult.rows[0].total;

    // Por ahora todos usan el límite del plan gratuito.
    if (totalPets >= 2) {
      return NextResponse.json(
        {
          message:
            "El plan gratuito permite registrar hasta 2 mascotas.",
        },
        { status: 403 }
      );
    }

    // 5. Guardar mascota
    const result = await pool.query(
      `
        INSERT INTO pets (
          user_id,
          name,
          species,
          breed,
          custom_breed,
          sex,
          birth_date,
          weight_kg,
          activity_level,
          body_condition,
          sterilized,
          food_preference,
          allergies,
          special_condition
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14
        )
        RETURNING *
      `,
      [
        userId,
        pet.name,
        pet.species,
        pet.breed,
        pet.customBreed,
        pet.sex,
        pet.birthDate,
        pet.weightKg,
        pet.activityLevel,
        pet.bodyCondition,
        pet.sterilized,
        pet.foodPreference,
        pet.allergies,
        pet.specialCondition,
      ]
    );

    // 6. Respuesta correcta
    return NextResponse.json(
      {
        message: "Mascota registrada correctamente.",
        pet: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registrando mascota:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}