import { ASSETS, type Asset } from "./assets.ts";
import { HF_CLIPS, HF_STILLS, type HfClip, type HfStill } from "./higgsfield.ts";
import type { Canvas, ProductKey } from "./theme.ts";
import type { TimedCaption, TimedSegment } from "./script.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE SHOT PLANS — what is shown, and when. Stated by hand, caption by caption,
// because a rule can distribute images fairly but cannot know that "2 combo
// inputs on the front." has exactly one right picture (the mk5's front panel
// close-up) and that "2.4 ms, round trip." wants a player's hands and nothing
// else.
//
// Every shot is matched on a distinctive fragment of the caption it starts
// on. Captions without a pin keep the previous shot on screen, so a shot's
// length is derived from the script, never typed.
//
// SIX KINDS (see components/Staged.tsx):
//   still   a generated Higgsfield workflow scene
//   video   a generated Higgsfield B-roll clip, falling back to a still if the
//           clip has not been generated
//   bleed   a real product photograph, complete, over a wash of itself
//   panel   a real transparent panel plan, tracked laterally
//   split   two real photographs on a diagonal
//   mosaic  three to six real images drifting as one plane — how the software
//           screens are clubbed together
// ─────────────────────────────────────────────────────────────────────────────

export type ShotSpec =
  | { kind: "still"; id: string }
  | { kind: "video"; id: string; fallback: string }
  | { kind: "bleed"; slug: string }
  | { kind: "panel"; slug: string }
  | { kind: "split"; slugs: [string, string] }
  | { kind: "mosaic"; slugs: string[]; labels?: boolean };

export type Pin = { seg: string; find: string; shot: ShotSpec };

/** The four products, on white, directly comparable — the lineup mosaic. */
/** Both units on white, directly comparable — the closing lineup. */
const LINEUP: ShotSpec = {
  kind: "mosaic",
  slugs: ["ul-render-34", "e8-render-34a", "ul-render-top", "e8-render-rear-a"],
  labels: true,
};
/** CueMix 5, clubbed: the same application on both units, so the mosaic
 *  deliberately alternates between them rather than grouping by product. */
const SOFTWARE: ShotSpec = {
  kind: "mosaic",
  slugs: ["ul-mixer", "e8-mixer", "ul-fx-eq", "e8-fx-gate", "ul-fx-reverb", "e8-cuemix-home"],
};
/** The two chassis as objects, equal billing — used where the narration says
 *  the choice is not a ranking. */
const BOTH_RENDERS: ShotSpec = {
  kind: "mosaic",
  slugs: ["ul-render-34", "e8-render-34a", "ul-render-front", "e8-render-rear-a"],
};

const V = (id: string, fallback: string): ShotSpec => ({ kind: "video", id, fallback });
const S = (id: string): ShotSpec => ({ kind: "still", id });
const B = (slug: string): ShotSpec => ({ kind: "bleed", slug });
const P = (slug: string): ShotSpec => ({ kind: "panel", slug });
const X = (a: string, b: string): ShotSpec => ({ kind: "split", slugs: [a, b] });

