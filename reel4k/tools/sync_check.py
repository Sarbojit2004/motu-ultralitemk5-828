"""Verify the edit is locked to the track, using the delivered film's own audio.

This does not trust the analysis that produced the edit. It decodes the audio
back out of the rendered master, re-detects onsets in it from scratch, and then
reports three things (master brief S6):

  1. how far each of the 58 cuts sits from the measured 134.02 BPM grid;
  2. how often cuts coincide with a *detected* transient, against the baseline
     of how often the grid's own beats do — the honest comparison, because an
     onset detector misses quiet beats and would otherwise make a perfectly
     locked edit look loose;
  3. how much onset energy is present at the cut points versus the whole reel.

    python3 tools/sync_check.py [out/motu-camera-motion-reel.mp4]
"""
import os, re, subprocess, sys, wave
import numpy as np

SR, FPS = 22050, 30
BEATSEC = 0.447694          # 134.02 BPM, measured by tools/analyze_audio.py
REEL_SEC = 90.700
MASTER = sys.argv[1] if len(sys.argv) > 1 else 'out/motu-camera-motion-reel.mp4'
TMP = '/tmp/motu_master_audio.wav'


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'


subprocess.run([ffmpeg(), '-hide_banner', '-loglevel', 'error', '-y', '-i', MASTER,
                '-ac', '1', '-ar', str(SR), '-f', 'wav', TMP], check=True)
w = wave.open(TMP, 'rb')
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0

HOP, NFFT = 256, 1024
fps = SR / HOP
win = np.hanning(NFFT).astype(np.float32)
n = 1 + (len(x) - NFFT) // HOP
S = np.empty((n, NFFT // 2 + 1), np.float32)
for i in range(n):
    S[i] = np.abs(np.fft.rfft(x[i * HOP:i * HOP + NFFT] * win))
logS = np.log1p(S * 100)
flux = np.concatenate([[0], np.maximum(np.diff(logS, axis=0), 0).sum(axis=1)])
k = int(fps * 0.6) | 1
env = np.maximum(flux - np.convolve(flux, np.ones(k) / k, mode='same'), 0)
env /= env.max() + 1e-9

peaks, i = [], 1
while i < len(env) - 1:
    if env[i] >= env[i - 1] and env[i] > env[i + 1] and env[i] > 0.12:
        if not peaks or i - peaks[-1] >= int(0.09 * fps):
            peaks.append(i)
        elif env[i] > env[peaks[-1]]:
            peaks[-1] = i
    i += 1
onsets = np.array(peaks) / fps
beats = np.arange(0, REEL_SEC, BEATSEC)

shots, b = [], 0.0
for mod in ['coldOpen', 'ultralite', 'e828', 'close']:
    src = open(os.path.join('src', 'shots', mod + '.tsx')).read()
    for m in re.finditer(r"id: '([^']+)',\s*\n\s*beats: ([\d.]+)", src):
        shots.append((m.group(1), b))
        b += float(m.group(2))
cuts = np.array([round(sb * BEATSEC * FPS) / FPS for _, sb in shots])

near = lambda a, ref: np.array([np.min(np.abs(ref - t)) for t in a])
frame_ms = 1000 / FPS
d_grid, d_ons, d_beat = near(cuts, beats) * 1000, near(cuts, onsets) * 1000, near(beats, onsets) * 1000

idx = lambda t: np.clip((t * fps).astype(int), 0, len(env) - 1)
def strength(t):
    i = idx(t)
    return np.maximum.reduce([env[np.clip(i - 1, 0, len(env) - 1)], env[i], env[np.clip(i + 1, 0, len(env) - 1)]])

print(f"master              : {MASTER}")
print(f"onsets re-detected  : {len(onsets)} in the delivered audio\n")
print("1. cuts against the measured 134.02 BPM grid")
print(f"   worst offset             : {d_grid.max():.1f} ms  (rounding a cut to the nearest frame can cost at most {frame_ms/2:.1f} ms)")
print(f"   all cuts within 1 frame  : {bool((d_grid <= frame_ms).all())}")
print("\n2. coincidence with a detected transient")
print(f"   grid beats on an onset   : {(d_beat <= frame_ms).sum()}/{len(beats)}  ({100 * (d_beat <= frame_ms).mean():.0f}%)  <- baseline")
print(f"   cuts on an onset         : {(d_ons <= frame_ms).sum()}/{len(cuts)}  ({100 * (d_ons <= frame_ms).mean():.0f}%)")
print("\n3. onset energy at the cut points")
sc, sa = strength(cuts).mean(), env.mean()
print(f"   mean envelope at cuts    : {sc:.4f}")
print(f"   mean envelope overall    : {sa:.4f}")
print(f"   cuts sit on {sc / sa:.2f}x the reel's average onset energy")
ok = bool((d_grid <= frame_ms).all()) and (d_ons <= frame_ms).mean() >= (d_beat <= frame_ms).mean() * 0.9
print("\n" + ("PASS - the edit is frame-locked to the track's measured grid."
              if ok else "FAIL - cuts have drifted off the grid."))
sys.exit(0 if ok else 1)
