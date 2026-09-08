import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, F, DEPTH} from '../lib/theme';
import {WIDTH} from '../lib/grid';
import {Layer} from '../camera/Camera';
import {Life, resolveTransform} from './life';
import {ShotCtx} from '../shots/Shot';

/** Client contact block, exactly as supplied: three WhatsApp numbers and the site. */
export const CONTACT = {
  phones: ['+91 98316 62458', '+91 91477 00677', '+91 89818 07755'],
  site: 'www.shivanshelectronics.in',
} as const;

const WhatsAppIcon: React.FC<{size: number; color?: string}> = ({size, color = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{display: 'block'}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
  </svg>
);

const GlobeIcon: React.FC<{size: number; color?: string}> = ({size, color = C.ink}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.9} style={{display: 'block'}}>
    <circle cx="12" cy="12" r="10.2" />
    <ellipse cx="12" cy="12" rx="4.4" ry="10.2" />
    <line x1="1.9" y1="12" x2="22.1" y2="12" />
    <line x1="3.5" y1="6.4" x2="20.5" y2="6.4" />
    <line x1="3.5" y1="17.6" x2="20.5" y2="17.6" />
  </svg>
);

/** Shivansh Electronics + MOTU, locked up together. */
export const LogoLockup: React.FC<{
  ctx: ShotCtx; cy: number; scale?: number; inAt?: number; outAt?: number; stacked?: boolean;
}> = ({ctx, cy, scale = 1, inAt = 0, outAt, stacked = true}) => {
  const out = outAt ?? ctx.dur;
  const a = ctx.L(inAt, out, 0.5, 0.35);
  const b = ctx.L(inAt + 0.22, out + 0.1, 0.5, 0.35);
  const ta = resolveTransform(a, 'lockup-sh', {from: 'l', to: 'r', dist: 420, ownZoom: 0.05});
  const tb = resolveTransform(b, 'lockup-mo', {from: 'r', to: 'l', dist: 420, ownZoom: 0.05});
  const wSh = 1180 * scale;
  const wMo = 880 * scale;
  const gap = stacked ? 250 * scale : 0;

  return (
    <Layer depth={DEPTH.type}>
      {a.alive && (
        <div
          style={{
            position: 'absolute', left: WIDTH / 2 - wSh / 2, top: cy - gap / 2 - 150 * scale,
            width: wSh,
            transform: `translate3d(${ta.x.toFixed(2)}px, ${ta.y.toFixed(2)}px,0) rotate(${(ta.r * 0.4).toFixed(2)}deg) scale(${ta.s.toFixed(4)})`,
            opacity: ta.opacity, transformOrigin: '50% 50%',
          }}
        >
          <div style={{background: C.white, padding: 26 * scale, filter: 'drop-shadow(14px 20px 26px rgba(28,26,22,0.32))'}}>
            <Img src={staticFile('logo/logo_shivansh.png')} style={{width: '100%', display: 'block'}} />
          </div>
        </div>
      )}
      {b.alive && (
        <div
          style={{
            position: 'absolute', left: WIDTH / 2 - wMo / 2, top: cy + gap / 2 - 40 * scale,
            width: wMo,
            transform: `translate3d(${tb.x.toFixed(2)}px, ${tb.y.toFixed(2)}px,0) rotate(${(tb.r * 0.4).toFixed(2)}deg) scale(${tb.s.toFixed(4)})`,
            opacity: tb.opacity, transformOrigin: '50% 50%',
          }}
        >
          <div style={{background: C.white, padding: 22 * scale, filter: 'drop-shadow(14px 20px 26px rgba(28,26,22,0.32))'}}>
            <Img src={staticFile('logo/logo_motu.png')} style={{width: '100%', display: 'block'}} />
          </div>
        </div>
      )}
    </Layer>
  );
};

const Row: React.FC<{life: Life; seed: string; y: number; children: React.ReactNode; from?: 'l' | 'r'}> =
  ({life, seed, y, children, from = 'l'}) => {
    if (!life.alive) return null;
    const t = resolveTransform(life, seed, {from, to: 'zo', dist: 300, ownZoom: 0.02});
    return (
      <div
        style={{
          position: 'absolute', left: 0, top: y, width: WIDTH,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34,
          transform: `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px,0) scale(${t.s.toFixed(4)})`,
          opacity: t.opacity,
        }}
      >
        {children}
      </div>
    );
  };

/**
 * The close's contact block: the WhatsApp mark against all three numbers the
 * client supplied, and the site. Like everything else in the reel it is
 * animated - no branding element is allowed to be the one static thing sitting
 * inside a moving composition (master brief S7).
 */
export const ContactBlock: React.FC<{ctx: ShotCtx; inAt?: number; outAt?: number; y?: number}> =
  ({ctx, inAt = 0, outAt, y = 2280}) => {
    const out = outAt ?? ctx.dur + 0.6;
    const num = CONTACT.phones;
    return (
      <Layer depth={DEPTH.callout}>
        {num.map((p, i) => (
          <Row key={i} life={ctx.L(inAt + 0.18 + i * 0.26, out)} seed={`wa${i}`} y={y + i * 168} from={i % 2 ? 'r' : 'l'}>
            <WhatsAppIcon size={104} color={C.ink} />
            <span style={{fontFamily: F.label, fontWeight: 700, fontSize: 112, letterSpacing: '0.05em', color: C.ink}}>
              {p}
            </span>
          </Row>
        ))}
        <Row life={ctx.L(inAt + 1.05, out)} seed="site" y={y + num.length * 168 + 96} from="l">
          <GlobeIcon size={104} color={C.motuBlueDeep} />
          <span style={{fontFamily: F.label, fontWeight: 700, fontSize: 108, letterSpacing: '0.045em', color: C.motuBlueDeep}}>
            {CONTACT.site}
          </span>
        </Row>
      </Layer>
    );
  };
