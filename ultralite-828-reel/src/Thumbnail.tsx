import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ACCENT, FONT, GROUND, INK, TYPE, type Canvas, safeW } from "./theme.ts";
import { still } from "./higgsfield.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE THUMBNAIL — the one frame that holds both units (the compact studio with
// the 828 racked under the UltraLite-mk5 on the desk) under the reel's own
// caption lockup at full opacity. No logo, no company name, no price — the
// poster follows the same rule as the reel: branding lives on the end screen.
// ─────────────────────────────────────────────────────────────────────────────

const HARD = "0 5px 12px rgba(0,0,0,0.94), 0 0 6px rgba(0,0,0,0.8)";

export const Thumbnail: React.FC<{ canvas: Canvas }> = ({ canvas }) => {
  const hero = still("both-studio");
  const S = canvas.portrait ? 1 : 0.8;
  const sw = safeW(canvas);
  return (
    <AbsoluteFill style={{ background: GROUND.dark, fontFamily: FONT.display, overflow: "hidden" }}>
      {hero ? (
        <Img
          src={staticFile(`higgsfield/${hero.file}`)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: canvas.portrait ? "50% 40%" : "50% 50%", filter: "brightness(0.9) contrast(1.1) saturate(1.05)" }}
        />
      ) : null}
      <AbsoluteFill style={{ background: canvas.portrait ? "linear-gradient(180deg, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0.05) 35%, rgba(5,5,7,0.25) 60%, rgba(5,5,7,0.92) 100%)" : "linear-gradient(90deg, rgba(5,5,7,0.88) 0%, rgba(5,5,7,0.5) 45%, rgba(5,5,7,0.05) 75%)" }} />
      <div style={{ position: "absolute", left: canvas.safe.left, width: canvas.portrait ? sw : sw * 0.6, bottom: canvas.portrait ? canvas.safe.bottom : canvas.safe.bottom + 40 }}>
        <div style={{ fontSize: 44 * S, letterSpacing: 9 * S, color: ACCENT.shared.glow, textShadow: HARD, marginBottom: 40 * S }}>ULTRALITE-MK5 · 828</div>
        <div style={{ fontSize: TYPE.before.size * S, letterSpacing: TYPE.before.track * S, color: INK.onDark, textShadow: HARD, lineHeight: 1.08 }}>ONE STANDARD.</div>
        <div style={{ fontFamily: FONT.script, fontSize: 380 * S, color: ACCENT.pul.glow, lineHeight: 0.98, padding: `${16 * S}px ${30 * S}px ${26 * S}px 0`, marginLeft: -8, transform: "rotate(-1.6deg)", textShadow: `0 8px 16px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85), 0 0 60px ${ACCENT.pul.glow}55` }}>
          two rooms
        </div>
        <div style={{ fontSize: 150 * S, letterSpacing: TYPE.after.track * S, color: INK.onDark, textShadow: HARD, lineHeight: 1.02 }}>PICK YOUR PANEL.</div>
      </div>
    </AbsoluteFill>
  );
};
