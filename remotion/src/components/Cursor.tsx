import { useCurrentFrame, interpolate } from "remotion";

type Pt = { x: number; y: number };

export const Cursor: React.FC<{
  path: { frame: number; pos: Pt }[];
  click?: number[];
}> = ({ path, click = [] }) => {
  const frame = useCurrentFrame();
  // find segment
  let x = path[0].pos.x;
  let y = path[0].pos.y;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = (frame - a.frame) / (b.frame - a.frame);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      x = a.pos.x + (b.pos.x - a.pos.x) * ease;
      y = a.pos.y + (b.pos.y - a.pos.y) * ease;
      break;
    } else if (frame > b.frame && i === path.length - 2) {
      x = b.pos.x;
      y = b.pos.y;
    } else if (frame > b.frame) {
      x = b.pos.x;
      y = b.pos.y;
    }
  }

  const clickPulse = click.map((cf) => {
    const t = frame - cf;
    if (t < 0 || t > 18) return 0;
    return interpolate(t, [0, 18], [0, 1]);
  });

  return (
    <>
      {clickPulse.map((p, i) =>
        p > 0 ? (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - 30,
              top: y - 30,
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: "2px solid rgba(96,165,250,0.9)",
              transform: `scale(${0.4 + p * 1.2})`,
              opacity: 1 - p,
              pointerEvents: "none",
            }}
          />
        ) : null
      )}
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        style={{ position: "absolute", left: x, top: y, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))" }}
      >
        <path
          d="M5 3 L5 19 L9 15 L11.5 21 L14 20 L11.5 14 L17 14 Z"
          fill="#fff"
          stroke="#0B0D10"
          strokeWidth="1.2"
        />
      </svg>
    </>
  );
};
