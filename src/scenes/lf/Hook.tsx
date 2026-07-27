import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box} from '../../components/Photo';
import {Display, Kicker, Body} from '../../components/Type';
import {Label} from '../../components/lf/LFType';
import {LFHead} from '../../components/lf/LFHead';
import {HeroBeats, Beat} from '../../components/lf/BeatCycle';
import {ChipRow} from '../../components/Bits';
import {C} from '../../lib/lf-theme';
import {ramp, pop, sceneIn, EASE_IN_OUT} from '../../lib/anim';
import {ImageName} from '../../lib/images';

/* --------------------------------------------------------------- H1 */
/* 300f/10s — chapter title card + CueMix 5 badge reveal (2 beats). */
export const H1: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const title = pop(f, 8, 15);
  const badge = pop(f, 90, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-black-hero" opacity={0.14} blur={64} tint="rgba(10,6,18,0.92)" />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 68% 54% at 50% 42%, rgba(179,107,232,0.20), rgba(0,0,0,0) 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 120,
          width: 1740,
          textAlign: 'center',
          opacity: Math.min(1, title * 1.4),
          transform: `translateY(${(1 - title) * 26}px)`,
        }}
      >
        <Kicker color={C.cue} size={26}>
          CHAPTER ONE
        </Kicker>
        <Display size={120} color={C.ink} align="center" style={{marginTop: 14}}>
          THE SHARED THREAD
        </Display>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 760,
          top: 300,
          width: 400,
          height: 400,
          opacity: Math.min(1, badge * 1.4),
          transform: `scale(${0.75 + badge * 0.25})`,
        }}
      >
        <Photo
          name="cuemix-badge"
          box={{l: 0, t: 0, w: 400, h: 400}}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(179,107,232,0.5)"
        />
      </div>
      <div style={{position: 'absolute', left: 460, top: 730, width: 1000, textAlign: 'center', opacity: ramp(f, [110, 130], [0, 1])}}>
        <Body size={26} align="center">
          Both interfaces run on the same DSP mixing engine — CueMix 5.
        </Body>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- H2 */
/* 420f/14s — mixer cross-cut, zero-latency explainer (3 beats). */
const H2_BEATS: Beat[] = [
  {
    img: 'ul-cuemix-home',
    fit: 'contain',
    kicker: 'CUEMIX 5 · ULTRALITE-mk5',
    headline: 'ONE APP, BOTH MACHINES',
    body: 'The same control surface drives every input, every bus, on either interface — a mixer that lives in the hardware, not on your computer.',
    dur: 150,
  },
  {
    img: 'e8-cuemix-home',
    fit: 'contain',
    kicker: 'CUEMIX 5 · 828',
    headline: 'ZERO-LATENCY MONITORING',
    body: 'Because the mix happens on the device itself, performers hear themselves the instant they play — whatever buffer size your DAW is set to.',
    dur: 150,
  },
  {
    img: 'e8-mixer',
    fit: 'contain',
    kicker: 'ON-BOARD DSP',
    headline: 'A REAL MIXING CONSOLE, INSIDE',
    body: 'Full channel strips, buses and cue sends — the kind of control that used to require a separate mixing desk.',
    dur: 120,
  },
];
export const H2: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="ul-mixer" opacity={0.12} blur={64} tint="rgba(10,6,18,0.92)" />
    <LFHead kicker="CUEMIX 5 · SHARED FOUNDATION" accent={C.cue} right="ON-BOARD DSP" />
    <HeroBeats beats={H2_BEATS} accent={C.cue} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- H3 */
