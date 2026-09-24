// ─────────────────────────────────────────────────────────────────────────────
// THE DELIVERABLE, assembled from the script and the shot plan.
//
// Nothing here is a number someone chose. The timeline comes from how long the
// words take to say; the shots come from which caption they are pinned to; the
// composition's length is the timeline plus the end screen, rounded to a frame.
// Editing a caption re-times the film and moves the picture with it.
//
// One film, unlike the M-Series project this system came from: the 90-second
// vertical reel for these two products is its own project next door.
// ─────────────────────────────────────────────────────────────────────────────

import { FORMATS, type FormatId } from "./theme.ts";
import { VIDEO_SEGMENTS, buildTimeline, type TimedSegment } from "./script.ts";
import { VIDEO_SHOTS, placeShots, type ResolvedShot } from "./shots.ts";

export type Film = {
  id: FormatId;
  segments: TimedSegment[];
  shots: ResolvedShot[];
  /** When the narration ends and the end screen begins. */
  speechEnd: number;
  outroSeconds: number;
  total: number;
  durationInFrames: number;
  words: number;
  /** The mastered stems, both already at unity — see scripts/gen_audio.py. */
  bed: string;
  transitions: string;
  vo: string;
};

const assemble = (id: FormatId): Film => {
  const fmt = FORMATS[id];
  const tl = buildTimeline(VIDEO_SEGMENTS);
  // Every clip plays COMPLETE from its first frame in the long film, so no
  // shot asks for a later start the way the vertical reel's do.
  const shots = placeShots(tl.segments, VIDEO_SHOTS, false);
  const total = tl.total + fmt.outroSeconds;
  return {
    id,
    segments: tl.segments,
    shots,
    speechEnd: tl.total,
    outroSeconds: fmt.outroSeconds,
    total,
    durationInFrames: Math.round(total * fmt.fps),
    words: tl.words,
    bed: `audio/music-bed-${id}.mp3`,
    transitions: `audio/transitions-${id}.wav`,
    vo: `vo/vo-${id}.wav`,
  };
};

export const VIDEO = assemble("video");

export const filmFor = (_width: number, _height: number): Film => VIDEO;
