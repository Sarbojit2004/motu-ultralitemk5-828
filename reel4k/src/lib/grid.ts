/**
 * Musical grid for the MOTU camera-motion reel.
 *
 * Every value here was measured off the supplied Raavana Mavandaa track by
 * `tools/analyze_audio.py` (spectral-flux onset envelope -> autocorrelation
 * tempo -> phase-aligned beat grid -> low-band downbeat selection):
 *
 *   tempo            134.02 BPM, stable to +/-0 BPM from 16s to the end
 *   beat period      0.447694 s   (13.4308 frames @ 30fps)
 *   bar              1.790777 s   (53.7233 frames)
 *   trim in-point    12.559439 s  = downbeat #7 of the source file
 *   trim out-point   end of track (103.259 s), so the music resolves naturally
 *
 * The reel is therefore 2721 frames = 90.700 s, starting exactly on a downbeat.
 * Cuts are addressed in beats and converted here, so every cut in the film
 * lands on a real transient rather than a round clock value.
 */

export const FPS = 30;

/** Seconds per beat at 134.02 BPM. */
export const BEAT_SEC = 0.447694;
/** Frames per beat: 13.4308. */
export const BEAT = BEAT_SEC * FPS;
/** Frames per bar (4 beats): 53.7233. */
export const BAR = BEAT * 4;

/** Total reel length. 202.6 beats of music, ending on the track's own tail. */
export const DURATION_FRAMES = 2721;
export const DURATION_SEC = DURATION_FRAMES / FPS; // 90.700

export const WIDTH = 2160;
export const HEIGHT = 3840;

/** Beat index -> frame (fractional beats allowed). */
export const beat = (n: number) => n * BEAT;
/** Bar index -> frame. */
export const bar = (n: number) => n * BAR;
/** Beat index -> frame, snapped to the nearest whole frame (used for cuts). */
export const beatF = (n: number) => Math.round(n * BEAT);

/**
 * Movement boundaries, in beats. Chosen so the track's drop (source 28.676 s =
 * reel 16.117 s = beat 36) falls inside the UltraLite movement and can be used
 * as its gear-change, and so the two movements are split in proportion to how
 * many distinct raw images each product actually has (22 vs 43).
 */
export const MOVEMENT = {
  coldOpen: {from: 0, to: 12},
  ultralite: {from: 12, to: 68},
  e828: {from: 68, to: 184},
  close: {from: 184, to: 202.6},
} as const;

/** The beat on which the track drops. Used as the UltraLite gear-change. */
export const DROP_BEAT = 36;
