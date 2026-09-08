import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Cam, CameraProvider, Layer} from '../camera/Camera';
import {C, DEPTH} from '../lib/theme';
import {DURATION_FRAMES} from '../lib/grid';

/**
 * The continuous paper environment every shot is composited into.
 *
 * The World is rendered once, at reel level, and follows whichever shot
 * currently owns the frame - so the cream sheet reads as one unbroken surface
 * that the camera keeps moving across, rather than a backdrop that is rebuilt
 * per card. On top of the camera parallax, each layer carries its own slow,
 * independent motion: the sheet breathes, the light streaks sweep, the grain
 * reseeds every frame. A "quiet" moment with nothing else happening is still
 * never a frozen frame (master brief S3.5).
 */
export const World: React.FC<{cam: Cam}> = ({cam}) => {
  const f = useCurrentFrame();
  const t = f / DURATION_FRAMES;

  // Slow, reel-long breathing of the sheet itself.
  const paperScale = 1.07 + Math.sin(t * Math.PI * 4.0) * 0.016 + t * 0.03;
  const paperX = Math.sin(t * Math.PI * 7.0) * 68 - t * 70;
  const paperY = Math.cos(t * Math.PI * 5.0) * 78 + t * 96;

  // Light streaks sweep across the sheet over the length of the reel.
  const lightX = -190 + t * 420 + Math.sin(t * Math.PI * 9.0) * 62;
  const lightY = 130 - t * 300 + Math.cos(t * Math.PI * 6.0) * 48;
  const darkX = -110 + t * 210 - Math.sin(t * Math.PI * 8.0) * 54;
  const streakPulse = 0.86 + Math.sin(t * Math.PI * 13.0) * 0.14;

  // Film grain: a fresh offset every frame so the surface always shimmers.
  const gx = ((f * 137) % 601) - 300;
  const gy = ((f * 271) % 577) - 288;

  return (
    <CameraProvider cam={cam}>
      <AbsoluteFill style={{backgroundColor: C.paperDeep}} />

      <Layer depth={DEPTH.paper}>
        <AbsoluteFill
          style={{
            transform: `translate3d(${paperX.toFixed(2)}px, ${paperY.toFixed(2)}px, 0) scale(${paperScale.toFixed(4)})`,
            transformOrigin: '50% 50%',
          }}
        >
          <Img
            src={staticFile('tex/paper.jpg')}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
        </AbsoluteFill>
      </Layer>

      <Layer depth={DEPTH.paper + 0.02}>
        <AbsoluteFill
          style={{
            transform: `translate3d(${darkX.toFixed(2)}px, ${(-lightY * 0.6).toFixed(2)}px, 0) scale(1.12)`,
            opacity: 0.9,
          }}
        >
          <Img
            src={staticFile('tex/streak_dark.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
        </AbsoluteFill>
      </Layer>

      <Layer depth={DEPTH.streak}>
        <AbsoluteFill
          style={{
            transform: `translate3d(${lightX.toFixed(2)}px, ${lightY.toFixed(2)}px, 0) scale(1.15)`,
            opacity: streakPulse,
          }}
        >
          <Img
            src={staticFile('tex/streak_light.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
          />
        </AbsoluteFill>
      </Layer>

      <Layer depth={DEPTH.paper + 0.01}>
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile('tex/grain.png')})`,
            backgroundSize: '760px 760px',
            backgroundRepeat: 'repeat',
            backgroundPosition: `${gx}px ${gy}px`,
            opacity: 0.34,
          }}
        />
      </Layer>
    </CameraProvider>
  );
};

/**
 * Frame-locked finish that sits *below* every product photograph, so it can
 * never tint one (master brief S4). Rendered as a separate element from World
 * because it must not parallax - it is the lens, not the room.
 */
export const WorldVignette: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / DURATION_FRAMES;
  const s = 1.02 + Math.sin(t * Math.PI * 2.6) * 0.02;
  return (
    <AbsoluteFill style={{transform: `scale(${s.toFixed(4)})`, opacity: 0.85}}>
      <Img
        src={staticFile('tex/vignette.png')}
        style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
      />
    </AbsoluteFill>
  );
};
