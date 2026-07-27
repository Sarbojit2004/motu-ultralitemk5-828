import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, CAPTION_BOX, LF_CANVAS, RESERVED_BAND_TOP} from '../../lib/lf-theme';

/**
 * LANDSCAPE FRAME CONTRACT — deliberately different from the reel's Frame.tsx.
 *
 * There is NO top/bottom exclusion strip here. The full 1920x1080 canvas is
 * usable content area, with exactly one reserved region: the caption band,
 * running from the caption box's top edge (y=924) to the bottom of the
 * screen (y=1080) — the full width, per the hard layout rule. Every scene
 * composes its content in y: 0..924.
 */

const GRAIN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
       <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
       <feColorMatrix type="saturate" values="0"/></filter>
       <rect width="180" height="180" filter="url(#n)" opacity="0.30"/>
     </svg>`,
  );

/** Ambient base — sits under every scene's own background treatment. */
export const LFBase: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.void}}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 90% 76% at 50% 42%,
          rgba(20,30,48,0.9) 0%, rgba(9,13,20,0.96) 62%, ${C.void} 100%)`,
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage: `url("${GRAIN}")`,
        backgroundSize: '180px 180px',
        opacity: 0.10,
        mixBlendMode: 'overlay',
      }}
    />
  </AbsoluteFill>
);

/** The persistent, empty caption placeholder box. Blank interior, neon outline. */
export const CaptionBox: React.FC<{accent?: string}> = ({accent = '#7FE7FF'}) => {
  const f = useCurrentFrame();
  const pulse = 0.55 + 0.15 * Math.sin(f / 40);
  return (
    <div
      style={{
        position: 'absolute',
        left: CAPTION_BOX.l,
        top: CAPTION_BOX.t,
        width: CAPTION_BOX.w,
        height: CAPTION_BOX.h,
        borderRadius: 20,
        border: `1.5px solid ${accent}`,
        boxShadow: `0 0 22px 1px ${accent}55, inset 0 0 18px 0px ${accent}22`,
        opacity: pulse,
        pointerEvents: 'none',
      }}
    />
  );
};

/**
 * Debug/visual guide only used during still-frame validation — a faint line
 * at the reserved-band boundary. Not part of the delivered composition.
 */
export const ReservedBandGuide: React.FC<{on?: boolean}> = ({on = false}) =>
  on ? (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: RESERVED_BAND_TOP,
        width: LF_CANVAS.w,
        height: 1,
        background: 'rgba(255,0,110,0.9)',
      }}
    />
  ) : null;

/** Persistent throughout — no fade-in/out, per the "persistent caption box" requirement. */
export const LFFrame: React.FC<{children: React.ReactNode; showGuide?: boolean}> = ({
  children,
  showGuide,
}) => (
  <AbsoluteFill style={{width: LF_CANVAS.w, height: LF_CANVAS.h, backgroundColor: C.void}}>
    <LFBase />
    <AbsoluteFill style={{overflow: 'hidden'}}>{children}</AbsoluteFill>
    <ReservedBandGuide on={showGuide} />
    <CaptionBox />
  </AbsoluteFill>
);
