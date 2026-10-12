import type { FoodRow } from "@/types/catalogFood";

export type EnergyTertile = "alta" | "media" | "baja";

/**
 * Ubica a `food` en un tercio de densidad energética (kcal/kg) relativo
 * a los demás alimentos de su mismo tipo (seco/húmedo) dentro de
 * `catalog`. Comparar kcal/kg crudo entre seco y húmedo no tendría
 * sentido (el húmedo es mucho menos denso por el agua), por eso se
 * agrupa por tipo antes de ordenar.
 */
export function kcalTertile(
  food: FoodRow,
  catalog: FoodRow[]
): EnergyTertile | null {
  if (food.kcalKg == null) return null;

  const group = catalog
    .filter((item) => item.type === food.type && item.kcalKg != null)
    .map((item) => item.kcalKg as number)
    .sort((a, b) => a - b);

  if (group.length < 3) return null;

  const index = group.indexOf(food.kcalKg);
  const position = index / (group.length - 1); // 0..1

  if (position <= 1 / 3) return "baja";
  if (position <= 2 / 3) return "media";
  return "alta";
}
