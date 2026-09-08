import {ShotSpec} from './shots/Shot';
import {COLD_OPEN} from './shots/coldOpen';
import {ULTRALITE} from './shots/ultralite';
import {E828} from './shots/e828';
import {CLOSE} from './shots/close';
import {beatF, MOVEMENT, DURATION_FRAMES} from './lib/grid';
import {Cam} from './camera/Camera';

export type PlacedShot = ShotSpec & {
  startBeat: number;
  startFrame: number;
  bodyFrames: number;
};

/**
 * The cut list.
 *
 * Shots are laid end to end in beats and only converted to frames at the edges,
 * so every cut in the reel sits on the measured 134.02 BPM grid - i.e. on a
 * real transient in the track - rather than on a round clock value
 * (master brief S6).
 */
export const TIMELINE: PlacedShot[] = (() => {
  const all = [...COLD_OPEN, ...ULTRALITE, ...E828, ...CLOSE];
  const out: PlacedShot[] = [];
  let b = 0;
  for (const s of all) {
    const startFrame = beatF(b);
    const endFrame = beatF(b + s.beats);
    out.push({...s, startBeat: b, startFrame, bodyFrames: endFrame - startFrame});
    b += s.beats;
  }
  return out;
})();

export const TOTAL_BEATS = TIMELINE.reduce((a, s) => a + s.beats, 0);

/** The shot that owns a given frame. */
export const shotAt = (f: number): PlacedShot => {
  for (let i = TIMELINE.length - 1; i >= 0; i--) {
    if (f >= TIMELINE[i].startFrame) return TIMELINE[i];
  }
  return TIMELINE[0];
};

/** Camera for the paper world: whichever shot currently owns the frame. */
export const worldCamAt = (f: number): Cam => {
  const s = shotAt(f);
  return s.move((f - s.startFrame) / s.bodyFrames);
};

/** Development-time sanity checks on the plan the brief fixes. */
export const checkTimeline = () => {
  const errs: string[] = [];
  const per = {co: 0, ul: 0, e8: 0, cl: 0};
  let b = 0;
  for (const s of TIMELINE) {
    if (b < MOVEMENT.ultralite.from) per.co += s.beats;
    else if (b < MOVEMENT.e828.from) per.ul += s.beats;
    else if (b < MOVEMENT.close.from) per.e8 += s.beats;
    else per.cl += s.beats;
    b += s.beats;
  }
  if (Math.abs(TOTAL_BEATS - 202.6) > 0.001) errs.push(`total beats ${TOTAL_BEATS} != 202.6`);
  const last = TIMELINE[TIMELINE.length - 1];
  const end = last.startFrame + last.bodyFrames;
  if (end !== DURATION_FRAMES) errs.push(`timeline ends at frame ${end}, composition is ${DURATION_FRAMES}`);
  return {errs, per, shots: TIMELINE.length};
};
