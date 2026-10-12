import type { AllergenKey, FoodRow } from "@/types/catalogFood";

export const CRITERION_KEYS = [
  "edad",
  "tamano_peso",
  "actividad",
  "condicion",
  "nutricion",
  "presupuesto",
] as const;

export type CriterionKey = (typeof CRITERION_KEYS)[number];

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  edad: "Edad / etapa de vida",
  tamano_peso: "Tamaño y peso",
  actividad: "Actividad y energía",
  condicion: "Condición corporal y necesidades especiales",
  nutricion: "Adecuación nutricional",
  presupuesto: "Presupuesto",
};

export type ComparisonPet = {
  species: "Perro" | "Gato";
  /** "cachorro" | "adulto" | "senior", derivado de birth_date. */
  stage: string | null;
  weightKg: number | null;
  activityLevel: string | null;
  bodyCondition: string | null;
  specialCondition: string | null;
  allergies: string | null;
};

export type RuleSetWeights = Record<CriterionKey, number>;

export type CriterionResult = {
  key: CriterionKey;
  /** 0..1, null = no evaluable con los datos disponibles. */
  score: number | null;
  explanation: string;
};

export type CriterionEvaluator = (
  pet: ComparisonPet,
  food: FoodRow,
  context: EvaluationContext
) => CriterionResult;

/** Datos compartidos entre criterios de un mismo cálculo (ej. percentiles del catálogo). */
export type EvaluationContext = {
  catalog: FoodRow[];
  budget: number | null;
  nutritionRanges: NutritionRange[];
};

export type NutritionRange = {
  species: "Perro" | "Gato";
  stage: string;
  nutrient: "protein" | "fat" | "fiber";
  minValue: number | null;
  idealMin: number | null;
  idealMax: number | null;
  maxValue: number | null;
};

export type ExcludedFood = {
  food: FoodRow;
  reason: "especie" | "alergia";
  allergen?: AllergenKey;
};

export type ScoredFood = {
  food: FoodRow;
  score: number; // 0-100
  coverage: number; // 0-100
  estimatedMonthlyCost: number | null;
  positives: string[];
  considerations: string[];
  warnings: string[];
  criteria: CriterionResult[];
};

export type ComparisonResult = {
  eligible: ScoredFood[];
  excluded: ExcludedFood[];
  best: ScoredFood | null;
  bestWithinBudget: ScoredFood | null;
};
