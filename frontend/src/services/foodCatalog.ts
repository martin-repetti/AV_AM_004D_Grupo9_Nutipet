import type { CatalogFood } from "@/types/catalogFood";
import rawCatalog from "@/data/foodCatalog.json";

/**
 * Catálogo de alimentos obtenido por el scraper (Champion Cat, Champion
 * Dog y Fit Formula). Reemplazar por una llamada al backend cuando el
 * scraper escriba directo a una tabla `foods`.
 */
export const FOOD_CATALOG: CatalogFood[] = rawCatalog as CatalogFood[];

export function getFoodsBySpecies(species: "Perro" | "Gato"): CatalogFood[] {
  // Los productos con especie vacía son, en la práctica, fichas que el
  // scraper no pudo etiquetar bien (ej. golosinas para perro sin la
  // palabra "perro" en la página) — mostrarlos para ambas especies
  // llevaba a recomendar un snack de perro a un gato. Mejor excluirlos
  // que arriesgar una recomendación incorrecta.
  return FOOD_CATALOG.filter((food) => food.species === species);
}
