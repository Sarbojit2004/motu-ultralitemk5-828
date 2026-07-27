import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box, Reveal, CrossPhoto} from '../components/Photo';
import {Display, Kicker, Body, Mono, CountUp} from '../components/Type';
import {SceneHead, Panel, ChipRow, Rule, Callout, Stat} from '../components/Bits';
import {SquareEdge} from '../components/Frame';
import {C, F} from '../lib/theme';
import {ramp, pop, sceneIn, EASE_IN_OUT} from '../lib/anim';
import {ImageName} from '../lib/images';
import {CONTACT, BRAND} from '../lib/copy';

const FULL: Box = {l: 0, t: 0, w: 1080, h: 1080};
const A = C.ul;

/** Travelling highlight used on the flat panel elevations. */
const Sweep: React.FC<{box: Box; from: number; dur: number; color: string}> = ({
  box,
  from,
  dur,
  color,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, [from, from + dur], [-0.2, 1.2], EASE_IN_OUT);
  if (f < from || f > from + dur + 4) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: box.l + box.w * p - 60,
        top: box.t,
        width: 120,
        height: box.h,
        background: `linear-gradient(90deg, ${color}00, ${color}55, ${color}00)`,
        pointerEvents: 'none',
      }}
    />
  );
};

/* ------------------------------------------------------------------ S07 */
/* 180f · 6s — the UltraLite-mk5 arrives with its own identity. */

export const S07: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const pA = 1 - ramp(f, [88, 102], [0, 1], EASE_IN_OUT);
  const pB = ramp(f, [104, 122], [0, 1], EASE_IN_OUT);
  const t = pop(f, 6, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <div style={{opacity: pA}}>
        <Photo
          name="ul-black-hero"
          box={FULL}
          dur={dur}
          kb={{z: [1.20, 1.04], x: [3, -1], y: [1, -1]}}
          radius={0}
          border={null}
          shade
        />
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(4,6,10,0.72) 0%, rgba(4,6,10,0.10) 34%, rgba(4,6,10,0.55) 72%, rgba(4,6,10,0.95) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 636,
            width: 968,
            opacity: Math.min(1, t * 1.4),
            transform: `translateY(${(1 - t) * 40}px)`,
          }}
        >
          <Kicker color={A} size={24}>
            PART ONE
          </Kicker>
          <Display size={128} color={C.ink} style={{marginTop: 12}}>
            ULTRALITE
          </Display>
          <Display size={128} color={A} style={{marginTop: -6}}>
            mk5
          </Display>
          <Body size={30} style={{marginTop: 20, width: 900}}>
            Forty channels of MOTU I/O in a box you can carry in one hand.
          </Body>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: pB}}>
        <PhotoBackdrop name="ul-black-hero" opacity={0.26} blur={54} tint="rgba(5,10,14,0.86)" />
        <SceneHead kicker="MOTU ULTRALITE-mk5" accent={A} right="18 × 22" delay={104} />
        <Photo
          name="ul-render-top"
          box={{l: 70, t: 190, w: 940, h: 420}}
          dur={dur}
          fit="contain"
          kb={{z: [1.0, 1.07]}}
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.24)"
        />
        <Rule box={{l: 56, t: 664, w: 968}} accent={A} delay={118} dur={22} />
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 700,
            width: 968,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Stat value="18" caption="INPUTS" accent={A} delay={122} size={82} />
          <Stat value="22" caption="OUTPUTS" accent={A} delay={128} size={82} />
          <Stat value="40" caption="SIMULTANEOUS" accent={A} delay={134} size={82} />
          <Stat value="192" unit="kHz" caption="MAXIMUM" accent={A} delay={140} size={82} />
        </div>
        <ChipRow
          items={['HALF-RACK STEEL', 'USB-C', 'ESS SABRE32', 'STANDALONE']}
          accent={A}
          delay={134}
          per={5}
          size={21}
          justify="center"
          style={{position: 'absolute', left: 56, top: 862, width: 968}}
        />
      </div>
      <SquareEdge color={A} opacity={0.7} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S08 */
