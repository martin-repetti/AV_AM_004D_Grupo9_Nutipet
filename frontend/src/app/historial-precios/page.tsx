"use client";
import { useMemo, useState } from "react";
import { MOCK_FOODS } from "@/services/mockFoods";
import { getPriceHistoryByFoodId } from "@/services/mockPriceHistory";
import { formatMonthLabel } from "@/utils/date";
import styles from "./HistorialPrecios.module.css";

const MAX_BAR_HEIGHT = 160;

export default function HistorialPreciosPage() {
  const [selectedFoodId, setSelectedFoodId] = useState(MOCK_FOODS[0].id);

  const selectedFood = MOCK_FOODS.find((food) => food.id === selectedFoodId);
  const points = useMemo(
    () => getPriceHistoryByFoodId(selectedFoodId)?.points ?? [],
    [selectedFoodId]
  );

  const stats = useMemo(() => {
    if (points.length === 0) return null;

    const prices = points.map((point) => point.price);
    const current = prices[prices.length - 1];
    const first = prices[0];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const variation = ((current - first) / first) * 100;

    return { current, min, max, variation };
  }, [points]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>Historial</span>
        <h1>Historial de precios</h1>
        <p className={styles.subtitle}>
          Revisa cómo ha variado el precio de un alimento en los últimos
          meses antes de decidir tu compra.
        </p>

        <div className={styles.selectorRow}>
          <label htmlFor="food">Alimento</label>
          <select
            id="food"
            value={selectedFoodId}
            onChange={(e) => setSelectedFoodId(Number(e.target.value))}
          >
            {MOCK_FOODS.map((food) => (
              <option key={food.id} value={food.id}>
                {food.brand} — {food.name}
              </option>
            ))}
          </select>
        </div>

        {stats && selectedFood && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span>Precio actual</span>
                <strong>${stats.current.toLocaleString("es-CL")}</strong>
              </div>

              <div className={styles.statCard}>
                <span>Precio mínimo</span>
                <strong>${stats.min.toLocaleString("es-CL")}</strong>
              </div>

              <div className={styles.statCard}>
                <span>Precio máximo</span>
                <strong>${stats.max.toLocaleString("es-CL")}</strong>
              </div>

              <div
                className={`${styles.statCard} ${
                  stats.variation > 0 ? styles.statBad : styles.statGood
                }`}
              >
                <span>Variación</span>
                <strong>
                  {stats.variation > 0 ? "+" : ""}
                  {stats.variation.toFixed(1)}%
                </strong>
              </div>
            </div>

            <section className={styles.chartCard}>
              <h2>
                Evolución de precio — {selectedFood.brand} {selectedFood.name}
              </h2>

              <div className={styles.chart}>
                {points.map((point) => (
                  <div key={point.month} className={styles.bar}>
                    <span className={styles.barValue}>
                      ${Math.round(point.price / 1000)}k
                    </span>

                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{
                          height: `${
                            (point.price / stats.max) * MAX_BAR_HEIGHT
                          }px`,
                        }}
                      />
                    </div>

                    <span className={styles.barLabel}>
                      {formatMonthLabel(point.month)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.historyCard}>
              <h2>Detalle cronológico</h2>

              <ul>
                {points.map((point) => (
                  <li key={point.month}>
                    <span>{formatMonthLabel(point.month)}</span>
                    <strong>${point.price.toLocaleString("es-CL")}</strong>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
