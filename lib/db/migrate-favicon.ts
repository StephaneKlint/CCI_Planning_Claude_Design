/**
 * lib/db/migrate-favicon.ts
 * Migration idempotente : ajoute favicon_data_url à app_settings.
 * Usage : pnpm tsx lib/db/migrate-favicon.ts
 */
import { neon } from "@neondatabase/serverless";
import { loadEnvConfig } from "@next/env";
import { resolve } from "path";
loadEnvConfig(resolve(process.cwd()));

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("→ Adding favicon_data_url column to app_settings...");

  await sql`
    ALTER TABLE "app_settings"
    ADD COLUMN IF NOT EXISTS "favicon_data_url" text;
  `;

  console.log("✓ Migration complete.");
}

main().catch((err) => {
  console.error("✗ Migration failed:", err);
  process.exit(1);
});
