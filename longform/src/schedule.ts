import raw from "./schedule.json";

export type SfxCue = [cue: string, atFrame: number, gain: number, rate?: number];

export type Beat = {
  id: string;
  sec: number;
  kind: string;
  chapter: number;
  chapterId: string;
  chapterTitle: string;
  from: number;
  durationInFrames: number;
  fromSec: number;

  /** Real-image indices. Compulsory coverage; never cropped. */
  img?: number[];
  /** Foreground representational clip. Editorially free (Section 0.3). */
  clip?: number;
  trim?: number;
  rate?: number;
  grade?: "none" | "cool" | "warm" | "desat";
  /** Background representational clip, run faint under a graphic scene. */
  bedClip?: number;
  bedTrim?: number;
  bedRate?: number;

  eyebrow?: string;
  headline?: string;
  sub?: string;
  body?: string;
  editorial?: string;
  leftLabel?: string;
  rightLabel?: string;
  left?: [string, string];
  right?: [string, string];
  metric?: string;
  context?: string;
  narrative?: string;
  callouts?: [string, number][];
  cols?: number;
  ins?: number;
  outs?: number;
  fx?: number;
  fy?: number;
  zoom?: number;
  accent?: string;
  brand?: "corner" | "lower" | "beat";
  motu?: boolean;
  socials?: boolean;
  sfx?: SfxCue[];
};

export type Chapter = {
  n: number;
  id: string;
  title: string;
  sec: number;
  track: string;
};

export const SCHEDULE = raw as unknown as {
  id: string;
  fps: number;
  width: number;
  height: number;
  durationInSeconds: number;
  durationInFrames: number;
  voSlot: string;
  chapters: Chapter[];
  beats: Beat[];
  music: {
    chapter: number;
    track: string;
    fromSec: number;
    toSec: number;
    stems: Record<string, number>;
    srcOffsetSec: number;
  }[];
};

export const BEATS: Beat[] = SCHEDULE.beats;
export const CHAPTERS: Chapter[] = SCHEDULE.chapters;
