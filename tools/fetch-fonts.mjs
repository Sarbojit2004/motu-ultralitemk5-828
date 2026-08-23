// Download the exact woff2 files this build needs and self-host them under each
// project's public/fonts. Self-hosting (rather than linking gstatic at render
// time) keeps the render hermetic — no network dependency once setup has run.
//
// Families follow the AVB reference type system: ARCHIVO (technical grotesque)
// carries headline / spec / micro; FRAUNCES (editorial serif) is held back for
// the Problem and Transformation beats only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
// Both families ship as VARIABLE fonts: every per-weight URL resolves to the
// same file covering the whole 100-900 axis (verified by hash), so one file
// per family is all that is needed, declared as `font-weight: 100 900`.
const WANT = { Archivo: ["400"], Fraunces: ["400"] };
const SUBSET = "latin";

const readMap = (fam) => {
  const src = fs.readFileSync(
    path.join(ROOT, "longform/node_modules/@remotion/google-fonts/dist/esm", `${fam}.mjs`), "utf8");
  const norm = src.indexOf("normal: {");
  if (norm < 0) throw new Error(`no normal block in ${fam}`);
  const tail = src.slice(norm);
  const out = {};
  // "<weight>": { ... latin: "<url>" }
  const re = /"(\d{3})":\s*\{([\s\S]*?)\}/g;
  let m;
  while ((m = re.exec(tail))) {
    const [, weight, body] = m;
    if (out[weight]) continue;
    const u = body.match(new RegExp(`${SUBSET}:\\s*"(https:[^"]+\\.woff2)"`));
    if (u) out[weight] = u[1];
  }
  return out;
};

const targets = process.argv.slice(2);
if (!targets.length) targets.push("longform", "reels");

for (const [fam, weights] of Object.entries(WANT)) {
  const map = readMap(fam);
  for (const w of weights) {
    const url = map[w];
    if (!url) throw new Error(`${fam} ${w} (${SUBSET}) not found`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${fam} ${w}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 2000) throw new Error(`${fam} ${w}: suspiciously small (${buf.length}B)`);
    for (const t of targets) {
      const dir = path.join(ROOT, t, "public", "fonts");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${fam.toLowerCase()}-var.woff2`), buf);
    }
    console.log(`  ${fam} ${w}  ${(buf.length / 1024).toFixed(1)} KB`);
  }
}
console.log("fonts staged for:", targets.join(", "));
