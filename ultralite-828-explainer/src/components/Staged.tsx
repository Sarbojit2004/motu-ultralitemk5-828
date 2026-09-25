import React from "react";
import { Img, OffthreadVideo, interpolate, random, staticFile, useVideoConfig } from "remotion";
import { ACCENT, GROUND, formatFor, type AccentKey } from "../theme.ts";
import type { Asset, Clip, Region } from "../assets.ts";
import {
  bleedCamera, clampToStage, mayBleed, plateIn, stageFor, stagedCamera,
  type MoveKind, type Plate, type Stage,
} from "./Stage.ts";

// ─────────────────────────────────────────────────────────────────────────────
// STAGING
//
// Every shot in both films is a camera looking at a subject, never a picture
// sitting on a slide. A still bled to a 4K frame and held for four seconds is
// dead on screen, so each one carries a real move — a push, a pull, a lateral
// track, a slow orbit — eased rather than linear, so it reads as a dolly on a
// slider rather than as a CSS transition.
//
// THE ONE RULE EVERY STAGING BELOW OBEYS: a picture is shown COMPLETE. The
// plate carries the image's own aspect ratio and the move travels inside
// overscan that was added before the move was applied, so a subject can never
// slide out of frame, an edge can never be exposed, and nothing is ever
// stretched, squeezed or cut in half.
//
// WHAT WAS REMOVED SINCE THE M-SERIES REEL, and why:
//
//   The diagonal SPLIT. That staging clipped two photographs to opposing
//   triangles so they met on a diagonal seam. On paper it was a comparison
//   layout; in practice each photograph was first cropped to a 9:16 sliver by
//   objectFit: cover and then had half of that sliver clipped away, so NEITHER
//   subject was ever fully visible and both read as damaged. It is replaced by
//   StackBleed, which shows two complete plates — stacked in the vertical film,
//   side by side in the landscape one — with nothing clipped and nothing cut.
//   No picture in either film is ever sliced.
//
// WHAT WAS ADDED: DetailZoom. The top-down plans are 4096 px wide, so a crop of
// a single row of knobs is still sharper than the frame it lands in. That is
// what lets a shot push into the actual control the narration is naming — the
// gain row while the voice says "six to sixty-five", the magenta compressor row
// while it says "on every one of them" — instead of showing a whole desk and
// hoping the viewer finds it.
// ─────────────────────────────────────────────────────────────────────────────

/** Declared in Stage.ts, where the staged camera that consumes it also lives. */
export type { MoveKind } from "./Stage.ts";

const MOVES: MoveKind[] = ["push", "pull", "trackLeft", "trackRight", "tiltUp", "tiltDown", "orbit"];

/** Deterministically varies the move per shot so no two neighbours repeat. */
export const moveFor = (seed: number): MoveKind => MOVES[seed % MOVES.length];

/** Ease-in-out — a dolly accelerates and settles, it does not start at speed. */
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

const clamp01 = (p: number) => Math.min(1, Math.max(0, p));

export type Camera = { scale: number; x: number; y: number; rot: number };

// `fullCamera` used to live here: the camera for a plate laid out LARGER than
// the frame. It is gone rather than deprecated. Its contract — "travel inside
// the overscan the plate already carries" — is what let a 1.10 overscan and a
// 1.12 scale multiply into a 19% crop that nothing in the project measured.
// Bled shots use bleedCamera in Stage.ts, which makes its own room and so has
// to declare how much of the picture it is spending.

/**
 * The camera for a plate that is wider than the frame but not as tall.
 *
 * Lateral travel is still bounded by the side room, but vertical travel is
 * free: behind this plate there is a wash or a lit void, not an edge waiting
 * to be exposed.
 */
export const plateCamera = (kind: MoveKind, p: number, roomX: number, dy: number): Camera => {
  const e = ease(clamp01(p));
  const t = (a: number, b: number) => interpolate(e, [0, 1], [a, b]);
  switch (kind) {
    case "push":       return { scale: t(1.0, 1.09),  x: 0,                              y: t(dy * 0.5, -dy * 0.5), rot: 0 };
    case "pull":       return { scale: t(1.10, 1.0),  x: 0,                              y: t(-dy * 0.5, dy * 0.4), rot: 0 };
    case "trackLeft":  return { scale: 1.04,          x: t(roomX * 0.92, -roomX * 0.92), y: 0,                      rot: 0 };
    case "trackRight": return { scale: 1.04,          x: t(-roomX * 0.92, roomX * 0.92), y: 0,                      rot: 0 };
    case "tiltUp":     return { scale: 1.05,          x: 0,                              y: t(dy * 1.5, -dy * 1.5), rot: 0 };
    case "tiltDown":   return { scale: 1.05,          x: 0,                              y: t(-dy * 1.5, dy * 1.5), rot: 0 };
    case "orbit":
    default:           return { scale: t(1.01, 1.10), x: t(roomX * 0.55, -roomX * 0.55), y: t(-dy * 0.6, dy * 0.5), rot: t(-0.8, 0.8) };
  }
};

