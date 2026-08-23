// Motion primitives. Stage 10's rule governs every one of them: smooth opacity
// fades and upward slides from a masked baseline, ease-in-out digital
// precision — no aggressive bounces, elastic overshoots or jarring impacts.
import { interpolate, Easing } from "remotion";

export const EASE = {
  out: Easing.bezier(0.16, 0.84, 0.28, 1),
  in: Easing.bezier(0.55, 0, 0.85, 0.3),
  inOut: Easing.bezier(0.45, 0, 0.25, 1),
  soft: Easing.bezier(0.33, 0, 0.33, 1),
  linear: Easing.linear,
} as const;

/** 0→1 ramp starting at `delay`, lasting `len` frames. */
export const ramp = (
  frame: number,
  delay: number,
  len: number,
  easing: (t: number) => number = EASE.out
): number =>
  interpolate(frame, [delay, delay + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Clamped interpolate with an easing, in one call. */
export const mapClamp = (
  frame: number,
  input: readonly [number, number],
  output: readonly [number, number],
  easing: (t: number) => number = EASE.inOut
): number =>
  interpolate(frame, input as unknown as number[], output as unknown as number[], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** Fade in then out across a beat, so scenes never pop. */
export const inOut = (
  frame: number,
  duration: number,
  fadeIn = 16,
  fadeOut = 14
): number => {
  const a = interpolate(frame, [0, fadeIn], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.out,
  });
  const b = interpolate(frame, [duration - fadeOut, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.in,
  });
  return Math.min(a, b);
};

/**
 * GIMBAL MICRO-MOVEMENT (Section 4). Continuous sub-pixel drift plus a very
 * shallow scale creep — the robotic-arm-precision language of Stage 5, applied
 * to an already-contained image so the whole unit stays in frame while the shot
 * breathes. Deterministic per seed so a still render matches the video frame.
 */
export const gimbal = (
  frame: number,
  seed = 0,
  amount = 1
): { x: number; y: number; scale: number; rot: number } => {
  const s = seed * 1.7 + 0.3;
  const t = frame / 30;
  return {
    x: (Math.sin(t * 0.21 + s) * 3.1 + Math.sin(t * 0.083 + s * 2.3) * 2.0) * amount,
    y: (Math.cos(t * 0.17 + s * 1.4) * 2.6 + Math.sin(t * 0.061 + s) * 1.7) * amount,
    scale: 1 + (Math.sin(t * 0.09 + s * 0.7) * 0.0035 + 0.0035) * amount,
    rot: Math.sin(t * 0.047 + s * 1.9) * 0.09 * amount,
  };
};

/** Animated counter value — Stage 10's "numbers build visual momentum". */
export const countUp = (
  frame: number,
  start: number,
  len: number,
  to: number
): number => Math.round(mapClamp(frame, [start, start + len], [0, to], EASE.out));

/** Thousands separators, Indian-agnostic (used for plain counts only). */
export const group = (n: number): string => n.toLocaleString("en-US");
