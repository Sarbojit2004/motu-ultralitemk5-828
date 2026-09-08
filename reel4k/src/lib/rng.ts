/** Deterministic PRNG so every torn edge and tilt is identical on every render. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Hash an arbitrary string into a 32-bit seed. */
export const hash = (s: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/**
 * A torn-paper silhouette as a CSS polygon(), in percentages.
 * `amp` is the tear depth as a percentage of the box.
 */
export const tornPolygon = (seed: string, amp = 1.6, per = 9) => {
  const r = mulberry32(hash(seed));
  const pts: string[] = [];
  const edge = (
    n: number,
    fx: (t: number, j: number) => [number, number],
  ) => {
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const j = (r() - 0.5) * 2 * amp;
      const [x, y] = fx(t, j);
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
  };
  edge(per, (t, j) => [t * 100, Math.max(0, j + amp)]);
  edge(per, (t, j) => [Math.min(100, 100 - j - amp), t * 100]);
  edge(per, (t, j) => [100 - t * 100, Math.min(100, 100 - j - amp)]);
  edge(per, (t, j) => [Math.max(0, j + amp), 100 - t * 100]);
  return `polygon(${pts.join(',')})`;
};