const url = (a: Asset) => staticFile(a.file);

type Base = {
  accent: AccentKey;
  /** 0..1 through the shot. */
  p: number;
  /** Frames since the shot began. */
  f: number;
  seed: number;
  move?: MoveKind;
};

// ── shared furniture ─────────────────────────────────────────────────────────

/** The corner falloff and tonal floor every staging finishes with. */
const Grade: React.FC<{ glow: string; portrait: boolean }> = ({ glow, portrait }) => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 86% 64% at 50% 44%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 64%, rgba(0,0,0,0.44) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: portrait
          ? "linear-gradient(180deg, rgba(5,6,8,0.62) 0%, rgba(5,6,8,0.12) 24%, rgba(5,6,8,0.18) 56%, rgba(5,6,8,0.82) 100%)"
          : "linear-gradient(180deg, rgba(5,6,8,0.52) 0%, rgba(5,6,8,0.06) 26%, rgba(5,6,8,0.22) 58%, rgba(5,6,8,0.80) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 70% 40% at 50% ${portrait ? 78 : 82}%, ${glow}1A 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
  </>
);

/**
 * The lit studio void the transparent renders and the plans sit in.
 *
 * These files have no background of their own — dropping one on the frame's
 * ground would put a console in a flat rectangle. A void with a warm pool
 * behind the subject and a darker floor beneath it gives the desk somewhere to
 * be, and gives 64%-opacity type somewhere with tonal room to live.
 */
const Void: React.FC<{ key1: string; glow: string }> = ({ key1, glow }) => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 82% 48% at 50% 42%, ${key1}3A 0%, #101218 46%, #06070A 100%)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 54% 22% at 50% 44%, ${glow}1F 0%, rgba(0,0,0,0) 72%)`,
      }}
    />
  </>
);

/**
 * Places a picture by its CONTENT rather than by its canvas.
 *
 * The product renders are 4096 px canvases in which the console occupies the
 * middle 80% and the rest is transparent padding. Positioning by the canvas
 * therefore puts a small desk in a large empty rectangle, and the padding
 * differs from file to file, so consecutive shots would jump. This solves the
 * full image's box such that the opaque content ends up the requested width,
 * centred where it was asked for.
 */
const placeByContent = (a: Asset, contentW: number, cx: number, cy: number) => {
  const [x0, y0, x1, y1] = a.bbox as number[];
  const fullW = contentW / Math.max(1e-6, x1 - x0);
  const fullH = (fullW * a.h) / a.w;
  return {
    left: cx - ((x0 + x1) / 2) * fullW,
    top: cy - ((y0 + y1) / 2) * fullH,
    width: fullW,
    height: fullH,
  };
};

/**
 * An image sized so its opaque CONTENT fills the box, not its canvas.
 *
 * objectFit: contain fits the CANVAS, and these renders are canvases in which
 * the desk occupies between 38% and 90% of the width depending on the file. A
 * lineup laid out with contain therefore shows four desks at four different
 * sizes, none of them filling its cell — which is what the first cut of both
 * the stack and the mosaic looked like.
 */
const ContentFit: React.FC<{ asset: Asset; w: number; h: number; style?: React.CSSProperties }> = ({
  asset, w, h, style,
}) => {
  if (!asset.transparent) {
    return <Img src={url(asset)} style={{ width: w, height: h, objectFit: "cover", ...style }} />;
  }
  const contentW = Math.min(w, h * asset.ar);
  const box = placeByContent(asset, contentW, w / 2, h / 2);
  return (
    <div style={{ position: "absolute", inset: 0, width: w, height: h, overflow: "hidden" }}>
      <Img src={url(asset)} style={{ position: "absolute", ...box, objectFit: "fill", ...style }} />
    </div>
  );
};

// ── the stage: how a picture that cannot bleed is put on screen ──────────────

/** The wash: the picture itself, pushed back to become the room it sits in. */
const WASH_MEDIA: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  // Pushed well past the frame as well as darkened. At 1.2x the wash is still
  // legibly the same photograph, and a picture shown twice reads as a mistake;
  // at 1.85x it is a magnified corner of it, which reads as the depth of field
  // the shot would have had. This is the cheap way to get bokeh: blur at 4K is
  // a convolution over 8.3 million pixels on every frame, and is banned here.
  filter: "brightness(0.26) saturate(0.42) contrast(1.10)",
};

