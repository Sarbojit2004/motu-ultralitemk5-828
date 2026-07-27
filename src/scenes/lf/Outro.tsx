import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop, Box} from '../../components/Photo';
import {Display, Kicker, Body} from '../../components/Type';
import {Label} from '../../components/lf/LFType';
import {LFHead} from '../../components/lf/LFHead';
import {LogoCard} from '../../components/lf/LogoCard';
import {Rule} from '../../components/Bits';
import {C, F2} from '../../lib/lf-theme';
import {ramp, pop, sceneIn, EASE_OUT} from '../../lib/anim';
import {CONTACT, BRAND, PRICE} from '../../lib/copy';

const FULL: Box = {l: 0, t: 0, w: 1920, h: 924};

/* --------------------------------------------------------------- OU1 */
/* 360f/12s — both products, final hero together (2 beats). */
export const OU1: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const t = pop(f, 10, 15);

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: out}}>
      <Photo name="e8-big-studio" box={FULL} dur={dur} fit="cover" kb={{z: [1.10, 1.0]}} radius={0} border={null} shade />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,6,10,0.60) 0%, rgba(4,6,10,0.20) 40%, rgba(4,6,10,0.85) 100%)'}} />
      <div style={{position: 'absolute', left: 90, top: 600, width: 1740, opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 30}px)`}}>
        <Kicker color={C.gold} size={26}>THE CLOSE</Kicker>
        <Display size={92} color={C.ink} style={{marginTop: 12}}>TWO WAYS INTO THE SAME ECOSYSTEM.</Display>
        <Body size={27} style={{marginTop: 16, width: 1400}}>
          UltraLite-mk5 for the rig that travels. 828 for the room that stays put. Both from Shivansh Electronics.
        </Body>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- OU2 */
/* 480f/16s — MOTU logo card + Shivansh Electronics logo card (2 beats). */
export const OU2: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const g1 = pop(f, 10, 16);
  const g2 = pop(f, 40, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 78% 54% at 50% 44%, rgba(255,194,74,0.10), rgba(0,0,0,0) 74%)'}} />
      <LFHead kicker="ORDER FROM" accent={C.gold} right="AUTHORIZED DISTRIBUTOR" />
      <div style={{position: 'absolute', left: 90, top: 130, width: 1740, textAlign: 'center'}}>
        <Display size={70} color={C.ink} align="center">SHIVANSH ELECTRONICS</Display>
      </div>
      <div style={{opacity: Math.min(1, g1 * 1.4), transform: `translateY(${(1 - g1) * 22}px)`}}>
        <LogoCard brand="motu" box={{l: 190, t: 320, w: 700, h: 400}} accent={C.brand} delay={10} />
      </div>
      <div style={{opacity: Math.min(1, g2 * 1.4), transform: `translateY(${(1 - g2) * 22}px)`}}>
        <LogoCard brand="shivansh" box={{l: 1030, t: 320, w: 700, h: 400}} accent={C.gold} delay={40} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 760, width: 1740, textAlign: 'center', opacity: ramp(f, [70, 90], [0, 1])}}>
        <Label size={20} color={C.inkDim} tracking={2.4}>{BRAND.distributor} ({BRAND.motuFull}) · {BRAND.region}</Label>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- OU3 */
/* 360f/12s — the distributor statement, spoken and shown (1 beat). */
export const OU3: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const g = pop(f, 10, 15);
  return (
    <AbsoluteFill style={{backgroundColor: C.void}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 50% 46%, rgba(61,139,255,0.14), rgba(0,0,0,0) 74%)'}} />
      <div style={{position: 'absolute', left: 160, top: 300, width: 1600, textAlign: 'center', opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 26}px)`}}>
        <Display size={62} color={C.ink} align="center" lh={1.05}>
          SHIVANSH ELECTRONICS IS THE AUTHORIZED DISTRIBUTOR
        </Display>
        <Display size={62} color={C.gold} align="center" lh={1.05} style={{marginTop: 4}}>
          OF MOTU FOR EAST &amp; NORTH-EAST INDIA.
        </Display>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- OU4 */
/* 720f/24s — the full contact/social block, staggered rows (11 beats). */
const SOCIALS: [string, string][] = [
  ['WEBSITE', CONTACT.web],
  ['SHIVANSH ELECTRONICS HUB', CONTACT.hub],
  ['INSTAGRAM', CONTACT.ig],
  ['FACEBOOK', CONTACT.fb],
  ['LINKEDIN', CONTACT.li],
  ['THREADS', CONTACT.th],
  ['TWITTER (X)', CONTACT.x],
  ['YOUTUBE', CONTACT.yt],
];

