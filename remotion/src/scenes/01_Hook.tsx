import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { colors, fontDisplay, fontUI } from "../theme";
import { Caption } from "../components/Caption";

const Doc: React.FC<{
  title: string;
  body: string;
  bg: string;
  rotate: number;
  delay: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  crossAt: number;
}> = ({ title, body, bg, rotate, delay, from, to, crossAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 80 } });
  const x = interpolate(s, [0, 1], [from.x, to.x]);
  const y = interpolate(s, [0, 1], [from.y, to.y]);
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const cross = interpolate(frame - crossAt, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 360,
        height: 230,
        background: bg,
        borderRadius: 14,
        boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        transform: `rotate(${rotate}deg)`,
        opacity,
        padding: 22,
        fontFamily: fontUI,
        color: "#1a1a1a",
        overflow: "hidden",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.5, color: "#444", whiteSpace: "pre-line" }}>{body}</div>
      {/* red cross overlay */}
      <svg
        viewBox="0 0 360 230"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <line
          x1="20" y1="20" x2={20 + 320 * cross} y2={20 + 190 * cross}
          stroke="#EF4444" strokeWidth="6" strokeLinecap="round"
        />
        <line
          x1="340" y1="20" x2={340 - 320 * cross} y2={20 + 190 * cross}
          stroke="#EF4444" strokeWidth="6" strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const Hook: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${colors.surface}, ${colors.bg})` }}>
      <Doc
        title="WhatsApp — Cliente A"
        body="Orçamento de marketing... segue valores: 1) Estratégia R$2500 2) Posts R$1800..."
        bg="#DCF8C6"
        rotate={-8}
        delay={0}
        from={{ x: 280, y: 700 }}
        to={{ x: 280, y: 280 }}
        crossAt={70}
      />
      <Doc
        title="Proposta.docx"
        body="PROPOSTA COMERCIAL\nCliente: ___\nServiços: ___\nValor total: R$ ___"
        bg="#FFFFFF"
        rotate={6}
        delay={10}
        from={{ x: 780, y: 800 }}
        to={{ x: 780, y: 380 }}
        crossAt={85}
      />
      <Doc
        title="vendas_2026.xlsx"
        body="Cliente | Status | Valor\nA | enviado | 4300\nB | ??? | ???\nC | esqueci de mandar"
        bg="#F0FDF4"
        rotate={-3}
        delay={20}
        from={{ x: 1280, y: 720 }}
        to={{ x: 1280, y: 300 }}
        crossAt={100}
      />
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: fontDisplay,
          fontSize: 52,
          fontWeight: 700,
          color: colors.text,
          letterSpacing: -1.5,
          opacity: interpolate(useCurrentFrame(), [30, 60], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Suas propostas estão <span style={{ color: "#EF4444" }}>perdidas</span>?
      </div>
      <Caption text="WhatsApp, Word, planilhas... propostas se perdem." from={120} />
    </AbsoluteFill>
  );
};
