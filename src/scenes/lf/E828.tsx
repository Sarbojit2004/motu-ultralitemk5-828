import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box, Reveal} from '../../components/Photo';
import {Display, Kicker, Body, CountUp} from '../../components/Type';
import {Label} from '../../components/lf/LFType';
import {LFHead} from '../../components/lf/LFHead';
import {HeroBeats, GroupBeat, Beat} from '../../components/lf/BeatCycle';
import {PriceCard} from '../../components/lf/PriceCard';
import {LogoCard} from '../../components/lf/LogoCard';
import {Callout, Rule, Stat} from '../../components/Bits';
import {C} from '../../lib/lf-theme';
import {ramp, pop, sceneIn, EASE_IN_OUT} from '../../lib/anim';
import {PRICE} from '../../lib/copy';

const A = C.e8;
const FULL: Box = {l: 0, t: 0, w: 1920, h: 924};

/** Channel-count ladder — the 828's own signature graphic, carried over from the reel. */
const Ladder: React.FC<{count: number; box: Box; delay: number; color: string; label: string}> = ({
  count,
  box,
  delay,
  color,
  label,
}) => {
  const f = useCurrentFrame();
  const gap = 4;
  const bw = (box.w - gap * (count - 1)) / count;
  return (
    <div style={{position: 'absolute', left: box.l, top: box.t, width: box.w, height: box.h}}>
      <div style={{display: 'flex', gap, alignItems: 'flex-end', height: box.h - 30}}>
        {Array.from({length: count}).map((_, i) => {
          const g = ramp(f, [delay + i * 1.2, delay + i * 1.2 + 12], [0, 1]);
          const h = (0.32 + ((i * 37) % 11) / 16) * (box.h - 30);
          return <div key={i} style={{width: bw, height: h * g, background: `linear-gradient(180deg, ${color}, ${color}55)`, borderRadius: 2}} />;
        })}
      </div>
      <Label size={17} color={color} tracking={1.8} style={{marginTop: 10}}>{label}</Label>
    </div>
  );
};

