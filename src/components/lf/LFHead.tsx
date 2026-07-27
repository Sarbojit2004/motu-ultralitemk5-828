import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, SAFE_MARGIN_X, LF_CANVAS} from '../../lib/lf-theme';
import {ramp} from '../../lib/anim';
import {Kicker} from '../Type';
import {Label} from './LFType';

/** Landscape scene-header eyebrow — same visual language as the reel's SceneHead. */
export const LFHead: React.FC<{
  kicker: string;
  accent: string;
  right?: string;
  t?: number;
  delay?: number;
}> = ({kicker, accent, right, t = 64, delay = 0}) => {
  const f = useCurrentFrame();
  const g = ramp(f, [delay, delay + 14], [0, 1]);
  const w = LF_CANVAS.w - SAFE_MARGIN_X * 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE_MARGIN_X,
        top: t,
        width: w,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: g,
        transform: `translateX(${(1 - g) * -20}px)`,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 15}}>
        <div style={{width: 34, height: 4, background: accent, borderRadius: 9}} />
        <Kicker color={accent} size={24}>
          {kicker}
        </Kicker>
      </div>
      {right ? (
        <Label size={20} color={C.inkDim}>
          {right}
        </Label>
      ) : null}
    </div>
  );
};
