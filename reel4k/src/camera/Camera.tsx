import React, {createContext, useContext} from 'react';
import {AbsoluteFill} from 'remotion';
import {WIDTH} from '../lib/grid';
import {drift, lerp} from '../lib/ease';

/**
 * The virtual camera.
 *
 * `x`/`y` are the camera's displacement in canvas pixels, `z` its zoom, `r` its
 * roll in degrees. Nothing in this reel is composited at a fixed transform:
 * every shot supplies a Move, every Move is a function of time, and every
 * layer reads the camera through `Layer` below. That is the mechanism that
 * makes "paused at two random timestamps, something has changed" true by
 * construction rather than by discipline (master brief S3.1).
 */
export type Cam = {x: number; y: number; z: number; r: number};

/** A camera path across a shot. `p` is shot progress, and may run outside
 * [0,1] while the shot overlaps its neighbours during lead-in / lag-out. */
export type Move = (p: number) => Cam;

const CameraContext = createContext<Cam>({x: 0, y: 0, z: 1, r: 0});
export const useCamera = () => useContext(CameraContext);

export const CameraProvider: React.FC<{cam: Cam; children: React.ReactNode}> = ({cam, children}) => (
  <CameraContext.Provider value={cam}>{children}</CameraContext.Provider>
);

/**
 * A parallax plane. `depth` is the multiplier from theme.DEPTH: the layer takes
 * the camera's displacement, zoom delta and roll scaled by it, so a backdrop at
 * 0.2 crawls while a callout at 1.3 races. This differential is the entire
 * difference between "a photo pinned to a moving background" and a scene with
 * real depth (master brief S3.2).
 */
export const Layer: React.FC<{
  depth: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  zIndex?: number;
}> = ({depth, children, style, zIndex}) => {
  const cam = useCamera();
  const tx = -cam.x * depth;
  const ty = -cam.y * depth;
  const sc = 1 + (cam.z - 1) * depth;
  const rot = cam.r * depth;
  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${tx.toFixed(3)}px, ${ty.toFixed(3)}px, 0) scale(${sc.toFixed(5)}) rotate(${rot.toFixed(4)}deg)`,
        transformOrigin: '50% 50%',
        willChange: 'transform',
        zIndex,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Move factories. `focus` is a normalised target in [-1,1] across the frame, so
// a shot can aim its push at a specific physical detail - a knob, a jack, the
// LCD - rather than always at the middle of the picture (master brief S3.3).
// ---------------------------------------------------------------------------

const A = WIDTH * 0.095; // base travel in canvas px

type Opts = {
  focus?: [number, number];
  amp?: number;
  z0?: number;
  z1?: number;
  rot?: number;
  /** Extra roll applied across the whole move, on top of `rot`. */
  tilt?: number;
};

/** Start wide, close in on `focus`. */
export const pushIn = ({focus = [0, 0], amp = 1, z0 = 1.03, z1 = 1.34, rot = 0}: Opts = {}): Move =>
  (p) => {
    const t = drift(p);
    return {
      x: lerp(0, focus[0] * A * amp, t),
      y: lerp(0, focus[1] * A * amp, t),
      z: lerp(z0, z1, t),
      r: lerp(0, rot, t),
    };
  };

/** Start tight on `focus`, rack out to reveal the whole object. */
export const pullBack = ({focus = [0, 0], amp = 1, z0 = 1.4, z1 = 1.03, rot = 0}: Opts = {}): Move =>
  (p) => {
    const t = drift(p);
    return {
      x: lerp(focus[0] * A * amp, 0, t),
      y: lerp(focus[1] * A * amp, 0, t),
      z: lerp(z0, z1, t),
      r: lerp(rot, 0, t),
    };
  };

/** Lateral drift. `dir` -1 travels left, +1 right. */
export const drift2 = (dir: 1 | -1, {amp = 1, z0 = 1.08, z1 = 1.2, tilt = 0}: Opts = {}): Move =>
  (p) => {
    const t = drift(p);
    return {
      x: lerp(-dir * A * 0.86 * amp, dir * A * 0.86 * amp, t),
      y: lerp(A * 0.1 * amp, -A * 0.1 * amp, t),
      z: lerp(z0, z1, t),
      r: lerp(-tilt, tilt, t),
    };
  };

/** Vertical crane. `dir` -1 rises, +1 descends. */
export const crane = (dir: 1 | -1, {amp = 1, z0 = 1.06, z1 = 1.22}: Opts = {}): Move =>
  (p) => {
    const t = drift(p);
    return {
      x: lerp(A * 0.12 * amp, -A * 0.12 * amp, t),
      y: lerp(-dir * A * 0.92 * amp, dir * A * 0.92 * amp, t),
      z: lerp(z0, z1, t),
      r: 0,
    };
  };

/** Long lateral dolly across a wall of plates. */
export const dolly = (dir: 1 | -1, {amp = 1, z0 = 1.14, z1 = 1.02, tilt = 0}: Opts = {}): Move =>
  (p) => {
    const t = drift(p);
    return {
      x: lerp(-dir * A * 1.28 * amp, dir * A * 1.28 * amp, t),
      y: lerp(-A * 0.14 * amp, A * 0.14 * amp, t),
      z: lerp(z0, z1, t),
      r: lerp(-tilt, tilt, t),
    };
  };

/** Diagonal travel with a little roll - the "handheld gimbal" feel. */
export const dollyDiag = (dir: 1 | -1, {amp = 1, z0 = 1.05, z1 = 1.26, tilt = 0.8}: Opts = {}): Move =>
  (p) => {
    const t = drift(p);
    return {
      x: lerp(-dir * A * 1.0 * amp, dir * A * 0.5 * amp, t),
      y: lerp(A * 0.62 * amp, -A * 0.5 * amp, t),
      z: lerp(z0, z1, t),
      r: lerp(dir * tilt, -dir * tilt, t),
    };
  };

/** Arc around the subject: lateral travel plus counter-roll and a slow push. */
export const orbit = (dir: 1 | -1, {amp = 1, z0 = 1.05, z1 = 1.24, tilt = 1.6}: Opts = {}): Move =>
  (p) => {
    const t = drift(p);
    const a = lerp(-1, 1, t);
    return {
      x: dir * A * 0.9 * amp * a,
      y: -A * 0.2 * amp * Math.cos(a * 1.2),
      z: lerp(z0, z1, t),
      r: -dir * tilt * a,
    };
  };

/** Slam in fast then keep creeping - used on the drop. */
export const slamIn = ({focus = [0, 0], amp = 1, z0 = 1.55, z1 = 1.06}: Opts = {}): Move =>
  (p) => {
    const t = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)) , 6) * 0.98 - Math.max(0, -0.06 * p);
    const u = Math.min(1.25, Math.max(-0.3, p));
    return {
      x: lerp(focus[0] * A * 1.2 * amp, focus[0] * A * 0.12 * amp, t) + u * 6,
      y: lerp(focus[1] * A * 1.2 * amp, focus[1] * A * 0.12 * amp, t) - u * 10,
      z: lerp(z0, z1, t) + u * 0.012,
      r: 0,
    };
  };
