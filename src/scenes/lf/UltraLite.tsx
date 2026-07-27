import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box, Reveal} from '../../components/Photo';
import {Display, Kicker, Body, CountUp} from '../../components/Type';
import {Label} from '../../components/lf/LFType';
import {LFHead} from '../../components/lf/LFHead';
import {HeroBeats, Beat} from '../../components/lf/BeatCycle';
import {PriceCard} from '../../components/lf/PriceCard';
import {LogoCard} from '../../components/lf/LogoCard';
import {Callout, ChipRow, Rule, Stat} from '../../components/Bits';
import {C} from '../../lib/lf-theme';
import {ramp, pop, sceneIn, EASE_IN_OUT} from '../../lib/anim';
import {PRICE} from '../../lib/copy';

const A = C.ul;
const FULL: Box = {l: 0, t: 0, w: 1920, h: 924};

/* --------------------------------------------------------------- U1 */
/* 360f/12s — chapter title + hero + headline spec (2 beats). */
export const U1: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const pA = 1 - ramp(f, [140, 158], [0, 1], EASE_IN_OUT);
  const pB = ramp(f, [160, 180], [0, 1], EASE_IN_OUT);
  const t = pop(f, 8, 15);

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <div style={{opacity: pA}}>
        <Photo name="ul-black-hero" box={FULL} dur={dur} fit="cover" kb={{z: [1.18, 1.03], x: [2, -1]}} radius={0} border={null} shade />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,6,10,0.66) 0%, rgba(4,6,10,0.08) 32%, rgba(4,6,10,0.55) 66%, rgba(4,6,10,0.92) 100%)'}} />
        <div style={{position: 'absolute', left: 90, top: 560, width: 1740, opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 36}px)`}}>
          <Kicker color={A} size={26}>CHAPTER TWO · PART ONE</Kicker>
          <Display size={148} color={C.ink} style={{marginTop: 12}}>ULTRALITE-mk5</Display>
          <Body size={28} style={{marginTop: 16, width: 1200}}>
            Forty channels of MOTU I/O in a box that fits in one hand.
          </Body>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: pB}}>
        <PhotoBackdrop name="ul-black-hero" opacity={0.16} blur={64} tint="rgba(4,10,10,0.92)" />
        <LFHead kicker="MOTU ULTRALITE-mk5" accent={A} right="18 × 22" delay={160} />
        <Photo name="ul-render-top" box={{l: 260, t: 150, w: 1400, h: 460}} dur={dur} fit="contain" kb={{z: [1.0, 1.06]}} radius={0} border={null} glow="rgba(47,212,200,0.22)" />
        <Rule box={{l: 90, t: 636, w: 1740}} accent={A} delay={190} dur={20} />
        <div style={{position: 'absolute', left: 90, top: 668, width: 1740, display: 'flex', justifyContent: 'space-between'}}>
          <Stat value="18" caption="INPUTS" accent={A} delay={196} size={78} />
          <Stat value="22" caption="OUTPUTS" accent={A} delay={202} size={78} />
          <Stat value="40" caption="SIMULTANEOUS" accent={A} delay={208} size={78} />
          <Stat value="192" unit="kHz" caption="MAX RATE" accent={A} delay={214} size={78} />
          <Stat value="2.4" unit="ms" caption="LATENCY" accent={A} delay={220} size={78} />
        </div>
        <ChipRow items={['HALF-RACK STEEL', 'USB-C', 'ESS SABRE32', 'STANDALONE']} accent={A} delay={228} per={5} size={21} justify="center" style={{position: 'absolute', left: 90, top: 826, width: 1740}} />
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- U2 */
const U2_BEATS: Beat[] = [
  {img: 'ul-render-front', fit: 'contain', kicker: 'BUILT SMALL ON PURPOSE', headline: 'HALF-RACK STEEL', body: 'A single half-rack width and about the footprint of a laptop — the whole 40-channel rig moves in one bag.', chips: ['253 × 44 × 175 mm'], dur: 165},
  {img: 'ul-desk-hero', fit: 'cover', kicker: 'MATERIALS', headline: 'DENSE, NOT DELICATE', body: 'Steel chassis, aluminium front panel — small enough to travel, solid enough to live on a desk permanently.', dur: 165},
];
export const U2: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="ul-desk-hero" opacity={0.14} blur={64} tint="rgba(4,10,10,0.92)" />
    <LFHead kicker="THE PHYSICAL BUILD" accent={A} right="ULTRALITE-mk5" />
    <HeroBeats beats={U2_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U3 */
/* 420f/14s — front panel callout sweep, 5 pins (6 beats). */
const U3_PINS: {x: number; label: string; sub: string; side: 'up' | 'down'; d: number}[] = [
  {x: 300, label: 'MIC / LINE / INST 1–2', sub: 'XLR-TRS COMBO', side: 'up', d: 40},
  {x: 620, label: 'GAIN · PAD · 48V', sub: 'PER CHANNEL', side: 'down', d: 78},
  {x: 900, label: 'HEADPHONES', sub: 'DEDICATED LEVEL', side: 'up', d: 116},
  {x: 1160, label: 'MAIN VOLUME', sub: 'MONITOR CONTROL', side: 'down', d: 154},
  {x: 1500, label: 'METERING LCD', sub: 'ALL I/O AT A GLANCE', side: 'up', d: 192},
];
export const U3: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const w = ramp(f, [0, 22], [0, 1]);
  const panel: Box = {l: 160, t: 300, w: 1600, h: 340};
  const inset = pop(f, 250, 17);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 76% 44% at 50% 42%, rgba(47,212,200,0.12), rgba(0,0,0,0) 74%)'}} />
      <LFHead kicker="FRONT PANEL" accent={A} right="EVERYTHING YOU TOUCH, UP FRONT" />
      <div style={{position: 'absolute', left: 90, top: 130, width: 1740}}>
        <Display size={58} color={C.ink}>FIVE CONTROLS. NO MENUS.</Display>
      </div>
      <Reveal p={w} dir="l">
        <Photo name="ul-front-elev" box={panel} dur={dur} fit="contain" radius={0} border={null} glow="rgba(47,212,200,0.18)" />
      </Reveal>
      {U3_PINS.map((p) => (
        <Callout key={p.label} x={p.x} y={p.side === 'up' ? panel.t + 40 : panel.t + panel.h - 40} len={p.side === 'up' ? 70 : 60} label={p.label} sub={p.sub} accent={A} side={p.side} delay={p.d} width={280} />
      ))}
      <div style={{opacity: Math.min(1, inset * 1.4), transform: `translateY(${(1 - inset) * 24}px)`}}>
        <Photo name="ul-front-closeup" box={{l: 1200, t: 774, w: 630, h: 130}} dur={dur} fit="contain" radius={14} bg="rgba(8,13,19,0.9)" border={`${A}55`} />
        <div style={{position: 'absolute', left: 90, top: 774, width: 900}}>
          <Body size={25}>Gain, pad and phantom power are all reachable without opening a menu — the mk5 behaves like a small console.</Body>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- U4 */
/* 540f/18s — rear panel callout sweep, 8 pins (8 beats). */
const U4_PINS: {x: number; label: string; sub: string; side: 'up' | 'down'; d: number}[] = [
  {x: 210, label: '15V DC', sub: 'EXTERNAL PSU', side: 'up', d: 40},
  {x: 400, label: 'USB-C', sub: 'MAC · PC · iOS', side: 'down', d: 76},
  {x: 620, label: '8-CH OPTICAL', sub: 'ADAT / TOSLINK', side: 'up', d: 112},
  {x: 830, label: 'S/PDIF', sub: 'RCA COAXIAL', side: 'down', d: 148},
  {x: 1010, label: 'MIDI I/O', sub: '5-PIN DIN', side: 'up', d: 184},
  {x: 1230, label: 'LINE OUT 1–8', sub: 'BALANCED TRS', side: 'down', d: 220},
  {x: 1470, label: 'MAIN OUT', sub: 'STEREO MONITOR', side: 'up', d: 256},
  {x: 1670, label: 'LINE IN', sub: '6 BALANCED TRS', side: 'down', d: 292},
];
export const U4: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const w = ramp(f, [0, 22], [0, 1]);
  const panel: Box = {l: 160, t: 300, w: 1600, h: 340};
  const tail = ramp(f, [330, 350], [0, 1]);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="ul-stack-laptop" opacity={0.12} blur={66} tint="rgba(4,10,10,0.93)" />
      <LFHead kicker="REAR PANEL" accent={A} right="18 IN · 22 OUT" />
      <div style={{position: 'absolute', left: 90, top: 130, width: 1740}}>
        <Display size={58} color={C.ink}>40 CHANNELS OUT OF ONE SMALL BOX.</Display>
      </div>
      <Reveal p={w} dir="r">
        <Photo name="ul-rear-elev" box={panel} dur={dur} fit="contain" radius={0} border={null} glow="rgba(47,212,200,0.18)" />
      </Reveal>
      {U4_PINS.map((p) => (
        <Callout key={p.label} x={p.x} y={p.side === 'up' ? panel.t + 36 : panel.t + panel.h - 36} len={p.side === 'up' ? 66 : 54} label={p.label} sub={p.sub} accent={A} side={p.side} delay={p.d} width={220} />
      ))}
      <div style={{position: 'absolute', left: 90, top: 782, width: 1740, opacity: tail}}>
        <Rule box={{l: 0, t: 0, w: 1740}} accent={A} delay={330} dur={18} />
        <Body size={26} style={{marginTop: 22, width: 1500}}>
          Eight balanced line outs plus a dedicated stereo main — monitors, headphone amps and outboard gear each get their own feed.
        </Body>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- U5 */
const U5_BEATS: Beat[] = [
  {img: 'ul-stack-laptop', fit: 'cover', kicker: 'CUEMIX 5 · ULTRALITE-mk5', headline: 'THE SAME MIXER, TUNED FOR TWO PREAMPS', body: 'Per-channel gain, pad and 48V are all inside the same DSP mixer that runs the effects — one surface for the whole signal chain.', dur: 150},
  {img: 'ul-cuemix-home', fit: 'contain', kicker: 'STORED ON DEVICE', headline: 'MIXES THAT SURVIVE A REBOOT', body: 'Settings live on the hardware itself, so the mk5 comes back exactly as you left it — even with no computer attached.', dur: 150},
];
export const U5: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 46%, rgba(179,107,232,0.11), rgba(0,0,0,0) 74%)'}} />
    <LFHead kicker="CUEMIX 5 ON THE mk5" accent={A} right="TWO PREAMPS, FULL CONTROL" />
    <HeroBeats beats={U5_BEATS} accent={A} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U6 */
export const U6: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const g = pop(f, 20, 16);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 66% 46% at 40% 42%, rgba(47,212,200,0.15), rgba(0,0,0,0) 72%)'}} />
      <LFHead kicker="ROUND-TRIP LATENCY" accent={A} right="96 kHz" />
      <div style={{position: 'absolute', left: 90, top: 130, width: 1740}}>
        <Display size={68} color={C.ink}>FAST ENOUGH THAT MONITORING IS A CHOICE.</Display>
      </div>
      <div style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 22}px)`}}>
        <Photo name="ul-latency" box={{l: 90, t: 260, w: 1000, h: 430}} dur={dur} fit="contain" radius={16} bg="rgba(9,14,20,0.86)" border={`${A}3D`} />
        <Photo name="ul-render-34" box={{l: 1160, t: 260, w: 670, h: 270}} dur={dur} fit="contain" radius={0} border={null} glow="rgba(47,212,200,0.18)" />
        <div style={{position: 'absolute', left: 1160, top: 560, width: 670}}>
          <CountUp to={2.4} dur={44} decimals={1} delay={30} size={92} color={C.ink} suffix="ms" />
        </div>
      </div>
      <Body size={26} style={{position: 'absolute', left: 90, top: 782, width: 1740}}>
        Low enough that hardware monitoring is a choice, not a necessity — even at 96 kHz, round trip stays under 2.5 milliseconds.
      </Body>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- U7 */
