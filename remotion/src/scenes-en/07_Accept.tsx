import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { colors, fontUI, fontDisplay } from "../theme";

export const Accept: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const accepted = frame > 130;
  const checkS = spring({ frame: frame - 130, fps, config: { damping: 12, stiffness: 140 } });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${colors.surface}, ${colors.bg})` }}>
      <div style={{ position: "absolute", inset: "40px 120px", background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 44, background: "#F1F3F5", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
          <div style={{ display: "flex", gap: 7 }}>
            <Dot c="#FF5F57" /><Dot c="#FEBC2E" /><Dot c="#28C840" />
          </div>
          <div style={{ flex: 1, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, height: 28, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#6B7280", margin: "0 80px" }}>
            🔒 closeflow.app/p/9k2-x7m
          </div>
        </div>

        <div style={{ flex: 1, background: "#FAFAFA", padding: "50px 80px", display: "flex", flexDirection: "column", gap: 24, color: "#0F172A", fontFamily: fontUI }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryGlow})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⌁</div>
            <div style={{ fontFamily: fontDisplay, fontWeight: 700, fontSize: 20 }}>CloseFlow</div>
          </div>

          <div>
            <div style={{ fontFamily: fontDisplay, fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>Brand identity + menu</div>
            <div style={{ fontSize: 16, color: "#6B7280", marginTop: 6 }}>Prepared for Stella Bakery • Valid until Jun 22, 2026</div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, padding: 28, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Brand identity design", "$ 2,800"],
              ["Printed menu (3 versions)", "$ 1,200"],
              ["Social media posts (3×)", "$ 2,400"],
            ].map(([d, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? "1px solid #F1F5F9" : "none", fontSize: 16 }}>
                <span>{d}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <span style={{ color: "#6B7280" }}>Total</span>
              <span style={{ fontFamily: fontDisplay, fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>$ 6,400</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
            <div style={{ padding: "18px 46px", background: accepted ? colors.success : colors.primary, color: "#fff", borderRadius: 12, fontFamily: fontUI, fontWeight: 700, fontSize: 18, boxShadow: `0 16px 40px ${(accepted ? colors.success : colors.primary)}66`, display: "flex", alignItems: "center", gap: 12, transform: `scale(${accepted ? 1 + Math.min(checkS, 1) * 0.08 : 1})` }}>
              {accepted ? "✓ Proposal accepted" : "Accept proposal"}
            </div>
          </div>
        </div>
      </div>

      {accepted && (
        <div style={{ position: "absolute", top: "62%", left: "50%", transform: `translate(-50%, -50%) scale(${0.5 + checkS * 2.5})`, opacity: Math.max(0, 1 - checkS * 0.9), width: 200, height: 200, borderRadius: "50%", border: `4px solid ${colors.success}` }} />
      )}

      <Cursor
        path={[
          { frame: 0, pos: { x: 960, y: 540 } },
          { frame: 110, pos: { x: 960, y: 820 } },
          { frame: 200, pos: { x: 960, y: 820 } },
        ]}
        click={[130]}
      />
      <Caption text={accepted ? "Accepted with one click." : "Your client gets a clean, direct link."} from={10} />
    </AbsoluteFill>
  );
};

const Dot = ({ c }: { c: string }) => <div style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />;
