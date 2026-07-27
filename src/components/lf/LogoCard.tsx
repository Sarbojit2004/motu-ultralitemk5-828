import React from 'react';
import {Img, useCurrentFrame} from 'remotion';
import {MOTU_LOGO, MOTU_LOGO_ASPECT, SHIVANSH_LOGO, SHIVANSH_LOGO_ASPECT} from '../../lib/logos';
import {pop} from '../../lib/anim';

/**
 * Clean card/plate treatment for a brand mark. Both logo files are white/
 * light artwork on transparent backgrounds, so the plate is dark — a light
 * plate would wash the marks out. Used for the required logo beats (Section
 * 9): price-recap cards, comparison chapter, and comprehensively in the outro.
 */
export const LogoCard: React.FC<{
  brand: 'motu' | 'shivansh';
  box: {l: number; t: number; w: number; h: number};
  accent: string;
  delay?: number;
  pad?: number;
}> = ({brand, box, accent, delay = 0, pad = 0.22}) => {
  const f = useCurrentFrame();
  const g = pop(f, delay, 16);
  const src = brand === 'motu' ? MOTU_LOGO : SHIVANSH_LOGO;
  const aspect = brand === 'motu' ? MOTU_LOGO_ASPECT : SHIVANSH_LOGO_ASPECT;

  const innerW = box.w * (1 - pad * 2);
  const innerH = box.h * (1 - pad * 2);
  let logoW = innerW;
  let logoH = logoW / aspect;
  if (logoH > innerH) {
    logoH = innerH;
    logoW = logoH * aspect;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: box.l,
        top: box.t,
        width: box.w,
        height: box.h,
        borderRadius: 22,
        background: 'linear-gradient(160deg, rgba(14,19,28,0.96), rgba(8,11,17,0.96))',
        border: `1.5px solid ${accent}66`,
        boxShadow: `0 0 60px -14px ${accent}AA, 0 20px 50px -24px rgba(0,0,0,0.9)`,
        opacity: Math.min(1, g * 1.4),
        transform: `translateY(${(1 - g) * 20}px) scale(${0.96 + g * 0.04})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Img
        src={src}
        style={{width: logoW, height: logoH, objectFit: 'contain', display: 'block'}}
      />
    </div>
  );
};
