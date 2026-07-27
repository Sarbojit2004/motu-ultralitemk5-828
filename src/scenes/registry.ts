import React from 'react';
import {SceneId} from '../lib/theme';
import {S01, S02} from './ActHook';
import {S03, S04, S05, S06} from './ActCueMix';
import {S07, S08, S09, S10, S11, S12, S13, S14} from './ActUL';
import {S15, S16, S17, S18, S19, S20, S21, S22, S23} from './Act828';
import {S24, S25, S26, S27} from './ActClose';

export type SceneComp = React.FC<{dur: number}>;

/**
 * Scenes are registered here as they are built. The composition length is
 * derived from whatever is registered, so still-frame validation can run
 * against a partial reel; once all 27 are present the total is exactly 5340.
 */
export const REGISTRY: Partial<Record<SceneId, SceneComp>> = {
  S01,
  S02,
  S03,
  S04,
  S05,
  S06,
  S07,
  S08,
  S09,
  S10,
  S11,
  S12,
  S13,
  S14,
  S15,
  S16,
  S17,
  S18,
  S19,
  S20,
  S21,
  S22,
  S23,
  S24,
  S25,
  S26,
  S27,
};
