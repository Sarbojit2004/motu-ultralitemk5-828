import React from 'react';
import {Composition} from 'remotion';
import {Reel, REEL_FRAMES} from './Reel';
import {CANVAS, FPS} from './lib/theme';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={REEL_FRAMES}
    fps={FPS}
    width={CANVAS.w}
    height={CANVAS.h}
  />
);
