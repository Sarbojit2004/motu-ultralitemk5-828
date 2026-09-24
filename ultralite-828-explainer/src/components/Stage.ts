import type { Format } from "../theme.ts";

// ─────────────────────────────────────────────────────────────────────────────
// THE STAGE — the geometry that decides where a picture is allowed to be.
//
// WHAT WENT WRONG, in one line of arithmetic. Every staging asked
//
//     canBleed = asset.ar >= (W / H) * 0.94
//
// and in the vertical film W / H is 0.5625, so the test reads "is this picture
// wider than 0.53:1". Every photograph in the repository is — they run from
// 1.03:1 to 2.06:1 — so EVERY ONE of them took the full-bleed path and was
// covered into a 9:16 frame. Covering a 0.5625:1 frame with a 1.65:1 picture
// scales it by HEIGHT and throws away
//
//     1 - 0.5625 / 1.65 = 66% OF ITS WIDTH.
//
// That is why the reel showed a corner of a keyboard where a whole desk was
// meant to be, and a slab of chassis where an engineer at a console was. The
// intent in the comment above that line was the opposite of what it computed:
// it meant "bleed when the picture is roughly the frame's own shape".
//
// THE CONTRACT, carried over from the UltraLite-mk5 / 828 reel. That film
// confined content to a fixed central region and painted a designed ground
// around it, so no picture was ever asked to fill a 9:16 frame and no picture
// was ever cropped to one. Here the same idea, stated as three rules:
//
//   1. A picture may only bleed when covering costs it little — at most 8% of
//      its height, or 15% of its width. Everything else is placed COMPLETE.
//   2. A complete picture is laid at its OWN aspect ratio across 94% of the
//      stage, on a centre line that does not move from shot to shot, so cuts
//      read as cuts and not as jumps.
//   3. The camera then moves inside the 6% that is left, CLAMPED, so at no
//      frame of any move can an edge enter shot or a subject leave it.
//
// Rule 3 is what makes this different from "just use objectFit: contain". A
// contained picture with a scale on it is cropped again the moment the scale
// passes 1. Here the room is solved from the scale the camera actually asks
// for, on every frame, and the travel is clipped to it.
//
// Nothing below renders anything. It is arithmetic, so it can be tested
// without a browser — see scripts/framing.mjs, which walks every shot in both
// films and asserts that the visible fraction of every picture is 1.0.
// ─────────────────────────────────────────────────────────────────────────────

/** How much of the stage a complete picture is laid across. The remaining 6% is the camera's. */
export const PLATE_FILL = 0.94;

/**
 * How close to the frame's own shape a picture must be before it may bleed.
 *
 * 0.94 means "within 6%". In the landscape film that is 1.67:1 to 1.89:1, so
 * the 16:9 deployment clips and the two photographs already cut to roughly
 * that shape fill the frame, and everything else — including the 2.06:1 desk
 * shots and the 1.03:1 drum kit — is placed complete. In the vertical film,
 * where the frame is 0.5625:1, nothing qualifies and nothing ever will, which
 * is the correct answer and the one the old test got backwards.
 */
const BLEED_TOLERANCE = 0.94;

/** The fraction of a picture that survives objectFit: cover in a given frame. */
export const coverKeeps = (ar: number, frameAr: number): { axis: "width" | "height"; keep: number } =>
  ar > frameAr
    ? { axis: "width", keep: frameAr / ar }
    : { axis: "height", keep: ar / frameAr };

/** True when covering costs the picture little enough to be worth the full frame. */
export const mayBleed = (ar: number, frameAr: number): boolean =>
  coverKeeps(ar, frameAr).keep >= BLEED_TOLERANCE;

export type Stage = { x: number; y: number; w: number; h: number; cx: number; cy: number };

