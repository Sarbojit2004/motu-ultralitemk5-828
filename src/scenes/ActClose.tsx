import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Photo, PhotoBackdrop} from '../components/Photo';
import {Display, Kicker, Body, Mono} from '../components/Type';
import {SceneHead, Panel, Rule} from '../components/Bits';
import {SquareEdge} from '../components/Frame';
import {C, F} from '../lib/theme';
import {ramp, pop, sceneIn, EASE_IN_OUT, EASE_OUT} from '../lib/anim';
import {COMPARE, CONTACT, BRAND, PRICE} from '../lib/copy';

/* ------------------------------------------------------------------ S24 */
/* 270f · 9s — side by side. Two pages of six rows so it never sits static. */

const PAGE_AT = 148;

const CompareRow: React.FC<{
  r: (typeof COMPARE)[number];
  y: number;
  delay: number;
  vis: number;
}> = ({r, y, delay, vis}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [delay, delay + 14], [0, 1], EASE_OUT) * vis;
  const shared = !r.split;
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: y,
        width: 968,
        height: 76,
        opacity: g,
        transform: `translateY(${(1 - g) * 16}px)`,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 12,
        background: shared ? 'rgba(61,139,255,0.12)' : 'rgba(255,255,255,0.035)',
        border: `1px solid ${shared ? 'rgba(61,139,255,0.34)' : 'rgba(255,255,255,0.07)'}`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: 330,
          textAlign: 'right',
          paddingRight: 20,
          fontFamily: F.ui,
          fontWeight: 700,
          fontSize: 25,
          color: shared ? C.brand : C.ul,
        }}
      >
        {r.ul}
      </div>
      <div
        style={{
          width: 308,
          textAlign: 'center',
          fontFamily: F.mono,
          fontWeight: 500,
          fontSize: 15,
          letterSpacing: 1.6,
          color: C.inkDim,
        }}
      >
        {r.k}
      </div>
      <div
        style={{
          width: 330,
          textAlign: 'left',
          paddingLeft: 20,
          fontFamily: F.ui,
          fontWeight: 700,
          fontSize: 25,
          color: shared ? C.brand : C.e8,
        }}
      >
        {r.e8}
      </div>
    </div>
  );
};

export const S24: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const p1 = 1 - ramp(f, [PAGE_AT - 14, PAGE_AT], [0, 1], EASE_IN_OUT);
  const p2 = ramp(f, [PAGE_AT + 2, PAGE_AT + 16], [0, 1], EASE_IN_OUT);
  const head = pop(f, 2, 17);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(100deg, rgba(47,212,200,0.11) 0%, rgba(0,0,0,0) 42%),' +
            'linear-gradient(260deg, rgba(255,138,61,0.11) 0%, rgba(0,0,0,0) 42%)',
        }}
      />
      <SceneHead kicker="SIDE BY SIDE" accent={C.brand} right="BOTH IN STOCK" delay={0} />

      <div style={{opacity: Math.min(1, head * 1.4)}}>
        <Photo
          name="ul-render-34"
          box={{l: 60, t: 108, w: 420, h: 148}}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.22)"
        />
        <Photo
          name="e8-render-34b"
          box={{l: 600, t: 116, w: 420, h: 132}}
          dur={dur}
          fit="contain"
          radius={0}
          border={null}
          glow="rgba(255,138,61,0.22)"
        />
        <div style={{position: 'absolute', left: 60, top: 262, width: 420, textAlign: 'center'}}>
          <Kicker color={C.ul} size={21}>
            ULTRALITE-mk5
          </Kicker>
        </div>
        <div style={{position: 'absolute', left: 600, top: 262, width: 420, textAlign: 'center'}}>
          <Kicker color={C.e8} size={21}>
            828
          </Kicker>
        </div>
      </div>

      <Rule box={{l: 56, t: 312, w: 968}} accent={C.brand} delay={16} dur={22} />

      {COMPARE.slice(0, 6).map((r, i) => (
        <CompareRow key={r.k} r={r} y={344 + i * 88} delay={26 + i * 9} vis={p1} />
      ))}
      {COMPARE.slice(6).map((r, i) => (
        <CompareRow key={r.k} r={r} y={344 + i * 88} delay={PAGE_AT + 4 + i * 9} vis={p2} />
      ))}

      <div style={{position: 'absolute', left: 56, top: 900, width: 968, textAlign: 'center'}}>
        <Mono size={19} color={C.brand} tracking={2.6}>
          BLUE ROWS = WHAT THEY SHARE
        </Mono>
      </div>
      <SquareEdge color={C.brand} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S25 */
