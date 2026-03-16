import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ternos La Elegancia",
  description: "Ternos La Elegancia - Ropa de alta calidad para hombres elegantes. Descubre nuestra colección de trajes, camisas y accesorios para un estilo impecable en cualquier ocasión.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans")}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
