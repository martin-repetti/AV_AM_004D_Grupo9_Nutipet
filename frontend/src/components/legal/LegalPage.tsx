import type { ReactNode } from "react";
import styles from "./LegalPage.module.css";

interface LegalPageProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  updated?: string;
  children: ReactNode;
}

export default function LegalPage({
  eyebrow,
  title,
  subtitle,
  updated,
  children,
}: LegalPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1>{title}</h1>

        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {updated && <span className={styles.updated}>{updated}</span>}

        {children}
      </div>
    </main>
  );
}
