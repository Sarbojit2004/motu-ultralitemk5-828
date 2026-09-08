export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * The reel's default camera easing.
 *
 * A plain ease-out flattens near the end, which is precisely the failure this
 * build exists to avoid: a shot that decelerates to a standstill reads as a
 * static card for its final half-second. So the curve keeps a permanent linear
 * component - the move always decelerates, but it never stops. It is also
 * defined outside [0,1] so a shot can keep drifting through its lead-in and
 * lag-out while it overlaps its neighbours.
 */
export const drift = (t: number) => {
  const e = 1 - Math.pow(1 - t, 3);
  return e * 0.86 + t * 0.14;
};

/** Snappy entrance for type and plates. */
export const outCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const outQuint = (t: number) => 1 - Math.pow(1 - clamp(t), 5);
export const inCubic = (t: number) => Math.pow(clamp(t), 3);
export const inOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Overshooting entrance, used for slabs snapping into place on a transient. */
export const backOut = (t: number, s = 1.5) => {
  const x = clamp(t) - 1;
  return x * x * ((s + 1) * x + s) + 1;
};