const U7_BEATS: Beat[] = [
  {img: 'ul-rack-ears', fit: 'contain', bg: '#E7EFF8', kicker: 'RACK IT WHEN YOU WANT', headline: 'OPTIONAL RACK EARS', body: 'A small kit turns the desktop unit into a rack-mounted one — nothing else about it changes.', chips: ['OPTIONAL ACCESSORY', 'HALF-RACK WIDTH'], dur: 165},
  {img: 'ul-rack-kit', fit: 'contain', bg: '#E7EFF8', kicker: 'ONE RACK SPACE', headline: 'TWO UNITS, ONE 1U SLOT', body: 'Side by side, two UltraLite-mk5 interfaces share a single 19-inch rack space — 80 channels in the space of one.', chips: ['1U FOR TWO UNITS', 'TOUR-READY'], dur: 165},
];
export const U7: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="ul-black-hero" opacity={0.12} blur={66} tint="rgba(4,10,10,0.94)" />
    <LFHead kicker="PORTABILITY" accent={A} right="DESK, BAG OR RACK" />
    <HeroBeats beats={U7_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U8 */
const U8_BEATS: Beat[] = [
  {img: 'ul-system-diagram', fit: 'contain', kicker: 'STANDALONE MIXER', headline: 'THE WHOLE RIG, NO COMPUTER', body: 'Mics, guitars, keyboards, MIDI gear, monitors and outboard — one hub holds it together, powered up on its own.', dur: 150},
  {img: 'ul-ipad-desk', fit: 'cover', kicker: 'CLASS-COMPLIANT USB-C', headline: 'AN iPad SEES IT INSTANTLY', body: 'No driver install on iOS — plug in and CueMix 5 is right there, running the mix from the tablet.', chips: ['USB-C', 'NO DRIVER ON iOS'], dur: 150},
];
export const U8: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 60% 46%, rgba(47,212,200,0.12), rgba(0,0,0,0) 74%)'}} />
    <LFHead kicker="RUNS WITHOUT A COMPUTER" accent={A} right="STANDALONE" />
    <HeroBeats beats={U8_BEATS} accent={A} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U9 */