/* --------------------------------------------------------------- E1 */
export const E1: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const pA = 1 - ramp(f, [140, 156], [0, 1], EASE_IN_OUT);
  const pB = ramp(f, [158, 178], [0, 1], EASE_IN_OUT);
  const t = pop(f, 8, 15);

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <div style={{opacity: pA}}>
        <Photo name="e8-render-34a" box={FULL} dur={dur} fit="cover" kb={{z: [1.14, 1.02], x: [-2, 1]}} radius={0} border={null} shade />
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,6,10,0.68) 0%, rgba(4,6,10,0.08) 30%, rgba(4,6,10,0.60) 66%, rgba(4,6,10,0.93) 100%)'}} />
        <div style={{position: 'absolute', left: 90, top: 540, width: 1740, opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 36}px)`}}>
          <Kicker color={A} size={26}>CHAPTER THREE · PART TWO</Kicker>
          <Display size={186} color={C.ink} style={{marginTop: 8}}>828</Display>
          <Body size={28} style={{marginTop: 12, width: 1300}}>
            A rack unit built to sit at the centre of a room and run all of it.
          </Body>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: pB}}>
        <PhotoBackdrop name="e8-render-34a" opacity={0.16} blur={64} tint="rgba(12,7,4,0.92)" />
        <LFHead kicker="MOTU 828" accent={A} right="28 × 32" delay={158} />
        <Photo name="e8-render-34b" box={{l: 200, t: 150, w: 1520, h: 300}} dur={dur} fit="contain" kb={{z: [1.0, 1.05]}} radius={0} border={null} glow="rgba(255,138,61,0.22)" />
        <Ladder count={28} box={{l: 90, t: 490, w: 1740, h: 150}} delay={172} color={A} label="28 INPUTS" />
        <Ladder count={32} box={{l: 90, t: 660, w: 1740, h: 150}} delay={200} color={C.gold} label="32 OUTPUTS" />
        <div style={{position: 'absolute', left: 90, top: 838, width: 1740}}>
          <Display size={54} color={C.ink}>60 CHANNELS AT ONCE</Display>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- E2 */
const E2_BEATS: Beat[] = [
  {img: 'e8-render-rear-a', fit: 'contain', kicker: '828 · THE UNIT', headline: 'ONE RACK SPACE', body: 'A full 19-inch, single-rack-space chassis with an internal power supply — no wall wart to lose.', chips: ['1U RACK', 'INTERNAL PSU'], dur: 165},
  {img: 'e8-render-rear-b', fit: 'contain', kicker: '828 · THE UNIT', headline: 'EVERY SOCKET ON THE BACK', body: 'Analog, digital, MIDI and USB all terminate on the rear, so the front stays a pure control surface.', chips: ['STEEL CHASSIS', 'IEC MAINS'], dur: 165},
];
export const E2: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="e8-macbook-rack" opacity={0.12} blur={66} tint="rgba(12,8,5,0.94)" />
    <LFHead kicker="THE PHYSICAL BUILD" accent={A} right="828" />
    <HeroBeats beats={E2_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E3 */
/* 420f/14s — the RGB LCD, magnifier device (2 beats). */
export const E3: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const strip: Box = {l: 160, t: 220, w: 1600, h: 260};
  const w = ramp(f, [0, 20], [0, 1]);
  const lx = ramp(f, [24, 66], [280, 1080], EASE_IN_OUT);
  const lock = ramp(f, [66, 78], [0, 1]);
  const zoom = ramp(f, [80, 100], [0, 1]);
  const swap = ramp(f, [230, 246], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 74% 46% at 50% 50%, rgba(255,138,61,0.13), rgba(0,0,0,0) 74%)'}} />
      <LFHead kicker="THE FRONT PANEL IS A SCREEN" accent={A} right="828 ONLY" />
      <Reveal p={w} dir="l">
        <Photo name="e8-front-elev" box={strip} dur={dur} fit="contain" radius={0} border={null} glow="rgba(255,138,61,0.16)" />
      </Reveal>
      <div style={{position: 'absolute', left: lx, top: strip.t + 54, width: 280, height: 140, border: `2px solid ${A}`, borderRadius: 8, boxShadow: `0 0 28px 2px ${A}66, inset 0 0 24px ${A}22`, opacity: w}} />
      <div style={{position: 'absolute', left: lx + 140, top: strip.t + 194, width: 2, height: 140 * lock, background: `linear-gradient(180deg, ${A}, ${A}00)`}} />
      <div style={{opacity: zoom, transform: `scale(${0.9 + zoom * 0.1})`}}>
        <div style={{opacity: 1 - swap}}>
          <Photo name="e8-lcd-a" box={{l: 260, t: 500, w: 1400, h: 380}} dur={dur} fit="contain" radius={16} border={`${A}55`} />
        </div>
        <div style={{opacity: swap}}>
          <Photo name="e8-lcd-b" box={{l: 260, t: 500, w: 1400, h: 380}} dur={dur} fit="contain" radius={16} border={`${A}55`} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 90, top: 118, width: 1740, opacity: ramp(f, [10, 26], [0, 1])}}>
        <Display size={58} color={C.ink}>METERS FOR EVERY I/O, ALWAYS ON.</Display>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- E4 */
const E4_BEATS: Beat[] = [
  {img: 'e8-monitor-buttons', fit: 'contain', kicker: 'A CONTROL ROOM IN 1U', headline: 'TALKBACK, ONE BUTTON AWAY', body: 'A dedicated talkback mic reaches the live room instantly — no separate box, no extra cable run.', dur: 175},
  {img: 'e8-monitor-panel', fit: 'contain', kicker: 'A CONTROL ROOM IN 1U', headline: 'A / B MONITOR SWITCHING', body: 'Flip between two monitor pairs instantly — the kind of control that used to need a separate monitor controller.', dur: 175},
];
export const E4: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="e8-mic-rack" opacity={0.14} blur={64} tint="rgba(12,8,5,0.92)" />
    <LFHead kicker="MONITOR CONTROL" accent={A} right="828 ONLY" />
    <HeroBeats beats={E4_BEATS} accent={A} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E5 */
const E5_BEATS: Beat[] = [
  {img: 'e8-front-elev-slim', fit: 'contain', bg: '#0C0F14', kicker: 'REFERENCE CHECKS', headline: 'MONO · MUTE · DIM', body: 'Fold to mono, kill the signal, or pull the level down for a phone call — all in one press, on the front panel.', dur: 165},
  {img: 'e8-mic-rack', fit: 'cover', kicker: 'TWO PERFORMERS, TWO MIXES', headline: 'INDEPENDENT HEADPHONE OUTS', body: 'Two front-panel headphone jacks carry two genuinely separate cue mixes — no compromise between performers.', dur: 165},
];
export const E5: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 48% at 42% 44%, rgba(255,138,61,0.12), rgba(0,0,0,0) 74%)'}} />
    <LFHead kicker="MONITOR CONTROL" accent={A} right="828 ONLY" />
    <HeroBeats beats={E5_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E6 */
/* 540f/18s — rear panel callout sweep, 8 pins (9 beats). */
const E6_PINS: {x: number; label: string; sub: string; side: 'up' | 'down'; d: number}[] = [
  {x: 180, label: 'IEC MAINS', sub: 'INTERNAL PSU', side: 'up', d: 40},
  {x: 350, label: 'USB 3', sub: '5 Gbps', side: 'down', d: 74},
  {x: 540, label: 'OPTICAL A', sub: '8-CH ADAT', side: 'up', d: 108},
  {x: 710, label: 'OPTICAL B', sub: '8-CH ADAT', side: 'down', d: 142},
  {x: 900, label: 'S/PDIF', sub: 'RCA COAXIAL', side: 'up', d: 176},
  {x: 1080, label: 'MIDI I/O', sub: '5-PIN DIN', side: 'down', d: 210},
  {x: 1300, label: 'LINE OUT 1–8', sub: 'BALANCED TRS', side: 'up', d: 244},
  {x: 1520, label: 'MAIN OUT', sub: 'XLR', side: 'down', d: 278},
  {x: 1700, label: 'MIC INSERT', sub: 'SEND / RETURN', side: 'up', d: 312},
];
export const E6: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const w = ramp(f, [0, 22], [0, 1]);
  const panel: Box = {l: 120, t: 300, w: 1680, h: 320};
  const inset = pop(f, 340, 17);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="e8-rear-cabled" opacity={0.10} blur={68} tint="rgba(12,8,5,0.95)" />
      <LFHead kicker="REAR CONNECTIVITY" accent={A} right="28 IN · 32 OUT" />
      <div style={{position: 'absolute', left: 90, top: 118, width: 1740}}>
        <Display size={54} color={C.ink}>SIXTEEN OPTICAL CHANNELS. TWO REAL INSERT LOOPS.</Display>
      </div>
      <Reveal p={w} dir="r">
        <Photo name="e8-rear-elev" box={panel} dur={dur} fit="contain" radius={0} border={null} glow="rgba(255,138,61,0.16)" />
      </Reveal>
      {E6_PINS.map((p) => (
        <Callout key={p.label} x={p.x} y={p.side === 'up' ? panel.t + 34 : panel.t + panel.h - 34} len={p.side === 'up' ? 62 : 52} label={p.label} sub={p.sub} accent={A} side={p.side} delay={p.d} width={210} />
      ))}
      <div style={{opacity: Math.min(1, inset * 1.4), transform: `translateY(${(1 - inset) * 22}px)`}}>
        <Photo name="e8-line-in-insert" box={{l: 1330, t: 774, w: 500, h: 130}} dur={dur} fit="contain" radius={14} bg="rgba(10,8,7,0.9)" border={`${A}55`} />
        <div style={{position: 'absolute', left: 90, top: 776, width: 1180}}>
          <Body size={25}>Each mic channel gets a dedicated send/return loop — outboard EQ or compression, patched in without leaving the signal path.</Body>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- E7 */
const E7_BEATS: Beat[] = [
  {img: 'e8-loopback-menu', fit: 'contain', bg: '#111418', kicker: 'STREAMING & PODCAST', headline: 'SEND THE COMPUTER BACK TO ITSELF', body: 'Dedicated loopback channels put system audio straight into the mix — a stream, a podcast or a remote guest sits alongside the mics.', chips: ['LOOPBACK IN 1–2'], dur: 180},
  {img: 'e8-usb-5gbps', fit: 'contain', bg: '#0C0F14', kicker: 'THE BUS BEHIND IT', headline: '5 Gbps OVER USB 3', body: 'Sixty channels at once needs real bandwidth — USB 3 carries all of it with headroom to spare.', dur: 180},
];
export const E7: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 66% 48% at 40% 42%, rgba(255,138,61,0.14), rgba(0,0,0,0) 72%)'}} />
    <LFHead kicker="LOOPBACK" accent={A} right="828 ONLY" />
    <HeroBeats beats={E7_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E8 */
export const E8: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const g = pop(f, 14, 16);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="e8-rear-cabled" opacity={0.14} blur={64} tint="rgba(12,8,5,0.92)" />
      <LFHead kicker="ROUND-TRIP LATENCY" accent={A} right="96 kHz" />
      <div style={{position: 'absolute', left: 90, top: 118, width: 1740}}>
        <Display size={62} color={C.ink}>A HEAVIER INTERFACE, STILL FAST.</Display>
      </div>
      <div style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 22}px)`}}>
        <Photo name="e8-latency" box={{l: 90, t: 260, w: 1000, h: 430}} dur={dur} fit="contain" radius={16} bg="rgba(10,8,7,0.86)" border={`${A}3D`} />
        <Photo name="e8-render-34b" box={{l: 1160, t: 260, w: 670, h: 270}} dur={dur} fit="contain" radius={0} border={null} glow="rgba(255,138,61,0.18)" />
        <div style={{position: 'absolute', left: 1160, top: 560, width: 670}}>
          <CountUp to={2} dur={40} decimals={0} delay={24} size={92} color={C.ink} suffix="ms" />
        </div>
      </div>
      <Body size={26} style={{position: 'absolute', left: 90, top: 782, width: 1740}}>
        Roughly two milliseconds round trip — sixty channels of headroom without a latency penalty.
      </Body>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- E9 */