/* 180f · 6s — the case for its size. Three images, three claims. */

export const S08: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const a = pop(f, 2, 16);
  const b = pop(f, 16, 16);
  const c = pop(f, 30, 16);
  const swap = ramp(f, [104, 120], [0, 1], EASE_IN_OUT);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="ul-desk-hero" opacity={0.22} blur={56} tint="rgba(5,11,15,0.86)" />
      <SceneHead kicker="BUILT SMALL ON PURPOSE" accent={A} right="253 × 44 × 175 mm" delay={0} />

      <div style={{opacity: Math.min(1, a * 1.4), transform: `scale(${0.94 + a * 0.06})`}}>
        <Photo
          name="ul-render-front"
          box={{l: 60, t: 128, w: 620, h: 300}}
          dur={dur}
          fit="contain"
          kb={{z: [1.0, 1.06]}}
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.20)"
        />
      </div>
      <div style={{opacity: Math.min(1, b * 1.4), transform: `translateX(${(1 - b) * 40}px)`}}>
        <Photo
          name="ul-front-closeup"
          box={{l: 700, t: 128, w: 324, h: 140}}
          dur={dur}
          fit="contain"
          radius={10}
          bg="rgba(9,14,20,0.8)"
          border={`${A}44`}
        />
      </div>
      <div style={{opacity: Math.min(1, c * 1.4), transform: `translateX(${(1 - c) * 40}px)`}}>
        <Photo
          name="ul-desk-hero"
          box={{l: 700, t: 288, w: 324, h: 140}}
          dur={dur}
          kb={{z: [1.06, 1.16]}}
          radius={10}
          border="rgba(255,255,255,0.12)"
        />
      </div>

      <Rule box={{l: 56, t: 468, w: 968}} accent={A} delay={34} dur={20} />

      <div style={{position: 'absolute', left: 56, top: 504, width: 968, opacity: 1 - swap}}>
        <Display size={80} color={C.ink}>
          A DESK, A BACKPACK,
          <br />A STAGE FLOOR.
        </Display>
        <Body size={29} style={{marginTop: 20, width: 940}}>
          Half-rack aluminium and steel, roughly the footprint of a laptop —
          the whole 40-channel rig moves in one bag.
        </Body>
      </div>
      <div style={{position: 'absolute', left: 56, top: 504, width: 968, opacity: swap}}>
        <Display size={80} color={C.ink}>
          TWO MIC / LINE / INST
          <br />
          COMBO INPUTS.
        </Display>
        <Body size={29} style={{marginTop: 20, width: 940}}>
          Individual gain, switchable 48V phantom power and a 20 dB pad on
          each — set from the front panel or from CueMix 5.
        </Body>
      </div>

      <ChipRow
        items={['48V PHANTOM', '20 dB PAD', 'PER-CHANNEL GAIN', 'FRONT-PANEL LCD']}
        accent={A}
        delay={124}
        per={5}
        size={20}
        style={{position: 'absolute', left: 56, top: 880, width: 968}}
      />
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S09 */
/* 210f · 7s — annotated front-panel sweep. */

const S09_PINS: {x: number; label: string; sub: string; side: 'up' | 'down'; d: number}[] = [
  {x: 138, label: 'MIC / LINE / INST 1–2', sub: 'XLR-TRS COMBO', side: 'up', d: 26},
  {x: 372, label: 'GAIN · PAD · 48V', sub: 'PER CHANNEL', side: 'down', d: 52},
  {x: 560, label: 'HEADPHONES', sub: 'DEDICATED LEVEL', side: 'up', d: 78},
  {x: 700, label: 'MAIN VOLUME', sub: 'MONITOR CONTROL', side: 'down', d: 104},
  {x: 900, label: 'METERING LCD', sub: 'ALL I/O AT A GLANCE', side: 'up', d: 130},
];

