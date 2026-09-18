import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { ACCENT, FONT, GROUND, INK, TYPE, type Canvas, safeW } from "./theme.ts";
import { still } from "./higgsfield.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE THUMBNAIL — both units in one frame under the reel's own caption lockup
// at full opacity. No logo, no company name, no number: by instruction the
// poster carries no branding at all.
// ─────────────────────────────────────────────────────────────────────────────

const HARD = "0 5px 12px rgba(0,0,0,0.94), 0 0 6px rgba(0,0,0,0.8)";

export const Thumbnail: React.FC<{ canvas: Canvas }> = ({ canvas }) => {
  const hero = still("hero-pair-9x16") ?? still("hero-pair");
  const sw = safeW(canvas);
  return (
    <AbsoluteFill style={{ background: GROUND.dark, fontFamily: FONT.display, overflow: "hidden" }}>
      {hero ? (
        <Img src={staticFile(`higgsfield/${hero.file}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%", filter: "brightness(0.9) contrast(1.1) saturate(1.05)" }} />
      ) : null}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0.05) 35%, rgba(5,5,7,0.25) 60%, rgba(5,5,7,0.92) 100%)" }} />
      <div style={{ position: "absolute", left: canvas.safe.left, width: sw, bottom: canvas.safe.bottom }}>
        <div style={{ fontSize: 44, letterSpacing: 9, color: ACCENT.pmk5.glow, textShadow: HARD, marginBottom: 40 }}>ULTRALITE-mk5 · 828</div>
        <div style={{ fontSize: TYPE.before.size, letterSpacing: TYPE.before.track, color: INK.onDark, textShadow: HARD, lineHeight: 1.08 }}>SAME ENGINE.</div>
        <div style={{ fontFamily: FONT.script, fontSize: 380, color: ACCENT.p828.glow, lineHeight: 0.98, padding: "16px 30px 26px 0", marginLeft: -8, transform: "rotate(-1.6deg)", textShadow: `0 8px 16px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.85), 0 0 60px ${ACCENT.p828.glow}55` }}>
          2 sizes
        </div>
        <div style={{ fontSize: 150, letterSpacing: TYPE.after.track, color: INK.onDark, textShadow: HARD, lineHeight: 1.02 }}>CHOOSE THE ROOM.</div>
      </div>
    </AbsoluteFill>
  );
};