export const E9: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const g = pop(f, 14, 16);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="e8-macbook-rack" opacity={0.12} blur={64} tint="rgba(12,8,5,0.94)" />
      <LFHead kicker="CONVERSION" accent={A} right="ESS SABRE32 ULTRA" />
      <div style={{position: 'absolute', left: 90, top: 118, width: 1740}}>
        <Display size={58} color={C.ink}>REFERENCE-GRADE, START TO FINISH.</Display>
      </div>
      <div style={{opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 20}px)`}}>
        <Photo name="e8-ess-logo" box={{l: 90, t: 250, w: 800, h: 300}} dur={dur} fit="contain" radius={16} bg="rgba(10,8,7,0.92)" border={`${A}3D`} />
        <Photo name="e8-macbook-rack" box={{l: 930, t: 250, w: 900, h: 300}} dur={dur} fit="cover" kb={{z: [1.05, 1.13]}} radius={16} border={`${A}30`} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 606, width: 1740, display: 'flex', justifyContent: 'space-between'}}>
        <Stat value="125" unit="dB" caption="DYNAMIC RANGE" accent={A} delay={40} size={72} />
        <Stat value="−114" unit="dB" caption="THD + N" accent={A} delay={48} size={72} />
        <Stat value="192" unit="kHz" caption="MAX RATE" accent={A} delay={56} size={72} />
      </div>
      <Rule box={{l: 90, t: 730, w: 1740}} accent={A} delay={64} dur={20} />
      <Body size={26} style={{position: 'absolute', left: 90, top: 764, width: 1740}}>
        The same converters that anchor MOTU's studio-grade interfaces — clean gain from the mic input all the way to the main out.
      </Body>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- E10 */
const E10_BEATS: Beat[] = [
  {img: 'e8-sw-performer-a', fit: 'contain', bg: '#12151B', kicker: 'WHAT SHIPS WITH IT', headline: 'A FULL DAW, INCLUDED', body: 'MOTU Performer Lite and Ableton Live Lite both come in the box — a complete recording rig on day one.', dur: 135},
];
export const E10: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const gAt = 135;
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="e8-sw-mosaic" opacity={0.10} blur={66} tint="rgba(12,8,5,0.95)" />
      <LFHead kicker="WHAT SHIPS WITH IT" accent={A} right="INCLUDED" />
      {f < gAt ? (
        <HeroBeats beats={E10_BEATS} accent={A} side="right" dur={dur} />
      ) : (
        <GroupBeat
          images={['e8-sw-soundbank', 'e8-sw-bigfish', 'e8-sw-loopmasters']}
          labels={['MOTU INSTRUMENTS', 'BIG FISH AUDIO', 'LOOPMASTERS']}
          kicker="6 GB OF SOUNDS"
          headline="SAMPLE LIBRARIES, READY TO LOAD"
          body="Loops and instrument packs from three studio-grade libraries ship alongside the DAW — no separate purchase needed to start writing."
          accent={A}
          dur={dur}
          delay={gAt}
        />
      )}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- E11 */
const E11_BEATS: Beat[] = [
  {img: 'e8-modular-wall', fit: 'cover', kicker: 'WHERE THE 828 LIVES', headline: 'FEED IT A WALL OF GEAR', body: 'Ten analog inputs plus sixteen optical channels — modular rigs and synth racks land on one interface, not three.', dur: 180},
  {img: 'e8-korg-synth', fit: 'cover', kicker: 'ANALOG SOURCES', headline: 'HARDWARE SYNTHS, NATIVE', body: 'Line-level analog gear plugs straight into the eight line inputs — no extra mixer stage in between.', dur: 180},
];
export const E11: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.void}}>
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="01 / 04" />
    <HeroBeats beats={E11_BEATS} accent={A} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E12 */
const E12_BEATS: Beat[] = [
  {img: 'e8-big-studio', fit: 'cover', kicker: 'WHERE THE 828 LIVES', headline: 'RUN THE WHOLE ROOM', body: 'Console, monitors, outboard — everything in a commercial studio terminates at the 828, and stays that way.', dur: 180},
  {img: 'e8-footswitch', fit: 'cover', kicker: 'HANDS-FREE CONTROL', headline: 'A FOOTSWITCH FOR PUNCH-IN', body: 'A simple pedal wired to the 828 means punch-in and punch-out never need a hand off the instrument.', dur: 180},
];
export const E12: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <PhotoBackdrop name="e8-big-studio" opacity={0.14} blur={64} tint="rgba(6,9,14,0.92)" />
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="02 / 04" />
    <HeroBeats beats={E12_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E13 */
const E13_BEATS: Beat[] = [
  {img: 'e8-guitar-vox', fit: 'cover', kicker: 'WHERE THE 828 LIVES', headline: 'TRACK A LIVE BAND, PROPERLY', body: 'Two preamps with inserts, eight line inputs, two cue mixes — enough to record a room full of players at once.', dur: 165},
  {img: 'e8-line-outs', fit: 'cover', kicker: 'CLEAN SIGNAL, EVERYWHERE', headline: 'EVERY AMP GETS ITS OWN FEED', body: 'Eight balanced line outs mean monitors, headphone amps and cue systems never have to share a bus.', dur: 165},
];
export const E13: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.void}}>
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="03 / 04" />
    <HeroBeats beats={E13_BEATS} accent={A} side="left" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E14 */
const E14_BEATS: Beat[] = [
  {img: 'e8-optical-rear', fit: 'contain', bg: '#111418', kicker: 'WHERE THE 828 LIVES', headline: 'A PODCAST RIG THAT SCALES', body: 'Loopback plus sixteen optical channels means a two-person podcast and a five-guest panel use the exact same interface.', dur: 165},
  {img: 'e8-spdif', fit: 'contain', bg: '#0C0F14', kicker: 'DIGITAL IN THE CHAIN', headline: 'ROOM FOR OUTBOARD PROCESSING', body: 'S/PDIF brings a hardware compressor or a broadcast processor into the same session without eating an analog channel.', dur: 165},
];
export const E14: React.FC<{dur: number}> = ({dur}) => (
  <AbsoluteFill style={{backgroundColor: C.bg}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 68% 48% at 55% 44%, rgba(255,138,61,0.12), rgba(0,0,0,0) 74%)'}} />
    <LFHead kicker="REAL-WORLD WORKFLOWS" accent={A} right="04 / 04" />
    <HeroBeats beats={E14_BEATS} accent={A} side="right" dur={dur} />
  </AbsoluteFill>
);

/* --------------------------------------------------------------- E15 */
export const E15: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const priceG = pop(f, 10, 16);
  const logoAt = 190;
  const logoG = ramp(f, [logoAt, logoAt + 16], [0, 1]);
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 74% 52% at 50% 46%, rgba(255,194,74,0.10), rgba(0,0,0,0) 74%)'}} />
      <LFHead kicker="828 · PRICE" accent={C.gold} right="INCLUDING GST" />
      <div style={{opacity: Math.min(1, priceG * 1.4), transform: `translateY(${(1 - priceG) * 24}px)`}}>
        <PriceCard box={{l: 90, t: 150, w: 1740, h: 340}} img="e8-render-34b" accent={A} name="828" price={PRICE.e8.value} note={PRICE.e8.note} delay={10} dur={dur} />
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
