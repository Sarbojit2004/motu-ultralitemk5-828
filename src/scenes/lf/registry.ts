import React from 'react';
import {LFSceneId} from '../../lib/lf-theme';
import {CO1} from './ColdOpen';
import {H1, H2, H3, H4, H5} from './Hook';
import {U1, U2, U3, U4, U5, U6, U7, U8, U9, U10, U11, U12, U13} from './UltraLite';
import {E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12, E13, E14, E15} from './E828';
import {CP1, CP2, CP3, CP4, CP5} from './Comparison';
import {OU1, OU2, OU3, OU4, OU5, OU6} from './Outro';

export type LFSceneComp = React.FC<{dur: number}>;

/**
 * Long-form scenes are registered here as they are built, chapter by
 * chapter. The composition length is derived from whatever is registered,
 * so still-frame validation can run against a partial video; once all 45
 * are present the total is exactly 18000 frames (600.000s).
 */
export const LF_REGISTRY: Partial<Record<LFSceneId, LFSceneComp>> = {
  CO1,
  H1,
  H2,
  H3,
  H4,
  H5,
  U1,
  U2,
  U3,
  U4,
  U5,
  U6,
  U7,
  U8,
  U9,
  U10,
  U11,
  U12,
  U13,
  E1,
  E2,
  E3,
  E4,
  E5,
  E6,
  E7,
  E8,
  E9,
  E10,
  E11,
  E12,
  E13,
  E14,
  E15,
  CP1,
  CP2,
  CP3,
  CP4,
  CP5,
  OU1,
  OU2,
  OU3,
  OU4,
  OU5,
  OU6,
};
