import type { ReactNode } from "react";
import type { ScoredFood } from "@/lib/compatibility/types";
import type { FoodRow } from "@/types/catalogFood";
import { formatDisplayName } from "@/utils/productName";
import { scoreTier } from "@/utils/scoreTier";
import {
  bestPricePerKgFormat,
  cheapestInRange,
  FORMAT_RANGES,
  hasFormatInRange,
  summarizeFormats,
  type FormatRangeKey,
} from "@/utils/formatSize";
import styles from "./ComparisonTable.module.css";

const TYPE_LABELS: Record<string, string> = {
  seco: "Seco",
  humedo: "Húmedo",
};

const STAGE_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  adulto: "Adulto",
  senior: "Senior",
};

type ComparisonTableProps = {
  title: string;
  items: ScoredFood[];
  onRemove: (foodId: number) => void;
  /** Rango de formato elegido arriba (ej. "5-15"), o null si no se eligió ninguno. */
  formatRange: FormatRangeKey | null;
};

type PriceCell = {
  /** Valor exacto comparable; null si no hay precio o si es aproximado. */
  exact: number | null;
  content: ReactNode;
};

function formatClp(value: number): string {
  return `$${value.toLocaleString("es-CL")}`;
}

/** "jumbo_cat" -> "Jumbo": el scraper usa identificadores internos por tienda y especie. */
function storeLabel(store: string): string {
  if (store.includes(".")) return store;
  const base = store.replace(/_(cat|dog|gato|perro)$/i, "").replace(/_/g, " ");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const LABEL_COLUMN_WIDTH = 150;
const FOOD_COLUMN_MIN_WIDTH = 220;

function StoreLink({ food }: { food: FoodRow }) {
  if (food.priceUrl) {
    return (
      <a
        href={food.priceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.storeLink}
      >
        Ver en {food.priceStore ? storeLabel(food.priceStore) : "la tienda"} ↗
      </a>
    );
  }

  return (
    <span className={styles.note}>
      {food.priceStore ? `en ${storeLabel(food.priceStore)}` : "Tienda no especificada"}
    </span>
  );
}

function priceCell(food: FoodRow, formatRange: FormatRangeKey | null): PriceCell {
  if (formatRange) {
    const cheapest = cheapestInRange(food.pricesByFormat, formatRange);
    if (cheapest) {
      return {
        exact: cheapest.price,
        content: (
          <>
            <span className={styles.bigValue}>{formatClp(cheapest.price)}</span>
            <span className={styles.note}>
              {cheapest.format}
              {cheapest.store ? ` · ${storeLabel(cheapest.store)}` : ""}
            </span>
          </>
        ),
      };
    }

    // Sin desglose por tamaño, pero el producto sí viene en un formato
    // de este rango: precio general, avisando que puede no ser exacto.
    if (hasFormatInRange(food.formats, formatRange) && food.priceMin !== null) {
      return {
        exact: null,
        content: (
          <>
            <span className={styles.bigValue}>{formatClp(food.priceMin)}</span>
            <span className={styles.warning}>precio general, puede no ser de este tamaño</span>
            <StoreLink food={food} />
          </>
        ),
      };
    }

    return {
      exact: null,
      content: <span className={styles.empty}>No disponible en este rango</span>,
    };
  }

  if (food.priceMin !== null) {
    return {
      exact: food.priceMin,
      content: (
        <>
          <span className={styles.bigValue}>{formatClp(food.priceMin)}</span>
          <StoreLink food={food} />
        </>
      ),
    };
  }

  return { exact: null, content: <span className={styles.empty}>No disponible</span> };
}

function perKgCell(food: FoodRow): PriceCell {
  const bestFormat = bestPricePerKgFormat(food.pricesByFormat);

  if (bestFormat) {
    return {
      exact: bestFormat.pricePerKg,
      content: (
        <>
          <span className={styles.bigValue}>{formatClp(bestFormat.pricePerKg!)}/kg</span>
          <span className={styles.note}>comprando el formato de {bestFormat.format}</span>
        </>
      ),
    };
  }

  if (food.pricePerKg !== null) {
    return {
      exact: food.pricePerKg,
      content: <span className={styles.bigValue}>{formatClp(food.pricePerKg)}/kg</span>,
    };
  }

  return { exact: null, content: <span className={styles.empty}>No calculable</span> };
}

/** Índice(s) del valor mínimo, solo si hay al menos 2 valores comparables. */
function lowestIndexes(values: (number | null)[]): Set<number> {
  const numeric = values.filter((v): v is number => v !== null);
  if (numeric.length < 2) return new Set();

  const min = Math.min(...numeric);
  return new Set(values.flatMap((v, i) => (v === min ? [i] : [])));
}

function NutrientRow({
  label,
  items,
  pick,
}: {
  label: string;
  items: ScoredFood[];
  pick: (food: FoodRow) => number | null;
}) {
  const values = items.map(({ food }) => pick(food));
  const max = Math.max(0, ...values.filter((v): v is number => v !== null));

  return (
    <tr>
      <th scope="row" className={styles.rowLabel}>{label}</th>
      {items.map(({ food }, index) => {
        const value = values[index];
        return (
          <td key={food.id}>
            {value === null ? (
              <span className={styles.empty}>Sin dato</span>
            ) : (
              <div className={styles.nutrient}>
                <span className={styles.nutrientValue}>{value}%</span>
                <span className={styles.bar} aria-hidden="true">
                  <span
                    className={styles.barFill}
                    style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
                  />
                </span>
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

function GroupRow({ label, span }: { label: string; span: number }) {
  return (
    <tr className={styles.groupRow}>
      <th colSpan={span} scope="colgroup">{label}</th>
    </tr>
  );
}

export default function ComparisonTable({ title, items, onRemove, formatRange }: ComparisonTableProps) {
  if (items.length === 0) return null;

  const span = items.length + 1;
  const bestScore = Math.max(...items.map((item) => item.score));
  const prices = items.map(({ food }) => priceCell(food, formatRange));
  const perKg = items.map(({ food }) => perKgCell(food));
  const cheapest = lowestIndexes(prices.map((p) => p.exact));
  const cheapestPerKg = lowestIndexes(perKg.map((p) => p.exact));
  const rangeLabel = FORMAT_RANGES.find((r) => r.key === formatRange)?.label;

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <h2>{title}</h2>
        <p>
          <span className={styles.legendBest}>Mejor</span> marca el valor más
          conveniente de cada fila, cuando se puede comparar con exactitud.
        </p>
      </div>

      <div className={styles.scroll}>
        <table
          className={styles.table}
          style={{ minWidth: LABEL_COLUMN_WIDTH + items.length * FOOD_COLUMN_MIN_WIDTH }}
        >
          <thead>
            <tr>
              <th scope="col" className={styles.corner} style={{ width: LABEL_COLUMN_WIDTH }}>
                <span className={styles.srOnly}>Característica</span>
              </th>
              {items.map(({ food, score, coverage }) => {
                const tier = scoreTier(score);
                const isBest = items.length > 1 && score === bestScore;

                return (
                  <th key={food.id} scope="col" className={styles.foodHead}>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => onRemove(food.id)}
                      aria-label={`Quitar ${formatDisplayName(food.name)} de la comparación`}
                      title="Quitar de la comparación"
                    >
                      ×
                    </button>

                    <span className={styles.brand}>{food.brand}</span>
                    <span className={styles.foodName}>{formatDisplayName(food.name)}</span>

                    <span className={`${styles.score} ${styles[tier]}`}>
                      {Math.min(100, Math.round(score))}%
                      <small>compatible</small>
                    </span>

                    <span className={styles.coverage}>
                      {Math.round(coverage)}% de datos verificados
                    </span>

                    {isBest && <span className={styles.bestBadge}>Más compatible</span>}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            <GroupRow label="Precio" span={span} />

            <tr>
              <th scope="row" className={styles.rowLabel}>
                Precio
                {rangeLabel && <span className={styles.rowHint}>formato {rangeLabel}</span>}
              </th>
              {prices.map((price, index) => (
                <td
                  key={items[index].food.id}
                  className={cheapest.has(index) ? styles.bestCell : undefined}
                >
                  <div className={styles.stack}>
                    {price.content}
                    {cheapest.has(index) && <span className={styles.bestTag}>Más barato</span>}
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <th scope="row" className={styles.rowLabel}>Precio por kilo</th>
              {perKg.map((price, index) => (
                <td
                  key={items[index].food.id}
                  className={cheapestPerKg.has(index) ? styles.bestCell : undefined}
                >
                  <div className={styles.stack}>
                    {price.content}
                    {cheapestPerKg.has(index) && <span className={styles.bestTag}>Mejor precio/kg</span>}
                  </div>
                </td>
              ))}
            </tr>

            <GroupRow label="Nutrición" span={span} />
            <NutrientRow label="Proteína" items={items} pick={(food) => food.protein} />
            <NutrientRow label="Grasa" items={items} pick={(food) => food.fat} />
            <NutrientRow label="Fibra" items={items} pick={(food) => food.fiber} />

            <GroupRow label="Producto" span={span} />

            <tr>
              <th scope="row" className={styles.rowLabel}>Tipo y etapa</th>
              {items.map(({ food }) => (
                <td key={food.id}>
                  <div className={styles.chips}>
                    <span className={styles.chip}>{TYPE_LABELS[food.type] ?? "Tipo no indicado"}</span>
                    <span className={styles.chip}>{STAGE_LABELS[food.stage] ?? "Etapa no indicada"}</span>
                  </div>
                </td>
              ))}
            </tr>

            <tr>
              <th scope="row" className={styles.rowLabel}>Primer ingrediente</th>
              {items.map(({ food }) => (
                <td key={food.id}>
                  {food.firstIngredient ?? <span className={styles.empty}>Sin dato</span>}
                </td>
              ))}
            </tr>

            <tr>
              <th scope="row" className={styles.rowLabel}>Formatos</th>
              {items.map(({ food }) => {
                const { visible, hiddenCount } = summarizeFormats(food.formats);
                return (
                  <td key={food.id}>
                    {visible.length > 0 ? (
                      <div className={styles.chips}>
                        {visible.map((format) => (
                          <span key={format} className={styles.chipSoft}>{format}</span>
                        ))}
                        {hiddenCount > 0 && (
                          <span className={styles.note}>+{hiddenCount} más</span>
                        )}
                      </div>
                    ) : (
                      <span className={styles.empty}>No informado</span>
                    )}
                  </td>
                );
              })}
            </tr>

            <GroupRow label="Evaluación para tu mascota" span={span} />

            <tr>
              <th scope="row" className={styles.rowLabel}>A favor</th>
              {items.map(({ food, positives }) => (
                <td key={food.id}>
                  {positives.length > 0 ? (
                    <ul className={`${styles.points} ${styles.pointsGood}`}>
                      {positives.map((text, index) => (
                        <li key={index}>{text}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className={styles.empty}>—</span>
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <th scope="row" className={styles.rowLabel}>A considerar</th>
              {items.map(({ food, considerations }) => (
                <td key={food.id}>
                  {considerations.length > 0 ? (
                    <ul className={`${styles.points} ${styles.pointsWarn}`}>
                      {considerations.map((text, index) => (
                        <li key={index}>{text}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className={styles.empty}>Nada que destacar</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
