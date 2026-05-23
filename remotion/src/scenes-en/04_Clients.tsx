import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { AppFrame } from "../components/AppFrame";
import { Cursor } from "../components/Cursor";
import { Caption } from "../components/Caption";
import { colors, fontUI, fontDisplay } from "../theme";

const clients = [
  { name: "Stella Bakery", email: "contact@stellabakery.com", phone: "+1 (415) 555-0142" },
  { name: "Aurora Studio", email: "hello@aurorastudio.co", phone: "+1 (646) 555-0188" },
  { name: "Centro Café", email: "ops@centrocafe.com", phone: "+1 (312) 555-0166" },
  { name: "RJ Auto Electric", email: "sales@rjauto.io", phone: "+1 (305) 555-0173" },
];

export const Clients: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const showDialog = frame > 80;
  const dialogS = spring({ frame: frame - 80, fps, config: { damping: 18, stiffness: 160 } });
  const dialogScale = interpolate(dialogS, [0, 1], [0.92, 1]);
  const dialogOp = interpolate(dialogS, [0, 1], [0, 1]);

  const nameText = "Bella Flor Florist".slice(0, Math.max(0, Math.floor((frame - 95) / 1.6)));
  const emailText = "contact@bellaflor.com".slice(0, Math.max(0, Math.floor((frame - 130) / 1.6)));
  const phoneText = "+1 (415) 555-0199".slice(0, Math.max(0, Math.floor((frame - 160) / 1.6)));

  return (
    <AbsoluteFill>
      <AppFrame lang="en" active="Clients" pageTitle="Clients">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
          <div style={{ padding: "10px 18px", background: colors.primary, borderRadius: 10, fontFamily: fontUI, fontWeight: 600, fontSize: 14, color: "#fff", boxShadow: `0 6px 18px ${colors.primary}55` }}>
            + New client
          </div>
        </div>

        <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.6fr 0.6fr", padding: "16px 24px", fontFamily: fontUI, fontSize: 12, color: colors.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${colors.border}` }}>
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div></div>
          </div>
          {clients.map((c, i) => {
            const s = spring({ frame: frame - 10 - i * 5, fps, config: { damping: 22, stiffness: 140 } });
            const op = interpolate(s, [0, 1], [0, 1]);
            const x = interpolate(s, [0, 1], [16, 0]);
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.6fr 0.6fr", padding: "18px 24px", fontFamily: fontUI, fontSize: 15, color: colors.text, borderBottom: i < clients.length - 1 ? `1px solid ${colors.border}` : "none", alignItems: "center", opacity: op, transform: `translateX(${x}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${colors.primary}33`, color: colors.primaryGlow, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>
                </div>
                <div style={{ color: colors.muted }}>{c.email}</div>
                <div style={{ color: colors.muted }}>{c.phone}</div>
                <div style={{ color: colors.muted, textAlign: "right" }}>⋯</div>
              </div>
            );
          })}
        </div>

        {showDialog && (
          <>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", opacity: dialogOp }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: `translate(-50%, -50%) scale(${dialogScale})`, opacity: dialogOp, width: 560, background: colors.surfaceAlt, border: `1px solid ${colors.border}`, borderRadius: 18, padding: 32, boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 600, marginBottom: 24, color: colors.text }}>New client</div>
              <Field label="Name" value={nameText} active={frame > 95 && frame < 130} />
              <Field label="Email" value={emailText} active={frame > 130 && frame < 160} />
              <Field label="Phone" value={phoneText} active={frame > 160 && frame < 190} />
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
                <div style={{ padding: "11px 18px", border: `1px solid ${colors.border}`, borderRadius: 10, color: colors.muted, fontFamily: fontUI, fontSize: 14 }}>Cancel</div>
                <div style={{ padding: "11px 22px", background: frame > 200 ? colors.success : colors.primary, borderRadius: 10, color: "#fff", fontFamily: fontUI, fontWeight: 600, fontSize: 14 }}>
                  {frame > 210 ? "✓ Saved" : "Save"}
                </div>
              </div>
            </div>
          </>
        )}
      </AppFrame>

      <Cursor
        path={[
          { frame: 0, pos: { x: 960, y: 540 } },
          { frame: 60, pos: { x: 1740, y: 250 } },
          { frame: 95, pos: { x: 1100, y: 540 } },
          { frame: 200, pos: { x: 1180, y: 720 } },
          { frame: 230, pos: { x: 1180, y: 720 } },
        ]}
        click={[70, 210]}
      />
      <Caption text="Manage every client in one place." from={10} />
    </AbsoluteFill>
  );
};

const Field: React.FC<{ label: string; value: string; active: boolean }> = ({ label, value, active }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontFamily: fontUI, fontSize: 13, color: colors.muted, marginBottom: 8, fontWeight: 500 }}>{label}</div>
    <div style={{ background: colors.surface, border: `1px solid ${active ? colors.primary : colors.border}`, borderRadius: 10, padding: "12px 14px", fontFamily: fontUI, fontSize: 15, color: colors.text, minHeight: 22, boxShadow: active ? `0 0 0 3px ${colors.primary}33` : "none" }}>
      {value}
      {active && <span style={{ opacity: 0.7, marginLeft: 1 }}>|</span>}
    </div>
  </div>
);
