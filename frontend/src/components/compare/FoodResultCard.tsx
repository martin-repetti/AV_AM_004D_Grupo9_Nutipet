import styles from "./FoodResultCard.module.css";
import { compatClass } from "@/utils/compat";
type FoodResultCardProps = {
    name: string;
    brand: string;
    compatibility: number;
    price: number;
    protein: number;
    fat: number;
    hasColorants: boolean;
    /** Si se entrega, muestra un botón para quitar el alimento de favoritos. */
    onRemoveFavorite?: () => void;
};

export default function FoodResultCard( {
    name,
    brand,
    compatibility,
    price,
    protein,
    fat,
    hasColorants,
    onRemoveFavorite,

}: FoodResultCardProps){
    return(
        <article className={styles.card}>
            <div className={styles.header}>
            <div>
                <p className={styles.brand}>{brand}</p>
                <h2>{name}</h2>
            </div>

            <div
                className={`${styles.score} ${
                    styles[compatClass(compatibility)]
                }`}
            >
                <span>Compatibilidad: </span>
                <strong>{compatibility}%</strong>
            </div>
            </div>

            <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
                <span>Proteína: </span>
                <strong>{protein}%</strong>
            </div>

            <div className={styles.infoItem}>
                <span>Grasa: </span>
                <strong>{fat}%</strong>
            </div>

            <div className={styles.infoItem}>
                <span>Colorantes: </span>
                <strong>{hasColorants ? "Sí" : "No"}</strong>
            </div>

            <div className={styles.infoItem}>
                <span>Desde: </span>
                <strong>${price.toLocaleString("es-CL")}</strong>
            </div>
            </div>
            <div className={styles.actions}>
            {onRemoveFavorite && (
                <button
                    type="button"
                    className={styles.removeButton}
                    onClick={onRemoveFavorite}
                >
                    Quitar de favoritos
                </button>
            )}

            <button className={styles.secondaryButton}>
                Ver detalles
            </button>

            <button className={styles.primaryButton}>
                Comparar
            </button>
            </div>
        </article>
        
    );
}