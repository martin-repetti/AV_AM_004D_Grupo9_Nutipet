import type { Pool } from "pg";
import { CRITERION_KEYS, type CriterionKey, type RuleSetWeights } from "./types";
import { DEFAULT_WEIGHTS } from "./defaultWeights";

const WEIGHT_SUM_TOLERANCE = 0.01;

export function validateWeightsSumToOne(weights: RuleSetWeights): void {
  const sum = CRITERION_KEYS.reduce((total, key) => total + weights[key], 0);

  if (Math.abs(sum - 1) > WEIGHT_SUM_TOLERANCE) {
    throw new Error(
      `Los pesos del rule set deben sumar 1 (suman ${sum.toFixed(3)}).`
    );
  }
}

/**
 * Trae los pesos del rule set activo en `compatibility_rule_sets`. Si no
 * hay ninguno activo (base recién creada sin el seed, o alguien la
 * desactivó sin activar otro), cae a DEFAULT_WEIGHTS para que el motor
 * nunca quede roto.
 */
export async function getActiveRuleSetWeights(
  pool: Pool
): Promise<RuleSetWeights> {
  const result = await pool.query<{ criterion_key: string; weight: string }>(
    `
      SELECT w.criterion_key, w.weight
      FROM compatibility_criteria_weights w
      JOIN compatibility_rule_sets r ON r.id = w.rule_set_id
      WHERE r.is_active = true
      ORDER BY r.id DESC, w.criterion_key
    `
  );

  if (result.rows.length === 0) {
    return DEFAULT_WEIGHTS;
  }

  const weights = { ...DEFAULT_WEIGHTS };
  for (const row of result.rows) {
    if ((CRITERION_KEYS as readonly string[]).includes(row.criterion_key)) {
      weights[row.criterion_key as CriterionKey] = Number(row.weight);
    }
  }

  validateWeightsSumToOne(weights);
  return weights;
}
