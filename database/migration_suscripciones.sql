-- Suscripciones (Gratis / Premium) y beneficios Premium: historial de
-- peso y seguimiento de cambios de alimento.
-- Para bases creadas antes de este cambio (las nuevas ya lo traen en
-- schema.sql). Se puede correr más de una vez.
--
--   psql -U nutripet_app -d nutripet_db -f database/migration_suscripciones.sql

-- Código estable para que el código no dependa del nombre visible del plan.
ALTER TABLE plans ADD COLUMN IF NOT EXISTS code VARCHAR(20);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS max_compare INTEGER NOT NULL DEFAULT 4;
UPDATE plans SET code = 'gratis', max_compare = 4 WHERE name = 'Gratis' AND code IS NULL;
UPDATE plans SET code = 'premium', max_compare = 6 WHERE name = 'Premium' AND code IS NULL;
INSERT INTO plans (name, code, max_pets, max_compare, price_monthly)
  SELECT 'Gratis', 'gratis', 2, 4, 0 WHERE NOT EXISTS (SELECT 1 FROM plans WHERE code = 'gratis');
INSERT INTO plans (name, code, max_pets, max_compare, price_monthly)
  SELECT 'Premium', 'premium', 10, 6, 1990 WHERE NOT EXISTS (SELECT 1 FROM plans WHERE code = 'premium');
CREATE UNIQUE INDEX IF NOT EXISTS plans_code_key ON plans (code);

-- Un usuario sin suscripción vigente usa el plan Gratis: no hace falta
-- crearle una fila al registrarse. Una suscripción cancelada sigue dando
-- acceso hasta ends_at (el periodo ya pagado).
--   status: 'active' | 'canceled' | 'expired'
-- A lo más una suscripción vigente por usuario.
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_current_per_user
  ON subscriptions (user_id) WHERE status IN ('active', 'canceled');

-- La fila de prueba que existía sin plan de pago ni fecha de término no
-- representa una suscripción real: el plan Gratis es la ausencia de una.
DELETE FROM subscriptions
  WHERE ends_at IS NULL AND plan_id = (SELECT id FROM plans WHERE code = 'gratis');

-- Pagos (simulados: no hay pasarela real). Sirve de historial en Mi cuenta.
CREATE TABLE IF NOT EXISTS subscription_payments (
  id BIGSERIAL PRIMARY KEY,
  subscription_id BIGINT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method VARCHAR(30) NOT NULL DEFAULT 'simulado',
  reference VARCHAR(40) NOT NULL,
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Historial de peso (Premium). Un registro por mascota y día.
CREATE TABLE IF NOT EXISTS pet_weight_logs (
  id BIGSERIAL PRIMARY KEY,
  pet_id BIGINT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
  recorded_on DATE NOT NULL,
  note VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (pet_id, recorded_on)
);

-- Seguimiento nutricional (Premium): desde cuándo come cada alimento.
-- food_name guarda el nombre por si el alimento sale del catálogo.
CREATE TABLE IF NOT EXISTS pet_food_logs (
  id BIGSERIAL PRIMARY KEY,
  pet_id BIGINT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  food_id BIGINT REFERENCES foods(id) ON DELETE SET NULL,
  food_name VARCHAR(300) NOT NULL,
  started_on DATE NOT NULL,
  note VARCHAR(200),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS pet_food_logs_pet_idx ON pet_food_logs (pet_id, started_on);
