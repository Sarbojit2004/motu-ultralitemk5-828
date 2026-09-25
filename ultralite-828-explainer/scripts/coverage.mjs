// Proves both films from the same data the renderer reads.
//
// Three things, all of which this build got wrong at least once:
//
//   1. COVERAGE — every frame of speech carries exactly one shot. A chapter
//      ends on its last word but the next begins SEGMENT_GAP later, and the
//      first version of the shot plan left that breath uncovered: every chapter
//      boundary cut to black for twelve frames.
//   2. BINDING — every shot names an asset and a region that actually exist,
//      and no two shots in a chapter are pinned to the same caption (which
//      silently produces a zero-length shot).
//   3. RANGE — no shot is pinned past the end of its chapter. placeShots clamps
//      rather than throwing, so an overflowing index is invisible at runtime.
//
// Exits non-zero if any of it stops being true.
import { VIDEO } from "../src/films.ts";
import { VIDEO_SHOTS } from "../src/shots.ts";
import { ASSETS, REGIONS } from "../src/assets.ts";

const have = new Set(ASSETS.map((a) => a.slug));
let bad = 0;

for (const [film, plan] of [[VIDEO, VIDEO_SHOTS]]) {
  const fps = 30;
  const endF = Math.round(film.speechEnd * fps);
  const cover = new Int32Array(endF);
  film.shots.forEach((s) => {
    const a = Math.round(s.start * fps);
    const b = Math.round(s.end * fps);
    for (let i = a; i < Math.min(b, endF); i++) cover[i]++;
  });

  const holes = [];
  let run = null;
  for (let i = 0; i < endF; i++) {
    if (cover[i] === 0) { if (!run) run = [i, i]; else run[1] = i; }
    else if (run) { holes.push(run); run = null; }
  }
  if (run) holes.push(run);

  const over = [...cover].filter((c) => c > 1).length;
  const short = film.shots.filter((s) => (s.end - s.start) * fps < 12);

  const issues = [];
  film.segments.forEach((seg) => {
    const specs = plan[seg.id] ?? [];
    specs.forEach((sp) => {
      if (sp.at >= seg.captions.length) issues.push(`${seg.id}: pinned to caption ${sp.at} of ${seg.captions.length}`);
      for (const slug of [sp.asset, ...(sp.assets ?? [])]) {
        if (slug && !have.has(slug)) issues.push(`${seg.id}: no such asset "${slug}"`);
      }
      if (sp.region && !REGIONS[sp.region]) issues.push(`${seg.id}: no such region "${sp.region}"`);
    });
    const ats = specs.map((s) => s.at);
    ats.filter((v, i) => ats.indexOf(v) !== i).forEach((v) => issues.push(`${seg.id}: two shots pinned to caption ${v}`));
  });

  console.log(
    `${film.id.padEnd(6)} ${String(film.shots.length).padStart(3)} shots / ${endF} frames  ` +
    `holes ${holes.length}  overlap ${over}  under-12f ${short.length}  binding ${issues.length}`,
  );
  holes.forEach(([a, b]) => console.log(`   HOLE ${a}-${b} (${(a / fps).toFixed(2)}s)`));
  short.forEach((s) => console.log(`   SHORT ${s.kind} ${((s.end - s.start) * fps).toFixed(1)}f at ${s.start.toFixed(2)}s`));
  issues.forEach((m) => console.log(`   BIND ${m}`));
  bad += holes.length + short.length + issues.length;
}

console.log(bad ? `\nFAILED — ${bad} problem(s)` : "\nboth films prove clean");
process.exit(bad ? 1 : 0);
