import type { RuleSetWeights } from "./types";

/**
 * Pesos de respaldo si no hay ningún rule set activo configurado en
 * `compatibility_rule_sets` (nunca debería pasar en un entorno con la
 * semilla aplicada, pero el motor no debe romperse si pasa). Mismos
 * valores que database/seed_compatibility_weights.sql.
 */
export const DEFAULT_WEIGHTS: RuleSetWeights = {
  edad: 0.2,
  tamano_peso: 0.1,
  actividad: 0.1,
  condicion: 0.25,
  nutricion: 0.25,
  presupuesto: 0.1,
};
