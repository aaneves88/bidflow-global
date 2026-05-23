import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { AppFrame } from "../components/AppFrame";
import { Caption } from "../components/Caption";
import { colors, fontUI, fontDisplay } from "../theme";

export const Share: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const copyS = spring({ frame: frame - 30, fps, config: { damping: 14, stiffness: 160 } });
  const copiedFlash = interpolate(frame - 30, [0, 8, 40, 50], [0, 1, 1, 0], { extrapolateRight: "clamp" });

  const whatsappS = spring({ frame: frame - 110, fps, config: { damping: 14, stiffness: 160 } });
  const pdfS = spring({ frame: frame - 190, fps, config: { damping: 14, stiffness: 160 } });

  return (
    <AbsoluteFill>
      <AppFrame lang="en" active="Proposals" pageTitle="Brand identity + menu">
        <div style={{ display: "flex", gap: 24, height: "100%" }}>
          <div style={{ flex: 1.2, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 30, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700, color: colors.text, letterSpacing: -0.8 }}>Stella Bakery</div>
            <div style={{ fontSize: 13, color: colors.muted }}>Proposal #0042 — Valid until Jun 22, 2026</div>
            <div style={{ height: 1, background: colors.border, margin: "8px 0" }} />
            {[
              ["Brand identity design", "$ 2,800"],
              ["Printed menu (3 versions)", "$ 1,200"],
              ["Social media posts (3×)", "$ 2,400"],
            ].map(([d, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: fontUI, fontSize: 15, color: colors.text, padding: "10px 0", borderBottom: `1px solid ${colors.border}` }}>
                <span>{d}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
              <span style={{ fontFamily: fontUI, fontSize: 14, color: colors.muted }}>Total</span>
              <span style={{ fontFamily: fontDisplay, fontSize: 44, fontWeight: 700, color: colors.text, letterSpacing: -1.5 }}>$ 6,400</span>
            </div>
          </div>

          <div style={{ flex: 1, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 30, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 600, color: colors.text }}>Share</div>
            <div style={{ fontFamily: fontUI, fontSize: 13, color: colors.muted, fontWeight: 500 }}>Public link</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1, background: colors.surfaceAlt, border: `1px solid ${colors.border}`, borderRadius: 10, padding: "12px 14px", fontFamily: "ui-monospace, monospace", fontSize: 13, color: colors.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                closeflow.app/p/9k2-x7m
              </div>
              <div style={{ padding: "12px 18px", background: copiedFlash > 0 ? colors.success : colors.primary, borderRadius: 10, color: "#fff", fontFamily: fontUI, fontWeight: 600, fontSize: 13, transform: `scale(${1 + copyS * 0.05 * (1 - copiedFlash)})`, whiteSpace: "nowrap" }}>
                {copiedFlash > 0.3 ? "✓ Copied!" : "Copy link"}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <ActionBtn icon="◉" label="Send via WhatsApp" color="#25D366" active={whatsappS > 0.1} scale={1 + whatsappS * 0.04} />
              <ActionBtn icon="◫" label="Download PDF" color={colors.primary} active={pdfS > 0.1} scale={1 + pdfS * 0.04} />
            </div>

            <div style={{ flex: 1 }} />
          </div>
        </div>
      </AppFrame>

      {frame > 130 && frame < 200 && (
        <FloatToast x={1380} y={760} text="WhatsApp message ready" icon="◉" color="#25D366" from={130} />
      )}
      {frame > 210 && (
        <FloatToast x={1380} y={760} text="proposal-0042.pdf generated" icon="◫" color={colors.primary} from={210} />
      )}

      <Caption text="Share via link, WhatsApp, or PDF." from={10} />
    </AbsoluteFill>
  );
};

const ActionBtn: React.FC<{ icon: string; label: string; color: string; active: boolean; scale: number }> = ({ icon, label, color, active, scale }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: active ? `${color}22` : colors.surfaceAlt, border: `1px solid ${active ? color : colors.border}`, borderRadius: 12, fontFamily: fontUI, fontSize: 15, fontWeight: 600, color: active ? color : colors.text, transform: `scale(${scale})` }}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    {label}
  </div>
);

const FloatToast: React.FC<{ x: number; y: number; text: string; icon: string; color: string; from: number }> = ({ x, y, text, icon, color, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 16, stiffness: 160 } });
  const op = interpolate(s, [0, 1], [0, 1]);
  const sy = interpolate(s, [0, 1], [20, 0]);
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateY(${sy}px)`, opacity: op, background: colors.surfaceAlt, border: `1px solid ${color}`, borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, fontFamily: fontUI, fontSize: 14, fontWeight: 600, color: colors.text, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
      <span style={{ color, fontSize: 18 }}>{icon}</span>
      {text}
    </div>
  );
};
