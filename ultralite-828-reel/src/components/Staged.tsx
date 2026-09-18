import React from "react";
import { Img, OffthreadVideo, interpolate, random, staticFile } from "remotion";
import { ACCENT, FONT, GROUND, type Canvas, type ProductKey } from "../theme.ts";
import type { Asset } from "../assets.ts";

// ─────────────────────────────────────────────────────────────────────────────
// FULL-BLEED STAGING WITH CAMERA MOVE — for two canvases.
//
// Every shot carries a real camera move — push, pull, lateral track, tilt or a
// slow orbit — eased so it reads as a dolly on a slider rather than a CSS
// transition. The plate is oversized past the frame before any move is applied
// and the move travels inside that overscan, so no edge is ever exposed.
//
// SIX KINDS:
//   bleed   a product photograph shown COMPLETE across the frame's width over a
//           darkened wash of itself (portrait), or covering the frame (landscape,
//           where a 1.7:1 photograph nearly matches the 1.78:1 frame)
//   still   a generated Higgsfield workflow still — 16:9, so it covers the
//           landscape frame exactly; on the portrait reel it is shown as a wide
//           band over its own wash unless a native 9:16 variant exists
//   video   a generated Higgsfield B-roll clip, full bleed
//   panel   a transparent ultra-wide panel plan, tracked laterally
//   split   two photographs on a diagonal
//   mosaic  three to six drifting as one plane — the software screens
// ─────────────────────────────────────────────────────────────────────────────

export type MoveKind = "push" | "pull" | "trackLeft" | "trackRight" | "tiltUp" | "tiltDown" | "orbit";
const MOVES: MoveKind[] = ["push", "pull", "trackLeft", "trackRight", "tiltUp", "tiltDown", "orbit"];
export const moveFor = (seed: number): MoveKind => MOVES[seed % MOVES.length];
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

type Camera = { scale: number; x: number; y: number; rot: number };

/** Camera for a plate that fully covers the frame with `bleed` overscan. */
export const cameraFor = (kind: MoveKind, p: number, bleed: number, c: Canvas): Camera => {
  const e = ease(Math.min(1, Math.max(0, p)));
  const roomX = (c.width * (bleed - 1)) / 2;
  const roomY = (c.height * (bleed - 1)) / 2;
  const t = (a: number, b: number) => interpolate(e, [0, 1], [a, b]);
  switch (kind) {
    case "push":
      return { scale: t(1, 1.1), x: 0, y: t(roomY * 0.1, -roomY * 0.1), rot: 0 };
    case "pull":
      return { scale: t(1.12, 1.0), x: 0, y: t(-roomY * 0.1, roomY * 0.08), rot: 0 };
    case "trackLeft":
      return { scale: 1.05, x: t(roomX * 0.72, -roomX * 0.72), y: 0, rot: 0 };
    case "trackRight":
      return { scale: 1.05, x: t(-roomX * 0.72, roomX * 0.72), y: 0, rot: 0 };
    case "tiltUp":
      return { scale: 1.06, x: 0, y: t(roomY * 0.7, -roomY * 0.7), rot: 0 };
    case "tiltDown":
      return { scale: 1.06, x: 0, y: t(-roomY * 0.7, roomY * 0.7), rot: 0 };
    case "orbit":
    default:
      return { scale: t(1.02, 1.12), x: t(roomX * 0.3, -roomX * 0.3), y: t(-roomY * 0.14, roomY * 0.1), rot: t(-0.9, 0.9) };
  }
};

/** Camera for a plate wider than the frame but not taller (the band shot). */
export const plateCamera = (kind: MoveKind, p: number, roomX: number, c: Canvas): Camera => {
  const e = ease(Math.min(1, Math.max(0, p)));
  const t = (a: number, b: number) => interpolate(e, [0, 1], [a, b]);
  const dy = c.height * 0.035;
  switch (kind) {
    case "push":
      return { scale: t(1.0, 1.09), x: 0, y: t(dy * 0.5, -dy * 0.5), rot: 0 };
    case "pull":
      return { scale: t(1.1, 1.0), x: 0, y: t(-dy * 0.5, dy * 0.4), rot: 0 };
    case "trackLeft":
      return { scale: 1.04, x: t(roomX * 0.92, -roomX * 0.92), y: 0, rot: 0 };
    case "trackRight":
      return { scale: 1.04, x: t(-roomX * 0.92, roomX * 0.92), y: 0, rot: 0 };
    case "tiltUp":
      return { scale: 1.05, x: 0, y: t(dy * 1.5, -dy * 1.5), rot: 0 };
    case "tiltDown":
      return { scale: 1.05, x: 0, y: t(-dy * 1.5, dy * 1.5), rot: 0 };
    case "orbit":
    default:
      return { scale: t(1.01, 1.1), x: t(roomX * 0.55, -roomX * 0.55), y: t(-dy * 0.6, dy * 0.5), rot: t(-0.8, 0.8) };
  }
};

