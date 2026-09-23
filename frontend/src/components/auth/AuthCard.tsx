import Link from "next/link";
import styles from "./AuthCard.module.css";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>🐾</span>
          <span>NutriPet</span>
        </Link>

        <h1>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {children}
      </div>
    </main>
  );
}
