import Link from "next/link";
import { featureByKey } from "@/utils/planFeatures";
import styles from "./PremiumLock.module.css";

type PremiumLockProps = {
  /** Clave del beneficio en PLAN_FEATURES. */
  feature: string;
  /** Versión de una línea, para dentro de otra tarjeta. */
  compact?: boolean;
};

/** Lo que ve un usuario del plan Gratis en lugar de una función Premium. */
export default function PremiumLock({ feature, compact = false }: PremiumLockProps) {
  const { title, description } = featureByKey(feature);

  if (compact) {
    return (
      <p className={styles.compact}>
        <span className={styles.badge}>Premium</span>
        {description}{" "}
        <Link href="/planes">Ver planes</Link>
      </p>
    );
  }

  return (
    <section className={styles.lock}>
      <span className={styles.badge}>Premium</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href="/planes" className={styles.button}>
        Desbloquear con Premium
      </Link>
    </section>
  );
}
