#!/usr/bin/env node
// Copies every product image out of the repository root into public/images/,
// downscaled for a 4K render, and writes src/assets.ts. Subject classification
// is DECLARED from looking at every image (contact sheets), because the alpha
// channel says how an image can be staged and nothing about what is in it.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const ROOT = "..";
const OUT = "public/images";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
mkdirSync(path.join(OUT, "bg"), { recursive: true });

const REASSIGN = {
  "motu-828-11.jpg": "shared",  // modular synthesizer wall
  "motu-828-26.jpg": "shared",  // synthesizer keyboard
  "motu-828-19.jpg": "shared",  // ESS badge
  "motu-828-9.png": "shared",   // CueMix 5 badge
  "motu-828-29.jpg": "shared",  // MOTU software suite collage
  "motu-828-10.png": "shared",  // MOTU Instruments collage
  "motu-828-23.jpg": "shared",  // Loopmasters art
  "motu-828-24.jpg": "shared",  // Lucid Samples art
  "motu-828-8.jpg": "shared",   // Big Fish Audio art
  "motu-828-11.png": "shared",  // DAW session
  "motu-828-12.png": "shared",  // DAW full session
};
const SUBJECT = {
  ui: [
    "motu-ultralite-mk5-1.png", "motu-ultralite-mk5-13.jpg", "motu-ultralite-mk5-6.jpg", "motu-ultralite-mk5-7.jpg",
    "motu-ultralite-mk5-8.jpg", "motu-ultralite-mk5-9.jpg",
    "motu-828-11.png", "motu-828-12.jpg", "motu-828-12.png", "motu-828-13.jpg", "motu-828-14.jpg", "motu-828-15.jpg",
    "motu-828-15.png", "motu-828-16.jpg", "motu-828-17.jpg", "motu-828-2.jpg", "motu-828-27.jpg",
  ],
  diagram: ["motu-ultralite-mk5-10.jpg", "motu-ultralite-mk5-14.jpg", "motu-ultralite-mk5-4.png", "motu-ultralite-mk5-5.png", "motu-828-14.png"],
  mark: ["motu-828-19.jpg", "motu-828-31.jpg", "motu-828-9.png"],
  bundle: ["motu-828-10.png", "motu-828-23.jpg", "motu-828-24.jpg", "motu-828-29.jpg", "motu-828-8.jpg"],
  context: [
    "motu-ultralite-mk5-3.jpg", "motu-ultralite-mk5-4.jpg", "motu-ultralite-mk5-5.jpg", "motu-ultralite-mk5-12.jpg",
    "motu-828-11.jpg", "motu-828-18.jpg", "motu-828-21.jpg", "motu-828-25.jpg", "motu-828-26.jpg", "motu-828-28.jpg", "motu-828-30.jpg",
  ],
  detail: [
    "motu-ultralite-mk5-2.png",
    "motu-828-1.jpg", "motu-828-10.jpg", "motu-828-20.jpg", "motu-828-22.jpg", "motu-828-3.jpg", "motu-828-4.jpg",
    "motu-828-5.jpg", "motu-828-7.jpg", "motu-828-9.jpg",
  ],
};
const SUBJECT_OF = new Map();
for (const [k, list] of Object.entries(SUBJECT)) for (const f of list) SUBJECT_OF.set(f, k);

