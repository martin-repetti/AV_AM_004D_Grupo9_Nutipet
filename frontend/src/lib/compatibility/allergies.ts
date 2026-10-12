import { ALLERGEN_KEYS, type AllergenKey } from "@/types/catalogFood";
import { normalize } from "./normalize";

// Variantes en español que un dueño podría escribir para cada alérgeno.
const ALLERGEN_SYNONYMS: Record<AllergenKey, string[]> = {
  pollo: ["pollo", "gallina", "ave"],
  pavo: ["pavo"],
  vacuno: [
    "vacuno",
    "res",
    "vaca",
    "buey",
    "ternera",
    "carne de res",
    "carne de vacuno",
  ],
  cerdo: ["cerdo", "chancho", "puerco"],
  cordero: ["cordero", "oveja", "carnero"],
  pescado: ["pescado", "pez"],
  salmon: ["salmon", "salmón"],
  atun: ["atun", "atún"],
  huevo: ["huevo"],
  maiz: ["maiz", "maíz", "choclo"],
  trigo: ["trigo", "gluten"],
  arroz: ["arroz"],
  soya: ["soya", "soja"],
  lacteos: ["lacteos", "lácteos", "leche", "queso", "lactosa"],
};

/**
 * Convierte el texto libre de alergias de una mascota (ej. "pollo, trigo")
 * en alérgenos conocidos del catálogo. El catálogo ya marca un alimento
 * como `pollo: true` aunque el ingrediente diga "subproductos de pollo",
 * así que no hace falta volver a buscar derivados acá.
 */
export function parseAllergyTokens(allergiesText: string | null): AllergenKey[] {
  if (!allergiesText?.trim()) return [];

  const pieces = allergiesText
    .split(/[,;/]+| y /i)
    .map((piece) => normalize(piece))
    .filter(Boolean);

  const matched = new Set<AllergenKey>();

  for (const piece of pieces) {
    for (const key of ALLERGEN_KEYS) {
      const synonyms = ALLERGEN_SYNONYMS[key].map(normalize);
      if (synonyms.some((syn) => piece.includes(syn) || syn.includes(piece))) {
        matched.add(key);
      }
    }
  }

  return [...matched];
}
