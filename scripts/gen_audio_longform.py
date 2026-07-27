#!/usr/bin/env python3
"""Generates the ~600s music bed, ~30-clip SFX palette, and silent VO
placeholder for the long-form MOTU UltraLite-mk5 / 828 video.

Extends the same synthesis techniques proven in the 178s reel (biquad
filters, envelopes, stereo widening, comb-filter reverb) rather than
re-architecting from zero. Writes WAV to a scratch dir, then MP3 into
public/audio/lf/ and public/vo/ via Remotion's bundled ffmpeg.

Run in isolation, BEFORE any scene code references a cue name:
    python3 scripts/gen_audio_longform.py
    python3 scripts/audit_audio.py
"""
import math
import os
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WAV_DIR = "/tmp/claude-0/-home-user-motu-ultralitemk5-828/56858eaf-896a-579f-aa19-f4d8595fd900/lf_wav"
os.makedirs(WAV_DIR, exist_ok=True)
rng = np.random.default_rng(600)


def wr(name, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    d = (x * 32767).astype("<i2")
    with wave.open(os.path.join(WAV_DIR, name + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(d.tobytes())


def t(n):
    return np.arange(n) / SR


def env(n, a, d, s=0.0, r=0.0, sl=0.6):
    e = np.ones(n)
    ai = min(int(a * SR), n)
    di = min(int(d * SR), max(0, n - ai))
    ri = min(int(r * SR), n)
    if ai:
        e[:ai] = np.linspace(0, 1, ai)
    if di:
        e[ai:ai + di] = np.linspace(1, sl, di)
    if ai + di < n:
        e[ai + di:] = sl
    if ri:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e


def expd(n, tau):
    return np.exp(-t(n) / tau)


def noise(n):
    return rng.standard_normal(n)


def _bq(fc, q, kind):
    fc = float(np.clip(fc, 20.0, SR / 2 * 0.97))
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * q)
    c = math.cos(w)
    a0 = 1 + al
    if kind == "lp":
        b = [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0]
    else:
        b = [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0]
    return b, [1.0, -2 * c / a0, (1 - al) / a0]


def lpf(x, fc, q=0.707):
    b, a = _bq(fc, q, "lp")
    return lfilter(b, a, x)


def hpf(x, fc, q=0.707):
    b, a = _bq(fc, q, "hp")
    return lfilter(b, a, x)


def saw(f, n, det=0.0):
    ph = np.cumsum(np.full(n, f / SR))
    o = np.zeros(n)
    for k in range(1, 14):
        o += np.sin(2 * np.pi * k * (ph + det * k * 0.001)) / k
    return o * 0.5


def sine(f, n):
    return np.sin(2 * np.pi * np.cumsum(np.full(n, f / SR)))


def stereo(x, width=0.25, pre=0.012):
    d = int(pre * SR)
    r = np.concatenate([np.zeros(d), x[:-d]]) if d else x.copy()
    return np.stack([x * (1 - width * 0.5) + r * width * 0.5, r * (1 - width * 0.5) + x * width * 0.5], 1)


def sfx(name, x, norm=0.85):
    x = np.asarray(x, dtype=float)
    m = np.abs(x).max()
    if m > 0:
        x = x / m * norm
    wr(name, x)


# =====================================================================
# MUSIC BED — 600.0s, six energy zones mapped to the video's chapters
# =====================================================================
DUR = 600.0
N = int(DUR * SR)
BPM = 96.0
BEAT = 60 / BPM
BAR = BEAT * 4

# Cm  Ab  Eb  Bb  (roots, Hz) — same progression family as the reel
PROG = [
    [130.81, 155.56, 196.00],
    [103.83, 130.81, 155.56],
    [155.56, 196.00, 233.08],
    [116.54, 146.83, 174.61],
]
TRANSPOSE_AT = 300.0  # halfway lift: up a whole step for the second half
TRANSPOSE_RATIO = 2 ** (2 / 12)

# (start, end, energy, brightness, drums_on) — chapters:
# cold open / cuemix hook / ultralite / 828 / comparison / outro
SEC = [
    (0, 15, 0.95, 1.30, True),      # cold open — punchy
    (15, 75, 0.55, 1.05, False),    # cuemix hook — pull back, let it breathe
    (75, 230, 0.72, 0.95, True),    # ultralite-mk5 chapter — cool, steady
    (230, 410, 0.82, 0.88, True),   # 828 chapter — warmer, slightly fuller
    (410, 500, 0.92, 1.15, True),   # comparison — brightest, most driven
    (500, 582, 0.80, 1.05, True),   # outro body
    (582, 600, 0.55, 1.20, False),  # final wind-down
]


def secval(ts, idx):
    for s, e, en, br, dr in SEC:
        if s <= ts < e:
            return (en, br, dr)[idx]
    return (SEC[-1][2], SEC[-1][3], SEC[-1][4])[idx]


pad = np.zeros(N)
bass = np.zeros(N)
arp = np.zeros(N)
drum = np.zeros(N)

nbar = int(DUR / BAR) + 1
for b in range(nbar):
    ts = b * BAR
    if ts >= DUR:
        break
    xpose = TRANSPOSE_RATIO if ts >= TRANSPOSE_AT else 1.0
    ch = [f * xpose for f in PROG[b % 4]]
    i0 = int(ts * SR)
    ln = min(int(BAR * SR) + int(0.4 * SR), N - i0)
    if ln <= 0:
        break
    en = secval(ts, 0)
    br = secval(ts, 1)
    drums_on = secval(ts, 2)

    pv = np.zeros(ln)
    for j, f in enumerate(ch):
        pv += saw(f, ln, det=1.0 + j * 0.7) * 0.33 + saw(f * 2, ln, det=0.5) * 0.10
    pv *= env(ln, 0.35, 0.2, sl=0.85, r=0.5)
    pad[i0:i0 + ln] += lpf(pv, 700 * br) * 0.30 * en

    for k in range(8):
        ts2 = ts + k * BEAT / 2
        if ts2 >= DUR:
            break
        j0 = int(ts2 * SR)
        jl = min(int(BEAT * 0.46 * SR), N - j0)
        if jl <= 0:
            break
        amp = 1.0 if k % 2 == 0 else 0.55
        bv = (sine(ch[0] / 2, jl) * 0.9 + sine(ch[0], jl) * 0.18) * expd(jl, 0.11) * amp
        bass[j0:j0 + jl] += bv * 0.42 * en

    if en > 0.58:
        seq = [0, 1, 2, 1, 2, 0, 1, 2, 0, 2, 1, 0, 2, 1, 0, 1]
        for k in range(16):
            ts2 = ts + k * BEAT / 4
            if ts2 >= DUR:
                break
            j0 = int(ts2 * SR)
            jl = min(int(BEAT * 0.30 * SR), N - j0)
            if jl <= 0:
                break
            f = ch[seq[k]] * 4
            av = (np.sin(2 * np.pi * f * t(jl)) + 0.3 * np.sin(2 * np.pi * f * 2 * t(jl))) * expd(jl, 0.045)
            arp[j0:j0 + jl] += av * 0.10 * en * (0.7 if k % 2 else 1.0)

    if drums_on and en > 0.5:
        for k, hit in enumerate([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0]):
            if not hit:
                continue
            ts2 = ts + k * BEAT / 4
            if ts2 >= DUR:
                break
            j0 = int(ts2 * SR)
            jl = min(int(0.22 * SR), N - j0)
            if jl <= 0:
                break
            fsw = 62 * np.exp(-t(jl) / 0.030) + 42
            kv = np.sin(2 * np.pi * np.cumsum(fsw) / SR) * expd(jl, 0.10)
            kv += noise(jl) * expd(jl, 0.004) * 0.30
            drum[j0:j0 + jl] += kv * 0.48 * en
        for k in (4, 12):
            ts2 = ts + k * BEAT / 4
            if ts2 >= DUR:
                continue
            j0 = int(ts2 * SR)
            jl = min(int(0.20 * SR), N - j0)
            if jl <= 0:
                continue
            sv = hpf(noise(jl), 1900) * expd(jl, 0.055) + np.sin(2 * np.pi * 185 * t(jl)) * expd(jl, 0.035) * 0.35
            drum[j0:j0 + jl] += sv * 0.24 * en
        for k in range(16):
            if k % 2 == 0:
                continue
            ts2 = ts + k * BEAT / 4
            if ts2 >= DUR:
                break
            j0 = int(ts2 * SR)
            jl = min(int(0.055 * SR), N - j0)
            if jl <= 0:
                break
            drum[j0:j0 + jl] += hpf(noise(jl), 7500) * expd(jl, 0.014) * 0.10 * en

mus = stereo(pad, 0.55, 0.020) + stereo(arp, 0.40, 0.009) + np.stack([bass, bass], 1) + stereo(drum, 0.16, 0.004)

# transition risers at every chapter boundary (skip t=0)
for s, _, _, _, _ in SEC[1:]:
    j0 = int((s - 2.2) * SR)
    if j0 < 0:
        continue
    jl = int(2.2 * SR)
    jl = min(jl, N - j0)
    if jl <= 0:
        continue
    sw = np.linspace(300, 3000, jl)
    rv = (hpf(noise(jl), 600) * 0.5 + np.sin(2 * np.pi * np.cumsum(sw) / SR) * 0.28) * np.linspace(0, 1, jl) ** 2.4
    mus[j0:j0 + jl] += np.stack([rv, rv], 1) * 0.15

g = np.ones(N)
g[:int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR))
g[-int(4.5 * SR):] = np.linspace(1, 0, int(4.5 * SR))
mus *= g[:, None]
mus /= max(1e-9, np.abs(mus).max())
mus *= 0.60
wr("music-bed-longform", mus)
print(f"music bed: {DUR}s ({N} samples)")

# =====================================================================
# SFX PALETTE — 30 distinct clips
# =====================================================================


def whoosh(dur, f0, f1, q, rev=False):
    n = int(dur * SR)
    nz = noise(n)
    sh = (np.linspace(0, 1, n) ** 1.7) if not rev else (np.linspace(1, 0, n) ** 1.7)
    y = hpf(lpf(nz, (f0 + f1) / 2 * 1.2, q), f0 * 0.55, q)
    y *= sh
    sw = np.linspace(f0, f1, n)
    y += np.sin(2 * np.pi * np.cumsum(sw) / SR) * 0.22 * sh
    return stereo(y * np.hanning(n) ** 0.5, 0.5, 0.006)


sfx("whoosh-air", whoosh(0.62, 700, 5200, 0.8))
sfx("whoosh-low", whoosh(0.85, 90, 1200, 1.1))
sfx("whoosh-rev", whoosh(0.70, 4200, 800, 0.9, rev=True))
sfx("whoosh-soft", whoosh(0.42, 500, 2400, 1.3))
sfx("whoosh-bright", whoosh(0.50, 1800, 7000, 0.9))

n = int(0.55 * SR)
sfx("whoosh-metal", stereo(
    hpf(noise(n), 2400) * np.hanning(n) * (1 + 0.5 * np.sin(2 * np.pi * 38 * t(n)))
    + np.sin(2 * np.pi * np.cumsum(np.linspace(1400, 6000, n)) / SR) * 0.3 * np.hanning(n), 0.6, 0.005))

n = int(1.1 * SR)
sw1 = np.linspace(300, 4200, n // 2)
sw2 = np.linspace(4200, 900, n - n // 2)
sw = np.concatenate([sw1, sw2])
sfx("whoosh-swoop", stereo(
    (hpf(noise(n), 500) * 0.5 + np.sin(2 * np.pi * np.cumsum(sw) / SR) * 0.35) * np.hanning(n) ** 0.6, 0.55, 0.007))

n = int(1.5 * SR)
imp = np.sin(2 * np.pi * np.cumsum(58 * np.exp(-t(n) / 0.05) + 34) / SR) * expd(n, 0.30) + hpf(noise(n), 300) * expd(n, 0.020) * 0.5
sfx("impact-deep", stereo(imp, 0.2, 0.004))

n = int(0.9 * SR)
imp2 = hpf(noise(n), 900) * expd(n, 0.09) * 0.7 + np.sin(2 * np.pi * np.cumsum(np.linspace(220, 70, n)) / SR) * expd(n, 0.16)
sfx("impact-mid", stereo(imp2, 0.3, 0.005))

n = int(0.4 * SR)
imp3 = hpf(noise(n), 2200) * expd(n, 0.035) * 0.8 + np.sin(2 * np.pi * 900 * t(n)) * expd(n, 0.03) * 0.5
sfx("impact-light", stereo(imp3, 0.25, 0.003))

n = int(1.3 * SR)
imp4 = np.sin(2 * np.pi * np.cumsum(np.linspace(340, 90, n)) / SR) * expd(n, 0.42) + hpf(noise(n), 700) * expd(n, 0.05) * 0.4
imp4 = lpf(imp4, 2600)
sfx("impact-hollow", stereo(imp4, 0.28, 0.006))

n = int(0.35 * SR)
sfx("tick", stereo(hpf(noise(n), 5200) * expd(n, 0.012) + np.sin(2 * np.pi * 2400 * t(n)) * expd(n, 0.010) * 0.5, 0.35, 0.003))

n = int(0.42 * SR)
gap = int(0.09 * SR)
tk = np.zeros(n)
seg = int(0.10 * SR)
tk[:seg] = (hpf(noise(seg), 5000) * expd(seg, 0.010) + np.sin(2 * np.pi * 2600 * t(seg)) * expd(seg, 0.009) * 0.5)
tk[gap:gap + seg] += (hpf(noise(seg), 5600) * expd(seg, 0.010) + np.sin(2 * np.pi * 2900 * t(seg)) * expd(seg, 0.009) * 0.5)
sfx("tick-double", stereo(tk, 0.32, 0.003))

n = int(0.26 * SR)
sfx("click-ui", stereo(np.sin(2 * np.pi * 1650 * t(n)) * expd(n, 0.020) * 0.8 + hpf(noise(n), 4000) * expd(n, 0.007) * 0.5, 0.25, 0.002))

n = int(0.30 * SR)
sfx("click-soft", stereo(np.sin(2 * np.pi * 980 * t(n)) * expd(n, 0.028) * 0.7 + lpf(noise(n), 3000) * expd(n, 0.012) * 0.3, 0.22, 0.002))

n = int(0.24 * SR)
sfx("click-deep", stereo(np.sin(2 * np.pi * 420 * t(n)) * expd(n, 0.024) * 0.85 + hpf(noise(n), 2200) * expd(n, 0.006) * 0.3, 0.24, 0.002))

n = int(1.7 * SR)
riser = (hpf(noise(n), 500) * 0.55 + np.sin(2 * np.pi * np.cumsum(np.linspace(220, 2600, n)) / SR) * 0.45) * np.linspace(0, 1, n) ** 2.6
sfx("riser", stereo(riser, 0.55, 0.008))

n = int(3.0 * SR)
riserL = (hpf(noise(n), 300) * 0.5 + np.sin(2 * np.pi * np.cumsum(np.linspace(140, 2200, n)) / SR) * 0.4) * np.linspace(0, 1, n) ** 3.0
sfx("riser-long", stereo(riserL, 0.55, 0.010))

n = int(0.85 * SR)
riserS = (hpf(noise(n), 700) * 0.55 + np.sin(2 * np.pi * np.cumsum(np.linspace(400, 3200, n)) / SR) * 0.4) * np.linspace(0, 1, n) ** 2.2
sfx("riser-short", stereo(riserS, 0.50, 0.006))

n = int(0.75 * SR)
sfx("sub-drop", stereo(np.sin(2 * np.pi * np.cumsum(np.linspace(150, 26, n)) / SR) * expd(n, 0.26), 0.1, 0.003))

n = int(1.1 * SR)
dh = np.sin(2 * np.pi * np.cumsum(np.linspace(180, 22, n)) / SR) * expd(n, 0.34) + hpf(noise(n), 250) * expd(n, 0.02) * 0.3
sfx("drop-heavy", stereo(dh, 0.12, 0.004))

n = int(1.1 * SR)
sh = np.zeros(n)
for f in (2093, 2637, 3136, 4186, 5274):
    sh += np.sin(2 * np.pi * f * t(n)) * expd(n, 0.28) * rng.uniform(0.5, 1.0)
sfx("shimmer", stereo(hpf(sh, 1500) * 0.5, 0.7, 0.010))

n = int(1.3 * SR)
shb = np.zeros(n)
for f in (3136, 4186, 5274, 6272, 7040):
    shb += np.sin(2 * np.pi * f * t(n)) * expd(n, 0.34) * rng.uniform(0.55, 1.0)
sfx("shimmer-bright", stereo(hpf(shb, 2200) * 0.5, 0.75, 0.012))

n = int(0.45 * SR)
gl = noise(n) * expd(n, 0.05)
step = int(0.012 * SR)
for i in range(0, n - step, step * 2):
    gl[i:i + step] *= 0.06
sfx("glitch", stereo(hpf(gl, 1200), 0.6, 0.004))

n = int(1.3 * SR)
sfx("swell", stereo(lpf(noise(n), 1400) * (np.linspace(0, 1, n) ** 2) * 0.8 + np.sin(2 * np.pi * np.cumsum(np.linspace(80, 260, n)) / SR) * np.linspace(0, 1, n) ** 2 * 0.4, 0.5, 0.012))

n = int(1.5 * SR)
sfx("swell-dark", stereo(lpf(noise(n), 800) * (np.linspace(0, 1, n) ** 2.2) * 0.8 + np.sin(2 * np.pi * np.cumsum(np.linspace(50, 140, n)) / SR) * np.linspace(0, 1, n) ** 2.2 * 0.45, 0.5, 0.014))

n = int(2.2 * SR)
ch = np.zeros(n)
for f in (261.63, 329.63, 392.00, 523.25):
    ch += np.sin(2 * np.pi * f * t(n)) * expd(n, 0.85)
sfx("chime-final", stereo(ch * 0.5, 0.6, 0.014))

n = int(1.5 * SR)
chs = np.zeros(n)
for f in (392.00, 493.88, 587.33):
    chs += np.sin(2 * np.pi * f * t(n)) * expd(n, 0.55)
sfx("chime-soft", stereo(chs * 0.45, 0.55, 0.010))

n = int(0.5 * SR)
pt1 = int(0.16 * SR)
pt = np.zeros(n)
pt[:pt1] = hpf(noise(pt1), 3000) * expd(pt1, 0.05) * 0.6
pt[pt1:pt1 + int(0.05 * SR)] += np.sin(2 * np.pi * 1400 * t(int(0.05 * SR))) * expd(int(0.05 * SR), 0.015) * 0.6
sfx("page-turn", stereo(pt, 0.35, 0.004))

n = int(1.4 * SR)
notes = [523.25, 659.25, 783.99]
st = np.zeros(n)
seg = n // len(notes)
for i, f in enumerate(notes):
    j0 = i * seg
    jl = n - j0 if i == len(notes) - 1 else seg + int(0.05 * SR)
    jl = min(jl, n - j0)
    st[j0:j0 + jl] += np.sin(2 * np.pi * f * t(jl)) * expd(jl, 0.30) * 0.6
st += hpf(noise(n), 3000) * expd(n, 0.03) * 0.15
sfx("stinger-chapter", stereo(st, 0.4, 0.009))

n = int(0.28 * SR)
sfx("transition-blip", stereo(np.sin(2 * np.pi * np.cumsum(np.linspace(600, 2400, n)) / SR) * expd(n, 0.045), 0.3, 0.002))

n = int(0.6 * SR)
bell = np.sin(2 * np.pi * 1174.66 * t(n)) * expd(n, 0.22) + np.sin(2 * np.pi * 2349.32 * t(n)) * expd(n, 0.14) * 0.4
sfx("bell-soft", stereo(bell * 0.5, 0.45, 0.008))

# silent VO placeholder, exact runtime
wr("vo-silent-longform", np.zeros((N, 2)))

sfx_files = sorted(f[:-4] for f in os.listdir(WAV_DIR) if f.endswith(".wav") and f not in ("music-bed-longform.wav", "vo-silent-longform.wav"))
print(f"SFX generated: {len(sfx_files)}")
for f in sfx_files:
    print(" ", f)
print("done — WAV files in", WAV_DIR)
