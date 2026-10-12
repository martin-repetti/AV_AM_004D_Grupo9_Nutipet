import type { CriterionEvaluator, CriterionKey } from "../types";
import { evaluateAge } from "./age";
import { evaluateSizeWeight } from "./sizeWeight";
import { evaluateActivity } from "./activity";
import { evaluateBodyCondition } from "./bodyCondition";
import { evaluateNutrition } from "./nutrition";
import { evaluateBudget } from "./budget";

/**
 * Registro de criterios del motor. Agregar un criterio nuevo es agregar
 * un archivo con un CriterionEvaluator y una entrada acá — no hay que
 * tocar engine.ts.
 */
export const CRITERIA: { key: CriterionKey; evaluate: CriterionEvaluator }[] = [
  { key: "edad", evaluate: evaluateAge },
  { key: "tamano_peso", evaluate: evaluateSizeWeight },
  { key: "actividad", evaluate: evaluateActivity },
  { key: "condicion", evaluate: evaluateBodyCondition },
  { key: "nutricion", evaluate: evaluateNutrition },
  { key: "presupuesto", evaluate: evaluateBudget },
];
