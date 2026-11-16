import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

/** Id del usuario con sesión iniciada, o null si no hay sesión válida. */
export async function getSessionUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const session = await verifySessionToken(token);
    return Number(session.userId) || null;
  } catch {
    return null;
  }
}
