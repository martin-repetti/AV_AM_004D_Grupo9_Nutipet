"use client";
import { useState } from "react";
import styles from "./Contacto.module.css";

const CHANNELS = [
  {
    icon: "📷",
    label: "Instagram",
    value: "@nutripet.cl",
    href: "https://instagram.com/nutripet.cl",
  },
  {
    icon: "💬",
    label: "WhatsApp",
    value: "+56 9 1234 5678",
    href: "https://wa.me/56912345678",
  },
  {
    icon: "✉️",
    label: "Correo electrónico",
    value: "contacto@nutripet.cl",
    href: "mailto:contacto@nutripet.cl",
  },
];

const MOTIVOS = [
  "Consulta general",
  "Problema con mi cuenta",
  "Sugerencia de alimento o marca",
  "Reportar un error",
  "Otro",
];

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [mensaje, setMensaje] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // MOCK: aquí se conectará el envío real del mensaje al backend.
    // Por ahora solo se simula el envío del formulario.
    console.log("Contacto mock submit", { nombre, email, motivo, mensaje });
    setSubmitted(true);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <span className={styles.eyebrow}>Información</span>
        <h1>Contáctanos</h1>
        <p className={styles.subtitle}>
          ¿Tienes dudas, sugerencias o encontraste un problema? Escríbenos
          por el medio que prefieras o déjanos un mensaje directamente
          aquí.
        </p>

        <div className={styles.layout}>
          <div className={styles.channels}>
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.channelCard}
              >
                <div className={styles.channelIcon}>{channel.icon}</div>
                <div className={styles.channelInfo}>
                  <strong>{channel.label}</strong>
                  <span>{channel.value}</span>
                </div>
              </a>
            ))}

            <div className={styles.hoursCard}>
              <strong>Horario de atención</strong>
              <p>Lunes a viernes, de 9:00 a 18:00 hrs.</p>
            </div>
          </div>

          <div className={styles.formCard}>
            <h2>Envíanos un mensaje</h2>
            <p>Te responderemos a la brevedad al correo que nos indiques.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="motivo">Motivo</label>
                <select
                  id="motivo"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                >
                  {MOTIVOS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  id="mensaje"
                  required
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.submitButton}>
                Enviar mensaje
              </button>

              {submitted && (
                <p className={styles.formNote}>
                  ¡Gracias por escribirnos! Este envío es una simulación:
                  aún no hay backend conectado.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
