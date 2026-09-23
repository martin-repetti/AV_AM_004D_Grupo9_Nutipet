import type { Food } from "@/types/food";

/**
 * MOCK: catálogo de alimentos de ejemplo.
 * Reemplazar por una llamada al backend (NestJS), por ejemplo GET /foods,
 * cuando esté disponible. Mientras tanto, esta es la única fuente de
 * verdad para los alimentos que se muestran en Comparar, Favoritos e
 * Historial de precios, de modo que todas las vistas sean coherentes.
 */
export const MOCK_FOODS: Food[] = [
  {
    id: 1,
    name: "Royal Canin Adult",
    brand: "Royal Canin",
    compatibility: 92,
    price: 48990,
    protein: 26,
    fat: 15,
    hasColorants: true,
  },
  {
    id: 2,
    name: "Pro Plan Adult",
    brand: "Purina",
    compatibility: 88,
    price: 44990,
    protein: 27,
    fat: 14,
    hasColorants: false,
  },
  {
    id: 3,
    name: "Brit Care Adult",
    brand: "Brit Care",
    compatibility: 84,
    price: 39990,
    protein: 25,
    fat: 13,
    hasColorants: false,
  },
];

export function getFoods(): Food[] {
  return MOCK_FOODS;
}

export function getFoodById(id: number): Food | undefined {
  return MOCK_FOODS.find((food) => food.id === id);
}
