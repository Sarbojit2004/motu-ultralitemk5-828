// DUAL-COVERAGE CHECK (Section 1 / Section 11 checkpoint 6).
//
// Section 1 requires the coverage rule to hold TWICE, independently:
//   * every real image appears in the 598 s long-form, and
//   * every real image appears somewhere across the two 178 s reels.
// An image appearing only in the long-form does not satisfy the reel-pair
// requirement, and vice versa. This script proves the second half: that the
// combined reel-pair coverage accounts for the full inventory on its own terms,
// with no reliance on the long-form's list.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const M = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "manifest.json"), "utf8"));
const R1 = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "schedule-reel1.json"), "utf8"));
const R2 = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "schedule-reel2.json"), "utf8"));

const used = (S) => new Set(S.beats.flatMap((b) => b.img ?? []));
const a = used(R1), b = used(R2);
const all = M.images.map((i) => i.idx);
const union = new Set([...a, ...b]);
const both = [...a].filter((i) => b.has(i));
const missing = all.filter((i) => !union.has(i));

console.log("DUAL COVERAGE — the reel pair, checked independently of the long-form");
console.log(`  full real-image inventory : ${all.length}`);
console.log(`  Reel 1 "${R1.title}"       : ${a.size}`);
console.log(`  Reel 2 "${R2.title}"   : ${b.size}`);
console.log(`  union across the pair     : ${union.size}`);
console.log(`  in BOTH reels             : ${both.length}${both.length ? " -> " + both.join(", ") : ""}`);
console.log(`  missing from the pair     : ${missing.length}${missing.length ? " -> " + missing.join(", ") : ""}`);

// the division must also match what each image's manifest entry declares
const mismatch = M.images.filter((i) =>
  (i.reel === 1 && !a.has(i.idx)) || (i.reel === 2 && !b.has(i.idx)));
console.log(`  division matches manifest : ${mismatch.length === 0 ? "yes" : "NO -> " + mismatch.map((i) => i.idx).join(", ")}`);

if (missing.length || mismatch.length) process.exit(1);
console.log("\nOK — the two reels together account for the full inventory, independently.");
