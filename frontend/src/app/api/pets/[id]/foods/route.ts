import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { parseNote, parsePastDate, requirePremiumPetOwner } from "@/lib/premiumGuard";
import { addFoodLog } from "@/services/petTracking";

/** Registra desde cuándo la mascota come un alimento (Premium). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const petId = Number((await params).id);
  const guard = await requirePremiumPetOwner(petId);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const foodId = body?.foodId == null || body.foodId === "" ? null : Number(body.foodId);
  const foodName = typeof body?.foodName === "string" ? body.foodName : "";
  const startedOn = parsePastDate(body?.startedOn);

  if (foodId !== null && (!Number.isInteger(foodId) || foodId <= 0)) {
    return NextResponse.json({ message: "Alimento inválido." }, { status: 400 });
  }
  if (foodId === null && !foodName.trim()) {
    return NextResponse.json({ message: "Elige un alimento o escribe su nombre." }, { status: 400 });
  }
  if (!startedOn) {
    return NextResponse.json({ message: "Ingresa una fecha válida que no sea futura." }, { status: 400 });
  }

  try {
    const saved = await addFoodLog(pool, petId, { foodId, foodName, startedOn, note: parseNote(body?.note) });
    if (!saved) return NextResponse.json({ message: "El alimento no existe." }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Error registrando cambio de alimento:", error);
    return NextResponse.json({ message: "No se pudo registrar el cambio de alimento." }, { status: 500 });
  }
}
