/**
 * Donut — conic-gradient progress ring for lot status.
 * Used in the GanttSide column next to lot names.
 */

import type { StatusCode } from "./StatusPill";

interface DonutProps {
  progress: number;    // 0–100
  status: StatusCode;
  size?: number;       // default 32
  strokeWidth?: number; // default 4 (visual ring thickness approximation)
}

const STATUS_COLORS: Record<StatusCode, string> = {
  planned:     "#94A3B8",
  in_progress: "#3B82F6",
  review:      "#EAB308",
  done:        "#16A34A",
  risk:        "#F59E0B",
  late:        "#DC2626",
};

export function Donut({ progress, status, size = 32, strokeWidth = 4 }: DonutProps) {
  const color = STATUS_COLORS[status] ?? "#94A3B8";
  const pct = Math.min(100, Math.max(0, progress));
  const r = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashArray = circumference;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, display: "block" }}
      aria-label={`Avancement ${pct}%`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      role="progressbar"
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="var(--klint-line, #E6E8EE)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      {pct > 0 && (
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      )}
      {/* Center text */}
      {pct > 0 && (
        <text
          x={cx}
          y={cx}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size < 28 ? 7 : 8}
          fontWeight={700}
          fill={color}
          fontFamily="var(--font-display, system-ui)"
        >
          {pct}
        </text>
      )}
    </svg>
  );
}

export default Donut;