export const S09: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const w = ramp(f, [0, 22], [0, 1]);
  const inset = pop(f, 138, 17);
  const panel: Box = {l: 20, t: 392, w: 1040, h: 205};

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 74% 40% at 50% 46%, rgba(47,212,200,0.13), rgba(0,0,0,0) 72%)',
        }}
      />
      <SceneHead kicker="FRONT PANEL" accent={A} right="ULTRALITE-mk5" delay={0} />
      <div style={{position: 'absolute', left: 56, top: 118, width: 968}}>
        <Display size={76} color={C.ink}>
          EVERYTHING YOU TOUCH,
          <br />
          UP FRONT.
        </Display>
      </div>

      <Reveal p={w} dir="l">
        <Photo
          name="ul-front-elev"
          box={panel}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.18)"
        />
      </Reveal>
      <Sweep box={panel} from={20} dur={46} color={A} />

      {S09_PINS.map((p) => (
        <Callout
          key={p.label}
          x={p.x}
          y={p.side === 'up' ? panel.t + 34 : panel.t + panel.h - 34}
          len={p.side === 'up' ? 62 : 54}
          label={p.label}
          sub={p.sub}
          accent={A}
          side={p.side}
          delay={p.d}
          width={244}
        />
      ))}

      <div
        style={{
          opacity: Math.min(1, inset * 1.4),
          transform: `translateY(${(1 - inset) * 26}px)`,
        }}
      >
        <Photo
          name="ul-front-closeup"
          box={{l: 596, t: 738, w: 428, h: 186}}
          dur={dur}
          fit="contain"
          radius={12}
          bg="rgba(8,13,19,0.9)"
          border={`${A}55`}
        />
        <div style={{position: 'absolute', left: 56, top: 748, width: 512}}>
          <Mono size={20} color={A} tracking={2.4}>
            CLASS-COMPLIANT USB-C
          </Mono>
          <Body size={26} style={{marginTop: 12}}>
            Gain, pad and phantom are all reachable without opening a menu —
            it behaves like a small console.
          </Body>
        </div>
      </div>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S10 */
/* 210f · 7s — annotated rear-panel sweep, the connectivity story. */

const S10_PINS: {x: number; label: string; sub: string; side: 'up' | 'down'; d: number}[] = [
  {x: 118, label: '15V DC', sub: 'EXTERNAL PSU', side: 'up', d: 22},
  {x: 232, label: 'USB-C', sub: 'MAC · PC · iOS', side: 'down', d: 40},
  {x: 372, label: 'OPTICAL', sub: '8-CH ADAT', side: 'up', d: 58},
  {x: 492, label: 'S/PDIF + MIDI', sub: 'RCA · 5-PIN DIN', side: 'down', d: 76},
  {x: 672, label: 'LINE OUT 1–8', sub: 'BALANCED TRS', side: 'up', d: 94},
  {x: 838, label: 'MAIN OUT', sub: 'STEREO MONITOR', side: 'down', d: 112},
  {x: 968, label: 'LINE IN', sub: '6 BALANCED TRS', side: 'up', d: 130},
];

