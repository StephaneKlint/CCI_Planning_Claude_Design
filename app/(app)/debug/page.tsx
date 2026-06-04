/**
 * /debug — Server Component temporaire (Jalon 1).
 * Liste les 23 lots avec leurs domaines depuis Neon.
 * À supprimer ou sécuriser avant mise en production.
 */
import { db } from "@/lib/db";
import { lots, domains, phases, milestones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const allLots = await db
    .select({
      lotId: lots.id,
      lotName: lots.name,
      lotSubtitle: lots.subtitle,
      domainCode: domains.code,
      domainName: domains.name,
      domainColor: domains.phaseColor,
      sortOrder: lots.sortOrder,
    })
    .from(lots)
    .innerJoin(domains, eq(lots.domainId, domains.id))
    .orderBy(domains.sortOrder, lots.sortOrder);

  // Count phases and milestones per lot
  const phaseCounts = await db
    .select({ lotId: phases.lotId })
    .from(phases);

  const milestoneCounts = await db
    .select({ lotId: milestones.lotId })
    .from(milestones);

  const phasesByLot = phaseCounts.reduce<Record<string, number>>((acc, p) => {
    acc[p.lotId] = (acc[p.lotId] ?? 0) + 1;
    return acc;
  }, {});

  const milestonesByLot = milestoneCounts.reduce<Record<string, number>>((acc, m) => {
    acc[m.lotId] = (acc[m.lotId] ?? 0) + 1;
    return acc;
  }, {});

  // Group by domain
  const byDomain = allLots.reduce<
    Record<string, { code: string; name: string; color: string; lots: typeof allLots }>
  >((acc, lot) => {
    if (!acc[lot.domainCode]) {
      acc[lot.domainCode] = {
        code: lot.domainCode,
        name: lot.domainName,
        color: lot.domainColor,
        lots: [],
      };
    }
    acc[lot.domainCode].lots.push(lot);
    return acc;
  }, {});

  const totalPhases = phaseCounts.length;
  const totalMilestones = milestoneCounts.length;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "32px", maxWidth: "900px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
        🌱 Debug — Planning CCI 2026
      </h1>
      <p style={{ color: "#6B7280", fontSize: "14px", marginBottom: "32px" }}>
        {allLots.length} lots · {totalPhases} phases · {totalMilestones} jalons
        {" · "}
        <span style={{ color: allLots.length === 23 ? "#16A34A" : "#DC2626" }}>
          {allLots.length === 23 ? "✓ 23/23 lots" : `⚠ ${allLots.length}/23 lots`}
        </span>
      </p>

      {Object.values(byDomain).map((domain) => (
        <div key={domain.code} style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                background: domain.color,
                flexShrink: 0,
              }}
            />
            <strong style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {domain.name}
            </strong>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
              {domain.lots.length} lot{domain.lots.length > 1 ? "s" : ""}
            </span>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Sous-titre</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Phases</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Jalons</th>
              </tr>
            </thead>
            <tbody>
              {domain.lots.map((lot) => (
                <tr key={lot.lotId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td style={tdStyle}>{lot.lotName}</td>
                  <td style={{ ...tdStyle, color: "#9CA3AF" }}>{lot.lotSubtitle || "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {phasesByLot[lot.lotId] ?? 0}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    {milestonesByLot[lot.lotId] ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <p style={{ color: "#9CA3AF", fontSize: "11px", marginTop: "40px" }}>
        Page debug — Jalon 1. À supprimer ou protéger avant production.
      </p>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "6px 10px",
  fontSize: "11px",
  color: "#6B7280",
  fontWeight: 600,
  border: "1px solid #E5E7EB",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  border: "1px solid #F3F4F6",
  verticalAlign: "top",
};
