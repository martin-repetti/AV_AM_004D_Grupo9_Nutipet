import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("nutripet_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No hay una sesión activa." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        name: session.name,
        email: session.email,
      },
    });
  } catch (error) {
    console.error("Error verificando sesión:", error);

    return NextResponse.json(
      { message: "Sesión inválida o expirada." },
      { status: 401 }
    );
  }
}

/**
 * Elimina la cuenta del usuario autenticado y todos sus datos asociados
 * (mascotas, suscripción: ambas tienen ON DELETE CASCADE hacia users).
 * Pide la contraseña actual para confirmar: una sesión robada no basta
 * para borrar la cuenta sin probar que se conoce la contraseña.
 */
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("nutripet_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No hay una sesión activa." },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);
    const userId = Number(session.userId);

    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json(
        { message: "Ingresa tu contraseña para confirmar." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "La cuenta ya no existe." },
        { status: 404 }
      );
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      result.rows[0].password_hash
    );

    if (!passwordCorrect) {
      return NextResponse.json(
        { message: "Contraseña incorrecta." },
        { status: 401 }
      );
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    const response = NextResponse.json({
      message: "Cuenta eliminada correctamente.",
    });

    response.cookies.set("nutripet_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Error eliminando cuenta:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}