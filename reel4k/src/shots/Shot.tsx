import React from 'react';
import {Life, lifeOf} from '../elements/life';
import {Move} from '../camera/Camera';

/** Everything a shot's body needs to place its components in time. */
export type ShotCtx = {
  /** Local beat time. Negative during the shot's lead-in, > `dur` during lag-out. */
  lb: number;
  /** Body length of the shot in beats. */
  dur: number;
  /** Build a component life from beat in/out points. */
  L: (inAt: number, outAt: number, inB?: number, outB?: number) => Life;
};

export type ShotSpec = {
  id: string;
  /** Body length in beats. Cuts land on beats, and the beats came from the track. */
  beats: number;
  /** Beats this shot's components may start arriving *before* its cut. */
  lead?: number;
  /** Beats this shot's components may keep leaving *after* the next cut. */
  lag?: number;
  move: Move;
  /** White flash on the cut into this shot, 0..1. */
  flash?: number;
  body: (ctx: ShotCtx) => React.ReactNode;
};

export const makeCtx = (lb: number, dur: number): ShotCtx => ({
  lb,
  dur,
  L: (inAt, outAt, inB, outB) => lifeOf(lb, inAt, outAt, inB, outB),
});
