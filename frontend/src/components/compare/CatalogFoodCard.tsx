import type { CatalogFood } from "@/types/catalogFood";
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
  food: CatalogFood;
  score?: number;
  matchedStage?: boolean;
  matchedCondition?: boolean;
};

export default function CatalogFoodCard({
  food,
  score,
  matchedStage,
  matchedCondition,
}: CatalogFoodCardProps) {
  const metaParts = [
    TYPE_LABELS[food.type],
    STAGE_LABELS[food.stage],
    food.firstIngredient && `Primer ingrediente: ${food.firstIngredient}`,
  ].filter(Boolean);

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.brand}>{food.brand}</p>
          <h3>{food.name}</h3>
          {metaParts.length > 0 && (
            <p className={styles.meta}>{metaParts.join(" · ")}</p>
          )}
        </div>

        {score !== undefined && (
          <div className={styles.score}>
            <span>Compatibilidad</span>
            <strong>{Math.min(100, Math.round(score))}%</strong>
          </div>
        )}
      </div>

      {(matchedStage || matchedCondition) && (
        <div className={styles.tags}>
          {matchedStage && <span className={styles.tag}>Etapa adecuada</span>}
          {matchedCondition && (
            <span className={styles.tag}>Para su necesidad especial</span>
          )}
        </div>
      )}

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
          <strong>${food.price.toLocaleString("es-CL")}</strong>
        </div>
      </div>

      <p className={styles.priceNote}>Precio demostrativo, no confirmado con la tienda.</p>
    </article>
  );
}
