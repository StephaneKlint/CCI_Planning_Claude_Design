"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { duplicatePlanning, archivePlanning, importPlanningFromJSON } from "@/lib/actions/plannings";
import styles from "./Plannings.module.css";

type PlanningRow = {
  id: string;
  name: string;
  year: number;
  type: string;
  archived: boolean;
  viewStart: string;
  viewEnd: string;
  createdAt: Date;
};

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

const TYPE_LABELS: Record<string, string> = {
  multi: "Multi-projets",
  mono:  "Mono-projet",
};

export function PlanningListClient({ plannings }: { plannings: PlanningRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [action, setAction] = useState<"dup" | "archive" | null>(null);

  // Import JSON
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importPending, setImportPending] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleDuplicate = (p: PlanningRow) => {
    if (isPending) return;
    setLoadingId(p.id);
    setAction("dup");
    startTransition(async () => {
      const newId = await duplicatePlanning(p.id);
      router.push(`/p/${newId}`);
    });
  };

  const handleArchive = (p: PlanningRow) => {
    if (!confirm(`Archiver "${p.name}" ? Il ne sera plus accessible depuis la liste.`)) return;
    if (isPending) return;
    setLoadingId(p.id);
    setAction("archive");
    startTransition(async () => {
      await archivePlanning(p.id);
      setLoadingId(null);
      setAction(null);
      router.refresh();
    });
  };

  const handleImportClick = () => {
    setImportError(null);
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setImportPending(true);
    setImportError(null);
    try {
      const text = await file.text();
      const newId = await importPlanningFromJSON(text);
      router.push(`/p/${newId}`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erreur lors de l'import.");
      setImportPending(false);
    }
  };

  if (plannings.length === 0) {
    return (
      <>
        {/* Import input (hidden) */}
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={handleImportFile}
        />
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Aucun planning actif</p>
          <p className={styles.emptyDesc}>Créez votre premier planning pour démarrer ou importez un fichier JSON.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/plannings/nouveau" className={styles.emptyBtn}>
              + Nouveau planning
            </Link>
            <button
              className={styles.importBtn}
              onClick={handleImportClick}
              disabled={importPending}
              style={{ marginTop: 8 }}
            >
              {importPending ? "Import en cours…" : "⬆ Importer JSON"}
            </button>
          </div>
          {importError && (
            <p style={{ color: "#DC2626", fontSize: "var(--text-13)", marginTop: 8 }}>{importError}</p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Import input (hidden) */}
      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />

      {/* Import button visible depuis la liste */}
      <div className={styles.listTopBar}>
        <button
          className={styles.importBtn}
          onClick={handleImportClick}
          disabled={importPending}
        >
          {importPending ? "Import en cours…" : "⬆ Importer JSON"}
        </button>
        {importError && (
          <span className={styles.importError}>{importError}</span>
        )}
      </div>

      <div className={styles.grid}>
        {plannings.map((p) => {
          const isThis = loadingId === p.id;
          return (
            <div key={p.id} className={styles.card}>
              {/* Header */}
              <div className={styles.cardHead}>
                <span className={styles.cardType}>{TYPE_LABELS[p.type] ?? p.type}</span>
                <span className={styles.cardYear}>{p.year}</span>
              </div>

              {/* Title */}
              <Link href={`/p/${p.id}`} className={styles.cardTitle}>
                {p.name}
              </Link>

              {/* Meta */}
              <p className={styles.cardMeta}>
                {fmtDate(p.viewStart)} → {fmtDate(p.viewEnd)}
              </p>

              {/* Actions */}
              <div className={styles.cardActions}>
                <Link href={`/p/${p.id}`} className={styles.openBtn}>
                  Ouvrir →
                </Link>
                <button
                  className={styles.dupBtn}
                  onClick={() => handleDuplicate(p)}
                  disabled={isPending}
                  title="Dupliquer ce planning"
                >
                  {isThis && action === "dup" ? "Copie en cours…" : "⧉ Dupliquer"}
                </button>
                <a
                  href={`/api/export/${p.id}`}
                  className={styles.exportJsonBtn}
                  title="Exporter en JSON"
                  download
                >
                  ⬇ JSON
                </a>
                <button
                  className={styles.archiveBtn}
                  onClick={() => handleArchive(p)}
                  disabled={isPending}
                  title="Archiver ce planning"
                >
                  {isThis && action === "archive" ? "Archivage…" : "Archive"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