const productOf = (f) => (/ultralite/i.test(f) ? "pmk5" : /828/.test(f) ? "p828" : null);
const slugify = (f) => f.toLowerCase().replace(/^motu /, "motu-").replace(/[()]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const files = readdirSync(ROOT).filter((f) => /^MOTU (UltraLite-mk5|828) /i.test(f) && /\.(jpg|png)$/i.test(f)).sort();
const groups = new Map();
for (const f of files) {
  const h = createHash("md5").update(readFileSync(path.join(ROOT, f))).digest("hex");
  if (!groups.has(h)) groups.set(h, []);
  groups.get(h).push(f);
}
const meta = (p) => {
  let s = "";
  try { execFileSync(FFMPEG, ["-hide_banner", "-i", p], { stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { s = (e.stderr || "").toString(); }
  const m = s.match(/Stream #0:0.*?: Video: (\w+).*?, (\w+)(?:\([^)]*\))?, (\d+)x(\d+)/);
  return m ? { codec: m[1], pix: m[2], w: +m[3], h: +m[4] } : null;
};
const ALPHA_PIX = /rgba|argb|bgra|abgr|ya|pal8/i;
const assets = [];
for (const [, fs] of groups) {
  const canonical = fs[0];
  const src = path.join(ROOT, canonical);
  const info = meta(src);
  if (!info) { console.warn("skip (unreadable):", canonical); continue; }
  const slug = slugify(canonical).replace(/\.(jpg|png)$/, (m) => "-" + m.slice(1));
  const ext = /\.png$/i.test(canonical) ? "png" : "jpg";
  const product = REASSIGN[slugify(canonical)] ?? productOf(canonical);
  const long = Math.max(info.w, info.h);
  const scale = long > 3000 ? `scale=${info.w >= info.h ? "3000:-2" : "-2:3000"}` : "scale=iw:ih";
  const dst = path.join(OUT, `${slug}.${ext}`);
  const args = ["-v", "error", "-y", "-i", src, "-vf", `${scale}:flags=lanczos`];
  if (ext === "png") args.push("-pred", "mixed"); else args.push("-q:v", "2");
  args.push(dst);
  if (!existsSync(dst)) execFileSync(FFMPEG, args);
  const bg = path.join(OUT, "bg", `${slug}.jpg`);
  if (!existsSync(bg)) execFileSync("python3", ["scripts/plate.py", src, bg, "0.55", "0.28"]);
  const post = meta(dst);
  const ar = post.w / post.h;
  const hasAlpha = ext === "png" && ALPHA_PIX.test(post.pix);
  assets.push({
    slug, file: `${slug}.${ext}`, bg: `bg/${slug}.jpg`, product,
    w: post.w, h: post.h, ar: +ar.toFixed(3),
    kind: hasAlpha ? (ar > 3.4 ? "strip" : "cutout") : ar > 3.4 ? "panel" : "photo",
    subject: SUBJECT_OF.get(slugify(canonical)) ?? "hardware",
    alpha: hasAlpha,
    covers: fs,
  });
}
assets.sort((a, b) => (a.product ?? "").localeCompare(b.product ?? "") || a.slug.localeCompare(b.slug));
const ts = `// AUTO-GENERATED by scripts/prep-assets.mjs — do not edit by hand.
// ${assets.length} distinct images from ${files.length} files in the repository root.
// kind:    cutout (transparent) | strip (transparent ultra-wide) | panel (opaque ultra-wide) | photo
// subject: hardware | detail | context | ui | diagram | mark | bundle

export type AssetKind = "cutout" | "strip" | "panel" | "photo";
export type AssetSubject = "hardware" | "detail" | "context" | "ui" | "diagram" | "mark" | "bundle";
export type ProductKey = "pmk5" | "p828" | "shared";

export type Asset = {
  slug: string; file: string; bg: string; product: ProductKey;
  w: number; h: number; ar: number; kind: AssetKind; subject: AssetSubject; alpha: boolean; covers: string[];
};

export const ASSETS: Asset[] = ${JSON.stringify(assets, null, 1)};

export const REPO_FILE_COUNT = ${files.length};
export const EXCLUDED_COUNT = 0;
`;
writeFileSync("src/assets.ts", ts);
const by = {};
for (const a of assets) (by[a.product] ??= []).push(a);
console.log(`${files.length} filenames -> ${assets.length} distinct images`);
for (const [k, v] of Object.entries(by)) console.log(`  ${k.padEnd(7)} ${String(v.length).padStart(3)}  ${JSON.stringify(v.reduce((a, x) => ((a[x.subject] = (a[x.subject] || 0) + 1), a), {}))}`);