/**
 * The picture itself. `contain` inside a box that already carries the
 * picture's own aspect ratio is a no-op that cannot stretch it — which is what
 * makes a rounding error in the box impossible to see rather than a 1-pixel
 * squeeze across a 4K plate.
 */
const PLATE_MEDIA: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  filter: "contrast(1.05) saturate(1.03)",
};

/**
 * The frame a complete picture is shown in: its own colour behind it, the
 * chapter's accent lifting off it, and a hairline holding its edge.
 *
 * The ring is a box-shadow with ZERO blur radius — a solid rectangle, which
 * the compositor draws for nothing. A blurred shadow on a plate this size is a
 * convolution on every frame of the move, and at 4K that single property costs
 * more than the photograph it is drawn around.
 */
const StagedFrame: React.FC<{
  accent: AccentKey;
  stage: Stage;
  plate: Plate;
  cam: Camera;
  portrait: boolean;
  children: (role: "wash" | "plate") => React.ReactNode;
}> = ({ accent, stage, plate, cam, portrait, children }) => {
  const { width: W, height: H } = useVideoConfig();
  const acc = ACCENT[accent];
  const safe = clampToStage(cam, stage, plate);
  const ring = Math.max(2, Math.round(W / 760));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      {/* the wash — travelling at a quarter of the plate's speed, which is
          what makes the frame read as a room with depth rather than as a
          picture on a background. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          transform: `translate(${safe.x * 0.26}px, ${safe.y * 0.26}px) scale(${(1.85 + (safe.scale - 1) * 0.5).toFixed(4)})`,
          willChange: "transform",
        }}
      >
        {children("wash")}
      </div>

      {/* A vignette on the wash, not on the picture. The wash is whatever the
          photograph happens to contain out at its edges — a white studio wall
          in one shot, a black control room in the next — and without this the
          bright ones pull the eye off the subject and into the surround. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 66% 62% at 50% 50%, rgba(3,4,6,0.22) 0%, rgba(3,4,6,0.58) 62%, rgba(3,4,6,0.86) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 40% at 50% ${((stage.cy / H) * 100).toFixed(2)}%, ${acc.glow}16 0%, rgba(0,0,0,0) 72%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: plate.left,
          top: plate.top,
          width: plate.w,
          height: plate.h,
          overflow: "hidden",
          transform: `translate(${safe.x}px, ${safe.y}px) scale(${safe.scale}) rotate(${safe.rot}deg)`,
          transformOrigin: "50% 50%",
          boxShadow: `0 0 0 ${ring}px ${acc.glow}30, 0 0 0 ${ring * 3}px rgba(0,0,0,0.34)`,
          willChange: "transform",
        }}
      >
        {children("plate")}
      </div>

      <Grade glow={acc.glow} portrait={portrait} />
    </div>
  );
};

// ── 1. the transparent product render ────────────────────────────────────────

/**
 * One console, complete, floating in a lit void with a floor reflection.
 *
 * The reflection is a second copy flipped in Y under a gradient that fades it
 * out, not a filter: a drop-shadow or a blur on a 2,500 px-wide plate is a
 * full-surface convolution on every frame, and it is the single most expensive
 * thing a staging like this can do.
 */
export const ProductPlate: React.FC<Base & { asset: Asset }> = ({ asset, accent, p, f, seed, move }) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const kind = move ?? moveFor(seed);

  // A wide desk gets less of the frame than a compact one, so the SUBJECT ends
  // up roughly the same size on screen whichever model is on.
  const fill = fmt.portrait ? 1.04 : 0.86;
  const contentW = W * fill * Math.min(1, 2.1 / Math.max(1.2, asset.ar));
  const cy = H * (fmt.portrait ? 0.45 : 0.47);
  const box = placeByContent(asset, contentW, W / 2, cy);
  const roomX = Math.max(60, (box.width - W) / 2 + W * 0.06);
  const cam = plateCamera(kind, p, roomX, H * 0.03);
  const breath = Math.sin((f + seed * 31) / 150) * (H / 520);

  const reflectH = box.height * 0.42;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      <Void key1={acc.key} glow={acc.glow} />

      <div
        style={{
          position: "absolute",
          ...box,
          transform: `translate(${cam.x}px, ${cam.y + breath}px) scale(${cam.scale}) rotate(${cam.rot}deg)`,
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        {/* the reflection, under the desk */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: box.height,
            width: box.width,
            height: reflectH,
            overflow: "hidden",
            opacity: 0.3,
          }}
        >
          <Img
            src={url(asset)}
            style={{
              position: "absolute",
              left: 0,
              top: -box.height + reflectH,
              width: box.width,
              height: box.height,
              transform: "scaleY(-1)",
              transformOrigin: "50% 50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(8,9,12,0.45) 0%, rgba(8,9,12,0.92) 46%, #06070A 100%)",
            }}
          />
        </div>

        <Img
          src={url(asset)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "contrast(1.05) saturate(1.04) brightness(1.02)",
          }}
        />
      </div>

      <Grade glow={acc.glow} portrait={fmt.portrait} />
    </div>
  );
};