export type StageProps = {
  canvas: Canvas;
  env: "light" | "dark";
  product: ProductKey;
  /** 0..1 through the shot. */
  p: number;
  /** frames since the shot began. */
  f: number;
  seed: number;
  move?: MoveKind;
};

const src = (a: Asset) => staticFile(`images/${a.file}`);

/** The grade every full-bleed shot wears: corner falloff, a tonal floor under the caption band, an accent bloom. */
const Grade: React.FC<{ accent: string; env: "light" | "dark"; portrait: boolean }> = ({ accent, env, portrait }) => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 86% 64% at 50% 44%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.14) 64%, rgba(0,0,0,0.42) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: portrait
          ? "linear-gradient(180deg, rgba(6,6,9,0.62) 0%, rgba(6,6,9,0.14) 24%, rgba(6,6,9,0.18) 56%, rgba(6,6,9,0.80) 100%)"
          : "linear-gradient(180deg, rgba(6,6,9,0.42) 0%, rgba(6,6,9,0.06) 22%, rgba(6,6,9,0.10) 52%, rgba(6,6,9,0.78) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 70% 40% at ${portrait ? "50% 78%" : "28% 84%"}, ${accent}1A 0%, rgba(0,0,0,0) 70%)`,
      }}
    />
    {env === "light" ? null : null}
  </>
);

