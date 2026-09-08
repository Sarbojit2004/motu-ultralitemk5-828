import React from 'react';
import {Img, staticFile} from 'remotion';
import {IMAGES} from '../data/images';
import {tornPolygon, mulberry32, hash} from '../lib/rng';
import {C} from '../lib/theme';
import {Life, resolveTransform, Dir} from './life';

export type PlateProps = {
  slug: string;
  /** Centre of the plate in canvas coordinates (2160 x 3840). */
  cx: number;
  cy: number;
  /** Width in canvas px. Height follows the image's own aspect unless `h` is set. */
  w: number;
  h?: number;
  rot?: number;
  life: Life;
  from?: Dir;
  to?: Dir;
  dist?: number;
  /** Torn-edge depth as a percentage of the box. 0 renders a clean rectangle. */
  tear?: number;
  /** White paper margin around a card, in px. */
  pad?: number;
  fit?: 'cover' | 'contain';
  /** Crop anchor for `cover`, 0..1 in image space. */
  anchor?: [number, number];
  ownZoom?: number;
  ownDrift?: [number, number];
  /** Force card treatment even for a cut-out PNG. */
  card?: boolean;
  shadow?: number;
};

/**
 * A single piece of product photography in the collage.
 *
 * COLOUR FIDELITY (master brief S4): the <Img> carries `filter: none` and no
 * blend mode, and nothing in this reel is ever composited on top of it. The
 * drop-shadow lives on the wrapper, where it adds a shadow behind the picture
 * without touching one pixel of the picture's own colour - the "soft edge
 * shadow" the brief explicitly permits, and nothing beyond it.
 */
export const Plate: React.FC<PlateProps> = ({
  slug, cx, cy, w, h, rot = 0, life, from = 'z', to = 'zo', dist = 380,
  tear, pad, fit = 'cover', anchor = [0.5, 0.5], ownZoom, ownDrift, card, shadow = 1,
}) => {
  const meta = IMAGES[slug];
  if (!meta) throw new Error(`Unknown image slug: ${slug}`);
  if (!life.alive) return null;

  const height = h ?? (w * meta.h) / meta.w;
  const t = resolveTransform(life, slug + cx, {from, to, dist, ownZoom, ownDrift});
  const asCard = card || !meta.cutout;
  const r = mulberry32(hash(slug + 'plate'));
  const padPx = pad ?? Math.round(w * 0.028 + 8);
  const tearAmt = tear ?? (asCard ? 1.5 + r() * 1.1 : 0);

  const shadowCss = `drop-shadow(${(18 * shadow).toFixed(0)}px ${(26 * shadow).toFixed(0)}px ${(30 * shadow).toFixed(0)}px rgba(28,26,22,0.34)) drop-shadow(0px ${(4 * shadow).toFixed(0)}px ${(8 * shadow).toFixed(0)}px rgba(28,26,22,0.24))`;

  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - height / 2,
        width: w,
        height,
        transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) rotate(${(rot + t.r).toFixed(3)}deg) scale(${t.s.toFixed(4)})`,
        transformOrigin: '50% 50%',
        opacity: t.opacity,
        willChange: 'transform, opacity',
      }}
    >
      <div style={{width: '100%', height: '100%', filter: shadowCss}}>
        {asCard ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: C.white,
              padding: padPx,
              boxSizing: 'border-box',
              clipPath: tearAmt > 0 ? tornPolygon(slug + 'edge', tearAmt, 11) : undefined,
            }}
          >
            <Img
              src={staticFile('img/' + meta.file)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: fit,
                objectPosition: `${(anchor[0] * 100).toFixed(1)}% ${(anchor[1] * 100).toFixed(1)}%`,
                display: 'block',
                filter: 'none',
              }}
            />
          </div>
        ) : (
          <Img
            src={staticFile('img/' + meta.file)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              filter: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
