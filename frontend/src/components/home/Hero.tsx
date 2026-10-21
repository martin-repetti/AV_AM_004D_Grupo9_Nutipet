import Link from "next/link";
import { formatDisplayName } from "@/utils/productName";
import { scoreTier } from "@/utils/scoreTier";
import styles from "./Hero.module.css";

export type HeroPreview = {
  profileLabel: string;
  foods: {
    id: number;
    brand: string;
    name: string;
    score: number;
    priceMin: number | null;
  }[];
};

type HeroProps = {
  preview: HeroPreview;
};

export default function Hero({ preview }: HeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>Comparador de alimentos para perros y gatos</span>

          <h1>
            Compara y elige el mejor alimento para{" "}
            <span>tu mascota</span>
          </h1>

          <p>
            Ingresa cómo es tu mascota y te mostramos qué alimentos le
            convienen, por qué, y dónde comprarlos al mejor precio.
          </p>

          <div className={styles.actions}>
            <Link href="/comparar" className={styles.primaryButton}>
              Comparar alimentos
            </Link>

            <Link href="/mascotas" className={styles.secondaryButton}>
              Mis mascotas
            </Link>
          </div>

          <p className={styles.guestHint}>
            No necesitas cuenta para probarlo.
          </p>
        </div>

        <aside className={styles.preview} aria-label="Ejemplo de resultados de NutriPet">
          <div className={styles.previewHeader}>
            <span className={styles.previewTag}>Ejemplo real</span>
            <span className={styles.previewProfile}>🐱 {preview.profileLabel}</span>
          </div>

          <ol className={styles.previewList}>
            {preview.foods.map((food, index) => {
              const tier = scoreTier(food.score);
              return (
                <li key={food.id} className={styles.previewItem}>
                  <span className={styles.rank}>{index + 1}</span>

                  <span className={styles.previewFood}>
                    <span className={styles.previewBrand}>{food.brand}</span>
                    <span className={styles.previewName}>{formatDisplayName(food.name)}</span>
                    {food.priceMin !== null && (
                      <span className={styles.previewPrice}>
                        Desde ${food.priceMin.toLocaleString("es-CL")}
                      </span>
                    )}
                  </span>

                  <span className={`${styles.previewScore} ${styles[tier]}`}>
                    {Math.min(100, Math.round(food.score))}%
                  </span>
                </li>
              );
            })}
          </ol>

          <p className={styles.previewNote}>
            Resultado del mismo motor y catálogo que usarás al comparar.
          </p>

          <Link href="/comparar" className={styles.previewLink}>
            Probar con tu mascota →
          </Link>
        </aside>
      </div>
    </section>
  );
}
