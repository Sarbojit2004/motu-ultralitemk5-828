/**
 * Visual language for the montage reel.
 *
 * Deliberately NOT the type/colour system of the repository's separate
 * 178-second project (master brief S1) - this reel's identity is the paper
 * collage: cream stock, ink, and two accent inks pulled from the two logos in
 * the repo (MOTU's blue, Shivansh's red-adjacent warmth).
 */

export const C = {
  paper: '#EDE8DC',
  paperDeep: '#DFD8C8',
  ink: '#16161A',
  inkSoft: '#3A3A42',
  white: '#FBF9F4',
  /** Sampled from the MOTU brand logo. */
  motuBlue: '#2F6FC0',
  motuBlueDeep: '#1B4E93',
  /** Collage accent, matching the reference video's red slabs. */
  red: '#D8342A',
  teal: '#1E9B94',
  amber: '#E0A32B',
} as const;

export const F = {
  /** Tall condensed display - product names, big mood lines. */
  display: '"Anton", "Arial Narrow", sans-serif',
  /** Heavy grotesque - short punch words inside slabs. */
  heavy: '"Archivo Black", "Arial Black", sans-serif',
  /** Condensed workhorse - secondary lines. */
  cond: '"Oswald", "Arial Narrow", sans-serif',
  /** Small caps labels, callouts, contact block. */
  label: '"Barlow Semi Condensed", Arial, sans-serif',
} as const;

/**
 * Parallax depth multipliers - the concrete, tunable values required by master
 * brief S3.2. A layer at depth d takes the camera's displacement times d, so
 * the backdrop crawls, the photography sits mid-plane, and type rides in front.
 */
export const DEPTH = {
  paper: 0.2,      // the cream sheet itself (brief's "0.2x background")
  streak: 0.28,    // diagonal light streaks over the sheet
  scrap: 0.42,     // torn colour scraps and slabs behind the photograph
  photoFar: 0.5,   // secondary plate in a multi-plate composition
  photo: 0.6,      // the product photography plane (brief's "0.6x")
  photoNear: 0.74, // nearest plate in a multi-plate composition
  type: 1.0,       // headline type (brief's "1.0x")
  callout: 1.3,    // callout labels and rules - nearest of all
} as const;
