import {clamp, outQuint, inCubic} from '../lib/ease';
import {mulberry32, hash} from '../lib/rng';

export type Dir = 'l' | 'r' | 't' | 'b' | 'z' | 'zo' | 'none';

/**
 * Every collage component owns its lifetime independently of the shot it
 * belongs to. `inAt` may be negative and `outAt` may exceed the shot length, so
 * one composition's pieces are still sliding out while the next composition's
 * pieces are already arriving - the overlapping choreography the brief asks for
 * instead of whole-card cuts (master brief S3.4).
 */
export type Life = {
  /** 0 -> 1 as the component arrives. */
  enter: number;
  /** 0 -> 1 as it leaves. */
  exit: number;
  /** 0 -> 1 across the whole visible life, used for the component's own drift. */
  age: number;
  alive: boolean;
  opacity: number;
};

export const lifeOf = (
  lb: number,
  inAt: number,
  outAt: number,
  inBeats = 0.5,
  outBeats = 0.4,
): Life => {
  const enter = clamp((lb - inAt) / inBeats);
  const exit = clamp((lb - outAt) / outBeats);
  const age = clamp((lb - inAt) / Math.max(0.001, outAt - inAt));
  // Collage pieces cut in hard and slide, rather than dissolving.
  const opacity = clamp(enter * 4) * clamp((1 - exit) * 4);
  return {enter, exit, age, alive: lb >= inAt - 0.02 && exit < 1, opacity};
};

/** Offset for a component that is `k` of the way in (k=1 -> at rest). */
export const dirOffset = (dir: Dir, k: number, dist: number) => {
  const e = 1 - k;
  switch (dir) {
    case 'l': return {x: -dist * e, y: 0, s: 1, r: -e * 3};
    case 'r': return {x: dist * e, y: 0, s: 1, r: e * 3};
    case 't': return {x: 0, y: -dist * e, s: 1, r: e * 1.5};
    case 'b': return {x: 0, y: dist * e, s: 1, r: -e * 1.5};
    case 'z': return {x: 0, y: 0, s: 1 + 0.42 * e, r: e * 1.2};
    case 'zo': return {x: 0, y: 0, s: 1 - 0.3 * e, r: -e * 1.2};
    default: return {x: 0, y: 0, s: 1, r: 0};
  }
};

/**
 * Resolve a component's transform for this frame: entrance, exit, and the
 * component's own never-settling drift combined.
 *
 * The own-drift term is deliberate insurance. Even if a shot's camera move were
 * subtle, every component still scales and travels a little across its whole
 * life, so no layer can ever be found at an identical transform at two
 * different timestamps (master brief S3.1 self-check).
 */
export const resolveTransform = (
  life: Life,
  seed: string,
  opt: {
    from?: Dir;
    to?: Dir;
    dist?: number;
    ownZoom?: number;
    ownDrift?: [number, number];
    ownRot?: number;
  } = {},
) => {
  const {from = 'z', to = 'zo', dist = 380, ownZoom = 0.05} = opt;
  const r = mulberry32(hash(seed));
  const dx = opt.ownDrift ? opt.ownDrift[0] : (r() - 0.5) * 52;
  const dy = opt.ownDrift ? opt.ownDrift[1] : (r() - 0.5) * 52;
  const dr = opt.ownRot ?? (r() - 0.5) * 1.4;

  const a = dirOffset(from, outQuint(life.enter), dist);
  const b = dirOffset(to, 1 - inCubic(life.exit), dist * 0.85);
  return {
    x: a.x + b.x + dx * life.age,
    y: a.y + b.y + dy * life.age,
    s: a.s * b.s * (1 + ownZoom * life.age),
    r: a.r + b.r + dr * life.age,
    opacity: life.opacity,
  };
};
