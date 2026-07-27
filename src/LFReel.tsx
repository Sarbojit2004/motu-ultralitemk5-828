import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {LFFrame} from './components/lf/LFFrame';
import {LFBrandBar} from './components/lf/LFBrandBar';
import {C, LF_SCENES, lfAccentColor} from './lib/lf-theme';
import {LF_REGISTRY} from './scenes/lf/registry';
import {LF_CUES, lfSfxFile} from './lib/lf-sfx';
import {loadFonts} from './lib/fonts';
import {ramp} from './lib/anim';

loadFonts();

export const LF_PLAN = (() => {
  const out: {id: string; from: number; dur: number; accent: string}[] = [];
  let f = 0;
  for (const s of LF_SCENES) {
    if (!LF_REGISTRY[s.id]) continue;
    out.push({id: s.id, from: f, dur: s.dur, accent: lfAccentColor(s.accent)});
    f += s.dur;
  }
  return out;
})();

export const LF_REEL_FRAMES = LF_PLAN.reduce((a, s) => a + s.dur, 0);

const OVERLAP = 10; // cross-dissolve overlap between scenes, learned from the reel

const Content: React.FC = () => (
  <>
    {LF_PLAN.map((s, i) => {
      const Comp = LF_REGISTRY[s.id as keyof typeof LF_REGISTRY]!;
      const last = i === LF_PLAN.length - 1;
      return (
        <Sequence
          key={s.id}
          from={s.from}
          durationInFrames={s.dur + (last ? 0 : OVERLAP)}
          name={s.id}
          layout="none"
        >
          <AbsoluteFill>
            <Comp dur={s.dur} />
          </AbsoluteFill>
        </Sequence>
      );
    })}
    <LFBrandBar />
  </>
);

export const LFReel: React.FC = () => {
  const f = useCurrentFrame();
  const musicGain =
    0.30 * Math.min(ramp(f, [0, 40], [0, 1]), ramp(f, [LF_REEL_FRAMES - 90, LF_REEL_FRAMES], [1, 0]));

  return (
    <AbsoluteFill style={{backgroundColor: C.void}}>
      <LFFrame>
        <Content />
      </LFFrame>

      <Audio src={staticFile('audio/lf/music-bed-longform.mp3')} volume={musicGain} />
      <Audio src={staticFile('vo/voiceover-longform-ultralite-828.mp3')} volume={1} />

      {LF_CUES.filter((c) => c.at >= 0 && c.at < LF_REEL_FRAMES).map((c, i) => (
        <Sequence key={`${c.n}-${c.at}-${i}`} from={c.at} layout="none">
          <Audio src={lfSfxFile(c.n)} volume={c.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
