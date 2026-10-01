"use client";

import { useEffect, useState } from "react";
import styles from "./FlashMessage.module.css";

const FLASH_KEY = "np_flash_message";
const FLASH_EVENT = "np:flash-message";

/**
 * Muestra `message` en el toast global.
 * Funciona tanto si FlashMessage ya está montado (navegación dentro de la
 * SPA, vía el evento) como si la próxima página viene de una recarga
 * completa (vía sessionStorage).
 */
export function setFlashMessage(message: string) {
  try {
    sessionStorage.setItem(FLASH_KEY, message);
  } catch {
    // sessionStorage no disponible (ej. modo privado): se ignora en silencio.
  }

  window.dispatchEvent(new CustomEvent<string>(FLASH_EVENT, { detail: message }));
}

export default function FlashMessage() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let stored: string | null = null;

    try {
      stored = sessionStorage.getItem(FLASH_KEY);
      if (stored) sessionStorage.removeItem(FLASH_KEY);
    } catch {
      stored = null;
    }

    if (stored) {
      // Lectura puntual, una sola vez al montar, de un mensaje dejado antes
      // de una navegación dura (recarga completa).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage(stored);
    }

    const handleFlash = (e: Event) => {
      setMessage((e as CustomEvent<string>).detail);
    };

    window.addEventListener(FLASH_EVENT, handleFlash);
    return () => window.removeEventListener(FLASH_EVENT, handleFlash);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  if (!message) return null;

  return (
    <div className={styles.toast} role="status">
      {message}
    </div>
  );
}
