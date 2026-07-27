import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop} from '../../components/Photo';
import {Display, Kicker, Body} from '../../components/Type';
import {Label} from '../../components/lf/LFType';
import {LFHead} from '../../components/lf/LFHead';
import {PriceCard} from '../../components/lf/PriceCard';
import {Rule, ChipRow} from '../../components/Bits';
import {C, F2} from '../../lib/lf-theme';
import {ramp, pop, sceneIn, EASE_IN_OUT, EASE_OUT} from '../../lib/anim';
import {COMPARE, PRICE} from '../../lib/copy';

/* --------------------------------------------------------------- CP1 */
/* 420f/14s — chapter title + both-together hero (2 beats). */
export const CP1: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const t = pop(f, 8, 15);
  const chipsAt = 200;

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <Photo name="ul-render-top" box={{l: 0, t: 0, w: 960, h: 924}} dur={dur} fit="cover" radius={0} border={null} kb={{z: [1.08, 1.0]}} />
      <Photo name="e8-render-34a" box={{l: 960, t: 0, w: 960, h: 924}} dur={dur} fit="cover" radius={0} border={null} kb={{z: [1.0, 1.08]}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,6,10,0.30) 0%, rgba(4,6,10,0.80) 100%)'}} />
      <div style={{position: 'absolute', left: 958, top: 0, width: 4, height: 924, background: `linear-gradient(180deg, ${C.brand}00, ${C.brand}, ${C.brand}00)`}} />
      <div style={{position: 'absolute', left: 90, top: 620, width: 1740, textAlign: 'center', opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 30}px)`}}>
        <Kicker color={C.brand} size={26}>CHAPTER FOUR</Kicker>
        <Display size={104} color={C.ink} align="center" style={{marginTop: 12}}>HOW THEY COMPARE</Display>
        <Body size={27} align="center" style={{marginTop: 16}}>Same CueMix 5 foundation. Two genuinely different machines.</Body>
      </div>
      <div style={{position: 'absolute', left: 90, top: 800, width: 1740, opacity: ramp(f, [chipsAt, chipsAt + 18], [0, 1])}}>
        <ChipRow items={['SPECS', 'CONNECTIVITY', 'WHICH ONE IS YOURS', 'PRICE']} accent={C.brand} justify="center" size={20} />
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- CP2 */
/* 720f/24s — animated spec comparison table, two pages (2 beats). */
const PAGE_AT = 380;

const Row: React.FC<{r: (typeof COMPARE)[number]; y: number; delay: number; vis: number}> = ({r, y, delay, vis}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [delay, delay + 14], [0, 1], EASE_OUT) * vis;
  const shared = !r.split;
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: y,
        width: 1740,
        height: 62,
        opacity: g,
        transform: `translateY(${(1 - g) * 14}px)`,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 11,
        background: shared ? 'rgba(61,139,255,0.12)' : 'rgba(255,255,255,0.035)',
        border: `1px solid ${shared ? 'rgba(61,139,255,0.34)' : 'rgba(255,255,255,0.07)'}`,
        boxSizing: 'border-box',
      }}
    >
      <div style={{width: 570, textAlign: 'right', paddingRight: 22, fontFamily: F2.label, fontWeight: 700, fontSize: 22, color: shared ? C.brand : C.ul}}>{r.ul}</div>
      <div style={{width: 600, textAlign: 'center', fontFamily: F2.label, fontWeight: 500, fontSize: 14, letterSpacing: 1.6, color: C.inkDim}}>{r.k}</div>
      <div style={{width: 570, textAlign: 'left', paddingLeft: 22, fontFamily: F2.label, fontWeight: 700, fontSize: 22, color: shared ? C.brand : C.e8}}>{r.e8}</div>
    </div>
  );
};

export const CP2: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const p1 = 1 - ramp(f, [PAGE_AT - 14, PAGE_AT], [0, 1], EASE_IN_OUT);
  const p2 = ramp(f, [PAGE_AT + 2, PAGE_AT + 16], [0, 1], EASE_IN_OUT);
  const page1 = COMPARE.slice(0, 8);
  const page2 = COMPARE.slice(8);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'linear-gradient(100deg, rgba(47,212,200,0.09) 0%, rgba(0,0,0,0) 42%), linear-gradient(260deg, rgba(255,138,61,0.09) 0%, rgba(0,0,0,0) 42%)'}} />
      <LFHead kicker="SPEC BY SPEC" accent={C.brand} right="BOTH IN STOCK" />
      <div style={{position: 'absolute', left: 90, top: 118, width: 1740, display: 'flex', justifyContent: 'space-between'}}>
        <Label size={22} color={C.ul} tracking={2}>ULTRALITE-mk5</Label>
        <Label size={22} color={C.e8} tracking={2}>828</Label>
      </div>
      <Rule box={{l: 90, t: 164, w: 1740}} accent={C.brand} delay={10} dur={20} />

      {page1.map((r, i) => <Row key={r.k} r={r} y={196 + i * 74} delay={20 + i * 8} vis={p1} />)}
      {page2.map((r, i) => <Row key={r.k} r={r} y={196 + i * 74} delay={PAGE_AT + 6 + i * 8} vis={p2} />)}

      <div style={{position: 'absolute', left: 90, top: 862, width: 1740, textAlign: 'center'}}>
        <Label size={18} color={C.brand} tracking={2.4}>BLUE ROWS = WHAT THEY SHARE</Label>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- CP3 */
/* 600f/20s — connectivity comparison, side by side rear panels (2 beats). */
export const CP3: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const gL = pop(f, 10, 16);
  const gR = pop(f, 26, 16);
  const chipsAt = 120;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="e8-rear-cabled" opacity={0.08} blur={70} tint="rgba(6,9,14,0.95)" />
      <LFHead kicker="CONNECTIVITY, SIDE BY SIDE" accent={C.brand} right="I/O AT A GLANCE" />
      <div style={{position: 'absolute', left: 90, top: 118, width: 1740}}>
        <Display size={56} color={C.ink}>ONE SCALES DOWN. ONE SCALES UP.</Display>
      </div>

      <div style={{opacity: Math.min(1, gL * 1.4), transform: `translateY(${(1 - gL) * 20}px)`}}>
        <Photo name="ul-rear-elev" box={{l: 80, t: 300, w: 850, h: 220}} dur={dur} fit="contain" radius={16} bg="rgba(9,14,20,0.7)" border={`${C.ul}3D`} glow="rgba(47,212,200,0.14)" />
        <div style={{position: 'absolute', left: 80, top: 546, width: 850, textAlign: 'center'}}>
          <Label size={20} color={C.ul} tracking={2.4}>ULTRALITE-mk5 · 18 IN · 22 OUT</Label>
        </div>
      </div>
      <div style={{opacity: Math.min(1, gR * 1.4), transform: `translateY(${(1 - gR) * 20}px)`}}>
        <Photo name="e8-rear-elev" box={{l: 990, t: 300, w: 850, h: 220}} dur={dur} fit="contain" radius={16} bg="rgba(10,8,7,0.7)" border={`${C.e8}3D`} glow="rgba(255,138,61,0.14)" />
        <div style={{position: 'absolute', left: 990, top: 546, width: 850, textAlign: 'center'}}>
          <Label size={20} color={C.e8} tracking={2.4}>828 · 28 IN · 32 OUT</Label>
        </div>
      </div>

      <div style={{position: 'absolute', left: 80, top: 610, width: 850}}>
        <ChipRow items={['1 OPTICAL BANK', '1 HEADPHONE OUT', 'EXTERNAL PSU']} accent={C.ul} delay={chipsAt} per={5} size={19} justify="center" />
      </div>
      <div style={{position: 'absolute', left: 990, top: 610, width: 850}}>
        <ChipRow items={['2 OPTICAL BANKS', '2 HEADPHONE OUTS', 'INSERT LOOPS', 'LOOPBACK']} accent={C.e8} delay={chipsAt + 10} per={5} size={19} justify="center" />
      </div>

      <Body size={26} style={{position: 'absolute', left: 90, top: 700, width: 1740, opacity: ramp(f, [220, 240], [0, 1])}}>
        The UltraLite-mk5 covers a compact rig completely. The 828 adds headroom for a bigger one — more optical, more monitoring control, more expansion.
      </Body>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- CP4 */
/* 540f/18s — "which one is you" decision columns (2 beats: split, then together). */
const PICK_UL = [
  'You move between rooms, stages and desks',
  'Two mic inputs and six line ins are enough',
  'You want an iPad to be a valid control surface',
  'The whole rig has to fit in one bag',
];
const PICK_E8 = [
  'The interface lives in a rack and stays there',
  'You need talkback and A/B monitor switching',
  'Two performers need two different cue mixes',
  'You stream, podcast, or run sixteen optical channels',
];

const Bullet: React.FC<{t: string; d: number; color: string}> = ({t, d, color}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [d, d + 14], [0, 1], EASE_OUT);
  return (
    <div style={{display: 'flex', gap: 15, marginBottom: 22, opacity: g, transform: `translateX(${(1 - g) * 20}px)`}}>
      <div style={{width: 9, height: 9, borderRadius: 99, background: color, marginTop: 11, flexShrink: 0, boxShadow: `0 0 12px 2px ${color}88`}} />
      <div style={{fontFamily: F2.label, fontWeight: 500, fontSize: 25, lineHeight: 1.32, color: C.inkSoft}}>{t}</div>
    </div>
  );
};

export const CP4: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const pA = 1 - ramp(f, [300, 320], [0, 1], EASE_IN_OUT);
  const pB = ramp(f, [324, 344], [0, 1], EASE_IN_OUT);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="e8-big-studio" opacity={0.10} blur={68} tint="rgba(6,9,14,0.94)" />
      <div style={{position: 'absolute', inset: 0, opacity: pA}}>
        <LFHead kicker="WHICH ONE IS YOURS" accent={C.brand} right="PICK BY WORKFLOW" />
        <div style={{position: 'absolute', left: 90, top: 150, width: 830}}>
          <Display size={54} color={C.ul}>ULTRALITE-mk5</Display>
          <div style={{marginTop: 26}}>{PICK_UL.map((t, i) => <Bullet key={t} t={t} d={16 + i * 10} color={C.ul} />)}</div>
        </div>
        <div style={{position: 'absolute', left: 1000, top: 150, width: 830}}>
          <Display size={54} color={C.e8}>828</Display>
          <div style={{marginTop: 26}}>{PICK_E8.map((t, i) => <Bullet key={t} t={t} d={22 + i * 10} color={C.e8} />)}</div>
        </div>
        <div style={{position: 'absolute', left: 958, top: 150, width: 1, height: 620, background: `linear-gradient(180deg, ${C.line}00, ${C.line}, ${C.line}00)`}} />
      </div>

      <div style={{position: 'absolute', inset: 0, opacity: pB}}>
        <LFHead kicker="BOTH, FROM ONE DISTRIBUTOR" accent={C.brand} right="IN STOCK" delay={324} />
        <Photo name="ul-render-front" box={{l: 160, t: 220, w: 780, h: 420}} dur={540} fit="contain" radius={0} border={null} glow="rgba(47,212,200,0.2)" />
        <Photo name="e8-render-34b" box={{l: 980, t: 220, w: 780, h: 420}} dur={540} fit="contain" radius={0} border={null} glow="rgba(255,138,61,0.2)" />
        <Rule box={{l: 90, t: 700, w: 1740}} accent={C.brand} delay={340} dur={20} />
        <div style={{position: 'absolute', left: 90, top: 736, width: 1740, textAlign: 'center'}}>
          <Display size={50} color={C.ink}>THE SAME CUEMIX 5. TWO DIFFERENT MACHINES.</Display>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- CP5 */
/* 420f/14s — both prices together, final comparison card (2 beats). */
export const CP5: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const g1 = pop(f, 10, 16);
  const g2 = pop(f, 50, 16);
  const cta = ramp(f, [180, 198], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 78% 52% at 50% 42%, rgba(255,194,74,0.10), rgba(0,0,0,0) 74%)'}} />
      <LFHead kicker="BOTH, PRICED" accent={C.gold} right="INCLUDING GST" />
      <div style={{opacity: Math.min(1, g1 * 1.4), transform: `translateY(${(1 - g1) * 20}px)`}}>
        <PriceCard box={{l: 90, t: 130, w: 1740, h: 220}} img="ul-render-front" accent={C.ul} name="ULTRALITE-mk5" price={PRICE.ul.value} note={PRICE.ul.note} delay={10} dur={dur} />
      </div>
      <div style={{opacity: Math.min(1, g2 * 1.4), transform: `translateY(${(1 - g2) * 20}px)`}}>
        <PriceCard box={{l: 90, t: 372, w: 1740, h: 220}} img="e8-render-34b" accent={C.e8} name="828" price={PRICE.e8.value} note={PRICE.e8.note} delay={50} dur={dur} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 630, width: 1740, opacity: cta, textAlign: 'center'}}>
        <Display size={44} color={C.gold} align="center">DM OR CALL FOR THE BEST PRICE ON EITHER</Display>
      </div>
    </AbsoluteFill>
  );
};
