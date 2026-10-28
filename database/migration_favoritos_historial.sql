-- Favoritos e historial de precios.
-- Para bases creadas antes de este cambio (las nuevas ya lo traen en
-- schema.sql). Se puede correr más de una vez.
--
--   psql -U nutripet_app -d nutripet_db -f database/migration_favoritos_historial.sql
--
-- Después hay que volver a correr scripts/import-foods.js: los alimentos
-- importados antes no tienen product_key y se reemplazan una única vez.

-- Un favorito o un precio histórico apunta a foods.id, así que el import
-- ya no puede borrar y reinsertar el catálogo: actualiza cada alimento por
-- su product_key (marca + nombre sin tamaño + especie + tipo) y marca como
-- inactivos los que el scraper dejó de encontrar, en vez de borrarlos.
ALTER TABLE foods ADD COLUMN IF NOT EXISTS product_key VARCHAR(400);
ALTER TABLE foods ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
CREATE UNIQUE INDEX IF NOT EXISTS foods_product_key_key ON foods (product_key);

CREATE TABLE IF NOT EXISTS favorite_foods (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id BIGINT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, food_id)
);

-- Un precio por alimento, tienda, formato y día. Cada import agrega la
-- foto de precios de esa fecha; con el tiempo esto forma el historial.
CREATE TABLE IF NOT EXISTS food_price_history (
  id BIGSERIAL PRIMARY KEY,
  food_id BIGINT NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  store VARCHAR(50) NOT NULL DEFAULT '',
  format VARCHAR(20) NOT NULL DEFAULT '',
  price NUMERIC(10,0) NOT NULL,
  url TEXT,
  recorded_on DATE NOT NULL,
  UNIQUE (food_id, store, format, recorded_on)
);
