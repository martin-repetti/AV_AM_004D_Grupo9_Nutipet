import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getUserPlan, isPremium } from "@/services/plans";
import { ownsPet } from "@/services/petTracking";

type Guarded = { ok: true; userId: number } | { ok: false; response: NextResponse };

/**
 * Para rutas de API de funciones Premium sobre una mascota: exige sesión,
 * que la mascota sea del usuario (404 si no, para no revelar que existe)
 * y plan Premium vigente.
 */
export async function requirePremiumPetOwner(petId: number): Promise<Guarded> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, response: NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 }) };
  }
  if (!Number.isInteger(petId) || petId <= 0 || !(await ownsPet(pool, petId, userId))) {
    return { ok: false, response: NextResponse.json({ message: "Mascota no encontrada." }, { status: 404 }) };
  }
  if (!isPremium(await getUserPlan(pool, userId))) {
    return {
      ok: false,
      response: NextResponse.json(
        { message: "Esta función es parte del plan Premium.", upgradeUrl: "/planes" },
        { status: 403 }
      ),
    };
  }
  return { ok: true, userId };
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Fecha "YYYY-MM-DD" válida y no futura (hora de Chile). */
export function parsePastDate(value: unknown): string | null {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  return value <= today ? value : null;
}

export function parseNote(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const note = value.trim().slice(0, 200);
  return note || null;
}
