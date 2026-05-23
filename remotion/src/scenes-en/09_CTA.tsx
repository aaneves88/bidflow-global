import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fontDisplay, fontUI } from "../theme";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const scale = interpolate(s, [0, 1], [0.8, 1]);
  const op = interpolate(s, [0, 1], [0, 1]);

  const lineS = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 140 } });

  const lines = ["Create proposals.", "Track deals.", "Close more business."];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 50%, ${colors.primary}33, ${colors.bg} 65%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `scale(${scale})`, opacity: op }}>
        <div style={{ width: 90, height: 90, borderRadius: 22, background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryGlow})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "#fff", boxShadow: `0 30px 80px ${colors.primary}66` }}>⌁</div>
        <div style={{ fontFamily: fontDisplay, fontSize: 96, fontWeight: 700, letterSpacing: -3, color: colors.text }}>CloseFlow</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {lines.map((l, i) => {
          const ls = lineS(20 + i * 14);
          const opl = interpolate(ls, [0, 1], [0, 1]);
          const y = interpolate(ls, [0, 1], [16, 0]);
          return (
            <div
              key={i}
              style={{
                fontFamily: fontDisplay,
                fontSize: 52,
                color: i === 2 ? "#7DD3FC" : colors.text,
                fontWeight: i === 2 ? 700 : 600,
                letterSpacing: -1.5,
                opacity: opl,
                transform: `translateY(${y}px)`,
              }}
            >
              {l}
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: fontUI, fontSize: 22, color: colors.muted, marginTop: 20, letterSpacing: 1, opacity: interpolate(frame, [110, 150], [0, 1], { extrapolateRight: "clamp" }) }}>
        closeflow.app
      </div>
    </AbsoluteFill>
  );
};
