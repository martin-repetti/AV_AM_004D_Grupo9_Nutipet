"use client";
import { useState } from "react";
import Link from "next/link";
import FoodResultCard from "@/components/compare/FoodResultCard";
import { MOCK_FOODS } from "@/services/mockFoods";
import { MOCK_FAVORITE_FOOD_IDS } from "@/services/mockFavorites";
import styles from "./Favoritos.module.css";

export default function FavoritosPage() {
  // MOCK: el estado de favoritos vive solo en el cliente por ahora.
  const [favoriteIds, setFavoriteIds] = useState<number[]>(
    MOCK_FAVORITE_FOOD_IDS
  );

  const favoriteFoods = MOCK_FOODS.filter((food) =>
    favoriteIds.includes(food.id)
  );

  const handleRemove = (id: number) => {
    setFavoriteIds((prev) => prev.filter((favoriteId) => favoriteId !== id));
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

        {favoriteFoods.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🐾</div>
            <h2>No tienes alimentos favoritos todavía.</h2>
            <p>
              Compara alimentos y marca los que más te interesen para
              guardarlos aquí.
            </p>
            <Link href="/comparar" className={styles.emptyButton}>
              Comparar alimentos
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {favoriteFoods.map((food) => (
              <FoodResultCard
                key={food.id}
                name={food.name}
                brand={food.brand}
                compatibility={food.compatibility}
                price={food.price}
                protein={food.protein}
                fat={food.fat}
                hasColorants={food.hasColorants}
                onRemoveFavorite={() => handleRemove(food.id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
