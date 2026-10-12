import { NextResponse } from "next/server";
import crypto from "crypto";
import pool from "@/lib/db";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { message: "Ingresa tu correo." },
        { status: 400 }
      );
    }

    // Respuesta genérica siempre: no revelamos si el correo está
    // registrado o no.
    const genericResponse = {
      message:
        "Si el correo está registrado, te enviaremos instrucciones para recuperar tu contraseña.",
    };

    const result = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1",
      [email]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(genericResponse);
    }

    const userId = result.rows[0].id;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3",
      [token, expiresAt, userId]
    );

    const devResetUrl = `/restablecer-contrasena?token=${token}`;

    // MOCK: todavía no hay un servicio de correo configurado (SMTP,
    // Resend, etc.). Mientras tanto devolvemos el link directamente,
    // SOLO fuera de producción, para poder probar el flujo completo.
    // Reemplazar por el envío real de correo cuando exista el servicio.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ ...genericResponse, devResetUrl });
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("Error solicitando recuperación de contraseña:", error);

    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
