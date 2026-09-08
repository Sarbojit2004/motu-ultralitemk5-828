import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {ColourProbe} from './dev/ColourProbe';
import {DURATION_FRAMES, FPS, WIDTH, HEIGHT} from './lib/grid';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MotuCameraReel"
      component={Reel}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {/* Development-only: verifies that the Plate component leaves product
        photography untouched. Not part of the deliverable. */}
    <Composition
      id="ColourProbe"
      component={ColourProbe}
      durationInFrames={1}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{slug: 'e828_21j'}}
    />
  </>
);
