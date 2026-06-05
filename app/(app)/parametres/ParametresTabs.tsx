"use client";

import { useState } from "react";
import styles from "./Parametres.module.css";
import type { GanttData } from "@/lib/db/queries";

type Tab = "general" | "cadence" | "phases" | "jalons" | "statuts";

const TABS: { id: Tab; label: string }[] = [
  { id: "general",  label: "Général" },
  { id: "cadence",  label: "Cadence" },
  { id: "phases",   label: "Types de phases" },
  { id: "jalons",   label: "Types de jalons" },
  { id: "statuts",  label: "Statuts" },
];

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

export function ParametresTabs({ data }: { data: GanttData }) {
  const [active, setActive] = useState<Tab>("general");
  const { planning, settings, domains, phaseTypes, milestoneTypes, statuses } = data;

  return (
    <div className={styles.tabs}>
      <div className={styles.tabBar} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={`${styles.tabBtn} ${active === t.id ? styles.tabBtnActive : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Général */}
      {active === "general" && (
        <div className={styles.tabPanel}>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Nom du planning</span>
              <span className={styles.fieldValue}>{planning.name}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Année</span>
              <span className={styles.fieldValue}>{planning.year}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Période</span>
              <span className={styles.fieldValue}>
                {fmtDate(planning.viewStart)} → {fmtDate(planning.viewEnd)}
              </span>
            </div>
            {planning.description && (
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.fieldLabel}>Description</span>
                <span className={styles.fieldValue}>{planning.description}</span>
              </div>
            )}
            {settings && (
              <>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Retard automatique</span>
                  <span className={`${styles.pill} ${settings.autoLate ? styles.pillOn : styles.pillOff}`}>
                    {settings.autoLate ? "Activé" : "Désactivé"}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Clôture auto après MEP</span>
                  <span className={styles.fieldValue}>{settings.autoCloseAfterMepDays} jours</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Notif. retard</span>
                  <span className={`${styles.pill} ${settings.notifyOnLate ? styles.pillOn : styles.pillOff}`}>
                    {settings.notifyOnLate ? "Activé" : "Désactivé"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cadence */}
      {active === "cadence" && (
        <div className={styles.tabPanel}>
          <p className={styles.tabDesc}>
            Nombre de jours ouvrés entre la livraison et chaque jalon automatique (par domaine).
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Domaine</th>
                <th>Livraison</th>
                <th>Pré-MEP</th>
                <th>CAB</th>
                <th>MEP</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span
                      className={styles.domainChip}
                      style={{ background: `var(--d-${d.code}-bg)`, color: `var(--d-${d.code}-strong)` }}
                    >
                      {d.code.toUpperCase()}
                    </span>{" "}
                    {d.name}
                  </td>
                  <td>{d.cadence.livraison}j</td>
                  <td>{d.cadence.pmep}j</td>
                  <td>{d.cadence.cab}j</td>
                  <td>{d.cadence.mep}j</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Types de phases */}
      {active === "phases" && (
        <div className={styles.tabPanel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Libellé</th>
              </tr>
            </thead>
            <tbody>
              {phaseTypes.map((pt, i) => (
                <tr key={pt.id}>
                  <td className={styles.tdMuted}>{i + 1}</td>
                  <td>
                    <code className={styles.codeChip}>{pt.code}</code>
                  </td>
                  <td>{pt.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Types de jalons */}
      {active === "jalons" && (
        <div className={styles.tabPanel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Libellé</th>
                <th>Couleur</th>
              </tr>
            </thead>
            <tbody>
              {milestoneTypes.map((mt, i) => (
                <tr key={mt.id}>
                  <td className={styles.tdMuted}>{i + 1}</td>
                  <td>
                    <code className={styles.codeChip}>{mt.code}</code>
                  </td>
                  <td>{mt.label}</td>
                  <td>
                    <span
                      className={styles.colorSwatch}
                      style={{ background: mt.color }}
                      title={mt.color}
                    />
                    <span className={styles.tdMuted}>{mt.color}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Statuts */}
      {active === "statuts" && (
        <div className={styles.tabPanel}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Libellé</th>
                <th>Aperçu</th>
              </tr>
            </thead>
            <tbody>
              {statuses.map((s, i) => (
                <tr key={s.id}>
                  <td className={styles.tdMuted}>{i + 1}</td>
                  <td>
                    <code className={styles.codeChip}>{s.code}</code>
                  </td>
                  <td>{s.label}</td>
                  <td>
                    <span
                      className={styles.statusPreview}
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
