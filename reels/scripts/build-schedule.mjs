// Authors src/schedule-reel1.json and src/schedule-reel2.json — the single
// source of truth each reel shares with the audio builder, the coverage audit,
// the branding audit and its VO script.
//
// RUNTIME: 178 s @ 30 fps = 5,340 frames each, exactly.
//
// These are a genuine PAIR, not one video cut two ways, and neither is a
// scaled-down copy of the long-form's segment table: each collapses the
// argument rather than shrinking it proportionally, opens on its own hook and
// closes on its own complete CTA, because a viewer may see either one alone.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const TOTAL_SEC = 178;
const BEATS = JSON.parse(fs.readFileSync(path.join(__dirname, "beats.json"), "utf8"));

/* ── music (Section 10 Layer 1) ──────────────────────────────────────────────
   The same Path A / Path B blend as the long-form, so all three deliverables
   read as one family: Mindscape is the signature that opens and closes each
   reel, ETERNITY (0.03 onsets/s — effectively a pad) carries the problem hook,
   and each reel's body is scored from the track its long-form chapter used —
   GIFTED for the UltraLite-mk5, DIABLO for the 828.                          */
const MUSIC = {
  reel1: [
    { track: "Mindscape",    fromSec: 0,   toSec: 8,   srcOffsetSec: 0,   stems: { BASS: 0.46, INSTRUMENTS: 0.50, MELODY: 0.38 } },
    { track: "ETERNITY",     fromSec: 8,   toSec: 28,  srcOffsetSec: 30,  stems: { BASS: 0.55, INSTRUMENTS: 0.42 } },
    { track: "GIFTED",       fromSec: 28,  toSec: 150, srcOffsetSec: 0,   stems: { BASS: 0.52, DRUMS: 0.34, INSTRUMENTS: 0.48 } },
    { track: "Mindscape",    fromSec: 150, toSec: 178, srcOffsetSec: 96,  stems: { BASS: 0.48, INSTRUMENTS: 0.50, MELODY: 0.40 } },
  ],
  reel2: [
    { track: "Mindscape",    fromSec: 0,   toSec: 8,   srcOffsetSec: 8,   stems: { BASS: 0.46, INSTRUMENTS: 0.50, MELODY: 0.38 } },
    { track: "ETERNITY",     fromSec: 8,   toSec: 31,  srcOffsetSec: 60,  stems: { BASS: 0.55, INSTRUMENTS: 0.42 } },
    { track: "DIABLO",       fromSec: 31,  toSec: 152, srcOffsetSec: 12,  stems: { BASS: 0.54, DRUMS: 0.38, INSTRUMENTS: 0.46, MELODY: 0.34 } },
    { track: "Mindscape",    fromSec: 152, toSec: 178, srcOffsetSec: 120, stems: { BASS: 0.48, INSTRUMENTS: 0.50, MELODY: 0.40 } },
  ],
};

const META = {
  reel1: { id: "Reel1", n: 1, title: "The Agile Hub",     product: "MOTU UltraLite-mk5", out: "motu-ultralite828-reel-1" },
  reel2: { id: "Reel2", n: 2, title: "The Studio Anchor", product: "MOTU 828",           out: "motu-ultralite828-reel-2" },
};

for (const key of ["reel1", "reel2"]) {
  const list = BEATS[key];
  const sum = list.reduce((a, b) => a + b.sec, 0);
  if (sum !== TOTAL_SEC) throw new Error(`${key}: beats sum to ${sum}s, need ${TOTAL_SEC}s`);

  const beats = [];
  let cursor = 0;
  for (const b of list) {
    beats.push({
      ...b,
      chapter: META[key].n,
      chapterId: key,
      chapterTitle: META[key].title,
      from: Math.round(cursor * FPS),
      durationInFrames: Math.round(b.sec * FPS),
      fromSec: cursor,
    });
    cursor += b.sec;
  }
  const durationInFrames = Math.round(TOTAL_SEC * FPS);
  const last = beats[beats.length - 1];
  if (last.from + last.durationInFrames !== durationInFrames) {
    throw new Error(`${key}: beats end at ${last.from + last.durationInFrames}, need ${durationInFrames}`);
  }

  const out = {
    id: META[key].id,
    reel: META[key].n,
    title: META[key].title,
    product: META[key].product,
    outName: META[key].out,
    fps: FPS,
    width: 1080,
    height: 1920,
    durationInSeconds: TOTAL_SEC,
    durationInFrames,
    voSlot: `voiceover-reel${META[key].n}.mp3`,
    musicSuffix: `-reel${META[key].n}`,
    beats,
    music: MUSIC[key].map((m, i) => ({ chapter: i + 1, ...m })),
  };
  const file = path.resolve(__dirname, "..", "src", `schedule-${key}.json`);
  fs.writeFileSync(file, JSON.stringify(out, null, 1));
  const imgs = new Set(beats.flatMap((b) => b.img ?? []));
  console.log(`schedule-${key}.json — ${beats.length} beats, ${durationInFrames} frames (${TOTAL_SEC}s), ` +
              `${imgs.size} real images, avg ${(TOTAL_SEC / beats.length).toFixed(1)}s/beat`);
}
