"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "./navLinks";
import styles from "./MobileNav.module.css";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <div id="mobile-nav-panel" className={styles.panel}>
          {/* Sin onSubmit que cierre el menú: desmontar el formulario antes
              de que el navegador lo envíe cancela el envío. La navegación
              completa ya deja el menú cerrado. */}
          <form action="/comparar" method="get" role="search">
            <input
              type="search"
              name="q"
              placeholder="Buscar alimento..."
              aria-label="Buscar alimento"
              className={styles.search}
            />
          </form>

          <nav className={styles.links}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={close}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
