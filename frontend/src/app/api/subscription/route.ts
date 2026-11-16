import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import {
  cancelSubscription,
  getUserPlan,
  subscribeToPremium,
  SubscriptionError,
} from "@/services/plans";

function unauthorized() {
  return NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 });
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  try {
    return NextResponse.json({ plan: await getUserPlan(pool, userId) });
  } catch (error) {
    console.error("Error obteniendo el plan:", error);
    return NextResponse.json({ message: "No se pudo obtener tu plan." }, { status: 500 });
  }
}

/** Pasa a Premium con un pago simulado (no hay cobro real). */
export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  try {
    const plan = await subscribeToPremium(pool, userId);
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    if (error instanceof SubscriptionError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("Error suscribiendo a Premium:", error);
    return NextResponse.json({ message: "No se pudo completar la suscripción." }, { status: 500 });
  }
}

/** Cancela la renovación: Premium sigue hasta el fin del periodo pagado. */
export async function DELETE() {
  const userId = await getSessionUserId();
  if (!userId) return unauthorized();

  try {
    return NextResponse.json({ plan: await cancelSubscription(pool, userId) });
  } catch (error) {
    if (error instanceof SubscriptionError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("Error cancelando la suscripción:", error);
    return NextResponse.json({ message: "No se pudo cancelar la suscripción." }, { status: 500 });
  }
}