// ═════════════════════════════════════════════════════════ THE 90 s REEL ══
// Read down the `find` column and it is the script; read down the `shot`
// column and it is the edit. The two acts never borrow each other's pictures:
// every ul-* asset and mk5 clip sits inside the UltraLite-mk5 act (or the
// shared sections), every e8-* asset inside the 828 act, and the only places
// both units share a frame are the hook, the bridge and the close — which is
// the argument the script is making, enforced by the shot plan.
export const REEL_PINS: Pin[] = [
  // ── Hook: the two environments, then the three things that do not change ──
  { seg: "hook", find: "fits in a backpack", shot: V("ul-road", "ul-road") },
  { seg: "hook", find: "lives in a rack", shot: V("e8-tracking", "e8-tracking") },
  { seg: "hook", find: "Same converters", shot: X("ul-black-hero", "e8-black-hero") },
  // The proof, not an illustration: the 828's front panel tracked laterally,
  // its 2 combo inputs plainly visible.
  { seg: "hook", find: "Same preamps", shot: P("e8-front-elev") },
  { seg: "hook", find: "Same mixer", shot: X("ul-cuemix-home", "e8-cuemix-home") },
  { seg: "hook", find: "smaller version", shot: V("both-studio", "both-studio") },

  // ── One standard: the shared conversion, preamp and mixer ──
  { seg: "shared", find: "ESS Sabre32", shot: B("e8-ess-logo") },
  { seg: "shared", find: "125 dB", shot: B("e8-rear-digital") },
  // The mk5's front panel, the same lateral track — the rhyme with the hook's
  // 828 panel is the point.
  { seg: "shared", find: "redesigned preamp", shot: P("ul-front-elev") },
  { seg: "shared", find: "74 dB", shot: B("ul-front-closeup") },
  { seg: "shared", find: "129", shot: B("e8-lcd-a") },
  { seg: "shared", find: "CueMix 5", shot: SOFTWARE },
  { seg: "shared", find: "never quality", shot: BOTH_RENDERS },
  { seg: "shared", find: "It is the room", shot: B("e8-big-studio") },

  // ── The Agile Hub ──
  { seg: "sul", find: "The UltraLite-mk5.", shot: V("ul-desk", "ul-desk") },
  { seg: "sul", find: "18 in, 22 out", shot: P("ul-rear-elev") },
  { seg: "sul", find: "2 combo inputs", shot: B("ul-front-closeup") },
  // Round-trip latency is a player's number, so it plays under a player.
  { seg: "sul", find: "2.4 ms", shot: V("ul-guitar", "ul-guitar") },
  { seg: "sul", find: "from an iPad", shot: B("ul-ipad-cuemix") },
  { seg: "sul", find: "no computer", shot: V("ul-stage", "ul-stage") },
  { seg: "sul", find: "rack ears", shot: X("ul-rack-ears", "ul-rack-kit") },

  // ── The Studio Anchor ──
  { seg: "s828", find: "The 828.", shot: V("e8-control", "e8-control") },
  { seg: "s828", find: "28 in, 32 out", shot: P("e8-rear-elev") },
  { seg: "s828", find: "same 2 preamps", shot: P("e8-front-elev") },
  { seg: "s828", find: "everything around them", shot: B("e8-black-hero") },
  { seg: "s828", find: "RGB display", shot: B("e8-lcd-b") },
  { seg: "s828", find: "Talkback", shot: B("e8-monitor-buttons") },
  { seg: "s828", find: "headphone mixes", shot: B("e8-mixer-phones") },
  { seg: "s828", find: "Insert loops", shot: B("e8-line-in-insert") },
  { seg: "s828", find: "Loopback", shot: V("e8-stream", "e8-stream") },
  { seg: "s828", find: "optical banks", shot: B("e8-optical-rear") },

  // ── The bridge: both in one frame, under the comparison ladder ──
  { seg: "together", find: "same engine, twice", shot: S("both-studio") },
  { seg: "together", find: "1 travels", shot: X("ul-black-hero", "e8-black-hero") },
  { seg: "together", find: "Pick the panel", shot: X("ul-front-elev", "e8-front-elev") },

  // ── Close ──
  { seg: "close", find: "MOTU UltraLite-mk5.", shot: LINEUP },
  { seg: "close", find: "Shivansh Electronics", shot: V("both-studio", "both-studio") },
  { seg: "close", find: "North East India", shot: B("ul-wood-studio") },
];


// ── Resolution ───────────────────────────────────────────────────────────────

export type Resolved =
  | { kind: "still"; still: HfStill }
  | { kind: "video"; clip: HfClip }
  | { kind: "bleed"; asset: Asset }
  | { kind: "panel"; asset: Asset }
  | { kind: "split"; assets: [Asset, Asset] }
  | { kind: "mosaic"; assets: Asset[]; labels?: boolean };

