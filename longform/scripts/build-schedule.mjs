// Authors src/schedule.json — the single source of truth shared by the video
// (src/schedule.ts) and the audio builder (tools/make-audio.mjs), so picture
// and both audio layers can never drift apart.
//
// RUNTIME: 598 s @ 30 fps = 17,940 frames, exactly.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "..", "src", "schedule.json");
const FPS = 30;
const TOTAL_SEC = 598;

/* ── chapters ───────────────────────────────────────────────────────────────
   Proportioned per Section 5.1's arc. The Problem/Pain opening is 16% of
   runtime, inside the brief's "first 15-20%" guidance. The 828 chapter runs
   longer than the UltraLite chapter because it carries 25 first-placement
   images against 18 and more genuinely differentiating features.            */
const CHAPTERS = [
  { n: 1, id: "bottleneck", title: "The Bottleneck",     sec: 96,  track: "ETERNITY"     },
  { n: 2, id: "standard",   title: "One Standard",        sec: 110, track: "Mindscape"    },
  { n: 3, id: "agile",      title: "The Agile Hub",       sec: 126, track: "GIFTED"       },
  { n: 4, id: "anchor",     title: "The Studio Anchor",   sec: 138, track: "DIABLO"       },
  { n: 5, id: "proof",      title: "The Proof",           sec: 76,  track: "Black & Blue" },
  { n: 6, id: "scale",      title: "Choose Your Scale",   sec: 52,  track: "Mindscape"    },
];

const sum = CHAPTERS.reduce((a, c) => a + c.sec, 0);
if (sum !== TOTAL_SEC) throw new Error(`chapters sum to ${sum}s, need ${TOTAL_SEC}s`);

/* ── beats ──────────────────────────────────────────────────────────────────
   `kind` selects the scene layout. `img` are real-image indices (compulsory
   coverage). `clip` is a representational clip index (discretionary).
   `sfx` cues fire at a frame offset within the beat.                         */
const B = (id, sec, kind, o = {}) => ({ id, sec, kind, ...o });

