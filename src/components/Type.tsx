import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F} from '../lib/theme';
import {ramp, pop, stag} from '../lib/anim';

/** Big condensed headline. Auto-fits by explicit size — never wraps unexpectedly. */
export const Display: React.FC<{
  children: React.ReactNode;
  size?: number;
  weight?: 600 | 700 | 800;
  color?: string;
  lh?: number;
  tracking?: number;
  align?: 'left' | 'center' | 'right';
  caps?: boolean;
  style?: React.CSSProperties;
}> = ({
  children,
  size = 96,
  weight = 800,
  color = C.ink,
  lh = 0.92,
  tracking = -0.5,
  align = 'left',
  caps = true,
  style,
}) => (
  <div
    style={{
      fontFamily: F.display,
      fontWeight: weight,
      fontSize: size,
      lineHeight: lh,
      letterSpacing: tracking,
      color,
      textAlign: align,
      textTransform: caps ? 'uppercase' : 'none',
      textShadow: '0 4px 28px rgba(0,0,0,0.72)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small all-caps eyebrow/kicker. */
export const Kicker: React.FC<{
  children: React.ReactNode;
  color?: string;
  size?: number;
  weight?: 600 | 700 | 800;
  style?: React.CSSProperties;
}> = ({children, color = C.inkDim, size = 21, weight = 700, style}) => (
  <div
    style={{
      fontFamily: F.ui,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: 3.6,
      textTransform: 'uppercase',
      color,
      textShadow: '0 2px 14px rgba(0,0,0,0.7)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Body / supporting sentence. */
export const Body: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: 400 | 500 | 600 | 700;
  lh?: number;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}> = ({children, size = 27, color = C.inkSoft, weight = 500, lh = 1.35, align = 'left', style}) => (
  <div
    style={{
      fontFamily: F.ui,
      fontWeight: weight,
      fontSize: size,
      lineHeight: lh,
      color,
      textAlign: align,
      letterSpacing: 0.1,
      textShadow: '0 2px 16px rgba(0,0,0,0.75)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Technical / numeric mono text. */
export const Mono: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: 500 | 700;
  tracking?: number;
  style?: React.CSSProperties;
}> = ({children, size = 22, color = C.inkDim, weight = 500, tracking = 1.4, style}) => (
  <div
    style={{
      fontFamily: F.mono,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: tracking,
      color,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Word-by-word kinetic headline. */
export const KineticLine: React.FC<{
  text: string;
  size?: number;
  color?: string;
  weight?: 600 | 700 | 800;
  delay?: number;
  per?: number;
  gap?: number;
  align?: 'left' | 'center' | 'right';
  highlight?: {word: number; color: string}[];
  style?: React.CSSProperties;
}> = ({
  text,
  size = 92,
  color = C.ink,
  weight = 800,
  delay = 0,
  per = 3.5,
  gap = 16,
  align = 'left',
  highlight = [],
  style,
}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const hl = new Map(highlight.map((h) => [h.word, h.color]));
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${gap * 0.35}px ${gap}px`,
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        ...style,
      }}
    >
      {words.map((w, i) => {
        const s = pop(f, stag(i, per, delay), 15);
        return (
          <span
            key={i}
            style={{
              fontFamily: F.display,
              fontWeight: weight,
              fontSize: size,
              lineHeight: 0.95,
              letterSpacing: -0.5,
              textTransform: 'uppercase',
              color: hl.get(i) ?? color,
              display: 'inline-block',
              transform: `translateY(${(1 - s) * 34}px)`,
              opacity: Math.min(1, s * 1.5),
              textShadow: '0 4px 26px rgba(0,0,0,0.75)',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Odometer-style number that counts up then holds. */
export const CountUp: React.FC<{
  to: number;
  dur: number;
  decimals?: number;
  size?: number;
  color?: string;
  suffix?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({to, dur, decimals = 0, size = 130, color = C.ink, suffix = '', delay = 0, style}) => {
  const f = useCurrentFrame();
  const v = ramp(f, [delay, delay + dur], [0, to]);
  return (
    <div
      style={{
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.9,
        color,
        letterSpacing: -1,
        fontVariantNumeric: 'tabular-nums',
        textShadow: '0 4px 30px rgba(0,0,0,0.8)',
        ...style,
      }}
    >
      {v.toFixed(decimals)}
      {suffix ? <span style={{fontSize: size * 0.42, marginLeft: 8}}>{suffix}</span> : null}
    </div>
  );
};
