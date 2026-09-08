import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame,
} from 'remotion';
import {CameraProvider} from './camera/Camera';
import {World, WorldVignette} from './world/World';
import {Fonts} from './elements/Fonts';
import {makeCtx} from './shots/Shot';
import {PlacedShot, TIMELINE, worldCamAt} from './timeline';
import {BEAT} from './lib/grid';
import {C} from './lib/theme';

/** Blocks the render until the self-hosted display faces are actually ready. */
const FontGate: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const fonts = (document as any).fonts;
    if (!fonts) {
      continueRender(handle);
      return;
    }
    Promise.all([
      fonts.load('400 200px Anton'),
      fonts.load('400 200px "Archivo Black"'),
      fonts.load('600 200px Oswald'),
      fonts.load('700 120px "Barlow Semi Condensed"'),
      fonts.load('500 120px "Barlow Semi Condensed"'),
    ])
      .then(() => fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
  return null;
};

/**
 * One shot, rendered into its own camera.
 *
 * The Sequence starts `lead` beats before the shot's cut and runs `lag` beats
 * past the next one, and the shot evaluates its camera from its own absolute
 * position - so a component arriving early or leaving late travels a
 * continuous path of its own while the neighbouring composition is still on
 * screen (master brief S3.4).
 */
const Shot: React.FC<{shot: PlacedShot; offset: number}> = ({shot, offset}) => {
  const f = useCurrentFrame();
  const abs = offset + f;
  const p = (abs - shot.startFrame) / shot.bodyFrames;
  const lb = (abs - shot.startFrame) / BEAT;
  return (
    <CameraProvider cam={shot.move(p)}>
      <AbsoluteFill>{shot.body(makeCtx(lb, shot.beats))}</AbsoluteFill>
    </CameraProvider>
  );
};

/** Reference-style flash on a hard cut. Two frames up, four down. */
const Flash: React.FC<{at: number; amp: number}> = ({at, amp}) => {
  const f = useCurrentFrame();
  const d = f - at;
  const v = d < 0 ? Math.max(0, 1 + d / 2.2) : Math.max(0, 1 - d / 4.6);
  if (v <= 0.001) return null;
  return (
    <AbsoluteFill
      style={{backgroundColor: '#FFFDF6', opacity: Math.min(1, v * amp * 0.94)}}
    />
  );
};

const WorldHost: React.FC = () => {
  const f = useCurrentFrame();
  return <World cam={worldCamAt(f)} />;
};

export const Reel: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.paperDeep, overflow: 'hidden'}}>
    <Fonts />
    <FontGate />

    {/* The continuous paper environment, plus the frame-locked finish. Both sit
        BELOW every shot, so no product photograph is ever composited under a
        tint, streak, grain or vignette (master brief S4). */}
    <WorldHost />
    <WorldVignette />

    {TIMELINE.map((s) => {
      const lead = Math.round((s.lead ?? 0.8) * BEAT);
      const lag = Math.round((s.lag ?? 0.8) * BEAT);
      const from = Math.max(0, s.startFrame - lead);
      const dur = s.startFrame + s.bodyFrames + lag - from;
      return (
        <Sequence key={s.id} from={from} durationInFrames={dur} layout="none" name={s.id}>
          <Shot shot={s} offset={from} />
        </Sequence>
      );
    })}

    {TIMELINE.filter((s) => (s.flash ?? 0) > 0).map((s) => (
      <Flash key={`f-${s.id}`} at={s.startFrame} amp={s.flash!} />
    ))}

    {/* The track carries the whole soundscape at full level - no voiceover, no
        bed, nothing competing for headroom (master brief S6). */}
    <Audio src={staticFile('audio/reel-music.mp3')} volume={1} />
  </AbsoluteFill>
);