/**
 * The box a complete picture lives in.
 *
 * The vertical film reserves a band rather than the whole frame: above it is
 * the chapter plate, below it the caption lockup and the film's timeline, and
 * a picture that wandered into either would be read as a mistake. The band is
 * centred on theme.plateY — the height at which this design has always put its
 * subject — and is the frame's full width, so every shot in the film shares one
 * left edge and one right edge.
 *
 * The landscape film has no such intrusions, so its stage is the frame.
 */
export const stageFor = (fmt: Format, W: number, H: number): Stage => {
  if (!fmt.portrait) return { x: 0, y: 0, w: W, h: H, cx: W / 2, cy: H / 2 };
  const cy = H * fmt.plateY;
  // Top: clear of the chapter plate, which ends around 0.09H. Bottom: the
  // caption lockup begins around 0.63H, and the picture is allowed to run
  // under its first line — type over picture is the whole house style — but
  // not under all of it.
  const top = H * 0.16;
  const bottom = H * 0.76;
  const half = Math.min(cy - top, bottom - cy);
  return { x: 0, y: cy - half, w: W, h: half * 2, cx: W / 2, cy };
};

export type Plate = { w: number; h: number; left: number; top: number };

/** The complete picture, laid at its own aspect across PLATE_FILL of the stage. */
export const plateIn = (stage: Stage, ar: number, fill: number = PLATE_FILL): Plate => {
  const w = Math.min(stage.w * fill, stage.h * fill * ar);
  const h = w / ar;
  return { w, h, left: stage.cx - w / 2, top: stage.cy - h / 2 };
};

/**
 * How far a plate may travel at a given scale without any edge entering frame.
 *
 * This is the whole safety property. `scale` is whatever the camera asked for
 * this frame; the room is solved from it, not from the resting size, so a push
 * that grows the plate automatically shortens its leash rather than sliding a
 * corner off the stage.
 */
export const roomAt = (stage: Stage, plate: Plate, scale: number) => ({
  x: Math.max(0, (stage.w - plate.w * scale) / 2),
  y: Math.max(0, (stage.h - plate.h * scale) / 2),
});

/**
 * The largest scale a plate may reach before it outgrows its stage.
 *
 * A rotation costs room in BOTH axes — a box of w x h turned by t needs
 * w·cos t + h·sin t of width — so the turn is charged against the scale here
 * rather than left for the translation clamp to absorb, which it cannot: no
 * amount of clamping x and y makes an oversized plate fit. Leaving rotation
 * out of this is what let a 0.7 degree orbit push 13.5 px of a photograph off
 * the bottom of the landscape frame.
 */
