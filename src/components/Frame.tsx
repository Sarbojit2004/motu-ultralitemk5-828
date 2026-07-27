import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, SQ, CANVAS} from '../lib/theme';

/**
 * HARD CENTRAL-SQUARE CONTRACT.
 *
 * The canvas is 1080x1920. The 1080x1080 square at y=420..1500 is the only
 * region that may carry content. `Square` clips to exactly that rect with
 * overflow:hidden, so no child — including shadows, glows and anything
 * mid-animation — can ever reach the top or bottom strip.
 *
 * `Strips` paints the whole frame underneath. It is completely STATIC: the
 * same pixels for all 5340 frames. No imagery, no text, no motion ever
 * appears outside the square.
 */

const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
       <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
       <feColorMatrix type="saturate" values="0"/></filter>
       <rect width="180" height="180" filter="url(#n)" opacity="0.42"/>
     </svg>`,
  );

export const Strips: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.void}}>
    {/* vertical base wash */}
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg,
          #05070C 0%, #080D16 16%, #0D1622 36%,
          #101B29 50%,
          #0D1622 64%, #080D16 84%, #05070C 100%)`,
      }}
    />
    {/* light appears to emanate from the content square (frame-centred) */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 96% 62% at 50% 50%,
          rgba(58,106,182,0.46) 0%, rgba(38,68,124,0.26) 42%,
          rgba(20,36,68,0.10) 66%, rgba(0,0,0,0) 84%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 58% 38% at 50% 50%,
          rgba(140,102,214,0.20) 0%, rgba(0,0,0,0) 74%)`,
      }}
    />
    {/* static film grain */}
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundSize: '180px 180px',
        opacity: 0.22,
        mixBlendMode: 'overlay',
      }}
    />
    {/* corner falloff so the strips read as a deliberate frame */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 92% 70% at 50% 50%,
          rgba(0,0,0,0) 34%, rgba(0,0,0,0.34) 72%, rgba(0,0,0,0.72) 100%)`,
      }}
    />
  </AbsoluteFill>
);

export const Square: React.FC<{children: React.ReactNode; bg?: string}> = ({
  children,
  bg = C.bg,
}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: SQ.top,
      width: SQ.size,
      height: SQ.size,
      overflow: 'hidden',
      backgroundColor: bg,
      isolation: 'isolate',
    }}
  >
    {children}
  </div>
);

/** Thin inner edge treatment, drawn INSIDE the square so the strips stay pure. */
export const SquareEdge: React.FC<{color: string; opacity?: number}> = ({
  color,
  opacity = 1,
}) => (
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity}}>
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        boxShadow: `inset 0 0 120px 8px rgba(0,0,0,0.55)`,
      }}
    />
  </div>
);

export const Frame: React.FC<{children: React.ReactNode; bg?: string}> = ({
  children,
  bg,
}) => (
  <AbsoluteFill style={{width: CANVAS.w, height: CANVAS.h, backgroundColor: C.void}}>
    <Strips />
    <Square bg={bg}>{children}</Square>
  </AbsoluteFill>
);
