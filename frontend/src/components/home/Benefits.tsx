import styles from "./Benefits.module.css";

const benefits = [
  {
    icon: "🎯",
    title: "Recomendaciones personalizadas",
    description:
      "Encuentra alimentos compatibles con la edad, peso, actividad y necesidades de tu mascota.",
  },
  {
    icon: "📊",
    title: "Comparación nutricional",
    description:
      "Compara proteínas, grasas, fibra, energía y otros datos relevantes en un solo lugar.",
  },
  {
    icon: "💰",
    title: "Mejor decisión de compra",
    description:
      "Revisa precios, formatos y costo estimado para elegir una alternativa conveniente.",
  },
  {
    icon: "🐾",
    title: "Perfil de cada mascota",
    description:
      "Guarda varias mascotas y mantén actualizadas sus características y necesidades.",
  },
];

export default function Benefits() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>¿POR QUÉ NUTRIPET?</span>
          <h2>Todo lo necesario para elegir mejor</h2>
          <p>
            NutriPet reúne información nutricional, características de tu
            mascota y precios para ayudarte a tomar decisiones más informadas.
          </p>
        </div>

        <div className={styles.grid}>
          {benefits.map((benefit) => (
            <article key={benefit.title} className={styles.card}>
              <div className={styles.icon}>{benefit.icon}</div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}