/* 270f · 9s — who each one is for, then both on screen together. */

const PICK_UL = [
  'You move between rooms, stages and desks',
  'Two mic inputs and eight line ins are enough',
  'You want an iPad to be a valid control surface',
  'The rig has to fit in one bag',
];
const PICK_E8 = [
  'The interface lives in a rack and stays there',
  'You need talkback and A/B monitor switching',
  'Two performers need two different cue mixes',
  'You stream, podcast, or run 16 optical channels',
];

const Bullet: React.FC<{t: string; d: number; color: string; vis: number}> = ({
  t,
  d,
  color,
  vis,
}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [d, d + 14], [0, 1], EASE_OUT) * vis;
  return (
    <div
      style={{
        display: 'flex',
        gap: 13,
        marginBottom: 19,
        opacity: g,
        transform: `translateX(${(1 - g) * 20}px)`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          background: color,
          marginTop: 10,
          flexShrink: 0,
          boxShadow: `0 0 12px 2px ${color}88`,
        }}
      />
      <div style={{fontFamily: F.ui, fontWeight: 500, fontSize: 23, lineHeight: 1.32, color: C.inkSoft}}>
        {t}
      </div>
    </div>
  );
};

export const S25: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const pA = 1 - ramp(f, [148, 164], [0, 1], EASE_IN_OUT);
  const pB = ramp(f, [168, 186], [0, 1], EASE_IN_OUT);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-big-studio" opacity={0.16} blur={60} tint="rgba(6,9,14,0.90)" />

      {/* --- phase A: which one is you --- */}
      <div style={{position: 'absolute', inset: 0, opacity: pA}}>
        <SceneHead kicker="WHICH ONE IS YOURS" accent={C.brand} right="PICK BY WORKFLOW" delay={0} />
        <Photo
          name="ul-wood-studio"
          box={{l: 56, t: 118, w: 470, h: 220}}
          dur={dur}
          kb={{z: [1.05, 1.14]}}
          radius={14}
          border={`${C.ul}44`}
        />
        <Photo
          name="e8-big-studio"
          box={{l: 554, t: 118, w: 470, h: 220}}
          dur={dur}
          kb={{z: [1.12, 1.03]}}
          radius={14}
          border={`${C.e8}44`}
        />
        <div style={{position: 'absolute', left: 56, top: 362, width: 470}}>
          <Display size={50} color={C.ul}>
            ULTRALITE-mk5
          </Display>
          <div style={{marginTop: 22}}>
            {PICK_UL.map((t, i) => (
              <Bullet key={t} t={t} d={16 + i * 10} color={C.ul} vis={1} />
            ))}
          </div>
        </div>
        <div style={{position: 'absolute', left: 554, top: 362, width: 470}}>
          <Display size={50} color={C.e8}>
            828
          </Display>
          <div style={{marginTop: 22}}>
            {PICK_E8.map((t, i) => (
              <Bullet key={t} t={t} d={22 + i * 10} color={C.e8} vis={1} />
            ))}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: 538,
            top: 362,
            width: 1,
            height: 560,
            background: `linear-gradient(180deg, ${C.line}00, ${C.line}, ${C.line}00)`,
          }}
        />
      </div>

      {/* --- phase B: both, together --- */}
      <div style={{position: 'absolute', inset: 0, opacity: pB}}>
        <SceneHead kicker="BOTH, FROM ONE DISTRIBUTOR" accent={C.brand} right="IN STOCK" delay={168} />
        <Photo
          name="ul-render-top"
          box={{l: 100, t: 138, w: 880, h: 300}}
          dur={dur}
          fit="contain"
          kb={{z: [1.0, 1.05]}}
          radius={0}
          border={null}
          glow="rgba(47,212,200,0.22)"
        />
        <Photo
          name="e8-render-34a"
          box={{l: 60, t: 452, w: 960, h: 250}}
          dur={dur}
          fit="contain"
          kb={{z: [1.0, 1.05]}}
          radius={0}
          border={null}
          glow="rgba(255,138,61,0.22)"
        />
        <Rule box={{l: 56, t: 728, w: 968}} accent={C.brand} delay={186} dur={22} />
        <div style={{position: 'absolute', left: 56, top: 762, width: 968, textAlign: 'center'}}>
          <Display size={62} color={C.ink}>
            THE SAME CUEMIX 5.
          </Display>
          <Display size={62} color={C.cue} style={{marginTop: 2}}>
            TWO DIFFERENT MACHINES.
          </Display>
          <Body size={26} align="center" style={{marginTop: 20}}>
            {BRAND.distributor} — {BRAND.region}
          </Body>
        </div>
      </div>
      <SquareEdge color={C.brand} opacity={0.55} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S26 */