export const maxScale = (stage: Stage, plate: Plate, rot: number = 0): number => {
  const rad = (Math.abs(rot) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return Math.min(
    stage.w / (plate.w * cos + plate.h * sin),
    stage.h / (plate.w * sin + plate.h * cos),
  );
};

export type Camera = { scale: number; x: number; y: number; rot: number };

/**
 * Clamps a camera to a stage. Call this on EVERY camera before it is used.
 *
 * A rotation costs the plate room in both axes — a box turned by θ needs
 * w·|cos θ| + h·|sin θ| of width — so the rotation is folded into the
 * effective size rather than ignored, which is how a 0.9° orbit used to show a
 * hairline of ground in one corner.
 */
export const clampToStage = (cam: Camera, stage: Stage, plate: Plate): Camera => {
  const scale = Math.min(cam.scale, maxScale(stage, plate, cam.rot));
  const rad = (Math.abs(cam.rot) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const spanW = (plate.w * cos + plate.h * sin) * scale;
  const spanH = (plate.w * sin + plate.h * cos) * scale;
  const rx = Math.max(0, (stage.w - spanW) / 2);
  const ry = Math.max(0, (stage.h - spanH) / 2);
  return {
    scale,
    x: Math.max(-rx, Math.min(rx, cam.x)),
    y: Math.max(-ry, Math.min(ry, cam.y)),
    rot: cam.rot,
  };
};

/** Ease-in-out — a dolly accelerates and settles, it does not start at speed. */
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const clamp01 = (p: number) => Math.min(1, Math.max(0, p));

/** How far an orbit turns, in degrees. Small: this is a gimbal, not a tumble. */
const ORBIT_ROT = 0.7;

export type MoveKind = "push" | "pull" | "trackLeft" | "trackRight" | "tiltUp" | "tiltDown" | "orbit";

/**
 * Sends a camera move where the room actually is.
 *
 * A complete picture laid across 94% of its stage has 3% of the stage width
 * either side of it and, usually, a great deal more above and below. A lateral
 * track inside 65 px of a 2160 px frame is not a camera move, it is a jitter.
 * So a move that has been given no room is re-aimed at the axis that has some,
 * and only falls back to a dolly when neither axis does.
 */
export const stagedMove = (kind: MoveKind, W: number, H: number, rx: number, ry: number): MoveKind => {
  const min = Math.min(W, H) * 0.035;
  const lateral = kind === "trackLeft" || kind === "trackRight";
  const vertical = kind === "tiltUp" || kind === "tiltDown";
  if (lateral && rx < min) {
    if (ry >= min) return kind === "trackLeft" ? "tiltUp" : "tiltDown";
    return kind === "trackLeft" ? "push" : "pull";
  }
  if (vertical && ry < min) {
    if (rx >= min) return kind === "tiltUp" ? "trackLeft" : "trackRight";
    return kind === "tiltUp" ? "push" : "pull";
  }
  return kind;
};

/**
 * The camera for a plate that is shown COMPLETE.
 *
 * Two things make this different from `fullCamera`, which drives a plate that
 * covers the frame:
 *
 *   * the scale range is solved from the headroom the plate actually has
 *     (`maxScale`), so a push runs right up to the edge of the stage and stops
 *     there rather than being clipped mid-move and freezing;
 *   * the travel is bounded by the SUBJECT as well as by the stage. A picture
 *     free to slide a third of the frame reads as a slideshow however much
 *     room there is, so nothing travels more than 14% of its own size.
 *
 * Everything it returns still goes through `clampToStage`, which is the hard
 * guarantee. This function decides what looks right; that one decides what is
 * allowed.
 */
export const stagedCamera = (
  kind: MoveKind, p: number, f: number, seed: number, stage: Stage, plate: Plate,
): Camera => {
  const e = ease(clamp01(p));
  const t = (a: number, b: number) => a + (b - a) * e;

  // The orbit turns the plate, and a turn costs room, so it is priced with
  // its own rotation charged in rather than discovering the shortfall later.
  const cap = maxScale(stage, plate, kind === "orbit" ? ORBIT_ROT : 0);
  const hi = 1 + (cap - 1) * 0.92;
  const lo = Math.max(0.9, 1 - (cap - 1) * 1.4);
  const mid = 1 + (cap - 1) * 0.45;

  // Room at the largest size this shot will reach, so the envelope holds for
  // every frame of the move and not only for the frame it was solved on.
  const r = roomAt(stage, plate, Math.max(hi, mid));
  const rx = Math.min(r.x, plate.w * 0.14);
  const ry = Math.min(r.y, plate.h * 0.14);
  const aimed = stagedMove(kind, stage.w, stage.h, r.x, r.y);
  const breath = Math.sin((f + seed * 31) / 150) * Math.min(ry * 0.2, plate.h * 0.006);

  switch (aimed) {
    case "push":       return { scale: t(lo, hi),   x: 0,                        y: breath + t(ry * 0.3, -ry * 0.3), rot: 0 };
    case "pull":       return { scale: t(hi, lo),   x: 0,                        y: breath + t(-ry * 0.3, ry * 0.3), rot: 0 };
    case "trackLeft":  return { scale: mid,         x: t(rx * 0.94, -rx * 0.94), y: breath,                          rot: 0 };
    case "trackRight": return { scale: mid,         x: t(-rx * 0.94, rx * 0.94), y: breath,                          rot: 0 };
    case "tiltUp":     return { scale: mid,         x: 0,                        y: t(ry * 0.94, -ry * 0.94),        rot: 0 };
    case "tiltDown":   return { scale: mid,         x: 0,                        y: t(-ry * 0.94, ry * 0.94),        rot: 0 };
    case "orbit":
    default:           return { scale: t(1, hi),    x: t(rx * 0.6, -rx * 0.6),   y: breath + t(-ry * 0.4, ry * 0.4), rot: t(-ORBIT_ROT, ORBIT_ROT) };
  }
};

/**
 * The camera for a picture that DOES fill the frame.
 *
 * The old one drove a plate laid out 10% larger than the frame and then scaled
 * it up to 1.12 on top, so at the far end of a pull 19% of the picture was
 * outside the frame before objectFit: cover had even been counted. That is not
 * a large crop, but it is an invisible one, and it was not in anyone's budget.
 *
 * Here the plate is EXACTLY the frame, and the room a move needs is made by
 * the move itself: at scale 1 there is none and the picture is whole, and the
 * travel at any other scale is the room that scale just created. So every
 * push begins on the complete picture, every pull ends on it, and nothing ever
 * loses more than `maxZoom`.
 */
export const bleedCamera = (
  kind: MoveKind, p: number, W: number, H: number, maxZoom: number = 1.1,
): Camera => {
  const e = ease(clamp01(p));
  const t = (a: number, b: number) => a + (b - a) * e;
  const mid = 1 + (maxZoom - 1) * 0.55;

  let scale = mid;
  let fx = 0;
  let fy = 0;
  let rot = 0;
  switch (kind) {
    case "push":       scale = t(1, maxZoom);     fy = t(0.3, -0.3);   break;
    case "pull":       scale = t(maxZoom, 1);     fy = t(-0.3, 0.3);   break;
    case "trackLeft":  fx = t(0.86, -0.86);                            break;
    case "trackRight": fx = t(-0.86, 0.86);                            break;
    case "tiltUp":     fy = t(0.86, -0.86);                            break;
    case "tiltDown":   fy = t(-0.86, 0.86);                            break;
    case "orbit":
    default:           scale = t(1.01, maxZoom);  fx = t(0.4, -0.4); fy = t(-0.2, 0.2);
                       rot = t(-ORBIT_ROT, ORBIT_ROT);                 break;
  }
  // The room this scale has made, and no more. A rotation eats into it in both
  // axes, exactly as it does on the staged path.
  const rad = (Math.abs(rot) * Math.PI) / 180;
  const spanW = W * Math.cos(rad) + H * Math.sin(rad);
  const spanH = W * Math.sin(rad) + H * Math.cos(rad);
  return {
    scale,
    x: fx * Math.max(0, (spanW * scale - W) / 2),
    y: fy * Math.max(0, (spanH * scale - H) / 2),
    rot,
  };
};

/**
 * The fraction of a bled picture that reaches the screen at a given camera.
 *
 * cover throws away one axis to make the picture the frame's shape; the
 * camera's own magnification then throws away a slice of BOTH. Measuring only
 * the first is how 19% went missing without anyone budgeting for it, so this
 * returns the product, per axis, and scripts/framing.mjs holds it to account.
 */
export const bleedKeeps = (
  ar: number, W: number, H: number, cam: Camera,
): { w: number; h: number } => {
  const { axis, keep } = coverKeeps(ar, W / H);
  const rad = (Math.abs(cam.rot) * Math.PI) / 180;
  const spanW = (W * Math.cos(rad) + H * Math.sin(rad)) * cam.scale;
  const spanH = (W * Math.sin(rad) + H * Math.cos(rad)) * cam.scale;
  return {
    w: (axis === "width" ? keep : 1) * Math.min(1, W / spanW),
    h: (axis === "height" ? keep : 1) * Math.min(1, H / spanH),
  };
};
