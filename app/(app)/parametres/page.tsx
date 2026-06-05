export const dynamic = "force-dynamic";

import { listPlannings, getGanttData } from "@/lib/db/queries";
import { ParametresTabs } from "./ParametresTabs";
import styles from "./Parametres.module.css";

export default async function ParametresPage() {
  const planningList = await listPlannings();
  if (!planningList.length) {
    return <div className={styles.empty}>Aucun planning disponible.</div>;
  }

  const data = await getGanttData(planningList[0].id);
  if (!data) return <div className={styles.empty}>Données introuvables.</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Paramètres</h1>
        <span className={styles.subtitle}>{data.planning.name}</span>
      </header>
      <ParametresTabs data={data} />
    </div>
  );
}