// ── 2. the opaque photograph ─────────────────────────────────────────────────

/**
 * One photograph, shown COMPLETE, under a moving camera.
 *
 * THE BUG THIS REPLACES. The test that decided whether to bleed was
 *
 *     canBleed = asset.ar >= (W / H) * 0.94
 *
 * which in the vertical film asks "is this picture wider than 0.53:1". Every
 * photograph here is — they run 1.03:1 to 2.06:1 — so every one of them was
 * covered into a 9:16 frame and lost between 46% and 73% OF ITS WIDTH. The
 * comment above it described the opposite behaviour to the one it computed.
 *
 * `mayBleed` states the intent properly: bleed only when covering is cheap, at
 * most 8% of a picture's height or 15% of its width. In the vertical film that
 * is never true, so every photograph is now placed complete; in the landscape
 * film it is true for the six photographs that are already roughly 16:9, and
 * false for the squarer ones that used to lose up to 42% of their height.
 *
 * A complete picture gets the frame's own colour behind it — itself, pushed
 * back, graded down and travelling at a quarter of the plate's speed. That is
 * not a letterbox: it is the depth of field the shot would have had, and it is
 * the reason the type at 64% still has something to sit against.
 */
export const BleedShot: React.FC<Base & { asset: Asset }> = ({ asset, accent, p, f, seed, move }) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const kind = move ?? moveFor(seed);

  if (mayBleed(asset.ar, W / H)) {
    // The plate is EXACTLY the frame. It used to be laid out at fmt.overhang —
    // 10% larger — and then scaled up to 1.12 on top of that, so a pull ended
    // with 19% of the photograph outside the frame before objectFit: cover had
    // been counted. bleedCamera makes its own room instead: at scale 1 there is
    // none and the picture is whole.
    const cam = bleedCamera(kind, p, W, H);
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
        <Img
          src={url(asset)}
          style={{
            position: "absolute",
            inset: 0,
            width: W,
            height: H,
            objectFit: "cover",
            transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale}) rotate(${cam.rot}deg)`,
            transformOrigin: "50% 50%",
            filter: "contrast(1.05) saturate(1.04)",
            willChange: "transform",
          }}
        />
        <Grade glow={acc.glow} portrait={fmt.portrait} />
      </div>
    );
  }

  const stage = stageFor(fmt, W, H);
  const plate = plateIn(stage, asset.ar);
  const cam = stagedCamera(kind, p, f, seed, stage, plate);

  return (
    <StagedFrame accent={accent} stage={stage} plate={plate} cam={cam} portrait={fmt.portrait}>
      {(role) =>
        role === "wash" ? (
          <Img src={url(asset)} style={WASH_MEDIA} />
        ) : (
          <Img src={url(asset)} style={PLATE_MEDIA} />
        )
      }
    </StagedFrame>
  );
};

// ── 3. the b-roll clip ───────────────────────────────────────────────────────

/**
 * A deployment clip, staged exactly like a photograph of the same shape.
 *
 * The clips are 16:9. That is close enough to the landscape frame to bleed and
 * nowhere near the vertical one, where covering would keep 32% of the width —
 * and these are the shots with PEOPLE in them, framed by a generative model
 * that put the engineer, the desk and the interface across the full width. A
 * 32% centre crop of that is a slab of wall and half a shoulder, which is
 * exactly what the reel was going to show. So in the vertical film the clip is
 * placed complete, with itself as its own ground.
 *
 * `startFrom` is in SOURCE frames: each clip holds several seconds and a shot
 * rarely needs all of it, so different shots take different passes of the same
 * move without repeating.
 */
export const ClipBleed: React.FC<Base & { clip: Clip; fromSeconds?: number; rate?: number }> = ({
  clip, accent, p, f, seed, move, fromSeconds = 0, rate = 1,
}) => {
  const { width: W, height: H, fps } = useVideoConfig();
  // The shot plan states this offset in SECONDS, which is how an editor thinks
  // about a clip. Remotion counts startFrom in FRAMES, and the two were being
  // passed straight through each other: "start three seconds in" arrived as
  // "start three frames in", so the reel has never once shown the section of a
  // deployment it was written to show.
  const startFrom = Math.round(fromSeconds * fps);
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const kind = move ?? moveFor(seed);
  const src = staticFile(clip.file);

  // The clip already carries its own camera move. Ours is deliberately gentler
  // than the one used on a still — two moves fighting reads as a wobble.
  const soft = (c: Camera): Camera => ({
    scale: 1 + (c.scale - 1) * 0.45,
    x: c.x * 0.5,
    y: c.y * 0.5,
    rot: c.rot * 0.35,
  });

  if (mayBleed(clip.ar, W / H)) {
    // Gentler still than a photograph's: the clip carries its own move, and a
    // 16:9 clip in a 16:9 frame is the one case where a bleed costs nothing at
    // all until the camera asks it to.
    const cam = bleedCamera(kind, p, W, H, 1.05);
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
        <OffthreadVideo
          src={src}
          muted
          startFrom={startFrom}
          playbackRate={rate}
          style={{
            position: "absolute",
            inset: 0,
            width: W,
            height: H,
            objectFit: "cover",
            transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.scale})`,
            transformOrigin: "50% 50%",
            willChange: "transform",
          }}
        />
        <Grade glow={acc.glow} portrait={fmt.portrait} />
      </div>
    );
  }

  const stage = stageFor(fmt, W, H);
  const plate = plateIn(stage, clip.ar);
  const cam = clampToStage(soft(stagedCamera(kind, p, f, seed, stage, plate)), stage, plate);

  return (
    <StagedFrame accent={accent} stage={stage} plate={plate} cam={cam} portrait={fmt.portrait}>
      {(role) =>
        role === "wash" ? (
          <OffthreadVideo src={src} muted startFrom={startFrom} playbackRate={rate} style={WASH_MEDIA} />
        ) : (
          <OffthreadVideo src={src} muted startFrom={startFrom} playbackRate={rate} style={PLATE_MEDIA} />
        )
      }
    </StagedFrame>
  );
};

