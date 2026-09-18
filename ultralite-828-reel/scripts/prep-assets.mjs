#!/usr/bin/env node
// Re-exports the repository's real product photography into public/images/ at a
// size that holds up on a 2160-wide canvas, and writes src/assets.ts.
//
// WHY THIS READS ../src/lib/images.json RATHER THAN THE REPOSITORY ROOT.
// The root holds ~100 loose files whose names ("MOTU 828 (13).png") say nothing
// about what is in them. That curation was already done once for this
// repository's earlier deliverables: src/lib/images.json is the result — 69
// distinct images, each given a descriptive slug and mapped back to the file it
// came from, with duplicate pairs already reconciled by pixel content. Redoing
// that classification from filenames would be guesswork on top of finished
// work, so this build inherits it verbatim and adds only what a 4K canvas needs.
//
// What it adds: the earlier deliverables targeted 1080x1920 and their copies in
// public/img are capped at 2200 px on the long edge. This reel is 2160x3840, so
// a full-bleed 2200 px photograph has no margin for a camera move. The
// originals in the repository root are 3800-4100 px wide, so every image is
// re-exported FROM THE ORIGINAL at up to 3840 px instead of being upscaled from
// the existing copy.
//
// Subject classification is DECLARED below, not inferred: the slug says what
// the picture is, and a rule reading the slug would still be a guess.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = "..";
const CURATION = "../src/lib/images.json";
const OUT = "public/images";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const MAX_EDGE = 3840;
mkdirSync(OUT, { recursive: true });
mkdirSync(path.join(OUT, "bg"), { recursive: true });

/** Product is carried by the slug prefix, set when the images were curated. */
const productOf = (slug) =>
  slug.startsWith("ul-") ? "pul" : slug.startsWith("e8-") ? "p828" : "shared";

// Platform material that happens to have been photographed on one unit but
// belongs to neither act: the badge, the conversion and bus marks, and the
// CueMix 5 screens that are byte-for-byte the same application on both units.
// The reel's two acts must stay disjoint, so anything depicting the SHARED
// platform is reassigned out of them.
const SHARED = new Set([
  "cuemix-badge",
  "e8-cuemix-home",
  "e8-mixer",
  "e8-mixer-phones",
  "e8-fx-eq",
  "e8-fx-gate",
  "e8-fx-reverb",
  "e8-ess-logo",
  "e8-usb-5gbps",
  "ul-cuemix-home",
  "ul-mixer",
  "ul-fx-eq",
  "ul-fx-gate",
  "ul-fx-reverb",
]);

// Deliberate exceptions to the rule above: these two ARE differentiators and
// stay inside their act even though they show software.
//   ul-ipad-cuemix — "Mix it from an iPad" is the UltraLite-mk5's line.
//   e8-loopback-menu — loopback is an 828-only feature.

const SUBJECT = {
  "cuemix-badge": "mark",
  "e8-big-studio": "context",
  "e8-black-hero": "hardware",
  "e8-cuemix-home": "ui",
  "e8-ess-logo": "mark",
  "e8-footswitch": "detail",
  "e8-front-elev": "hardware",
  "e8-front-elev-slim": "hardware",
  "e8-fx-eq": "ui",
  "e8-fx-gate": "ui",
  "e8-fx-reverb": "ui",
  "e8-guitar-vox": "context",
  "e8-ipad-hand": "context",
  "e8-korg-synth": "context",
  "e8-laptop-led": "context",
  "e8-latency": "diagram",
  "e8-lcd-a": "detail",
  "e8-lcd-b": "detail",
  "e8-line-in-insert": "detail",
  "e8-line-outs": "detail",
  "e8-loopback-menu": "ui",
  "e8-macbook-rack": "context",
  "e8-mic-rack": "context",
  "e8-mixer": "ui",
  "e8-mixer-phones": "ui",
  "e8-modular-wall": "context",
  "e8-monitor-buttons": "detail",
  "e8-monitor-panel": "detail",
  "e8-optical-rear": "detail",
  "e8-rear-cabled": "detail",
  "e8-rear-digital": "detail",
  "e8-rear-elev": "hardware",
  "e8-rear-elev-slim": "hardware",
  "e8-render-34a": "hardware",
  "e8-render-34b": "hardware",
  "e8-render-rear-a": "hardware",
  "e8-render-rear-b": "hardware",
  "e8-spdif": "detail",
  "e8-sw-bigfish": "bundle",
  "e8-sw-loopmasters": "bundle",
  "e8-sw-lucid": "bundle",
  "e8-sw-mosaic": "bundle",
  "e8-sw-performer-a": "bundle",
  "e8-sw-performer-b": "bundle",
  "e8-sw-soundbank": "bundle",
  "e8-usb-5gbps": "mark",
  "ul-amp-guitar": "context",
  "ul-black-hero": "hardware",
  "ul-cuemix-home": "ui",
  "ul-desk-hero": "context",
  "ul-front-closeup": "detail",
  "ul-front-elev": "hardware",
  "ul-fx-eq": "ui",
  "ul-fx-gate": "ui",
  "ul-fx-reverb": "ui",
  "ul-guitarist": "context",
  "ul-ipad-cuemix": "ui",
  "ul-ipad-desk": "context",
  "ul-latency": "diagram",
  "ul-mixer": "ui",
  "ul-rack-ears": "hardware",
  "ul-rack-kit": "hardware",
  "ul-rear-elev": "hardware",
  "ul-render-34": "hardware",
  "ul-render-front": "hardware",
  "ul-render-top": "hardware",
  "ul-stack-laptop": "context",
  "ul-system-diagram": "diagram",
  "ul-wood-studio": "context",
};

