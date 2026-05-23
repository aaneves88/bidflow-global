import { colors, fontUI, fontDisplay } from "../theme";

const items = [
  { label: "Dashboard", icon: "▦" },
  { label: "Clientes", icon: "◉" },
  { label: "Propostas", icon: "◈" },
  { label: "Configurações", icon: "✺" },
];

export const AppFrame: React.FC<{
  active: string;
  pageTitle: string;
  children: React.ReactNode;
}> = ({ active, pageTitle, children }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: colors.bg,
        fontFamily: fontUI,
        color: colors.text,
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 260,
          background: colors.surface,
          borderRight: `1px solid ${colors.border}`,
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 8px 24px",
            fontFamily: fontDisplay,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.5,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryGlow})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "#fff",
            }}
          >
            ⌁
          </div>
          CloseFlow
        </div>
        {items.map((it) => {
          const isActive = it.label === active;
          return (
            <div
              key={it.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 500,
                background: isActive ? `${colors.primary}22` : "transparent",
                color: isActive ? colors.primaryGlow : colors.muted,
                border: isActive ? `1px solid ${colors.primary}44` : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: 18 }}>{it.icon}</span>
              {it.label}
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 10,
            background: colors.surfaceAlt,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: `linear-gradient(135deg, #F59E0B, #EF4444)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            JS
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>João Silva</div>
            <div style={{ fontSize: 12, color: colors.muted }}>Admin</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div
          style={{
            height: 72,
            borderBottom: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontFamily: fontDisplay,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: -0.5,
            }}
          >
            {pageTitle}
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 280,
                height: 40,
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                fontSize: 14,
                color: colors.muted,
              }}
            >
              ⌕ &nbsp; Buscar...
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: 40, overflow: "hidden", position: "relative" }}>{children}</div>
      </div>
    </div>
  );
};
