// ─────────────────────────────────────────────────────────────────────────────
// THE SPEECH SCRIPT — single source of truth for this reel.
//
// One file produces BOTH the timestamped read-aloud script the client records
// and every on-screen caption, so the two cannot drift apart. Written at
// 162 wpm with beats and segment gaps, which lands the effective narration
// rate at ~152 wpm — the pace the client found easy to read and sync.
// Every number is a numeral, never a word, by instruction. No pricing.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductKey } from "./theme.ts";

export const REEL_WPM = 162;
export const SEGMENT_GAP = 0.4;
export const BEAT = 0.2;

export type Caption = { t: string; e: string; sw?: number; beat?: boolean };

export type Segment = {
  id: string;
  product: ProductKey;
  label: string;
  chapter?: string;
  env: "light" | "dark";
  hold?: number;
  captions: Caption[];
};

export const REEL_SEGMENTS: Segment[] = [
  {
    id: "hook",
    product: "shared",
    label: "MOTU UltraLite-mk5 + 828",
    env: "dark",
    captions: [
      { t: "Your studio is a desk.", e: "desk", sw: 5 },
      { t: "Or your studio is a rack.", e: "rack", sw: 6 },
      { t: "MOTU built 1 engine for both.", e: "1 engine", sw: 7, beat: true },
      { t: "Same converters. Same preamps. Same software.", e: "Same", sw: 6, beat: true },
    ],
  },
  {
    id: "engine",
    product: "shared",
    label: "One Engine",
    env: "dark",
    captions: [
      { t: "ESS Sabre32 Ultra.", e: "Sabre32", sw: 4 },
      { t: "125 dB of dynamic range.", e: "125 dB", sw: 8 },
      { t: "74 dB of gain. Minus 129 dBu of noise.", e: "74 dB", sw: 11 },
      { t: "CueMix 5 on both. EQ, gate, compressor, reverb.", e: "CueMix 5", sw: 9 },
      { t: "Mix in the hardware. Standalone.", e: "Standalone", sw: 5, beat: true },
    ],
  },
  {
    id: "smk5",
    product: "pmk5",
    label: "MOTU UltraLite-mk5",
    env: "light",
    captions: [
      { t: "The UltraLite-mk5.", e: "UltraLite-mk5", sw: 4 },
      { t: "18 in. 22 out. Half a rack.", e: "18", sw: 8 },
      { t: "2 preamps on the front. 6 line ins behind.", e: "2", sw: 10 },
      { t: "ADAT, S/PDIF, MIDI.", e: "MIDI", sw: 6 },
      { t: "A guitar straight into the front, on stage.", e: "guitar", sw: 8 },
      { t: "USB-C to a laptop. Or to an iPad.", e: "iPad", sw: 9, beat: true },
      { t: "2.4 ms round trip.", e: "2.4", sw: 6 },
      { t: "The whole rig fits in a backpack.", e: "backpack", sw: 7, beat: true },
    ],
  },
  {
    id: "s828",
    product: "p828",
    label: "MOTU 828",
    env: "dark",
    captions: [
      { t: "The 828.", e: "828", sw: 4 },
      { t: "28 in. 32 out. 1 rack space.", e: "28", sw: 8 },
      { t: "2 preamps with insert loops.", e: "insert", sw: 5 },
      { t: "8 line ins. 10 line outs. 2 optical banks.", e: "10", sw: 11 },
      { t: "Word clock for the rest of the rack.", e: "Word clock", sw: 8 },
      { t: "Talk to the singer from the front panel.", e: "singer", sw: 8 },
      { t: "A, B monitors. Loopback for the stream.", e: "Loopback", sw: 8, beat: true },
      { t: "2 headphone outs, 2 mixes.", e: "2", sw: 5 },
      { t: "Or run it from an iPad, over Wi-Fi.", e: "Wi-Fi", sw: 9 },
      { t: "A 3.9 inch display meters all of it.", e: "3.9", sw: 9, beat: true },
    ],
  },
  {
    id: "close",
    product: "shared",
    label: "MOTU UltraLite-mk5 + 828",
    env: "dark",
    captions: [
      { t: "Same engine. 2 sizes.", e: "2 sizes", sw: 4, beat: true },
      { t: "Choose the room. Not the sound.", e: "room", sw: 6, beat: true },
      { t: "MOTU UltraLite-mk5 and 828.", e: "UltraLite-mk5", sw: 7, beat: true },
    ],
  },
];

export const spokenWords = (c: Caption): number => c.sw ?? c.t.trim().split(/\s+/).length;
export type TimedCaption = Caption & { start: number; end: number; i: number };
export type TimedSegment = Omit<Segment, "captions"> & { start: number; speakAt: number; end: number; words: number; captions: TimedCaption[] };

export const buildTimeline = (segs: Segment[], lead = 0, wpm = REEL_WPM): { segments: TimedSegment[]; total: number; words: number } => {
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

export const REEL_TL = buildTimeline(REEL_SEGMENTS, 0, REEL_WPM);
