/**
 * GET /api/favicon
 * Sert le favicon personnalisé depuis la DB (app_settings.favicon_data_url).
 * Redirige vers /favicon.svg si aucun favicon custom n'est défini.
 *
 * Cache 1h côté navigateur (les navigateurs gèrent eux-mêmes le rafraîchissement).
 */
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const rows = await db
      .select({ faviconDataUrl: appSettings.faviconDataUrl })
      .from(appSettings)
      .where(eq(appSettings.key, "global"))
      .limit(1);

    const dataUrl = rows[0]?.faviconDataUrl ?? null;

    if (!dataUrl) {
      // Pas de favicon custom → on sert le fichier statique par défaut
      const origin = new URL(request.url).origin;
      return NextResponse.redirect(`${origin}/favicon.svg`, {
        status: 302,
        headers: { "Cache-Control": "public, max-age=60" },
      });
    }

    // Décode le data-URL : "data:<mime>;base64,<data>"
    const commaIdx = dataUrl.indexOf(",");
    if (commaIdx === -1) {
      return NextResponse.redirect(new URL(request.url).origin + "/favicon.svg");
    }

    const meta    = dataUrl.slice(0, commaIdx);           // "data:image/png;base64"
    const b64     = dataUrl.slice(commaIdx + 1);           // données base64
    const mimeMatch = meta.match(/^data:([^;]+)/);
    const mime    = mimeMatch?.[1] ?? "image/png";
    const buffer  = Buffer.from(b64, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=3600, must-revalidate",
        "Content-Length": String(buffer.length),
      },
    });
  } catch {
    // En cas d'erreur DB, on redirige silencieusement vers le favicon par défaut
    const origin = new URL(request.url).origin;
    return NextResponse.redirect(`${origin}/favicon.svg`, { status: 302 });
  }
}
