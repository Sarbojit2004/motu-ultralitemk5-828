import React from "react";
import { AbsoluteFill, interpolate, useVideoConfig } from "remotion";

// ─────────────────────────────────────────────────────────────────────────────
// TRANSITIONS
//
// Full-bleed shots cannot simply cut: at 4K, a hard cut between two photographs
// of the same grey chassis reads as a glitch rather than an edit. But a plain
// cross-dissolve on every shot reads as a slideshow. So every shot arrives
// under one of eight moves, chosen from the shot's own seed, with the larger
// moves held back for the moments the narration also turns.
//
// HOW THE OVERLAP WORKS. Each shot's Sequence is extended past its own end by
// the INCOMING shot's transition length, and the next shot is stacked on top.
// The incoming shot therefore animates over a still-live outgoing shot — never
// over the background — and nothing ever dips to black between two shots.
//
// WHAT IS DELIBERATELY ABSENT: filter: blur(). At 4K a full-surface Gaussian is
// a convolution over 8.3 million pixels on every frame it runs. Every move
// below is transform, opacity, clip-path or a gradient, all of which the
// compositor does cheaply. The motion blur a whip pan wants is suggested by a
// travelling accent streak — one linear-gradient div — instead.
// ─────────────────────────────────────────────────────────────────────────────

export type { TransitionKind } from "./transition-plan.ts";
export { TRANS, TRANS_CUE, transitionFor } from "./transition-plan.ts";

import { TRANS, type TransitionKind } from "./transition-plan.ts";

const smooth = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Decelerating — the incoming shot arrives fast and settles, never bounces. */
const out = (p: number) => 1 - Math.pow(1 - p, 3);

type Props = {
  kind: TransitionKind;
  /** Frames since this shot began. */
  f: number;
  accent: string;
  children: React.ReactNode;
};

export const TransitionIn: React.FC<Props> = ({ kind, f, accent, children }) => {
  const { width: W, height: H } = useVideoConfig();
  const n = TRANS[kind];
  const raw = Math.min(1, Math.max(0, f / n));

  // Past the move the wrapper is a plain container — no transform, no
  // clip-path, nothing for the compositor to keep re-solving over the
  // remaining hundred frames of the shot.
  if (f >= n) return <AbsoluteFill>{children}</AbsoluteFill>;

  // The wipe's seam must lie along the diagonal it actually cuts, which depends
  // on the frame's own shape — a 9:16 seam and a 16:9 seam are different lines.
  const dropPct = 22;
  const diagDeg = -(Math.atan2((dropPct / 100) * H, 1.4 * W) * 180) / Math.PI;

  const e = out(raw);
  let style: React.CSSProperties = {};
  let streak: React.ReactNode = null;

  switch (kind) {
    case "fade":
      style = { opacity: smooth(raw) };
      break;

    case "punchIn":
      style = { opacity: Math.min(1, raw * 2.2), transform: `scale(${interpolate(e, [0, 1], [1.17, 1])})` };
      break;

    case "pullBack":
      style = { opacity: Math.min(1, raw * 2), transform: `scale(${interpolate(e, [0, 1], [0.86, 1])})` };
      break;

    case "slideUp":
      // A physical slide, so it holds full opacity from the first frame — a
      // fading slide reads as two effects fighting one another.
      style = { transform: `translateY(${interpolate(e, [0, 1], [H, 0])}px)` };
      break;

    case "whipLeft":
    case "whipRight": {
      const from = kind === "whipLeft" ? W : -W;
      const x = interpolate(e, [0, 1], [from, 0]);
      style = { transform: `translateX(${x}px)` };
      streak = (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: W * 0.42,
            left: x - (kind === "whipLeft" ? W * 0.42 : -W),
            background: `linear-gradient(${kind === "whipLeft" ? 90 : 270}deg, ${accent}00 0%, ${accent}B0 62%, #FFFFFFE6 100%)`,
            opacity: interpolate(raw, [0, 0.4, 1], [0.85, 0.5, 0]),
          }}
        />
      );
      break;
    }

    case "wipeDiag": {
      const a = interpolate(e, [0, 1], [150, -30]);
      const b = a - dropPct;
      style = { clipPath: `polygon(-20% ${a}%, 120% ${b}%, 120% 220%, -20% 220%)` };
      streak = (
        <div
          style={{
            position: "absolute",
            left: "-20%",
            width: "140%",
            height: Math.round(H / 420),
            top: `${(a + b) / 2}%`,
            background: accent,
            boxShadow: `0 0 70px ${accent}`,
            opacity: interpolate(raw, [0, 0.82, 1], [1, 0.85, 0]),
            transform: `rotate(${diagDeg}deg)`,
            transformOrigin: "50% 50%",
          }}
        />
      );
      break;
    }

    case "flash":
    default: {
      style = { opacity: Math.min(1, raw * 3) };
      streak = (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 92% 62% at 50% 46%, #FFFFFF 0%, ${accent} 44%, ${accent}00 78%)`,
            opacity: interpolate(raw, [0, 0.22, 1], [0, 0.58, 0]),
          }}
        />
      );
      break;
    }
  }

  return (
    <>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {streak ? <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>{streak}</AbsoluteFill> : null}
    </>
  );
};
