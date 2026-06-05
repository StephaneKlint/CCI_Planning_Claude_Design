export const dynamic = "force-dynamic";

import { listPlannings, getGanttData } from "@/lib/db/queries";
import styles from "./Synthese.module.css";

function fmt(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function verbLabel(verb: string) {
  const map: Record<string, string> = {
    status_changed: "Statut modifié",
    progress_updated: "Avancement mis à jour",
    moved: "Déplacé",
    bulk_status_changed: "Statut modifié (masse)",
  };
  return map[verb] ?? verb;
}

export default async function SynthesePage() {
  const planningList = await listPlannings();
  if (!planningList.length) {
    return (
      <div className={styles.empty}>
        Aucun planning disponible. Lancez <code>pnpm db:seed</code>.
      </div>
    );
  }

  const data = await getGanttData(planningList[0].id);
  if (!data) return <div className={styles.empty}>Données introuvables.</div>;

  const { planning, domains, lots, phases, milestones } = data;

  // --- KPIs ---
  const total = phases.length;
  const counts = {
    planned:     phases.filter((p) => p.status === "planned").length,
    in_progress: phases.filter((p) => p.status === "in_progress").length,
    review:      phases.filter((p) => p.status === "review").length,
    done:        phases.filter((p) => p.status === "done").length,
    risk:        phases.filter((p) => p.status === "risk").length,
    late:        phases.filter((p) => p.status === "late").length,
  };
  const avgProgress =
    total > 0
      ? Math.round(phases.reduce((s, p) => s + p.progress, 0) / total)
      : 0;

  // --- Domain progress ---
  const domainProgress = domains.map((domain) => {
    const domLots = lots.filter((l) => l.domainId === domain.id);
    const domPhases = phases.filter((p) => domLots.some((l) => l.id === p.lotId));
    const avg =
      domPhases.length > 0
        ? Math.round(domPhases.reduce((s, p) => s + p.progress, 0) / domPhases.length)
        : 0;
    return { domain, avg, phaseCount: domPhases.length, lotCount: domLots.length };
  }).filter((d) => d.phaseCount > 0);

  // --- Upcoming milestones (next 30 days) ---
  const todayStr = new Date().toISOString().split("T")[0];
  const in30Str = new Date(Date.now() + 30 * 86_400_000).toISOString().split("T")[0];
  const upcoming = milestones
    .filter((m) => m.date >= todayStr && m.date <= in30Str)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => {
      const lot = lots.find((l) => l.id === m.lotId);
      const domain = lot ? domains.find((d) => d.id === lot.domainId) : null;
      return { m, lot, domain };
    });

  // --- Late / risk phases ---
  const latePhases = phases
    .filter((p) => p.status === "late")
    .map((p) => {
      const lot = lots.find((l) => l.id === p.lotId);
      const domain = lot ? domains.find((d) => d.id === lot.domainId) : null;
      return { p, lot, domain };
    });

  const riskPhases = phases
    .filter((p) => p.status === "risk")
    .map((p) => {
      const lot = lots.find((l) => l.id === p.lotId);
      const domain = lot ? domains.find((d) => d.id === lot.domainId) : null;
      return { p, lot, domain };
    });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Synthèse</h1>
        <span className={styles.subtitle}>{planning.name} · {planning.year}</span>
      </header>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiValue}>{total}</span>
          <span className={styles.kpiLabel}>Phases totales</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiProgress}`}>
          <span className={styles.kpiValue}>{avgProgress}%</span>
          <span className={styles.kpiLabel}>Avancement moyen</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiInProgress}`}>
          <span className={styles.kpiValue}>{counts.in_progress}</span>
          <span className={styles.kpiLabel}>En cours</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiDone}`}>
          <span className={styles.kpiValue}>{counts.done}</span>
          <span className={styles.kpiLabel}>Terminées</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiReview}`}>
          <span className={styles.kpiValue}>{counts.review}</span>
          <span className={styles.kpiLabel}>En revue</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiRisk}`}>
          <span className={styles.kpiValue}>{counts.risk}</span>
          <span className={styles.kpiLabel}>À risque</span>
        </div>
        <div className={`${styles.kpiCard} ${styles.kpiLate}`}>
          <span className={styles.kpiValue}>{counts.late}</span>
          <span className={styles.kpiLabel}>En retard</span>
        </div>
      </div>

      {/* Domain progress */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Avancement par domaine</h2>
        <div className={styles.domainList}>
          {domainProgress.map(({ domain, avg, phaseCount }) => (
            <div key={domain.id} className={styles.domainRow}>
              <div className={styles.domainMeta}>
                <span className={styles.domainCode}
                  style={{ background: `var(--d-${domain.code}-bg)`, color: `var(--d-${domain.code}-strong)` }}>
                  {domain.code.toUpperCase()}
                </span>
                <span className={styles.domainName}>{domain.name}</span>
                <span className={styles.domainCount}>{phaseCount} phases</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}
                  style={{ width: `${avg}%`, background: `var(--d-${domain.code}-phase)` }} />
              </div>
              <span className={styles.progressPct}>{avg}%</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.twoCol}>
        {/* Upcoming milestones */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Prochains jalons — 30 jours
            <span className={styles.badge}>{upcoming.length}</span>
          </h2>
          {upcoming.length === 0 ? (
            <p className={styles.empty}>Aucun jalon dans les 30 prochains jours.</p>
          ) : (
            <ul className={styles.itemList}>
              {upcoming.map(({ m, lot, domain }) => (
                <li key={m.id} className={styles.item}>
                  <span className={styles.itemDate}>{fmt(m.date)}</span>
                  <span className={styles.itemDomainChip}
                    style={{
                      background: domain ? `var(--d-${domain.code}-bg)` : "#f1f5f9",
                      color: domain ? `var(--d-${domain.code}-strong)` : "#64748b",
                    }}>
                    {domain?.code.toUpperCase() ?? "—"}
                  </span>
                  <span className={styles.itemLabel}>{m.label}</span>
                  {lot && <span className={styles.itemSub}>{lot.name}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Late + risk */}
        <div>
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionLate}`}>
              Phases en retard
              <span className={`${styles.badge} ${styles.badgeLate}`}>{latePhases.length}</span>
            </h2>
            {latePhases.length === 0 ? (
              <p className={styles.emptyGood}>Aucune phase en retard.</p>
            ) : (
              <ul className={styles.itemList}>
                {latePhases.slice(0, 10).map(({ p, lot, domain }) => (
                  <li key={p.id} className={styles.item}>
                    <span className={styles.itemDomainChip}
                      style={{
                        background: domain ? `var(--d-${domain.code}-bg)` : "#f1f5f9",
                        color: domain ? `var(--d-${domain.code}-strong)` : "#64748b",
                      }}>
                      {domain?.code.toUpperCase() ?? "—"}
                    </span>
                    <span className={styles.itemLabel}>{p.label ?? p.type}</span>
                    {lot && <span className={styles.itemSub}>{lot.name}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionRisk}`}>
              Phases à risque
              <span className={`${styles.badge} ${styles.badgeRisk}`}>{riskPhases.length}</span>
            </h2>
            {riskPhases.length === 0 ? (
              <p className={styles.emptyGood}>Aucune phase à risque.</p>
            ) : (
              <ul className={styles.itemList}>
                {riskPhases.slice(0, 10).map(({ p, lot, domain }) => (
                  <li key={p.id} className={styles.item}>
                    <span className={styles.itemDomainChip}
                      style={{
                        background: domain ? `var(--d-${domain.code}-bg)` : "#f1f5f9",
                        color: domain ? `var(--d-${domain.code}-strong)` : "#64748b",
                      }}>
                      {domain?.code.toUpperCase() ?? "—"}
                    </span>
                    <span className={styles.itemLabel}>{p.label ?? p.type}</span>
                    {lot && <span className={styles.itemSub}>{lot.name}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
