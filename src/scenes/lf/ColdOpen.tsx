import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, Box} from '../../components/Photo';
import {Display, Kicker} from '../../components/Type';
import {Label} from '../../components/lf/LFType';
import {C} from '../../lib/lf-theme';
import {ramp, pop, sceneIn, EASE_IN_OUT} from '../../lib/anim';
import {ImageName} from '../../lib/images';
import {BRAND} from '../../lib/copy';

const FULL: Box = {l: 0, t: 0, w: 1920, h: 924};

const SHOTS: {n: ImageName; z: [number, number]; x: [number, number]}[] = [
  {n: 'ul-black-hero', z: [1.22, 1.06], x: [3, -2]},
  {n: 'e8-black-hero', z: [1.06, 1.20], x: [-3, 3]},
  {n: 'ul-desk-hero', z: [1.20, 1.06], x: [-3, 2]},
  {n: 'e8-laptop-led', z: [1.06, 1.18], x: [3, -3]},
  {n: 'ul-amp-guitar', z: [1.18, 1.06], x: [2, -3]},
  {n: 'e8-guitar-vox', z: [1.06, 1.20], x: [-2, 3]},
];
const SLOT = 55;

/* CO1 — 450f / 15s — 7 beats: 6 rapid full-bleed cuts + title hold. */
export const CO1: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const out = sceneIn(f, 14);
  const stripEnd = SHOTS.length * SLOT; // 330
  const inStrip = f < stripEnd;
  const i = Math.min(SHOTS.length - 1, Math.floor(f / SLOT));
  const local = f - i * SLOT;
  const shot = SHOTS[i];

  const bloom = ramp(local, [0, 3], [0.5, 0]);
  const titleLocal = f - stripEnd;
  const tg = ramp(titleLocal, [0, 16], [0, 1], EASE_IN_OUT);
  const tPop = pop(f, stripEnd + 4, 15);

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      {inStrip ? (
        <>
          <Photo
            key={i}
            name={shot.n}
            box={FULL}
            dur={SLOT + 8}
            kb={{z: shot.z, x: shot.x}}
            fit="cover"
            radius={0}
            border={null}
            shade
          />
          <AbsoluteFill
            style={{
              background:
                'linear-gradient(180deg, rgba(4,6,10,0.55) 0%, rgba(4,6,10,0.05) 30%, rgba(4,6,10,0.10) 60%, rgba(4,6,10,0.72) 100%)',
            }}
          />
          <AbsoluteFill style={{backgroundColor: '#DCEBFF', opacity: bloom, mixBlendMode: 'screen'}} />
          <div style={{position: 'absolute', left: 80, top: 60, display: 'flex', gap: 8}}>
            {SHOTS.map((_, k) => (
              <div
                key={k}
                style={{
                  width: 110,
                  height: 4,
                  borderRadius: 9,
                  background: k <= i ? `${C.brand}DD` : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <Photo
          name="e8-render-34a"
          box={FULL}
          dur={120}
          fit="cover"
          kb={{z: [1.04, 1.10]}}
          radius={0}
          border={null}
          shade
        />
      )}
      {!inStrip ? (
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(4,6,10,0.62) 0%, rgba(4,6,10,0.30) 40%, rgba(4,6,10,0.78) 100%)',
          }}
        />
      ) : null}

      {!inStrip ? (
        <div
          style={{
            position: 'absolute',
            left: 90,
            top: 340,
            width: 1740,
            opacity: tg,
            transform: `translateY(${(1 - tg) * 24}px)`,
          }}
        >
          <Kicker color={C.brand} size={26}>
            MOTU · TWO MACHINES, ONE DISTRIBUTOR
          </Kicker>
          <Display size={128} color={C.ink} style={{marginTop: 14}}>
            ULTRALITE-mk5 &amp; 828
          </Display>
          <div
            style={{
              marginTop: 22,
              opacity: Math.min(1, tPop * 1.4),
              transform: `translateY(${(1 - tPop) * 14}px)`,
            }}
          >
            <Label size={24} color={C.gold} tracking={2.4}>
              {BRAND.dealer} · {BRAND.distributor} · {BRAND.region}
            </Label>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
