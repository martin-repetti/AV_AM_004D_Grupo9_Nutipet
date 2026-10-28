import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { addFavorite, getFavoriteFoodIds } from "@/services/favorites";

function unauthorized() {
  return NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 });
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  try {
    const foodIds = await getFavoriteFoodIds(pool, userId);
    return NextResponse.json({ foodIds });
  } catch (error) {
    console.error("Error obteniendo favoritos:", error);
    return NextResponse.json({ message: "No se pudieron cargar tus favoritos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  const foodId = Number(body?.foodId);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return NextResponse.json({ message: "Alimento inválido." }, { status: 400 });
  }

  try {
    const found = await addFavorite(pool, userId, foodId);
    if (!found) {
      return NextResponse.json({ message: "El alimento no existe." }, { status: 404 });
    }
    return NextResponse.json({ foodId }, { status: 201 });
  } catch (error) {
    console.error("Error guardando favorito:", error);
    return NextResponse.json({ message: "No se pudo guardar el favorito." }, { status: 500 });
  }
}
