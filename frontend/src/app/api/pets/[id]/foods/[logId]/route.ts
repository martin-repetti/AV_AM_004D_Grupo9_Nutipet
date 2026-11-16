import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requirePremiumPetOwner } from "@/lib/premiumGuard";
import { deleteFoodLog } from "@/services/petTracking";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; logId: string }> }
) {
  const { id, logId } = await params;
  const petId = Number(id);
  const guard = await requirePremiumPetOwner(petId);
  if (!guard.ok) return guard.response;

  try {
    const deleted = await deleteFoodLog(pool, petId, Number(logId));
    if (!deleted) return NextResponse.json({ message: "Registro no encontrado." }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error eliminando cambio de alimento:", error);
    return NextResponse.json({ message: "No se pudo eliminar el registro." }, { status: 500 });
  }
}
