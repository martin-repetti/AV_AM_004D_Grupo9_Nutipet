import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import styles from "@/components/legal/LegalPage.module.css";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo NutriPet recopila, utiliza y protege tus datos personales y los de tu mascota.",
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="Información"
      title="Política de privacidad"
      subtitle="Queremos que sepas qué datos recopilamos y cómo los utilizamos dentro de NutriPet."
      updated="Última actualización: septiembre de 2026"
    >
      <section className={styles.section}>
        <h2>1. Datos que recopilamos</h2>
        <p>Para ofrecerte las funciones de la plataforma, recopilamos:</p>
        <ul>
          <li>
            Datos de cuenta: nombre, correo electrónico y contraseña
            (almacenada de forma cifrada).
          </li>
          <li>
            Datos de tus mascotas: especie, edad, tamaño y otras
            características que registres en su perfil.
          </li>
          <li>
            Datos de uso: alimentos comparados, favoritos guardados y
            preferencias dentro de la plataforma.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>2. Para qué usamos tus datos</h2>
        <p>Utilizamos la información recopilada para:</p>
        <ul>
          <li>Permitirte crear y gestionar tu cuenta y tus mascotas.</li>
          <li>
            Mostrarte comparaciones y recomendaciones relevantes según el
            perfil de tu mascota.
          </li>
          <li>Guardar tus favoritos e historial de precios consultados.</li>
          <li>Mejorar el funcionamiento y la experiencia de la plataforma.</li>
        </ul>
        <p>No vendemos tus datos personales a terceros.</p>
      </section>

      <section className={styles.section}>
        <h2>3. Con quién compartimos información</h2>
        <p>
          Tus datos pueden ser procesados por proveedores de servicios
          tecnológicos que nos ayudan a operar la plataforma (por ejemplo,
          servicios de hosting o infraestructura), siempre bajo condiciones
          de confidencialidad. No compartimos tu información con fines
          publicitarios de terceros.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Almacenamiento y seguridad</h2>
        <p>
          Tomamos medidas razonables para proteger tu información contra
          accesos no autorizados, pérdida o alteración. Sin embargo, ningún
          sistema es completamente infalible, por lo que te recomendamos
          usar una contraseña segura y no compartirla con terceros.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Tus derechos</h2>
        <p>Puedes solicitarnos en cualquier momento:</p>
        <ul>
          <li>Acceder a los datos personales que tenemos sobre ti.</li>
          <li>Corregir información incorrecta o desactualizada.</li>
          <li>
            Eliminar tu cuenta y los datos asociados a ella, salvo aquellos
            que debamos conservar por obligación legal.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>6. Cookies y tecnologías similares</h2>
        <p>
          Podemos utilizar cookies u otras tecnologías similares para
          recordar tus preferencias y mantener tu sesión activa dentro de
          la plataforma.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta política de privacidad periódicamente. Te
          recomendamos revisarla de tanto en tanto para mantenerte
          informado sobre cómo protegemos tu información.
        </p>
      </section>
      
    </LegalPage>
  );
}
