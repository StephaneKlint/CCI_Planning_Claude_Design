"use client";
/**
 * GanttView — client shell: Toolbar + Gantt + EditPanel + BulkBar + CommandPalette.
 */
import { Gantt } from "@/components/gantt/Gantt";
import { Toolbar } from "@/components/chrome/Toolbar";
import { EditPanel } from "@/components/panels/EditPanel";
import { BulkBar } from "@/components/panels/BulkBar";
import { CommandPalette } from "@/components/panels/CommandPalette";
import { useGanttStore } from "@/store/ganttStore";
import { usePlanning } from "@/lib/queries/usePlanning";
import type { GanttProps } from "@/components/gantt/types";
import type { GanttData } from "@/lib/db/queries";
import styles from "./GanttView.module.css";

interface GanttViewProps extends GanttProps {
  initialData: GanttData;
}

export function GanttView({ initialData, ...props }: GanttViewProps) {
  const { zoom, setZoom, colorMode, setColorMode, setCommandPaletteOpen } = useGanttStore();

  // TanStack Query — keeps data fresh, allows optimistic updates
  const { data } = usePlanning(props.planningId, initialData);
  const liveData = data ?? initialData;

  const colorModeLabel =
    colorMode === "domain" ? "Domaine" : colorMode === "status" ? "Statut" : "Personne";

  const handleColorMode = () => {
    const next: Record<string, "domain" | "status" | "person"> = {
      domain: "status", status: "person", person: "domain",
    };
    setColorMode(next[colorMode]);
  };

  return (
    <div className={styles.view}>
      <Toolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onSearchClick={() => setCommandPaletteOpen(true)}
        onColorModeClick={handleColorMode}
        colorModeLabel={colorModeLabel}
      />
      <div className={styles.ganttOuter}>
        <Gantt
          {...props}
          domains={liveData.domains}
          lots={liveData.lots}
          phases={liveData.phases}
          milestones={liveData.milestones}
          milestoneTypes={liveData.milestoneTypes}
          statuses={liveData.statuses}
          phaseAssignees={liveData.phaseAssignees}
        />
      </div>

      {/* Panels */}
      <EditPanel planningId={props.planningId} data={liveData} />
      <BulkBar planningId={props.planningId} />
      <CommandPalette data={liveData} planningId={props.planningId} />
    </div>
  );
}
