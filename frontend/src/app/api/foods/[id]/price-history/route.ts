import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getPriceHistory } from "@/services/priceHistory";

// Público: el historial de precios también se puede ver sin cuenta.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const foodId = Number((await params).id);
  if (!Number.isInteger(foodId) || foodId <= 0) {
    return NextResponse.json({ message: "Alimento inválido." }, { status: 400 });
  }

  try {
    const records = await getPriceHistory(pool, foodId);
    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error obteniendo historial de precios:", error);
    return NextResponse.json({ message: "No se pudo cargar el historial." }, { status: 500 });
  }
}
