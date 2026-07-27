import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box, CrossPhoto} from '../components/Photo';
import {Display, Kicker, Body, Mono} from '../components/Type';
import {SceneHead, ChipRow, Rule} from '../components/Bits';
import {SquareEdge} from '../components/Frame';
import {C, F} from '../lib/theme';
import {ramp, pop, sceneIn, EASE_IN_OUT} from '../lib/anim';
import {ImageName} from '../lib/images';

const cross = (f: number, at: number, len = 14) => ramp(f, [at, at + len], [0, 1], EASE_IN_OUT);

/* ------------------------------------------------------------------ S03 */
/* 180f · 6s — CueMix 5 named as the one deliberate commonality. */

export const S03: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const p = cross(f, 100, 18); // badge travel
  const pA = 1 - cross(f, 84, 14); // phase A leaves first
  const pB = cross(f, 104, 16); // phase B arrives after
  const badge = pop(f, 2, 16);

  // badge travels from hero position to a small mark at the top
  const bl = 340 + (470 - 340) * p;
  const bt = 178 + (86 - 178) * p;
  const bs = 400 + (140 - 400) * p;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-black-hero" opacity={0.18} blur={60} tint="rgba(6,6,14,0.86)" />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 58% 46% at 50% 38%, rgba(179,107,232,0.20), rgba(0,0,0,0) 68%)',
        }}
      />
      <SceneHead kicker="THE SHARED THREAD" accent={C.cue} right="CUEMIX 5 DSP" delay={2} />

      <div
        style={{
          position: 'absolute',
          left: bl,
          top: bt,
          width: bs,
          height: bs,
          opacity: Math.min(1, badge * 1.4),
          transform: `scale(${0.7 + badge * 0.3})`,
        }}
      >
        <Photo
          name="cuemix-badge"
          box={{l: 0, t: 0, w: bs, h: bs}}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(179,107,232,0.45)"
        />
      </div>

      {/* phase A copy */}
      <div style={{position: 'absolute', left: 56, top: 606, width: 968, opacity: pA}}>
        <Display size={126} color={C.ink} align="center">
          CUEMIX 5
        </Display>
        <Body size={29} align="center" style={{marginTop: 18}}>
          The same hardware DSP mixer runs on both interfaces —
          <br />
          the one thing they deliberately share.
        </Body>
      </div>

      {/* phase B — both HOME pages side by side */}
      <div style={{position: 'absolute', inset: 0, opacity: pB}}>
        <Photo
          name="ul-cuemix-home"
          box={{l: 52, t: 268, w: 476, h: 458}}
          dur={dur}
          fit="contain"
          radius={16}
          bg="rgba(10,14,22,0.72)"
          border="rgba(47,212,200,0.30)"
        />
        <Photo
          name="e8-cuemix-home"
          box={{l: 552, t: 268, w: 476, h: 458}}
          dur={dur}
          fit="contain"
          radius={16}
          bg="rgba(10,14,22,0.72)"
          border="rgba(255,138,61,0.30)"
        />
        <div style={{position: 'absolute', left: 52, top: 744, width: 476, textAlign: 'center'}}>
          <Kicker color={C.ul} size={20}>
            ULTRALITE-mk5
          </Kicker>
        </div>
        <div style={{position: 'absolute', left: 552, top: 744, width: 476, textAlign: 'center'}}>
          <Kicker color={C.e8} size={20}>
            828
          </Kicker>
        </div>
        <div style={{position: 'absolute', left: 56, top: 812, width: 968}}>
          <Body size={27} align="center" color={C.inkSoft}>
            One app. One workflow. Two very different machines underneath.
          </Body>
        </div>
      </div>
      <SquareEdge color={C.cue} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S04 */
/* 180f · 6s — the mixer itself. Three beats, main image swaps each time. */

