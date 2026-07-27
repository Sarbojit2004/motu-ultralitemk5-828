import React from 'react';
import {C} from '../../lib/theme';
import {F2} from '../../lib/lf-theme';

// Re-export the reel's generic (non-square-bound) type primitives — they're
// already just fontFamily/size/color components with no layout assumptions.
export {Display, Kicker, Body, CountUp, KineticLine} from '../Type';

/**
 * Label — the long-form's substitute for the reel's <Mono>. Same call-site
 * ergonomics (small, tracked-out, technical-reading text) but built on
 * Inter with tabular figures rather than a third monospace face, per the
 * spec's "one display face, one label/body face" rule.
 */
export const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: 500 | 600 | 700 | 800;
  tracking?: number;
  style?: React.CSSProperties;
}> = ({children, size = 20, color = C.inkDim, weight = 700, tracking = 1.6, style}) => (
  <div
    style={{
      fontFamily: F2.label,
      fontWeight: weight,
      fontSize: size,
      letterSpacing: tracking,
      color,
      fontVariantNumeric: 'tabular-nums',
      ...style,
    }}
  >
    {children}
  </div>
);
