import Link from "next/link";
import styles from "./PetCard.module.css";

type PetCardProps = {
  id: number;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  activity: string;
  icon: string;
};

export default function PetCard({
  id,
  name,
  species,
  breed,
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
            <p className={styles.species}>
              {species} · {breed}
            </p>

            <h3>{name}</h3>
          </div>

          <Link href={`/mascotas/${id}/editar`} className={styles.editButton}>
            Editar
          </Link>
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

        <Link href={`/mascotas/${id}`} className={styles.profileButton}>
          Ver perfil
        </Link>
      </div>
    </article>
  );
}