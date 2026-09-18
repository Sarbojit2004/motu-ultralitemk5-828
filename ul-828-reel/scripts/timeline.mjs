#!/usr/bin/env node
// Prints both timelines and writes scripts/_timeline.json for gen_audio.py.
// Run: node --experimental-strip-types scripts/timeline.mjs
import { writeFileSync } from "node:fs";
import { REEL_TL, FILM_TL, REEL_WPM, FILM_WPM } from "../src/script.ts";

const show = (name, tl, runtime) => {
  console.log(`\n== ${name}: ${tl.words} spoken words, narration ends ${tl.total.toFixed(2)} s of ${runtime} s, effective ${(tl.words / (tl.total / 60)).toFixed(1)} wpm (written ${tl === REEL_TL ? REEL_WPM : FILM_WPM})`);
  for (const s of tl.segments) {
    console.log(`  ${s.id.padEnd(9)} ${s.start.toFixed(1).padStart(6)} → ${s.end.toFixed(1).padStart(6)}  hold ${(s.hold ?? 0).toFixed(1)}  ${String(s.words).padStart(3)} w  ${s.captions.length} lines`);
  }
};
show("REEL", REEL_TL, 90);
show("FILM", FILM_TL, 300);
const strip = (tl) => ({
  total: tl.total,
  segments: tl.segments.map((s) => ({ id: s.id, product: s.product, env: s.env, start: s.start, speakAt: s.speakAt, end: s.end, hold: s.hold ?? 0,
    captions: s.captions.map((c) => ({ start: c.start, end: c.end, beat: !!c.beat })) })),
});
writeFileSync("scripts/_timeline.json", JSON.stringify({ reel: strip(REEL_TL), film: strip(FILM_TL) }, null, 1));
