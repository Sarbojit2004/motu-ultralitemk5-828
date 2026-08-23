// Real-image completeness check (Section 11 checkpoint 6).
//
// Verifies that every one of the 69 enumerated real images has a confirmed
// placement in this deliverable. Representational clips are tracked SEPARATELY
// and are never checked against this rule — they are editorially free by
// Section 0.3, and conflating the two in either direction is the failure mode
// this separation exists to prevent.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "src", "schedule.json"), "utf8"));
const M = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "src", "manifest.json"), "utf8"));

const ALL = M.images.map((i) => i.idx);
const byIdx = new Map(M.images.map((i) => [i.idx, i]));

const placements = new Map(); // idx -> [{beat, at}]
const clipUse = new Map();    // clip idx -> [{beat, at}]

const ts = (f) => {
  const s = Math.round(f / S.fps);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

for (const b of S.beats) {
  for (const i of b.img ?? []) {
    if (!placements.has(i)) placements.set(i, []);
    placements.get(i).push({ beat: b.id, at: ts(b.from), ch: b.chapter });
  }
  for (const [i, how] of [[b.clip, "fg"], [b.bedClip, "bed"]]) {
    if (i == null) continue;
    if (!clipUse.has(i)) clipUse.set(i, []);
    clipUse.get(i).push({ beat: b.id, at: ts(b.from), ch: b.chapter, how });
  }
}

const missing = ALL.filter((i) => !placements.has(i));
const unknown = [...placements.keys()].filter((i) => !byIdx.has(i));

console.log(`REAL-IMAGE COVERAGE — ${S.id}`);
console.log(`  inventory      : ${ALL.length}`);
console.log(`  placed         : ${placements.size}`);
console.log(`  missing        : ${missing.length}${missing.length ? " -> " + missing.join(", ") : ""}`);
console.log(`  unknown indices: ${unknown.length}${unknown.length ? " -> " + unknown.join(", ") : ""}`);

const perCh = {};
for (const [i, ps] of placements) {
  const first = ps[0];
  perCh[first.ch] = (perCh[first.ch] ?? 0) + 1;
}
console.log("  first placement by chapter:",
  Object.entries(perCh).map(([k, v]) => `ch${k}=${v}`).join("  "));

const multi = [...placements.entries()].filter(([, ps]) => ps.length > 1);
console.log(`  shown more than once: ${multi.length}`);

console.log(`\nREPRESENTATIONAL FOOTAGE USAGE (discretionary — not completeness-checked)`);
for (const c of M.clips) {
  const u = clipUse.get(c.idx) ?? [];
  console.log(
    `  clip ${String(c.idx).padStart(2)} ${c.title.padEnd(24)} cat ${c.category}  ${String(u.length).padStart(2)} use(s)` +
    (u.length ? "  " + u.map((x) => `${x.at}${x.how === "bed" ? " (bed)" : ""}`).join(", ") : "  (unused — permitted)")
  );
}

if (missing.length || unknown.length) process.exit(1);
console.log("\nOK — every enumerated real image has a confirmed placement.");
