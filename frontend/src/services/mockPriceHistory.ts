import type { PriceHistory } from "@/types/priceHistory";

/**
 * MOCK: evolución mensual de precios por alimento.
 * Reemplazar por una llamada al backend, por ejemplo
 * GET /foods/:id/price-history, cuando esté disponible.
 * El último punto de cada serie coincide con el precio actual
 * definido en `mockFoods` para mantener coherencia entre vistas.
 */
export const MOCK_PRICE_HISTORY: PriceHistory[] = [
  {
    foodId: 1,
    points: [
      { month: "2026-04", price: 45990 },
      { month: "2026-05", price: 46990 },
      { month: "2026-06", price: 47990 },
      { month: "2026-07", price: 46990 },
      { month: "2026-08", price: 47990 },
      { month: "2026-09", price: 48990 },
    ],
  },
  {
    foodId: 2,
    points: [
      { month: "2026-04", price: 42990 },
      { month: "2026-05", price: 42990 },
      { month: "2026-06", price: 43990 },
      { month: "2026-07", price: 44990 },
      { month: "2026-08", price: 43990 },
      { month: "2026-09", price: 44990 },
    ],
  },
  {
    foodId: 3,
    points: [
      { month: "2026-04", price: 41990 },
      { month: "2026-05", price: 41490 },
      { month: "2026-06", price: 40990 },
      { month: "2026-07", price: 40490 },
      { month: "2026-08", price: 39990 },
      { month: "2026-09", price: 39990 },
    ],
  },
];

export function getPriceHistoryByFoodId(foodId: number): PriceHistory | undefined {
  return MOCK_PRICE_HISTORY.find((entry) => entry.foodId === foodId);
}
