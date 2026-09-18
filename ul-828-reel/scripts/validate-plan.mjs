#!/usr/bin/env node
// Resolves every pin of both shot plans against the real asset index and the
// Higgsfield index, so a missing slug fails here rather than 40 minutes into a
// 4K render. Run: node --experimental-strip-types scripts/validate-plan.mjs
import { REEL_TL, FILM_TL } from "../src/script.ts";
import { REEL_PINS, FILM_PINS, buildShots, coveredSlugs } from "../src/shots.ts";
import { REEL, FILM } from "../src/theme.ts";
import { ASSETS } from "../src/assets.ts";

let bad = 0;
for (const [name, tl, pins, canvas] of [["REEL", REEL_TL, REEL_PINS, REEL], ["FILM", FILM_TL, FILM_PINS, FILM]]) {
  const warn = console.warn; const warned = [];
  console.warn = (m) => warned.push(m);
  let shots = [];
  try { shots = buildShots(tl.segments, pins, canvas, tl.total + 0.6); } catch (e) { console.log(`${name}: ${e.message}`); bad++; }
  console.warn = warn;
  for (const w of warned) { console.log(`${name}: ${w}`); bad++; }
  const kinds = shots.reduce((a, s) => ((a[s.res.kind] = (a[s.res.kind] || 0) + 1), a), {});
  const short = shots.filter((s) => s.end - s.start < 1.0);
  console.log(`${name}: ${shots.length} shots  ${JSON.stringify(kinds)}  covered real images: ${coveredSlugs(pins).size}/${ASSETS.length}` + (short.length ? `  ⚠ ${short.length} shots under 1.0 s: ${short.map((s) => `${s.segment}@${s.start.toFixed(1)}`).join(", ")}` : ""));
}
process.exit(bad ? 1 : 0);
