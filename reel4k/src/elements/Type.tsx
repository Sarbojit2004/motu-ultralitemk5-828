import React from 'react';
import {staticFile} from 'remotion';
import {C, F} from '../lib/theme';
import {mulberry32, hash, tornPolygon} from '../lib/rng';
import {lifeOf, resolveTransform, Dir, Life} from './life';

const distressStyle = (seed: string, scale = 780): React.CSSProperties => {
  const r = mulberry32(hash(seed));
  const mx = Math.round(r() * scale);
  const my = Math.round(r() * scale);
  const url = `url(${staticFile('tex/distress.png')})`;
  return {
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskSize: `${scale}px ${scale}px`,
    maskSize: `${scale}px ${scale}px`,
    WebkitMaskRepeat: 'repeat',
    maskRepeat: 'repeat',
    WebkitMaskPosition: `${mx}px ${my}px`,
    maskPosition: `${mx}px ${my}px`,
  };
};

export type HeadlineProps = {
  text: string;
  /** Local beat time within the shot. */
  lb: number;
  inAt: number;
  outAt: number;
  x: number;
  y: number;
  size: number;
  font?: keyof typeof F;
  color?: string;
  align?: 'left' | 'center' | 'right';
  rot?: number;
  split?: 'word' | 'letter' | 'none';
  /** Beats between successive words/letters arriving. */
  stagger?: number;
  from?: Dir;
  to?: Dir;
  dist?: number;
  slab?: string;
  slabPad?: [number, number];
  tracking?: number;
  lineHeight?: number;
  width?: number;
  distress?: boolean;
  italic?: number;
  zIndex?: number;
};

/**
 * Display type, set as independent pieces.
 *
 * Words (or letters) each carry their own life, so a headline assembles and
 * disassembles piece by piece instead of appearing and vanishing as one block.
 * Combined with the never-settling drift in `useTransform`, a held headline is
 * still in motion for every frame it is on screen.
 */
export const Headline: React.FC<HeadlineProps> = ({
  text, lb, inAt, outAt, x, y, size, font = 'display', color = C.ink,
  align = 'left', rot = 0, split = 'word', stagger = 0.1, from = 'b', to = 't',
  dist = 260, slab, slabPad = [size * 0.16, size * 0.06], tracking = -0.01,
  lineHeight = 0.86, width, distress = true, italic = 0, zIndex,
}) => {
  const parts = split === 'none' ? [text] : split === 'letter' ? Array.from(text) : text.split(' ');
  const anyAlive = parts.some((_, i) => lb >= inAt + i * stagger - 0.02 && lb < outAt + i * stagger * 0.4 + 0.4);
  if (!anyAlive) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width ?? 'auto',
        transform: `rotate(${rot}deg)`,
        transformOrigin: align === 'center' ? '50% 50%' : align === 'right' ? '100% 50%' : '0% 50%',
        display: 'flex',
        flexWrap: 'wrap',
        gap: split === 'letter' ? 0 : `${size * 0.02}px ${size * 0.24}px`,
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        zIndex,
        pointerEvents: 'none',
      }}
    >
      {parts.map((p, i) => (
        <Piece
          key={i}
          text={p}
          lb={lb}
          inAt={inAt + i * stagger}
          outAt={outAt + i * stagger * 0.35}
          size={size}
          font={font}
          color={color}
          from={from}
          to={to}
          dist={dist}
          slab={slab}
          slabPad={slabPad}
          tracking={tracking}
          lineHeight={lineHeight}
          distress={distress}
          italic={italic}
          seed={`${text}-${i}-${x}`}
        />
      ))}
    </div>
  );
};