const U9_BEATS: Beat[] = [
  {img: 'ul-amp-guitar', fit: 'cover', kicker: 'WHERE THE mk5 LIVES', headline: 'GUITAR STRAIGHT IN', body: 'The combo inputs take an instrument-level signal directly — no DI box in the chain, no extra gear to carry.', dur: 180},
  {img: 'ul-guitarist', fit: 'cover', kicker: 'HARDWARE MONITORING', headline: 'TRACK WHILE YOU PLAY', body: 'What you hear is what your hands are doing right now — not what the computer gets around to processing.', dur: 180},
];
export const U9: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.void}}>
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="01 / 04" />
    <HeroBeats beats={U9_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U10 */
const U10_BEATS: Beat[] = [
  {img: 'ul-wood-studio', fit: 'cover', kicker: 'WHERE THE mk5 LIVES', headline: 'A DESK BUILT FOR ONE PERSON', body: 'Synths, a mic and a pair of monitors — the UltraLite-mk5 is sized for exactly this kind of room, not a commercial studio.', dur: 180},
  {img: 'ul-render-34', fit: 'contain', kicker: 'ALWAYS ON THE DESK', headline: 'SMALL ENOUGH TO STAY OUT', body: 'It never needs to be packed away between sessions — small enough to just live where the work happens.', dur: 180},
];
export const U10: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="ul-wood-studio" opacity={0.16} blur={64} tint="rgba(4,10,10,0.9)" />
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="02 / 04" />
    <HeroBeats beats={U10_BEATS} accent={A} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U11 */
const U11_BEATS: Beat[] = [
  {img: 'ul-black-hero', fit: 'cover', kicker: 'WHERE THE mk5 LIVES', headline: 'GRAB IT AND GO', body: 'One bag holds the interface, cables and a laptop — a full 40-channel rig, ready for someone else’s room.', dur: 165},
  {img: 'ul-desk-hero', fit: 'cover', kicker: 'SET UP IN MINUTES', headline: 'NO PATCHBAY TO REBUILD', body: 'Stored CueMix 5 mixes mean the monitor mix is already right when the cables go back in.', dur: 165},
];
export const U11: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.void}}>
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="03 / 04" />
    <HeroBeats beats={U11_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U12 */
const U12_BEATS: Beat[] = [
  {img: 'ul-ipad-cuemix', fit: 'contain', kicker: 'WHERE THE mk5 LIVES', headline: 'MIXING FROM THE BACK OF THE ROOM', body: 'CueMix 5 on iPad means the monitor mix gets built from where the performer or the audience actually is.', dur: 165},
  {img: 'ul-render-top', fit: 'contain', kicker: 'ONE INTERFACE, MANY ROLES', headline: 'RECORDING RIG BY DAY, PODCAST BY NIGHT', body: 'The same forty channels that track a band also carry a two-person podcast without reconfiguring anything.', dur: 165},
];
export const U12: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 68% 48% at 45% 44%, rgba(47,212,200,0.12), rgba(0,0,0,0) 74%)'}} />
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="04 / 04" />
    <HeroBeats beats={U12_BEATS} accent={A} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- U13 */
