import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, useCurrentFrame } from "remotion";
import { COLORS, RADII, hexA } from "../theme";
import { img, meta, clip, clipMeta, type Ground } from "../assets";
import { EASE, ramp, mapClamp, gimbal, inOut } from "../lib/anim";
import { micro } from "../fonts";

/**
 * IMAGE TREATMENT — the rule this whole video exists to honour.
 *
 * `Plate` renders every real image with `object-fit: contain`, so the complete
 * product is always visible: nothing is ever permanently cropped, clipped or
 * trimmed to make it fit the runtime. Where an image's aspect ratio does not
 * match its slot, the difference is absorbed by ground treatment, never by
 * cutting into the subject.
 *
 * GROUND TREATMENT — a deliberate extension of the AVB vocabulary.
 * The AVB rule was light→bare / mixed→well / dark→card. Measured on corner
 * patches this library is 61 dark / 4 mixed / 4 light, so applying that rule
 * literally would turn 61 of 69 scenes into cards and flatten the film into a
 * slide deck. The measurement conflates two different things, so treatment is
 * chosen by what the image IS:
 *
 *   bare   full-bleed elevations and macros (rear-panel strips up to 11:1, TFT
 *          and OLED macros, jack detail) and genuinely light-ground renders.
 *          The hardware *is* the frame; a card around it would be nonsense.
 *   stage  dark-ground product PHOTOGRAPHY — a soft high-key light pool with a
 *          contact shadow, so a dark chassis reads as lit on a white sweep.
 *          This is Stage 5's "seamless light-grey or pure white" direction.
 *   card   screens and 2-D artwork (CueMix panels, DAW sessions, diagrams,
 *          badges, bundle art). A frame here is honest — these ARE screens.
 *   well   mixed-ground lifestyle, carried unchanged from AVB.
 */
export const Plate: React.FC<{
  idx: number;
  ground?: Ground | "auto";
  radius?: number;
  pad?: number;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ idx, ground = "auto", radius = RADII.card, pad, style, imgStyle, children }) => {
  const m = meta(idx);
  const kind: Ground = ground === "auto" ? m.ground : ground;
  const padding = pad ?? (kind === "bare" ? 0 : kind === "stage" ? 30 : kind === "well" ? 20 : 26);

  const shell: React.CSSProperties =
    kind === "card"
      ? {
          background: COLORS.paperLift,
          border: `1px solid ${COLORS.line}`,
          borderRadius: radius,
          boxShadow: `0 18px 46px ${hexA(COLORS.ink, 0.13)}, 0 2px 8px ${COLORS.shadow}`,
        }
      : kind === "stage"
        ? {
            // A lit sweep, not a card: no border, no hard edge — a soft radial
            // pool that falls off into the page exactly as a large diffused
            // source above the hardware would.
            background:
              `radial-gradient(120% 100% at 50% 34%, ${COLORS.paperLift} 0%, ` +
              `${COLORS.paper} 46%, ${COLORS.paperEdge} 78%, ${hexA(COLORS.paperWell, 0.85)} 100%)`,
            borderRadius: radius,
          }
        : kind === "well"
          ? {
              background: hexA(COLORS.paperLift, 0.72),
              border: `1px solid ${hexA(COLORS.ink, 0.07)}`,
              borderRadius: radius,
            }
          : {};

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding,
        ...shell,
        ...style,
      }}
    >
      <Img
        src={img(idx)}
        style={{
          // max-* with auto sizing makes the ELEMENT box equal the CONTENT box.
          // That matters twice over: the complete unit is always visible and
          // never cropped (same guarantee `contain` gives, kept below as
          // belt-and-braces), and a radius or shadow now hugs the photograph
          // itself rather than an empty letterboxed rectangle around it.
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          objectFit: "contain", // <- the complete unit, always
          // A radius on `stage` as well as `card`: many photographs in this
          // library carry their own black ground, and a hard-cornered black
          // rectangle on a light page reads as a mistake rather than a choice.
          borderRadius: kind === "card" ? radius - 12 : kind === "stage" ? 18 : 0,
          // The contact shadow that seats a dark chassis on the lit sweep.
          boxShadow:
            kind === "stage"
              ? `0 24px 40px ${hexA(COLORS.ink, 0.22)}, 0 3px 10px ${hexA(COLORS.ink, 0.10)}`
              : undefined,
          ...imgStyle,
        }}
      />
      {children}
    </div>
  );
};

