import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box, Reveal, CrossPhoto} from '../components/Photo';
import {Display, Kicker, Body, Mono, CountUp} from '../components/Type';
import {SceneHead, Panel, ChipRow, Rule, Stat} from '../components/Bits';
import {SquareEdge} from '../components/Frame';
import {C, F} from '../lib/theme';
import {ramp, pop, sceneIn, EASE_IN_OUT, EASE_OUT} from '../lib/anim';
import {ImageName} from '../lib/images';
import {CONTACT, BRAND} from '../lib/copy';

const FULL: Box = {l: 0, t: 0, w: 1080, h: 1080};
const A = C.e8;

/** Channel-count ladder — the 828 act's own signature graphic. */
const Ladder: React.FC<{
  count: number;
  box: Box;
  delay: number;
  color: string;
  label: string;
}> = ({count, box, delay, color, label}) => {
  const f = useCurrentFrame();
  const gap = 3;
  const bw = (box.w - gap * (count - 1)) / count;
  return (
    <div style={{position: 'absolute', left: box.l, top: box.t, width: box.w, height: box.h}}>
      <div style={{display: 'flex', gap, alignItems: 'flex-end', height: box.h - 34}}>
        {Array.from({length: count}).map((_, i) => {
          const g = ramp(f, [delay + i * 1.6, delay + i * 1.6 + 12], [0, 1], EASE_OUT);
          const h = (0.34 + ((i * 37) % 11) / 16) * (box.h - 34);
          return (
            <div
              key={i}
              style={{
                width: bw,
                height: h * g,
                background: `linear-gradient(180deg, ${color}, ${color}55)`,
                borderRadius: 2,
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          marginTop: 12,
          fontFamily: F.mono,
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: 2.2,
          color,
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ S15 */
/* 180f · 6s — the 828 arrives as a different class of machine. */

export const S15: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const pA = 1 - ramp(f, [84, 98], [0, 1], EASE_IN_OUT);
  const pB = ramp(f, [100, 118], [0, 1], EASE_IN_OUT);
  const t = pop(f, 6, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <div style={{opacity: pA}}>
        <Photo
          name="e8-black-hero"
          box={FULL}
          dur={dur}
          kb={{z: [1.12, 1.02], x: [-2, 1]}}
          radius={0}
          border={null}
        />
        <AbsoluteFill
          style={{
            background:
              'linear-gradient(180deg, rgba(4,6,10,0.72) 0%, rgba(4,6,10,0.10) 24%, rgba(4,6,10,0.68) 52%, rgba(4,6,10,0.93) 74%, rgba(4,6,10,0.98) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: 606,
            width: 968,
            opacity: Math.min(1, t * 1.4),
            transform: `translateY(${(1 - t) * 40}px)`,
          }}
        >
          <Kicker color={A} size={24}>
            PART TWO
          </Kicker>
          <Display size={196} color={C.ink} style={{marginTop: 8}}>
            828
          </Display>
          <Body size={30} style={{marginTop: 16, width: 920}}>
            A rack unit built to sit at the centre of a room and run all of it.
          </Body>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: pB}}>
        <PhotoBackdrop name="e8-black-hero" opacity={0.24} blur={56} tint="rgba(12,7,4,0.88)" />
        <SceneHead kicker="MOTU 828" accent={A} right="28 × 32" delay={100} />
        <Photo
          name="e8-render-34a"
          box={{l: 40, t: 150, w: 1000, h: 300}}
          dur={dur}
          fit="contain"
          kb={{z: [1.0, 1.06]}}
          radius={0}
          border={null}
          glow="rgba(255,138,61,0.24)"
        />
        <Ladder
          count={28}
          box={{l: 56, t: 496, w: 968, h: 150}}
          delay={112}
          color={A}
          label="28 INPUTS"
        />
        <Ladder
          count={32}
          box={{l: 56, t: 676, w: 968, h: 150}}
          delay={140}
          color={C.gold}
          label="32 OUTPUTS"
        />
        <div style={{position: 'absolute', left: 56, top: 864, width: 968}}>
          <Display size={72} color={C.ink}>
            60 CHANNELS AT ONCE
          </Display>
        </div>
      </div>
      <SquareEdge color={A} opacity={0.7} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S16 */
/* 180f · 6s — the physical object: 1U, mains powered, built to be installed. */

export const S16: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const i = Math.min(2, Math.floor(f / 60));
  const local = f - i * 60;
  const names: ImageName[] = ['e8-render-rear-a', 'e8-render-rear-b', 'e8-laptop-led'];
  const heads = ['ONE RACK SPACE', 'EVERY SOCKET ON THE BACK', 'AND A ROOM AROUND IT'];
  const notes = [
    'A full 19-inch, single-rack-space chassis with an internal power supply — no wall wart to lose.',
    'Analog, digital, MIDI and USB all terminate on the rear, so the front stays a control surface.',
    'Installed once and left there: the 828 is the fixed point everything else plugs into.',
  ];
  const g = ramp(local, [0, 13], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-macbook-rack" opacity={0.20} blur={58} tint="rgba(12,8,5,0.88)" />
      <SceneHead kicker="828 · THE UNIT" accent={A} right={`0${i + 1} / 03`} delay={0} />

      <div style={{transform: `scale(${0.97 + g * 0.03})`}}>
        <CrossPhoto
          names={names}
          i={i}
          local={local}
          fade={13}
          box={{l: 40, t: 158, w: 1000, h: 380}}
          dur={62}
          fit={i === 2 ? 'cover' : 'contain'}
          kbAt={(k) => (k === 2 ? {z: [1.05, 1.13]} : {z: [1.0, 1.06]})}
          radius={16}
          border={`${A}33`}
          bg="rgba(10,8,7,0.55)"
        />
      </div>

      <Rule box={{l: 56, t: 572, w: 968}} accent={A} delay={i * 60 + 4} dur={18} />
      <div
        key={`t${i}`}
        style={{
          position: 'absolute',
          left: 56,
          top: 606,
          width: 968,
          opacity: ramp(local, [0, 9], [0, 1]),
          transform: `translateY(${(1 - ramp(local, [0, 12], [0, 1])) * 18}px)`,
        }}
      >
        <Display size={86} color={C.ink}>
          {heads[i]}
        </Display>
        <Body size={29} style={{marginTop: 18, width: 940}}>
          {notes[i]}
        </Body>
      </div>
      <ChipRow
        items={['1U RACK', 'INTERNAL PSU', 'IEC MAINS', 'STEEL CHASSIS']}
        accent={A}
        delay={20}
        per={5}
        size={20}
        style={{position: 'absolute', left: 56, top: 890, width: 968}}
      />
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S17 */
/* 210f · 7s — the front-panel display. Magnifier device, not pin callouts. */

export const S17: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const strip: Box = {l: 20, t: 148, w: 1040, h: 165};
  const w = ramp(f, [0, 20], [0, 1]);
  // locator travels along the panel and settles over the display
  const lx = ramp(f, [22, 62], [120, 605], EASE_IN_OUT);
  const lock = ramp(f, [62, 74], [0, 1]);
  const zoom = ramp(f, [76, 96], [0, 1], EASE_OUT);
  const swap = ramp(f, [140, 154], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 72% 44% at 50% 52%, rgba(255,138,61,0.13), rgba(0,0,0,0) 74%)',
        }}
      />
      <SceneHead kicker="THE FRONT PANEL IS A SCREEN" accent={A} right="828 ONLY" delay={0} />

      <Reveal p={w} dir="l">
        <Photo
          name="e8-front-elev"
          box={strip}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(255,138,61,0.16)"
        />
      </Reveal>

      {/* travelling locator */}
      <div
        style={{
          position: 'absolute',
          left: lx,
          top: strip.t + 34,
          width: 208,
          height: 96,
          border: `2px solid ${A}`,
          borderRadius: 6,
          boxShadow: `0 0 26px 2px ${A}66, inset 0 0 22px ${A}22`,
          opacity: w,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: lx + 104,
          top: strip.t + 130,
          width: 2,
          height: 92 * lock,
          background: `linear-gradient(180deg, ${A}, ${A}00)`,
        }}
      />

      {/* magnified display */}
      <div style={{opacity: zoom, transform: `scale(${0.9 + zoom * 0.1})`}}>
        <div style={{opacity: 1 - swap}}>
          <Photo
            name="e8-lcd-a"
            box={{l: 56, t: 366, w: 968, h: 300}}
            dur={dur}
            kb={{z: [1.04, 1.12], x: [-1, 1]}}
            radius={14}
            border={`${A}55`}
          />
        </div>
        <div style={{opacity: swap}}>
          <Photo
            name="e8-lcd-b"
            box={{l: 56, t: 366, w: 968, h: 300}}
            dur={dur}
            kb={{z: [1.10, 1.02]}}
            radius={14}
            border={`${A}55`}
          />
        </div>
      </div>

      <Rule box={{l: 56, t: 700, w: 968}} accent={A} delay={100} dur={20} />
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 734,
          width: 968,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Stat value="3.9" unit="inch" caption="RGB LCD" accent={A} delay={106} size={74} />
        <Stat value="480×128" caption="RESOLUTION" accent={A} delay={114} size={74} />
        <Stat value="24" unit="bit" caption="COLOUR" accent={A} delay={122} size={74} />
      </div>
      <div style={{position: 'absolute', left: 56, top: 872, width: 968}}>
        <Body size={28}>
          Every analog and digital channel metered at a glance — plus hardware
          settings, reachable without touching the computer.
        </Body>
      </div>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S18 */
/* 210f · 7s — monitor control and talkback. Nothing like this on the mk5. */

const S18_ROWS: {k: string; v: string; d: number}[] = [
  {k: 'TALKBACK', v: 'ONE BUTTON TO THE LIVE ROOM', d: 60},
  {k: 'A / B MONITORS', v: 'SWITCH PAIRS INSTANTLY', d: 76},
  {k: 'MONO · MUTE · DIM', v: 'REFERENCE CHECKS IN ONE PRESS', d: 92},
  {k: '2 HEADPHONE OUTS', v: 'TWO INDEPENDENT CUE MIXES', d: 108},
];

export const S18: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const a = pop(f, 2, 16);
  const b = pop(f, 16, 16);
  const late = ramp(f, [138, 156], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-mic-rack" opacity={0.24} blur={54} tint="rgba(12,8,5,0.86)" />
      <SceneHead kicker="A CONTROL ROOM IN 1U" accent={A} right="828 ONLY" delay={0} />

      <div style={{opacity: Math.min(1, a * 1.4), transform: `translateX(${(1 - a) * -34}px)`}}>
        <Photo
          name="e8-monitor-buttons"
          box={{l: 56, t: 118, w: 480, h: 250}}
          dur={dur}
          kb={{z: [1.06, 1.16]}}
          radius={14}
          border={`${A}44`}
        />
      </div>
      <div style={{opacity: Math.min(1, b * 1.4), transform: `translateX(${(1 - b) * 34}px)`}}>
        <Photo
          name="e8-monitor-panel"
          box={{l: 556, t: 118, w: 468, h: 250}}
          dur={dur}
          fit="contain"
          radius={14}
          bg="rgba(10,8,7,0.8)"
          border={`${A}44`}
        />
      </div>

      <div style={{position: 'absolute', left: 56, top: 388, width: 968}}>
        {S18_ROWS.map((r) => {
          const g = ramp(f, [r.d, r.d + 15], [0, 1]);
          return (
            <div
              key={r.k}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 22,
                paddingBottom: 11,
                marginBottom: 11,
                borderBottom: `1px solid ${C.line}`,
                opacity: g,
                transform: `translateX(${(1 - g) * 26}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: F.display,
                  fontWeight: 800,
                  fontSize: 42,
                  letterSpacing: -0.3,
                  color: C.ink,
                  textTransform: 'uppercase',
                  width: 468,
                  flexShrink: 0,
                }}
              >
                {r.k}
              </span>
              <span
                style={{
                  fontFamily: F.mono,
                  fontWeight: 500,
                  fontSize: 19,
                  letterSpacing: 0.8,
                  color: A,
                }}
              >
                {r.v}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{opacity: late}}>
        <Photo
          name="e8-front-elev-slim"
          box={{l: 20, t: 692, w: 1040, h: 104}}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
        />
        <div style={{position: 'absolute', left: 56, top: 824, width: 968}}>
          <Body size={28}>
            The talkback mic, the monitor group and both cue mixes are all on the
            front — the 828 runs a session without a control surface.
          </Body>
        </div>
      </div>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S19 */
/* 240f · 8s — rear connectivity, told with real detail photographs. */

const S19_CELLS: {a: ImageName; la: string; b?: ImageName; lb?: string; at?: number}[] = [
  {a: 'e8-optical-rear', la: 'OPTICAL A + B · 16 CH', b: 'e8-line-outs', lb: '8 BALANCED LINE OUT', at: 132},
  {a: 'e8-spdif', la: 'S/PDIF IN + OUT'},
  {a: 'e8-rear-digital', la: 'MIDI I/O · USB3', b: 'e8-line-in-insert', lb: 'MIC INSERT SEND / RETURN', at: 158},
  {a: 'e8-rear-cabled', la: 'EVERYTHING CONNECTED'},
];

const S19_BOXES: Box[] = [
  {l: 56, t: 330, w: 470, h: 232},
  {l: 554, t: 330, w: 470, h: 232},
  {l: 56, t: 580, w: 470, h: 232},
  {l: 554, t: 580, w: 470, h: 232},
];

export const S19: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const w = ramp(f, [0, 20], [0, 1]);
  const strip: Box = {l: 20, t: 132, w: 1040, h: 150};
  const scan = ramp(f, [20, 120], [0, 1], EASE_IN_OUT);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-rear-cabled" opacity={0.18} blur={60} tint="rgba(12,8,5,0.9)" />
      <SceneHead kicker="REAR CONNECTIVITY" accent={A} right="28 IN · 32 OUT" delay={0} />

      <Reveal p={w} dir="r">
        <Photo
          name="e8-rear-elev"
          box={strip}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(255,138,61,0.16)"
        />
      </Reveal>
      <div
        style={{
          position: 'absolute',
          left: strip.l + 40 + (strip.w - 260) * scan,
          top: strip.t + 26,
          width: 180,
          height: 98,
          border: `2px solid ${A}`,
          borderRadius: 5,
          boxShadow: `0 0 22px 2px ${A}55`,
          opacity: w,
        }}
      />

      {S19_CELLS.map((c, i) => {
        const swapped = c.b && c.at !== undefined && f >= c.at;
        const name = swapped ? (c.b as ImageName) : c.a;
        const label = swapped ? (c.lb as string) : c.la;
        const g = pop(f, 26 + i * 8, 17);
        const sw = c.at !== undefined ? ramp(f, [c.at, c.at + 12], [0, 1]) : 1;
        const box = S19_BOXES[i];
        return (
          <div key={i} style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 22}px)`}}>
            {swapped ? (
              <>
                <Photo name={c.a} box={box} dur={dur} kb={{z: [1.04, 1.10]}} radius={13} border={`${A}30`} />
                <Photo
                  name={name}
                  box={box}
                  dur={dur}
                  kb={{z: [1.04, 1.10]}}
                  radius={13}
                  border={`${A}30`}
                  opacity={sw}
                />
              </>
            ) : (
              <Photo name={name} box={box} dur={dur} kb={{z: [1.04, 1.10]}} radius={13} border={`${A}30`} />
            )}
            <div
              style={{
                position: 'absolute',
                left: box.l + 12,
                top: box.t + box.h - 40,
                padding: '5px 12px',
                borderRadius: 7,
                background: 'rgba(4,6,10,0.86)',
                border: `1px solid ${A}55`,
              }}
            >
              <span
                style={{fontFamily: F.mono, fontWeight: 700, fontSize: 16, letterSpacing: 1, color: A}}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: 56, top: 838, width: 968}}>
        <Body size={27}>
          Two optical banks add sixteen more channels, and the two mic channels
          each get a real insert loop for outboard.
        </Body>
      </div>
      <ChipRow
        items={['16-CH OPTICAL', 'XLR MAIN OUT', 'INSERT LOOPS', 'S/PDIF', 'MIDI']}
        accent={A}
        delay={176}
        per={4}
        size={19}
        style={{position: 'absolute', left: 56, top: 918, width: 968}}
      />
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S20 */
/* 180f · 6s — loopback + bus speed. A capability the mk5 does not have. */

export const S20: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const g = pop(f, 4, 16);
  const b = ramp(f, [84, 100], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 66% 46% at 42% 40%, rgba(255,138,61,0.15), rgba(0,0,0,0) 72%)',
        }}
      />
      <SceneHead kicker="STREAMING & PODCAST" accent={A} right="LOOPBACK" delay={0} />

      <div style={{position: 'absolute', left: 56, top: 118, width: 968}}>
        <Display size={80} color={C.ink}>
          SEND THE COMPUTER
          <br />
          BACK TO ITSELF.
        </Display>
      </div>

      <div style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 22}px)`}}>
        <Photo
          name="e8-loopback-menu"
          box={{l: 56, t: 292, w: 396, h: 396}}
          dur={dur}
          fit="contain"
          radius={14}
          bg="rgba(10,8,7,0.90)"
          border={`${A}44`}
        />
        <Photo
          name="e8-usb-5gbps"
          box={{l: 482, t: 292, w: 542, h: 186}}
          dur={dur}
          fit="contain"
          radius={12}
          bg="rgba(10,8,7,0.90)"
          border={`${A}33`}
        />
        <Photo
          name="e8-latency"
          box={{l: 482, t: 502, w: 542, h: 186}}
          dur={dur}
          fit="contain"
          radius={12}
          bg="rgba(10,8,7,0.90)"
          border={`${A}33`}
        />
      </div>

      <Rule box={{l: 56, t: 720, w: 968}} accent={A} delay={40} dur={20} />
      <div style={{position: 'absolute', left: 56, top: 752, width: 968, opacity: b}}>
        <Body size={29} style={{width: 950}}>
          Dedicated loopback channels put system audio straight into the mix —
          a stream, a podcast or a remote guest sits alongside the mics.
        </Body>
        <div style={{marginTop: 30, display: 'flex', gap: 58}}>
          <Stat value="5" unit="Gbps" caption="USB 3" accent={A} delay={104} size={70} />
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <CountUp to={2} dur={30} decimals={0} delay={108} size={70} suffix="ms" color={C.ink} />
            <div
              style={{
                fontFamily: F.ui,
                fontWeight: 700,
                fontSize: 17,
                letterSpacing: 2.4,
                color: C.inkDim,
                marginTop: 9,
              }}
            >
              ROUND-TRIP LATENCY
            </div>
          </div>
          <Stat value="60" caption="CHANNELS" accent={A} delay={116} size={70} />
        </div>
      </div>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S21 */
/* 180f · 6s — what gets built around it. Three rooms, three scales. */

const S21_BEATS: {main: ImageName; side: ImageName; head: string; note: string}[] = [
  {
    main: 'e8-modular-wall',
    side: 'e8-korg-synth',
    head: 'FEED IT A WALL OF GEAR',
    note: 'Ten analog inputs plus sixteen optical channels — modular rigs and synth racks arrive on one interface.',
  },
  {
    main: 'e8-big-studio',
    side: 'e8-footswitch',
    head: 'RUN THE WHOLE ROOM',
    note: 'Console, monitors, outboard and a footswitch for hands-free punch-in, all terminating at the 828.',
  },
  {
    main: 'e8-guitar-vox',
    side: 'e8-mic-rack',
    head: 'OR JUST TRACK A BAND',
    note: 'Two preamps with inserts, eight line inputs, two cue mixes — enough to record a live room properly.',
  },
];

export const S21: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const i = Math.min(2, Math.floor(f / 60));
  const local = f - i * 60;
  const b = S21_BEATS[i];
  const late = ramp(f, [140, 158], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <SceneHead kicker="828 · IN THE ROOM" accent={A} right={`0${i + 1} / 03`} delay={0} />

      <CrossPhoto
        names={S21_BEATS.map((x) => x.main)}
        i={i}
        local={local}
        fade={13}
        box={{l: 56, t: 118, w: 660, h: 430}}
        dur={62}
        kbAt={(k) => ({z: [1.05, 1.14], x: [k % 2 ? 2 : -2, 0]})}
        radius={16}
        border={`${A}33`}
      />
      <CrossPhoto
        names={S21_BEATS.map((x) => x.side)}
        i={i}
        local={local}
        fade={13}
        box={{l: 740, t: 118, w: 284, h: 430}}
        dur={62}
        kbAt={() => ({z: [1.12, 1.02]})}
        radius={16}
        border="rgba(255,255,255,0.12)"
      />

      <Rule box={{l: 56, t: 584, w: 968}} accent={A} delay={i * 60 + 4} dur={18} />
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
        <Display size={80} color={C.ink}>
          {b.head}
        </Display>
        <Body size={28} style={{marginTop: 18, width: 940}}>
          {b.note}
        </Body>
      </div>

      <div style={{opacity: late}}>
        <Photo
          name="e8-rear-elev-slim"
          box={{l: 20, t: 838, w: 1040, h: 110}}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
        />
      </div>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S22 */
/* 180f · 6s — the software that ships with it. */

const PACKS: {n: ImageName; l: string}[] = [
  {n: 'e8-sw-soundbank', l: 'MOTU INSTRUMENTS'},
  {n: 'e8-sw-bigfish', l: 'BIG FISH AUDIO'},
  {n: 'e8-sw-loopmasters', l: 'LOOPMASTERS'},
  {n: 'e8-sw-lucid', l: 'LUCIDSAMPLES'},
];

export const S22: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const swap = ramp(f, [92, 106], [0, 1]);
  const g = pop(f, 2, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-sw-mosaic" opacity={0.20} blur={54} tint="rgba(10,8,7,0.9)" />
      <SceneHead kicker="WHAT SHIPS WITH IT" accent={A} right="INCLUDED" delay={0} />

      <div style={{opacity: Math.min(1, g * 1.4)}}>
        <div style={{opacity: 1 - swap}}>
          <Photo
            name="e8-sw-performer-a"
            box={{l: 56, t: 118, w: 968, h: 384}}
            dur={dur}
            kb={{z: [1.03, 1.10], x: [-1, 1]}}
            radius={14}
            border={`${A}3D`}
          />
        </div>
        <div style={{opacity: swap}}>
          <Photo
            name="e8-sw-performer-b"
            box={{l: 56, t: 118, w: 968, h: 384}}
            dur={dur}
            kb={{z: [1.08, 1.01]}}
            radius={14}
            border={`${A}3D`}
          />
        </div>
      </div>

      <div style={{position: 'absolute', left: 56, top: 528, width: 968}}>
        <Display size={70} color={C.ink}>
          A DAW AND 6 GB OF SOUNDS,
          <br />
          INCLUDED.
        </Display>
      </div>

      {PACKS.map((p, i) => {
        const s = pop(f, 62 + i * 7, 17);
        return (
          <div key={p.n} style={{opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 24}px)`}}>
            <Photo
              name={p.n}
              box={{l: 56 + i * 246, t: 700, w: 222, h: 168}}
              dur={dur}
              kb={{z: [1.04, 1.10]}}
              radius={12}
              border={`${A}30`}
            />
            <div
              style={{
                position: 'absolute',
                left: 56 + i * 246,
                top: 878,
                width: 222,
                textAlign: 'center',
                fontFamily: F.ui,
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: 1.6,
                color: C.inkDim,
              }}
            >
              {p.l}
            </div>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: 56, top: 926, width: 968}}>
        <Mono size={20} color={A} tracking={2.6}>
          MOTU PERFORMER LITE · ABLETON LIVE LITE · CUEMIX 5
        </Mono>
      </div>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S23 */
