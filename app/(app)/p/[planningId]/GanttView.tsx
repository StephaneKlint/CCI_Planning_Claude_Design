"use client";
/**
 * GanttView — Toolbar + Gantt + EditPanel + BulkBar + CommandPalette + Présence.
 * Polling 10s (données) + heartbeat/présence 30s via Neon.
 */
import { useRef, useState } from "react";
import { Gantt } from "@/components/gantt/Gantt";
import { Toolbar } from "@/components/chrome/Toolbar";
import { EditPanel } from "@/components/panels/EditPanel";
import { BulkBar } from "@/components/panels/BulkBar";
import { CommandPalette } from "@/components/panels/CommandPalette";
import { PresenceStack } from "@/components/chrome/PresenceStack";
import { useGanttStore } from "@/store/ganttStore";
import { usePlanning } from "@/lib/queries/usePlanning";
import { usePresence } from "@/lib/queries/usePresence";
import type { GanttProps } from "@/components/gantt/types";
import type { GanttData } from "@/lib/db/queries";
import styles from "./GanttView.module.css";

interface GanttViewProps extends GanttProps {
  initialData: GanttData;
  /** Premier membre du planning — utilisé pour le heartbeat demo (Jalon 5: auth session) */
  demoMemberId?: string;
}

export function GanttView({ initialData, demoMemberId, ...props }: GanttViewProps) {
  const ganttRef = useRef<HTMLDivElement>(null);
  const [exportPending, setExportPending] = useState(false);

  const {
    zoom, setZoom,
    colorMode, setColorMode,
    panelMode, setPanelMode,
    setCommandPaletteOpen,
    requestScroll,
    toggleDomainBands,
    filterDateStart, filterDateEnd,
    setFilterDates, clearFilterDates,
  } = useGanttStore();

  // Données en live — polling 10s
  const { data } = usePlanning(props.planningId, initialData);
  const liveData = data ?? initialData;

  // Présence — heartbeat 30s + polling membres actifs 30s
  const activeMembers = usePresence(props.planningId, demoMemberId);

  const colorModeLabel =
    colorMode === "domain" ? "Domaine" : colorMode === "status" ? "Statut" : "Personne";

  const handleColorMode = () => {
    const next: Record<string, "domain" | "status" | "person"> = {
      domain: "status", status: "person", person: "domain",
    };
    setColorMode(next[colorMode]);
  };

  const handleTogglePanel = () => {
    setPanelMode(panelMode === "hidden" ? "compact" : "hidden");
  };

  const handleExportPdf = async () => {
    if (!ganttRef.current || exportPending) return;
    setExportPending(true);
    try {
      // Dynamic import — évite le bundle côté server
      const html2canvas = (await import("html2canvas")).default;

      const el = ganttRef.current;
      const canvas = await html2canvas(el, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const planningName = liveData.planning.name;

      // Ouvre une fenêtre de prévisualisation / impression
      const printWin = window.open("", "_blank");
      if (!printWin) {
        alert("Autorisez les pop-ups pour l'impression.");
        return;
      }
      printWin.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${planningName} — Planning A3</title>
  <style>
    @page { size: A3 landscape; margin: 8mm; }
    @media print { .toolbar { display:none !important; } body { margin:0; } .img-wrap { padding:0; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; }
    .toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 20px; background: #001036; color: white;
      position: sticky; top: 0; z-index: 10; gap: 12px;
    }
    .toolbar h1 { font-size: 15px; font-weight: 700; flex: 1; }
    .toolbar-hint { font-size: 12px; color: rgba(255,255,255,0.55); }
    .toolbar-btns { display: flex; gap: 8px; }
    .print-btn {
      padding: 7px 18px; background: #5CD696; color: #001036;
      border: none; border-radius: 6px; font-weight: 700;
      font-size: 13px; cursor: pointer; font-family: inherit;
    }
    .print-btn:hover { opacity: 0.88; }
    .close-btn {
      padding: 7px 14px; background: transparent; color: white;
      border: 1px solid rgba(255,255,255,0.3); border-radius: 6px;
      font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit;
    }
    .close-btn:hover { background: rgba(255,255,255,0.1); }
    .img-wrap { padding: 8mm; }
    img { width: 100%; height: auto; display: block; }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>${planningName} — Planning A3 paysage</h1>
    <span class="toolbar-hint">Format A3 paysage — 420 × 297 mm</span>
    <div class="toolbar-btns">
      <button class="close-btn" onclick="window.close()">Fermer</button>
      <button class="print-btn" onclick="window.print()">🖨️&nbsp;Imprimer / PDF</button>
    </div>
  </div>
  <div class="img-wrap">
    <img src="${imgData}" alt="${planningName}">
  </div>
</body>
</html>`);
      printWin.document.close();
    } catch (err) {
      console.error("Export PDF failed:", err);
      alert("L'export PDF a échoué. Essayez de réduire le zoom ou la période affichée.");
    } finally {
      setExportPending(false);
    }
  };

  return (
    <div className={styles.view}>
      <Toolbar
        zoom={zoom}
        onZoomChange={setZoom}
        onTodayClick={() => requestScroll("today")}
        onScrollPrev={() => requestScroll("prev")}
        onScrollNext={() => requestScroll("next")}
        onTogglePanel={handleTogglePanel}
        onVisibilityClick={toggleDomainBands}
        onSearchClick={() => setCommandPaletteOpen(true)}
        onColorModeClick={handleColorMode}
        onExportPdf={handleExportPdf}
        exportPdfPending={exportPending}
        colorModeLabel={colorModeLabel}
        presenceStack={<PresenceStack members={activeMembers} />}
        panelVisible={panelMode !== "hidden"}
        filterStart={filterDateStart}
        filterEnd={filterDateEnd}
        onFilterDatesChange={setFilterDates}
        onClearFilter={clearFilterDates}
      />
      <div className={styles.ganttOuter} ref={ganttRef}>
        <Gantt
          {...props}
          viewStart={filterDateStart ?? props.viewStart}
          viewEnd={filterDateEnd ?? props.viewEnd}
          domains={liveData.domains}
          lots={liveData.lots}
          phases={liveData.phases}
          milestones={liveData.milestones}
          milestoneTypes={liveData.milestoneTypes}
          statuses={liveData.statuses}
          phaseAssignees={liveData.phaseAssignees}
        />
      </div>

      <EditPanel planningId={props.planningId} data={liveData} />
      <BulkBar planningId={props.planningId} />
      <CommandPalette data={liveData} planningId={props.planningId} />
    </div>
  );
}
