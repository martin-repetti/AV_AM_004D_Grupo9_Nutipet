import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import styles from "@/components/legal/LegalPage.module.css";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de uso de la plataforma NutriPet para la comparación de alimentos para mascotas.",
};

export default function TerminosPage() {
  return (
    <LegalPage
      eyebrow="Información"
      title="Términos y condiciones"
      subtitle="Estas condiciones regulan el uso de la plataforma NutriPet."
      updated="Última actualización: septiembre de 2026"
    >
      <section className={styles.section}>
        <h2>1. Aceptación de los términos</h2>
        <p>
          Al acceder o utilizar NutriPet, aceptas estos términos y
          condiciones en su totalidad. Si no estás de acuerdo con alguna
          parte de ellos, te pedimos no utilizar la plataforma.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Descripción del servicio</h2>
        <p>
          NutriPet es una plataforma informativa que permite comparar
          alimentos para mascotas, registrar perfiles de mascotas, guardar
          favoritos y revisar historiales de precios. La información
          mostrada tiene fines orientativos y de referencia.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Cuentas de usuario</h2>
        <p>
          Para acceder a ciertas funciones (como guardar mascotas o
          favoritos) es necesario crear una cuenta. Eres responsable de
          mantener la confidencialidad de tus credenciales y de toda
          actividad realizada desde tu cuenta.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Uso adecuado de la plataforma</h2>
        <p>Al usar NutriPet, te comprometes a:</p>
        <ul>
          <li>No utilizar la plataforma con fines fraudulentos o ilegales.</li>
          <li>No intentar vulnerar la seguridad del sitio o sus datos.</li>
          <li>
            No reproducir, distribuir o explotar comercialmente el
            contenido sin autorización.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>5. Información sobre productos y precios</h2>
        <p>
          La información nutricional y de precios se entrega con fines
          comparativos y puede no reflejar en tiempo real las condiciones
          vigentes en cada tienda o fabricante. Antes de comprar, te
          recomendamos verificar los datos directamente con el proveedor.
        </p>
        <div className={styles.disclaimer}>
          <strong>Importante:</strong> NutriPet no vende alimentos ni actúa
          como intermediario en las transacciones de compra; su función es
          exclusivamente informativa.
        </div>
      </section>

      <section className={styles.section}>
        <h2>6. Propiedad intelectual</h2>
        <p>
          El diseño, la marca, los textos y demás elementos de NutriPet son
          de propiedad de sus responsables o se utilizan bajo licencia. No
          está permitido su uso sin autorización previa.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Limitación de responsabilidad</h2>
        <p>
          NutriPet no reemplaza la evaluación de un médico veterinario. No
          nos hacemos responsables por decisiones tomadas exclusivamente en
          base a la información entregada en la plataforma.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Modificaciones</h2>
        <p>
          Podemos actualizar estos términos en cualquier momento. Los
          cambios relevantes serán informados a través de la plataforma.
        </p>
      </section>
    </LegalPage>
  );
}
