import Image from "next/image";
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
        <Link href="/" className={styles.brand} aria-label="HuellaFit, ir al inicio">
          <Image
            src="/brand/huellafit-logo.png"
            alt="HuellaFit"
            width={900}
            height={267}
            loading="eager"
            className={styles.logo}
          />
        </Link>

        <h1>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {children}
      </div>
    </main>
  );
}
