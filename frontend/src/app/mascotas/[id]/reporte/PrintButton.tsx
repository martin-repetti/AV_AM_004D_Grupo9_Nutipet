"use client";

import styles from "./Reporte.module.css";

/** Abre el diálogo de impresión, donde se puede elegir "Guardar como PDF". */
export default function PrintButton() {
  return (
    <button type="button" className={styles.printButton} onClick={() => window.print()}>
      Descargar PDF
    </button>
  );
}
