/**
 * Authenticated app layout — Rail (fixed) + Topbar + content.
 * All pages under /p, /synthese, /ressources, /parametres, /historique.
 */
import { auth } from "@/auth";
import { Rail } from "@/components/chrome/Rail";
import { Topbar } from "@/components/chrome/Topbar";
import styles from "./layout.module.css";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <>
      <Rail avatarInitials={initials} />
      <div className={styles.content}>
        <Topbar />
        <main className={styles.main}>{children}</main>
      </div>
    </>
  );
}