/** A frame-covering plate under a camera move. Used wherever the source's aspect is near the canvas's. */
const CoverPlate: React.FC<{ children: React.ReactNode; kind: MoveKind; p: number; f: number; seed: number; canvas: Canvas; bleed?: number }> = ({
  children, kind, p, f, seed, canvas, bleed = 1.16,
}) => {
  const cam = cameraFor(kind, p, bleed, canvas);
  const breath = Math.sin((f + seed * 31) / 150) * 5;
  return (
    <div
      style={{
        position: "absolute",
        left: (canvas.width * (1 - bleed)) / 2,
        top: (canvas.height * (1 - bleed)) / 2,
        width: canvas.width * bleed,
        height: canvas.height * bleed,
        transform: `translate(${cam.x}px, ${cam.y + breath}px) scale(${cam.scale}) rotate(${cam.rot}deg)`,
        transformOrigin: "50% 50%",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

/**
 * One photograph, complete, across the frame's full width over a wash of
 * itself — the portrait staging. On the landscape canvas a 1.5–2.3:1
 * photograph is close enough to 1.78:1 to cover the frame under the move.
 */
export const BleedShot: React.FC<StageProps & { asset: Asset }> = ({ asset, canvas, env, product, p, f, seed, move }) => {
  const accent = ACCENT[product];
  const kind = move ?? moveFor(seed);
  const canvasAr = canvas.width / canvas.height;
  const coverable = !asset.alpha && asset.ar / canvasAr > 0.72 && asset.ar / canvasAr < 1.45;
  // No CSS filter on any full-frame layer: with a software GL rasteriser a
  // filter forces an offscreen pass over 8.3 million pixels on every frame.
  // The wash grade is baked into the 512 px plate by prep-assets.mjs instead.
  if (coverable) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
        <CoverPlate kind={kind} p={p} f={f} seed={seed} canvas={canvas}>
          <Img src={src(asset)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </CoverPlate>
        <Grade accent={accent.glow} env={env} portrait={canvas.portrait} />
      </div>
    );
  }

  const overhang = canvas.portrait ? 1.14 : 1.08;
  const plateW = canvas.width * overhang;
  const plateH = plateW / asset.ar;
  // On landscape a strip-like photo would still be a band; cap the band to the frame.
  const capped = Math.min(plateH, canvas.height * 0.92);
  const w = capped < plateH ? capped * asset.ar : plateW;
  const h = capped;
  const roomX = Math.max(0, (w - canvas.width) / 2);
  const cam = plateCamera(kind, p, roomX, canvas);
  const breath = Math.sin((f + seed * 31) / 150) * 7;
  const washScale = 1.24 + (cam.scale - 1) * 0.35;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: env === "light" ? GROUND.lightSink : GROUND.darkSink }}>
      <Img
        src={staticFile(`images/${asset.bg}`)}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          transform: `translate(${cam.x * 0.28}px, ${cam.y * 0.28}px) scale(${washScale})`,
          willChange: "transform",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 76% 42% at 50% 46%, ${accent.glow}12 0%, rgba(0,0,0,0) 72%)` }} />
      <div
        style={{
          position: "absolute",
          left: (canvas.width - w) / 2,
          top: canvas.height * (canvas.portrait ? 0.46 : 0.5) - h / 2,
          width: w,
          height: h,
          transform: `translate(${cam.x}px, ${cam.y + breath}px) scale(${cam.scale}) rotate(${cam.rot}deg)`,
          transformOrigin: "50% 50%",
          willChange: "transform",
          background: asset.alpha ? "transparent" : undefined,
        }}
      >
        <Img src={src(asset)} style={{ width: "100%", height: "100%", objectFit: asset.alpha ? "contain" : "cover" }} />
      </div>
      <Grade accent={accent.glow} env={env} portrait={canvas.portrait} />
    </div>
  );
};

/** A generated workflow still. `file` is under public/higgsfield/. */
export const StillShot: React.FC<StageProps & { file: string; ar: number; bgFile?: string }> = ({ file, ar, bgFile, canvas, env, product, p, f, seed, move }) => {
  const accent = ACCENT[product];
  const kind = move ?? moveFor(seed);
  const canvasAr = canvas.width / canvas.height;
  const coverable = ar / canvasAr > 0.72 && ar / canvasAr < 1.45;
  const url = staticFile(`higgsfield/${file}`);

  if (coverable) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
        <CoverPlate kind={kind} p={p} f={f} seed={seed} canvas={canvas}>
          <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </CoverPlate>
        <Grade accent={accent.glow} env={env} portrait={canvas.portrait} />
      </div>
    );
  }

  // A 16:9 still on the 9:16 reel: a wide band across the frame over its own
  // wash, with a taller crop than a product photo gets — these frames have a
  // scene in them, not a box on white, so they can afford to lose their edges.
  const bandW = canvas.width * 1.1;
  const bandH = Math.min(bandW / ar * 1.35, canvas.height * 0.62);
  const roomX = (bandW - canvas.width) / 2;
  const cam = plateCamera(kind, p, roomX, canvas);
  const breath = Math.sin((f + seed * 31) / 150) * 6;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      <Img
        src={staticFile(`higgsfield/${bgFile ?? file}`)}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          transform: `translate(${cam.x * 0.28}px, ${cam.y * 0.28}px) scale(${1.3 + (cam.scale - 1) * 0.35})`,
          willChange: "transform",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (canvas.width - bandW) / 2,
          top: canvas.height * 0.47 - bandH / 2,
          width: bandW,
          height: bandH,
          transform: `translate(${cam.x}px, ${cam.y + breath}px) scale(${cam.scale}) rotate(${cam.rot}deg)`,
          transformOrigin: "50% 50%",
          overflow: "hidden",
          willChange: "transform",
        }}
      >
        <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <Grade accent={accent.glow} env={env} portrait={canvas.portrait} />
    </div>
  );
};

/** A generated B-roll clip, full bleed, under a gentle push so it never sits still even when the clip does. */
export const VideoShot: React.FC<StageProps & { file: string; ar: number; startFrom?: number; muted?: boolean }> = ({
  file, ar, startFrom = 0, canvas, env, product, p, f, seed,
}) => {
  const accent = ACCENT[product];
  const canvasAr = canvas.width / canvas.height;
  const coverable = ar / canvasAr > 0.72 && ar / canvasAr < 1.45;
  const e = ease(Math.min(1, Math.max(0, p)));
  const scale = interpolate(e, [0, 1], [1.0, 1.06]);
  const url = staticFile(`higgsfield/${file}`);
  const vid = (
    <OffthreadVideo src={url} startFrom={startFrom} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  );
  if (coverable) {
    return (
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: "50% 50%", willChange: "transform" }}>
          {vid}
        </div>
        <Grade accent={accent.glow} env={env} portrait={canvas.portrait} />
      </div>
    );
  }
  // 16:9 clip on the portrait reel: band over a wash of itself.
  const bandW = canvas.width * 1.06;
  const bandH = Math.min((bandW / ar) * 1.3, canvas.height * 0.6);
  const dx = interpolate(e, [0, 1], [-(bandW - canvas.width) / 2, (bandW - canvas.width) / 2]) * (seed % 2 ? 1 : -1);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: GROUND.darkSink }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(1.4)` }}>
        <OffthreadVideo src={url} startFrom={startFrom} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {/* the wash is darkened with a flat overlay rather than a filter — same look, no offscreen pass */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,4,6,0.72)" }} />
      <div
        style={{
          position: "absolute",
          left: (canvas.width - bandW) / 2,
          top: canvas.height * 0.47 - bandH / 2,
          width: bandW,
          height: bandH,
          overflow: "hidden",
          transform: `translateX(${dx}px) scale(${scale})`,
          willChange: "transform",
        }}
      >
        {vid}
      </div>
      <Grade accent={accent.glow} env={env} portrait={canvas.portrait} />
    </div>
  );
};

