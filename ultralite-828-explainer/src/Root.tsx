import React from "react";
import { Composition } from "remotion";
import { FORMATS } from "./theme.ts";
import { VIDEO } from "./films.ts";
import { Film } from "./Film.tsx";
import { Thumbnail } from "./Thumbnail.tsx";

// The duration is taken from the assembled film, which takes it from the
// script. There is no frame count typed in this file.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Explainer"
      component={Film}
      durationInFrames={VIDEO.durationInFrames}
      fps={FORMATS.video.fps}
      width={FORMATS.video.width}
      height={FORMATS.video.height}
    />
    <Composition
      id="ThumbnailVideo"
      component={Thumbnail}
      durationInFrames={1}
      fps={30}
      width={FORMATS.video.width}
      height={FORMATS.video.height}
    />
  </>
);
