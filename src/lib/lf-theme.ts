// Design tokens for the ~10-minute long-form MOTU UltraLite-mk5 / 828 video.
//
// Landscape 1920x1080 — unlike the reel, there is NO top/bottom exclusion
// strip. The only reserved region is the caption placeholder band at the
// bottom. Everything above it is usable canvas.

import {C} from './theme';

export const LF_FPS = 30;
export const LF_TOTAL_FRAMES = 18000; // 600.000s
export const LF_CANVAS = {w: 1920, h: 1080};

/**
 * Caption box: exactly 1704x108px, horizontally centered, 48px safe-area
 * margin from the bottom edge. The HARD RULE (spec Section 4) is that the
 * reserved band runs from the box's TOP edge to the bottom of the screen —
 * not just the box footprint — so nothing else may ever enter y >= 924.
 */
export const CAPTION_BOX = {
  w: 1704,
  h: 108,
  l: (LF_CANVAS.w - 1704) / 2, // 108
  t: LF_CANVAS.h - 48 - 108, // 924
};
export const RESERVED_BAND_TOP = CAPTION_BOX.t; // 924 — y >= this is off-limits
export const SAFE_H = RESERVED_BAND_TOP; // 924px of usable vertical canvas
export const SAFE_MARGIN_X = 80; // general left/right text margin

export {C};

export const F2 = {
  display: '"BarlowCondensed", "Arial Narrow", sans-serif',
  label: '"Inter", system-ui, sans-serif', // one label/body face, per spec — no third mono face
} as const;

export type LFAccent = 'brand' | 'ul' | 'e8' | 'cue' | 'gold';

export const lfAccentColor = (a: LFAccent): string =>
  ({brand: C.brand, ul: C.ul, e8: C.e8, cue: C.cue, gold: C.gold}[a]);

export const lfAccentDeep = (a: LFAccent): string =>
  ({brand: C.brandDeep, ul: C.ulDeep, e8: C.e8Deep, cue: C.cueDeep, gold: C.goldDeep}[a]);

/**
 * The 45-scene table — single source of truth for long-form timing.
 * Durations sum to exactly 18000 frames (600.000s @ 30fps). Chapter
 * comments mark the six acts from the confirmed plan.
 */
export type LFSceneId =
  | 'CO1'
  | 'H1' | 'H2' | 'H3' | 'H4' | 'H5'
  | 'U1' | 'U2' | 'U3' | 'U4' | 'U5' | 'U6' | 'U7' | 'U8' | 'U9' | 'U10' | 'U11' | 'U12' | 'U13'
  | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8' | 'E9' | 'E10' | 'E11' | 'E12' | 'E13' | 'E14' | 'E15'
  | 'CP1' | 'CP2' | 'CP3' | 'CP4' | 'CP5'
  | 'OU1' | 'OU2' | 'OU3' | 'OU4' | 'OU5' | 'OU6';

export const LF_SCENES: {id: LFSceneId; dur: number; accent: LFAccent}[] = [
  // Cold Open — 450f / 15s
  {id: 'CO1', dur: 450, accent: 'brand'},

  // Act 1 — CueMix 5 shared thread — 1800f / 60s
  {id: 'H1', dur: 300, accent: 'cue'},
  {id: 'H2', dur: 420, accent: 'cue'},
  {id: 'H3', dur: 420, accent: 'cue'},
  {id: 'H4', dur: 330, accent: 'cue'},
  {id: 'H5', dur: 330, accent: 'cue'},

  // Act 2 — UltraLite-mk5 — 4650f / 155s
  {id: 'U1', dur: 360, accent: 'ul'},
  {id: 'U2', dur: 330, accent: 'ul'},
  {id: 'U3', dur: 420, accent: 'ul'},
  {id: 'U4', dur: 540, accent: 'ul'},
  {id: 'U5', dur: 300, accent: 'ul'},
  {id: 'U6', dur: 330, accent: 'ul'},
  {id: 'U7', dur: 330, accent: 'ul'},
  {id: 'U8', dur: 300, accent: 'ul'},
  {id: 'U9', dur: 360, accent: 'ul'},
  {id: 'U10', dur: 360, accent: 'ul'},
  {id: 'U11', dur: 330, accent: 'ul'},
  {id: 'U12', dur: 330, accent: 'ul'},
  {id: 'U13', dur: 360, accent: 'ul'},

  // Act 3 — 828 — 5400f / 180s
  {id: 'E1', dur: 360, accent: 'e8'},
  {id: 'E2', dur: 330, accent: 'e8'},
  {id: 'E3', dur: 420, accent: 'e8'},
  {id: 'E4', dur: 420, accent: 'e8'},
  {id: 'E5', dur: 330, accent: 'e8'},
  {id: 'E6', dur: 540, accent: 'e8'},
  {id: 'E7', dur: 360, accent: 'e8'},
  {id: 'E8', dur: 270, accent: 'e8'},
  {id: 'E9', dur: 360, accent: 'e8'},
  {id: 'E10', dur: 270, accent: 'e8'},
  {id: 'E11', dur: 360, accent: 'e8'},
  {id: 'E12', dur: 360, accent: 'e8'},
  {id: 'E13', dur: 330, accent: 'e8'},
  {id: 'E14', dur: 330, accent: 'e8'},
  {id: 'E15', dur: 360, accent: 'e8'},

  // Act 4 — Comparison — 2700f / 90s
  {id: 'CP1', dur: 420, accent: 'brand'},
  {id: 'CP2', dur: 720, accent: 'brand'},
  {id: 'CP3', dur: 600, accent: 'brand'},
  {id: 'CP4', dur: 540, accent: 'brand'},
  {id: 'CP5', dur: 420, accent: 'gold'},

  // Act 5 — Outro — 3000f / 100s
  {id: 'OU1', dur: 360, accent: 'gold'},
  {id: 'OU2', dur: 480, accent: 'gold'},
  {id: 'OU3', dur: 360, accent: 'gold'},
  {id: 'OU4', dur: 720, accent: 'gold'},
  {id: 'OU5', dur: 480, accent: 'gold'},
  {id: 'OU6', dur: 600, accent: 'gold'},
];

export const lfSceneStart = (id: LFSceneId): number => {
  let f = 0;
  for (const s of LF_SCENES) {
    if (s.id === id) return f;
    f += s.dur;
  }
  return f;
};
