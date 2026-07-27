import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, F2, SAFE_MARGIN_X} from '../../lib/lf-theme';
import {ImageName} from '../../lib/images';
import {Photo, PhotoBackdrop, Box} from '../Photo';
import {Display, Kicker} from '../Type';
import {Label} from './LFType';
import {ChipRow} from '../Bits';
import {ramp, EASE_IN_OUT} from '../../lib/anim';

export type Beat = {
  img: ImageName;
  fit?: 'cover' | 'contain';
  bg?: string; // override the default dark card — some source art (e.g. dark line-diagrams on transparency) needs a light plate to stay legible
  kicker?: string;
  headline: string;
  body?: string;
  chips?: string[];
  dur: number; // frames — explicit, not an even split: a beat ends when its point is made
};

/** Beat index + local-frame from an explicit per-beat duration array (not an even split). */
const useBeat = (beats: {dur: number}[]) => {
  const f = useCurrentFrame();
  let acc = 0;
  for (let i = 0; i < beats.length; i++) {
    const d = beats[i].dur;
    if (f < acc + d || i === beats.length - 1) return {i, local: f - acc, dur: d};
    acc += d;
  }
  return {i: 0, local: f, dur: beats[0]?.dur ?? 1};
};

const TextBlock: React.FC<{
  beat: Beat;
  accent: string;
  local: number;
  box: Box;
  align?: 'left' | 'center';
}> = ({beat, accent, local, box, align = 'left'}) => {
  const g = ramp(local, [0, 10], [0, 1], EASE_IN_OUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: box.l,
        top: box.t,
        width: box.w,
        opacity: g,
        transform: `translateY(${(1 - g) * 22}px)`,
        textAlign: align,
      }}
    >
      {beat.kicker ? (
        <Kicker color={accent} size={21} style={{marginBottom: 12}}>
          {beat.kicker}
        </Kicker>
      ) : null}
      <Display size={58} color={C.ink} lh={0.98}>
        {beat.headline}
      </Display>
      {beat.body ? (
        <div
          style={{
            fontFamily: F2.label,
            fontWeight: 500,
            fontSize: 24,
            lineHeight: 1.42,
            color: C.inkSoft,
            marginTop: 20,
            maxWidth: box.w,
            textShadow: '0 2px 16px rgba(0,0,0,0.75)',
          }}
        >
          {beat.body}
        </div>
      ) : null}
      {beat.chips && beat.chips.length ? (
        <ChipRow items={beat.chips} accent={accent} delay={local + 14} per={4} size={19} style={{marginTop: 22}} />
      ) : null}
    </div>
  );
};

const FADE = 14;

/**
 * HERO TIER — one image at a time, resized/padded to a generous dedicated
 * slot (never cropped to squeeze against neighbours), with a text column
 * beside it. This is the default treatment per the image-tiering rule.
 */
export const HeroBeats: React.FC<{
  beats: Beat[];
  accent: string;
  side?: 'right' | 'left';
  dur: number;
}> = ({beats, accent, side = 'right', dur}) => {
  const {i, local} = useBeat(beats);
  const beat = beats[i];
  const prev = i > 0 ? beats[i - 1] : null;
  const g = prev ? Math.min(1, local / FADE) : 1;

  const imgBox: Box =
    side === 'right'
      ? {l: 1010, t: 140, w: 830, h: 716}
      : {l: 80, t: 140, w: 830, h: 716};
  const textBox: Box =
    side === 'right'
      ? {l: SAFE_MARGIN_X, t: 330, w: 860, h: 500}
      : {l: 1000, t: 330, w: 840, h: 500};

  return (
    <>
      {prev && g < 1 ? (
        <Photo
          key={`p${i}`}
          name={prev.img}
          box={imgBox}
          dur={dur}
          fit={prev.fit ?? 'contain'}
          radius={20}
          border={`${accent}33`}
          bg={prev.bg ?? 'rgba(9,13,20,0.55)'}
        />
      ) : null}
      <Photo
        key={`c${i}`}
        name={beat.img}
        box={imgBox}
        dur={dur}
        fit={beat.fit ?? 'contain'}
        radius={20}
        border={`${accent}33`}
        bg={beat.bg ?? 'rgba(9,13,20,0.55)'}
        opacity={g}
        glow={`${accent}22`}
      />
      <TextBlock key={`t${i}`} beat={beat} accent={accent} local={local} box={textBox} />
    </>
  );
};

