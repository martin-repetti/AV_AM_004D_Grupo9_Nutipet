import { normalize } from "./normalize";
import type { FoodRow } from "@/types/catalogFood";

/**
 * Códigos de condición que usa el catálogo (`foods.conditions`). El
 * scraper etiqueta pocos productos (ej. "urinario" en 6, cuando hay
 * decenas de alimentos "Urinary"), así que también se buscan en el nombre.
 */
export type ConditionCode =
  | "control_peso"
  | "urinario"
  | "articulaciones"
  | "digestivo"
  | "sensible"
  | "piel_pelaje"
  | "hipoalergenico"
  | "esterilizado";

const NAME_KEYWORDS: Record<ConditionCode, string[]> = {
  control_peso: ["light", "weight", "control de peso", "obesity", "obesidad", "reduced calorie"],
  urinario: ["urinary", "urinario", "urinaria", "struvite"],
  articulaciones: ["joint", "articular", "articulaciones", "mobility", "movilidad"],
  digestivo: ["digestive", "digestivo", "digestiva", "gastro", "intestinal"],
  sensible: ["sensitive", "sensible"],
  piel_pelaje: ["skin", "coat", "piel", "pelaje", "derma"],
  hipoalergenico: ["hipoalergenico", "hypoallergenic", "anallergenic", "hypoallergenique"],
  esterilizado: ["esterilizado", "esterilizada", "sterilised", "sterilized", "castrado", "neutered"],
};

/** true si alguna palabra de `text` empieza con `keyword` ("Delight" no cuenta como "light"). */
export function hasWordStartingWith(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}`).test(text);
}

/** Condiciones del alimento: las etiquetadas por el scraper más las que dice su nombre. */
export function foodConditionCodes(food: Pick<FoodRow, "conditions" | "name">): Set<string> {
  const codes = new Set<string>(food.conditions);
  const name = normalize(food.name);
  for (const [code, keywords] of Object.entries(NAME_KEYWORDS)) {
    if (keywords.some((keyword) => hasWordStartingWith(name, keyword))) codes.add(code);
  }
  return codes;
}

/**
 * Las opciones de "Condición o necesidad especial" del formulario de
 * mascota y qué códigos del catálogo las atienden.
 */
const SPECIAL_CONDITION_CODES: { keywords: string[]; codes: ConditionCode[] }[] = [
  { keywords: ["control de peso", "sobrepeso"], codes: ["control_peso"] },
  { keywords: ["urinari"], codes: ["urinario"] },
  { keywords: ["articula"], codes: ["articulaciones"] },
  { keywords: ["digestiv"], codes: ["digestivo", "sensible"] },
  { keywords: ["piel", "pelaje"], codes: ["piel_pelaje", "hipoalergenico"] },
];

export function codesForSpecialCondition(specialCondition: string | null): ConditionCode[] {
  if (!specialCondition) return [];
  const normalized = normalize(specialCondition);
  return SPECIAL_CONDITION_CODES.filter(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  ).flatMap(({ codes }) => codes);
}
