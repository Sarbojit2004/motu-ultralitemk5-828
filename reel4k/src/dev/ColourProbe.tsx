import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Plate} from '../elements/Plate';
import {IMAGES} from '../data/images';
import {lifeOf} from '../elements/life';
import {WIDTH, HEIGHT} from '../lib/grid';

/**
 * Development-only harness for the colour-fidelity requirement (master brief S4).
 *
 * It renders one product image through the very same `Plate` component the reel
 * uses, at native aspect, with no world, type, scrap or vignette behind or in
 * front of it. `tools/colour_check.py` then compares the result against the
 * source file: if `Plate` applied any duotone, posterisation, grade or tint,
 * the comparison would show it.
 */
export const ColourProbe: React.FC<{slug: string}> = ({slug}) => {
  const meta = IMAGES[slug] ?? IMAGES.e828_21j;
  const w = WIDTH;
  const h = (w * meta.h) / meta.w;
  return (
    <AbsoluteFill style={{backgroundColor: '#808080'}}>
      <Plate
        slug={meta.slug}
        cx={WIDTH / 2}
        cy={HEIGHT / 2}
        w={w}
        h={h}
        rot={0}
        life={lifeOf(1, 0, 10)}
        from="none"
        to="none"
        tear={0}
        pad={0}
        shadow={0}
        ownZoom={0}
        ownDrift={[0, 0]}
      />
    </AbsoluteFill>
  );
};
