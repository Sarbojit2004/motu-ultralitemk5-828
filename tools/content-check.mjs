// Section 11 checkpoint 4 / 16: confirm no other-brand references, no TASCAM
// mention, and no fabricated pricing anywhere in what this build authored.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Only what THIS build authored. The prior build at the repository root is out
// of scope — it is not part of this work and is not being delivered.
const SCOPE = [
  "longform/src", "longform/scripts", "longform/README.md", "longform/ASSET_COVERAGE.md",
  "longform/BRANDING_CADENCE.md",
  "reels/src", "reels/scripts", "reels/README.md",
  "reels/ASSET_COVERAGE_REEL1.md", "reels/ASSET_COVERAGE_REEL2.md",
  "reels/BRANDING_CADENCE_REEL1.md", "reels/BRANDING_CADENCE_REEL2.md",
  "tools",
  "README_DELIVERABLES.md", "ASSET_COVERAGE.md",
  "VO_SCRIPT_MOTU_ULTRALITE828_LONGFORM_598S.md",
  "VO_SCRIPT_MOTU_ULTRALITE828_REEL1.md",
  "VO_SCRIPT_MOTU_ULTRALITE828_REEL2.md",
];

const BANNED = [
  ["TASCAM", /\btascam\b/i],
  ["Focusrite", /\bfocusrite\b/i],
  ["Universal Audio", /\buniversal\s+audio\b/i],
  ["RME", /\bRME\b/],
  ["PreSonus", /\bpresonus\b/i],
  ["Audient", /\baudient\b/i],
  ["Apogee", /\bapogee\b/i],
  ["Behringer", /\bbehringer\b/i],
  ["SSL / Solid State Logic", /\bsolid\s+state\s+logic\b/i],
  ["Antelope", /\bantelope\b/i],
  ["Arturia", /\barturia\b/i],
  ["Steinberg", /\bsteinberg\b/i],
  ["Zoom (interface brand)", /\bzoom\s+(?:h\d|u-\d|uac)/i],
];

// The only two prices that may appear, exactly as supplied.
const ALLOWED_PRICES = ["Rs. 81,900", "Rs. 1,28,000",
  "eighty-one thousand nine hundred", "one lakh twenty-eight thousand"];
const PRICE_RE = /(?:\bRs\.?|₹|\bINR\b)\s*[\d,]+\d/gi;

const files = [];
const walk = (p) => {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) return;
  if (fs.statSync(abs).isDirectory()) {
    for (const f of fs.readdirSync(abs)) walk(path.join(p, f));
  } else if (/\.(tsx?|mjs|json|md)$/.test(p) && !p.includes("node_modules")
             && path.basename(p) !== "content-check.mjs") {
    // the checker necessarily contains every banned term, so it excludes itself
    files.push(p);
  }
};
SCOPE.forEach(walk);

let bad = 0;
console.log(`content check — ${files.length} authored files in scope\n`);

for (const [label, re] of BANNED) {
  const hits = files.filter((f) => re.test(fs.readFileSync(path.join(ROOT, f), "utf8")));
  if (hits.length) { console.log(`  ! ${label}: ${hits.join(", ")}`); bad++; }
}
console.log(bad === 0 ? "  no other-brand or TASCAM references found" : "");

const priceHits = new Map();
for (const f of files) {
  const txt = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const m of txt.match(PRICE_RE) ?? []) {
    const norm = m.replace(/\s+/g, " ").trim();
    if (!ALLOWED_PRICES.some((a) => norm === a)) {
      if (!priceHits.has(norm)) priceHits.set(norm, []);
      priceHits.get(norm).push(f);
    }
  }
}
console.log("");
if (priceHits.size) {
  console.log("  ! price-shaped strings that are not one of the two supplied MOPs:");
  for (const [k, v] of priceHits) console.log(`      ${k}  in ${[...new Set(v)].join(", ")}`);
  bad++;
} else {
  console.log("  every price string is one of the two supplied MOPs — nothing fabricated");
}

// the two MOPs must never be blended into a single range
const blended = files.filter((f) =>
  /Rs\.?\s*81,900\s*(?:-|–|—|to)\s*Rs\.?\s*1,28,000/i.test(fs.readFileSync(path.join(ROOT, f), "utf8")));
console.log(blended.length ? `  ! prices blended into a range in ${blended.join(", ")}`
                           : "  prices stated distinctly per product, never blended");

process.exit(bad ? 1 : 0);
