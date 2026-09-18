// ─────────────────────────────────────────────────────────────────────────────
// THE SPEECH SCRIPT — single source of truth for the 90 s reel.
//
// One file produces BOTH the timestamped read-aloud script the client records
// and every on-screen caption, so the two cannot drift apart.
//
// Written at 162 wpm; the beats and the 0.4 s gap after each segment pull the
// effective rate down to 148.3 wpm over 205 spoken words — inside the 140-160
// band the client reads comfortably, and a shade calmer than the AVB reel
// because this script carries more numerals. Every number is a numeral.
// No pricing is ever spoken. No competitor is named or implied.
//
// THE ARGUMENT, which is this repository's and is kept intact:
// *The Architecture of Scale — one standard, two environments.* Neither unit is
// a step toward the other. They share a conversion tier, a preamplifier and a
// mixer; they differ in scale and environment. The reel therefore spends its
// middle proving the sameness and its two acts proving the difference, and it
// never once says "better", "upgrade" or "entry level".
//
// PANEL ACCURACY. Both units carry exactly 2 MIC/LINE/INSTRUMENT combo inputs
// on the front — read off `ul-front-elev` and `e8-front-elev` in this
// repository, not from memory. The script is written so that no line can be
// heard as claiming the 828 has more preamplifiers than the UltraLite-mk5,
// because it does not. What the 828 has more of is I/O, monitoring and rack.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductKey } from "./theme.ts";

/** Words per minute the script is written to. */
export const REEL_WPM = 162;
/** Gap held after each segment so the reader can breathe and the edit can cut. */
export const SEGMENT_GAP = 0.4;
/** Extra beat after a caption that ends a thought. */
export const BEAT = 0.2;

export type Caption = {
  /** The phrase, exactly as spoken and exactly as captioned on screen. */
  t: string;
  /** The word the script face carries — the term the sentence turns on. */
  e: string;
  /** How many words this really is when read aloud (numerals expand). */
  sw?: number;
  /** Hold an extra beat after this caption. */
  beat?: boolean;
};

export type Segment = {
  id: string;
  product: ProductKey;
  label: string;
  /** Chapter title shown during the segment's un-narrated hold. */
  chapter?: string;
  env: "light" | "dark";
  /** Seconds of picture-only hold BEFORE the first word. */
  hold?: number;
  captions: Caption[];
};

