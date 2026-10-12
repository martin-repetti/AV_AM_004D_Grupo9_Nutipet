import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token?.trim();
    const password = body.password;

    if (!token) {
      return NextResponse.json(
        { message: "Falta el token de recuperación." },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT id, reset_token_expires_at FROM users WHERE reset_token = $1 LIMIT 1",
      [token]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { message: "El enlace de recuperación no es válido." },
        { status: 400 }
      );
    }

    const user = result.rows[0];

    if (
      !user.reset_token_expires_at ||
      new Date(user.reset_token_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { message: "El enlace de recuperación expiró. Solicita uno nuevo." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `
        UPDATE users
        SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL
        WHERE id = $2
      `,
      [passwordHash, user.id]
    );

    return NextResponse.json({
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error restableciendo contraseña:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