// ── 4. the wide panel or plan ────────────────────────────────────────────────

/**
 * An ultra-wide drawing: shown WHOLE first, then read along.
 *
 * The rear panels run from 3.6:1 to 5.1:1. Laying one straight into the
 * reading size and tracking from the off — which is what this did — means the
 * viewer never sees the panel, only a moving 42% window onto it, and has no
 * idea what they are looking at until the shot is nearly over.
 *
 * So the shot now has two phases on one continuous move. For the first third
 * the complete panel sits across the stage, end to end, at whatever size it
 * takes to fit — the establishing frame. Then the camera pushes in to the size
 * at which the legends beside each connector can actually be read, and tracks
 * along it. Nothing is cut away that was not shown first.
 */
export const PanelPlate: React.FC<Base & { asset: Asset }> = ({ asset, accent, p, f, seed }) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const stage = stageFor(fmt, W, H);

  /** Phase A: the whole panel, complete, across the stage. */
  const wholeW = Math.min(stage.w * 0.96, stage.h * 0.96 * asset.ar);
  /** Phase B: big enough that the legend beside a connector is legible. */
  const readW = Math.max(wholeW, H * (fmt.portrait ? 0.26 : 0.42) * asset.ar);

  const HOLD = 0.3;
  const k = ease(clamp01((clamp01(p) - HOLD) / (1 - HOLD)));
  const contentW = interpolate(k, [0, 1], [wholeW, readW]);
  const box = placeByContent(asset, contentW, W / 2, H * (fmt.portrait ? 0.44 : 0.5));

  // How far the panel may travel at the size it is at RIGHT NOW. At the
  // establishing size this is zero, which is what holds the whole panel still
  // and centred while it is being established.
  const room = Math.max(0, (contentW - W * 0.98) / 2);
  const dir = seed % 2 === 0 ? 1 : -1;
  const x = interpolate(k, [0, 0.14, 1], [0, room * 0.9 * dir, -room * 0.9 * dir]);
  const lift = Math.sin(f / 120) * (H / 380);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      <Void key1={acc.key} glow={acc.glow} />
      <div
        style={{
          position: "absolute",
          ...box,
          transform: `translate(${x}px, ${lift}px)`,
          filter: "brightness(0.98) contrast(1.08)",
          willChange: "transform",
        }}
      >
        <Img src={url(asset)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <Grade glow={acc.glow} portrait={fmt.portrait} />
    </div>
  );
};

// ── 5. the detail push ───────────────────────────────────────────────────────

/**
 * A named region of a 4096 px plan, filling the frame under a slow push.
 *
 * This is the shot that makes a spec claim checkable: the voice says the gain
 * runs from six to sixty-five and the frame is the actual gain row with +6 and
 * +65 printed beside the knob. The region is expressed as a rectangle of the
 * source image, so the crop is a CAMERA on the plan, not a distortion of it —
 * the aspect ratio of what is shown is set by the frame, and the region is
 * grown, never squeezed, to reach it.
 */
