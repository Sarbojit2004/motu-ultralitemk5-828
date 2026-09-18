#!/usr/bin/env node
// Prints each film's SFX cue sheet — the same derivation Film.tsx renders from —
// to out/audio/<film>-sfx-plan.json for scripts/deliver-audio.py.
// Run: node --experimental-strip-types scripts/sfx-plan.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { REEL_TL, FILM_TL } from "../src/script.ts";
import { REEL_PINS, FILM_PINS, buildShots } from "../src/shots.ts";
import { REEL, FILM } from "../src/theme.ts";
import { buildSfxPlan, placeShots } from "../src/sfx.ts";

mkdirSync("out/audio", { recursive: true });
for (const [name, tl, pins, canvas, runtime] of [["reel", REEL_TL, REEL_PINS, REEL, 90], ["film", FILM_TL, FILM_PINS, FILM, 300]]) {
  const outroAt = +(tl.total + 0.6).toFixed(2);
  const shots = placeShots(buildShots(tl.segments, pins, canvas, outroAt));
  const cues = buildSfxPlan(tl.segments, shots, outroAt, canvas.fps);
  const plan = { film: name, runtime, fps: canvas.fps, outroAt, cues: cues.map((c) => ({ at: +c.at.toFixed(4), frame: Math.round(c.at * canvas.fps), cue: c.cue })) };
  writeFileSync(`out/audio/motu-avb-${name}-sfx-plan.json`, JSON.stringify(plan, null, 1));
  const byCue = cues.reduce((a, c) => ((a[c.cue] = (a[c.cue] || 0) + 1), a), {});
  console.log(`${name}: ${cues.length} cues over ${runtime} s  ${JSON.stringify(byCue)}`);
}
