import Link from "next/link";
import { cookies } from "next/headers";
import styles from "./Navbar.module.css";
import ProfileMenu, { type SessionUser } from "./ProfileMenu";
import MobileNav from "./MobileNav";
import { getNavLinks } from "./navLinks";
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
  const navLinks = getNavLinks(user !== null);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>🐾</span>
          <span>NutriPet</span>
        </Link>

        <nav className={styles.links}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <form action="/comparar" method="get" role="search">
            <input
              type="search"
              name="q"
              placeholder="Buscar alimento..."
              aria-label="Buscar alimento"
              className={styles.search}
            />
          </form>

          <ProfileMenu user={user} />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  );
}