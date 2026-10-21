import Link from "next/link";
import styles from "./HowItWorks.module.css";

export type CatalogStats = {
  foods: number;
  brands: number;
  stores: number;
};

type HowItWorksProps = {
  stats: CatalogStats;
};

const STEPS = [
  {
    title: "Cuéntanos de tu mascota",
    text: "Especie, edad, peso, nivel de actividad, condición corporal y alergias. Puedes guardarla en tu cuenta o probar como invitado.",
  },
  {
    title: "El motor evalúa cada alimento",
    text: "Descarta los que no son de su especie o contienen un alérgeno, y pondera seis criterios para calcular qué tan compatible es cada uno.",
  },
  {
    title: "Compara y decide",
    text: "Ve las mejores opciones lado a lado, con el porqué de cada puntaje, el precio por formato y el mejor precio por kilo.",
  },
];

export default function HowItWorks({ stats }: HowItWorksProps) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Cómo funciona</span>
          <h2>De las características de tu mascota a una decisión clara</h2>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.stats}>
          <div>
            <strong>{stats.foods}</strong>
            <span>alimentos para comparar</span>
          </div>
          <div>
            <strong>{stats.brands}</strong>
            <span>marcas</span>
          </div>
          <div>
            <strong>{stats.stores}</strong>
            <span>tiendas con precios</span>
          </div>
          <Link href="/comparar" className={styles.cta}>
            Empezar a comparar
          </Link>
        </div>
      </div>
    </section>
  );
}
