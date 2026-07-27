import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F} from '../lib/theme';
import {ramp, pop, stag, EASE_OUT} from '../lib/anim';
import {Kicker, Mono} from './Type';

/** Rounded dark card used to group content. */
export const Panel: React.FC<{
  box: {l: number; t: number; w: number; h: number};
  accent?: string;
  p?: number;
  radius?: number;
  fill?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({box, accent, p = 0, radius = 20, fill = 'rgba(13,19,28,0.86)', children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: box.l,
      top: box.t,
      width: box.w,
      height: box.h,
      borderRadius: radius,
      background: fill,
      border: `1px solid ${accent ? `${accent}44` : C.line}`,
      boxShadow: '0 20px 50px -24px rgba(0,0,0,0.9)',
      padding: p,
      boxSizing: 'border-box',
      backdropFilter: 'blur(6px)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Mono spec chip. */
export const Chip: React.FC<{
  label: string;
  accent: string;
  delay?: number;
  size?: number;
  solid?: boolean;
}> = ({label, accent, delay = 0, size = 21, solid = false}) => {
  const f = useCurrentFrame();
  const s = pop(f, delay, 16);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: `${size * 0.42}px ${size * 0.78}px`,
        borderRadius: 999,
        background: solid ? accent : `${accent}1F`,
        border: `1px solid ${solid ? accent : `${accent}66`}`,
        transform: `translateY(${(1 - s) * 20}px) scale(${0.94 + s * 0.06})`,
        opacity: Math.min(1, s * 1.6),
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: solid ? '#0A0D12' : accent,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: 1.2,
          color: solid ? '#0A0D12' : C.ink,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const ChipRow: React.FC<{
  items: string[];
  accent: string;
  delay?: number;
  per?: number;
  size?: number;
  gap?: number;
  justify?: 'flex-start' | 'center';
  style?: React.CSSProperties;
}> = ({items, accent, delay = 0, per = 5, size = 21, gap = 12, justify = 'flex-start', style}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', gap, justifyContent: justify, ...style}}>
    {items.map((t, i) => (
      <Chip key={t} label={t} accent={accent} delay={stag(i, per, delay)} size={size} />
    ))}
  </div>
);

/**
 * Annotation pin for panel elevations: dot + leader line + label.
 * `side` says which way the leader runs from the anchor point.
 */
export const Callout: React.FC<{
  x: number;
  y: number;
  len: number;
  label: string;
  sub?: string;
  accent: string;
  side: 'up' | 'down';
  delay?: number;
  align?: 'left' | 'center' | 'right';
  width?: number;
}> = ({x, y, len, label, sub, accent, side, delay = 0, align = 'center', width = 250}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [delay, delay + 12], [0, 1], EASE_OUT);
  const g2 = ramp(f, [delay + 8, delay + 22], [0, 1], EASE_OUT);
  const dir = side === 'up' ? -1 : 1;
  const labelTop = side === 'up' ? y - len - 62 : y + len + 8;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, opacity: g}}>
      <div
        style={{
          position: 'absolute',
          left: x - 5,
          top: y - 5,
          width: 10,
          height: 10,
          borderRadius: 99,
          background: accent,
          boxShadow: `0 0 16px 3px ${accent}AA`,
          transform: `scale(${g})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - 1,
          top: side === 'up' ? y - len * g : y,
          width: 2,
          height: len * g,
          background: `linear-gradient(${side === 'up' ? 0 : 180}deg, ${accent}00, ${accent})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: x - width / 2,
          top: labelTop + dir * (1 - g2) * 10,
          width,
          textAlign: align,
          opacity: g2,
        }}
      >
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 800,
            fontSize: 23,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: C.ink,
            textShadow: '0 2px 14px rgba(0,0,0,0.9)',
            lineHeight: 1.15,
          }}
        >
          {label}
        </div>
        {sub ? (
          <div
            style={{
              fontFamily: F.mono,
              fontWeight: 500,
              fontSize: 18,
              letterSpacing: 0.8,
              color: accent,
              marginTop: 3,
              textShadow: '0 2px 12px rgba(0,0,0,0.9)',
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Animated hairline rule. */
export const Rule: React.FC<{
  box: {l: number; t: number; w: number};
  accent: string;
  delay?: number;
  h?: number;
  dur?: number;
}> = ({box, accent, delay = 0, h = 2, dur = 18}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [delay, delay + dur], [0, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: box.l,
        top: box.t,
        width: box.w * g,
        height: h,
        background: `linear-gradient(90deg, ${accent}, ${accent}22)`,
      }}
    />
  );
};

/** Section eyebrow used at the top of most scenes. */
export const SceneHead: React.FC<{
  kicker: string;
  accent: string;
  right?: string;
  t?: number;
  delay?: number;
}> = ({kicker, accent, right, t = 56, delay = 0}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [delay, delay + 14], [0, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: t,
        width: 968,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: g,
        transform: `translateX(${(1 - g) * -18}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 13}}>
        <div style={{width: 30, height: 4, background: accent, borderRadius: 9}} />
        <Kicker color={accent} size={22}>
          {kicker}
        </Kicker>
      </div>
      {right ? <Mono size={19} color={C.inkDim}>{right}</Mono> : null}
    </div>
  );
};

/** Vertical stat block: big number + unit + caption. */
export const Stat: React.FC<{
  value: string;
  unit?: string;
  caption: string;
  accent: string;
  delay?: number;
  size?: number;
  align?: 'left' | 'center';
}> = ({value, unit, caption, accent, delay = 0, size = 78, align = 'left'}) => {
  const f = useCurrentFrame();
  const s = pop(f, delay, 15);
  return (
    <div
      style={{
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 22}px)`,
        textAlign: align,
      }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.88,
          color: C.ink,
          letterSpacing: -1,
        }}
      >
        {value}
        {unit ? (
          <span style={{fontSize: size * 0.4, color: accent, marginLeft: 7}}>{unit}</span>
        ) : null}
      </div>
      <div
        style={{
          fontFamily: F.ui,
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: 2.4,
          textTransform: 'uppercase',
          color: C.inkDim,
          marginTop: 9,
        }}
      >
        {caption}
      </div>
    </div>
  );
};
