export const ALLERGEN_KEYS = [
  "pollo",
  "pavo",
  "vacuno",
  "cerdo",
  "cordero",
  "pescado",
  "salmon",
  "atun",
  "huevo",
  "maiz",
  "trigo",
  "arroz",
  "soya",
  "lacteos",
] as const;

export type AllergenKey = (typeof ALLERGEN_KEYS)[number];

export const ALLERGEN_LABELS: Record<AllergenKey, string> = {
  pollo: "Pollo",
  pavo: "Pavo",
  vacuno: "Vacuno",
  cerdo: "Cerdo",
  cordero: "Cordero",
  pescado: "Pescado",
  salmon: "Salmón",
  atun: "Atún",
  huevo: "Huevo",
  maiz: "Maíz",
  trigo: "Trigo",
  arroz: "Arroz",
  soya: "Soya",
  lacteos: "Lácteos",
};

/**
 * Producto del catálogo. Viene del scraper (datos/salida/productos.json),
 * recortado a lo que usa la UI. `price` es un valor DEMO: el scraper
 * todavía no capturó precios reales (ver src/data/foodCatalog.json).
 */
export type CatalogFood = {
  id: string;
  brand: string;
  name: string;
  /** "Perro" | "Gato" | "" (sin especie detectada, se trata como universal). */
  species: "Perro" | "Gato" | "";
  type: "seco" | "humedo" | "";
  stage: string;
  conditions: string[];
  protein: number | null;
  fat: number | null;
  fiber: number | null;
  moisture: number | null;
  /** `null` = el scraper no pudo confirmar si lo contiene o no. */
  allergens: Record<AllergenKey, boolean | null>;
  firstIngredient: string;
  formats: string[];
  /** MOCK: precio demostrativo, no viene del scraper todavía. */
  price: number;
  sourceUrl: string | null;
};
