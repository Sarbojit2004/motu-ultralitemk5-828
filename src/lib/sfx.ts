import {staticFile} from 'remotion';
import {sceneStart, SceneId} from './theme';

export type SfxName =
  | 'whoosh-air' | 'whoosh-low' | 'whoosh-rev' | 'whoosh-metal'
  | 'impact-deep' | 'impact-mid' | 'tick' | 'click-ui'
  | 'riser' | 'sub-drop' | 'shimmer' | 'glitch' | 'swell' | 'chime-final';

export const sfxFile = (n: SfxName): string => staticFile(`audio/sfx/${n}.mp3`);

export type Cue = {at: number; n: SfxName; v: number};

const at = (s: SceneId, off = 0) => sceneStart(s) + off;

/**
 * Varied transition palette. Scene changes never reuse the same whoosh twice
 * in a row, and interior beats get lighter ticks/clicks so the fast cutting
 * has texture without masking narration.
 */
const build = (): Cue[] => {
  const c: Cue[] = [];

  // S01 strobe — a tick on every one of the nine cuts, alternating character
  for (let i = 0; i < 9; i++) {
    c.push({at: i * 20, n: i % 2 === 0 ? 'tick' : 'click-ui', v: 0.34});
  }
  c.push({at: 0, n: 'impact-deep', v: 0.5});
  c.push({at: 60, n: 'sub-drop', v: 0.34});
  c.push({at: 120, n: 'glitch', v: 0.3});

  c.push({at: at('S02'), n: 'whoosh-air', v: 0.42});
  c.push({at: at('S02', 34), n: 'whoosh-rev', v: 0.34});
  c.push({at: at('S02', 108), n: 'swell', v: 0.30});

  c.push({at: at('S03') - 8, n: 'riser', v: 0.34});
  c.push({at: at('S03'), n: 'shimmer', v: 0.40});
  c.push({at: at('S03', 92), n: 'whoosh-metal', v: 0.30});
  c.push({at: at('S04'), n: 'whoosh-low', v: 0.36});
  c.push({at: at('S04', 60), n: 'click-ui', v: 0.34});
  c.push({at: at('S04', 120), n: 'click-ui', v: 0.34});
  c.push({at: at('S05'), n: 'whoosh-air', v: 0.34});
  c.push({at: at('S05', 64), n: 'tick', v: 0.30});
  c.push({at: at('S05', 82), n: 'tick', v: 0.30});
  c.push({at: at('S06'), n: 'whoosh-rev', v: 0.34});

  // ACT 2 — UltraLite-mk5
  c.push({at: at('S07') - 10, n: 'riser', v: 0.32});
  c.push({at: at('S07'), n: 'impact-mid', v: 0.44});
  c.push({at: at('S08'), n: 'whoosh-air', v: 0.34});
  c.push({at: at('S08', 88), n: 'click-ui', v: 0.28});
  c.push({at: at('S09'), n: 'whoosh-metal', v: 0.32});
  for (let i = 0; i < 6; i++) c.push({at: at('S09', 34 + i * 26), n: 'tick', v: 0.24});
  c.push({at: at('S10'), n: 'whoosh-low', v: 0.34});
  for (let i = 0; i < 7; i++) c.push({at: at('S10', 30 + i * 24), n: 'click-ui', v: 0.22});
  c.push({at: at('S11'), n: 'whoosh-rev', v: 0.34});
  c.push({at: at('S11', 90), n: 'impact-mid', v: 0.30});
  c.push({at: at('S12'), n: 'whoosh-air', v: 0.32});
  c.push({at: at('S13'), n: 'glitch', v: 0.28});
  c.push({at: at('S13', 20), n: 'swell', v: 0.28});
  c.push({at: at('S14'), n: 'whoosh-metal', v: 0.32});
  c.push({at: at('S14', 80), n: 'click-ui', v: 0.26});
  c.push({at: at('S14', 160), n: 'tick', v: 0.26});

  // ACT 3 — 828
  c.push({at: at('S15') - 12, n: 'riser', v: 0.34});
  c.push({at: at('S15'), n: 'impact-deep', v: 0.46});
  c.push({at: at('S16'), n: 'whoosh-low', v: 0.36});
  c.push({at: at('S17'), n: 'whoosh-air', v: 0.32});
  c.push({at: at('S17', 70), n: 'click-ui', v: 0.26});
  c.push({at: at('S17', 140), n: 'click-ui', v: 0.26});
  c.push({at: at('S18'), n: 'whoosh-metal', v: 0.32});
  for (let i = 0; i < 5; i++) c.push({at: at('S18', 26 + i * 32), n: 'tick', v: 0.24});
  c.push({at: at('S19'), n: 'whoosh-low', v: 0.34});
  for (let i = 0; i < 8; i++) c.push({at: at('S19', 28 + i * 25), n: 'click-ui', v: 0.22});
  c.push({at: at('S20'), n: 'glitch', v: 0.30});
  c.push({at: at('S20', 96), n: 'sub-drop', v: 0.28});
  c.push({at: at('S21'), n: 'whoosh-rev', v: 0.34});
  c.push({at: at('S21', 60), n: 'tick', v: 0.24});
  c.push({at: at('S21', 120), n: 'tick', v: 0.24});
  c.push({at: at('S22'), n: 'whoosh-air', v: 0.32});
  for (let i = 0; i < 5; i++) c.push({at: at('S22', 24 + i * 30), n: 'click-ui', v: 0.22});
  c.push({at: at('S23'), n: 'swell', v: 0.32});
  c.push({at: at('S23', 96), n: 'shimmer', v: 0.28});

  // ACT 4 — together
  c.push({at: at('S24') - 10, n: 'riser', v: 0.32});
  c.push({at: at('S24'), n: 'impact-mid', v: 0.40});
  for (let i = 0; i < 12; i++) c.push({at: at('S24', 46 + i * 15), n: 'tick', v: 0.20});
  c.push({at: at('S25'), n: 'whoosh-metal', v: 0.32});
  c.push({at: at('S25', 130), n: 'click-ui', v: 0.28});

  // ACT 5 — price + CTA
  c.push({at: at('S26') - 10, n: 'riser', v: 0.34});
  c.push({at: at('S26'), n: 'impact-deep', v: 0.44});
  c.push({at: at('S26', 70), n: 'shimmer', v: 0.32});
  c.push({at: at('S26', 150), n: 'shimmer', v: 0.32});
  c.push({at: at('S27'), n: 'whoosh-air', v: 0.36});
  for (let i = 0; i < 10; i++) c.push({at: at('S27', 22 + i * 13), n: 'click-ui', v: 0.18});
  c.push({at: at('S27', 190), n: 'chime-final', v: 0.36});

  return c;
};

export const CUES: Cue[] = build();
