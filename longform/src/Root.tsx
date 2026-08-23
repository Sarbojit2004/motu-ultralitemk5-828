import React from "react";
import { Composition, Still } from "remotion";
import { VIDEO } from "./theme";
import { SCHEDULE } from "./schedule";
import { LongForm } from "./LongForm";
import { Thumbnail } from "./Thumbnail";
import { loadFonts } from "./fonts";

const withFonts = async () => {
  await loadFonts();
  return {};
};

/**
 * The two standalone audio deliverables are NOT rendered here.
 * `tools/make-audio.mjs` writes them straight from the float mix — losslessly,
 * at the exact runtime, with every SFX cue at its final frame position — which
 * is both higher quality than a Remotion round-trip through the encoded MP3 and
 * free of the global CRF setting that the wav codec rejects. Run `npm run audio`.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="LongForm"
      component={LongForm}
      durationInFrames={SCHEDULE.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      calculateMetadata={withFonts}
    />
    <Still
      id="Thumbnail"
      component={Thumbnail}
      width={VIDEO.width}
      height={VIDEO.height}
      calculateMetadata={withFonts}
    />
  </>
);
