import type { Metadata } from "next";
import { Geist, Geist_Mono, Google_Sans, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
})

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
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${googleSans.variable} ${oswald.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