/** Gimbal micro-movement applied to an already-contained image. */
export const Gimbal: React.FC<{
  seed?: number;
  amount?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ seed = 0, amount = 1, children, style }) => {
  const frame = useCurrentFrame();
  const g = gimbal(frame, seed, amount);
  return (
    <div
      style={{
        transform: `translate(${g.x}px, ${g.y}px) scale(${g.scale}) rotate(${g.rot}deg)`,
        willChange: "transform",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * MACRO-TO-FULL-REVEAL (Section 4).
 *
 * Opens hard on a specific engineering detail with simulated shallow depth of
 * field, then glides back as focus expands until the complete, uncropped unit
 * is on screen, and holds with a slow continuing drift. The macro phase takes
 * ~35% of the beat and the reveal-and-hold ~65%, the ratio the reference
 * established. The macro phase is a deliberate camera move, not a crop: the
 * reveal always resolves to the entire product within the same beat.
 */
export const MacroReveal: React.FC<{
  idx: number;
  duration: number;
  fx?: number;
  fy?: number;
  macroScale?: number;
  macroRatio?: number;
  ground?: Ground | "auto";
  style?: React.CSSProperties;
}> = ({
  idx, duration, fx = 0.5, fy = 0.5,
  macroScale = 3.1, macroRatio = 0.35, ground = "auto", style,
}) => {
  const frame = useCurrentFrame();
  const macroEnd = Math.round(duration * macroRatio);
  const revealEnd = macroEnd + Math.round((duration - macroEnd) * 0.62);

  const scale =
    frame < macroEnd
      ? mapClamp(frame, [0, macroEnd], [macroScale, macroScale * 0.88], EASE.soft)
      : mapClamp(frame, [macroEnd, revealEnd], [macroScale * 0.88, 1], EASE.out);

  const settle = mapClamp(frame, [revealEnd, duration], [1, 0.988], EASE.linear);
  const finalScale = frame < macroEnd ? scale : Math.min(scale, 1) * (scale <= 1.001 ? settle : 1);

  const blur = mapClamp(frame, [0, macroEnd * 0.9], [5.5, 0], EASE.out);
  const g = gimbal(frame, idx, 0.8);

  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `translate(${g.x * 0.5}px, ${g.y * 0.5}px) scale(${finalScale})`,
          transformOrigin: `${fx * 100}% ${fy * 100}%`,
          willChange: "transform",
        }}
      >
        <Plate idx={idx} ground={ground} style={{ width: "100%", height: "100%" }} />
      </div>
      {blur > 0.05 ? (
        <AbsoluteFill
          style={{
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            maskImage: `radial-gradient(46% 46% at ${fx * 100}% ${fy * 100}%, transparent 0%, #000 100%)`,
            WebkitMaskImage: `radial-gradient(46% 46% at ${fx * 100}% ${fy * 100}%, transparent 0%, #000 100%)`,
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};

/**
 * PORT DENSITY SWEEP (Section 4). A slow horizontal tracking move along a
 * connector row at fixed height, focal plane rolling from jack to jack — built
 * for this library's rear-panel elevations, which run to 11:1.
 *
 * The sweep always resolves: the last ~30% pulls out to the complete unit, so
 * the full-and-legible rule holds inside the beat.
 */
export const PortSweep: React.FC<{
  idx: number;
  duration: number;
  zoom?: number;
  from?: number;
  to?: number;
  style?: React.CSSProperties;
}> = ({ idx, duration, zoom = 2.5, from = 0.08, to = 0.92, style }) => {
  const frame = useCurrentFrame();
  const sweepEnd = Math.round(duration * 0.7);

  const p = mapClamp(frame, [0, sweepEnd], [from, to], EASE.inOut);
  const scale = frame < sweepEnd ? zoom : mapClamp(frame, [sweepEnd, duration], [zoom, 1], EASE.out);
  const originX = frame < sweepEnd ? p : mapClamp(frame, [sweepEnd, duration], [p, 0.5], EASE.out);

  const roll = Math.abs(Math.sin(p * Math.PI * 5)) * 1.7;
  const blur = frame < sweepEnd ? roll : mapClamp(frame, [sweepEnd, duration], [roll, 0], EASE.out);

  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: `${originX * 100}% 50%`,
          willChange: "transform",
          filter: blur > 0.05 ? `blur(${blur}px)` : "none",
        }}
      >
        <Plate idx={idx} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

/** Slow directional glide for context stills. Scale stays ≤1.06 and the image
 *  remains `contain`, so the subject is never pushed out of frame. */
export const Drift: React.FC<{
  idx: number;
  duration: number;
  scaleFrom?: number;
  scaleTo?: number;
  panX?: number;
  panY?: number;
  ground?: Ground | "auto";
  style?: React.CSSProperties;
}> = ({ idx, duration, scaleFrom = 1.0, scaleTo = 1.05, panX = 0, panY = 0, ground = "auto", style }) => {
  const frame = useCurrentFrame();
  const p = mapClamp(frame, [0, duration], [0, 1], EASE.linear);
  const g = gimbal(frame, idx, 0.6);
  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", ...style }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform:
            `translate(${panX * p + g.x}px, ${panY * p + g.y}px) ` +
            `scale(${scaleFrom + (scaleTo - scaleFrom) * p})`,
          willChange: "transform",
        }}
      >
        <Plate idx={idx} ground={ground} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

/** Montage tile. Every image in a montage is still shown COMPLETE within its
 *  own tile — grouping shortens an image's screen time, it never crops it. */
export const MontageTile: React.FC<{
  idx: number;
  delay?: number;
  duration: number;
  label?: string;
  seed?: number;
  style?: React.CSSProperties;
}> = ({ idx, delay = 0, duration, label, seed = 0, style }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, delay, 18, EASE.out);
  const o = inOut(frame, duration, 18, 12);
  return (
    <div
      style={{
        position: "relative",
        minWidth: 0, minHeight: 0, width: "100%", height: "100%",
        overflow: "hidden",
        opacity: Math.min(t, o),
        transform: `translateY(${(1 - t) * 18}px)`,
        ...style,
      }}
    >
      <Gimbal seed={seed + idx} amount={0.55}>
        <Plate idx={idx} style={{ width: "100%", height: "100%" }} />
      </Gimbal>
      {label ? (
        <div
          style={{
            position: "absolute", left: 14, bottom: 12,
            ...micro(17, 700, "0.14em"),
            color: COLORS.slate,
            background: hexA(COLORS.paperLift, 0.92),
            padding: "6px 11px", borderRadius: 7,
            border: `1px solid ${COLORS.line}`,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};

/** Grid of fully-visible images for honest overview passages. */
export const Montage: React.FC<{
  items: { idx: number; label?: string }[];
  duration: number;
  cols?: number;
  gap?: number;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ items, duration, cols, gap = 22, stagger = 5, style }) => {
  const c = cols ?? Math.min(items.length, 3);
  const rows = Math.ceil(items.length / c);
  return (
    <div
      style={{
        display: "grid",
        // minmax(0, ...) is load-bearing: a bare `1fr` track has an `auto`
        // minimum, so each row would grow to the intrinsic height of the image
        // inside it and overflow the frame.
        gridTemplateColumns: `repeat(${c}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        gap,
        width: "100%", height: "100%",
        ...style,
      }}
    >
      {items.map((it, i) => (
        <MontageTile
          key={`${it.idx}-${i}`}
          idx={it.idx}
          label={it.label}
          delay={i * stagger}
          duration={duration}
          seed={i * 3}
        />
      ))}
    </div>
  );
};

/**
 * REPRESENTATIONAL FOOTAGE (Section 0.3).
 *
 * Governed by a completely different and much looser rule than the real
 * photography above: these clips are raw, disposable editorial material. This
 * component therefore does things that would be forbidden for a real image —
 * it crops, it speed-ramps, it fills rather than contains.
 *
 * `trim` is the source in-point in seconds. `rate` is playback speed. Every
 * clip is muted: the two-layer audio architecture carries all sound.
 *
 * WATERMARK: every clip carried a generative sparkle glyph. It is removed at
 * source by tools/prep-clips.mjs (landscape loses its right 13%, portrait its
 * bottom 14%) rather than by a transform here, so the crop is deterministic and
 * verifiable — exactly the editorial freedom Section 0.3 grants this layer, and
 * applied to NO real product photograph anywhere.
 */
export const Clip: React.FC<{
  idx: number;
  trim?: number;
  rate?: number;
  grade?: "none" | "cool" | "warm" | "desat";
  fit?: "cover" | "contain";
  style?: React.CSSProperties;
}> = ({ idx, trim = 0, rate = 1, grade = "none", fit = "cover", style }) => {
  const c = clipMeta(idx);
  const filter =
    grade === "cool"
      ? "saturate(0.86) contrast(1.06) brightness(0.97) hue-rotate(-6deg)"
      : grade === "warm"
        ? "saturate(1.08) contrast(1.03) brightness(1.04) hue-rotate(4deg)"
        : grade === "desat"
          ? "saturate(0.55) contrast(1.05) brightness(1.02)"
          : undefined;


  return (
    <div style={{ position: "relative", overflow: "hidden", width: "100%", height: "100%", ...style }}>
      <OffthreadVideo
        src={clip(idx)}
        startFrom={Math.round(trim * c.fps)}
        playbackRate={rate}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: fit,
          filter,
        }}
      />
    </div>
  );
};

/** A light scrim so type stays legible over representational footage.
 *  Section 8 requires contrast be verified per scene rather than assumed —
 *  this is the tool that makes the light-ground type system work over video. */
export const Scrim: React.FC<{
  from?: "left" | "bottom" | "top" | "full";
  strength?: number;
}> = ({ from = "left", strength = 0.9 }) => {
  const p = COLORS.paper;
  const g =
    from === "left"
      ? `linear-gradient(90deg, ${hexA(p, strength)} 0%, ${hexA(p, strength * 0.94)} 30%, ${hexA(p, 0)} 60%)`
      : from === "bottom"
        ? `linear-gradient(0deg, ${hexA(p, strength)} 0%, ${hexA(p, strength * 0.9)} 26%, ${hexA(p, 0)} 62%)`
        : from === "top"
          ? `linear-gradient(180deg, ${hexA(p, strength)} 0%, ${hexA(p, strength * 0.9)} 26%, ${hexA(p, 0)} 62%)`
          : hexA(p, strength);
  return <AbsoluteFill style={{ background: g, pointerEvents: "none" }} />;
};