export const S10: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const w = ramp(f, [0, 22], [0, 1]);
  const tail = ramp(f, [150, 168], [0, 1]);
  const panel: Box = {l: 20, t: 392, w: 1040, h: 205};

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="ul-stack-laptop" opacity={0.20} blur={58} tint="rgba(5,11,15,0.88)" />
      <SceneHead kicker="REAR PANEL" accent={A} right="18 IN · 22 OUT" delay={0} />
      <div style={{position: 'absolute', left: 56, top: 118, width: 968}}>
        <Display size={76} color={C.ink}>
          40 CHANNELS OUT
          <br />
          OF ONE SMALL BOX.
        </Display>
      </div>

      <Reveal p={w} dir="r">
        <Photo
          name="ul-rear-elev"
          box={panel}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.18)"
        />
      </Reveal>
      <Sweep box={panel} from={18} dur={52} color={A} />

      {S10_PINS.map((p) => (
        <Callout
          key={p.label}
          x={p.x}
          y={p.side === 'up' ? panel.t + 30 : panel.t + panel.h - 30}
          len={p.side === 'up' ? 58 : 48}
          label={p.label}
          sub={p.sub}
          accent={A}
          side={p.side}
          delay={p.d}
          width={196}
        />
      ))}

      <div style={{position: 'absolute', left: 56, top: 752, width: 968, opacity: tail}}>
        <Rule box={{l: 0, t: 0, w: 968}} accent={A} delay={150} dur={20} />
        <Body size={28} style={{marginTop: 26, width: 968}}>
          Eight balanced line outs plus a dedicated stereo main — so monitors,
          headphone amps and outboard all get their own feed.
        </Body>
      </div>
      <ChipRow
        items={['8 LINE OUT', 'STEREO MAIN', '8-CH ADAT', 'S/PDIF', 'MIDI I/O']}
        accent={A}
        delay={172}
        per={4}
        size={20}
        style={{position: 'absolute', left: 56, top: 886, width: 968}}
      />
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S11 */
/* 180f · 6s — plug an instrument straight in. Three lifestyle beats. */

const S11_BEATS: {n: ImageName; head: string; note: string}[] = [
  {
    n: 'ul-amp-guitar',
    head: 'GUITAR STRAIGHT IN',
    note: 'The combo inputs take an instrument-level signal directly — no DI box in the chain.',
  },
  {
    n: 'ul-guitarist',
    head: 'TRACK WHILE YOU PLAY',
    note: 'Hardware monitoring means what you hear is what your hands are doing, right now.',
  },
  {
    n: 'ul-wood-studio',
    head: 'A ROOM THIS SIZE',
    note: 'Synths, a mic and a pair of monitors — the UltraLite-mk5 is built for exactly this desk.',
  },
];

export const S11: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const i = Math.min(2, Math.floor(f / 60));
  const local = f - i * 60;
  const b = S11_BEATS[i];

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <CrossPhoto
        names={S11_BEATS.map((x) => x.n)}
        i={i}
        local={local}
        fade={13}
        box={FULL}
        dur={62}
        kbAt={(k) => ({z: [1.16, 1.03], x: [k % 2 ? 3 : -3, 0], y: [1, -1]})}
        radius={0}
        border={null}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(4,6,10,0.80) 0%, rgba(4,6,10,0.08) 32%, rgba(4,6,10,0.55) 66%, rgba(4,6,10,0.96) 100%)',
        }}
      />
      <SceneHead kicker="ULTRALITE-mk5 · IN USE" accent={A} right={`0${i + 1} / 03`} delay={0} />

      <div
        key={`t${i}`}
        style={{
          position: 'absolute',
          left: 56,
          top: 640,
          width: 968,
          opacity: ramp(local, [0, 9], [0, 1]),
          transform: `translateY(${(1 - ramp(local, [0, 12], [0, 1])) * 24}px)`,
        }}
      >
        <Display size={96} color={C.ink}>
          {b.head}
        </Display>
        <Body size={29} style={{marginTop: 20, width: 930}}>
          {b.note}
        </Body>
      </div>
      <SquareEdge color={A} opacity={0.7} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S12 */
/* 150f · 5s — iPad-native, the mk5's own trick. */

