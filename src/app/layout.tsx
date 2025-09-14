import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HydrationFix from "@/components/HydrationFix";
import BodyWrapper from "@/components/BodyWrapper";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Adoo",
  description: "Gerencie e publique diários oficiais de forma digital, eficiente e segura. Solução completa para órgãos públicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <HydrationFix />
        <BodyWrapper />
        {children}
        <Footer />
      </body>
    </html>
  );
}