/* 180f · 6s — converters, then the WhatsApp contact beat. */

export const S23: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const g = pop(f, 2, 16);
  const c = ramp(f, [84, 102], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-macbook-rack" opacity={0.22} blur={56} tint="rgba(10,8,7,0.88)" />
      <SceneHead kicker="CONVERSION" accent={A} right="ESS SABRE32 ULTRA" delay={0} />

      <div style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 20}px)`}}>
        <Photo
          name="e8-ess-logo"
          box={{l: 56, t: 116, w: 468, h: 236}}
          dur={dur}
          fit="contain"
          radius={13}
          bg="rgba(10,8,7,0.9)"
          border={`${A}3D`}
        />
        <Photo
          name="e8-macbook-rack"
          box={{l: 556, t: 116, w: 468, h: 236}}
          dur={dur}
          kb={{z: [1.06, 1.15]}}
          radius={13}
          border={`${A}30`}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 386,
          width: 968,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Stat value="125" unit="dB" caption="DYNAMIC RANGE" accent={A} delay={26} size={76} />
        <Stat value="−114" unit="dB" caption="THD + N" accent={A} delay={34} size={76} />
        <Stat value="192" unit="kHz" caption="MAX RATE" accent={A} delay={42} size={76} />
      </div>

      <Rule box={{l: 56, t: 522, w: 968}} accent={A} delay={50} dur={20} />

      <Panel
        box={{l: 56, t: 560, w: 968, h: 404}}
        accent={A}
        p={32}
        style={{opacity: c, transform: `translateY(${(1 - c) * 20}px)`}}
      >
        <div style={{fontFamily: F.ui, fontWeight: 800, fontSize: 27, letterSpacing: 4.4, color: C.ink}}>
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
          {BRAND.distributor} · {BRAND.region}
        </div>
        <div style={{height: 1, background: C.line, margin: '22px 0 18px'}} />
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 3,
            color: C.inkDim,
            marginBottom: 14,
          }}
        >
          WHATSAPP / CALL
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 11}}>
          {CONTACT.phones.map((p, i) => (
            <div
              key={p}
              style={{
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 33,
                color: C.ink,
                opacity: ramp(f, [96 + i * 8, 110 + i * 8], [0, 1]),
              }}
            >
              {p}
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: F.mono,
            fontWeight: 500,
            fontSize: 19,
            color: A,
            letterSpacing: 0.6,
          }}
        >
          {CONTACT.web}
        </div>
      </Panel>
      <SquareEdge color={A} opacity={0.55} />
    </AbsoluteFill>
  );
};