export const S12: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const a = pop(f, 2, 16);
  const b = pop(f, 22, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="ul-ipad-desk" opacity={0.28} blur={52} tint="rgba(6,12,18,0.82)" />
      <SceneHead kicker="NO COMPUTER REQUIRED" accent={A} right="CLASS COMPLIANT" delay={0} />

      <div style={{opacity: Math.min(1, a * 1.4), transform: `scale(${0.95 + a * 0.05})`}}>
        <Photo
          name="ul-ipad-desk"
          box={{l: 56, t: 132, w: 640, h: 400}}
          dur={dur}
          kb={{z: [1.04, 1.14], x: [-1, 2]}}
          radius={16}
          border={`${A}44`}
        />
      </div>
      <div style={{opacity: Math.min(1, b * 1.4), transform: `translateX(${(1 - b) * 44}px)`}}>
        <Photo
          name="ul-ipad-cuemix"
          box={{l: 720, t: 132, w: 304, h: 400}}
          dur={dur}
          kb={{z: [1.12, 1.02]}}
          radius={16}
          border={`${A}44`}
        />
      </div>

      <Rule box={{l: 56, t: 572, w: 968}} accent={A} delay={30} dur={20} />
      <div style={{position: 'absolute', left: 56, top: 608, width: 968}}>
        <Display size={92} color={C.ink} caps={false}>
          Works with iPad.
        </Display>
        <Body size={29} style={{marginTop: 20, width: 940}}>
          Class-compliant over USB-C, so an iPad sees it as an audio interface
          with no driver at all — and CueMix 5 runs right there beside it.
        </Body>
      </div>
      <ChipRow
        items={['USB-C', 'CLASS COMPLIANT', 'MAC', 'WINDOWS']}
        accent={A}
        delay={54}
        per={5}
        size={20}
        style={{position: 'absolute', left: 56, top: 880, width: 968}}
      />
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S13 */
/* 150f · 5s — latency figure + first big contact beat. */

export const S13: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const g = pop(f, 4, 16);
  const c = ramp(f, [76, 94], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 66% 44% at 50% 40%, rgba(47,212,200,0.16), rgba(0,0,0,0) 72%)',
        }}
      />
      <SceneHead kicker="ROUND-TRIP LATENCY" accent={A} right="96 kHz" delay={0} />

      <div style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 22}px)`}}>
        <Photo
          name="ul-latency"
          box={{l: 56, t: 124, w: 620, h: 350}}
          dur={dur}
          fit="contain"
          radius={14}
          bg="rgba(9,14,20,0.86)"
          border={`${A}3D`}
        />
        <Photo
          name="ul-render-34"
          box={{l: 700, t: 124, w: 324, h: 168}}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.18)"
        />
        <div style={{position: 'absolute', left: 700, top: 310, width: 324}}>
          <CountUp to={2.4} dur={44} decimals={1} delay={10} size={112} color={C.ink} suffix="ms" />
          <Mono size={19} color={A} tracking={2.4} style={{marginTop: 10}}>
            ANALOG IN → ANALOG OUT
          </Mono>
        </div>
      </div>

      <Rule box={{l: 56, t: 512, w: 968}} accent={A} delay={40} dur={20} />
      <div style={{position: 'absolute', left: 56, top: 546, width: 968}}>
        <Body size={29} style={{width: 940}}>
          Low enough that hardware monitoring is a choice, not a necessity.
        </Body>
      </div>

      {/* contact beat */}
      <Panel
        box={{l: 56, t: 636, w: 968, h: 330}}
        accent={A}
        p={30}
        style={{opacity: c, transform: `translateY(${(1 - c) * 20}px)`}}
      >
        <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 26, letterSpacing: 4.4, color: C.ink}}>
          {BRAND.dealer}
        </div>
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 600,
            fontSize: 19,
            letterSpacing: 2.4,
            color: A,
            marginTop: 8,
          }}
        >
          {BRAND.distributor} ({BRAND.motuFull})
        </div>
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 600,
            fontSize: 19,
            letterSpacing: 2.4,
            color: C.inkDim,
            marginTop: 4,
          }}
        >
          {BRAND.region}
        </div>
        <div style={{height: 1, background: C.line, margin: '22px 0 20px'}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 13}}>
          {[
            ['WEB', CONTACT.web],
            ['INSTAGRAM', CONTACT.ig],
            ['WHATSAPP', CONTACT.phones[0]],
          ].map(([k, v]) => (
            <div key={k} style={{display: 'flex', alignItems: 'baseline', gap: 18}}>
              <span
                style={{
                  fontFamily: F.ui,
                  fontWeight: 700,
                  fontSize: 16,
                  letterSpacing: 2.6,
                  color: C.inkDim,
                  width: 138,
                }}
              >
                {k}
              </span>
              <span style={{fontFamily: F.mono, fontWeight: 700, fontSize: 26, color: C.ink}}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </Panel>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S14 */
/* 240f · 8s — where it ends up: system, rack kit, standalone. Four beats. */

const S14_BEATS: {
  n: ImageName;
  fit: 'cover' | 'contain';
  head: string;
  note: string;
  chips: string[];
  card?: string;
}[] = [
  {
    n: 'ul-system-diagram',
    fit: 'contain',
    head: 'THE WHOLE RIG',
    note: 'Mics, guitars, keyboards, MIDI gear, monitors and outboard — one hub holds it together.',
    chips: ['MIDI I/O', 'MONITORS', 'OUTBOARD', 'EXPANSION'],
  },
  {
    n: 'ul-rack-ears',
    fit: 'contain',
    head: 'RACK IT WHEN YOU WANT',
    note: 'Optional ears turn the desktop unit into a rack-mounted one without changing anything else.',
    chips: ['OPTIONAL RACK EARS', 'HALF-RACK WIDTH'],
    card: '#E7EFF8',
  },
  {
    n: 'ul-rack-kit',
    fit: 'contain',
    head: 'ONE RACK SPACE',
    note: 'Two UltraLite-mk5 units sit side by side in a single 19-inch rack space.',
    chips: ['1U FOR TWO UNITS', 'TOUR-READY'],
    card: '#E7EFF8',
  },
  {
    n: 'ul-wood-studio',
    fit: 'cover',
    head: 'OR NO RACK AT ALL',
    note: 'It also runs standalone — power it up, and the stored CueMix 5 mixes come straight back.',
    chips: ['STANDALONE MIXER', 'SETTINGS STORED ON DEVICE'],
  },
];

export const S14: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const i = Math.min(3, Math.floor(f / 60));
  const local = f - i * 60;
  const b = S14_BEATS[i];
  const g = ramp(local, [0, 13], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="ul-black-hero" opacity={0.18} blur={60} tint="rgba(5,11,15,0.9)" />
      <SceneHead kicker="ULTRALITE-mk5 · DEPLOYED" accent={A} right={`0${i + 1} / 04`} delay={0} />

      <div style={{transform: `translateY(${(1 - g) * 14}px)`}}>
        <CrossPhoto
          names={S14_BEATS.map((x) => x.n)}
          i={i}
          local={local}
          fade={13}
          box={{l: 56, t: 118, w: 968, h: 440}}
          dur={62}
          fit={b.fit}
          kbAt={(k) => (S14_BEATS[k].fit === 'cover' ? {z: [1.05, 1.14]} : {z: [1.0, 1.05]})}
          radius={16}
          border={`${A}33`}
          bg={b.card ?? 'rgba(8,13,19,0.62)'}
        />
      </div>

      <Rule box={{l: 56, t: 592, w: 968}} accent={A} delay={i * 60 + 6} dur={18} />
      <div
        key={`t${i}`}
        style={{
          position: 'absolute',
          left: 56,
          top: 626,
          width: 968,
          opacity: ramp(local, [0, 9], [0, 1]),
          transform: `translateY(${(1 - ramp(local, [0, 12], [0, 1])) * 18}px)`,
        }}
      >
        <Display size={88} color={C.ink}>
          {b.head}
        </Display>
        <Body size={29} style={{marginTop: 18, width: 940}}>
          {b.note}
        </Body>
      </div>
      <ChipRow
        key={`c${i}`}
        items={b.chips}
        accent={A}
        delay={i * 60 + 22}
        per={5}
        size={20}
        style={{position: 'absolute', left: 56, top: 890, width: 968}}
      />
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};