/* 270f · 9s — pricing, each figure locked to its own product. */

const PriceCard: React.FC<{
  y: number;
  img: 'ul-render-front' | 'e8-render-34b';
  accent: string;
  name: string;
  price: string;
  note: string;
  delay: number;
  dur: number;
}> = ({y, img, accent, name, price, note, delay, dur}) => {
  const f = useCurrentFrame();
  const g = pop(f, delay, 17);
  const sheen = ramp(f, [delay + 26, delay + 74], [-0.3, 1.3], EASE_IN_OUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: 56,
        top: y,
        width: 968,
        height: 320,
        borderRadius: 22,
        overflow: 'hidden',
        background: `linear-gradient(105deg, rgba(13,19,28,0.95), rgba(9,13,20,0.95))`,
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 70px -26px ${accent}, 0 24px 60px -28px rgba(0,0,0,0.9)`,
        opacity: Math.min(1, g * 1.4),
        transform: `translateY(${(1 - g) * 28}px)`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${sheen * 100}%`,
          top: 0,
          width: 180,
          height: '100%',
          background: `linear-gradient(90deg, ${accent}00, ${accent}22, ${accent}00)`,
        }}
      />
      <div style={{position: 'absolute', left: 4, top: 0, width: 4, height: '100%', background: accent}} />
      <Photo
        name={img}
        box={{l: 32, t: 84, w: 330, h: 152}}
        dur={dur}
        fit="contain"
        radius={0}
        border={null}
      />
      <div style={{position: 'absolute', left: 396, top: 52, width: 540}}>
        <Kicker color={accent} size={20}>
          MOTU
        </Kicker>
        <Display size={54} color={C.ink} style={{marginTop: 8}}>
          {name}
        </Display>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 16}}>
          <span
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 52,
              color: C.gold,
              lineHeight: 1,
            }}
          >
            Rs.
          </span>
          <span
            style={{
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 92,
              color: C.gold,
              lineHeight: 0.92,
              letterSpacing: -1,
            }}
          >
            {price}
          </span>
        </div>
        <div
          style={{
            fontFamily: F.mono,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 2.2,
            color: C.inkDim,
            marginTop: 14,
          }}
        >
          {note}
        </div>
      </div>
    </div>
  );
};

