/**
 * Avatar — initials on colored background.
 * Sizes: xs(20) sm(24) md(32) lg(40)
 * ring: white ring for stacking overlap.
 */

export type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
  initials: string;       // up to 2 chars
  color?: string;         // hex background color
  size?: AvatarSize;
  ring?: boolean;         // white border ring for stacking
  title?: string;
  className?: string;
}

const SIZES: Record<AvatarSize, { dim: number; font: number }> = {
  xs: { dim: 20, font: 8  },
  sm: { dim: 24, font: 9  },
  md: { dim: 32, font: 11 },
  lg: { dim: 40, font: 14 },
};

export function Avatar({
  initials,
  color = "#001D63",
  size = "md",
  ring = false,
  title,
  className,
}: AvatarProps) {
  const { dim, font } = SIZES[size];

  return (
    <span
      title={title ?? initials}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: dim,
        height: dim,
        minWidth: dim,
        borderRadius: "50%",
        background: color,
        color: "#ffffff",
        fontSize: font,
        fontWeight: 700,
        fontFamily: "var(--font-display, system-ui)",
        letterSpacing: "0.02em",
        userSelect: "none",
        flexShrink: 0,
        outline: ring ? "2px solid #ffffff" : undefined,
        outlineOffset: ring ? "1px" : undefined,
      }}
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default Avatar;
