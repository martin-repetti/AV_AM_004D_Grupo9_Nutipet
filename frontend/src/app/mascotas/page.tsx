import PetCard from "@/components/ui/PetCard";
import Link from "next/link";
export default function MascotasPage() {
  return (
    <main
      style={{
        background: "var(--np-bg)",
        minHeight: "70vh",
        padding: "60px 32px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "38px",
                color: "var(--np-ink)",
              }}
            >
              Mis mascotas
            </h1>

            <p
              style={{
                marginTop: "10px",
                color: "var(--np-muted)",
              }}
            >
              Administra los perfiles y características de tus mascotas.
            </p>
          </div>

            <Link
            href="/mascotas/nueva"
            style={{
                height: "46px",
                padding: "0 20px",
                borderRadius: "999px",
                background: "var(--np-primary)",
                color: "#ffffff",
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            >
            + Agregar mascota
            </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          <PetCard
            name="Max"
            species="Perro"
            age="4 años"
            weight="22 kg"
            activity="Alta"
            icon="🐶"
          />

          <PetCard
            name="Luna"
            species="Gato"
            age="2 años"
            weight="4,8 kg"
            activity="Moderada"
            icon="🐱"
          />
        </div>
      </div>
    </main>
  );
}