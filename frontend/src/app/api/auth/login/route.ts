import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const remember = body.remember === true;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Correo y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
        SELECT id, name, email, password_hash
        FROM users
        WHERE LOWER(email) = $1
        LIMIT 1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        { message: "Correo o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: Number(user.id),
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: "Inicio de sesión correcto.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 200 }
    );

    response.cookies.set("nutripet_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",

      // Si marca "Recordarme", dura 7 días.
      // Si no, será una cookie de sesión del navegador.
      ...(remember ? { maxAge: 60 * 60 * 24 * 7 } : {}),
    });

    return response;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}