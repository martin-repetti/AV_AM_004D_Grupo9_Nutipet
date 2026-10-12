-- Rule set inicial del motor de compatibilidad, con los pesos propuestos
-- en el prompt de diseño (pendientes de validación con la veterinaria).
-- Los pesos de un rule_set deben sumar 1; esto se valida también en
-- código (src/lib/compatibility/ruleSet.ts) al cargarlo.

INSERT INTO compatibility_rule_sets (version, name, description, is_active)
VALUES (
  'v1',
  'Pesos iniciales (propuesta capstone)',
  'Pesos propuestos antes de validación veterinaria: edad 20%, tamaño/peso 10%, actividad 10%, condición corporal/necesidades especiales 25%, adecuación nutricional 25%, presupuesto 10%.',
  true
)
ON CONFLICT DO NOTHING;

INSERT INTO compatibility_criteria_weights (rule_set_id, criterion_key, weight)
SELECT id, criterion_key, weight
FROM compatibility_rule_sets
CROSS JOIN (VALUES
  ('edad', 0.20),
  ('tamano_peso', 0.10),
  ('actividad', 0.10),
  ('condicion', 0.25),
  ('nutricion', 0.25),
  ('presupuesto', 0.10)
) AS w(criterion_key, weight)
WHERE version = 'v1'
ON CONFLICT (rule_set_id, criterion_key) DO NOTHING;
