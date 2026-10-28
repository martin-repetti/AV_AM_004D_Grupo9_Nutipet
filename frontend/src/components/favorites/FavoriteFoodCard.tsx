import Link from "next/link";
import type { FoodRow } from "@/types/catalogFood";
import { formatDisplayName } from "@/utils/productName";
import styles from "./FavoriteFoodCard.module.css";

const TYPE_LABELS: Record<string, string> = {
  seco: "Alimento seco",
  humedo: "Alimento húmedo",
};

const STAGE_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  adulto: "Adulto",
  senior: "Senior",
};

type FavoriteFoodCardProps = {
  food: FoodRow;
  isActive: boolean;
  historySelected: boolean;
  onShowHistory: () => void;
  onRemove: () => void;
  removing: boolean;
};

function nutrient(value: number | null): string {
  return value !== null ? `${value}%` : "—";
}

/**
 * Sin % de compatibilidad a propósito: depende de la mascota, y aquí no
 * hay una elegida. Para verlo, "Comparar" lleva el alimento a /comparar.
 */
export default function FavoriteFoodCard({
  food,
  isActive,
  historySelected,
  onShowHistory,
  onRemove,
  removing,
}: FavoriteFoodCardProps) {
  const name = formatDisplayName(food.name);
  const meta = [food.species, TYPE_LABELS[food.type], STAGE_LABELS[food.stage]].filter(Boolean);

  return (
    <article className={`${styles.card} ${historySelected ? styles.selected : ""}`}>
      <div className={styles.header}>
        <div>
          <p className={styles.brand}>{food.brand}</p>
          <h2>{name}</h2>
          {meta.length > 0 && <p className={styles.meta}>{meta.join(" · ")}</p>}
        </div>

        <div className={styles.price}>
          <span>Desde</span>
          <strong>{food.priceMin !== null ? `$${food.priceMin.toLocaleString("es-CL")}` : "—"}</strong>
          {food.priceStore && <small>en {food.priceStore}</small>}
        </div>
      </div>

      {!isActive && (
        <p className={styles.inactive}>
          Ya no lo encontramos en las tiendas que revisamos. Su precio e historial son los últimos
          registrados.
        </p>
      )}

      <dl className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <dt>Proteína</dt>
          <dd>{nutrient(food.protein)}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt>Grasa</dt>
          <dd>{nutrient(food.fat)}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt>Fibra</dt>
          <dd>{nutrient(food.fiber)}</dd>
        </div>
        <div className={styles.infoItem}>
          <dt>1° ingrediente</dt>
          <dd>{food.firstIngredient ?? "—"}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button type="button" className={styles.removeButton} onClick={onRemove} disabled={removing}>
          {removing ? "Quitando…" : "Quitar de favoritos"}
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onShowHistory}
          aria-pressed={historySelected}
        >
          {historySelected ? "Viendo su historial" : "Ver historial de precios"}
        </button>
        {isActive && (
          <Link href={`/comparar?q=${encodeURIComponent(name)}`} className={styles.primaryButton}>
            Comparar para mi mascota
          </Link>
        )}
      </div>
    </article>
  );
}
