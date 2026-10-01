import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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