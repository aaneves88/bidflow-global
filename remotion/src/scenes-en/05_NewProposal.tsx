import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { AppFrame } from "../components/AppFrame";
import { Caption } from "../components/Caption";
import { Cursor } from "../components/Cursor";
import { colors, fontUI, fontDisplay } from "../theme";

const items = [
  { desc: "Brand identity design", qty: 1, price: 2800, addAt: 40 },
  { desc: "Printed menu (3 versions)", qty: 1, price: 1200, addAt: 95 },
  { desc: "Social media posts (monthly)", qty: 3, price: 800, addAt: 155 },
];

const money = (n: number) => `$ ${Math.round(n).toLocaleString("en-US")}`;

export const NewProposal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleText = "Brand identity + menu".slice(0, Math.max(0, Math.floor((frame - 10) / 1.4)));

  const visible = items.filter((it) => frame >= it.addAt);
  const total = visible.reduce((acc, it) => {
    const s = spring({ frame: frame - it.addAt, fps, config: { damping: 22, stiffness: 160 } });
    return acc + it.qty * it.price * Math.min(1, s);
  }, 0);

  return (
    <AbsoluteFill>
      <AppFrame lang="en" active="Proposals" pageTitle="New proposal">
        <div style={{ display: "flex", gap: 20, height: "100%" }}>
          <div style={{ flex: 1.6, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="Title" value={titleText} active={frame > 10 && frame < 40} />
            <div style={{ display: "flex", gap: 14 }}>
              <Field label="Client" value="Stella Bakery" wide />
              <Field label="Valid for" value="30 days" />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 600, color: colors.text }}>Line items</div>
              <div style={{ padding: "8px 14px", background: `${colors.primary}22`, border: `1px solid ${colors.primary}55`, color: colors.primaryGlow, borderRadius: 8, fontFamily: fontUI, fontSize: 13, fontWeight: 600 }}>
                + Add item
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((it, i) => {
                if (frame < it.addAt) return null;
                const s = spring({ frame: frame - it.addAt, fps, config: { damping: 18, stiffness: 140 } });
                const op = interpolate(s, [0, 1], [0, 1]);
                const y = interpolate(s, [0, 1], [12, 0]);
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 0.5fr 1fr 1fr", gap: 10, padding: "14px 16px", background: colors.surfaceAlt, border: `1px solid ${colors.border}`, borderRadius: 10, fontFamily: fontUI, fontSize: 14, color: colors.text, opacity: op, transform: `translateY(${y}px)`, alignItems: "center" }}>
                    <div>{it.desc}</div>
                    <div style={{ color: colors.muted }}>{it.qty}×</div>
                    <div style={{ color: colors.muted }}>{money(it.price)}</div>
                    <div style={{ fontWeight: 600, textAlign: "right" }}>{money(it.qty * it.price)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1, background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 600, color: colors.text }}>Summary</div>
            <Row label="Subtotal" value={money(total)} />
            <Row label="Discount" value="$ 0" />
            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 18 }}>
              <div style={{ fontFamily: fontUI, fontSize: 13, color: colors.muted, marginBottom: 8 }}>Total</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 56, fontWeight: 700, color: colors.text, letterSpacing: -2 }}>
                {money(total)}
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ padding: "14px 18px", background: colors.primary, borderRadius: 10, color: "#fff", fontFamily: fontUI, fontWeight: 600, fontSize: 15, textAlign: "center", boxShadow: `0 6px 18px ${colors.primary}55` }}>
              Save proposal
            </div>
          </div>
        </div>
      </AppFrame>

      <Cursor
        path={[
          { frame: 0, pos: { x: 400, y: 250 } },
          { frame: 30, pos: { x: 700, y: 250 } },
          { frame: 38, pos: { x: 900, y: 460 } },
          { frame: 90, pos: { x: 900, y: 460 } },
          { frame: 150, pos: { x: 900, y: 460 } },
          { frame: 210, pos: { x: 1500, y: 920 } },
        ]}
        click={[40, 95, 155]}
      />
      <Caption text="Build proposals in seconds. Totals update automatically." from={10} />
    </AbsoluteFill>
  );
};

const Field: React.FC<{ label: string; value: string; active?: boolean; wide?: boolean }> = ({ label, value, active, wide }) => (
  <div style={{ flex: wide !== undefined ? (wide ? 2 : 1) : "none" }}>
    <div style={{ fontFamily: fontUI, fontSize: 13, color: colors.muted, marginBottom: 8, fontWeight: 500 }}>{label}</div>
    <div style={{ background: colors.surfaceAlt, border: `1px solid ${active ? colors.primary : colors.border}`, borderRadius: 10, padding: "12px 14px", fontFamily: fontUI, fontSize: 15, color: colors.text, minHeight: 22, boxShadow: active ? `0 0 0 3px ${colors.primary}33` : "none" }}>
      {value}
      {active && <span style={{ opacity: 0.7, marginLeft: 1 }}>|</span>}
    </div>
  </div>
);

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fontUI, fontSize: 14 }}>
    <span style={{ color: colors.muted }}>{label}</span>
    <span style={{ color: colors.text, fontWeight: 600 }}>{value}</span>
  </div>
);
