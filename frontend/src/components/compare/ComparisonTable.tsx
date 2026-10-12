import type { ScoredFood } from "@/lib/compatibility/types";
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
};

export default function ComparisonTable({ items, onRemove }: ComparisonTableProps) {
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
                  <span className={styles.foodName}>{food.name}</span>
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
              {items.map(({ food }) => (
                <td key={food.id}>
                  {food.formats.length > 0 ? food.formats.join(", ") : "No informado"}
                </td>
              ))}
            </tr>

            <tr>
              <td>Precio</td>
              {items.map(({ food }) => (
                <td key={food.id}>
                  {food.priceMin !== null
                    ? `$${food.priceMin.toLocaleString("es-CL")}${food.priceStore ? ` (${food.priceStore})` : ""}`
                    : "No disponible"}
                </td>
              ))}
            </tr>

            <tr>
              <td>Costo mensual estimado</td>
              {items.map(({ food, estimatedMonthlyCost }) => (
                <td key={food.id}>
                  {estimatedMonthlyCost !== null
                    ? `~$${estimatedMonthlyCost.toLocaleString("es-CL")}`
                    : "No calculable"}
                </td>
              ))}
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
