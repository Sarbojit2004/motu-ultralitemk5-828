import {staticFile} from 'remotion';
import {lfSceneStart, LFSceneId, LF_SCENES, LF_TOTAL_FRAMES} from './lf-theme';

export type LFSfxName =
  | 'bell-soft' | 'chime-final' | 'chime-soft' | 'click-deep' | 'click-soft'
  | 'click-ui' | 'drop-heavy' | 'glitch' | 'impact-deep' | 'impact-hollow'
  | 'impact-light' | 'impact-mid' | 'page-turn' | 'riser' | 'riser-long'
  | 'riser-short' | 'shimmer' | 'shimmer-bright' | 'stinger-chapter'
  | 'sub-drop' | 'swell' | 'swell-dark' | 'tick' | 'tick-double'
  | 'transition-blip' | 'whoosh-air' | 'whoosh-bright' | 'whoosh-low'
  | 'whoosh-metal' | 'whoosh-rev' | 'whoosh-soft' | 'whoosh-swoop';

export const lfSfxFile = (n: LFSfxName): string => staticFile(`audio/lf/${n}.mp3`);

export type LFCue = {at: number; n: LFSfxName; v: number};

// Category pools — round-robin picked so consecutive transitions never repeat
// the exact same clip, keeping 600s of cuts from feeling samey.
const WHOOSH: LFSfxName[] = ['whoosh-air', 'whoosh-low', 'whoosh-rev', 'whoosh-metal', 'whoosh-soft', 'whoosh-bright', 'whoosh-swoop'];
const IMPACT: LFSfxName[] = ['impact-deep', 'impact-mid', 'impact-light', 'impact-hollow'];
const TICK: LFSfxName[] = ['tick', 'tick-double', 'click-ui', 'click-soft', 'click-deep', 'transition-blip'];
const RISER: LFSfxName[] = ['riser', 'riser-long', 'riser-short'];
const CHIME: LFSfxName[] = ['chime-soft', 'chime-final', 'bell-soft'];

type Spec = {id: LFSceneId; beats: number; chapter?: boolean; drop?: boolean; glitch?: boolean; chime?: boolean};

/** Per-scene beat count — matches the internal sub-beat structure each scene
 * component actually builds (see the per-Act scene files). Drives both the
 * transition-cue placement below and doubled as the authoring spec for how
 * many visually-distinct beats each scene must contain. */
const SPEC: Spec[] = [
  {id: 'CO1', beats: 7, chapter: true, drop: true},

  {id: 'H1', beats: 2, chapter: true},
  {id: 'H2', beats: 3},
  {id: 'H3', beats: 3},
  {id: 'H4', beats: 2},
  {id: 'H5', beats: 1},

  {id: 'U1', beats: 2, chapter: true, drop: true},
  {id: 'U2', beats: 2},
  {id: 'U3', beats: 6},
  {id: 'U4', beats: 8},
  {id: 'U5', beats: 2},
  {id: 'U6', beats: 2, glitch: true},
  {id: 'U7', beats: 2},
  {id: 'U8', beats: 2},
  {id: 'U9', beats: 2},
  {id: 'U10', beats: 2},
  {id: 'U11', beats: 2},
  {id: 'U12', beats: 2},
  {id: 'U13', beats: 2, chime: true},

  {id: 'E1', beats: 2, chapter: true, drop: true},
  {id: 'E2', beats: 2},
  {id: 'E3', beats: 2},
  {id: 'E4', beats: 2},
  {id: 'E5', beats: 2},
  {id: 'E6', beats: 9},
  {id: 'E7', beats: 2},
  {id: 'E8', beats: 2, glitch: true},
  {id: 'E9', beats: 2},
  {id: 'E10', beats: 2},
  {id: 'E11', beats: 2},
  {id: 'E12', beats: 2},
  {id: 'E13', beats: 2},
  {id: 'E14', beats: 2},
  {id: 'E15', beats: 2, chime: true},

  {id: 'CP1', beats: 2, chapter: true, drop: true},
  {id: 'CP2', beats: 2},
  {id: 'CP3', beats: 2},
  {id: 'CP4', beats: 2},
  {id: 'CP5', beats: 2, chime: true},

  {id: 'OU1', beats: 2, chapter: true},
  {id: 'OU2', beats: 2, chime: true},
  {id: 'OU3', beats: 1},
  {id: 'OU4', beats: 11},
  {id: 'OU5', beats: 2},
  {id: 'OU6', beats: 2, chime: true},
];

const build = (): LFCue[] => {
  const cues: LFCue[] = [];
  const durById = new Map(LF_SCENES.map((s) => [s.id, s.dur]));
  let wi = 0;
  let ii = 0;
  let ti = 0;
  let ri = 0;
  let chi = 0;

  SPEC.forEach((s, sceneIdx) => {
    const start = lfSceneStart(s.id);
    const dur = durById.get(s.id) ?? 300;

    // scene-entry transition
    if (s.chapter) {
      cues.push({at: Math.max(0, start - 12), n: RISER[ri++ % RISER.length], v: 0.32});
      cues.push({at: start, n: 'stinger-chapter', v: sceneIdx === 0 ? 0.46 : 0.38});
      cues.push({at: start + 4, n: 'page-turn', v: 0.24});
    } else {
      cues.push({at: start, n: WHOOSH[wi++ % WHOOSH.length], v: 0.32});
    }
    if (s.drop) {
      cues.push({at: start + 6, n: IMPACT[ii++ % IMPACT.length], v: 0.42});
    }

    // internal beat boundaries, evenly split across the scene's real duration
    for (let i = 1; i < s.beats; i++) {
      const off = Math.round((i * dur) / s.beats);
      cues.push({at: start + off, n: TICK[ti++ % TICK.length], v: 0.19});
    }
    if (s.glitch) {
      cues.push({at: start + Math.round(dur * 0.55), n: 'glitch', v: 0.26});
    }
    if (s.chime) {
      cues.push({at: start + Math.max(0, dur - 46), n: CHIME[chi++ % CHIME.length], v: 0.30});
    }
  });

  cues.push({at: 0, n: 'sub-drop', v: 0.28});
  cues.push({at: LF_TOTAL_FRAMES - 120, n: 'chime-final', v: 0.34});
  cues.push({at: LF_TOTAL_FRAMES - 40, n: 'shimmer-bright', v: 0.22});

  return cues.filter((c) => c.at >= 0 && c.at < LF_TOTAL_FRAMES);
};

export const LF_CUES: LFCue[] = build();
