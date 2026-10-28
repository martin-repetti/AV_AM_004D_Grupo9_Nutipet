import styles from "./FavoriteButton.module.css";

export type FavoriteToggle = {
  active: boolean;
  onToggle: () => void;
};

type FavoriteButtonProps = FavoriteToggle & {
  foodName: string;
};

export default function FavoriteButton({ active, onToggle, foodName }: FavoriteButtonProps) {
  const label = active ? `Quitar ${foodName} de favoritos` : `Guardar ${foodName} en favoritos`;

  return (
    <button
      type="button"
      className={`${styles.button} ${active ? styles.active : ""}`}
      aria-pressed={active}
      aria-label={label}
      title={active ? "Quitar de favoritos" : "Guardar en favoritos"}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
      </svg>
    </button>
  );
}