/** A transparent ultra-wide panel plan, laid across the frame and tracked laterally. */
export const PanelBleed: React.FC<StageProps & { asset: Asset }> = ({ asset, canvas, product, p, f, seed }) => {
  const accent = ACCENT[product];
  const h = canvas.height * (canvas.portrait ? 0.3 : 0.42);
  const w = Math.max(h * asset.ar, canvas.width * 1.25);
  const room = (w - canvas.width) / 2;
  const dir = seed % 2 === 0 ? 1 : -1;
  const x = interpolate(ease(p), [0, 1], [room * 0.82 * dir, -room * 0.82 * dir]);
  const lift = Math.sin(f / 120) * 10;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 78% 46% at 50% 46%, ${accent.key}2E 0%, #0E0E13 52%, #060608 100%)` }} />
      <div
        style={{
          position: "absolute",
          left: (canvas.width - w) / 2 + x,
          top: canvas.height * (canvas.portrait ? 0.44 : 0.48) - h / 2 + lift,
          width: w,
          height: h,
          filter: "brightness(1.2) contrast(1.06)",
          willChange: "transform",
        }}
      >
        <Img src={src(asset)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,6,9,0.5) 0%, rgba(6,6,9,0) 30%, rgba(6,6,9,0.28) 60%, rgba(6,6,9,0.8) 100%)" }} />
    </div>
  );
};

/** Two photographs on a diagonal, each with its own drift, the seam lit in the accent. */
export const SplitBleed: React.FC<StageProps & { asset: Asset; second: Asset }> = ({ asset, second, canvas, env, product, p, seed }) => {
  const accent = ACCENT[product];
  const e = ease(p);
  const half = (a: Asset, i: number) => {
    const dx = (i === 0 ? -1 : 1) * interpolate(e, [0, 1], [26, -26]);
    const sc = interpolate(e, [0, 1], i === 0 ? [1.08, 1.02] : [1.02, 1.08]);
    return (
      <div key={a.slug + i} style={{ position: "absolute", inset: 0, clipPath: i === 0 ? "polygon(0 0, 100% 0, 0 100%)" : "polygon(100% 0, 100% 100%, 0 100%)" }}>
        <div style={{ position: "absolute", inset: "-6%", transform: `translateX(${dx}px) scale(${sc})`, willChange: "transform", background: a.alpha ? GROUND.darkLift : undefined }}>
          <Img src={src(a)} style={{ width: "100%", height: "100%", objectFit: a.alpha ? "contain" : "cover" }} />
        </div>
      </div>
    );
  };
  const deg = (-Math.atan2(canvas.height, canvas.width) * 180) / Math.PI;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: env === "light" ? GROUND.light : GROUND.dark }}>
      {half(asset, 0)}
      {half(second, 1)}
      <div
        style={{
          position: "absolute",
          left: -canvas.width * 0.55,
          top: canvas.height * 0.5 - 46,
          width: canvas.width * 2.1,
          height: 92,
          transform: `rotate(${deg}deg)`,
          transformOrigin: "50% 50%",
          display: "flex",
          alignItems: "center",
          background: `linear-gradient(180deg, ${accent.glow}00 0%, ${accent.glow}3D 38%, ${accent.glow}5C 50%, ${accent.glow}3D 62%, ${accent.glow}00 100%)`,
        }}
      >
        <div style={{ width: "100%", height: 8, background: accent.glow, opacity: 0.92 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,6,9,0.66) 0%, rgba(6,6,9,0.08) 28%, rgba(6,6,9,0.26) 60%, rgba(6,6,9,0.82) 100%)" }} />
    </div>
  );
};

