import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box} from '../components/Photo';
import {Display, Kicker, Mono} from '../components/Type';
import {Rule, Panel} from '../components/Bits';
import {SquareEdge} from '../components/Frame';
import {C, F} from '../lib/theme';
import {ramp, pop, sceneIn, EASE_IN_OUT} from '../lib/anim';
import {ImageName} from '../lib/images';
import {BRAND} from '../lib/copy';

const FULL: Box = {l: 0, t: 0, w: 1080, h: 1080};

/* ------------------------------------------------------------------ S01 */
/* 180f · 6s — strobe montage. A new image every 18 frames (0.6s): the
   changeover itself is the hook. Three factual title beats ride on top. */

const S01_SHOTS: {n: ImageName; z: [number, number]; x: [number, number]}[] = [
  // 0-60f — UltraLite-mk5, under the "40 CHANNELS" title
  {n: 'ul-black-hero', z: [1.30, 1.14], x: [4, -2]},
  {n: 'ul-desk-hero', z: [1.28, 1.12], x: [-4, 2]},
  {n: 'ul-amp-guitar', z: [1.26, 1.10], x: [2, -4]},
  // 60-120f — 828, under the "60 CHANNELS" title
  {n: 'e8-black-hero', z: [1.12, 1.28], x: [-3, 3]},
  {n: 'e8-laptop-led', z: [1.10, 1.26], x: [3, -3]},
  {n: 'e8-guitar-vox', z: [1.12, 1.28], x: [-2, 4]},
  // 120-180f — both, under the shared "ONE DSP MIXER" title
  {n: 'ul-stack-laptop', z: [1.30, 1.14], x: [-3, 1]},
  {n: 'e8-macbook-rack', z: [1.10, 1.26], x: [4, -1]},
  {n: 'ul-wood-studio', z: [1.24, 1.10], x: [1, -3]},
];

const SLOT01 = 20;

export const S01: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const i = Math.min(S01_SHOTS.length - 1, Math.floor(f / SLOT01));
  const local = f - i * SLOT01;
  const shot = S01_SHOTS[i];
  const isUL = shot.n.startsWith('ul');
  const accent = isUL ? C.ul : C.e8;

  // hard cut + 3-frame light bloom
  const bloom = ramp(local, [0, 3], [0.55, 0]);
  const shift = ramp(local, [0, 6], [14, 0]);

  const beats = [
    {from: 0, to: 60, text: '40 CHANNELS', col: C.ul, sub: 'ULTRALITE-mk5'},
    {from: 60, to: 120, text: '60 CHANNELS', col: C.e8, sub: '828'},
    {from: 120, to: dur, text: 'ONE DSP MIXER', col: C.cue, sub: 'CUEMIX 5'},
  ];
  const beat = beats.find((b) => f >= b.from && f < b.to) ?? beats[2];
  const bl = f - beat.from;

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: sceneIn(f, 14)}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shift}px)`}}>
        <Photo
          key={i}
          name={shot.n}
          box={FULL}
          dur={SLOT01 + 8}
          kb={{z: shot.z, x: shot.x}}
          radius={0}
          border={null}
          shade
        />
      </div>
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(4,6,10,0.80) 0%, rgba(4,6,10,0.18) 30%, rgba(4,6,10,0.30) 58%, rgba(4,6,10,0.92) 100%)`,
        }}
      />
      <AbsoluteFill style={{backgroundColor: '#DCEBFF', opacity: bloom, mixBlendMode: 'screen'}} />

      {/* progress ticks — one per shot */}
      <div style={{position: 'absolute', left: 56, top: 74, display: 'flex', gap: 7}}>
        {S01_SHOTS.map((_, k) => (
          <div
            key={k}
            style={{
              width: 100,
              height: 3,
              borderRadius: 9,
              background: k < i ? `${accent}CC` : k === i ? accent : 'rgba(255,255,255,0.16)',
              opacity: k === i ? 1 : 0.8,
            }}
          />
        ))}
      </div>

      <div style={{position: 'absolute', left: 56, top: 720, width: 968}}>
        <div
          style={{
            opacity: Math.min(ramp(bl, [0, 8], [0, 1]), ramp(bl, [52, 60], [1, 0], EASE_IN_OUT)),
            transform: `translateY(${(1 - ramp(bl, [0, 12], [0, 1])) * 26}px)`,
          }}
        >
          <Kicker color={beat.col} size={24}>
            MOTU {beat.sub}
          </Kicker>
          <Display size={132} color={C.ink} style={{marginTop: 10}}>
            {beat.text}
          </Display>
        </div>
      </div>
      <SquareEdge color={accent} opacity={0.9} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S02 */
