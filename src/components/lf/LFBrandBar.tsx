import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F2, SAFE_MARGIN_X, lfSceneStart, LF_TOTAL_FRAMES} from '../../lib/lf-theme';
import {CONTACT, BRAND} from '../../lib/copy';
import {ramp} from '../../lib/anim';

/**
 * Persistent corner lockup — a small, single-line brand + rotating contact
 * strip pinned to the very top edge (y 18-42), well clear of every scene's
 * own LFHead row (which starts at t=64) and far above the reserved caption
 * band (y >= 924). Carries the "weave in contact details across the
 * runtime" requirement continuously, distinct from the full outro block.
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

const SLOT = 210; // frames per contact item (7s)
const FADE = 14;

// Hide during the outro's own dedicated contact wall so it doesn't compete.
const HIDE_FROM = lfSceneStart('OU4');
const HIDE_UNTIL = LF_TOTAL_FRAMES;

export const LFBrandBar: React.FC = () => {
  const f = useCurrentFrame();

  const gIn = ramp(f, [20, 44], [0, 1]);
  const inWindow = f >= HIDE_FROM && f < HIDE_UNTIL;
  const gOut = inWindow ? 0 : 1;
  const vis = Math.min(gIn, gOut);
  if (vis <= 0.001) return null;

  const idx = Math.floor(f / SLOT) % ROTATION.length;
  const local = f % SLOT;
  const itemOpacity = Math.min(
    ramp(local, [0, FADE], [0, 1]),
    ramp(local, [SLOT - FADE, SLOT], [1, 0]),
  );

  return (
    <div
      style={{
        position: 'absolute',
        right: SAFE_MARGIN_X,
        top: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: vis,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: F2.label,
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: 2.2,
          color: C.inkSoft,
          whiteSpace: 'nowrap',
        }}
      >
        {BRAND.dealer}
      </span>
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: 99,
          background: C.gold,
          boxShadow: `0 0 8px 2px ${C.gold}99`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: F2.label,
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 0.4,
          color: C.gold,
          opacity: itemOpacity,
          whiteSpace: 'nowrap',
        }}
      >
        {ROTATION[idx]}
      </span>
    </div>
  );
};
