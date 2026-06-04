import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Klint Planning",
  description: "Outil de planning de projets — Klint Consulting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
