import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { parseNote, parsePastDate, requirePremiumPetOwner } from "@/lib/premiumGuard";
import { saveWeightLog } from "@/services/petTracking";

/** Registra el peso de la mascota en una fecha (Premium). */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const petId = Number((await params).id);
  const guard = await requirePremiumPetOwner(petId);
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const weightKg = Number(body?.weightKg);
  const recordedOn = parsePastDate(body?.recordedOn);

  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 150) {
    return NextResponse.json({ message: "Ingresa un peso válido en kg (entre 0,1 y 150)." }, { status: 400 });
  }
  if (!recordedOn) {
    return NextResponse.json({ message: "Ingresa una fecha válida que no sea futura." }, { status: 400 });
  }

  try {
    await saveWeightLog(pool, petId, {
      weightKg: Math.round(weightKg * 100) / 100,
      recordedOn,
      note: parseNote(body?.note),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Error registrando peso:", error);
    return NextResponse.json({ message: "No se pudo registrar el peso." }, { status: 500 });
  }
}
