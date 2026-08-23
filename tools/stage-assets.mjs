// Stage every source asset into both project public/ folders under stable,
// index-based names, and emit the shared manifest that drives all three builds.
//
// Provenance: the 69 real images and 9 unique representational clips are the
// RAW files at this repository's root. The prior build's own curated/renamed
// copies under ./public/img are deliberately NOT used.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));
const TARGETS = process.argv.slice(2);
if (!TARGETS.length) TARGETS.push("longform", "reels");

const pad = (n) => String(n).padStart(2, "0");

for (const proj of TARGETS) {
  const pub = path.join(ROOT, proj, "public");
  for (const d of ["img", "clip", "logo", "audio/sfx", "vo"]) {
    fs.mkdirSync(path.join(pub, d), { recursive: true });
  }

  let nImg = 0;
  for (const m of MANIFEST.images) {
    const src = path.join(ROOT, m.file);
    if (!fs.existsSync(src)) throw new Error(`missing source image: ${m.file}`);
    fs.copyFileSync(src, path.join(pub, "img", m.slug));
    nImg++;
  }

  let nClip = 0;
  for (const c of MANIFEST.clips) {
    const src = path.join(ROOT, c.file);
    if (!fs.existsSync(src)) throw new Error(`missing source clip: ${c.file}`);
    fs.copyFileSync(src, path.join(pub, "clip", c.slug));
    nClip++;
  }

  for (const [slug, file] of Object.entries(MANIFEST.logos)) {
    const src = path.join(ROOT, file);
    if (!fs.existsSync(src)) throw new Error(`missing logo: ${file}`);
    fs.copyFileSync(src, path.join(pub, "logo", slug));
  }

  console.log(`${proj}: ${nImg} images, ${nClip} clips, ${Object.keys(MANIFEST.logos).length} logos -> ${path.relative(ROOT, pub)}`);
}