export const OU4: React.FC<{dur: number}> = () => {
  const f = useCurrentFrame();
  const h = pop(f, 6, 16);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <PhotoBackdrop name="e8-black-hero" opacity={0.10} blur={70} tint="rgba(6,8,13,0.95)" />
      <div style={{position: 'absolute', left: 90, top: 60, width: 1740, textAlign: 'center', opacity: Math.min(1, h * 1.4)}}>
        <Kicker color={C.gold} size={22} style={{letterSpacing: 5}}>STAY CONNECTED</Kicker>
        <Display size={56} color={C.ink} align="center" style={{marginTop: 10}}>FOLLOW &amp; JOIN THE COMMUNITY</Display>
      </div>
      <Rule box={{l: 90, t: 200, w: 1740}} accent={C.gold} delay={20} dur={22} />

      {SOCIALS.map(([k, v], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const g = ramp(f, [34 + i * 8, 48 + i * 8], [0, 1], EASE_OUT);
        return (
          <div key={k} style={{position: 'absolute', left: 130 + col * 880, top: 240 + row * 96, width: 820, opacity: g, transform: `translateY(${(1 - g) * 14}px)`}}>
            <Label size={16} color={C.inkDim} tracking={2.6}>{k}</Label>
            <div style={{fontFamily: F2.label, fontWeight: 600, fontSize: 26, color: C.ink, marginTop: 6}}>{v}</div>
          </div>
        );
      })}

      <div style={{position: 'absolute', left: 90, top: 660, width: 1740, textAlign: 'center', opacity: ramp(f, [140, 158], [0, 1])}}>
        <Label size={19} color={C.gold} tracking={1.8}>{CONTACT.waChannel} · whatsapp.com/channel/0029VbBzlQH3rZZfQBHsf20K</Label>
      </div>
      <div style={{position: 'absolute', left: 90, top: 700, width: 1740, display: 'flex', justifyContent: 'center', gap: 46, opacity: ramp(f, [156, 176], [0, 1])}}>
        {CONTACT.phones.map((p) => (
          <span key={p} style={{fontFamily: F2.label, fontWeight: 700, fontSize: 28, color: C.ink}}>{p}</span>
        ))}
      </div>
      <div style={{position: 'absolute', left: 90, top: 782, width: 1740, textAlign: 'center', opacity: ramp(f, [180, 198], [0, 1])}}>
        <Label size={17} color={C.inkDim} tracking={1.6}>SHOWROOM</Label>
        <div style={{fontFamily: F2.label, fontWeight: 500, fontSize: 22, color: C.inkSoft, marginTop: 6, whiteSpace: 'pre-line'}}>{CONTACT.address}</div>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- OU5 */
/* 480f/16s — invitation + both prices, one more time (2 beats). */
export const OU5: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const t = pop(f, 10, 15);
  const priceAt = 140;
  const g = ramp(f, [priceAt, priceAt + 18], [0, 1]);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 74% 50% at 50% 40%, rgba(255,194,74,0.10), rgba(0,0,0,0) 74%)'}} />
      <div style={{position: 'absolute', left: 90, top: 100, width: 1740, textAlign: 'center', opacity: Math.min(1, t * 1.4), transform: `translateY(${(1 - t) * 24}px)`}}>
        <Display size={58} color={C.ink} align="center">READY WHEN YOU ARE.</Display>
      </div>
      <div style={{opacity: g}}>
        <Photo name="ul-render-front" box={{l: 255, t: 300, w: 500, h: 170}} dur={dur} fit="contain" radius={0} border={null} glow="rgba(47,212,200,0.2)" />
        <Photo name="e8-render-34b" box={{l: 1165, t: 300, w: 500, h: 170}} dur={dur} fit="contain" radius={0} border={null} glow="rgba(255,138,61,0.2)" />
        <div style={{position: 'absolute', left: 90, top: 500, width: 830, textAlign: 'center'}}>
          <Kicker color={C.ul} size={20}>ULTRALITE-mk5</Kicker>
          <div style={{fontFamily: F2.display, fontWeight: 800, fontSize: 54, color: C.gold, marginTop: 8}}>Rs. {PRICE.ul.value}</div>
        </div>
        <div style={{position: 'absolute', left: 1000, top: 500, width: 830, textAlign: 'center'}}>
          <Kicker color={C.e8} size={20}>828</Kicker>
          <div style={{fontFamily: F2.display, fontWeight: 800, fontSize: 54, color: C.gold, marginTop: 8}}>Rs. {PRICE.e8.value}</div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 958, top: 300, width: 1, height: 340, background: `linear-gradient(180deg, ${C.line}00, ${C.line}, ${C.line}00)`}} />
      <div style={{position: 'absolute', left: 90, top: 720, width: 1740, textAlign: 'center', opacity: ramp(f, [190, 208], [0, 1])}}>
        <Label size={19} color={C.inkSoft} tracking={1.6}>BOTH PRICES INCLUDE GST · FINAL BEST PRICE VIA DM OR CALL</Label>
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- OU6 */
/* 600f/20s — final CTA, then fade to black (2 beats). */
export const OU6: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const g = pop(f, 10, 15);
  const fadeAt = dur - 90;
  const fadeOut = ramp(f, [fadeAt, dur], [1, 0]);

  return (
    <AbsoluteFill style={{backgroundColor: C.void, opacity: fadeOut}}>
      <PhotoBackdrop name="ul-black-hero" opacity={0.10} blur={70} tint="rgba(4,6,10,0.96)" />
      <div style={{position: 'absolute', left: 90, top: 260, width: 1740, textAlign: 'center', opacity: Math.min(1, g * 1.4), transform: `translateY(${(1 - g) * 26}px)`}}>
        <Display size={92} color={C.gold} align="center">DM OR CALL FOR THE BEST PRICE</Display>
        <Body size={28} align="center" style={{marginTop: 20}}>
          Shivansh Electronics — Authorized Distributor of MOTU, East &amp; North-East India.
        </Body>
      </div>
      <div style={{position: 'absolute', left: 90, top: 470, width: 1740, textAlign: 'center', opacity: ramp(f, [40, 60], [0, 1])}}>
        <div style={{fontFamily: F2.label, fontWeight: 700, fontSize: 34, color: C.ink, letterSpacing: 1}}>
          {CONTACT.phones.join('   ·   ')}
        </div>
      </div>
      <div style={{position: 'absolute', left: 90, top: 540, width: 1740, textAlign: 'center', opacity: ramp(f, [56, 76], [0, 1])}}>
        <Label size={22} color={C.gold} tracking={2}>{CONTACT.web}</Label>
      </div>
    </AbsoluteFill>
  );
};
