/**
 * /presentation — Mode présentation Gantt plein écran.
 * Accepte ?planningId=xxx pour choisir le planning.
 * Sans planningId et avec plusieurs plannings → affiche un sélecteur.
 */
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getGanttData, listPlannings } from "@/lib/db/queries";
import { PresentationView } from "./PresentationView";
import styles from "./Presentation.module.css";

interface Props {
  searchParams: Promise<{ planningId?: string }>;
}

export default async function PresentationPage({ searchParams }: Props) {
  const { planningId } = await searchParams;

  // Si un planningId est fourni → charger directement
  if (planningId) {
    const data = await getGanttData(planningId);
    if (!data) notFound();
    return <PresentationView data={data} planningId={planningId} />;
  }

  // Sinon → charger la liste des plannings
  const plannings = await listPlannings();

  // Un seul planning → redirection automatique
  if (plannings.length === 1) {
    const data = await getGanttData(plannings[0].id);
    if (!data) notFound();
    return <PresentationView data={data} planningId={plannings[0].id} />;
  }

  // Aucun planning
  if (plannings.length === 0) {
    return (
      <div className={styles.selector}>
        <h1 className={styles.selectorTitle}>Mode présentation</h1>
        <p className={styles.selectorDesc}>Aucun planning actif. Créez un planning pour démarrer.</p>
        <Link href="/plannings/nouveau" style={{ marginTop: 8 }}>
          + Nouveau planning
        </Link>
      </div>
    );
  }

  // Plusieurs plannings → sélecteur
  return (
    <div className={styles.selector}>
      <h1 className={styles.selectorTitle}>Mode présentation</h1>
      <p className={styles.selectorDesc}>Choisissez le planning à afficher en plein écran.</p>
      <div className={styles.selectorList}>
        {plannings.map((p) => (
          <Link
            key={p.id}
            href={`/presentation?planningId=${p.id}`}
            className={styles.selectorItem}
          >
            <span>{p.name} — {p.year}</span>
            <span className={styles.selectorItemArrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
