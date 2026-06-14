import { sql } from "drizzle-orm";
import { db } from ".";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS share_tokens (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      planning_id UUID NOT NULL REFERENCES plannings(id) ON DELETE CASCADE,
      token       VARCHAR(64) NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at  TIMESTAMPTZ
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS share_tokens_by_planning ON share_tokens(planning_id)
  `);
  console.log("Migration share_tokens: OK");
  process.exit(0);
}
main().catch((err) => { console.error(err); process.exit(1); });
