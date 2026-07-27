import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Strips, Square} from './components/Frame';
import {BrandBar} from './components/BrandBar';
import {C, SCENES, accentColor} from './lib/theme';
import {REGISTRY} from './scenes/registry';
import {CUES, sfxFile} from './lib/sfx';
import {loadFonts} from './lib/fonts';
import {ramp} from './lib/anim';

loadFonts();

/** Scenes that are actually implemented, with their absolute start frames. */
export const PLAN = (() => {
  const out: {id: string; from: number; dur: number; accent: string}[] = [];
  let f = 0;
  for (const s of SCENES) {
    if (!REGISTRY[s.id]) continue;
    out.push({id: s.id, from: f, dur: s.dur, accent: accentColor(s.accent)});
    f += s.dur;
  }
  return out;
})();

export const REEL_FRAMES = PLAN.reduce((a, s) => a + s.dur, 0);

/** Accent colour of whichever scene is on screen, for the persistent brand bar. */
const useAccent = (): string => {
  const f = useCurrentFrame();
  let cur: string = C.brand;
  for (const s of PLAN) if (f >= s.from) cur = s.accent;
  return cur;
};

/**
 * Each scene's Sequence runs OVERLAP frames past its slot. The next scene is
 * later in DOM order, so it paints on top and fades in over its predecessor —
 * a real cross-dissolve rather than a dip to black at every one of the 26 cuts.
 */
const OVERLAP = 9;

const Content: React.FC = () => {
  const accent = useAccent();
  return (
    <>
      {PLAN.map((s, i) => {
        const Comp = REGISTRY[s.id as keyof typeof REGISTRY]!;
        const last = i === PLAN.length - 1;
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
      <BrandBar accent={accent} />
    </>
  );
};

export const Reel: React.FC = () => {
  const f = useCurrentFrame();
  // gentle programme fade so the bed never clips in or out abruptly
  const musicGain =
    0.30 *
    Math.min(ramp(f, [0, 30], [0, 1]), ramp(f, [REEL_FRAMES - 70, REEL_FRAMES], [1, 0]));

  return (
    <AbsoluteFill style={{backgroundColor: C.void}}>
      <Strips />
      <Square>
        <Content />
      </Square>

      <Audio src={staticFile('audio/music-bed.mp3')} volume={musicGain} />
      <Audio src={staticFile('vo/voiceover-reel-ultralite-828.mp3')} volume={1} />

      {CUES.filter((c) => c.at >= 0 && c.at < REEL_FRAMES).map((c, i) => (
        <Sequence key={`${c.n}-${c.at}-${i}`} from={c.at} layout="none">
          <Audio src={sfxFile(c.n)} volume={c.v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