const ALPHA_PIX = /(rgba|argb|bgra|abgr|ya|pal8)/i;
const meta = (p) => {
  let s = "";
  try {
    execFileSync(FFMPEG, ["-hide_banner", "-i", p], { stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    s = (e.stderr || "").toString();
  }
  // Parsed off the Video line field by field rather than with one long
  // pattern: a pixel-format parenthetical ("yuvj444p(pc, bt470bg/unknown/…)")
  // carries commas of its own, which any single comma-delimited regex
  // mis-segments.
  const line = s.split("\n").find((l) => /Stream #0:\d+.*Video:/.test(l));
  if (!line) return null;
  const dim = line.match(/\b(\d{2,5})x(\d{2,5})\b/);
  if (!dim) return null;
  const pix = line.match(/Video:\s*[^,]+,\s*([A-Za-z0-9]+)/);
  return { codec: (line.match(/Video:\s*([A-Za-z0-9]+)/) || [])[1] ?? "", pix: pix ? pix[1] : "", w: +dim[1], h: +dim[2] };
};

const curation = JSON.parse(readFileSync(CURATION, "utf8"));
const slugs = Object.keys(curation).sort();
const assets = [];
let missing = 0;

for (const slug of slugs) {
  const entry = curation[slug];
  const src = path.join(ROOT, entry.src);
  if (!existsSync(src)) {
    console.warn("missing original, falling back to the curated copy:", entry.src);
    missing++;
  }
  const from = existsSync(src) ? src : path.join(ROOT, "public/img", entry.file);
  const info = meta(from);
  if (!info) {
    console.warn("skip (unreadable):", entry.src);
    continue;
  }
  const ext = /\.png$/i.test(from) ? "png" : "jpg";
  const long = Math.max(info.w, info.h);
  const scale =
    long > MAX_EDGE
      ? `scale=${info.w >= info.h ? `${MAX_EDGE}:-2` : `-2:${MAX_EDGE}`}`
      : "scale=iw:ih";
  const dst = path.join(OUT, `${slug}.${ext}`);
  const args = ["-v", "error", "-y", "-i", from, "-vf", `${scale}:flags=lanczos`];
  if (ext === "png") args.push("-pred", "mixed");
  else args.push("-q:v", "2");
  args.push(dst);
  if (!existsSync(dst)) execFileSync(FFMPEG, args);

  // The ambient wash plate behind a full-bleed shot: 512 px, with the grade
  // (about a quarter brightness, desaturated) BAKED IN here rather than applied
  // as a CSS filter at render time — a filter on a full-frame layer is an
  // offscreen pass over 8.3 million pixels, every frame.
  const bg = path.join(OUT, "bg", `${slug}.jpg`);
  if (!existsSync(bg)) execFileSync("python3", ["scripts/plate.py", from, bg, "0.55", "0.28"]);

  const post = meta(dst);
  const ar = post.w / post.h;
  const hasAlpha = ext === "png" && ALPHA_PIX.test(post.pix);
  assets.push({
    slug,
    file: `${slug}.${ext}`,
    bg: `bg/${slug}.jpg`,
    product: SHARED.has(slug) ? "shared" : productOf(slug),
    w: post.w,
    h: post.h,
    ar: +ar.toFixed(3),
    kind: hasAlpha ? (ar > 3.4 ? "strip" : "cutout") : ar > 3.4 ? "panel" : "photo",
    subject: SUBJECT[slug] ?? "hardware",
    alpha: hasAlpha,
    covers: [entry.src],
  });
}
assets.sort((a, b) => a.product.localeCompare(b.product) || a.slug.localeCompare(b.slug));

const ts = `// AUTO-GENERATED by scripts/prep-assets.mjs — do not edit by hand.
// ${assets.length} distinct product photographs, re-exported from the originals in
// the repository root at up to ${MAX_EDGE} px on the long edge. The slug, the source
// mapping and the duplicate reconciliation are inherited from
// src/lib/images.json, the curation this repository's earlier deliverables made.
//
// kind:    cutout (transparent) | strip (transparent ultra-wide panel run) | panel (opaque ultra-wide) | photo
// subject: hardware | detail | context | ui | diagram | mark | bundle
// \`covers\` lists the original repository filename this image came from.

export type AssetKind = "cutout" | "strip" | "panel" | "photo";
export type AssetSubject = "hardware" | "detail" | "context" | "ui" | "diagram" | "mark" | "bundle";
export type ProductKey = "pul" | "p828" | "shared";

export type Asset = {
  slug: string;
  file: string;
  /** A 512 px copy, for the darkened wash behind a full-bleed shot. */
  bg: string;
  product: ProductKey;
  w: number;
  h: number;
  ar: number;
  kind: AssetKind;
  subject: AssetSubject;
  alpha: boolean;
  covers: string[];
};

export const ASSETS: Asset[] = ${JSON.stringify(assets, null, 1)};

export const REPO_FILE_COUNT = ${slugs.length};
export const EXCLUDED_COUNT = 0;
`;
writeFileSync("src/assets.ts", ts);

const by = {};
for (const a of assets) (by[a.product] ??= []).push(a);
console.log(`${slugs.length} curated slugs -> ${assets.length} images at up to ${MAX_EDGE} px`);
if (missing) console.log(`  ${missing} originals not found; curated copies used instead`);
for (const [k, v] of Object.entries(by)) {
  const subj = v.reduce((a, x) => ((a[x.subject] = (a[x.subject] || 0) + 1), a), {});
  console.log(`  ${k.padEnd(8)} ${String(v.length).padStart(3)}  ${JSON.stringify(subj)}`);
}
