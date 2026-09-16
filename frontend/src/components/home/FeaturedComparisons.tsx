import styles from "./FeaturedComparisons.module.css";

const foods = [
  {
    name: "Royal Canin Adult",
    brand: "Royal Canin",
    compatibility: 92,
    price: "$48.990",
    protein: "26%",
    fat: "15%",
  },
  {
    name: "Pro Plan Adult",
    brand: "Purina",
    compatibility: 88,
    price: "$44.990",
    protein: "27%",
    fat: "14%",
  },
  {
    name: "Brit Care Adult",
    brand: "Brit Care",
    compatibility: 84,
    price: "$39.990",
    protein: "25%",
    fat: "13%",
  },
];

export default function FeaturedComparisons() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>COMPARA MEJOR</span>

          <h2>Alimentos destacados</h2>

          <p>
            Revisa rápidamente compatibilidad, precio y características
            nutricionales.
          </p>
        </div>

        <div className={styles.grid}>
          {foods.map((food) => (
            <article key={food.name} className={styles.card}>
              <div className={styles.imagePlaceholder}>
                🥣
              </div>

              <div className={styles.cardContent}>
                <p className={styles.brand}>{food.brand}</p>

                <h3>{food.name}</h3>

                <div className={styles.compatibility}>
                  <span>Compatibilidad</span>
                  <strong>{food.compatibility}%</strong>
                </div>

                <div className={styles.details}>
                  <div>
                    <span>Proteína</span>
                    <strong>{food.protein}</strong>
                  </div>

                  <div>
                    <span>Grasa</span>
                    <strong>{food.fat}</strong>
                  </div>
                </div>

                <div className={styles.footer}>
                  <div>
                    <span>Desde</span>
                    <strong>{food.price}</strong>
                  </div>

                  <button type="button">Comparar</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}