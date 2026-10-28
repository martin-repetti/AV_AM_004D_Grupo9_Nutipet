export type NavLink = { href: string; label: string };

/**
 * Con sesión, "Favoritos" (que incluye el historial de precios de tus
 * favoritos). Sin sesión, "Historial de precios" de cualquier alimento.
 */
export function getNavLinks(isLoggedIn: boolean): NavLink[] {
  return [
    { href: "/", label: "Inicio" },
    { href: "/comparar", label: "Comparar" },
    { href: "/mascotas", label: "Mascotas" },
    isLoggedIn
      ? { href: "/favoritos", label: "Favoritos" }
      : { href: "/historial-precios", label: "Historial de precios" },
    { href: "/contacto", label: "Contacto" },
  ];
}
