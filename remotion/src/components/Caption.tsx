import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fontDisplay } from "../theme";

export const Caption: React.FC<{ text: string; from?: number }> = ({ text, from = 8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 22, stiffness: 160 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [24, 0]);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 70,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 38,
          fontWeight: 600,
          color: colors.text,
          background: "rgba(11,13,16,0.72)",
          backdropFilter: "blur(0px)",
          padding: "14px 28px",
          borderRadius: 14,
          border: `1px solid ${colors.border}`,
          letterSpacing: -0.5,
        }}
      >
        {text}
      </div>
    </div>
  );
};