/* 360f/12s — price recap + MOTU logo card (2 beats: price, logo+CTA). */
export const U13: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const priceG = pop(f, 10, 16);
  const logoAt = 190;
  const logoG = ramp(f, [logoAt, logoAt + 16], [0, 1]);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 74% 52% at 50% 46%, rgba(255,194,74,0.10), rgba(0,0,0,0) 74%)'}} />
      <LFHead kicker="ULTRALITE-mk5 · PRICE" accent={C.gold} right="INCLUDING GST" />
      <div style={{opacity: Math.min(1, priceG * 1.4), transform: `translateY(${(1 - priceG) * 24}px)`}}>
        <PriceCard box={{l: 90, t: 150, w: 1740, h: 340}} img="ul-render-34" accent={A} name="ULTRALITE-mk5" price={PRICE.ul.value} note={PRICE.ul.note} delay={10} dur={dur} />
      </div>
      <div style={{opacity: logoG, transform: `translateY(${(1 - logoG) * 18}px)`}}>
        <LogoCard brand="motu" box={{l: 90, t: 540, w: 500, h: 220}} accent={A} delay={logoAt} />
        <div style={{position: 'absolute', left: 640, top: 560, width: 1190}}>
          <Label size={19} color={C.inkDim} tracking={2.6}>SHIVANSH ELECTRONICS · AUTHORIZED DISTRIBUTOR OF MOTU</Label>
          <Display size={44} color={C.ink} style={{marginTop: 10}} caps={false}>
            DM or call for the best price.
          </Display>
        </div>
      </div>
    </AbsoluteFill>
  );
};