const Piece: React.FC<{
  text: string; lb: number; inAt: number; outAt: number; size: number;
  font: keyof typeof F; color: string; from: Dir; to: Dir; dist: number;
  slab?: string; slabPad: [number, number]; tracking: number; lineHeight: number;
  distress: boolean; italic: number; seed: string;
}> = ({text, lb, inAt, outAt, size, font, color, from, to, dist, slab, slabPad, tracking, lineHeight, distress, italic, seed}) => {
  const life = lifeOf(lb, inAt, outAt, 0.42, 0.32);
  if (!life.alive) return null;
  const t = resolveTransform(life, seed, {from, to, dist, ownZoom: 0.028, ownRot: 0});
  return (
    <span
      style={{
        display: 'inline-block',
        transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${t.r.toFixed(3)}deg) scale(${t.s.toFixed(4)}) skewX(${-italic}deg)`,
        opacity: t.opacity,
        background: slab,
        padding: slab ? `${slabPad[1]}px ${slabPad[0]}px` : undefined,
        fontFamily: F[font],
        fontSize: size,
        lineHeight,
        color,
        letterSpacing: `${tracking}em`,
        textTransform: 'uppercase',
        whiteSpace: 'pre',
        willChange: 'transform, opacity',
        ...(distress ? distressStyle(seed, Math.max(420, size * 2.4)) : {}),
      }}
    >
      {text}
    </span>
  );
};

/** A flat colour scrap of torn paper - the collage's accent shapes. */
export const Scrap: React.FC<{
  life: Life; cx: number; cy: number; w: number; h: number; color?: string;
  rot?: number; seed: string; from?: Dir; to?: Dir; tear?: number; opacity?: number;
  distress?: boolean;
}> = ({life, cx, cy, w, h, color = C.red, rot = 0, seed, from = 'l', to = 'r', tear = 3.2, opacity = 1, distress = true}) => {
  if (!life.alive) return null;
  const t = resolveTransform(life, seed, {from, to, dist: 420, ownZoom: 0.06});
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        background: color,
        clipPath: tornPolygon(seed, tear, 10),
        transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${(rot + t.r).toFixed(3)}deg) scale(${t.s.toFixed(4)})`,
        transformOrigin: '50% 50%',
        opacity: t.opacity * opacity,
        willChange: 'transform, opacity',
        ...(distress ? distressStyle(seed + 'd', 900) : {}),
      }}
    />
  );
};

/**
 * A small label that punches in beside a physical detail, with a leader rule
 * running back to the thing it names. Callouts sit on the nearest parallax
 * plane, so they travel furthest as the camera moves.
 */
export const Callout: React.FC<{
  text: string; life: Life; x: number; y: number; size?: number;
  color?: string; bg?: string; rot?: number; leader?: number; leaderDir?: -1 | 1;
  seed: string; from?: Dir;
}> = ({text, life, x, y, size = 46, color = C.paper, bg = C.ink, rot = 0, leader = 220, leaderDir = 1, seed, from = 'l'}) => {
  if (!life.alive) return null;
  const t = resolveTransform(life, seed, {from, to: 'zo', dist: 200, ownZoom: 0.03});
  const grow = Math.min(1, life.enter * 1.4) * (1 - life.exit);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${(rot + t.r * 0.4).toFixed(3)}deg)`,
        transformOrigin: '0% 50%',
        opacity: t.opacity,
        display: 'flex',
        alignItems: 'center',
        flexDirection: leaderDir === 1 ? 'row' : 'row-reverse',
        gap: 0,
        willChange: 'transform, opacity',
      }}
    >
      <div
        style={{
          height: 5,
          width: leader * grow,
          background: bg,
          transformOrigin: leaderDir === 1 ? '0% 50%' : '100% 50%',
        }}
      />
      <div
        style={{
          background: bg,
          color,
          fontFamily: F.label,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: '0.14em',
          padding: `${size * 0.22}px ${size * 0.42}px`,
          textTransform: 'uppercase',
          whiteSpace: 'pre',
          transform: `scale(${(0.86 + 0.14 * grow).toFixed(3)})`,
          ...distressStyle(seed + 'c', 640),
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** Reference-style starburst accent. */
export const Star: React.FC<{
  life: Life; cx: number; cy: number; r: number; color?: string; seed: string; spin?: number;
}> = ({life, cx, cy, r, color = C.ink, seed, spin = 14}) => {
  if (!life.alive) return null;
  const t = resolveTransform(life, seed, {from: 'z', to: 'zo', dist: 120, ownZoom: 0.1});
  const pts: string[] = [];
  const rr = mulberry32(hash(seed));
  const n = 11;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * (0.44 + rr() * 0.16);
    pts.push(`${(50 + (Math.cos(a) * rad) / (r * 2) * 100).toFixed(2)}% ${(50 + (Math.sin(a) * rad) / (r * 2) * 100).toFixed(2)}%`);
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        background: color,
        clipPath: `polygon(${pts.join(',')})`,
        transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${(t.r + spin * life.age).toFixed(3)}deg) scale(${t.s.toFixed(4)})`,
        transformOrigin: '50% 50%',
        opacity: t.opacity,
      }}
    />
  );
};

/** Thin rule used to underline or strike through a composition. */
export const Rule: React.FC<{
  life: Life; x: number; y: number; w: number; h?: number; color?: string; rot?: number; seed: string;
}> = ({life, x, y, w, h = 8, color = C.ink, rot = 0, seed}) => {
  if (!life.alive) return null;
  const t = resolveTransform(life, seed, {from: 'l', to: 'r', dist: 300, ownZoom: 0.02});
  const grow = Math.min(1, life.enter * 1.25);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w * grow,
        height: h,
        background: color,
        transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${rot}deg)`,
        transformOrigin: '0% 50%',
        opacity: t.opacity,
      }}
    />
  );
};
