/**
 * Authenticated app layout — Rail (fixed) + Topbar + Toolbar + content.
 * All pages under /p, /synthese, /ressources, /parametres, /historique
 * are rendered within this layout.
 */
import { Rail } from "@/components/chrome/Rail";
import { Topbar } from "@/components/chrome/Topbar";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Rail />
      <div className={styles.content}>
        <Topbar />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
