import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fontDisplay } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const scale = interpolate(s, [0, 1], [0.7, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const tagS = spring({ frame: frame - 22, fps, config: { damping: 22, stiffness: 140 } });
  const tagY = interpolate(tagS, [0, 1], [20, 0]);
  const tagOp = interpolate(tagS, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 30%, ${colors.primary}22, ${colors.bg} 60%)`,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24, transform: `scale(${scale})`, opacity }}>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 26,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryGlow})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 64,
            color: "#fff",
            boxShadow: `0 30px 80px ${colors.primary}55`,
          }}
        >
          ⌁
        </div>
        <div
          style={{
            fontFamily: fontDisplay,
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: -4,
            color: colors.text,
          }}
        >
          CloseFlow
        </div>
      </div>
      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 30,
          color: colors.muted,
          fontWeight: 500,
          letterSpacing: -0.5,
          transform: `translateY(${tagY}px)`,
          opacity: tagOp,
          textAlign: "center",
          maxWidth: 1100,
        }}
      >
        A lightweight proposal CRM for small businesses
      </div>
    </AbsoluteFill>
  );
};
