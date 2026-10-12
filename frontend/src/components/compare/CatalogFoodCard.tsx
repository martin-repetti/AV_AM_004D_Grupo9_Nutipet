import type { ScoredFood } from "@/lib/compatibility/types";
import { formatDisplayName } from "@/utils/productName";
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
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
};

export default function CatalogFoodCard({
  scored,
  selectable,
  selected,
  onToggleSelect,
}: CatalogFoodCardProps) {
  const { food } = scored;

  const metaParts = [
    TYPE_LABELS[food.type],
    STAGE_LABELS[food.stage],
    food.firstIngredient && `Primer ingrediente: ${food.firstIngredient}`,
  ].filter(Boolean);

  return (
    <article className={`${styles.card} ${selected ? styles.selected : ""}`}>
      {selectable && (
        <label className={styles.selectRow}>
          <input
            type="checkbox"
            checked={Boolean(selected)}
            onChange={onToggleSelect}
          />
          Agregar a comparar
        </label>
      )}

      <div className={styles.header}>
        <div>
          <p className={styles.brand}>{food.brand}</p>
          <h3>{formatDisplayName(food.name)}</h3>
          {metaParts.length > 0 && (
            <p className={styles.meta}>{metaParts.join(" · ")}</p>
          )}
        </div>

        <div className={styles.scoreBlock}>
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
          <span>Desde</span>
          <strong>
            {food.priceMin !== null
              ? `$${food.priceMin.toLocaleString("es-CL")}`
              : "No disponible"}
          </strong>
        </div>
      </div>

      {food.priceMin !== null && (
        <p className={styles.priceNote}>
          {food.priceStore ? `Precio en ${food.priceStore}` : "Precio de tienda"}
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
