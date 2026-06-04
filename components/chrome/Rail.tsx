/**
 * Rail — vertical nav, 60px wide, navy background.
 * Fixed left, full height. Contains icon buttons with tooltip popover.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import styles from "./Rail.module.css";

interface NavItem {
  href: string;
  icon: import("@/components/ui/Icon").IconName;
  label: string;
}

const TOP_NAV: NavItem[] = [
  { href: "/p",           icon: "calendar",  label: "Planning"    },
  { href: "/synthese",    icon: "chartLine", label: "Synthèse"    },
  { href: "/ressources",  icon: "users",     label: "Ressources"  },
  { href: "/parametres",  icon: "settings",  label: "Paramètres"  },
  { href: "/historique",  icon: "history",   label: "Historique"  },
];

const BOTTOM_NAV: NavItem[] = [
  { href: "/presentation", icon: "presenting", label: "Présentation" },
  { href: "/aide",         icon: "info",       label: "Aide"        },
];

interface RailProps {
  avatarInitials?: string;
  avatarColor?: string;
}

export function Rail({ avatarInitials = "?", avatarColor = "#001D63" }: RailProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/p" ? pathname.startsWith("/p") : pathname.startsWith(href);

  return (
    <nav className={styles.rail} aria-label="Navigation principale">
      {/* Brand mark */}
      <div className={styles.brand} aria-hidden>
        <span className={styles.brandK}>K</span>
      </div>

      {/* Top navigation */}
      <div className={styles.topNav}>
        {TOP_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.railBtn} ${isActive(item.href) ? styles.active : ""}`}
            aria-label={item.label}
            data-label={item.label}
          >
            <Icon name={item.icon} size={18} />
          </Link>
        ))}
      </div>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Bottom navigation */}
      <div className={styles.bottomNav}>
        {BOTTOM_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.railBtn} ${isActive(item.href) ? styles.active : ""}`}
            aria-label={item.label}
            data-label={item.label}
          >
            <Icon name={item.icon} size={18} />
          </Link>
        ))}

        {/* User avatar */}
        <button
          className={styles.railAvatar}
          aria-label="Menu profil"
          data-label="Profil"
          style={{ background: avatarColor }}
        >
          {avatarInitials.slice(0, 2).toUpperCase()}
        </button>
      </div>
    </nav>
  );
}

export default Rail;
