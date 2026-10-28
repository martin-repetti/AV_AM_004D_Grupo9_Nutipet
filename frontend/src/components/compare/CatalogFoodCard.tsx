import type { ScoredFood } from "@/lib/compatibility/types";
import { formatDisplayName } from "@/utils/productName";
import { scoreTier } from "@/utils/scoreTier";
import { displayPrice, type FormatRangeKey } from "@/utils/formatSize";
import FavoriteButton, { type FavoriteToggle } from "@/components/favorites/FavoriteButton";
import styles from "./CatalogFoodCard.module.css";

const TYPE_LABELS: Record<string, string> = {
  seco: "Alimento seco",
  humedo: "Alimento húmedo",
};

const STAGE_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  adulto: "Adulto",
  senior: "Senior",
};

type CatalogFoodCardProps = {
  scored: ScoredFood;
  formatRange: FormatRangeKey | null;
  /** Solo con sesión iniciada. */
  favorite?: FavoriteToggle;
};

export default function CatalogFoodCard({ scored, formatRange, favorite }: CatalogFoodCardProps) {
  const { food } = scored;
  const tier = scoreTier(scored.score);
  const shownPrice = displayPrice(food.priceMin, food.pricesByFormat, formatRange);
  const shownStore = shownPrice.store ?? food.priceStore;

  const metaParts = [
    TYPE_LABELS[food.type],
    STAGE_LABELS[food.stage],
    food.firstIngredient && `Primer ingrediente: ${food.firstIngredient}`,
  ].filter(Boolean);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.brandRow}>
            <p className={styles.brand}>{food.brand}</p>
            {favorite && <FavoriteButton {...favorite} foodName={formatDisplayName(food.name)} />}
          </div>
          <h3>{formatDisplayName(food.name)}</h3>
          {metaParts.length > 0 && (
            <p className={styles.meta}>{metaParts.join(" · ")}</p>
          )}
        </div>

        <div className={`${styles.scoreBlock} ${styles[tier]}`}>
          <span>Compatibilidad</span>
          <strong>{Math.min(100, Math.round(scored.score))}%</strong>
          <p className={styles.coverage}>
            {Math.round(scored.coverage)}% de los datos verificados
          </p>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span>Proteína</span>
          <strong>{food.protein !== null ? `${food.protein}%` : "—"}</strong>
        </div>

        <div className={styles.infoItem}>
          <span>Grasa</span>
          <strong>{food.fat !== null ? `${food.fat}%` : "—"}</strong>
        </div>

        <div className={styles.infoItem}>
          <span>Fibra</span>
          <strong>{food.fiber !== null ? `${food.fiber}%` : "—"}</strong>
        </div>

        <div className={styles.infoItem}>
          <span>
            {shownPrice.format
              ? `Formato ${shownPrice.format}`
              : formatRange
                ? "Precio general"
                : "Desde"}
          </span>
          <strong>
            {shownPrice.price !== null
              ? `$${shownPrice.price.toLocaleString("es-CL")}`
              : "No disponible"}
          </strong>
        </div>
      </div>

      {shownPrice.price !== null && (
        <p className={styles.priceNote}>
          {shownStore ? `Precio en ${shownStore}` : "Precio de tienda"}
          {formatRange && !shownPrice.format &&
            " · no tenemos el precio del formato elegido, este es su precio más bajo en general"}
          {scored.estimatedMonthlyCost !== null &&
            ` · ~$${scored.estimatedMonthlyCost.toLocaleString("es-CL")}/mes estimado`}
        </p>
      )}

      {(scored.positives.length > 0 || scored.considerations.length > 0) && (
        <div className={styles.notesGrid}>
          {scored.positives.length > 0 && (
            <div className={`${styles.notesColumn} ${styles.positives}`}>
              <h4>Aspectos favorables</h4>
              <ul>
                {scored.positives.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          )}

          {scored.considerations.length > 0 && (
            <div className={`${styles.notesColumn} ${styles.considerations}`}>
              <h4>Aspectos por considerar</h4>
              <ul>
                {scored.considerations.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {scored.warnings.length > 0 && (
        <p className={styles.warnings}>{scored.warnings.join(" ")}</p>
      )}
    </article>
  );
}
