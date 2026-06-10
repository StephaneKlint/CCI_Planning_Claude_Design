import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "@/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Klint Planning",
  description: "Outil de planning de projets — Klint Consulting",
  // /api/favicon sert le favicon custom (DB) ou redirige vers /favicon.svg par défaut
  icons: {
    icon:      [{ url: "/api/favicon" }, { url: "/favicon.svg" }],
    shortcut:  "/api/favicon",
    apple:     "/api/favicon",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