/**
 * FULL-BLEED TIER — one image filling most of the safe area (a deliberate
 * cover crop for atmosphere, not a squeeze-to-fit), scrim + text overlay.
 * Used for lifestyle/workflow shots and title cards.
 */
export const FullBleedBeats: React.FC<{
  beats: Beat[];
  accent: string;
  dur: number;
  textAlign?: 'left' | 'center';
}> = ({beats, accent, dur, textAlign = 'left'}) => {
  const {i, local} = useBeat(beats);
  const beat = beats[i];
  const prev = i > 0 ? beats[i - 1] : null;
  const g = prev ? Math.min(1, local / FADE) : 1;
  const full: Box = {l: 0, t: 0, w: 1920, h: 924};

  const textBox: Box =
    textAlign === 'center'
      ? {l: 260, t: 560, w: 1400, h: 320}
      : {l: SAFE_MARGIN_X, t: 560, w: 1100, h: 320};

  return (
    <>
      {prev && g < 1 ? (
        <Photo key={`p${i}`} name={prev.img} box={full} dur={dur} fit="cover" radius={0} border={null} />
      ) : null}
      <Photo
        key={`c${i}`}
        name={beat.img}
        box={full}
        dur={dur}
        fit="cover"
        radius={0}
        border={null}
        opacity={g}
        shade
      />
      <TextBlock key={`t${i}`} beat={beat} accent={accent} local={local} box={textBox} align={textAlign} />
    </>
  );
};

/**
 * SUPPORT TIER ONLY — 2-3 smaller images grouped side by side. Reserved for
 * genuinely secondary/supporting assets (accessory shots, software-pack
 * covers) per the explicit grouping exception; never used for hero content.
 */
export const GroupBeat: React.FC<{
  images: ImageName[];
  labels?: string[];
  kicker?: string;
  headline: string;
  body?: string;
  accent: string;
  dur: number;
  delay?: number;
}> = ({images, labels, kicker, headline, body, accent, dur, delay = 0}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [delay, delay + 12], [0, 1], EASE_IN_OUT);
  const n = Math.min(3, images.length);
  const gap = 28;
  const totalW = 1760;
  const cw = (totalW - gap * (n - 1)) / n;
  const top = 490;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: SAFE_MARGIN_X,
          top: 136,
          width: totalW,
          opacity: g,
          transform: `translateY(${(1 - g) * 18}px)`,
        }}
      >
        {kicker ? (
          <Kicker color={accent} size={21} style={{marginBottom: 12}}>
            {kicker}
          </Kicker>
        ) : null}
        <Display size={54} color={C.ink}>
          {headline}
        </Display>
        {body ? (
          <div
            style={{
              fontFamily: F2.label,
              fontWeight: 500,
              fontSize: 23,
              lineHeight: 1.4,
              color: C.inkSoft,
              marginTop: 16,
              maxWidth: 1400,
            }}
          >
            {body}
          </div>
        ) : null}
      </div>
      {images.slice(0, n).map((img, idx) => {
        const gi = ramp(f, [delay + 10 + idx * 6, delay + 24 + idx * 6], [0, 1], EASE_IN_OUT);
        return (
          <div key={img} style={{opacity: gi, transform: `translateY(${(1 - gi) * 20}px)`}}>
            <Photo
              name={img}
              box={{l: SAFE_MARGIN_X + idx * (cw + gap), t: top, w: cw, h: 330}}
              dur={dur}
              fit="contain"
              radius={16}
              border={`${accent}30`}
              bg="rgba(9,13,20,0.6)"
            />
            {labels && labels[idx] ? (
              <div
                style={{
                  position: 'absolute',
                  left: SAFE_MARGIN_X + idx * (cw + gap),
                  top: top + 330 + 16,
                  width: cw,
                  textAlign: 'center',
                }}
              >
                <Label size={16} color={C.inkDim} tracking={1.8}>
                  {labels[idx]}
                </Label>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
};

export const PhotoBackdropSafe: React.FC<{name: ImageName; opacity?: number}> = ({name, opacity = 0.18}) => (
  <PhotoBackdrop name={name} opacity={opacity} blur={62} tint="rgba(6,9,14,0.90)" />
);
