/**
 * Toolbar — 48px, 3 groups: left (panel toggle + today + zoom) | center (search + filters) | right (display toggles)
 */
"use client";

import { Icon } from "@/components/ui/Icon";
import styles from "./Toolbar.module.css";

export type ZoomLevel = "1m" | "3m" | "6m" | "12m";

interface ToolbarProps {
  zoom?: ZoomLevel;
  onZoomChange?: (zoom: ZoomLevel) => void;
  onTodayClick?: () => void;
  onTogglePanel?: () => void;
  onVisibilityClick?: () => void;
  onColorModeClick?: () => void;
  colorModeLabel?: string;
}

const ZOOM_LEVELS: ZoomLevel[] = ["1m", "3m", "6m", "12m"];

export function Toolbar({
  zoom = "12m",
  onZoomChange,
  onTodayClick,
  onTogglePanel,
  onVisibilityClick,
  onColorModeClick,
  colorModeLabel = "Domaine",
}: ToolbarProps) {
  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Barre d'outils du planning">
      {/* Groupe gauche — Navigation */}
      <div className={styles.group}>
        <button
          className={styles.btn}
          onClick={onTogglePanel}
          aria-label="Masquer/Afficher le panneau"
          title="Masquer/Afficher le panneau ([)"
        >
          <Icon name="layers" size={14} />
        </button>

        <button
          className={styles.btn}
          onClick={onTodayClick}
          aria-label="Aller à aujourd'hui"
          title="Aller à aujourd'hui"
        >
          <Icon name="today" size={14} />
          <span>Aujourd&apos;hui</span>
        </button>

        <div className={styles.zoomSwitch} role="radiogroup" aria-label="Niveau de zoom">
          {ZOOM_LEVELS.map((z) => (
            <button
              key={z}
              className={`${styles.zoomBtn} ${zoom === z ? styles.zoomActive : ""}`}
              onClick={() => onZoomChange?.(z)}
              aria-pressed={zoom === z}
              aria-label={`Afficher ${z}`}
            >
              {z}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.divider} aria-hidden />

      {/* Groupe centre — Filtres */}
      <div className={`${styles.group} ${styles.groupCenter}`}>
        <button
          className={styles.btn}
          onClick={onVisibilityClick}
          aria-label="Affichage des lots"
          title="Afficher/masquer domaines et lots"
        >
          <Icon name="eye" size={14} />
          <span>Affichage</span>
        </button>

        <button
          className={styles.btn}
          onClick={onColorModeClick}
          aria-label={`Coloration : ${colorModeLabel}`}
          title="Changer le mode de coloration"
        >
          <Icon name="filter" size={14} />
          <span>{colorModeLabel}</span>
        </button>
      </div>

      <div className={styles.divider} aria-hidden />

      {/* Groupe droite — Responsive spacer */}
      <div className={`${styles.group} ${styles.groupRight}`}>
        <button className={styles.btn} aria-label="Tri" title="Trier les lots">
          <Icon name="sort" size={14} />
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