export type Shot = {
  segment: string;
  product: ProductKey;
  env: "light" | "dark";
  start: number;
  end: number;
  seed: number;
  res: Resolved;
  /** The caption this shot starts on, if any. */
  caption?: TimedCaption;
};

const asset = (slug: string): Asset => {
  const a = ASSETS.find((x) => x.slug === slug);
  if (!a) throw new Error(`[shots] unknown asset slug: ${slug}`);
  return a;
};

/** A 9:16 native variant, when one was generated, for the portrait reel. */
const stillFor = (id: string, canvas: Canvas): HfStill => {
  if (canvas.portrait) {
    const v = HF_STILLS.find((s) => s.id === `${id}-9x16`);
    if (v) return v;
  }
  const s = HF_STILLS.find((x) => x.id === id);
  if (!s) throw new Error(`[shots] unknown Higgsfield still: ${id}`);
  return s;
};

const clipFor = (id: string, canvas: Canvas): HfClip | undefined => {
  if (canvas.portrait) {
    const v = HF_CLIPS.find((c) => c.id === `${id}-9x16`);
    if (v) return v;
  }
  return HF_CLIPS.find((c) => c.id === id);
};

export const resolve = (spec: ShotSpec, canvas: Canvas): Resolved => {
  switch (spec.kind) {
    case "still":
      return { kind: "still", still: stillFor(spec.id, canvas) };
    case "video": {
      const c = clipFor(spec.id, canvas);
      return c ? { kind: "video", clip: c } : { kind: "still", still: stillFor(spec.fallback, canvas) };
    }
    case "bleed":
      return { kind: "bleed", asset: asset(spec.slug) };
    case "panel":
      return { kind: "panel", asset: asset(spec.slug) };
    case "split":
      return { kind: "split", assets: [asset(spec.slugs[0]), asset(spec.slugs[1])] };
    case "mosaic":
      return { kind: "mosaic", assets: spec.slugs.map(asset), labels: spec.labels };
  }
};

/**
 * Lays the pins on the timeline. A pin starts a shot at its caption's start
 * (or at the segment's hold); the shot runs until the next pin. Unmatched pins
 * are reported loudly rather than silently dropped.
 */
export const buildShots = (segments: TimedSegment[], pins: Pin[], canvas: Canvas, outroAt: number): Shot[] => {
  const shots: Shot[] = [];
  let seed = 1;
  for (const seg of segments) {
    const segPins = pins.filter((p) => p.seg === seg.id);
    for (const pin of segPins) {
      let start: number;
      let cap: TimedCaption | undefined;
      if (pin.find === "") {
        start = seg.start;
      } else {
        cap = seg.captions.find((c) => c.t.startsWith(pin.find) || c.t.includes(pin.find));
        if (!cap) {
          console.warn(`[shots] unresolved pin in ${seg.id}: "${pin.find}"`);
          continue;
        }
        start = cap.start;
      }
      shots.push({
        segment: seg.id,
        product: seg.product,
        env: seg.env,
        start,
        end: 0,
        seed: seed++,
        res: resolve(pin.shot, canvas),
        caption: cap,
      });
    }
  }
  shots.sort((a, b) => a.start - b.start);
  for (let i = 0; i < shots.length; i++) shots[i].end = shots[i + 1] ? shots[i + 1].start : outroAt + 0.7;
  return shots;
};

/** Every distinct real image the plan puts on screen — for the coverage ledger. */
export const coveredSlugs = (pins: Pin[]): Set<string> => {
  const out = new Set<string>();
  for (const p of pins) {
    const s = p.shot;
    if (s.kind === "bleed" || s.kind === "panel") out.add(s.slug);
    if (s.kind === "split" || s.kind === "mosaic") for (const x of s.slugs) out.add(x);
  }
  return out;
};
