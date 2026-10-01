import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const species = searchParams.get("species");

    if (!species) {
      return NextResponse.json(
        { message: "Debes indicar una especie." },
        { status: 400 }
      );
    }

    if (species !== "Gato" && species !== "Perro") {
      return NextResponse.json(
        { message: "Especie no válida." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        SELECT id, name
        FROM breeds
        WHERE species = $1
          AND active = TRUE
        ORDER BY
          CASE
            WHEN name = 'Mestizo / Sin raza definida' THEN 1
            WHEN name = 'No sé la raza' THEN 2
            WHEN name = 'Otra raza / No aparece en la lista' THEN 3
            ELSE 4
          END,
          name ASC
      `,
      [species]
    );

    return NextResponse.json({
      species,
      breeds: result.rows,
    });
  } catch (error) {
    console.error("Error obteniendo razas:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}