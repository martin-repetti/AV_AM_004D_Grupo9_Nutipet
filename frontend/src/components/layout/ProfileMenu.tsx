"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setFlashMessage } from "@/components/ui/FlashMessage";
import styles from "./ProfileMenu.module.css";

export type SessionUser = {
  name: string;
  email: string;
};

type ProfileMenuProps = {
  user: SessionUser | null;
};

export default function ProfileMenu({ user }: ProfileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) {
    return (
      <Link href="/login" className={styles.trigger}>
        👤
      </Link>
    );
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "👤";
  const firstName = user.name.trim().split(" ")[0];

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    } finally {
      setOpen(false);
      setLoggingOut(false);
      setFlashMessage("Sesión cerrada correctamente.");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
      >
        {initial}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.greeting}>Hola, {firstName}</p>
          <p className={styles.email}>{user.email}</p>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}
