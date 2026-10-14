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
 * Fila de la tabla `foods` (catálogo real importado del scraper vía
 * scripts/import-foods.js). Los campos de precio y kcal_kg pueden venir
 * `null` cuando el scraper no los encontró — nunca se inventan.
 */
export type FoodRow = {
  id: number;
  brand: string;
  name: string;
  /** "Perro" | "Gato" | "" (especie no detectada por el scraper). */
  species: "Perro" | "Gato" | "";
  type: "seco" | "humedo" | "";
  stage: string;
  /** Tamaño de raza recomendado: "pequeno" | "mediano" | "grande" | "mediano-grande" | "todos" | "". No es el tamaño del envase (ver `formats`). */
  size: string;
  conditions: string[];
  protein: number | null;
  fat: number | null;
  fiber: number | null;
  moisture: number | null;
  /** Base materia seca: comparable entre alimento seco y húmedo. */
  proteinMs: number | null;
  fatMs: number | null;
  fiberMs: number | null;
  kcalKg: number | null;
  /** true = `kcalKg` fue estimado (Atwater), no viene real del scraper. */
  kcalKgEstimated: boolean;
  /** `null` = el scraper no pudo confirmar si lo contiene o no. */
  allergens: Record<AllergenKey, boolean | null>;
  firstIngredient: string | null;
  formats: string[];
  priceMin: number | null;
  pricePerKg: number | null;
  priceStore: string | null;
  priceUrl: string | null;
  sourceUrl: string | null;
};