export const DetailZoom: React.FC<Base & { asset: Asset; region: Region; zoom?: number; dim?: number }> = ({
  asset, region, accent, p, f, seed, zoom = 1.0, dim = 0.92,
}) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];

  // Grow the requested region to the frame's aspect ratio. Growing keeps every
  // control the region named inside the shot; shrinking would cut one off.
  const frameAr = W / H;
  const srcW = region.w * asset.w;
  const srcH = region.h * asset.h;
  let rw = region.w;
  let rh = region.h;
  if (srcW / srcH > frameAr) rh = (srcW / frameAr) / asset.h;
  else rw = (srcH * frameAr) / asset.w;
  rw = Math.min(1, rw * zoom);
  rh = Math.min(1, rh * zoom);

  // RESOLUTION GUARD. `zoom` tightens the crop, and on a small control — the QR
  // code is 307 px wide on the plan — tightening it far enough to fill the
  // frame asks for a twentyfold upscale, which arrives as mush. The crop is
  // therefore never allowed to take the source below a third of the frame's own
  // width. A wider shot that is sharp beats a tighter one that is not, and the
  // camera move inside it still reads as a push.
  const MAX_UPSCALE = 3.0;
  const minRw = W / (MAX_UPSCALE * asset.w);
  const widened = rw < minRw;
  if (widened) {
    const k = minRw / rw;
    rw = Math.min(1, rw * k);
    rh = Math.min(1, rh * k);
  }
  const cx = region.x + region.w / 2;
  const cy = region.y + region.h / 2;

  // A slow push with a touch of lateral drift, both bounded so the named
  // region is inside the frame at every moment of the move.
  const e = ease(clamp01(p));
  const dir = seed % 2 === 0 ? 1 : -1;
  // A shot the guard widened starts at the sharp limit and travels further in
  // over its own length, so it still arrives at the control the narration is
  // naming — and the softest part of the move is the part the motion covers.
  const s = interpolate(e, [0, 1], [1.0, widened ? 1.34 : 1.085]);
  const dx = interpolate(e, [0, 1], [-0.012 * dir, 0.012 * dir]);
  const dy = Math.sin((f + seed * 17) / 170) * 0.004;

  const fullW = W / (rw * s);
  const fullH = (fullW * asset.h) / asset.w;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      <Void key1={acc.key} glow={acc.glow} />
      <div
        style={{
          position: "absolute",
          left: W / 2 - (cx + dx) * fullW,
          top: H / 2 - (cy + dy) * fullH,
          width: fullW,
          height: fullH,
          willChange: "transform",
        }}
      >
        <Img
          src={url(asset)}
          // `dim` is solved per region from its measured luminance (see
          // dimFor), so a push into the pale master section and a push into the
          // dark channel strip both land on a ground the overlay can hold
          // against, instead of one fixed multiplier suiting neither.
          style={{ width: "100%", height: "100%", objectFit: "fill", filter: `brightness(${dim.toFixed(3)}) contrast(1.12) saturate(1.08)` }}
        />
      </div>
      <Grade glow={acc.glow} portrait={fmt.portrait} />
    </div>
  );
};

// ── 6. two pictures, both complete ───────────────────────────────────────────

/**
 * The comparison staging, and the replacement for the diagonal split.
 *
 * Two pictures, each shown WHOLE at its own aspect ratio: stacked one above the
 * other in the vertical frame, side by side in the landscape one. They are
 * separated by a lit accent rule so the pairing reads as deliberate. Each drifts
 * slightly, and in opposite directions, so the frame is alive without either
 * picture being cropped, clipped, rotated or cut.
 */
