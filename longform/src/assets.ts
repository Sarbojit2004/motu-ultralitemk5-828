// Asset access. Two libraries, governed by DIFFERENT rules, kept strictly
// separate here so a validation pass can never confuse one for the other:
//
//   REAL PHOTOGRAPHY (69 images) — compulsory coverage, and the absolute rule:
//   never permanently cropped, clipped or trimmed. Every placement must show
//   the complete unit fully and legibly at some point in its screen time.
//
//   REPRESENTATIONAL FOOTAGE (9 Gemini clips) — discretionary. Explicitly
//   exempt from the above: free to speed-ramp, trim, crop, resize, mute, loop
//   or grade as a beat requires. Never checked against real-image completeness.
import { staticFile } from "remotion";
import manifest from "./manifest.json";

export type Ground = "bare" | "well" | "stage" | "card";
export type Role =
  | "lifestyle" | "screen" | "macro" | "render" | "diagram"
  | "elevation" | "hero" | "art" | "badge" | "context";

export type ImageMeta = {
  idx: number;
  file: string;
  slug: string;
  w: number;
  h: number;
  ar: number;
  product: "ul" | "e8" | "sh";
  role: Role;
  ground: Ground;
  headline: string;
  reel: number;
  lfChapter: string;
};

export type ClipMeta = {
  idx: number;
  file: string;
  slug: string;
  title: string;
  category: "A" | "B" | "C" | "D";
  orient: "portrait" | "landscape";
  durationSec: number;
  fps: number;
};

export const IMAGES = manifest.images as ImageMeta[];
export const CLIPS = manifest.clips as ClipMeta[];

const IMG_BY_IDX = new Map(IMAGES.map((m) => [m.idx, m]));
const CLIP_BY_IDX = new Map(CLIPS.map((c) => [c.idx, c]));

/** Metadata for real image `idx` (1-69). Throws rather than rendering nothing. */
export function meta(idx: number): ImageMeta {
  const m = IMG_BY_IDX.get(idx);
  if (!m) throw new Error(`no real image #${idx} in the manifest`);
  return m;
}
export function img(idx: number): string {
  return staticFile(`img/${meta(idx).slug}`);
}

/** Metadata for representational clip `idx`. */
export function clipMeta(idx: number): ClipMeta {
  const c = CLIP_BY_IDX.get(idx);
  if (!c) throw new Error(`no representational clip #${idx} in the manifest`);
  return c;
}
export function clip(idx: number): string {
  return staticFile(`clip/${clipMeta(idx).slug}`);
}

export const LOGO = {
  shivansh: () => staticFile("logo/shivansh.png"),
  motu: () => staticFile("logo/motu.png"),
};

export const AUDIO = {
  music: () => staticFile("audio/music-bed.mp3"),
  sfx: () => staticFile("audio/sfx-timeline.mp3"),
  vo: () => staticFile("vo/voiceover-longform.mp3"),
};