/* 420f/14s — FX processing tour, 2x2 grid with two cell swaps (3 beats). */
const CELLS: {box: Box; a: ImageName; la: string; b?: ImageName; lb?: string; at?: number}[] = [
  {box: {l: 90, t: 190, w: 850, h: 320}, a: 'ul-fx-gate', la: 'GATE + COMPRESSOR', b: 'e8-fx-gate', lb: 'GATE + COMPRESSOR', at: 150},
  {box: {l: 980, t: 190, w: 850, h: 320}, a: 'ul-fx-eq', la: '4-BAND PARAMETRIC EQ', b: 'e8-fx-eq', lb: 'PER-CHANNEL EQ', at: 240},
  {box: {l: 90, t: 540, w: 850, h: 320}, a: 'ul-fx-reverb', la: 'CLASSIC REVERB', b: 'e8-fx-reverb', lb: 'CLASSIC REVERB', at: 195},
  {box: {l: 980, t: 540, w: 850, h: 320}, a: 'e8-mixer-phones', la: 'PER-CHANNEL SENDS'},
];
export const H3: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 74% 56% at 50% 50%, rgba(179,107,232,0.13), rgba(0,0,0,0) 74%)'}} />
      <LFHead kicker="PROCESSING ON BOARD" accent={C.cue} right="NO PLUG-INS NEEDED" />
      <div style={{position: 'absolute', left: 90, top: 120, width: 1740}}>
        <Display size={64} color={C.ink}>
          FOUR PROCESSORS. EVERY CHANNEL.
        </Display>
      </div>
      {CELLS.map((c, idx) => {
        const swapped = c.b && c.at !== undefined && f >= c.at;
        const name = swapped ? (c.b as ImageName) : c.a;
        const label = swapped ? (c.lb as string) : c.la;
        const acc = swapped ? (name.startsWith('ul') ? C.ul : C.e8) : C.cue;
        const g = pop(f, 10 + idx * 6, 16);
        const sw = c.at !== undefined ? ramp(f, [c.at, c.at + 12], [0, 1]) : 1;
        return (
          <div key={idx} style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 22}px)`}}>
            {swapped ? (
              <>
                <Photo name={c.a} box={c.box} dur={dur} fit="contain" radius={16} border={`${C.cue}33`} bg="rgba(9,13,20,0.6)" />
                <Photo name={name} box={c.box} dur={dur} fit="contain" radius={16} border={`${acc}33`} bg="rgba(9,13,20,0.6)" opacity={sw} />
              </>
            ) : (
              <Photo name={name} box={c.box} dur={dur} fit="contain" radius={16} border={`${acc}33`} bg="rgba(9,13,20,0.6)" />
            )}
            <div
              style={{
                position: 'absolute',
                left: c.box.l + 16,
                top: c.box.t + c.box.h - 50,
                padding: '7px 15px',
                borderRadius: 9,
                background: 'rgba(4,6,10,0.82)',
                border: `1px solid ${acc}55`,
              }}
            >
              <Label size={18} color={acc} tracking={1.2}>
                {label}
              </Label>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- H4 */
/* 330f/11s — mobile control via iPad on both products (2 beats). */
const H4_BEATS: Beat[] = [
  {
    img: 'ul-ipad-cuemix',
    fit: 'contain',
    kicker: 'CUEMIX 5 · MOBILE',
    headline: 'MIX FROM WHERE YOU STAND',
    body: 'CueMix 5 runs on iPad and iPhone, so the monitor mix gets built right where the performer is — not hunched over a laptop.',
    dur: 175,
  },
  {
    img: 'e8-ipad-hand',
    fit: 'contain',
    kicker: 'CUEMIX 5 · MOBILE',
    headline: 'THE SAME CONTROL, WIRELESS',
    body: 'Every fader, every send, every effect — reachable over Wi-Fi from a tablet, on either interface.',
    dur: 155,
  },
];
export const H4: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="ul-ipad-cuemix" opacity={0.14} blur={62} tint="rgba(10,6,18,0.9)" />
    <LFHead kicker="CUEMIX 5 · SHARED FOUNDATION" accent={C.cue} right="iPad / iPhone" />
    <HeroBeats beats={H4_BEATS} accent={C.cue} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- H5 */
/* 330f/11s — transition line into the two product chapters (1 beat). */
export const H5: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const g = pop(f, 6, 15);
  const g2 = ramp(f, [40, 60], [0, 1], EASE_IN_OUT);
  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <Photo name="ul-black-hero" box={{l: 0, t: 0, w: 960, h: 924}} dur={330} fit="cover" radius={0} border={null} kb={{z: [1.1, 1.02]}} />
      <Photo name="e8-black-hero" box={{l: 960, t: 0, w: 960, h: 924}} dur={330} fit="cover" radius={0} border={null} kb={{z: [1.02, 1.1]}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,6,10,0.35) 0%, rgba(4,6,10,0.8) 100%)'}} />
      <div
        style={{
          position: 'absolute',
          left: 958,
          top: 0,
          width: 4,
          height: 924,
          background: `linear-gradient(180deg, ${C.brand}00, ${C.brand}, ${C.brand}00)`,
        }}
      />
      <div style={{position: 'absolute', left: 90, top: 640, width: 1740, textAlign: 'center', opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 20}px)`}}>
        <Display size={82} color={C.ink} align="center">
          SAME FOUNDATION. DIFFERENT MACHINES.
        </Display>
      </div>
      <div style={{position: 'absolute', left: 90, top: 760, width: 1740, textAlign: 'center', opacity: g2}}>
        <ChipRow items={['ULTRALITE-mk5 — PORTABLE', '828 — THE ROOM']} accent={C.brand} justify="center" size={22} />
      </div>
    </AbsoluteFill>
  );
};
