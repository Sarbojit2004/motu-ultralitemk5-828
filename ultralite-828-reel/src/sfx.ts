import type { TimedSegment } from "./script.ts";
import type { Shot } from "./shots.ts";
import { TRANS_CUE, transitionFor, type TransitionKind } from "./transitions-data.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE CUE SHEET — derived, never typed. Used by Film.tsx to place every SFX in
// the render AND by scripts/sfx-plan.mjs to print the standalone transition-SFX
// file, so the two cannot differ by a frame.
// ─────────────────────────────────────────────────────────────────────────────

export type Placed = Shot & { trans: TransitionKind };

export const placeShots = (shots: Shot[]): Placed[] =>
  shots.map((s, i) => {
    const firstOfSeg = i === 0 || shots[i - 1].segment !== s.segment;
    return { ...s, trans: transitionFor(s.seed, firstOfSeg, i === 0) };
  });

export type Cue = { at: number; cue: string };

export const buildSfxPlan = (segments: TimedSegment[], shots: Placed[], outroAt: number, fps: number): Cue[] => {
  const sfx: Cue[] = [];
  // One cue under every shot change — the move and the sound are chosen together.
  for (const s of shots) sfx.push({ at: Math.max(0, s.start - 0.06), cue: TRANS_CUE[s.trans] });
  for (const seg of segments) {
    // A short riser into each segment, ahead of the first word.
    sfx.push({ at: Math.max(0, seg.speakAt - 0.45), cue: "riser-short" });
    // A near-subliminal mark where a thought lands.
    for (const c of seg.captions) if (c.beat) sfx.push({ at: c.start + 0.04, cue: "tick-glass" });
    // The I/O ladder lighting up. One blip per 4 slots rather than per pair:
    // these rows run to 32, and a blip a slot would be a rattle, not a count.
    if (seg.product === "pul" || seg.product === "p828") {
      const n = { pul: 18, p828: 28 }[seg.product];
      for (let i = 0; i < n; i += 4) sfx.push({ at: seg.speakAt + (10 + i * 1.1) / fps, cue: "count-blip" });
    }
    // The two columns of the comparison ladder settling.
    if (seg.id === "together") for (let i = 0; i < 2; i++) sfx.push({ at: seg.speakAt + (12 + i * 10) / fps, cue: "net-lock" });
  }
  const close = segments.find((s) => s.id === "close");
  if (close) for (let i = 0; i < 3; i++) sfx.push({ at: close.speakAt + (8 + i * 10) / fps, cue: "count-blip" });
  sfx.push({ at: outroAt - 0.2, cue: "outro-bloom" });
  return sfx.sort((a, b) => a.at - b.at);
};
