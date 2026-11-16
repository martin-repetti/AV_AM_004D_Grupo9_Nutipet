-- Planes de suscripción. Se puede correr más de una vez.
-- Un usuario sin suscripción vigente usa el plan 'gratis'.
INSERT INTO plans (name, code, max_pets, max_compare, price_monthly)
VALUES
  ('Gratis', 'gratis', 2, 4, 0),
  ('Premium', 'premium', 10, 6, 1990)
ON CONFLICT (name) DO UPDATE SET
  code = EXCLUDED.code,
  max_pets = EXCLUDED.max_pets,
  max_compare = EXCLUDED.max_compare,
  price_monthly = EXCLUDED.price_monthly;
