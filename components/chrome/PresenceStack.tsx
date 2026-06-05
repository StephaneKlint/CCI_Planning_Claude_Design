"use client";
/**
 * PresenceStack — avatars des membres connectés dans la Topbar.
 * Max 5 visibles + badge "+N".
 */
import { Avatar } from "@/components/ui/Avatar";
import type { ActiveMember } from "@/lib/actions/planning";
import styles from "./PresenceStack.module.css";

interface PresenceStackProps {
  members: ActiveMember[];
  max?: number;
}

export function PresenceStack({ members, max = 5 }: PresenceStackProps) {
  if (members.length === 0) return null;

  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className={styles.stack} aria-label={`${members.length} consultant${members.length > 1 ? "s" : ""} connecté${members.length > 1 ? "s" : ""}`}>
      {visible.map((m, i) => (
        <div
          key={m.memberId}
          className={styles.avatarWrapper}
          style={{ zIndex: max - i }}
          title={m.userName}
        >
          <Avatar
            initials={m.initials}
            color={m.color}
            size="sm"
            ring
            title={m.userName}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div className={styles.overflow} title={`+${overflow} autre${overflow > 1 ? "s" : ""}`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default PresenceStack;
