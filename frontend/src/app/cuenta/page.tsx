import Link from "next/link";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import pool from "@/lib/db";
import { getPayments, getUserPlan } from "@/services/plans";
import CuentaClient from "./CuentaClient";
import styles from "./Cuenta.module.css";

async function getSessionUser(): Promise<{ id: number; name: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const session = await verifySessionToken(token);
    return {
      id: Number(session.userId),
      name: session.name as string,
      email: session.email as string,
    };
  } catch {
    return null;
  }
}

export default async function CuentaPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔒</div>
            <h2>Inicia sesión para ver tu cuenta.</h2>
            <Link href="/login" className={styles.emptyButton}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [plan, payments] = await Promise.all([
    getUserPlan(pool, user.id),
    getPayments(pool, user.id),
  ]);

  return <CuentaClient user={user} plan={plan} payments={payments} />;
}
