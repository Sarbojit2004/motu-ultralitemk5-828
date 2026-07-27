import React from 'react';
import {Composition} from 'remotion';
import {Reel, REEL_FRAMES} from './Reel';
import {CANVAS, FPS} from './lib/theme';
import {LFReel, LF_REEL_FRAMES} from './LFReel';
import {LF_CANVAS, LF_FPS} from './lib/lf-theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={REEL_FRAMES}
      fps={FPS}
      width={CANVAS.w}
      height={CANVAS.h}
    />
    <Composition
      id="LongForm"
      component={LFReel}
      durationInFrames={LF_REEL_FRAMES}
      fps={LF_FPS}
      width={LF_CANVAS.w}
      height={LF_CANVAS.h}
    />
  </>
);