const S04_BEATS: {main: ImageName; a: ImageName; b: ImageName; head: string; note: string}[] = [
  {
    main: 'ul-mixer',
    a: 'e8-mixer',
    b: 'e8-mixer-phones',
    head: '48-CHANNEL MIXER',
    note: 'Every input, every bus — mixed in the interface, not the computer.',
  },
  {
    main: 'e8-mixer',
    a: 'e8-mixer-phones',
    b: 'ul-mixer',
    head: 'ZERO-LATENCY MONITORING',
    note: 'Performers hear themselves instantly, whatever the buffer size.',
  },
  {
    main: 'e8-mixer-phones',
    a: 'ul-mixer',
    b: 'e8-mixer',
    head: 'INDEPENDENT CUE MIXES',
    note: 'Separate headphone blends, built and stored on the hardware.',
  },
];

export const S04: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const i = Math.min(2, Math.floor(f / 60));
  const local = f - i * 60;
  const beat = S04_BEATS[i];
  const g = ramp(local, [0, 14], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name={beat.main} opacity={0.22} blur={58} tint="rgba(7,8,16,0.88)" />
      <SceneHead kicker="CUEMIX 5 · SHARED" accent={C.cue} right="ON-BOARD DSP" delay={2} />

      <div style={{transform: `translateY(${(1 - g) * 12}px)`}}>
        <CrossPhoto
          names={S04_BEATS.map((x) => x.main)}
          i={i}
          local={local}
          fade={13}
          box={{l: 56, t: 132, w: 700, h: 404}}
          dur={60}
          kbAt={() => ({z: [1.04, 1.12], x: [-1.5, 1.5]})}
          radius={14}
          border={`${C.cue}44`}
        />
        <CrossPhoto
          names={S04_BEATS.map((x) => x.a)}
          i={i}
          local={local}
          fade={13}
          box={{l: 780, t: 132, w: 244, h: 194}}
          dur={60}
          kbAt={() => ({z: [1.10, 1.02]})}
          radius={12}
          border="rgba(255,255,255,0.12)"
        />
        <CrossPhoto
          names={S04_BEATS.map((x) => x.b)}
          i={i}
          local={local}
          fade={13}
          box={{l: 780, t: 342, w: 244, h: 194}}
          dur={60}
          kbAt={() => ({z: [1.02, 1.10]})}
          radius={12}
          border="rgba(255,255,255,0.12)"
        />
      </div>

      <Rule box={{l: 56, t: 584, w: 968}} accent={C.cue} delay={i * 60 + 6} h={2} dur={22} />

      <div
        key={`t${i}`}
        style={{
          position: 'absolute',
          left: 56,
          top: 618,
          width: 968,
          opacity: ramp(local, [0, 9], [0, 1]),
          transform: `translateY(${(1 - ramp(local, [0, 12], [0, 1])) * 18}px)`,
        }}
      >
        <Display size={84} color={C.ink}>
          {beat.head}
        </Display>
        <Body size={29} style={{marginTop: 16, width: 900}}>
          {beat.note}
        </Body>
      </div>

      <ChipRow
        items={['EQ', 'GATE', 'COMPRESSOR', 'REVERB', 'STORED ON DEVICE']}
        accent={C.cue}
        delay={22}
        per={4}
        size={20}
        style={{position: 'absolute', left: 56, top: 862, width: 968}}
      />
      <SquareEdge color={C.cue} opacity={0.5} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S05 */
/* 150f · 5s — the four processors, 2x2, cells swapping mid-scene. */

const CELLS: {
  box: Box;
  a: ImageName;
  la: string;
  b?: ImageName;
  lb?: string;
  at?: number;
  accent: string;
}[] = [
  {
    box: {l: 52, t: 214, w: 476, h: 296},
    a: 'ul-fx-gate',
    la: 'GATE + COMPRESSOR',
    b: 'e8-fx-gate',
    lb: 'GATE + COMPRESSOR',
    at: 64,
    accent: C.ul,
  },
  {box: {l: 552, t: 214, w: 476, h: 296}, a: 'ul-fx-eq', la: '4-BAND PARAMETRIC EQ', accent: C.ul},
  {
    box: {l: 52, t: 534, w: 476, h: 296},
    a: 'ul-fx-reverb',
    la: 'CLASSIC REVERB',
    b: 'e8-fx-reverb',
    lb: 'CLASSIC REVERB',
    at: 82,
    accent: C.ul,
  },
  {box: {l: 552, t: 534, w: 476, h: 296}, a: 'e8-fx-eq', la: 'PER-CHANNEL EQ', accent: C.e8},
];

export const S05: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 70% 54% at 50% 50%, rgba(179,107,232,0.14), rgba(0,0,0,0) 72%)',
        }}
      />
      <SceneHead kicker="PROCESSING ON BOARD" accent={C.cue} right="NO PLUG-INS NEEDED" delay={2} />

      <div style={{position: 'absolute', left: 56, top: 118, width: 968}}>
        <Display size={72} color={C.ink}>
          FOUR PROCESSORS. EVERY CHANNEL.
        </Display>
      </div>

      {CELLS.map((c, i) => {
        const swapped = c.b && c.at !== undefined && f >= c.at;
        const name = swapped ? (c.b as ImageName) : c.a;
        const label = swapped ? (c.lb as string) : c.la;
        const acc = swapped ? (name.startsWith('ul') ? C.ul : C.e8) : c.accent;
        const g = pop(f, 2 + i * 3, 17);
        const sw = c.at !== undefined ? ramp(f, [c.at, c.at + 10], [0, 1]) : 1;
        return (
          <div
            key={i}
            style={{
              opacity: Math.min(1, g * 1.4),
              transform: `translateY(${(1 - g) * 22}px)`,
            }}
          >
            <div key={String(swapped)} style={{opacity: c.at !== undefined ? (swapped ? sw : 1) : 1}}>
              <Photo
                name={name}
                box={c.box}
                dur={dur}
                kb={{z: [1.03, 1.09]}}
                radius={14}
                border={`${acc}3D`}
              />
            </div>
            <div
              style={{
                position: 'absolute',
                left: c.box.l + 14,
                top: c.box.t + c.box.h - 42,
                padding: '6px 13px',
                borderRadius: 8,
                background: 'rgba(4,6,10,0.82)',
                border: `1px solid ${acc}55`,
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontWeight: 700,
                  fontSize: 17,
                  letterSpacing: 1.2,
                  color: acc,
                }}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: 56, top: 866, width: 968}}>
        <Body size={27} align="center">
          Run them live on the way in — the interface does the work.
        </Body>
      </div>
      <SquareEdge color={C.cue} opacity={0.5} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S06 */
/* 90f · 3s — CueMix 5 on iOS, closing the shared-thread act. */

export const S06: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const a = pop(f, 2, 16);
  const b = pop(f, 12, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="ul-ipad-cuemix" opacity={0.26} blur={56} tint="rgba(6,9,18,0.84)" />
      <SceneHead kicker="CUEMIX 5 · MOBILE" accent={C.cue} right="iPad / iPhone" delay={0} />

      <div style={{opacity: Math.min(1, a * 1.5), transform: `translateX(${(1 - a) * -40}px)`}}>
        <Photo
          name="ul-ipad-cuemix"
          box={{l: 52, t: 178, w: 476, h: 400}}
          dur={dur}
          kb={{z: [1.06, 1.14]}}
          radius={16}
          border={`${C.ul}44`}
        />
      </div>
      <div style={{opacity: Math.min(1, b * 1.5), transform: `translateX(${(1 - b) * 40}px)`}}>
        <Photo
          name="e8-ipad-hand"
          box={{l: 552, t: 178, w: 476, h: 400}}
          dur={dur}
          kb={{z: [1.14, 1.06]}}
          radius={16}
          border={`${C.e8}44`}
        />
      </div>

      <div style={{position: 'absolute', left: 56, top: 626, width: 968}}>
        <Display size={92} color={C.ink} align="center">
          MIX FROM THE ROOM
        </Display>
        <Body size={29} align="center" style={{marginTop: 18}}>
          CueMix 5 runs on iPad and iPhone, so the monitor mix
          <br />
          gets built where the player is standing.
        </Body>
        <div style={{marginTop: 26, display: 'flex', justifyContent: 'center'}}>
          <Mono size={21} color={C.cue} tracking={3}>
            SHARED BY BOTH INTERFACES
          </Mono>
        </div>
      </div>
      <SquareEdge color={C.cue} opacity={0.5} />
    </AbsoluteFill>
  );
};