export const S26: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = sceneIn(f);
  const cta = ramp(f, [176, 196], [0, 1], EASE_OUT);
  const pulse = 1 + 0.02 * Math.sin((f - 176) / 7);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 78% 52% at 50% 46%, rgba(255,194,74,0.12), rgba(0,0,0,0) 74%)',
        }}
      />
      <SceneHead kicker="PRICE" accent={C.gold} right="INCLUDING GST" delay={0} />

      <PriceCard
        y={106}
        img="ul-render-front"
        accent={C.ul}
        name={PRICE.ul.label.replace('MOTU ', '')}
        price={PRICE.ul.value}
        note={PRICE.ul.note}
        delay={6}
        dur={dur}
      />
      <PriceCard
        y={452}
        img="e8-render-34b"
        accent={C.e8}
        name={PRICE.e8.label.replace('MOTU ', '')}
        price={PRICE.e8.value}
        note={PRICE.e8.note}
        delay={48}
        dur={dur}
      />

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 806,
          width: 968,
          opacity: cta,
          transform: `scale(${cta > 0.99 ? pulse : 1})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            borderRadius: 18,
            border: `2px solid ${C.gold}`,
            background: 'rgba(255,194,74,0.10)',
            padding: '22px 26px',
            textAlign: 'center',
          }}
        >
          <Display size={54} color={C.gold}>
            DM OR CALL FOR THE BEST PRICE
          </Display>
          <Body size={23} align="center" color={C.inkSoft} style={{marginTop: 10}}>
            Final pricing is confirmed directly by Shivansh Electronics — message or call to book a unit.
          </Body>
        </div>
      </div>
      <SquareEdge color={C.gold} opacity={0.6} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ S27 */
/* 270f · 9s — the full contact wall. The persistent brand bar hides here. */

const SOCIALS: [string, string][] = [
  ['WEBSITE', CONTACT.web],
  ['HUB', CONTACT.hub],
  ['INSTAGRAM', CONTACT.ig],
  ['FACEBOOK', CONTACT.fb],
  ['LINKEDIN', CONTACT.li],
  ['THREADS', CONTACT.th],
  ['TWITTER (X)', CONTACT.x],
  ['YOUTUBE', CONTACT.yt],
];

export const S27: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const out = Math.min(sceneIn(f, 14), ramp(f, [dur - 26, dur], [1, 0], EASE_IN_OUT));
  const h = pop(f, 2, 17);

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, opacity: out}}>
      <PhotoBackdrop name="e8-black-hero" opacity={0.16} blur={62} tint="rgba(6,8,13,0.92)" />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 74% 46% at 50% 26%, rgba(255,194,74,0.11), rgba(0,0,0,0) 72%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 46,
          width: 968,
          textAlign: 'center',
          opacity: Math.min(1, h * 1.4),
          transform: `translateY(${(1 - h) * 20}px)`,
        }}
      >
        <Kicker color={C.gold} size={21} style={{letterSpacing: 5}}>
          ORDER FROM
        </Kicker>
        <Display size={68} color={C.ink} style={{marginTop: 10}}>
          SHIVANSH ELECTRONICS
        </Display>
        <div style={{marginTop: 12, display: 'flex', justifyContent: 'center'}}>
          <Mono size={18} color={C.gold} tracking={2.2}>
            {BRAND.distributor} ({BRAND.motuFull})
          </Mono>
        </div>
        <div style={{marginTop: 6, display: 'flex', justifyContent: 'center'}}>
          <Mono size={18} color={C.inkSoft} tracking={2.2}>
            {BRAND.region}
          </Mono>
        </div>
      </div>

      <Rule box={{l: 56, t: 250, w: 968}} accent={C.gold} delay={16} dur={24} />

      {SOCIALS.map(([k, v], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const g = ramp(f, [26 + i * 6, 40 + i * 6], [0, 1], EASE_OUT);
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 56 + col * 498,
              top: 282 + row * 88,
              width: 470,
              opacity: g,
              transform: `translateY(${(1 - g) * 14}px)`,
            }}
          >
            <div
              style={{
                fontFamily: F.ui,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 2.6,
                color: C.inkDim,
              }}
            >
              {k}
            </div>
            <div
              style={{
                fontFamily: F.ui,
                fontWeight: 600,
                fontSize: 21,
                color: C.ink,
                marginTop: 5,
                whiteSpace: 'nowrap',
              }}
            >
              {v}
            </div>
          </div>
        );
      })}

      <Panel
        box={{l: 56, t: 650, w: 968, h: 176}}
        accent={C.gold}
        p={22}
        style={{opacity: ramp(f, [82, 100], [0, 1])}}
      >
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 2.8,
            color: C.inkDim,
          }}
        >
          WHATSAPP / CALL
        </div>
        <div style={{display: 'flex', gap: 30, marginTop: 12}}>
          {CONTACT.phones.map((p, i) => (
            <span
              key={p}
              style={{
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 29,
                color: C.gold,
                opacity: ramp(f, [92 + i * 9, 106 + i * 9], [0, 1]),
              }}
            >
              {p}
            </span>
          ))}
        </div>
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 600,
            fontSize: 19,
            color: C.inkSoft,
            marginTop: 16,
            opacity: ramp(f, [120, 136], [0, 1]),
          }}
        >
          {CONTACT.waChannel} · whatsapp.com/channel/0029VbBzlQH3rZZfQBHsf20K
        </div>
      </Panel>

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 848,
          width: 968,
          opacity: ramp(f, [140, 158], [0, 1]),
        }}
      >
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: 2.6,
            color: C.inkDim,
          }}
        >
          SHOWROOM
        </div>
        <div
          style={{
            fontFamily: F.ui,
            fontWeight: 500,
            fontSize: 21,
            lineHeight: 1.34,
            color: C.inkSoft,
            marginTop: 6,
            whiteSpace: 'pre-line',
          }}
        >
          {CONTACT.address}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 976,
          width: 968,
          textAlign: 'center',
          opacity: ramp(f, [164, 184], [0, 1]),
        }}
      >
        <Mono size={22} color={C.gold} tracking={3.4}>
          DM OR CALL FOR THE BEST PRICE
        </Mono>
      </div>
      <SquareEdge color={C.gold} opacity={0.6} />
    </AbsoluteFill>
  );
};
