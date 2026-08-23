import r1 from "./schedule-reel1.json";
import r2 from "./schedule-reel2.json";

export type SfxCue = [cue: string, atFrame: number, gain: number, rate?: number];

export type Beat = {
  id: string; sec: number; kind: string;
  chapter: number; chapterId: string; chapterTitle: string;
  from: number; durationInFrames: number; fromSec: number;
  img?: number[];
  clip?: number; trim?: number; rate?: number;
  grade?: "none" | "cool" | "warm" | "desat";
  bedClip?: number; bedTrim?: number; bedRate?: number;
  eyebrow?: string; headline?: string; sub?: string; body?: string; editorial?: string;
  leftLabel?: string; rightLabel?: string;
  left?: [string, string]; right?: [string, string];
  metric?: string; context?: string; narrative?: string;
  callouts?: [string, number][];
  cols?: number; ins?: number; outs?: number;
  fx?: number; fy?: number; zoom?: number;
  accent?: string;
  brand?: "corner" | "lower" | "beat";
  motu?: boolean; socials?: boolean;
  sfx?: SfxCue[];
};

export type ReelSchedule = {
  id: string; reel: 1 | 2; title: string; product: string; outName: string;
  fps: number; width: number; height: number;
  durationInSeconds: number; durationInFrames: number;
  voSlot: string; musicSuffix: string;
  beats: Beat[];
  music: { chapter: number; track: string; fromSec: number; toSec: number;
           srcOffsetSec: number; stems: Record<string, number> }[];
};

export const REEL1 = r1 as unknown as ReelSchedule;
export const REEL2 = r2 as unknown as ReelSchedule;
export const REELS: Record<1 | 2, ReelSchedule> = { 1: REEL1, 2: REEL2 };
