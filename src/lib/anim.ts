import {interpolate, Easing, spring} from 'remotion';
import {FPS} from './theme';

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_SOFT = Easing.bezier(0.33, 1, 0.68, 1);

/** Clamped interpolate with a premium default ease. */
export const ramp = (
  f: number,
  range: [number, number],
  out: [number, number],
  easing = EASE_OUT,
): number =>
  interpolate(f, range, out, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Fade-in / hold / fade-out envelope. */
export const envelope = (
  f: number,
  dur: number,
  inF = 10,
  outF = 10,
): number =>
  Math.min(
    ramp(f, [0, inF], [0, 1]),
    ramp(f, [dur - outF, dur], [1, 0], EASE_IN_OUT),
  );

/**
 * Scene entry ramp. Sequences are rendered OVERLAP frames longer than their
 * slot, so the incoming scene fades in on top of the outgoing one — a real
 * cross-dissolve instead of a dip to black at every cut.
 */
export const sceneIn = (f: number, n = 9): number => ramp(f, [0, n], [0, 1], EASE_IN_OUT);

export const pop = (f: number, delay = 0, damping = 14): number =>
  spring({frame: f - delay, fps: FPS, config: {damping, mass: 0.55, stiffness: 120}});

export const popSoft = (f: number, delay = 0): number =>
  spring({frame: f - delay, fps: FPS, config: {damping: 200, mass: 0.9, stiffness: 90}});

/** Ken-Burns transform string for a photo layer. */
export const kenBurns = (
  f: number,
  dur: number,
  z: [number, number] = [1.06, 1.16],
  x: [number, number] = [0, 0],
  y: [number, number] = [0, 0],
): string => {
  const t = dur <= 0 ? 0 : Math.min(1, Math.max(0, f / dur));
  const s = z[0] + (z[1] - z[0]) * t;
  const tx = x[0] + (x[1] - x[0]) * t;
  const ty = y[0] + (y[1] - y[0]) * t;
  return `translate3d(${tx}%, ${ty}%, 0) scale(${s})`;
};

/** Index -> delay, for staggered reveals. */
export const stag = (i: number, per = 4, base = 0): number => base + i * per;

/** Deterministic pseudo-random in [0,1) from an integer seed. */
export const rnd = (seed: number): number => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};