const BEATS = {
  bottleneck: [
    B("c1-cold-open",     11, "clipHero",   { clip: 1,  trim: 0.4, rate: 0.92, grade: "cool",
                                              eyebrow: "The Architecture of Scale",
                                              editorial: "Every session starts the same way.",
                                              brand: "corner", sfx: [["data-stream", 0, 0.16]] }),
    B("c1-cables",         9, "clipHero",   { clip: 1,  trim: 3.6, rate: 1.0, grade: "cool",
                                              editorial: "Not with an idea — with a cable.",
                                              brand: "corner" }),
    B("c1-no-port",       10, "clipSplit",  { clip: 1,  trim: 5.4, rate: 0.95, grade: "cool",
                                              headline: "No free input",
                                              body: "A hand hovers over a back panel that is already full. The take waits.",
                                              sfx: [["trs-seat", 22, 0.5]] }),
    B("c1-headphones",    10, "clipSplit",  { clip: 2,  trim: 1.2, rate: 1.0, grade: "cool",
                                              headline: "The monitor drops",
                                              body: "Latency does not just cost time. It costs the performance.",
                                              brand: "lower" }),
    B("c1-ceiling",       11, "clipHero",   { clip: 6,  trim: 0.6, rate: 1.0, grade: "cool",
                                              editorial: "A rack of good gear, sitting unpowered.",
                                              brand: "corner", sfx: [["encoder-click", 40, 0.4]] }),
    B("c1-unplugged",     10, "montage",    { img: [44, 64], cols: 2,
                                              eyebrow: "The cost of running out of inputs",
                                              headline: "Patched once. Then never again." }),
    B("c1-ceiling-2",      9, "clipSplit",  { clip: 6,  trim: 5.8, rate: 1.05, grade: "cool",
                                              headline: "Routing around the problem",
                                              body: "Re-patching is not workflow. It is interruption.",
                                              sfx: [["trs-seat", 14, 0.42], ["trs-seat", 46, 0.36]] }),
    B("c1-growing",       10, "montage",    { img: [68, 63], cols: 2,
                                              eyebrow: "The room keeps growing",
                                              headline: "The interface does not.",
                                              brand: "lower" }),
    B("c1-turn",          16, "statement",  { eyebrow: "Two answers, one standard",
                                              editorial: "So the question was never which one is better.",
                                              sub: "It was only ever a question of scale.",
                                              brand: "beat", motu: true,
                                              sfx: [["avb-ping", 30, 0.5]] }),
  ],
  standard: [
    B("c2-open",          9, "chapterOpen",{ eyebrow: "Chapter 02", headline: "One Standard",
                                              sub: "Two environments. The same uncompromising conversion.",
                                              motu: true, brand: "corner" }),
    B("c2-thesis",        10, "clipSplit",  { clip: 3,  trim: 0.3, rate: 0.9, grade: "none",
                                              headline: "The same engine room",
                                              body: "Identical conversion. Identical preamplifier design. Identical software. What differs is how much of the studio it has to carry.",
                                              sfx: [["avb-ping", 20, 0.42]] }),
    B("c2-ess",           9, "badgeSpec",  { img: [57], metric: "125 dB(A)", context: "Output dynamic range",
                                              narrative: "ESS Sabre32 Ultra — ES9026PRO, in both units.",
                                              brand: "corner", sfx: [["encoder-click", 24, 0.42]] }),
    B("c2-wave",          11, "conversionWave", { bedClip: 7, bedTrim: 1.2, bedRate: 0.85,
                                              eyebrow: "Conversion", headline: "Digital in. Analog out.",
                                              sub: "Mastering-grade conversion, identical across the pair.",
                                              brand: "lower" }),
    B("c2-renders",       10, "compare",    { img: [14, 25], brand: "corner",
                                              eyebrow: "One standard, two environments",
                                              leftLabel: "UltraLite-mk5 · The Agile Hub",
                                              rightLabel: "828 · The Studio Anchor",
                                              sfx: [["usbc-seat", 18, 0.5], ["usbc-seat", 34, 0.5]] }),
    B("c2-preamp",        10, "gainSwell",  { eyebrow: "Redesigned microphone preamplifiers",
                                              headline: "+74 dB of clean gain",
                                              sub: "−129 dBu EIN, A-weighted. In 1 dB increments. On both.",
                                              brand: "corner", sfx: [["xlr-lock", 26, 0.5]] }),
    B("c2-cuemix",        9, "badgeSpec",  { img: [41], metric: "CueMix 5", context: "DSP mixing ecosystem",
                                              narrative: "EQ, reverb, dynamics and loopback — on the hardware, not the host CPU.",
                                              accent: "signal", brand: "lower" }),
    B("c2-latency",       9, "compare",    { img: [19, 51],
                                              eyebrow: "Round-trip latency",
                                              leftLabel: "UltraLite-mk5 · 2.4 ms",
                                              rightLabel: "828 · ~2 ms",
                                              sub: "At 96 kHz, 32-sample buffer.",
                                              sfx: [["usbc-seat", 20, 0.46]] }),
    B("c2-daw",           8, "montage",    { img: [45, 47], cols: 2,
                                              eyebrow: "Straight into the session",
                                              headline: "macOS. Windows. iOS.",
                                              brand: "corner" }),
    B("c2-system",        8, "heroWide",   { img: [23],
                                              eyebrow: "Everything, connected",
                                              headline: "One hub for the whole room" }),
    B("c2-bundles",       8, "montage",    { img: [38, 43, 61, 62, 67], cols: 3,
                                              eyebrow: "Included software",
                                              headline: "Ready to record on day one",
                                              brand: "lower" }),
    B("c2-brand",         9, "brandBeat",  { brand: "beat", motu: true, socials: true,
                                              sfx: [["avb-ping", 24, 0.44]] }),
  ],
};

