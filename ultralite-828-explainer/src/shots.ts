// ─────────────────────────────────────────────────────────────────────────────
// THE SHOT PLAN
//
// Every shot is pinned to a CAPTION INDEX, never to a timestamp. The picture
// changes on the word it belongs to, and a re-written line moves the picture
// with it instead of leaving it behind. There is not one hand-typed frame
// number in either film.
//
// THE TEN DEPLOYMENT CLIPS arrive through the repository, because the build
// session's egress policy blocks the host they are served from. So every shot
// that wants one also names a still, and `clip()` returning null is what picks
// between them. Both films render today on the product photography and get
// better the moment the clips land — nothing is ever a black hole waiting for
// an asset, and no shot has to be re-planned when they arrive.
//
// HOW EACH KIND IS USED:
//
//   bleed    a photograph filling the frame, with a gimbal move inside overscan
//   plate    an isolated unit floating on the ground, positioned by its own
//            content box rather than by its canvas
//   panel    a front or rear render held flat, for the range comparisons
//   detail   a push into one named control on a panel render — the only shots
//            allowed to crop, and they crop a 1212-2442 px file into a frame
//            narrower than it is, so nothing is ever upscaled
//   stack    two COMPLETE plates, stacked in the reel, side by side in the
//            explainer. This replaces the diagonal split entirely: nothing in
//            either film is sliced, clipped or shown in part.
//   mosaic   three or four complete plates at once, for the lineup
//   clip     a deployment clip, full-bleed
// ─────────────────────────────────────────────────────────────────────────────

import { clip, img, type Asset, type Clip, type Region } from "./assets.ts";
import { REGIONS } from "./assets.ts";
import type { TimedSegment } from "./script.ts";
import type { AccentKey } from "./theme.ts";
import type { GraphicKind } from "./components/Graphics.tsx";

export type ShotKind = "bleed" | "plate" | "panel" | "detail" | "stack" | "mosaic" | "clip" | "cliprow";

export type ShotSpec = {
  /** Caption index inside its chapter that this shot comes up on. */
  at: number;
  kind: ShotKind;
  /** One asset — bleed, plate, panel. */
  asset?: string;
  /** Several — stack, mosaic. */
  assets?: string[];
  /** A named entry in REGIONS — detail. */
  region?: string;
  /** A deployment clip. Falls back to `asset` when the clip is not present. */
  clipSlug?: string;
  /** Several clips laid across the frame — see ClipRow. Falls back to `assets`. */
  clipSlugs?: string[];
  /** Seconds into the clip to start — used to take the main section for the reel. */
  from?: number;
  /**
   * An animated demonstrative over the picture for the length of this shot.
   * Pinned to the caption that makes the claim, so the graphic draws itself
   * while the voice is saying the number rather than beside it.
   */
  graphic?: GraphicKind;
};

export type ResolvedShot = {
  kind: ShotKind;
  start: number;
  end: number;
  /** The accent of the chapter this shot belongs to. */
  accentKey: AccentKey;
  asset?: Asset;
  assets?: Asset[];
  region?: { slug: string; rect: Region; name: string };
  /** The panel render a detail pushes into — resolved from region.slug. */
  regionAsset?: Asset;
  clip?: Clip;
  clips?: Clip[];
  graphic?: GraphicKind;
  /**
   * Where this shot's CHAPTER ends. A demonstrative needs two or three seconds
   * to draw itself, and some are pinned to captions only three-quarters of a
   * second long — "Three interfaces." is 22 frames. The graphic runs past its
   * own shot to here rather than flashing.
   */
  chapterEnd: number;
  /** Seconds into the clip this shot starts, already fitted to the footage. */
  from: number;
  /**
   * How fast the clip plays, so it lasts exactly as long as the shot does.
   *
   * The plan was written for eight-second clips; the ten that were generated
   * are 5.04 s each, because five seconds is what the credits bought. Thirteen
   * shots therefore asked for footage that does not exist, and an OffthreadVideo
   * asked for a frame past its end holds the last one — a two-second freeze in
   * the middle of a deployment shot, which reads as a broken file rather than
   * as an edit.
   *
   * So the reel claws the time back from `from`: it wants a clip's main
   * section, and a section can start later or earlier without harm. Every reel
   * shot fits at 1.0 that way. The explainer cannot, because it plays each clip
   * COMPLETE from its first frame by design, so the clip is eased instead —
   * between 0.71x and 0.95x, which on b-roll of this kind reads as deliberate
   * slow motion rather than as a fault.
   */
  rate: number;
  seed: number;
  /** True when this is the first shot of its chapter — the transition is harder. */
  boundary: boolean;
};

