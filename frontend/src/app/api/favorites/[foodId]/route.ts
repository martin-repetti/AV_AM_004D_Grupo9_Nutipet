import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { removeFavorite } from "@/services/favorites";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ foodId: string }> }
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 });
  }

  const foodId = Number((await params).foodId);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return NextResponse.json({ message: "Alimento inválido." }, { status: 400 });
  }

  try {
    await removeFavorite(pool, userId, foodId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error quitando favorito:", error);
    return NextResponse.json({ message: "No se pudo quitar el favorito." }, { status: 500 });
  }
}
