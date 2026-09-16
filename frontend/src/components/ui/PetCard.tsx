import styles from "./PetCard.module.css";

type PetCardProps = {
  name: string;
  species: string;
  age: string;
  weight: string;
  activity: string;
  icon: string;
};

export default function PetCard({
  name,
  species,
  age,
  weight,
  activity,
  icon,
}: PetCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>{icon}</div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <p className={styles.species}>{species}</p>
            <h3>{name}</h3>
          </div>

          <button className={styles.editButton}>Editar</button>
        </div>

        <div className={styles.infoGrid}>
          <div>
            <span>Edad</span>
            <strong>{age}</strong>
          </div>

          <div>
            <span>Peso</span>
            <strong>{weight}</strong>
          </div>

          <div>
            <span>Actividad</span>
            <strong>{activity}</strong>
          </div>
        </div>

        <button className={styles.profileButton}>Ver perfil</button>
      </div>
    </article>
  );
}