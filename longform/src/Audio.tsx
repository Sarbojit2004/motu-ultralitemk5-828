import React from "react";
import { Audio } from "remotion";
import { staticFile } from "remotion";
import { SCHEDULE } from "./schedule";

/**
 * The two-layer architecture (Section 10), plus a silent voiceover slot.
 *
 * Both layers are pre-rendered to the exact runtime by tools/make-audio.mjs
 * from this same schedule, so the embedded mix and the two standalone audio
 * deliverables are bit-identical in timing — the SFX file can be re-levelled
 * later without ever losing sync with the picture.
 */
export const Mix: React.FC<{ music?: boolean; sfx?: boolean; vo?: boolean }> = ({
  music = true,
  sfx = true,
  vo = true,
}) => (
  <>
    {music ? <Audio src={staticFile("audio/music-bed.mp3")} volume={1} /> : null}
    {sfx ? <Audio src={staticFile("audio/sfx-timeline.mp3")} volume={1} /> : null}
    {vo ? <Audio src={staticFile(`vo/${SCHEDULE.voSlot}`)} volume={1} /> : null}
  </>
);

