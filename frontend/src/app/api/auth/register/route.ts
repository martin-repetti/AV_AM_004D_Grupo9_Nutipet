import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Validar campos obligatorios
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nombre, correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    // Validación mínima de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el correo ya está registrado
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: "El correo ya está registrado" },
        { status: 409 }
      );
    }

    // Nunca guardamos la contraseña original
    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    return NextResponse.json(
      {
        message: "Usuario registrado correctamente",
        user: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registrando usuario:", error);

    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}