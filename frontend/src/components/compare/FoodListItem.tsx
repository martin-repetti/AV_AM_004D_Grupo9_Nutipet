import type { ScoredFood } from "@/lib/compatibility/types";
import { formatDisplayName } from "@/utils/productName";
import { scoreTier } from "@/utils/scoreTier";
import { displayPrice, type FormatRangeKey } from "@/utils/formatSize";
import FavoriteButton, { type FavoriteToggle } from "@/components/favorites/FavoriteButton";
import styles from "./FoodListItem.module.css";

const TYPE_LABELS: Record<string, string> = {
  seco: "Seco",
  humedo: "Húmedo",
};

const STAGE_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  adulto: "Adulto",
  senior: "Senior",
};

type FoodListItemProps = {
  scored: ScoredFood;
  selected: boolean;
  /** true cuando ya hay el máximo de alimentos en la tabla y este no es uno de ellos. */
  selectionFull: boolean;
  onToggleSelect: () => void;
  formatRange: FormatRangeKey | null;
  /** Solo con sesión iniciada. */
  favorite?: FavoriteToggle;
};

function nutrient(value: number | null): string {
  return value !== null ? `${value}%` : "—";
}

export default function FoodListItem({
  scored,
  selected,
  selectionFull,
  onToggleSelect,
  formatRange,
  favorite,
}: FoodListItemProps) {
  const { food, score } = scored;
  const shownPrice = displayPrice(food.priceMin, food.pricesByFormat, formatRange);
  const tier = scoreTier(score);
  const disabled = selectionFull && !selected;
  const checkboxId = `compare-${food.id}`;

  return (
    <article className={`${styles.row} ${selected ? styles.selected : ""}`}>
      <div className={styles.check}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={onToggleSelect}
        />
        <label htmlFor={checkboxId} className={styles.srOnly}>
          Agregar {formatDisplayName(food.name)} a la comparación
        </label>
        {favorite && <FavoriteButton {...favorite} foodName={formatDisplayName(food.name)} />}
      </div>

      <div className={styles.identity}>
        <span className={styles.brand}>{food.brand}</span>
        <span className={styles.name}>{formatDisplayName(food.name)}</span>
        <span className={styles.chips}>
          {TYPE_LABELS[food.type] && <span className={styles.chip}>{TYPE_LABELS[food.type]}</span>}
          {STAGE_LABELS[food.stage] && <span className={styles.chip}>{STAGE_LABELS[food.stage]}</span>}
          {food.firstIngredient && (
            <span className={styles.ingredient}>1° ingrediente: {food.firstIngredient}</span>
          )}
        </span>
      </div>

      <dl className={styles.macros}>
        <div>
          <dt>Proteína</dt>
          <dd>{nutrient(food.protein)}</dd>
        </div>
        <div>
          <dt>Grasa</dt>
          <dd>{nutrient(food.fat)}</dd>
        </div>
        <div>
          <dt>Fibra</dt>
          <dd>{nutrient(food.fiber)}</dd>
        </div>
      </dl>

      <div className={styles.price}>
        <span
          className={styles.priceLabel}
          title={
            formatRange && !shownPrice.format
              ? "No tenemos el precio de este producto para el formato elegido; es su precio más bajo en general."
              : undefined
          }
        >
          {shownPrice.format
            ? `Formato ${shownPrice.format}`
            : formatRange
              ? "Precio general*"
              : "Desde"}
        </span>
        <span className={styles.priceValue}>
          {shownPrice.price !== null ? `$${shownPrice.price.toLocaleString("es-CL")}` : "—"}
        </span>
      </div>

      <div className={`${styles.score} ${styles[tier]}`}>
        <span className={styles.scoreValue}>{Math.min(100, Math.round(score))}%</span>
        <span className={styles.scoreLabel}>compatible</span>
      </div>
    </article>
  );
}
