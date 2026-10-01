import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { validatePetInput } from "@/lib/petValidation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar el id de la mascota
    const { id } = await params;
    const petId = Number(id);

    if (!Number.isInteger(petId)) {
      return NextResponse.json(
        { message: "Identificador de mascota no válido." },
        { status: 400 }
      );
    }

    // 2. Obtener sesión
    const cookieStore = await cookies();
    const token = cookieStore.get("nutripet_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // 3. Verificar sesión y obtener usuario
    const session = await verifySessionToken(token);
    const userId = Number(session.userId);

    if (!userId) {
      return NextResponse.json(
        { message: "Sesión inválida." },
        { status: 401 }
      );
    }

    // 4. Validar y normalizar los datos enviados
    const body = await request.json();
    const validation = await validatePetInput(pool, body);

    if ("error" in validation) {
      return NextResponse.json(
        { message: validation.error.message },
        { status: validation.error.status }
      );
    }

    const pet = validation.data;

    // 5. Actualizar, pero solo si la mascota le pertenece al usuario
    const result = await pool.query(
      `
        UPDATE pets SET
          name = $1,
          species = $2,
          breed = $3,
          custom_breed = $4,
          sex = $5,
          birth_date = $6,
          weight_kg = $7,
          activity_level = $8,
          body_condition = $9,
          sterilized = $10,
          food_preference = $11,
          allergies = $12,
          special_condition = $13
        WHERE id = $14 AND user_id = $15
        RETURNING *
      `,
      [
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
        petId,
        userId,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Mascota no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Mascota actualizada correctamente.",
      pet: result.rows[0],
    });
  } catch (error) {
    console.error("Error actualizando mascota:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar el id de la mascota
    const { id } = await params;
    const petId = Number(id);

    if (!Number.isInteger(petId)) {
      return NextResponse.json(
        { message: "Identificador de mascota no válido." },
        { status: 400 }
      );
    }

    // 2. Obtener sesión
    const cookieStore = await cookies();
    const token = cookieStore.get("nutripet_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    // 3. Verificar sesión y obtener usuario
    const session = await verifySessionToken(token);
    const userId = Number(session.userId);

    if (!userId) {
      return NextResponse.json(
        { message: "Sesión inválida." },
        { status: 401 }
      );
    }

    // 4. Eliminar, pero solo si la mascota le pertenece al usuario
    const result = await pool.query(
      `
        DELETE FROM pets
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `,
      [petId, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "Mascota no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Mascota eliminada correctamente.",
    });
  } catch (error) {
    console.error("Error eliminando mascota:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