// ═════════════════════════════════════════════════════════════════════════════
// THE VERTICAL REEL
//
// Ten deployments in ninety seconds means each one gets its MAIN SECTION, not
// its whole five seconds — which is why every clip here carries `from`. The
// clips were composed centre-weighted so the 16:9 source survives a 9:16 frame
// without the subject leaving it.
// ═════════════════════════════════════════════════════════════════════════════

// ═════════════════════════════════════════════════════════════════════════════
// THE SHOT PLAN
//
// Every shot is pinned to a CAPTION INDEX, never to a timestamp. Re-time a
// sentence and the picture moves with it; no frame number appears below.
//
// HOW THE EIGHT DEPLOYMENT CLIPS ARE USED. They are portrait, generated for
// the vertical reel next door. Singly in a 16:9 frame a complete one is a
// third of the width, so they appear singly only where one room is the point,
// and three at a time — see ClipRow — wherever the line is about the same two
// interfaces being in several rooms at once.
//
// WHY THE 828 HAS NO `detail` SHOTS. Its flat panel renders are an eleven-to-
// one strip too short to push into without mush; its controls are shown
// through the dedicated close-up photographs instead. See scripts/prep_assets.py.
// ═════════════════════════════════════════════════════════════════════════════

export const VIDEO_SHOTS: Record<string, ShotSpec[]> = {
  // ── the problem: rooms that have run out of somewhere to plug in ────────
  bottleneck: [
    { at: 0, kind: "bleed", asset: "e8-studio" },
    { at: 2, kind: "bleed", asset: "e8-console" },
    { at: 4, kind: "bleed", asset: "e8-synth" },
    { at: 6, kind: "clip", clipSlug: "clip-13-ul-guitar", asset: "ul-amp" },
    // Split out of the shot above rather than easing it further: at 8.2 s it
    // needed the clip at 0.615x, under the judder floor, and the plan is the
    // right place to fix that.
    { at: 8, kind: "bleed", asset: "ul-room" },
    { at: 9, kind: "clip", clipSlug: "clip-17-e8-tracking", asset: "e8-rack" },
    { at: 11, kind: "bleed", asset: "e8-insert" },
    { at: 13, kind: "bleed", asset: "e8-lineout", graphic: "ioMatrix" },
  ],

  // ── what does not change between them, settled before anything else ─────
  standard: [
    { at: 0, kind: "cliprow", clipSlugs: ["clip-11-ul-desk", "clip-18-both-studio", "clip-15-e8-control"],
      assets: ["ul-3q", "e8-3q"] },
    { at: 2, kind: "bleed", asset: "ess-mark" },
    { at: 3, kind: "bleed", asset: "ul-glow", graphic: "dynamicRange" },
    { at: 4, kind: "detail", region: "ul.gain" },
    { at: 5, kind: "bleed", asset: "cuemix-mark" },
    { at: 6, kind: "stack", assets: ["ul-3q", "e8-3q"] },
    { at: 8, kind: "detail", region: "ul.inputs" },
    { at: 9, kind: "plate", asset: "e8-3q-left" },
  ],

  // ── the UltraLite-mk5: forty channels that travel ───────────────────────
  agile: [
    { at: 0, kind: "plate", asset: "ul-3q", graphic: "rangeLadder" },
    { at: 1, kind: "bleed", asset: "ul-glow", graphic: "ioMatrix" },
    { at: 2, kind: "panel", asset: "ul-rear" },
    { at: 3, kind: "detail", region: "ul.optical" },
    { at: 4, kind: "detail", region: "ul.meter" },
    { at: 5, kind: "detail", region: "ul.lineout" },
    { at: 7, kind: "detail", region: "ul.power" },
    { at: 8, kind: "cliprow", clipSlugs: ["clip-11-ul-desk", "clip-12-ul-road", "clip-14-ul-stage"],
      assets: ["ul-desk", "ul-ipad", "ul-amp"] },
    { at: 10, kind: "plate", asset: "ul-3q-high" },
    { at: 12, kind: "clip", clipSlug: "clip-13-ul-guitar", asset: "ul-amp" },
  ],

  // ── the 828: sixty channels bolted into a room ──────────────────────────
  anchor: [
    { at: 0, kind: "bleed", asset: "e8-black" },
    { at: 2, kind: "plate", asset: "e8-3q", graphic: "rangeLadder" },
    { at: 3, kind: "panel", asset: "e8-front" },
    { at: 4, kind: "bleed", asset: "usb-mark" },
    { at: 5, kind: "bleed", asset: "e8-lineout", graphic: "ioMatrix" },
    { at: 6, kind: "bleed", asset: "e8-rearopt" },
    { at: 7, kind: "bleed", asset: "e8-insert" },
    { at: 9, kind: "bleed", asset: "e8-rack" },
    { at: 10, kind: "panel", asset: "e8-rear" },
    { at: 11, kind: "bleed", asset: "e8-monitor" },
    { at: 12, kind: "bleed", asset: "e8-group" },
    { at: 13, kind: "clip", clipSlug: "clip-15-e8-control", asset: "e8-mic" },
  ],

  // ── the preamplifiers, which are the same in both ───────────────────────
  gain: [
    { at: 0, kind: "detail", region: "ul.gain", graphic: "noiseFloor" },
    { at: 2, kind: "bleed", asset: "e8-mic" },
    { at: 3, kind: "clip", clipSlug: "clip-15-e8-control", asset: "e8-mic" },
    { at: 4, kind: "bleed", asset: "e8-studio" },
    { at: 5, kind: "detail", region: "ul.inputs" },
    { at: 6, kind: "bleed", asset: "cuemix-strip" },
    { at: 8, kind: "bleed", asset: "ul-laptop" },
    { at: 9, kind: "bleed", asset: "e8-console" },
    { at: 11, kind: "stack", assets: ["ul-3q", "e8-3q"] },
  ],

  // ── CueMix 5, and what a two-millisecond round trip buys ────────────────
  latency: [
    { at: 0, kind: "clip", clipSlug: "clip-16-e8-stream", asset: "e8-desk" },
    { at: 2, kind: "bleed", asset: "cuemix-mix", graphic: "monitorPath" },
    { at: 4, kind: "bleed", asset: "ul-latency", graphic: "roundTrip" },
    { at: 5, kind: "bleed", asset: "e8-meters" },
    { at: 6, kind: "bleed", asset: "cuemix-eq" },
    { at: 7, kind: "bleed", asset: "e8-loopback" },
    { at: 9, kind: "clip", clipSlug: "clip-17-e8-tracking", asset: "e8-rack" },
    { at: 10, kind: "clip", clipSlug: "clip-14-ul-stage", asset: "ul-room" },
  ],

  // ── the figures, stated once, together ──────────────────────────────────
  numbers: [
    { at: 0, kind: "cliprow", clipSlugs: ["clip-11-ul-desk", "clip-18-both-studio", "clip-16-e8-stream"],
      assets: ["ul-desk", "e8-desk", "e8-studio"] },
    { at: 1, kind: "bleed", asset: "ul-glow", graphic: "dynamicRange" },
    { at: 3, kind: "detail", region: "ul.gain", graphic: "noiseFloor" },
    { at: 4, kind: "bleed", asset: "ul-latency", graphic: "roundTrip" },
    { at: 5, kind: "plate", asset: "ul-3q", graphic: "rangeLadder" },
    { at: 6, kind: "plate", asset: "e8-3q", graphic: "ioMatrix" },
    { at: 7, kind: "stack", assets: ["ul-3q", "e8-3q"] },
  ],

  // ── the close: choose the room ──────────────────────────────────────────
  choose: [
    { at: 0, kind: "stack", assets: ["ul-3q", "e8-3q"] },
    { at: 2, kind: "clip", clipSlug: "clip-11-ul-desk", asset: "ul-desk" },
    { at: 3, kind: "clip", clipSlug: "clip-12-ul-road", asset: "ul-ipad" },
    { at: 4, kind: "plate", asset: "ul-3q-left", graphic: "rangeLadder" },
    { at: 5, kind: "bleed", asset: "e8-rack" },
    { at: 6, kind: "bleed", asset: "e8-insert" },
    { at: 7, kind: "bleed", asset: "e8-monitor" },
    { at: 8, kind: "stack", assets: ["ul-3q", "e8-3q"] },
    { at: 9, kind: "cliprow", clipSlugs: ["clip-11-ul-desk", "clip-18-both-studio", "clip-15-e8-control"],
      assets: ["ul-desk", "e8-desk", "e8-studio"] },
  ],
};

