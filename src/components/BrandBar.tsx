import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F, sceneStart} from '../lib/theme';
import {CONTACT, BRAND} from '../lib/copy';
import {ramp} from '../lib/anim';

/**
 * Persistent brand + rotating contact strip. Lives INSIDE the square, pinned to
 * its bottom 74px (square y 1006..1080 = canvas y 1426..1500). Every scene keeps
 * its content above y=990, so this never collides.
 *
 * The rotation is what weaves the full contact list through the runtime — each
 * detail surfaces multiple times across the 178 seconds.
 */

const ROTATION: string[] = [
  CONTACT.web,
  CONTACT.ig,
  CONTACT.phones[0],
  CONTACT.hub,
  CONTACT.yt,
  CONTACT.phones[1],
  CONTACT.fb,
  CONTACT.li,
  CONTACT.phones[2],
  CONTACT.th,
  CONTACT.x,
  CONTACT.waChannel,
];

const SLOT = 138; // frames per contact item (4.6s)
const FADE = 12;

// Hidden only where the scene itself is a full contact treatment.
const HIDE_FROM = sceneStart('S27');

export const BrandBar: React.FC<{accent: string}> = ({accent}) => {
  const f = useCurrentFrame();

  const gIn = ramp(f, [24, 44], [0, 1]);
  const gOut = ramp(f, [HIDE_FROM - 16, HIDE_FROM], [1, 0]);
  const vis = Math.min(gIn, gOut);
  if (vis <= 0.001) return null;

  const idx = Math.floor(f / SLOT) % ROTATION.length;
  const local = f % SLOT;
  const itemOpacity = Math.min(
    ramp(local, [0, FADE], [0, 1]),
    ramp(local, [SLOT - FADE, SLOT], [1, 0]),
  );
  const slide = (1 - ramp(local, [0, FADE], [0, 1])) * 12;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 1006,
        width: 1080,
        height: 74,
        opacity: vis,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 0,
          width: 968,
          height: 1,
          background: `linear-gradient(90deg, ${accent}00, ${accent}88, ${accent}22, ${accent}00)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: 74,
          background: 'linear-gradient(180deg, rgba(4,6,10,0) 0%, rgba(4,6,10,0.86) 62%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 22,
          width: 968,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 11}}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: accent,
              boxShadow: `0 0 12px 2px ${accent}99`,
            }}
          />
          <span
            style={{
              fontFamily: F.ui,
              fontWeight: 800,
              fontSize: 19,
              letterSpacing: 3.4,
              color: C.inkSoft,
            }}
          >
            {BRAND.dealer}
          </span>
          <span style={{color: C.line, fontSize: 15}}>|</span>
          <span
            style={{
              fontFamily: F.ui,
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 2.2,
              color: C.inkDim,
            }}
          >
            MOTU · EAST &amp; NORTH-EAST INDIA
          </span>
        </div>
        <span
          style={{
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: 0.6,
            color: accent,
            opacity: itemOpacity,
            transform: `translateY(${slide}px)`,
            display: 'inline-block',
          }}
        >
          {ROTATION[idx]}
        </span>
      </div>
    </div>
  );
};
