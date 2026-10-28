import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { searchFoods } from "@/services/priceHistory";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json({ foods: [] });

  try {
    const foods = await searchFoods(pool, query.slice(0, 100));
    return NextResponse.json({ foods });
  } catch (error) {
    console.error("Error buscando alimentos:", error);
    return NextResponse.json({ message: "No se pudo buscar." }, { status: 500 });
  }
}
