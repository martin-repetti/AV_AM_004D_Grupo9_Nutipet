"use client";

import { useState } from "react";
import type { FavoriteToggle } from "./FavoriteButton";

/**
 * Favoritos del usuario con actualización optimista: el corazón cambia al
 * instante y vuelve atrás si el servidor rechaza el cambio.
 * `initialIds` null = sin sesión: no hay favoritos que mostrar.
 */
export function useFavorites(initialIds: number[] | null) {
  const [ids, setIds] = useState(() => new Set(initialIds ?? []));
  const [error, setError] = useState("");

  const setFavorite = (foodId: number, active: boolean) =>
    setIds((prev) => {
      const next = new Set(prev);
      if (active) next.add(foodId);
      else next.delete(foodId);
      return next;
    });

  const toggle = async (foodId: number) => {
    const adding = !ids.has(foodId);
    setFavorite(foodId, adding);
    setError("");

    try {
      const response = adding
        ? await fetch("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foodId }),
          })
        : await fetch(`/api/favorites/${foodId}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
    } catch {
      setFavorite(foodId, !adding);
      setError(
        adding
          ? "No pudimos guardar el favorito. Intenta de nuevo."
          : "No pudimos quitar el favorito. Intenta de nuevo."
      );
    }
  };

  const favoriteFor = (foodId: number): FavoriteToggle | undefined =>
    initialIds === null ? undefined : { active: ids.has(foodId), onToggle: () => toggle(foodId) };

  return { favoriteFor, error };
}
