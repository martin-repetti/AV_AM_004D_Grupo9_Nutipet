-- Rangos de referencia nutricional (base materia seca, %).
-- Punto de partida: mínimos AAFCO 2023 para perro/gato (growth/
-- maintenance), con una banda "ideal" por encima del mínimo estimada
-- para uso orientativo en NutriPet. NO es una fuente clínica definitiva
-- -- queda pendiente de revisión con la veterinaria del equipo (ver
-- "Preguntas para la veterinaria" en el plan del motor de compatibilidad).
-- La fibra no tiene mínimo regulado por AAFCO; el rango aquí es
-- orientativo únicamente.

INSERT INTO nutrition_reference_ranges (species, stage, nutrient, min_value, ideal_min, ideal_max, max_value, source)
VALUES
  -- Perro
  ('Perro', 'cachorro', 'protein', 22.5, 25, 32, 38, 'AAFCO 2023 (mínimo growth) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Perro', 'cachorro', 'fat',      8.5, 12, 18, 25, 'AAFCO 2023 (mínimo growth) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Perro', 'cachorro', 'fiber',     0,   2,  5,  8, 'Sin mínimo AAFCO; rango orientativo, pendiente validación veterinaria'),

  ('Perro', 'adulto', 'protein', 18, 22, 28, 34, 'AAFCO 2023 (mínimo maintenance) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Perro', 'adulto', 'fat',      5.5, 10, 16, 22, 'AAFCO 2023 (mínimo maintenance) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Perro', 'adulto', 'fiber',     0,   2,  5,  8, 'Sin mínimo AAFCO; rango orientativo, pendiente validación veterinaria'),

  ('Perro', 'senior', 'protein', 18, 20, 26, 32, 'Sin categoría AAFCO oficial para senior; ajuste orientativo sobre adulto, pendiente validación veterinaria'),
  ('Perro', 'senior', 'fat',      5,   8, 14, 18, 'Sin categoría AAFCO oficial para senior; ajuste orientativo sobre adulto, pendiente validación veterinaria'),
  ('Perro', 'senior', 'fiber',     0,   2,  5,  8, 'Sin mínimo AAFCO; rango orientativo, pendiente validación veterinaria'),

  -- Gato
  ('Gato', 'cachorro', 'protein', 30, 33, 42, 48, 'AAFCO 2023 (mínimo growth) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Gato', 'cachorro', 'fat',      9, 14, 20, 28, 'AAFCO 2023 (mínimo growth) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Gato', 'cachorro', 'fiber',     0,  2,  5,  8, 'Sin mínimo AAFCO; rango orientativo, pendiente validación veterinaria'),

  ('Gato', 'adulto', 'protein', 26, 30, 38, 45, 'AAFCO 2023 (mínimo maintenance) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Gato', 'adulto', 'fat',      9, 12, 18, 25, 'AAFCO 2023 (mínimo maintenance) + banda ideal orientativa, pendiente validación veterinaria'),
  ('Gato', 'adulto', 'fiber',     0,  2,  5,  8, 'Sin mínimo AAFCO; rango orientativo, pendiente validación veterinaria'),

  ('Gato', 'senior', 'protein', 26, 28, 36, 42, 'Sin categoría AAFCO oficial para senior; ajuste orientativo sobre adulto, pendiente validación veterinaria'),
  ('Gato', 'senior', 'fat',      8, 10, 16, 20, 'Sin categoría AAFCO oficial para senior; ajuste orientativo sobre adulto, pendiente validación veterinaria'),
  ('Gato', 'senior', 'fiber',     0,  2,  5,  8, 'Sin mínimo AAFCO; rango orientativo, pendiente validación veterinaria')
ON CONFLICT (species, stage, nutrient) DO NOTHING;
