import type { Metadata } from "next";
import { Baloo_2, Nunito_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "./globals.css";
import Footer from "@/components/layout/Footer";

const balooTwo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NutriPet",
  description:
    "Plataforma de comparación y recomendación de alimentos para mascotas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${balooTwo.variable} ${nunitoSans.variable}`}>
      <body>
        <Navbar />

        {children}

        <Footer />
      </body>
    </html>
  );
}