import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F, DEPTH} from '../lib/theme';
import {WIDTH} from '../lib/grid';
import {Layer} from '../camera/Camera';
import {resolveTransform} from './life';
import {ShotCtx} from '../shots/Shot';
import {CONTACT} from './Brand';

/**
 * The one light mid-reel branding touch: the Shivansh mark and the site set as
 * a strip in the lower band. It rides the nearest parallax plane and carries
 * its own entrance and drift, so it is never the single static element sitting
 * inside a moving composition (master brief S7).
 */
export const BrandStrip: React.FC<{ctx: ShotCtx; y?: number; inAt?: number; outAt?: number}> =
  ({ctx, y = 3320, inAt = 0.5, outAt}) => {
    const life = ctx.L(inAt, outAt ?? ctx.dur, 0.5, 0.35);
    if (!life.alive) return null;
    const t = resolveTransform(life, 'brandstrip', {from: 'r', to: 'r', dist: 420, ownZoom: 0.02});
    return (
      <Layer depth={DEPTH.callout}>
        <div
          style={{
            position: 'absolute', left: 0, top: y, width: WIDTH,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40,
            transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, 0) scale(${t.s.toFixed(4)})`,
            opacity: t.opacity,
          }}
        >
          <div style={{background: C.white, padding: 16, filter: 'drop-shadow(8px 12px 18px rgba(28,26,22,0.3))'}}>
            <Img src={staticFile('logo/logo_shivansh.png')} style={{width: 620, display: 'block'}} />
          </div>
          <span
            style={{
              fontFamily: F.label, fontWeight: 700, fontSize: 66, letterSpacing: '0.06em',
              color: C.paper, background: C.ink, padding: '16px 28px',
            }}
          >
            {CONTACT.site}
          </span>
        </div>
      </Layer>
    );
  };
