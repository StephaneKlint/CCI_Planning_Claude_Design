/**
 * /debug/icons — Visual showcase of all 52 icons.
 * Jalon 2 validation page. To be removed before production.
 */
import { Icon, type IconName } from "@/components/ui/Icon";

const ALL_ICONS: IconName[] = [
  "search", "plus", "bell", "settings", "chevron", "chevronRight",
  "chevronLeft", "chevronUp", "home", "calendar", "list", "grid",
  "kanban", "workload", "users", "user", "folder", "chart",
  "filter", "download", "upload", "today", "zoomOut", "zoomIn",
  "sort", "close", "plug", "key", "shield", "sparkle", "drag",
  "flag", "link", "edit", "archive", "trash", "note", "history",
  "layers", "eye", "eyeOff", "chartLine", "diamond", "moon", "sun",
  "play", "info", "share", "ai", "file", "expand", "presenting",
];

export default function IconsDebugPage() {
  return (
    <div style={{ padding: "32px", fontFamily: "var(--font-display, system-ui)" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4, color: "var(--klint-navy, #001036)" }}>
        🎨 Icônes — Klint Planning
      </h1>
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 32 }}>
        {ALL_ICONS.length} icônes · stroke-width 1.7 · viewBox 0 0 24 24
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 16 }}>
        {ALL_ICONS.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "16px 8px",
              border: "1px solid var(--klint-line, #E6E8EE)",
              borderRadius: 12,
              background: "#ffffff",
            }}
          >
            <Icon name={name} size={20} aria-label={name} />
            <span style={{ fontSize: 10, color: "#6B7280", textAlign: "center", wordBreak: "break-all" }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Size preview */}
      <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 48, marginBottom: 16 }}>
        Tailles disponibles
      </h2>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
        {[12, 14, 16, 18, 20, 24, 32].map((size) => (
          <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Icon name="calendar" size={size} />
            <span style={{ fontSize: 10, color: "#6B7280" }}>{size}px</span>
          </div>
        ))}
      </div>

      {/* Color preview */}
      <h2 style={{ fontSize: 15, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>
        Couleurs (héritage via color: …)
      </h2>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {[
          { color: "#001036", label: "Navy" },
          { color: "#5CD696", label: "Mint" },
          { color: "#E8568A", label: "MCO" },
          { color: "#3B82F6", label: "CEOS" },
          { color: "#F08A3E", label: "CFPI" },
          { color: "#DC2626", label: "Danger" },
        ].map(({ color, label }) => (
          <div key={color} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Icon name="flag" size={20} style={{ color }} />
            <span style={{ fontSize: 10, color: "#6B7280" }}>{label}</span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 48, fontSize: 11, color: "#9CA3AF" }}>
        Page debug — Jalon 2. À supprimer avant production.
      </p>
    </div>
  );
}
