import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { AppFrame } from "../components/AppFrame";
import { KpiCard } from "../components/KpiCard";
import { Caption } from "../components/Caption";
import { colors, fontDisplay, fontUI } from "../theme";

const proposals = [
  { client: "Padaria Estrela", title: "Identidade visual + cardápio", value: "R$ 4.800", status: "Aceita", color: colors.success },
  { client: "Studio Aurora", title: "Site institucional", value: "R$ 9.200", status: "Enviada", color: colors.primary },
  { client: "Café do Centro", title: "Pacote redes sociais", value: "R$ 2.400", status: "Aceita", color: colors.success },
  { client: "Auto Elétrica RJ", title: "Loja virtual", value: "R$ 12.500", status: "Visualizada", color: colors.warning },
  { client: "Doceria Mel", title: "Campanha sazonal", value: "R$ 3.100", status: "Rascunho", color: colors.muted },
];

export const Dashboard: React.FC<{ updated?: boolean }> = ({ updated = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <AppFrame active="Dashboard" pageTitle="Dashboard">
        <div style={{ display: "flex", gap: 18, marginBottom: 28 }}>
          <KpiCard
            label="Pipeline"
            value="0"
            prefix="R$ "
            countTo={updated ? 38400 : 26100}
            countFormat={(n) => Math.round(n).toLocaleString("pt-BR")}
            delta={updated ? "↑ 47%" : "↑ 12%"}
            delay={0}
          />
          <KpiCard
            label="Receita aprovada"
            value="0"
            prefix="R$ "
            countTo={updated ? 19500 : 7200}
            countFormat={(n) => Math.round(n).toLocaleString("pt-BR")}
            delta={updated ? "↑ 171%" : "↑ 22%"}
            delay={6}
          />
          <KpiCard
            label="Taxa de conversão"
            value="0"
            suffix="%"
            countTo={updated ? 64 : 41}
            countFormat={(n) => n.toFixed(0)}
            delta={updated ? "↑ 23 pp" : "↑ 5 pp"}
            delay={12}
          />
          <KpiCard
            label="Ticket médio"
            value="0"
            prefix="R$ "
            countTo={updated ? 6500 : 4800}
            countFormat={(n) => Math.round(n).toLocaleString("pt-BR")}
            delta={updated ? "↑ 35%" : "↑ 8%"}
            delay={18}
          />
        </div>

        {/* Chart + recent */}
        <div style={{ display: "flex", gap: 18, height: 480 }}>
          {/* Chart */}
          <div
            style={{
              flex: 1.4,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 24,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600, marginBottom: 4, color: colors.text }}>
              Receita aprovada
            </div>
            <div style={{ fontSize: 13, color: colors.muted, marginBottom: 18 }}>Últimos 30 dias</div>
            <Chart updated={updated} />
          </div>

          {/* Recent */}
          <div
            style={{
              flex: 1,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600, marginBottom: 16, color: colors.text }}>
              Propostas recentes
            </div>
            {proposals.map((p, i) => {
              const s = spring({ frame: frame - 30 - i * 6, fps, config: { damping: 20, stiffness: 140 } });
              const op = interpolate(s, [0, 1], [0, 1]);
              const x = interpolate(s, [0, 1], [24, 0]);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 6px",
                    borderBottom: i < proposals.length - 1 ? `1px solid ${colors.border}` : "none",
                    opacity: op,
                    transform: `translateX(${x}px)`,
                    fontFamily: fontUI,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{p.client}</div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginRight: 14 }}>{p.value}</div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: p.color,
                      background: `${p.color}22`,
                      padding: "4px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {p.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppFrame>
      <Caption text={updated ? "Resultados visíveis na hora." : "Acompanhe seu funil em tempo real."} from={20} />
    </AbsoluteFill>
  );
};

const Chart: React.FC<{ updated: boolean }> = ({ updated }) => {
  const frame = useCurrentFrame();
  const base = [12, 18, 14, 22, 28, 24, 35, 30, 42, 38, 48, 55];
  const bumped = updated ? base.map((v, i) => v + (i > 7 ? 18 : 0)) : base;
  const max = 78;
  const w = 720;
  const h = 360;
  const padding = 30;
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;
  const stepX = innerW / (bumped.length - 1);
  const reveal = interpolate(frame, [25, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pts = bumped.map((v, i) => {
    const x = padding + i * stepX;
    const y = padding + innerH - (v / max) * innerH;
    return { x, y };
  });

  const visibleCount = Math.max(1, Math.floor(pts.length * reveal));
  const pathD = pts
    .slice(0, visibleCount)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ flex: 1 }}>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.35" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={padding}
          x2={w - padding}
          y1={padding + (innerH / 3) * i}
          y2={padding + (innerH / 3) * i}
          stroke={colors.border}
          strokeWidth={1}
        />
      ))}
      <path
        d={`${pathD} L ${pts[visibleCount - 1]?.x} ${h - padding} L ${padding} ${h - padding} Z`}
        fill="url(#area)"
      />
      <path d={pathD} stroke={colors.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.slice(0, visibleCount).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.primaryGlow} />
      ))}
    </svg>
  );
};
