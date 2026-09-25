// ─────────────────────────────────────────────────────────────────────────────
// WHICH MOVE, AND WHICH SOUND UNDER IT
//
// Kept out of Transitions.tsx — which is JSX — so the audio stem build can
// import it. The stem carries the whole transition layer at the exact positions
// the film plays it, and it is built by Node running the same code the renderer
// uses; Node's type-stripping loader does not read .tsx.
// ─────────────────────────────────────────────────────────────────────────────

export type TransitionKind =
  | "fade"
  | "wipeDiag"
  | "whipLeft"
  | "whipRight"
  | "punchIn"
  | "pullBack"
  | "slideUp"
  | "flash";

/** Frames each move takes. Longer than a cut, shorter than a dissolve. */
export const TRANS: Record<TransitionKind, number> = {
  fade: 11,
  wipeDiag: 13,
  whipLeft: 9,
  whipRight: 9,
  punchIn: 8,
  pullBack: 10,
  slideUp: 11,
  flash: 7,
};

const BOUNDARY: TransitionKind[] = ["wipeDiag", "whipLeft", "flash", "whipRight", "slideUp"];
const INSIDE: TransitionKind[] = ["punchIn", "pullBack", "fade", "slideUp", "punchIn", "wipeDiag"];

export const transitionFor = (seed: number, boundary: boolean, first: boolean): TransitionKind => {
  if (first) return "fade";
  return boundary ? BOUNDARY[seed % BOUNDARY.length] : INSIDE[seed % INSIDE.length];
};

/**
 * Which cue belongs under each move.
 *
 * Every name below is cut from the sound-effects library supplied with this
 * brief — see scripts/cut_sfx.py for which take of which file each one is, and
 * why the pack's multi-take files had to be split before they could be used.
 */
export const TRANS_CUE: Record<TransitionKind, string> = {
  fade: "air-pass",
  wipeDiag: "gate-snap",
  whipLeft: "whip-mid",
  whipRight: "whip-bright",
  punchIn: "impact-tight",
  pullBack: "impact-full",
  slideUp: "riser-short",
  flash: "snap-low",
};
