import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fontDisplay, fontUI } from "../theme";

export const KpiCard: React.FC<{
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  delta?: string;
  delay?: number;
  countTo?: number;
  countFormat?: (n: number) => string;
}> = ({ label, value, prefix, suffix, delta, delay = 0, countTo, countFormat }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 140 } });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [16, 0]);

  let displayValue: string | number = value;
  if (countTo !== undefined) {
    const t = interpolate(frame - delay - 4, [0, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const eased = 1 - Math.pow(1 - t, 3);
    const n = countTo * eased;
    displayValue = countFormat ? countFormat(n) : Math.round(n).toString();
  }

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 16,
        padding: "22px 24px",
        opacity,
        transform: `translateY(${y}px)`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minWidth: 0,
      }}
    >
      <div style={{ fontFamily: fontUI, fontSize: 14, color: colors.muted, fontWeight: 500 }}>{label}</div>
      <div
        style={{
          fontFamily: fontDisplay,
          fontSize: 42,
          fontWeight: 700,
          letterSpacing: -1.2,
          color: colors.text,
          lineHeight: 1,
        }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </div>
      {delta && (
        <div style={{ fontSize: 13, color: colors.success, fontWeight: 600 }}>{delta}</div>
      )}
    </div>
  );
};
