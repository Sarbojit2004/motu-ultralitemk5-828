// De-watermark the representational clips, once, deterministically.
//
// All nine Gemini clips carry a generative sparkle glyph. Measured on a
// magnified normalized grid:
//   landscape 1280x720 : x [0.885, 0.935]  y [0.78, 0.87]
//   portrait  720x1280 : x [0.795, 0.855]  y [0.875, 0.925]
//
// Section 0.3 makes this layer editorially free — free to crop, trim, speed-ramp
// and re-frame — so the glyph is removed by cropping rather than by painting
// over it. Landscape loses its right 13%, portrait its bottom 14%: in both
// cases the subject is centre-framed and survives intact. This is a one-time
// preprocessing step so the render itself stays simple and the result is
// verifiable by inspection.
//
// This treatment applies ONLY to representational footage. No real product
// photograph is ever cropped anywhere in this project.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FFMPEG = process.env.FFMPEG_PATH ?? "/usr/bin/ffmpeg";
const MANIFEST = JSON.parse(fs.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));

const KEEP_W_LANDSCAPE = 0.87; // drops x > 0.87
const KEEP_H_PORTRAIT = 0.86;  // drops y > 0.86

const targets = process.argv.slice(2);
if (!targets.length) targets.push("longform", "reels");

for (const c of MANIFEST.clips) {
  const src = path.join(ROOT, c.file);
  if (!fs.existsSync(src)) throw new Error(`missing clip: ${c.file}`);

  const vf =
    c.orient === "portrait"
      ? `crop=iw:floor(ih*${KEEP_H_PORTRAIT}/2)*2:0:0`
      : `crop=floor(iw*${KEEP_W_LANDSCAPE}/2)*2:ih:0:0`;

  const first = path.join(ROOT, targets[0], "public", "clip", c.slug);
  execFileSync(FFMPEG, [
    "-v", "error", "-y", "-i", src,
    "-vf", vf,
    // CRF 22 rather than 18: this layer is B-roll that plays behind a page
    // scrim, graded and often speed-ramped, so the extra bitrate buys nothing
    // visible and the project zip has a hard 100 MB ceiling to respect.
    "-c:v", "libx264", "-crf", "22", "-preset", "slow", "-pix_fmt", "yuv420p",
    "-an", // the two-layer audio architecture carries all sound
    first,
  ], { stdio: ["ignore", "ignore", "pipe"] });

  for (const t of targets.slice(1)) {
    fs.copyFileSync(first, path.join(ROOT, t, "public", "clip", c.slug));
  }

  const probe = execFileSync("/usr/bin/ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height,nb_frames,r_frame_rate",
    "-of", "csv=p=0", first,
  ]).toString().trim();
  console.log(`  ${c.slug}  ${c.orient.padEnd(9)} ${c.title.padEnd(24)} -> ${probe}`);
}
console.log(`de-watermarked ${MANIFEST.clips.length} clips for: ${targets.join(", ")}`);
