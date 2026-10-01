import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import EditarMascotaForm from "./EditarMascotaForm";

type PetRow = {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  custom_breed: string | null;
  sex: string | null;
  birth_date: string | null;
  weight_kg: string | number | null;
  activity_level: string | null;
  body_condition: string | null;
  sterilized: boolean | null;
  food_preference: string | null;
  allergies: string | null;
  special_condition: string | null;
};

async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nutripet_session")?.value;

  if (!token) return null;

  try {
    const session = await verifySessionToken(token);
    return Number(session.userId) || null;
  } catch {
    return null;
  }
}

export default async function EditarMascotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const petId = Number(id);

  if (!Number.isInteger(petId)) {
    notFound();
  }

  const userId = await getSessionUserId();

  if (!userId) {
    redirect("/login");
  }

  const result = await pool.query<PetRow>(
    `
      SELECT
        id,
        name,
        species,
        breed,
        custom_breed,
        sex,
        birth_date::text AS birth_date,
        weight_kg,
        activity_level,
        body_condition,
        sterilized,
        food_preference,
        allergies,
        special_condition
      FROM pets
      WHERE id = $1 AND user_id = $2
      LIMIT 1
    `,
    [petId, userId]
  );

  const pet = result.rows[0];

  if (!pet) {
    notFound();
  }

  return <EditarMascotaForm pet={pet} />;
}