/**
 * Fits a shot to the footage it actually has.
 *
 * Pulls the start back as far as it needs to (never past zero), and only when
 * that is not enough slows the clip down. `MIN_RATE` is a floor, not a target:
 * below about 0.7 the judder of repeating source frames starts to show, and if
 * a shot ever needed less than this the honest fix is to split it in the plan
 * rather than to stretch one clip across it.
 *
 * It matters more here than it did in the M-Series films. These eight clips
 * are 5.04 s and this film's chapters are long, so several shots would sit on
 * a frozen last frame without it.
 */
const MIN_RATE = 0.62;

const fitClip = (c: Clip | null, want: number, len: number): { from: number; rate: number } => {
  if (!c) return { from: 0, rate: 1 };
  const from = Math.max(0, Math.min(want, c.dur - len));
  const avail = c.dur - from;
  return { from, rate: avail >= len ? 1 : Math.max(MIN_RATE, avail / len) };
};

export const placeShots = (
  segments: TimedSegment[],
  plan: Record<string, ShotSpec[]>,
  useFrom: boolean,
): ResolvedShot[] => {
  const out: ResolvedShot[] = [];
  let seed = 0;
  segments.forEach((seg, si) => {
    const specs = (plan[seg.id] ?? []).slice().sort((a, b) => a.at - b.at);
    if (specs.length === 0) return;
    // A chapter ENDS on its last word, but the next one does not begin until
    // SEGMENT_GAP later — so a chapter's last shot has to carry through that
    // breath or the film cuts to nothing for twelve frames at every boundary.
    const chapterEnd = segments[si + 1]?.start ?? seg.end;
    specs.forEach((spec, n) => {
      const cap = seg.captions[Math.min(spec.at, seg.captions.length - 1)];
      const nextSpec = specs[n + 1];
      const start = cap.start;
      const end = nextSpec
        ? seg.captions[Math.min(nextSpec.at, seg.captions.length - 1)].start
        : chapterEnd;
      if (end <= start) return;

      const c = spec.clipSlug ? clip(spec.clipSlug) : null;
      // A row needs EVERY clip it names; one missing and it falls back whole,
      // because a two-cell row where a three-cell row was composed is a
      // different picture, not a degraded one.
      const row = spec.clipSlugs?.map(clip) ?? [];
      const cs = row.length > 0 && row.every(Boolean) ? (row as Clip[]) : null;
      const region = spec.region
        ? { ...REGIONS[spec.region], name: spec.region }
        : undefined;

      // A clip shot with no clip present falls back to its still, as a bleed.
      let kind: ShotKind = spec.kind === "clip" && !c ? "bleed" : spec.kind;
      if (spec.kind === "cliprow" && !cs) kind = spec.assets ? "mosaic" : "bleed";

      out.push({
        kind: c && (spec.kind === "bleed" || spec.kind === "clip") ? "clip" : kind,
        start,
        end,
        accentKey: seg.accent,
        regionAsset: region ? img(region.slug) : undefined,
        asset: spec.asset ? img(spec.asset) : undefined,
        assets: spec.assets ? spec.assets.map(img) : undefined,
        region,
        clip: c ?? undefined,
        clips: cs ?? undefined,
        graphic: spec.graphic,
        chapterEnd,
        ...fitClip(c, useFrom ? (spec.from ?? 0) : 0, end - start),
        seed: seed++,
        boundary: n === 0,
      });
    });
  });
  return out;
};
