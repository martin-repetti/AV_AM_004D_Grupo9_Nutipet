import Link from "next/link";
import { cookies } from "next/headers";
import styles from "./Navbar.module.css";
import ProfileMenu, { type SessionUser } from "./ProfileMenu";
import { verifySessionToken } from "@/lib/auth";

async function getSessionUser(): Promise<SessionUser | null> {
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
    // Token ausente, inválido o expirado: se trata como sesión no iniciada.
    return null;
  }
}

export default async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>🐾</span>
          <span>NutriPet</span>
        </Link>

        <nav className={styles.links}>
          <Link href="/">Inicio</Link>
          <Link href="/comparar">Comparar</Link>
          <Link href="/mascotas">Mascotas</Link>
          <Link href="/historial-precios">Historial de precios</Link>
          <Link href="/favoritos">Favoritos</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>

        <div className={styles.actions}>
          <input
            type="search"
            placeholder="Buscar alimento..."
            className={styles.search}
          />

          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}