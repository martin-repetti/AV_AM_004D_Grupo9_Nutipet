import Link from "next/link";
import pool from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getFavoriteFoods } from "@/services/favorites";
import { getFoodWithLongestHistory, getPriceHistory } from "@/services/priceHistory";
import { getUserPlan, isPremium } from "@/services/plans";
import { priceAlertsFor, type PriceAlert } from "@/utils/priceAlerts";
import FavoritosClient from "./FavoritosClient";
import styles from "./Favoritos.module.css";

export default async function FavoritosPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔒</div>
            <h2>Inicia sesión para ver tus favoritos.</h2>
            <p>
              Tus alimentos favoritos y su historial de precios se guardan en
              tu cuenta. Sin cuenta, puedes revisar el historial de cualquier
              alimento.
            </p>
            <div className={styles.emptyActions}>
              <Link href="/login" className={styles.emptyButton}>
                Iniciar sesión
              </Link>
              <Link href="/historial-precios" className={styles.emptyLink}>
                Ver historial de precios
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const [favorites, plan] = await Promise.all([getFavoriteFoods(pool, userId), getUserPlan(pool, userId)]);
  const fallbackHistoryFood = favorites.length === 0 ? await getFoodWithLongestHistory(pool) : null;

  // Alertas de precio (Premium): bajas en el último registro de cada favorito.
  let alerts: PriceAlert[] | null = null;
  if (isPremium(plan)) {
    const histories = await Promise.all(
      favorites.map(({ food }) => getPriceHistory(pool, food.id).then((records) => priceAlertsFor(food.id, records)))
    );
    alerts = histories.flat().sort((a, b) => b.dropPercent - a.dropPercent);
  }

  return (
    <FavoritosClient
      initialFavorites={favorites}
      fallbackHistoryFood={fallbackHistoryFood}
      alerts={alerts}
    />
  );
}
