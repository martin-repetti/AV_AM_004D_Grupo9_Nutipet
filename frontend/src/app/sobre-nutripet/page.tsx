import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import styles from "@/components/legal/LegalPage.module.css";

export const metadata: Metadata = {
  title: "Sobre NutriPet",
  description:
    "Conoce qué es NutriPet, cómo funciona y qué buscamos ayudarte a lograr para la alimentación de tu mascota.",
};

export default function SobreNutriPetPage() {
  return (
    <LegalPage
      eyebrow="Información"
      title="Sobre NutriPet"
      subtitle="Ayudamos a que elegir el alimento de tu mascota sea una decisión más simple, informada y transparente."
    >
      <section className={styles.section}>
        <h2>¿Qué es NutriPet?</h2>
        <p>
          NutriPet es una plataforma que te permite comparar alimentos para
          mascotas a partir de su información nutricional, precio e
          historial de valores en el tiempo. Nuestro objetivo es que puedas
          tomar decisiones más informadas sobre lo que le das de comer a tu
          perro o gato, sin tener que revisar etiqueta por etiqueta o
          recorrer distintas tiendas.
        </p>
      </section>

      <section className={styles.section}>
        <h2>¿Cómo funciona?</h2>
        <p>
          Registras a tu mascota junto con sus características principales
          (especie, edad, tamaño, condiciones particulares) y luego puedes
          comparar distintos alimentos para ver qué tan compatibles son con
          sus necesidades. También puedes guardar tus opciones favoritas y
          revisar cómo ha variado el precio de un producto a lo largo del
          tiempo.
        </p>
        <ul>
          <li>Comparación de alimentos por marca, precio y nutrientes.</li>
          <li>Perfil por mascota, con recomendaciones asociadas.</li>
          <li>Historial de precios para comprar en el mejor momento.</li>
          <li>Favoritos para guardar los productos que más te interesan.</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Nuestro compromiso</h2>
        <p>
          Trabajamos con información pública y de referencia sobre los
          productos disponibles en el mercado. Buscamos ser un punto de
          partida claro y ordenado, no la última palabra en la salud de tu
          mascota.
        </p>
        <div className={styles.disclaimer}>
          <strong>Importante:</strong> NutriPet entrega información
          orientativa para apoyar la elección de alimentos. No reemplaza la
          evaluación ni las recomendaciones de un médico veterinario.
        </div>
      </section>

      <section className={styles.section}>
        <h2>Un proyecto académico</h2>
        <p>
          NutriPet nace como un proyecto académico, desarrollado con el
          objetivo de explorar cómo la tecnología puede facilitar decisiones
          cotidianas relacionadas con el bienestar de las mascotas.
        </p>
      </section>
    </LegalPage>
  );
}
