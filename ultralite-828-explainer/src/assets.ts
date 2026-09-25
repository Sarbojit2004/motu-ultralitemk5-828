// ─────────────────────────────────────────────────────────────────────────────
// THE ASSET LIBRARY
//
// Shapes are not written here — width, height, aspect and the bounding box of
// the real content are all measured off the files by scripts/prep_assets.py and
// imported from assets.generated.ts, so a shot cannot claim a shape a picture
// does not have. This file adds what a measurement cannot know: what each
// picture is OF, and where on the panel renders each control actually lives.
// ─────────────────────────────────────────────────────────────────────────────

export type AssetKind = "panel" | "hero" | "photo" | "logo" | "mark";

export type Asset = {
  slug: string;
  file: string;
  kind: AssetKind;
  /** 2, 4 or 6 — or 0 for a logo. */
  model: number;
  w: number;
  h: number;
  /** Aspect ratio of the CONTENT, not of the canvas. */
  ar: number;
  /** Opaque content as [x0, y0, x1, y1] of the canvas, 0..1. */
  bbox: [number, number, number, number] | number[];
  transparent: boolean;
};

export type Clip = { slug: string; file: string; w: number; h: number; ar: number; dur: number };

import { ASSETS, CLIPS, REGION_LUM } from "./assets.generated.ts";
export { ASSETS, CLIPS, REGION_LUM };

/**
 * How far to pull a detail push down (or up) so every one lands on the same tone.
 *
 * These panels are near-black hardware; the measured regions run from 0.126 on
 * the M2's headphone corner to 0.315 on the M4's lit meter. At one fixed
 * brightness the dark end goes muddy and the lit meter blooms, and 64%-opacity
 * white type has to hold against both. This normalises each region to a common
 * ground, clamped so nothing is pushed so far that its own legending stops
 * being readable.
 */
export const dimFor = (region: string): number => {
  const lum = REGION_LUM[region];
  if (!lum) return 1.0;
  return Math.min(1.25, Math.max(0.62, 0.235 / lum));
};

const BY_SLUG = new Map(ASSETS.map((a) => [a.slug, a]));
const CLIP_BY_SLUG = new Map(CLIPS.map((c) => [c.slug, c]));

export const img = (slug: string): Asset => {
  const a = BY_SLUG.get(slug);
  if (!a) throw new Error(`asset "${slug}" is not in the library`);
  return a;
};

export const imgs = (...slugs: string[]): Asset[] => slugs.map(img);

/**
 * A clip, IF it is present.
 *
 * The ten deployment clips arrive through the repository rather than through
 * the build session, so both films have to be renderable without them. Every
 * shot that wants a clip carries a still fallback, and this returning null is
 * how it chooses. Nothing is ever a black hole waiting for an asset.
 */
export const clip = (slug: string): Clip | null => CLIP_BY_SLUG.get(slug) ?? null;

export const hasClips = (): boolean => CLIPS.length > 0;

// ── Detail regions ───────────────────────────────────────────────────────────
//
// Normalised rectangles on the panel renders, read off the files themselves.
// These are what let a shot push into the control the narration is naming — the
// four gain knobs while the voice says "four preamps", the MON button while it
// says "straight to the outputs" — instead of showing a whole box and hoping
// the viewer finds it.
//
// Every one is a crop of a render at least 1212 px on its short side, and the
// M6's front is 2442 px, so even the tightest push lands above the frame's own
// resolution. Nothing is stretched and nothing is sliced.
export type Region = { x: number; y: number; w: number; h: number };

const r = (x: number, y: number, w: number, h: number): Region => ({ x, y, w, h });

/** Region name -> [asset slug, rect]. Names match REGION_LUM in the generated file. */
export const REGIONS: Record<string, { slug: string; rect: Region }> = {
  // Read off the panel renders against a printed grid. Only the UltraLite's
  // panels carry these — see scripts/prep_assets.py for why the 828's flat
  // strips are too short to push into, and what is used instead.
  "ul.inputs":  { slug: "ul-front", rect: r(0.020, 0.05, 0.300, 0.88) },
  "ul.phones":  { slug: "ul-front", rect: r(0.325, 0.08, 0.095, 0.82) },
  "ul.gain":    { slug: "ul-front", rect: r(0.420, 0.06, 0.225, 0.80) },
  "ul.meter":   { slug: "ul-front", rect: r(0.655, 0.10, 0.305, 0.78) },
  "ul.power":   { slug: "ul-rear",  rect: r(0.010, 0.55, 0.150, 0.42) },
  "ul.midi":    { slug: "ul-rear",  rect: r(0.030, 0.10, 0.230, 0.48) },
  "ul.optical": { slug: "ul-rear",  rect: r(0.145, 0.55, 0.125, 0.40) },
  "ul.spdif":   { slug: "ul-rear",  rect: r(0.270, 0.12, 0.075, 0.82) },
  "ul.lineout": { slug: "ul-rear",  rect: r(0.340, 0.15, 0.380, 0.78) },
  "ul.linein":  { slug: "ul-rear",  rect: r(0.720, 0.15, 0.250, 0.78) },
  "ul.face":    { slug: "ul-face",  rect: r(0.030, 0.06, 0.420, 0.88) },
  "ul.oled":    { slug: "ul-face",  rect: r(0.470, 0.06, 0.500, 0.88) },
};

/**
 * THE PAIR, as three-quarter renders.
 *
 * `rel` is each unit's width relative to the other at the SAME apparent scale,
 * so a shot showing both together shows a half-rack box beside a full-width
 * rack unit rather than two boxes cropped to the same size. The 828 is a
 * 19-inch rack unit; the UltraLite-mk5 is half-rack. That ratio is the single
 * most useful thing a picture of the two of them can carry, and normalising it
 * away would throw out the argument the film is making.
 */
export const LINEUP_3Q = [
  { slug: "ul-3q", rel: 1.00 },
  { slug: "e8-3q", rel: 1.72 },
] as const;

/** The two rear views, for the chapter about what goes into the back. */
export const LINEUP_REAR = [
  { slug: "ul-rear", rel: 1.00 },
  { slug: "e8-rear", rel: 1.72 },
] as const;

/** The unit in a room, by model — manufacturer photography. */
export const IN_SITU: Record<number, string[]> = {
  2: ["m2-01", "m2-10", "m2-04", "m2-06", "m2-05", "m2-03"],
  4: ["m4-05", "m4-07", "m4-01", "m4-03", "m4-02", "m4-06"],
  6: ["m6-03", "m6-05", "m6-08", "m6-02", "m6-07", "m6-10", "m6-06", "m6-04", "m6-09"],
};

/** Everything in a room, largest and most legible first — the general pool. */
export const ROOMS = [
  "m6-03", "m6-05", "m6-08", "m4-05", "m2-06", "m6-02",
  "m6-07", "m4-07", "m2-01", "m6-10", "m4-01", "m6-06",
  "m2-10", "m6-04", "m4-03", "m2-04", "m6-09", "m4-02",
] as const;

/** Rooms with people visibly in them. */
export const PEOPLE = ["m2-05", "m4-06", "m6-07", "m6-04"] as const;
