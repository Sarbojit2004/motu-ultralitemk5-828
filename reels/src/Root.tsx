import React from "react";
import { Composition, Still } from "remotion";
import { VIDEO } from "./theme";
import { REEL1, REEL2 } from "./schedule";
import { Reel1, Reel2 } from "./Reel";
import { Thumbnail1, Thumbnail2 } from "./Thumbnail";
import { loadFonts } from "./fonts";

const withFonts = async () => {
  await loadFonts();
  return {};
};

/**
 * The two standalone audio deliverables per reel are NOT rendered here.
 * `tools/make-audio.mjs` writes them straight from the float mix — losslessly,
 * at the exact runtime, with every SFX cue at its final frame position — which
 * is both higher quality than a Remotion round-trip through the encoded MP3 and
 * free of the global CRF setting that the wav codec rejects. Run `npm run audio`.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel1"
      component={Reel1}
      durationInFrames={REEL1.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      calculateMetadata={withFonts}
    />
    <Composition
      id="Reel2"
      component={Reel2}
      durationInFrames={REEL2.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      calculateMetadata={withFonts}
    />
    <Still
      id="Thumbnail1"
      component={Thumbnail1}
      width={VIDEO.width}
      height={VIDEO.height}
      calculateMetadata={withFonts}
    />
    <Still
      id="Thumbnail2"
      component={Thumbnail2}
      width={VIDEO.width}
      height={VIDEO.height}
      calculateMetadata={withFonts}
    />
  </>
);
