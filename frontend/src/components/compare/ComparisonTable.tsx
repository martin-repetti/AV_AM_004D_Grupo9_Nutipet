import type { ScoredFood } from "@/lib/compatibility/types";
import { formatDisplayName } from "@/utils/productName";
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
  seco: "Alimento seco",
  humedo: "Alimento húmedo",
};

const STAGE_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  adulto: "Adulto",
  senior: "Senior",
};

type ComparisonTableProps = {
  items: ScoredFood[];
  onRemove: (foodId: number) => void;
  /** Rango de formato elegido arriba (ej. "5-15"), o null si no se eligió ninguno. */
  formatRange: FormatRangeKey | null;
};

export default function ComparisonTable({ items, onRemove, formatRange }: ComparisonTableProps) {
  if (items.length === 0) return null;

  return (
    <section className={styles.wrapper}>
      <h2>Comparando {items.length} alimentos</h2>

      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>&nbsp;</th>
              {items.map(({ food }) => (
                <th key={food.id}>
                  <span className={styles.foodName}>{formatDisplayName(food.name)}</span>
                  <span className={styles.brand}>{food.brand}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Compatibilidad</td>
              {items.map(({ food, score, coverage }) => (
                <td key={food.id} className={styles.scoreCell}>
                  <strong>{Math.min(100, Math.round(score))}%</strong>
                  <br />
                  <span className={styles.brand}>
                    {Math.round(coverage)}% de datos verificados
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <td>Tipo</td>
              {items.map(({ food }) => (
                <td key={food.id}>{TYPE_LABELS[food.type] ?? "—"}</td>
              ))}
            </tr>

            <tr>
              <td>Etapa</td>
              {items.map(({ food }) => (
                <td key={food.id}>{STAGE_LABELS[food.stage] ?? "No indicada"}</td>
              ))}
            </tr>

            <tr>
              <td>Proteína</td>
              {items.map(({ food }) => (
                <td key={food.id}>{food.protein !== null ? `${food.protein}%` : "—"}</td>
              ))}
            </tr>

            <tr>
              <td>Grasa</td>
              {items.map(({ food }) => (
                <td key={food.id}>{food.fat !== null ? `${food.fat}%` : "—"}</td>
              ))}
            </tr>

            <tr>
              <td>Fibra</td>
              {items.map(({ food }) => (
                <td key={food.id}>{food.fiber !== null ? `${food.fiber}%` : "—"}</td>
              ))}
            </tr>

            <tr>
              <td>Primer ingrediente</td>
              {items.map(({ food }) => (
                <td key={food.id}>{food.firstIngredient ?? "—"}</td>
              ))}
            </tr>

            <tr>
              <td>Formatos</td>
              {items.map(({ food }) => {
                const { visible, hiddenCount } = summarizeFormats(food.formats);
                return (
                  <td key={food.id}>
                    {visible.length > 0 ? (
                      <>
                        {visible.join(", ")}
                        {hiddenCount > 0 && (
                          <span className={styles.brand}> +{hiddenCount} más</span>
                        )}
                      </>
                    ) : (
                      "No informado"
                    )}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Precio</td>
              {items.map(({ food }) => (
                <td key={food.id}>
                  {food.priceMin !== null ? (
                    <>
                      {`$${food.priceMin.toLocaleString("es-CL")}`}
                      <br />
                      {food.priceUrl ? (
                        <a
                          href={food.priceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.priceLink}
                        >
                          Ver en {food.priceStore ?? "la tienda"}
                        </a>
                      ) : (
                        <span className={styles.brand}>
                          {food.priceStore ? `en ${food.priceStore}` : "Tienda no especificada"}
                        </span>
                      )}
                    </>
                  ) : (
                    "No disponible"
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>
                Precio según formato
                {formatRange && (
                  <span className={styles.brand}>
                    {FORMAT_RANGES.find((r) => r.key === formatRange)?.label}
                  </span>
                )}
              </td>
              {items.map(({ food }) => {
                if (!formatRange) {
                  return (
                    <td key={food.id} className={styles.brand}>
                      Elige un formato arriba
                    </td>
                  );
                }

                const cheapest = cheapestInRange(food.pricesByFormat, formatRange);
                if (cheapest) {
                  return (
                    <td key={food.id}>
                      {`$${cheapest.price.toLocaleString("es-CL")}`}
                      <br />
                      <span className={styles.brand}>
                        {cheapest.format}
                        {cheapest.store ? ` · ${cheapest.store}` : ""}
                      </span>
                    </td>
                  );
                }

                if (hasFormatInRange(food.formats, formatRange)) {
                  return (
                    <td key={food.id} className={styles.brand}>
                      Disponible en este rango, precio no especificado por tamaño
                    </td>
                  );
                }

                return (
                  <td key={food.id} className={styles.brand}>
                    No disponible en este rango
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Mejor precio por kilo</td>
              {items.map(({ food }) => {
                const bestFormat = bestPricePerKgFormat(food.pricesByFormat);

                if (bestFormat) {
                  return (
                    <td key={food.id}>
                      {`$${bestFormat.pricePerKg!.toLocaleString("es-CL")}/kg`}
                      <br />
                      <span className={styles.brand}>
                        comprando el formato de {bestFormat.format}
                      </span>
                    </td>
                  );
                }

                if (food.pricePerKg !== null) {
                  return <td key={food.id}>{`$${food.pricePerKg.toLocaleString("es-CL")}/kg`}</td>;
                }

                return (
                  <td key={food.id} className={styles.brand}>
                    No calculable
                  </td>
                );
              })}
            </tr>

            <tr>
              <td>Aspectos favorables</td>
              {items.map(({ food, positives }) => (
                <td key={food.id}>
                  {positives.length > 0 ? (
                    <ul className={styles.list}>
                      {positives.map((text, index) => (
                        <li key={index}>{text}</li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>Aspectos por considerar</td>
              {items.map(({ food, considerations }) => (
                <td key={food.id}>
                  {considerations.length > 0 ? (
                    <ul className={styles.list}>
                      {considerations.map((text, index) => (
                        <li key={index}>{text}</li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>
              ))}
            </tr>

            <tr>
              <td>&nbsp;</td>
              {items.map(({ food }) => (
                <td key={food.id}>
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => onRemove(food.id)}
                  >
                    Quitar de la comparación
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
