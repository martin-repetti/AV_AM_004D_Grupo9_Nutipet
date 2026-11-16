"use client";
import { useState } from "react";
import Link from "next/link";
import FavoriteFoodCard from "@/components/favorites/FavoriteFoodCard";
import PriceHistoryPanel from "@/components/priceHistory/PriceHistoryPanel";
import type { FavoriteFood } from "@/services/favorites";
import type { PriceHistoryFood } from "@/types/priceHistory";
import type { PriceAlert } from "@/utils/priceAlerts";
import { formatHistoryDate } from "@/utils/priceHistory";
import { formatDisplayName } from "@/utils/productName";
import PremiumLock from "@/components/premium/PremiumLock";
import styles from "./Favoritos.module.css";

type FavoritosClientProps = {
  initialFavorites: FavoriteFood[];
  /** Para el historial cuando no hay favoritos. */
  fallbackHistoryFood: PriceHistoryFood | null;
  /** Alertas de precio de los favoritos; null en el plan Gratis. */
  alerts: PriceAlert[] | null;
};

function toHistoryFood({ food }: FavoriteFood): PriceHistoryFood {
  return { id: food.id, brand: food.brand, name: food.name };
}

export default function FavoritosClient({
  initialFavorites,
  fallbackHistoryFood,
  alerts,
}: FavoritosClientProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [historyFoodId, setHistoryFoodId] = useState<number | null>(
    initialFavorites[0]?.food.id ?? null
  );
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const historyFavorites = favorites.map(toHistoryFood);
  const historyFood =
    historyFavorites.find((food) => food.id === historyFoodId) ??
    historyFavorites[0] ??
    fallbackHistoryFood;

  const handleRemove = async (foodId: number) => {
    setRemovingId(foodId);
    setError("");
    try {
      const response = await fetch(`/api/favorites/${foodId}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setFavorites((prev) => prev.filter((entry) => entry.food.id !== foodId));
    } catch {
      setError("No pudimos quitar el favorito. Intenta de nuevo.");
    } finally {
      setRemovingId(null);
    }
  };

  const showHistory = (foodId: number) => {
    setHistoryFoodId(foodId);
    document.getElementById("historial")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>Mis favoritos</span>
        <h1>Alimentos favoritos</h1>
        <p className={styles.subtitle}>
          Los alimentos que guardes aquí quedarán a mano para comparar o
          revisar más tarde.
        </p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {favorites.length > 0 &&
          (alerts === null ? (
            <div className={styles.alertsLock}>
              <PremiumLock feature="alertas" compact />
            </div>
          ) : (
            <section className={styles.alerts} aria-labelledby="alertsTitle">
              <h2 id="alertsTitle">Alertas de precio</h2>
              {(() => {
                const visible = alerts.filter((alert) => favorites.some(({ food }) => food.id === alert.foodId));
                if (visible.length === 0) {
                  return (
                    <p className={styles.alertsEmpty}>
                      Ninguno de tus favoritos bajó de precio en el último registro. Revisamos cada
                      vez que se actualiza el catálogo.
                    </p>
                  );
                }
                return (
                  <ul>
                    {visible.map((alert) => {
                      const food = favorites.find((entry) => entry.food.id === alert.foodId)!.food;
                      return (
                        <li key={`${alert.foodId}-${alert.store}-${alert.format}`}>
                          <span className={alert.kind === "minimo" ? styles.alertBest : styles.alertDrop}>
                            {alert.kind === "minimo" ? "Precio más bajo registrado" : "Bajó de precio"}
                          </span>
                          <button type="button" className={styles.alertFood} onClick={() => showHistory(food.id)}>
                            {food.brand ? `${food.brand} — ` : ""}
                            {formatDisplayName(food.name)} · {alert.format}
                          </button>
                          <span className={styles.alertPrice}>
                            <s>${alert.previousPrice.toLocaleString("es-CL")}</s>{" "}
                            <strong>${alert.currentPrice.toLocaleString("es-CL")}</strong>{" "}
                            <em>−{String(alert.dropPercent).replace(".", ",")}%</em>
                          </span>
                          <span className={styles.alertMeta}>
                            {alert.store} · {formatHistoryDate(alert.date)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                );
              })()}
            </section>
          ))}

        {favorites.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🐾</div>
            <h2>No tienes alimentos favoritos todavía.</h2>
            <p>
              En Comparar, toca el corazón de un alimento para guardarlo aquí
              y seguir su precio.
            </p>
            <Link href="/comparar" className={styles.emptyButton}>
              Comparar alimentos
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {favorites.map(({ food, isActive }) => (
              <FavoriteFoodCard
                key={food.id}
                food={food}
                isActive={isActive}
                historySelected={historyFood?.id === food.id}
                onShowHistory={() => showHistory(food.id)}
                onRemove={() => handleRemove(food.id)}
                removing={removingId === food.id}
              />
            ))}
          </div>
        )}

        <section id="historial" className={styles.historySection}>
          <h2>Historial de precios</h2>
          <p className={styles.subtitle}>
            Revisa cómo ha variado el precio de tus favoritos, o busca otro
            alimento.
          </p>

          <PriceHistoryPanel
            // Elegir otro favorito desde su tarjeta reinicia el panel en ese alimento.
            key={historyFood?.id ?? "none"}
            favorites={historyFavorites}
            initialFood={historyFood}
          />
        </section>
      </div>
    </main>
  );
}
