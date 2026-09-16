import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
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
        </nav>

        <div className={styles.actions}>
          <input
            type="search"
            placeholder="Buscar alimento..."
            className={styles.search}
          />

          <Link href="/login" className={styles.profileButton}>
            👤
          </Link>
        </div>
      </div>
    </header>
  );
}