/* 240f · 8s — the two products named, then the distributor statement. */

export const S02: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const a = pop(f, 4, 17); // UltraLite row
  const b = pop(f, 34, 17); // 828 row
  const c = ramp(f, [110, 132], [0, 1]);
  const out = sceneIn(f);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="ul-black-hero" opacity={0.24} blur={54} tint="rgba(5,8,13,0.80)" />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 62% 46% at 50% 42%, rgba(47,212,200,0.11), rgba(0,0,0,0) 70%),' +
            'radial-gradient(ellipse 62% 40% at 50% 78%, rgba(255,138,61,0.11), rgba(0,0,0,0) 70%)',
        }}
      />

      {/* ---- UltraLite-mk5 ---- */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          opacity: Math.min(1, a * 1.4),
          transform: `translateX(${(1 - a) * -70}px)`,
        }}
      >
        <Photo
          name="ul-render-34"
          box={{l: 190, t: 96, w: 700, h: 268}}
          dur={dur}
          fit="contain"
          kb={{z: [1.0, 1.05]}}
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.28)"
        />
        <div style={{position: 'absolute', left: 56, top: 372, width: 968, textAlign: 'center'}}>
          <Display size={64} color={C.ink}>
            MOTU ULTRALITE-mk5
          </Display>
          <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
            <Mono size={24} color={C.ul} tracking={4}>
              18 × 22 · 40 SIMULTANEOUS CHANNELS
            </Mono>
          </div>
        </div>
      </div>

      <Rule box={{l: 240, t: 468, w: 600}} accent={C.brand} delay={70} h={1} dur={26} />

      {/* ---- 828 ---- */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          opacity: Math.min(1, b * 1.4),
          transform: `translateX(${(1 - b) * 70}px)`,
        }}
      >
        <Photo
          name="e8-render-34b"
          box={{l: 130, t: 506, w: 820, h: 232}}
          dur={dur}
          fit="contain"
          kb={{z: [1.0, 1.05]}}
          radius={0}
          border={null}
          glow="rgba(255,138,61,0.26)"
        />
        <div style={{position: 'absolute', left: 56, top: 744, width: 968, textAlign: 'center'}}>
          <Display size={64} color={C.ink}>
            MOTU 828
          </Display>
          <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
            <Mono size={24} color={C.e8} tracking={4}>
              28 × 32 · 60 SIMULTANEOUS CHANNELS
            </Mono>
          </div>
        </div>
      </div>

      {/* ---- distributor statement ---- */}
      <Panel
        box={{l: 96, t: 862, w: 888, h: 108}}
        accent={C.brand}
        style={{
          opacity: c,
          transform: `translateY(${(1 - c) * 18}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 800,
            fontSize: 25,
            letterSpacing: 4.6,
            color: C.ink,
          }}
        >
          {BRAND.dealer}
        </div>
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: 2.6,
            color: C.brand,
          }}
        >
          {BRAND.distributor} · {BRAND.region}
        </div>
      </Panel>
      <SquareEdge color={C.brand} opacity={0.5} />
    </AbsoluteFill>
  );
};
