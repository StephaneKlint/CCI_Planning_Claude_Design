"use client";
/**
 * EditPanel — floating panel 420px, 4 modes: phase / lot / milestone / create.
 * Opens when user clicks a phase pill, lot name, or milestone flag.
 */
import { useTransition } from "react";
import { useGanttStore } from "@/store/ganttStore";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import type { StatusCode } from "@/components/ui/StatusPill";
import type { GanttData } from "@/lib/db/queries";
import {
  updatePhaseStatus, updatePhaseProgress,
  updatePhaseNote, updatePhaseDates,
  updateMilestone,
} from "@/lib/actions/planning";
import { useOptimisticPhase } from "@/lib/queries/usePlanning";
import styles from "./EditPanel.module.css";

const STATUS_OPTIONS: { value: StatusCode; label: string }[] = [
  { value: "planned",     label: "Planifié"   },
  { value: "in_progress", label: "En cours"   },
  { value: "review",      label: "En revue"   },
  { value: "done",        label: "Terminé"    },
  { value: "risk",        label: "À risque"   },
  { value: "late",        label: "En retard"  },
];

interface EditPanelProps {
  planningId: string;
  data: GanttData;
}

export function EditPanel({ planningId, data }: EditPanelProps) {
  const { editTarget, closeEdit } = useGanttStore();
  const [isPending, startTransition] = useTransition();
  const patchPhase = useOptimisticPhase();

  if (!editTarget) return null;

  // --- Phase mode ---
  if (editTarget.kind === "phase") {
    const phase = data.phases.find((p) => p.id === editTarget.id);
    if (!phase) return null;
    const lot = data.lots.find((l) => l.id === phase.lotId);
    const domain = data.domains.find((d) => lot && d.id === lot.domainId);

    const currentStatus = phase.status as StatusCode | null;

    return (
      <div className={styles.panel} role="dialog" aria-label="Éditer la phase">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.modeTag} style={{ background: domain?.phaseColor + "22", color: domain?.phaseColor }}>
              Phase
            </span>
            <span className={styles.headerTitle}>
              {phase.label ?? lot?.name ?? "Phase"}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={closeEdit} aria-label="Fermer">
            <Icon name="close" size={14} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Status */}
          <div className={styles.field}>
            <label className={styles.label}>Statut</label>
            <div className={styles.statusGrid}>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.statusOpt} ${currentStatus === opt.value ? styles.statusOptActive : ""}`}
                  onClick={() => {
                    const newStatus = currentStatus === opt.value ? null : opt.value;
                    patchPhase(planningId, phase.id, { status: newStatus });
                    startTransition(async () => {
                      await updatePhaseStatus({ phaseId: phase.id, planningId, status: newStatus });
                    });
                  }}
                  disabled={isPending}
                >
                  <StatusPill status={opt.value} label={opt.label} />
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className={styles.field}>
            <label className={styles.label}>Avancement</label>
            <div className={styles.progressRow}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={phase.progress}
                className={styles.slider}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  patchPhase(planningId, phase.id, { progress: val });
                }}
                onMouseUp={(e) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  startTransition(async () => {
                    await updatePhaseProgress({ phaseId: phase.id, planningId, progress: val });
                  });
                }}
              />
              <span className={styles.progressVal}>{phase.progress}%</span>
            </div>
          </div>

          {/* Dates */}
          <div className={styles.field}>
            <label className={styles.label}>Dates</label>
            <div className={styles.datesRow}>
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>Début</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  defaultValue={phase.startDate}
                  onBlur={(e) => {
                    startTransition(async () => {
                      await updatePhaseDates({
                        phaseId: phase.id,
                        planningId,
                        startDate: e.target.value,
                        endDate: phase.endDate,
                      });
                    });
                  }}
                />
              </div>
              <Icon name="chevronRight" size={12} style={{ color: "#9CA3AF", flexShrink: 0 }} />
              <div className={styles.dateField}>
                <span className={styles.dateLabel}>Fin</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  defaultValue={phase.endDate}
                  onBlur={(e) => {
                    startTransition(async () => {
                      await updatePhaseDates({
                        phaseId: phase.id,
                        planningId,
                        startDate: phase.startDate,
                        endDate: e.target.value,
                      });
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className={styles.field}>
            <label className={styles.label}>Note</label>
            <textarea
              className={styles.textarea}
              defaultValue={phase.note ?? ""}
              placeholder="Ajouter une note…"
              rows={3}
              onBlur={(e) => {
                const note = e.target.value.trim() || null;
                startTransition(async () => {
                  await updatePhaseNote({ phaseId: phase.id, planningId, note });
                });
              }}
            />
          </div>

          {/* Lot info */}
          {lot && (
            <div className={styles.field}>
              <label className={styles.label}>Projet</label>
              <div className={styles.infoRow}>
                <span className={styles.infoChip} style={{ background: domain?.bg, color: domain?.strong }}>
                  {domain?.name}
                </span>
                <span className={styles.infoText}>{lot.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {isPending && (
            <span className={styles.saving}>Enregistrement…</span>
          )}
          <Button variant="ghost" size="sm" onClick={closeEdit}>
            Fermer
          </Button>
        </div>
      </div>
    );
  }

  // --- Lot mode ---
  if (editTarget.kind === "lot") {
    const lot = data.lots.find((l) => l.id === editTarget.id);
    const domain = lot ? data.domains.find((d) => d.id === lot.domainId) : null;
    const lotPhases = data.phases.filter((p) => p.lotId === editTarget.id);
    const lotMilestones = data.milestones.filter((m) => m.lotId === editTarget.id);

    if (!lot) return null;

    return (
      <div className={styles.panel} role="dialog" aria-label="Éditer le projet">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.modeTag} style={{ background: domain?.bg, color: domain?.strong }}>
              {domain?.name ?? "Projet"}
            </span>
            <span className={styles.headerTitle}>{lot.name}</span>
          </div>
          <button className={styles.closeBtn} onClick={closeEdit} aria-label="Fermer">
            <Icon name="close" size={14} />
          </button>
        </div>

        <div className={styles.body}>
          {lot.subtitle && (
            <p className={styles.subtitle}>{lot.subtitle}</p>
          )}
          <div className={styles.statsRow}>
            <span className={styles.stat}><strong>{lotPhases.length}</strong> phases</span>
            <span className={styles.stat}><strong>{lotMilestones.length}</strong> jalons</span>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Phases</label>
            {lotPhases.map((p) => (
              <div key={p.id} className={styles.phaseListItem}>
                <StatusPill status={(p.status ?? "planned") as StatusCode} />
                <span>{p.label ?? p.type}</span>
                <span className={styles.dateRange}>{p.startDate} → {p.endDate}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={closeEdit}>Fermer</Button>
        </div>
      </div>
    );
  }

  // --- Milestone mode ---
  if (editTarget.kind === "milestone") {
    const ms = data.milestones.find((m) => m.id === editTarget.id);
    if (!ms) return null;

    return (
      <div className={styles.panel} role="dialog" aria-label="Éditer le jalon">
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.modeTag}>Jalon</span>
            <span className={styles.headerTitle}>{ms.label}</span>
          </div>
          <button className={styles.closeBtn} onClick={closeEdit} aria-label="Fermer">
            <Icon name="close" size={14} />
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Date</label>
            <input
              type="date"
              className={styles.dateInput}
              defaultValue={ms.date}
              onBlur={(e) => {
                startTransition(async () => {
                  await updateMilestone({
                    milestoneId: ms.id,
                    planningId,
                    date: e.target.value,
                  });
                });
              }}
            />
          </div>
          {ms.note && (
            <div className={styles.field}>
              <label className={styles.label}>Note</label>
              <p className={styles.infoText}>{ms.note}</p>
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <Button variant="ghost" size="sm" onClick={closeEdit}>Fermer</Button>
        </div>
      </div>
    );
  }

  return null;
}

export default EditPanel;
