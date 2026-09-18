import React from "react";
import { Composition } from "remotion";
import { REEL } from "./theme.ts";
import { REEL_TL } from "./script.ts";
import { REEL_PINS } from "./shots.ts";
import { Film } from "./Film.tsx";
import { Thumbnail } from "./Thumbnail.tsx";
import { FONT_FACE_CSS } from "./fonts.ts";

const style = document.createElement("style");
style.textContent = FONT_FACE_CSS;
document.head.appendChild(style);

/** The end screen takes the frame 0.6 s after the last word. */
export const REEL_OUTRO_AT = +(REEL_TL.total + 0.6).toFixed(2);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Film}
      durationInFrames={REEL.durationInFrames}
      fps={REEL.fps}
      width={REEL.width}
      height={REEL.height}
      defaultProps={{ canvas: REEL, segments: REEL_TL.segments, pins: REEL_PINS, outroAt: REEL_OUTRO_AT, bed: "music-bed-reel.mp3", vo: "vo-reel.wav", title: "MOTU UltraLite-mk5 + 828 — 90 s reel" }}
    />
    <Composition id="ReelThumb" component={Thumbnail} durationInFrames={1} fps={REEL.fps} width={REEL.width} height={REEL.height} defaultProps={{ canvas: REEL }} />
  </>
);
