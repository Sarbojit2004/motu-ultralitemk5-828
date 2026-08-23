import React from "react";
import { Audio, staticFile } from "remotion";
import { REELS } from "./schedule";

/** Two-layer architecture plus a silent VO slot, per reel. Both layers are
 *  pre-rendered to the exact 178.000 s runtime by tools/make-audio.mjs from the
 *  same schedule, so the embedded mix and the two standalone audio deliverables
 *  are identical in timing by construction. */
export const Mix: React.FC<{ reel: 1 | 2; music?: boolean; sfx?: boolean; vo?: boolean }> = ({
  reel, music = true, sfx = true, vo = true,
}) => (
  <>
    {music ? <Audio src={staticFile(`audio/music-bed-reel${reel}.mp3`)} volume={1} /> : null}
    {sfx ? <Audio src={staticFile(`audio/sfx-timeline-reel${reel}.mp3`)} volume={1} /> : null}
    {vo ? <Audio src={staticFile(`vo/${REELS[reel].voSlot}`)} volume={1} /> : null}
  </>
);