// ═════════════════════════════════════════════════════════ THE 90 s REEL ══
export const REEL_SEGMENTS: Segment[] = [
  {
    id: "hook",
    product: "shared",
    label: "MOTU",
    env: "dark",
    captions: [
      { t: "One of these fits in a backpack.", e: "backpack", sw: 7 },
      { t: "One of these lives in a rack.", e: "rack", sw: 7, beat: true },
      { t: "Same converters.", e: "Same", sw: 2 },
      { t: "Same preamps.", e: "preamps", sw: 2 },
      { t: "Same mixer.", e: "mixer", sw: 2, beat: true },
      { t: "Neither is a smaller version of the other.", e: "Neither", sw: 8, beat: true },
    ],
  },
  {
    id: "shared",
    product: "shared",
    label: "One Standard",
    env: "dark",
    captions: [
      { t: "Both run ESS Sabre32 Ultra conversion.", e: "Sabre32", sw: 7 },
      { t: "125 dB of measured dynamic range.", e: "125 dB", sw: 9, beat: true },
      { t: "The same redesigned preamp.", e: "preamp", sw: 4 },
      { t: "74 dB of clean gain.", e: "74 dB", sw: 6 },
      { t: "Minus 129 dBu of input noise.", e: "129", sw: 9, beat: true },
      { t: "Both are mixed in CueMix 5.", e: "CueMix 5", sw: 7, beat: true },
      { t: "So the choice is never quality.", e: "never", sw: 6 },
      { t: "It is the room.", e: "the room", sw: 4, beat: true },
    ],
  },
  {
    id: "sul",
    product: "pul",
    label: "MOTU UltraLite-mk5",
    chapter: "THE AGILE HUB",
    env: "dark",
    hold: 0.7,
    captions: [
      { t: "The UltraLite-mk5.", e: "UltraLite-mk5", sw: 4 },
      { t: "18 in, 22 out, in half a rack.", e: "18", sw: 9 },
      { t: "2 combo inputs on the front.", e: "2", sw: 6 },
      { t: "2.4 ms, round trip.", e: "2.4 ms", sw: 6, beat: true },
      { t: "Mix it from an iPad.", e: "iPad", sw: 5 },
      { t: "Run it with no computer.", e: "no computer", sw: 5, beat: true },
      { t: "Add the rack ears.", e: "rack ears", sw: 4, beat: true },
    ],
  },
  {
    id: "s828",
    product: "p828",
    label: "MOTU 828",
    chapter: "THE STUDIO ANCHOR",
    env: "light",
    hold: 0.7,
    captions: [
      { t: "The 828.", e: "828", sw: 4 },
      { t: "28 in, 32 out, 1U of rack.", e: "28", sw: 9 },
      { t: "The same 2 preamps on the front.", e: "same", sw: 7, beat: true },
      { t: "What changes is everything around them.", e: "around", sw: 6, beat: true },
      { t: "A 3.9 inch RGB display.", e: "RGB", sw: 7 },
      { t: "Talkback. A and B monitors.", e: "Talkback", sw: 6 },
      { t: "2 independent headphone mixes.", e: "2", sw: 5 },
      { t: "Insert loops before conversion.", e: "Insert loops", sw: 4 },
      { t: "Loopback for the stream.", e: "Loopback", sw: 4, beat: true },
      { t: "2 optical banks.", e: "2", sw: 3, beat: true },
    ],
  },
  {
    id: "together",
    product: "shared",
    label: "Two Environments",
    env: "dark",
    captions: [
      { t: "The same engine, twice.", e: "twice", sw: 4 },
      { t: "1 travels.", e: "travels", sw: 2 },
      { t: "1 anchors.", e: "anchors", sw: 2, beat: true },
      { t: "Pick the panel your room needs.", e: "your room", sw: 6, beat: true },
    ],
  },
  {
    id: "close",
    product: "shared",
    label: "MOTU",
    env: "dark",
    captions: [
      { t: "MOTU UltraLite-mk5.", e: "UltraLite-mk5", sw: 3 },
      { t: "MOTU 828.", e: "828", sw: 3, beat: true },
      { t: "From Shivansh Electronics, Kolkata.", e: "Shivansh Electronics", sw: 5 },
      { t: "For East and North East India.", e: "North East", sw: 6, beat: true },
    ],
  },
];

// ── Derived timing ───────────────────────────────────────────────────────────

export const spokenWords = (c: Caption): number =>
  c.sw ?? c.t.trim().split(/\s+/).length;

export type TimedCaption = Caption & { start: number; end: number; i: number };

export type TimedSegment = Omit<Segment, "captions"> & {
  /** Segment start, including any hold. */
  start: number;
  /** First word. */
  speakAt: number;
  end: number;
  words: number;
  captions: TimedCaption[];
};

/**
 * Lays every caption on an absolute timeline from its spoken length. No scene
 * duration is ever estimated — it is derived from how long the words take to
 * say, which is what keeps the edit honest to the recorded read.
 */
export const buildTimeline = (
  segs: Segment[],
  lead = 0,
  wpm = REEL_WPM,
): { segments: TimedSegment[]; total: number; words: number } => {
  let t = lead;
  let allWords = 0;
  const segments = segs.map((seg) => {
    const start = t;
    t += seg.hold ?? 0;
    const speakAt = t;
    let words = 0;
    const captions = seg.captions.map((c, i) => {
      const w = spokenWords(c);
      words += w;
      const dur = (w / wpm) * 60 + (c.beat ? BEAT : 0);
      const cap: TimedCaption = { ...c, i, start: t, end: t + dur };
      t += dur;
      return cap;
    });
    allWords += words;
    const end = t;
    t += SEGMENT_GAP;
    return { ...seg, start, speakAt, end, words, captions };
  });
  return { segments, total: t - SEGMENT_GAP, words: allWords };
};

/** The reel opens on the first word. */
export const REEL_TL = buildTimeline(REEL_SEGMENTS, 0, REEL_WPM);
