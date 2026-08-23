// Right-sizes the STAGED assets so a self-contained project zip stays
// comfortably inside GitHub's 100 MB per-file limit (git-lfs is unavailable in
// this environment), without touching the originals at the repository root.
//
// Nothing here is a creative edit: no image is cropped, resized or re-framed.
// Real photographs are re-encoded at high quality at their native resolution,
// and only where the source carries no genuine transparency.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const targets = process.argv.slice(2);
if (!targets.length) targets.push("longform", "reels");

for (const proj of targets) {
  const dir = path.join(ROOT, proj, "public", "img");
  if (!fs.existsSync(dir)) continue;
  let before = 0, after = 0, kept = 0, conv = 0;
  const rename = {};
  for (const f of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, f);
    before += fs.statSync(p).size;
    // Does this file genuinely use transparency? RGBA mode alone does not mean
    // it does — most of these are opaque photographs saved as PNG.
    const probe = execFileSync("python3", ["-c", `
import sys
from PIL import Image
import numpy as np
im = Image.open(sys.argv[1])
if im.mode in ("RGBA","LA") or (im.mode=="P" and "transparency" in im.info):
    a = np.asarray(im.convert("RGBA"))[...,3]
    print("1" if (a < 250).mean() > 0.08 else "0")
else:
    print("0")
`, p]).toString().trim();

    // Large transparency is load-bearing: several product renders ship on a
    // transparent ground, which is exactly what lets them sit ON the light page
    // instead of inside a rectangle. Those stay PNG. Small transparency is
    // incidental (anti-aliased outlines, a thin border), so those composite
    // onto the page colour and re-encode — visually identical on a near-white
    // ground, for a fraction of the bytes.
    if (probe === "1") {
      kept++; after += fs.statSync(p).size; rename[f] = f;
      continue;
    }
    const out = p.replace(/\.(png|jpg|jpeg)$/i, ".jpg");
    execFileSync("python3", ["-c", `
import sys
from PIL import Image
src = Image.open(sys.argv[1])
if src.mode in ("RGBA", "LA") or (src.mode == "P" and "transparency" in src.info):
    src = src.convert("RGBA")
    bg = Image.new("RGBA", src.size, (246, 248, 250, 255))   # COLORS.paper
    src = Image.alpha_composite(bg, src)
im = src.convert("RGB")
im.save(sys.argv[2], "JPEG", quality=92, optimize=True, progressive=True, subsampling=0)
`, p, out + ".tmp"]);
    fs.rmSync(p);
    fs.renameSync(out + ".tmp", out);
    after += fs.statSync(out).size;
    rename[f] = path.basename(out);
    conv++;
  }
  // keep the manifest in step with the files on disk
  for (const mf of [path.join(ROOT, proj, "src", "manifest.json"), path.join(__dirname, "manifest.json")]) {
    const m = JSON.parse(fs.readFileSync(mf, "utf8"));
    for (const im of m.images) if (rename[im.slug]) im.slug = rename[im.slug];
    fs.writeFileSync(mf, JSON.stringify(m, null, 1));
  }
  console.log(`${proj}: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB ` +
              `(${conv} re-encoded at native size, ${kept} kept as PNG for real transparency)`);
}
