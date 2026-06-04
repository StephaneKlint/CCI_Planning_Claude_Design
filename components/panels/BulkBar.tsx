"use client";
/**
 * BulkBar — appears at the bottom when multiple phases are selected.
 */
import { useTransition } from "react";
import { useGanttStore } from "@/store/ganttStore";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { StatusCode } from "@/components/ui/StatusPill";
import { bulkUpdatePhaseStatus } from "@/lib/actions/planning";
import styles from "./BulkBar.module.css";

const STATUS_OPTIONS: { value: StatusCode; label: string }[] = [
  { value: "planned",     label: "Planifié"   },
  { value: "in_progress", label: "En cours"   },
  { value: "review",      label: "En revue"   },
  { value: "done",        label: "Terminé"    },
  { value: "risk",        label: "À risque"   },
  { value: "late",        label: "En retard"  },
];

interface BulkBarProps {
  planningId: string;
}

export function BulkBar({ planningId }: BulkBarProps) {
  const { selectedPhaseIds, clearSelection } = useGanttStore();
  const [isPending, startTransition] = useTransition();

  if (selectedPhaseIds.size === 0) return null;

  const count = selectedPhaseIds.size;

  return (
    <div className={styles.bar} role="toolbar" aria-label="Actions sur la sélection">
      <div className={styles.left}>
        <Icon name="layers" size={14} />
        <span className={styles.count}>
          <strong>{count}</strong> phase{count > 1 ? "s" : ""} sélectionnée{count > 1 ? "s" : ""}
        </span>
      </div>

      <div className={styles.actions}>
        <span className={styles.label}>Changer le statut :</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={styles.statusBtn}
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await bulkUpdatePhaseStatus({
                  phaseIds: Array.from(selectedPhaseIds),
                  planningId,
                  status: opt.value,
                });
                clearSelection();
              });
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Button variant="ghost" size="sm" onClick={clearSelection}>
        <Icon name="close" size={12} />
        Désélectionner
      </Button>
    </div>
  );
}

export default BulkBar;
