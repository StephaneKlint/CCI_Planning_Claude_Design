"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "./Topbar";
import { useGanttStore } from "@/store/ganttStore";
import styles from "./PlanningSelector.module.css";

interface PlanningItem {
  id: string;
  name: string;
  year: number;
}

interface TopbarWrapperProps {
  plannings: PlanningItem[];
  activePlanningId?: string;
}

export function TopbarWrapper({ plannings, activePlanningId }: TopbarWrapperProps) {
  const { setCommandPaletteOpen } = useGanttStore();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const router = useRouter();

  const active = plannings.find((p) => p.id === activePlanningId) ?? plannings[0];

  const planningStats = active
    ? `${active.year}`
    : "";

  return (
    <>
      <Topbar
        planningName={active?.name ?? "Klint Planning"}
        planningStats={planningStats}
        onPlanningClick={() => setSelectorOpen(true)}
        onSearchClick={() => setCommandPaletteOpen(true)}
      />

      {selectorOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSelectorOpen(false)}
          aria-hidden
        />
      )}

      {selectorOpen && (
        <div className={styles.selector}>
          <div className={styles.selectorHeader}>
            <span className={styles.selectorTitle}>Mes plannings</span>
            <button
              className={styles.selectorClose}
              onClick={() => setSelectorOpen(false)}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          <div className={styles.planningList}>
            {plannings.map((p) => (
              <button
                key={p.id}
                className={`${styles.planningItem} ${p.id === activePlanningId ? styles.planningItemActive : ""}`}
                onClick={() => {
                  setSelectorOpen(false);
                  router.push(`/p/${p.id}`);
                }}
              >
                <span className={styles.planningBadge}>K</span>
                <span className={styles.planningInfo}>
                  <span className={styles.planningName}>{p.name}</span>
                  <span className={styles.planningYear}>{p.year}</span>
                </span>
              </button>
            ))}
          </div>

          <div className={styles.selectorFooter}>
            <button
              className={styles.newPlanningBtn}
              onClick={() => {
                setSelectorOpen(false);
                router.push("/plannings/nouveau");
              }}
            >
              + Nouveau planning
            </button>
          </div>
        </div>
      )}
    </>
  );
}
