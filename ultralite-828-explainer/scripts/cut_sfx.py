#!/usr/bin/env python3
"""Cut a clean single-event SFX palette out of the 43-file `tech (n).mp3` pack.

Most files in the pack are multi-take: three or four variations of the same
effect separated by ~150ms of silence. A fixed-length slice therefore catches
the tail of one take and the head of the next, so each cut is trimmed to a
single event: snap to the nearest onset, then run until the envelope falls
below 2.5% of the take's peak for 60ms, or the next onset starts.
"""
import numpy as np, wave, subprocess, os, sys

FF  = os.path.expanduser('~/bin/ffmpeg')
SRC = '/home/user/soundcraft-signature-plus-shivansh-electronics-kolkata/sound-effects'
SR  = 48000

def load(fid):
    p = subprocess.run([FF, '-v', 'error', '-i', f'{SRC}/tech ({fid}).mp3',
                        '-ac', '2', '-ar', str(SR), '-f', 's16le', '-'],
                       capture_output=True).stdout
    return np.frombuffer(p, dtype='<i2').astype(np.float64).reshape(-1, 2) / 32768.0

def single(x, near, maxdur):
    """Trim x to the one event closest to `near` seconds.

    Segments are separated by real silence (below 3.5% of the file peak for at
    least 90ms), not by dips in the envelope - a riser or a swell crosses any
    fixed level several times on its way up and would otherwise be chopped at
    its first wobble.
    """
    m = abs(x).mean(1)
    hop = int(SR * 0.002)
    env = np.array([m[i:i + hop].max() for i in range(0, len(m) - hop, hop)])
    k = 5
    env = np.convolve(env, np.ones(k) / k, 'same')
    n0 = int(near / 0.002)
    loc = env[max(0, n0 - 500):n0 + 500]
    live = env > max(env.max() * 0.008, (loc.max() if len(loc) else 0) * 0.12)
    idx = np.nonzero(live)[0]
    if not len(idx): return x[:int(maxdur * SR)]
    segs = []; s0 = idx[0]; prev = idx[0]
    for i in idx[1:]:
        if i - prev > 45:            # 90ms of silence closes a take
            segs.append((s0, prev)); s0 = i
        prev = i
    segs.append((s0, prev))
    a, b = min(segs, key=lambda t: 0 if t[0] <= n0 <= t[1] else min(abs(t[0] - n0), abs(t[1] - n0)))
    b = min(b + 25, a + int(maxdur / 0.002))
    return x[max(0, int((a - 4) * 0.002 * SR)):min(len(x), int(b * 0.002 * SR))]


def shape(y, fin=0.004, fout=0.05):
    n = len(y)
    fo = min(int(fout * SR), n // 3); fi = min(int(fin * SR), n // 8)
    w = np.ones(n)
    w[:fi] = np.linspace(0, 1, fi)
    w[n - fo:] = np.linspace(1, 0, fo) ** 1.4
    return y * w[:, None]

def norm(y, target_db=-19.0):
    m = y.mean(1); w = int(SR * 0.15)
    if len(m) > w:
        cs = np.cumsum(np.concatenate([[0], m ** 2]))
        r = np.sqrt(((cs[w:] - cs[:-w]) / w).max())
    else:
        r = np.sqrt((m ** 2).mean())
    g = 10 ** (target_db / 20) / max(r, 1e-9)
    g = min(g, 10 ** (-1.0 / 20) / max(abs(y).max(), 1e-9))
    return np.clip(y * g, -1, 1), 20 * np.log10(g)

def save(path, y):
    w = wave.open(path, 'w'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((y * 32767).astype('<i2').tobytes()); w.close()

# name -> (pack file, approx seconds, max event length, target dB)
PICKS = {
    'impact-deep'  : ('6',  2.35, 0.70, -17),
    'impact-tight' : ('7',  4.28, 0.40, -18),
    'impact-full'  : ('40', 0.02, 0.80, -18),
    'whip-bright'  : ('10', 5.45, 0.55, -20),
    'whip-mid'     : ('34', 0.02, 0.45, -20),
    'whip-soft'    : ('26', 0.02, 0.45, -21),
    'air-pass'     : ('26', 3.05, 0.45, -22),
    'air-long'     : ('27', 1.50, 0.95, -22),
    'riser-short'  : ('43', 0.24, 0.95, -21),
    'riser-sub'    : ('3',  0.95, 1.25, -20),
    'riser-mid'    : ('36', 0.95, 1.90, -21),
    'gate-snap'    : ('20', 0.00, 0.30, -19),
    'snap-low'     : ('22', 0.00, 0.50, -19),
    'snap-tight'   : ('41', 1.83, 0.30, -20),
    'chime-lift'   : ('10', 3.42, 0.70, -21),
    'chime-hi'     : ('12', 1.43, 0.55, -21),
    'tick-glass'   : ('21', 0.00, 0.14, -20),
    'tick-hi'      : ('42', 0.62, 0.20, -21),
    'count-blip'   : ('36', 2.16, 0.12, -21),
    'data-beep'    : ('18', 0.26, 0.22, -23),
}

if __name__ == '__main__':
    os.makedirs('sfxn', exist_ok=True)
    cache = {}
    for name, (fid, near, mx, tgt) in PICKS.items():
        if fid not in cache: cache[fid] = load(fid)
        y = single(cache[fid], near, mx)
        y, g = norm(shape(y), tgt)
        save(f'sfxn/{name}.wav', y)
        print('%-13s tech(%-2s)@%-5.2f  %5.3fs  gain %+6.1f dB  peak %6.1f dB'
              % (name, fid, near, len(y) / SR, g, 20 * np.log10(abs(y).max() + 1e-9)), flush=True)
