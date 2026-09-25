// Emits scripts/timeline.json from src/script.ts.
//
// WHY THIS EXISTS. The audio build needs to know where every chapter and every
// caption falls, and so does the renderer. If Python recomputed the timeline
// from its own copy of the pacing rules, the two would agree until the first
// time either copy was touched, and then a transition cue would sit a frame or
// two off a cut with nothing to show why. So the timeline is computed ONCE, by
// the same TypeScript the renderer imports, and written out as data.
import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { VIDEO_SEGMENTS, buildTimeline, WPM, SEGMENT_GAP, BEAT } from "../src/script.ts";
import { FORMATS } from "../src/theme.ts";

const here = dirname(fileURLToPath(import.meta.url));

const pack = (segments, fmt) => {
  const tl = buildTimeline(segments);
  const outro = FORMATS[fmt].outroSeconds;
  return {
    format: fmt,
    fps: FORMATS[fmt].fps,
    width: FORMATS[fmt].width,
    height: FORMATS[fmt].height,
    speechEnd: tl.total,
    outroSeconds: outro,
    total: tl.total + outro,
    words: tl.words,
    wpmEffective: tl.words / (tl.total / 60),
    segments: tl.segments.map((s) => ({
      id: s.id, accent: s.accent, chapter: s.chapter,
      start: s.start, end: s.end, words: s.words,
      captions: s.captions.map((c) => ({ i: c.i, t: c.t, e: c.e, start: c.start, end: c.end, beat: !!c.beat })),
    })),
  };
};

const out = {
  pacing: { WPM, SEGMENT_GAP, BEAT },
  video: pack(VIDEO_SEGMENTS, "video"),
};
writeFileSync(resolve(here, "timeline.json"), JSON.stringify(out, null, 2));
for (const k of ["video"]) {
  const f = out[k];
  console.log(
    `${k.padEnd(6)} ${f.segments.length} chapters  ${f.segments.reduce((a, s) => a + s.captions.length, 0)} captions  ` +
    `${f.words} words  speech ${f.speechEnd.toFixed(2)}s + outro ${f.outroSeconds}s = ${f.total.toFixed(2)}s  ` +
    `(${f.wpmEffective.toFixed(1)} wpm, ${Math.round(f.total * f.fps)} frames)`,
  );
}
