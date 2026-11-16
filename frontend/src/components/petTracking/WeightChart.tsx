import type { FoodLog, WeightLog } from "@/services/petTracking";
import { formatHistoryDate } from "@/utils/priceHistory";
import styles from "./WeightChart.module.css";

type WeightChartProps = {
  weights: WeightLog[];
  foods: FoodLog[];
};

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 20, right: 20, bottom: 34, left: 48 };

const dayNumber = (date: string) => Date.parse(`${date}T00:00:00Z`) / 86_400_000;
const dateFromDay = (day: number) => new Date(day * 86_400_000).toISOString().slice(0, 10);

/**
 * Evolución del peso con los cambios de alimento marcados en la misma
 * línea de tiempo. Sin JavaScript en el cliente: también se usa en el
 * reporte imprimible.
 */
export default function WeightChart({ weights, foods }: WeightChartProps) {
  if (weights.length === 0) {
    return <p className={styles.empty}>Todavía no hay registros de peso.</p>;
  }

  const days = [...weights.map((w) => dayNumber(w.recordedOn)), ...foods.map((f) => dayNumber(f.startedOn))];
  let minDay = Math.min(...days);
  let maxDay = Math.max(...days);
  if (minDay === maxDay) {
    minDay -= 15;
    maxDay += 15;
  }

  const values = weights.map((w) => w.weightKg);
  const spread = Math.max(...values) - Math.min(...values);
  const margin = Math.max(spread * 0.25, 0.5);
  const minKg = Math.max(0, Math.min(...values) - margin);
  const maxKg = Math.max(...values) + margin;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (date: string) => PAD.left + ((dayNumber(date) - minDay) / (maxDay - minDay)) * plotW;
  const y = (kg: number) => PAD.top + (1 - (kg - minKg) / (maxKg - minKg)) * plotH;

  const ticks = [0, 0.5, 1].map((t) => minKg + t * (maxKg - minKg));
  const points = weights.map((w) => `${x(w.recordedOn)},${y(w.weightKg)}`).join(" ");

  return (
    <figure className={styles.figure}>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Gráfico de evolución del peso">
        {ticks.map((kg) => (
          <g key={kg}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(kg)} y2={y(kg)} className={styles.grid} />
            <text x={PAD.left - 8} y={y(kg) + 4} textAnchor="end" className={styles.axis}>
              {kg.toFixed(1).replace(".", ",")}
            </text>
          </g>
        ))}

        {foods.map((food, index) => (
          <g key={food.id}>
            <line
              x1={x(food.startedOn)}
              x2={x(food.startedOn)}
              y1={PAD.top}
              y2={HEIGHT - PAD.bottom}
              className={styles.foodLine}
            />
            <circle cx={x(food.startedOn)} cy={PAD.top} r={9} className={styles.foodDot} />
            <text x={x(food.startedOn)} y={PAD.top + 4} textAnchor="middle" className={styles.foodNumber}>
              {index + 1}
            </text>
          </g>
        ))}

        <polyline points={points} className={styles.line} />
        {weights.map((w) => (
          <circle key={w.id} cx={x(w.recordedOn)} cy={y(w.weightKg)} r={4} className={styles.point}>
            <title>{`${formatHistoryDate(w.recordedOn)}: ${w.weightKg} kg`}</title>
          </circle>
        ))}

        <text x={PAD.left} y={HEIGHT - 10} className={styles.axis}>
          {formatHistoryDate(dateFromDay(minDay))}
        </text>
        <text x={WIDTH - PAD.right} y={HEIGHT - 10} textAnchor="end" className={styles.axis}>
          {formatHistoryDate(dateFromDay(maxDay))}
        </text>
      </svg>

      {foods.length > 0 && (
        <figcaption className={styles.legend}>
          {foods.map((food, index) => (
            <span key={food.id}>
              <b>{index + 1}</b> {formatHistoryDate(food.startedOn)}: {food.foodName}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}