/**
 * Three to six images as a moving mosaic that fills the frame — how the
 * software screens are clubbed together, as instructed: CueMix Pro's mixer,
 * EQ, dynamics, patchbay, routing and iPad views on one drifting plane.
 */
export const MosaicBleed: React.FC<StageProps & { assets: Asset[]; labels?: boolean }> = ({ assets, canvas, env, product, p, f, seed, labels }) => {
  const accent = ACCENT[product];
  const n = Math.min(assets.length, 6);
  const list = assets.slice(0, n);
  // Portrait: one column up to three (cells at ~1.69:1, the photography is
  // ~1.65). Landscape: a row of up to three, then two rows.
  // Portrait: one column up to FOUR — four full-width rows give cells of
  // 2.25:1, which is almost exactly the 2.2:1 of the product photography, so
  // the lineup shows whole units rather than crops of their middles. A 2x2
  // grid on a 9:16 frame makes portrait cells and crops every landscape
  // photograph to a sliver of meter. Landscape: 2x2 for four (16:9 cells),
  // a row for up to three, three columns for five or six.
  const cols = canvas.portrait ? (n <= 4 ? 1 : 2) : n <= 3 ? n : n === 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const e = ease(p);
  const planeScale = interpolate(e, [0, 1], [1.045, 1.0]);
  const planeX = interpolate(e, [0, 1], [-18, 18]);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: env === "light" ? GROUND.lightSink : GROUND.darkSink }}>
      <div
        style={{
          position: "absolute",
          inset: "-2.5%",
          transform: `translateX(${planeX}px) scale(${planeScale})`,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 10,
          willChange: "transform",
        }}
      >
        {list.map((a, i) => {
          const r = random(`${seed}-${i}`);
          const zoom = 1.0 + r * 0.03;
          const drift = Math.sin((f + i * 37) / 110) * 8;
          const acc = ACCENT[a.product];
          return (
            <div key={a.slug + i} style={{ position: "relative", overflow: "hidden" }}>
              <Img
                src={src(a)}
                style={{
                  position: "absolute", inset: 0, width: "100%", height: "100%",
                  objectFit: a.ar > 3.0 || a.alpha ? "contain" : "cover",
                  background: a.alpha ? GROUND.darkLift : "transparent",
                  transform: `translateY(${drift}px) scale(${zoom})`,
                  willChange: "transform",
                }}
              />
              {/* graded down with a flat overlay rather than a filter */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(4,4,6,0.22)" }} />
              {labels ? (
                <>
                  <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, width: 14, background: acc.glow }} />
                  <div style={{ position: "absolute", left: 170, top: 66, fontFamily: FONT.display, fontSize: 92 * canvas.scale, letterSpacing: 7, color: acc.glow, textShadow: "0 6px 14px rgba(0,0,0,0.94), 0 0 8px rgba(0,0,0,0.85)" }}>
                    {acc.short}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 76% 54% at 50% 44%, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.36) 70%, rgba(0,0,0,0.66) 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,6,9,0.55) 0%, rgba(6,6,9,0.08) 26%, rgba(6,6,9,0.26) 58%, rgba(6,6,9,0.8) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 38% at 50% 80%, ${accent.glow}18 0%, rgba(0,0,0,0) 70%)` }} />
    </div>
  );
};
