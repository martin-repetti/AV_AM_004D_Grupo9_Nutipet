import PriceHistoryPanel from "@/components/priceHistory/PriceHistoryPanel";
import pool from "@/lib/db";
import { getFoodWithLongestHistory } from "@/services/priceHistory";
import styles from "./HistorialPrecios.module.css";

export default async function HistorialPreciosPage() {
  const initialFood = await getFoodWithLongestHistory(pool);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>Historial</span>
        <h1>Historial de precios</h1>
        <p className={styles.subtitle}>
          Busca un alimento para ver cómo ha variado su precio en las tiendas
          que revisamos antes de decidir tu compra.
        </p>

        <PriceHistoryPanel initialFood={initialFood} />
      </div>
    </main>
  );
}
