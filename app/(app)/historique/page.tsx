export const dynamic = "force-dynamic";

import { listPlannings, getActivityLog } from "@/lib/db/queries";
import styles from "./Historique.module.css";

const VERB_LABELS: Record<string, string> = {
  status_changed:       "Statut modifié",
  progress_updated:     "Avancement mis à jour",
  moved:                "Déplacé",
  bulk_status_changed:  "Statut modifié (masse)",
  created:              "Créé",
  deleted:              "Supprimé",
  updated:              "Modifié",
};

const TARGET_LABELS: Record<string, string> = {
  phase:     "Phase",
  milestone: "Jalon",
  lot:       "Sous-projet",
  planning:  "Planning",
};

function fmtDatetime(d: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function HistoriquePage() {
  const planningList = await listPlannings();
  if (!planningList.length) {
    return <div className={styles.empty}>Aucun planning disponible.</div>;
  }

  const entries = await getActivityLog(planningList[0].id, 200);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Historique</h1>
        <span className={styles.subtitle}>
          {planningList[0].name} · {entries.length} événement{entries.length !== 1 ? "s" : ""}
        </span>
      </header>

      {entries.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aucun événement enregistré pour ce planning.</p>
          <p className={styles.emptyHint}>Les modifications (statuts, dates, notes…) apparaîtront ici.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {entries.map((entry) => (
            <div key={entry.id} className={styles.entry}>
              {/* Avatar */}
              <div
                className={styles.avatar}
                style={{ background: entry.actorColor ?? "#001D63" }}
                title={entry.actorName ?? "Système"}
              >
                {entry.actorInitials ?? "?"}
              </div>

              {/* Content */}
              <div className={styles.entryContent}>
                <div className={styles.entryTop}>
                  <span className={styles.entryVerb}>
                    {VERB_LABELS[entry.verb] ?? entry.verb}
                  </span>
                  {entry.targetType && (
                    <span className={styles.entryTarget}>
                      {TARGET_LABELS[entry.targetType] ?? entry.targetType}
                    </span>
                  )}
                  <span className={styles.entryActor}>
                    {entry.actorName ?? "Système"}
                  </span>
                </div>
                <p className={styles.entrySummary}>{entry.summary}</p>
                <span className={styles.entryDate}>{fmtDatetime(entry.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