export const StackBleed: React.FC<Base & { assets: Asset[] }> = ({ assets, accent, p, f, seed }) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const [a, b] = [assets[0], assets[1] ?? assets[0]];
  const e = ease(clamp01(p));

  const gap = fmt.portrait ? H * 0.012 : W * 0.010;

  const cell = (asset: Asset, i: number) => {
    const drift = interpolate(e, [0, 1], [i === 0 ? -1 : 1, i === 0 ? 1 : -1]) * (fmt.portrait ? W * 0.012 : H * 0.012);
    const sc = interpolate(e, [0, 1], i === 0 ? [1.03, 1.0] : [1.0, 1.03]);

    // The plate is solved to the cell's own width (portrait) or height
    // (landscape) from the picture's aspect ratio, so it is complete inside its
    // half with room around it rather than cropped to fill the half.
    const cellW = fmt.portrait ? W : (W - gap) / 2;
    const cellH = fmt.portrait ? (H - gap) / 2 : H;
    const plateW = Math.min(cellW * 0.99, cellH * 0.96 * asset.ar);
    const plateH = plateW / asset.ar;
    const inner = { width: plateW, height: plateH };

    return (
      <div
        key={`${asset.slug}-${i}`}
        style={{
          position: "absolute",
          left: fmt.portrait ? 0 : i * (cellW + gap),
          top: fmt.portrait ? i * (cellH + gap) : 0,
          width: cellW,
          height: cellH,
          overflow: "hidden",
        }}
      >
        {/* A photograph gets a darkened copy of itself as its ground; a
            transparent render has no colour to derive one from, so it gets the
            same lit void the single-product staging puts a desk in. Covering a
            cell with a transparent image just paints nothing, which is what
            made the first cut of this shot two desks floating in flat black. */}
        {asset.transparent ? (
          <>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse 76% 60% at 50% 48%, ${acc.key}44 0%, #0F1116 52%, #06070A 100%)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(ellipse 52% 30% at 50% 48%, ${acc.glow}1C 0%, rgba(0,0,0,0) 74%)`,
              }}
            />
          </>
        ) : (
          <Img
            src={url(asset)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scale(1.3)",
              filter: "brightness(0.2) saturate(0.5)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            left: (cellW - plateW) / 2,
            top: (cellH - plateH) / 2,
            width: plateW,
            height: plateH,
            transform: fmt.portrait
              ? `translateX(${drift}px) scale(${sc})`
              : `translateY(${drift}px) scale(${sc})`,
            transformOrigin: "50% 50%",
            willChange: "transform",
          }}
        >
          <ContentFit
            asset={asset}
            w={inner.width}
            h={inner.height}
            style={{ filter: asset.transparent ? "contrast(1.04) saturate(1.04) brightness(1.04)" : "contrast(1.05)" }}
          />
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      {cell(a, 0)}
      {cell(b, 1)}
      {/* the rule between them — a straight line along the actual join */}
      <div
        style={{
          position: "absolute",
          left: fmt.portrait ? 0 : (W - gap) / 2,
          top: fmt.portrait ? (H - gap) / 2 : 0,
          width: fmt.portrait ? W : gap,
          height: fmt.portrait ? gap : H,
          background: fmt.portrait
            ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, ${acc.glow}9E 46%, ${acc.glow}9E 54%, rgba(0,0,0,0) 100%)`
            : `linear-gradient(90deg, rgba(0,0,0,0) 0%, ${acc.glow}9E 46%, ${acc.glow}9E 54%, rgba(0,0,0,0) 100%)`,
        }}
      />
      <Grade glow={acc.glow} portrait={fmt.portrait} />
    </div>
  );
};

// ── 7. the mosaic ────────────────────────────────────────────────────────────

/**
 * Three or more pictures as one drifting plane — the coverage tier.
 *
 * Cells are laid out so each one is close to the pictures' own aspect ratio:
 * a vertical frame stacks them in a single column, a landscape frame puts them
 * in a row. Getting that wrong is what makes a mosaic crop every photograph
 * hard, and it is why a 2x2 grid is never used for three pictures.
 */
export const MosaicBleed: React.FC<Base & { assets: Asset[]; labels?: string[] }> = ({
  assets, accent, p, f, seed, labels,
}) => {
  const { width: W, height: H } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const n = Math.min(assets.length, 6);
  const list = assets.slice(0, n);
  // A single column up to four in a vertical frame. The obvious 2x2 grid gives
  // each cell an aspect of 0.56 while the pictures run from 1.4 to 2.4, so every
  // one of them ends up contained to a third of its cell — four small consoles
  // in a mostly empty rectangle, which is the opposite of a lineup.
  const cols = fmt.portrait ? (n <= 4 ? 1 : 2) : n <= 4 ? n : 3;
  const rows = Math.ceil(n / cols);
  const e = ease(clamp01(p));
  const planeScale = interpolate(e, [0, 1], [1.045, 1.0]);
  const planeX = interpolate(e, [0, 1], [-W / 120, W / 120]);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      <Void key1={acc.key} glow={acc.glow} />
      <div
        style={{
          position: "absolute",
          inset: "-2.5%",
          transform: `translateX(${planeX}px) scale(${planeScale})`,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: Math.round(W / 200),
          willChange: "transform",
        }}
      >
        {list.map((a, i) => {
          const r = random(`${seed}-${i}`);
          const drift = Math.sin((f + i * 37) / 110) * (H / 420);
          const cw = W / cols;
          const ch = H / rows;
          return (
            <div key={a.slug} style={{ position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `translateY(${drift}px) scale(${a.transparent ? 0.94 : 1 + r * 0.03})`,
                  willChange: "transform",
                }}
              >
                <ContentFit asset={a} w={cw} h={ch} style={{ filter: "brightness(0.80) contrast(1.12)" }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* A lineup is a comparison, so it is labelled: four unlabelled
          photographs of four near-identical desks read as one picture repeated
          by mistake, which is the opposite of the point being made. */}
      {labels
        ? list.map((a, i) => {
            const c = i % cols;
            const rI = Math.floor(i / cols);
            const cw = W / cols;
            const ch = H / rows;
            return (
              <div
                key={`l-${a.slug}`}
                style={{
                  position: "absolute",
                  left: fmt.portrait ? c * cw + cw * 0.62 : c * cw + W * 0.035,
                  top: rI * ch + H * (fmt.portrait ? 0.035 : 0.045),
                  display: "flex",
                  alignItems: "center",
                  gap: W * 0.012,
                }}
              >
                <div style={{ width: Math.round(W / 190), height: H * 0.055, background: acc.glow }} />
                <div
                  style={{
                    fontSize: fmt.portrait ? 104 : 86,
                    letterSpacing: 7,
                    color: acc.glow,
                    textShadow: "0 6px 14px rgba(0,0,0,0.94), 0 0 8px rgba(0,0,0,0.85)",
                  }}
                >
                  {labels[i] ?? ""}
                </div>
              </div>
            );
          })
        : null}
      <Grade glow={acc.glow} portrait={fmt.portrait} />
    </div>
  );
};

// ── 8. the clip row ──────────────────────────────────────────────────────────

/**
 * Two to four PORTRAIT clips laid across a landscape frame, each shown whole.
 *
 * THE PROBLEM THIS SOLVES. The eight deployment clips for these two products
 * were generated for the 90-second vertical reel next door, so they are
 * 1076 x 1928 — 0.56:1, the wrong way round for a 16:9 film. Staged singly they
 * are honest but small: a complete one is 1133 px wide in a 3840 px frame, a
 * third of the width, with wash either side.
 *
 * Three of them side by side is 3327 px of the same frame, and it stops being a
 * compromise and becomes a statement — the same two interfaces in three rooms
 * at once, which is exactly what the chapters that use this are saying. Nothing
 * is cropped to make it fit: each cell is sized from the clip's own aspect and
 * the row is centred in whatever width that comes to.
 */
export const ClipRow: React.FC<Base & { clips: Clip[] }> = ({ clips, accent, p, f, seed }) => {
  const { width: W, height: H, fps } = useVideoConfig();
  const fmt = formatFor(W, H);
  const acc = ACCENT[accent];
  const list = clips.slice(0, 4);
  const n = Math.max(1, list.length);
  const e = ease(clamp01(p));

  const gap = Math.round(W * 0.012);
  const cellW = (W - gap * (n - 1)) / n;
  // Every cell the same height, so the row reads as one object rather than as
  // a shelf of different-sized pictures.
  const rowH = Math.min(H * 0.92, ...list.map((c) => cellW / c.ar));
  const plates = list.map((c) => ({ w: rowH * c.ar, h: rowH }));
  const rowW = plates.reduce((a, b) => a + b.w, 0) + gap * (n - 1);
  const x0 = (W - rowW) / 2;
  const y0 = (H - rowH) / 2;

  let x = x0;
  const cells = list.map((c, i) => {
    const left = x;
    x += plates[i].w + gap;
    // Each drifts on its own phase, so the row breathes instead of pulsing.
    const drift = Math.sin((f + i * 53 + seed * 17) / 130) * (H * 0.006);
    const sc = interpolate(e, [0, 1], i % 2 === 0 ? [1.0, 1.035] : [1.035, 1.0]);
    return { c, left, drift, sc, ...plates[i] };
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      {/* the first clip, pushed back, as the ground the row sits on */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", transform: "scale(1.9)", willChange: "transform" }}>
        <OffthreadVideo src={staticFile(list[0].file)} muted style={WASH_MEDIA} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            `radial-gradient(ellipse 80% 44% at 50% 50%, ${acc.glow}16 0%, rgba(0,0,0,0) 72%)`,
            "radial-gradient(ellipse 66% 62% at 50% 50%, rgba(3,4,6,0.24) 0%, rgba(3,4,6,0.60) 62%, rgba(3,4,6,0.88) 100%)",
          ].join(", "),
        }}
      />

      {cells.map((cell, i) => (
        <div
          key={cell.c.slug}
          style={{
            position: "absolute",
            left: cell.left,
            top: y0,
            width: cell.w,
            height: cell.h,
            overflow: "hidden",
            transform: `translateY(${cell.drift}px) scale(${cell.sc})`,
            transformOrigin: "50% 50%",
            boxShadow: `0 0 0 ${Math.max(2, Math.round(W / 900))}px ${acc.glow}2E, 0 0 0 ${Math.max(6, Math.round(W / 300))}px rgba(0,0,0,0.30)`,
            willChange: "transform",
          }}
        >
          <OffthreadVideo
            src={staticFile(cell.c.file)}
            muted
            startFrom={0}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      ))}

      <Grade glow={acc.glow} portrait={fmt.portrait} />
    </div>
  );
};
