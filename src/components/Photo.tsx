import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {img, ImageName} from '../lib/images';
import {kenBurns} from '../lib/anim';
import {C} from '../lib/theme';

export type Box = {l: number; t: number; w: number; h: number};

export type KB = {z?: [number, number]; x?: [number, number]; y?: [number, number]};

/**
 * A clipped, optionally Ken-Burns-animated image placed in square coordinates
 * (0..1080 on both axes). Always renders inside <Square>, which clips again.
 */
export const Photo: React.FC<{
  name: ImageName;
  box: Box;
  dur: number;
  fit?: 'cover' | 'contain';
  kb?: KB;
  radius?: number;
  opacity?: number;
  border?: string | null;
  shade?: boolean;
  pad?: number;
  bg?: string;
  glow?: string | null;
  rotate?: number;
  scale?: number;
  style?: React.CSSProperties;
}> = ({
  name,
  box,
  dur,
  fit = 'cover',
  kb,
  radius = 18,
  opacity = 1,
  border = 'rgba(255,255,255,0.10)',
  shade = false,
  pad = 0,
  bg,
  glow = null,
  rotate = 0,
  scale = 1,
  style,
}) => {
  const f = useCurrentFrame();
  const z = kb?.z ?? (fit === 'cover' ? [1.07, 1.15] : [1, 1]);
  const t = kenBurns(f, dur, z, kb?.x ?? [0, 0], kb?.y ?? [0, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: box.l,
        top: box.t,
        width: box.w,
        height: box.h,
        borderRadius: radius,
        overflow: 'hidden',
        opacity,
        backgroundColor: bg ?? (fit === 'contain' ? 'transparent' : C.panel),
        border: border ? `1px solid ${border}` : undefined,
        boxShadow: glow
          ? `0 0 60px -8px ${glow}, 0 24px 60px -20px rgba(0,0,0,0.9)`
          : '0 24px 60px -20px rgba(0,0,0,0.85)',
        transform: `rotate(${rotate}deg) scale(${scale})`,
        ...style,
      }}
    >
      <Img
        src={img(name)}
        style={{
          width: `calc(100% - ${pad * 2}px)`,
          height: `calc(100% - ${pad * 2}px)`,
          marginLeft: pad,
          marginTop: pad,
          objectFit: fit,
          transform: t,
          transformOrigin: 'center center',
          display: 'block',
        }}
      />
      {shade ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(4,6,10,0.62) 0%, rgba(4,6,10,0.06) 34%, rgba(4,6,10,0.10) 62%, rgba(4,6,10,0.80) 100%)',
          }}
        />
      ) : null}
    </div>
  );
};

/** Blurred, desaturated fill used as an in-square backdrop behind composed layouts. */
export const PhotoBackdrop: React.FC<{
  name: ImageName;
  opacity?: number;
  blur?: number;
  scale?: number;
  tint?: string;
}> = ({name, opacity = 0.30, blur = 46, scale = 1.25, tint = 'rgba(5,8,13,0.72)'}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
    <Img
      src={img(name)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: `blur(${blur}px) saturate(0.7)`,
        transform: `scale(${scale})`,
        opacity,
        display: 'block',
      }}
    />
    <div style={{position: 'absolute', inset: 0, backgroundColor: tint}} />
  </div>
);

/**
 * Directional clip-path reveal. Spans the full square by default so the
 * percentage clip resolves against a real 1080x1080 box — a zero-size
 * wrapper would clip its children away entirely.
 */
export const Reveal: React.FC<{
  p: number; // 0..1
  dir?: 'l' | 'r' | 'u' | 'd';
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({p, dir = 'l', children, style}) => {
  const v = Math.max(0, Math.min(1, p));
  const off = (1 - v) * 100;
  const clip =
    dir === 'l'
      ? `inset(0 ${off}% 0 0)`
      : dir === 'r'
        ? `inset(0 0 0 ${off}%)`
        : dir === 'u'
          ? `inset(${off}% 0 0 0)`
          : `inset(0 0 ${off}% 0)`;
  return (
    <div style={{position: 'absolute', inset: 0, clipPath: clip, ...style}}>{children}</div>
  );
};

/**
 * Beat-driven image slot: holds the outgoing image underneath while the
 * incoming one fades over it, so a beat change never flashes to black.
 */
export const CrossPhoto: React.FC<{
  names: ImageName[];
  i: number;
  local: number;
  box: Box;
  dur: number;
  fade?: number;
  fit?: 'cover' | 'contain';
  kbAt?: (i: number) => KB;
  radius?: number;
  border?: string | null;
  shade?: boolean;
  bg?: string;
  glow?: string | null;
}> = ({names, i, local, box, dur, fade = 12, kbAt, ...rest}) => {
  const prev = i > 0 ? names[i - 1] : null;
  const g = prev ? Math.max(0, Math.min(1, local / fade)) : 1;
  return (
    <>
      {prev && g < 1 ? (
        <Photo key={`prev-${i}`} name={prev} box={box} dur={dur} kb={kbAt?.(i - 1)} {...rest} />
      ) : null}
      <Photo
        key={`cur-${i}`}
        name={names[i]}
        box={box}
        dur={dur}
        kb={kbAt?.(i)}
        opacity={g}
        {...rest}
      />
    </>
  );
};
