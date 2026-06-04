/**
 * /p — redirect to first available planning.
 * force-dynamic : must query DB at request time, never pre-render at build.
 */
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { listPlannings } from "@/lib/db/queries";

export default async function PlanningsIndexPage() {
  const all = await listPlannings();
  if (all.length === 0) {
    return (
      <div style={{ padding: 32, fontFamily: "var(--font-display, system-ui)" }}>
        <h1>Aucun planning disponible</h1>
        <p>
          Lancez <code>pnpm db:seed</code> pour créer le planning CCI 2026.
        </p>
      </div>
    );
  }
  redirect(`/p/${all[0].id}`);
}
