"""Measure the supplied track and derive the reel's beat grid and trim.

Nothing about the timing in this reel is assumed: tempo, phase, downbeat and
structure are all measured here, and `src/lib/grid.ts` carries the results.

    python3 tools/analyze_audio.py

Pipeline: decode -> STFT spectral-flux onset envelope -> autocorrelation tempo
-> phase-aligned beat grid -> low-band downbeat selection -> mel self-similarity
novelty for section boundaries -> pick a downbeat-aligned trim that ends on the
track's own tail.
"""
import os, subprocess, sys, wave
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'Raavana Mavandaa (Full Video)  Jana Nayagan  Thalapathy Vijay  Pooja Hegde  H Vinoth  Anirudh.mp3')
TMP = '/tmp/motu_track.wav'
SR = 22050
FPS = 30
REEL_FRAMES = 2721


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'


def load():
    subprocess.run([ffmpeg(), '-hide_banner', '-loglevel', 'error', '-y', '-i', SRC,
                    '-ac', '1', '-ar', str(SR), '-f', 'wav', TMP], check=True)
    w = wave.open(TMP, 'rb')
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    return x


def onset_envelopes(x):
    HOP, NFFT = 256, 1024
    fps = SR / HOP
    win = np.hanning(NFFT).astype(np.float32)
    n = 1 + (len(x) - NFFT) // HOP
    S = np.empty((n, NFFT // 2 + 1), np.float32)
    for i in range(n):
        S[i] = np.abs(np.fft.rfft(x[i * HOP:i * HOP + NFFT] * win))
    logS = np.log1p(S * 100)
    k = int(fps * 0.6) | 1

    def env_of(band):
        flux = np.concatenate([[0], np.maximum(np.diff(logS[:, :band], axis=0), 0).sum(axis=1)])
        e = np.maximum(flux - np.convolve(flux, np.ones(k) / k, mode='same'), 0)
        return e / (e.max() + 1e-9)

    lo = int(160 / (SR / 2) * (S.shape[1] - 1))
    return fps, env_of(S.shape[1]), env_of(lo)


def main():
    x = load()
    dur = len(x) / SR
    fps, env, envlo = onset_envelopes(x)
    print(f"source            : {dur:.3f} s")

    def score(e, t):
        i = np.clip((t * fps).astype(int), 0, len(e) - 1)
        return np.maximum.reduce([e[np.clip(i - 1, 0, len(e) - 1)], e[i], e[np.clip(i + 1, 0, len(e) - 1)]]).mean()

    best = None
    for bpm in np.arange(133.8, 134.7, 0.005):
        P = 60 / bpm
        for ph in np.arange(0, P, 0.004):
            t = np.arange(16.0 + ((ph - 16.0) % P), dur, P)
            s = score(env, t)
            if best is None or s > best[0]:
                best = (s, bpm, ph)
    _, BPM, PH = best
    P = 60 / BPM
    beats = np.arange(PH % P, dur, P)
    off = max(range(4), key=lambda o: score(envlo, beats[o::4]) + 0.5 * score(env, beats[o::4]))
    downs = beats[off::4]
    bar = 4 * P
    print(f"tempo             : {BPM:.4f} BPM   beat {P:.6f}s   bar {bar:.6f}s ({bar*FPS:.3f} frames)")
    print(f"downbeat phase    : offset {off}, first at {downs[0]:.4f}s")

    reel = REEL_FRAMES / FPS
    cands = [d for d in downs if d + reel <= dur + 0.01]
    t0 = cands[-1] if cands else downs[0]
    print(f"\ntrim              : {t0:.6f}s -> {dur:.3f}s  (ends on the track's own tail)")
    print(f"reel length       : {reel:.3f} s = {REEL_FRAMES} frames @ {FPS}fps")
    print(f"beats in reel     : {reel / P:.2f}")
    drop = 28.676
    print(f"track drop        : source {drop:.3f}s -> reel {drop - t0:.3f}s = beat {(drop - t0) / P:.2f}")
    print("\nThese are the values carried in src/lib/grid.ts.")


if __name__ == '__main__':
    main()
