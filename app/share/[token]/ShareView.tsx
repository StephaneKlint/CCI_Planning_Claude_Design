"use client";

import { Gantt } from "@/components/gantt/Gantt";
import { useGanttStore } from "@/store/ganttStore";
import type { GanttData } from "@/lib/db/queries";
import styles from "./ShareView.module.css";

interface ShareViewProps {
  data: GanttData;
  referenceDate: string;
}

const ZOOM_LEVELS = ["1m", "3m", "6m", "12m"] as const;

export function ShareView({ data, referenceDate }: ShareViewProps) {
  const { zoom, setZoom, requestScroll } = useGanttStore();

  return (
    <div className={styles.root}>
      <div className={styles.banner}>
        <span className={styles.bannerLogo}>Klint Planning</span>
        <span className={styles.bannerSep}>·</span>
        <span className={styles.bannerName}>{data.planning.name}</span>
        <span className={styles.bannerBadge}>Vue partagée · Lecture seule</span>

        <div className={styles.bannerTools}>
          <button
            className={styles.toolBtn}
            onClick={() => requestScroll("today")}
          >
            Aujourd&apos;hui
          </button>
          <div className={styles.zoomGroup}>
            {ZOOM_LEVELS.map((z) => (
              <button
                key={z}
                className={`${styles.zoomBtn} ${zoom === z ? styles.zoomActive : ""}`}
                onClick={() => setZoom(z)}
                aria-pressed={zoom === z}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.ganttOuter}>
        <Gantt
          planningId={data.planning.id}
          domains={data.domains}
          lots={data.lots}
          phases={data.phases}
          milestones={data.milestones}
          milestoneTypes={data.milestoneTypes}
          statuses={data.statuses}
          phaseAssignees={data.phaseAssignees}
          phaseTypes={data.phaseTypes}
          members={data.members}
          viewStart={data.planning.viewStart}
          viewEnd={data.planning.viewEnd}
          referenceDate={referenceDate}
          closurePeriods={data.closurePeriods}
        />
      </div>
    </div>
  );
}
