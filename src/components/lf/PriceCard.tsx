import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F2} from '../../lib/lf-theme';
import {ImageName} from '../../lib/images';
import {Photo} from '../Photo';
import {Display, Kicker} from '../Type';
import {Label} from './LFType';
import {ramp, pop, EASE_IN_OUT} from '../../lib/anim';

export const PriceCard: React.FC<{
  box: {l: number; t: number; w: number; h: number};
  img: ImageName;
  accent: string;
  name: string;
  price: string;
  note: string;
  delay?: number;
  dur: number;
}> = ({box, img, accent, name, price, note, delay = 0, dur}) => {
  const f = useCurrentFrame();
  const g = pop(f, delay, 17);
  const sheen = ramp(f, [delay + 24, delay + 70], [-0.3, 1.3], EASE_IN_OUT);
  const imgW = box.h * 1.28;

  return (
    <div
      style={{
        position: 'absolute',
        left: box.l,
        top: box.t,
        width: box.w,
        height: box.h,
        borderRadius: 24,
        overflow: 'hidden',
        background: 'linear-gradient(105deg, rgba(13,19,28,0.96), rgba(9,13,20,0.96))',
        border: `1px solid ${accent}55`,
        boxShadow: `0 0 80px -28px ${accent}, 0 26px 60px -30px rgba(0,0,0,0.9)`,
        opacity: Math.min(1, g * 1.4),
        transform: `translateY(${(1 - g) * 26}px)`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${sheen * 100}%`,
          top: 0,
          width: 200,
          height: '100%',
          background: `linear-gradient(90deg, ${accent}00, ${accent}22, ${accent}00)`,
        }}
      />
      <div style={{position: 'absolute', left: 5, top: 0, width: 5, height: '100%', background: accent}} />

      <Photo
        name={img}
        box={{l: 34, t: box.h * 0.14, w: imgW, h: box.h * 0.72}}
        dur={dur}
        fit="contain"
        radius={0}
        border={null}
      />

      <div style={{position: 'absolute', left: 34 + imgW + 44, top: box.h * 0.14, width: box.w - imgW - 44 - 70}}>
        <Kicker color={accent} size={20}>
          MOTU
        </Kicker>
        <Display size={56} color={C.ink} style={{marginTop: 8}}>
          {name}
        </Display>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 11, marginTop: 18}}>
          <span style={{fontFamily: F2.display, fontWeight: 700, fontSize: 46, color: C.gold, lineHeight: 1}}>
            Rs.
          </span>
          <span
            style={{
              fontFamily: F2.display,
              fontWeight: 800,
              fontSize: 78,
              color: C.gold,
              lineHeight: 0.92,
              letterSpacing: -1,
            }}
          >
            {price}
          </span>
        </div>
        <Label size={18} color={C.inkDim} tracking={2.2} style={{marginTop: 14}}>
          {note}
        </Label>
      </div>
    </div>
  );
};
