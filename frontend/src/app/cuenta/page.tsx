import Link from "next/link";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import CuentaClient from "./CuentaClient";
import styles from "./Cuenta.module.css";

async function getSessionUser(): Promise<{ name: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nutripet_session")?.value;

  if (!token) return null;

  try {
    const session = await verifySessionToken(token);
    return {
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

  return <CuentaClient user={user} />;
}