// Chapters 3-6 are authored in the companion file so this stays readable.
const more = JSON.parse(fs.readFileSync(path.resolve(__dirname, "beats-3456.json"), "utf8"));
Object.assign(BEATS, more);

/* ── assemble ─────────────────────────────────────────────────────────────── */
const beats = [];
let cursorSec = 0;
for (const ch of CHAPTERS) {
  const list = BEATS[ch.id];
  if (!list) throw new Error(`no beats for chapter ${ch.id}`);
  const chSum = list.reduce((a, b) => a + b.sec, 0);
  if (chSum !== ch.sec) {
    throw new Error(`chapter ${ch.n} "${ch.title}": beats sum to ${chSum}s, declared ${ch.sec}s`);
  }
  for (const b of list) {
    const from = Math.round(cursorSec * FPS);
    const durationInFrames = Math.round(b.sec * FPS);
    beats.push({
      ...b,
      chapter: ch.n,
      chapterId: ch.id,
      chapterTitle: ch.title,
      from,
      durationInFrames,
      fromSec: cursorSec,
    });
    cursorSec += b.sec;
  }
}

const durationInFrames = Math.round(TOTAL_SEC * FPS);
const last = beats[beats.length - 1];
if (last.from + last.durationInFrames !== durationInFrames) {
  throw new Error(`beats end at ${last.from + last.durationInFrames}, need ${durationInFrames}`);
}

/* ── music plan (Section 10 Layer 1) ────────────────────────────────────────
   The AVB-proven Path A / Path B blend. Mindscape is the signature that opens
   and closes; each body chapter is scored from its own track's stems. Every
   track is shorter than 598 s, so per-chapter scoring is what keeps the bed
   from audibly looping — each chapter draws a fresh window from its own track. */
const MUSIC = CHAPTERS.map((c) => ({
  chapter: c.n,
  track: c.track,
  fromSec: beats.find((b) => b.chapter === c.n).fromSec,
  toSec: beats.filter((b) => b.chapter === c.n).reduce((a, b) => a + b.sec, 0)
       + beats.find((b) => b.chapter === c.n).fromSec,
  stems: c.id === "bottleneck" ? { BASS: 0.55, INSTRUMENTS: 0.42 }
       : c.id === "standard"   ? { BASS: 0.50, INSTRUMENTS: 0.52, MELODY: 0.38 }
       : c.id === "agile"      ? { BASS: 0.52, DRUMS: 0.34, INSTRUMENTS: 0.48 }
       : c.id === "anchor"     ? { BASS: 0.54, DRUMS: 0.38, INSTRUMENTS: 0.46, MELODY: 0.34 }
       : c.id === "proof"      ? { BASS: 0.50, DRUMS: 0.46, INSTRUMENTS: 0.50 }
       :                         { BASS: 0.48, INSTRUMENTS: 0.50, MELODY: 0.40 },
  // Source offset so a chapter never replays the same window as another.
  srcOffsetSec: c.id === "bottleneck" ? 18 : c.id === "standard" ? 6
              : c.id === "agile" ? 0 : c.id === "anchor" ? 20
              : c.id === "proof" ? 26 : 96,
}));

const out = {
  id: "LongForm",
  fps: FPS,
  width: 1920,
  height: 1080,
  durationInSeconds: TOTAL_SEC,
  durationInFrames,
  voSlot: "voiceover-longform.mp3",
  chapters: CHAPTERS,
  beats,
  music: MUSIC,
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`schedule.json — ${beats.length} beats, ${CHAPTERS.length} chapters, ${durationInFrames} frames (${TOTAL_SEC}s)`);
for (const ch of CHAPTERS) {
  const n = beats.filter((b) => b.chapter === ch.n).length;
  console.log(`  ch${ch.n} ${ch.title.padEnd(22)} ${String(ch.sec).padStart(3)}s  ${n} beats  music=${ch.track}`);
}
