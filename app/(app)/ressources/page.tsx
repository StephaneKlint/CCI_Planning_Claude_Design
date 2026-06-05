export const dynamic = "force-dynamic";

import { listPlannings, getGanttData } from "@/lib/db/queries";
import styles from "./Ressources.module.css";

function fmt(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}`;
}

export default async function RessourcesPage() {
  const planningList = await listPlannings();
  if (!planningList.length) {
    return <div className={styles.empty}>Aucun planning disponible.</div>;
  }

  const data = await getGanttData(planningList[0].id);
  if (!data) return <div className={styles.empty}>Données introuvables.</div>;

  const { planning, domains, lots, phases, members, phaseAssignees } = data;

  // Build member → phases map
  const memberRows = members.map((member) => {
    const assignedPhaseIds = new Set(
      phaseAssignees.filter((a) => a.memberId === member.id).map((a) => a.phaseId)
    );
    const assigned = phases.filter((p) => assignedPhaseIds.has(p.id));

    const byDomain = domains
      .map((domain) => {
        const domLotIds = new Set(lots.filter((l) => l.domainId === domain.id).map((l) => l.id));
        const domPhases = assigned
          .filter((p) => domLotIds.has(p.lotId))
          .map((p) => {
            const lot = lots.find((l) => l.id === p.lotId)!;
            return { phase: p, lot };
          });
        return { domain, phases: domPhases };
      })
      .filter((d) => d.phases.length > 0);

    return { member, total: assigned.length, byDomain };
  });

  // Sort by most assigned first
  const sorted = [...memberRows].sort((a, b) => b.total - a.total);

  // Unassigned phases
  const assignedPhaseIds = new Set(phaseAssignees.map((a) => a.phaseId));
  const unassigned = phases.filter((p) => !assignedPhaseIds.has(p.id));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ressources</h1>
        <span className={styles.subtitle}>
          {planning.name} · {members.length} membre{members.length > 1 ? "s" : ""}
        </span>
      </header>

      {/* Member cards */}
      <div className={styles.memberGrid}>
        {sorted.map(({ member, total, byDomain }) => (
          <div key={member.id} className={styles.memberCard}>
            {/* Member header */}
            <div className={styles.memberHeader}>
              <div
                className={styles.avatar}
                style={{ background: member.color ?? "#001D63" }}
              >
                {(member.initials ?? member.userName.slice(0, 2)).toUpperCase()}
              </div>
              <div className={styles.memberInfo}>
                <span className={styles.memberName}>{member.userName}</span>
                <span className={styles.memberEmail}>{member.userEmail}</span>
              </div>
              <div className={styles.memberStats}>
                <span className={styles.memberCount}>{total}</span>
                <span className={styles.memberCountLabel}>phases</span>
              </div>
            </div>

            {/* Phases by domain */}
            {byDomain.length > 0 ? (
              <div className={styles.domainGroups}>
                {byDomain.map(({ domain, phases: dPhases }) => (
                  <div key={domain.id} className={styles.domainGroup}>
                    <div
                      className={styles.domainGroupHeader}
                      style={{
                        background: `var(--d-${domain.code}-bg)`,
                        color: `var(--d-${domain.code}-strong)`,
                      }}
                    >
                      {domain.code.toUpperCase()} — {domain.name}
                      <span className={styles.domainGroupCount}>{dPhases.length}</span>
                    </div>
                    <div className={styles.phaseList}>
                      {dPhases.map(({ phase, lot }) => (
                        <div key={phase.id} className={styles.phaseRow}>
                          <span
                            className={styles.phaseTypePill}
                            style={{ background: phase.color ?? `var(--d-${domain.code}-phase)` }}
                          >
                            {phase.type}
                          </span>
                          <span className={styles.phaseLotName}>{lot.name}</span>
                          <span className={styles.phaseDates}>
                            {fmt(phase.startDate)} → {fmt(phase.endDate)}
                          </span>
                          {phase.status && (
                            <span
                              className={styles.phaseStatus}
                              style={{
                                background: `var(--st-${phase.status}-bg)`,
                                color: `var(--st-${phase.status}-c)`,
                              }}
                            >
                              {phase.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noAssign}>Aucune phase assignée.</p>
            )}
          </div>
        ))}
      </div>

      {/* Unassigned phases summary */}
      {unassigned.length > 0 && (
        <section className={styles.unassignedSection}>
          <h2 className={styles.unassignedTitle}>
            Phases non assignées
            <span className={styles.unassignedBadge}>{unassigned.length}</span>
          </h2>
          <div className={styles.unassignedGrid}>
            {unassigned.map((phase) => {
              const lot = lots.find((l) => l.id === phase.lotId);
              const domain = lot ? domains.find((d) => d.id === lot.domainId) : null;
              return (
                <div key={phase.id} className={styles.unassignedRow}>
                  {domain && (
                    <span
                      className={styles.itemDomainChip}
                      style={{
                        background: `var(--d-${domain.code}-bg)`,
                        color: `var(--d-${domain.code}-strong)`,
                      }}
                    >
                      {domain.code.toUpperCase()}
                    </span>
                  )}
                  <span className={styles.unassignedLot}>{lot?.name ?? "—"}</span>
                  <span className={styles.unassignedPhase}>{phase.label ?? phase.type}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
