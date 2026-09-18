#!/usr/bin/env python3
"""Synthesises every audio asset for the MOTU AVB Series reel and film.

NOTHING HERE IS SAMPLED, SOURCED OR FETCHED. Every waveform is generated from
scratch — biquad filters, explicit envelopes, comb-filter reverb, stereo
widening — the same class of DSP the M-Series reel used, but with new material:

                    M-Series reel                AVB Series (this file)
  subject           three desktop boxes          a network of rack units
  tempo             96 BPM                       104 BPM
  harmony           D major, sine pad + felt     E major, glass pad + pulse arp
  pulse             an off-beat shaker           a filtered 16th-note pulse
  low end           sine sub                     a soft kick on the beat (film)

Two beds are produced — 90.000 s for the reel and 300.000 s for the film — each
shaped to its own script's segment map (scripts/_timeline.json, written by
scripts/timeline.mjs), so the bed carries the film's own contour. Ten SFX cues
are married to transition kinds in src/components/Transitions.tsx.

THE MIX IS BUILT FOR A SPOKEN VOICE: a -7 dB speech pocket at 1.6 kHz, cues
that are bright (> 2.5 kHz) or sub (< 120 Hz) and never mid-heavy, and loudness
that is MEASURED (EBU R128 via ffmpeg) rather than inferred from a peak.

Run:  python3 scripts/gen_audio.py
"""
import json
import math
import os
import subprocess
import wave

import numpy as np
from scipy.signal import lfilter

SR = 48000
FPS = 30
HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
OUT = os.path.join(PROJ, "public", "audio")
SFX_OUT = os.path.join(OUT, "sfx")
FFMPEG = os.environ.get("FFMPEG", "ffmpeg")
rng = np.random.default_rng(0x16A848)

TL = json.load(open(os.path.join(HERE, "_timeline.json")))


# ─────────────────────────────────────────────────────────── primitives ──
def t(n):
    return np.arange(n) / SR


def tsec(dur):
    return np.arange(int(dur * SR)) / SR


def expd(n, tau):
    return np.exp(-t(n) / tau)


def noise(n):
    return rng.standard_normal(n)


def _bq(fc, q, kind, gain_db=0.0):
    fc = float(np.clip(fc, 20.0, SR / 2 * 0.97))
    w = 2 * math.pi * fc / SR
    al = math.sin(w) / (2 * q)
    c = math.cos(w)
    if kind == "peak":
        A = 10 ** (gain_db / 40)
        a0 = 1 + al / A
        b = [(1 + al * A) / a0, (-2 * c) / a0, (1 - al * A) / a0]
        a = [1.0, (-2 * c) / a0, (1 - al / A) / a0]
        return b, a
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


def peak(x, fc, gain_db, q=0.9):
    b, a = _bq(fc, q, "peak", gain_db)
    return lfilter(b, a, x)


def lpf_tv(x, fc_curve, q=0.707, blk=2048):
    x = np.asarray(x, dtype=np.float64)
    fc_curve = np.asarray(fc_curve, dtype=np.float64)
    out = np.zeros_like(x)
    zi = np.zeros(2)
    for i in range(0, len(x), blk):
        j = min(i + blk, len(x))
        b, a = _bq(float(fc_curve[i]), q, "lp")
        out[i:j], zi = lfilter(b, a, x[i:j], zi=zi)
    return out


def sine(f, n):
    return np.sin(2 * np.pi * np.cumsum(np.full(n, f / SR)))


def stereo(x, width=0.25, pre=0.012):
    d = int(pre * SR)
    r = np.concatenate([np.zeros(d), x[:-d]]) if d else x.copy()
    return np.stack([x * (1 - width * 0.5) + r * width * 0.5, r * (1 - width * 0.5) + x * width * 0.5], 1)


def verb(x, taps=((0.029, 0.33), (0.043, 0.25), (0.067, 0.18), (0.097, 0.12)), mix=0.26):
    y = np.zeros_like(x)
    for dt, g in taps:
        d = int(dt * SR)
        if d < len(x):
            y[d:] += x[:-d] * g
    return x * (1 - mix) + y * mix


def declick(x, ms=4.0):
    k = max(2, int(ms / 1000 * SR))
    if len(x) < 2 * k:
        return x
    w = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, k))
    x[:k] *= w
    x[-k:] *= w[::-1]
    return x


def speech_pocket(x):
    x = peak(x, 1600, -7.0, q=0.55)
    x = peak(x, 500, -3.2, q=0.8)
    return x


def write_wav(path, x, peak_db=-1.0):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    m = np.abs(x).max()
    if m > 0:
        x = x * (10 ** (peak_db / 20)) / m
    os.makedirs(os.path.dirname(path), exist_ok=True)
    d = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(d.tobytes())
    return x


# ═══════════════════════════════════════════════════════════ MUSIC BED ══
BPM = 104.0
BEAT = 60 / BPM
BAR = BEAT * 4

# E major family, voiced low and open. Glassy sine stacks with a slow chorus.
PROG = [
    [82.41, 123.47, 164.81],   # E
    [69.30, 103.83, 138.59],   # C#m
    [55.00,  82.41, 110.00],   # A
    [61.74,  92.50, 123.47],   # B
]

# Energy / brightness / arp / pulse / kick per segment id.
ZONE = {
    "hook":     (0.50, 0.78, False, True,  False),
    "platform": (0.68, 1.00, True,  True,  False),
    "s16a":     (0.70, 1.06, True,  True,  True),
    "s848":     (0.76, 1.04, True,  True,  True),
    "s10pre":   (0.84, 1.16, True,  True,  True),
    "sswitch":  (0.90, 1.22, True,  True,  True),
    "software": (0.72, 1.04, True,  False, True),
    "close":    (0.74, 1.10, True,  True,  False),
}


def zone_curves(tl, dur):
    n = int(round(dur * SR))
    ts = np.arange(n) / SR
    out = [np.zeros(n) for _ in range(5)]
    segs = tl["segments"]
    for i, s in enumerate(segs):
        a = s["start"]
        b = segs[i + 1]["start"] if i + 1 < len(segs) else tl["total"]
        z = ZONE[s["id"]]
        m = (ts >= a) & (ts < b)
        for k in range(5):
            out[k][m] = float(z[k])
    tail = ts >= tl["total"]
    for k in range(5):
        out[k][tail] = float(ZONE["close"][k]) * (0.85 if k == 0 else 1.0)
    ksm = int(1.2 * SR)
    return [np.convolve(o, np.ones(ksm) / ksm, mode="same") for o in out]


def pluck(f, n, tau=0.30):
    x = tsec(n / SR)
    body = (np.sin(2 * np.pi * f * x) * 0.55
            + np.sin(2 * np.pi * f * 2.0 * x) * 0.25 * np.exp(-6 * x)
            + np.sin(2 * np.pi * f * 3.0 * x) * 0.10 * np.exp(-9 * x))
    att = hpf(noise(n), 3000) * 0.18 * np.exp(-60 * x)
    return (body * np.exp(-x / tau) + att) * np.minimum(x / 0.003, 1.0)


def kick(n):
    x = tsec(n / SR)
    f = 52 + 90 * np.exp(-22 * x)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-9 * x)
    return lpf(body, 160) * np.minimum(x / 0.002, 1.0)


def build_music(tl, dur, with_kick):
    n = int(round(dur * SR))
    energy, bright, arp_on, pulse_on, kick_on = zone_curves(tl, dur)
    mus = np.zeros(n)
    bar_len = int(BAR * SR)

    # pad
    for i in range(0, n, bar_len):
        m = min(bar_len, n - i)
        ch = PROG[(i // bar_len) % len(PROG)]
        seg = np.zeros(m)
        for j, f in enumerate(ch):
            seg += sine(f, m) * (0.24 - j * 0.05)
            seg += sine(f * 1.0025, m) * (0.12 - j * 0.03)
            seg += sine(f * 2.0, m) * 0.04
            seg += sine(f * 4.0, m) * 0.012
        a = np.minimum(np.linspace(0, 1, m) * 3.0, 1.0)
        seg *= a * np.minimum(np.linspace(1, 0, m) * 3.0 + 0.6, 1.0)
        mus[i:i + m] += seg

    # sub
    sub = np.zeros(n)
    for i in range(0, n, bar_len):
        m = min(bar_len, n - i)
        f = PROG[(i // bar_len) % len(PROG)][0] / 2
        sub[i:i + m] += sine(f, m) * 0.5 * np.minimum(np.linspace(0, 1, m) * 4, 1.0)
    mus += lpf(sub, 100) * 0.5

    # 16th-note pulse — the "network" of the bed; filtered so it sits under speech
    step16 = int(BEAT / 4 * SR)
    pl = np.zeros(n)
    pat = [1.0, 0.35, 0.6, 0.35, 0.8, 0.35, 0.6, 0.45]
    for k, i in enumerate(range(0, n, step16)):
        m = min(int(0.09 * SR), n - i)
        if m <= 0:
            break
        ch = PROG[(i // bar_len) % len(PROG)]
        f = ch[(k // 2) % 3] * 4
        pl[i:i + m] += pluck(f, m, tau=0.045) * pat[k % 8] * 0.5
    mus += hpf(pl, 700) * pulse_on * 0.34

    # arp — 8th notes, a fifth above the pad, the melodic layer
    step8 = int(BEAT / 2 * SR)
    ar = np.zeros(n)
    seq = [0, 2, 1, 2, 0, 1, 2, 1]
    for k, i in enumerate(range(0, n, step8)):
        m = min(int(0.7 * SR), n - i)
        if m <= 0:
            break
        ch = PROG[(i // bar_len) % len(PROG)]
        f = ch[seq[k % 8]] * (2 if k % 4 else 4)
        ar[i:i + m] += pluck(f, m, tau=0.32) * (0.34 if k % 2 == 0 else 0.22)
    mus += hpf(ar, 220) * arp_on * 0.55

    # kick — film only, soft, on 1 and 3
    if with_kick:
        kk = np.zeros(n)
        stepb = int(BEAT * SR)
        for k, i in enumerate(range(0, n, stepb)):
            if k % 2:
                continue
            m = min(int(0.35 * SR), n - i)
            if m <= 0:
                break
            kk[i:i + m] += kick(m) * 0.9
        mus += kk * kick_on * 0.42

    # hat tick on the off-beat, very quiet
    half = int(BEAT / 2 * SR)
    sh = np.zeros(n)
    for k, i in enumerate(range(0, n, half)):
        if k % 2 == 0:
            continue
        m = min(int(0.06 * SR), n - i)
        if m <= 0:
            break
        sh[i:i + m] += hpf(noise(m), 8000) * expd(m, 0.014) * 0.5
    mus += sh * pulse_on * 0.16

    mus += hpf(noise(n), 6500) * 0.03 * bright * 0.5

    mus *= energy
    mus = lpf_tv(mus, 1400 + 3200 * np.clip(bright, 0, 2))
    mus = speech_pocket(mus)
    mus = hpf(mus, 34)

    st = stereo(mus, width=0.36, pre=0.014)
    st = np.stack([verb(st[:, 0], mix=0.17), verb(st[:, 1], mix=0.17)], 1)

    env = np.ones(n)
    fi, fo = int(1.0 * SR), int(4.0 * SR)
    env[:fi] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, fi))
    env[-fo:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, fo))
    st *= env[:, None]
    return st


# ═════════════════════════════════════════════════════════════════ SFX ══
def band_pass_sweep(n, f_lo, f_hi, curve=1.0, blk=512):
    s = noise(n)
    out = np.zeros(n)
    p = np.linspace(0, 1, n) ** curve
    for i in range(0, n, blk):
        j = min(i + blk, n)
        fc = f_lo + (f_hi - f_lo) * p[i]
        out[i:j] = hpf(lpf(s[i:j], min(fc * 2.2, 19000)), fc)
    return out


def air_pass():
    d = 0.36; n = int(d * SR)
    s = band_pass_sweep(n, 1100, 4800, 1.2)
    return s * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.3 * 0.55


def slide_air():
    d = 0.5; n = int(d * SR); x = tsec(d)
    s = band_pass_sweep(n, 700, 8000, 0.8) * 0.7
    f = np.linspace(1800, 600, n)
    s += np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.18 * np.exp(-5.5 * x)
    return hpf(s * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.9, 500)


def gate_snap():
    d = 0.14; n = int(d * SR); x = tsec(d)
    s = hpf(noise(n), 3000) * 0.9
    g = np.where(x < 0.016, 1.0, np.exp(-95 * (x - 0.016)))
    s = s * g + (sine(2400, n) * 0.22 + sine(3600, n) * 0.12) * expd(n, 0.011)
    return hpf(s, 1500)


def impact_soft():
    d = 0.42; n = int(d * SR); x = tsec(d)
    f = np.linspace(100, 50, n)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-6.5 * x)
    click = hpf(noise(n), 4200) * 0.10 * np.exp(-70 * x)
    return lpf(body, 220) * 0.9 + click


def riser_short():
    d = 0.58; n = int(d * SR); x = tsec(d)
    s = band_pass_sweep(n, 800, 7000, 1.5) * 0.6
    f = np.linspace(330, 1320, n)
    s += np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.2
    s *= (x / d) ** 1.7
    s *= np.minimum((d - x) / 0.06, 1.0)
    return hpf(s, 400)


def chime_lift():
    d = 0.85; n = int(d * SR); x = tsec(d)
    s = np.zeros(n)
    for f, a, tau in ((1318.5, 0.34, 0.30), (1975.5, 0.26, 0.24), (2637.0, 0.14, 0.16), (3951.0, 0.08, 0.10), (5274.0, 0.05, 0.07)):
        s += a * np.sin(2 * np.pi * f * x) * np.exp(-x / tau)
    s += hpf(noise(n), 7000) * 0.05 * np.exp(-40 * x)
    return verb(hpf(s, 800), mix=0.26)


def tick_glass():
    d = 0.06; n = int(d * SR)
    s = sine(4800, n) * 0.40 + sine(7200, n) * 0.20 + sine(9600, n) * 0.08
    return hpf(s * expd(n, 0.011), 3000)


def count_blip():
    d = 0.05; n = int(d * SR)
    s = sine(5600, n) * 0.45 + sine(8400, n) * 0.16
    return hpf(s * expd(n, 0.009), 3500)


def net_lock():
    """An AVB stream locking — two quick rising tones then a settled third."""
    d = 0.42; n = int(d * SR); x = tsec(d)
    s = np.zeros(n)
    for k, (f, at) in enumerate(((1975.5, 0.0), (2637.0, 0.09), (3951.0, 0.18))):
        m = x >= at
        s[m] += 0.3 * np.sin(2 * np.pi * f * (x[m] - at)) * np.exp(-(x[m] - at) / (0.05 if k < 2 else 0.18))
    s += hpf(noise(n), 6000) * 0.04 * np.exp(-30 * x)
    return hpf(s, 1200)


def outro_bloom():
    d = 2.6; n = int(d * SR); x = tsec(d)
    s = np.zeros(n)
    for f, a in ((329.63, 0.30), (415.30, 0.22), (493.88, 0.20), (659.26, 0.12), (987.77, 0.06)):
        s += a * np.sin(2 * np.pi * f * x)
    s += hpf(noise(n), 5200) * 0.035
    env = np.minimum(x / 0.35, 1.0) * np.exp(-1.0 * np.maximum(x - 0.35, 0))
    return verb(hpf(s * env, 120), mix=0.34)


SOUNDS = {
    "air-pass": air_pass,
    "slide-air": slide_air,
    "gate-snap": gate_snap,
    "impact-soft": impact_soft,
    "riser-short": riser_short,
    "chime-lift": chime_lift,
    "tick-glass": tick_glass,
    "count-blip": count_blip,
    "net-lock": net_lock,
    "outro-bloom": outro_bloom,
}
RELATIVE = {
    "riser-short": 0.0,
    "chime-lift": -1.5,
    "outro-bloom": -2.0,
    "net-lock": -2.5,
    "slide-air": -3.0,
    "impact-soft": -3.5,
    "gate-snap": -4.0,
    "air-pass": -6.0,
    "tick-glass": -11.0,
    "count-blip": -13.0,
}


# ════════════════════════════════════════════════ LOUDNESS MASTERING ══
def _k_weight(x):
    """ITU-R BS.1770 K-weighting: a high-shelf then a high-pass, at 48 kHz."""
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
    a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return lfilter(b2, a2, lfilter(b1, a1, x))


def measure_lufs(path):
    """Integrated loudness (LUFS), BS.1770-4 with absolute and relative gating.

    The ffmpeg build in this container ships without the ebur128 filter, so the
    meter is implemented here directly: K-weighting per channel, 400 ms blocks
    at 75% overlap, -70 LUFS absolute gate, then a -10 LU relative gate.
    """
    with wave.open(path, "rb") as w:
        n, ch, sr = w.getnframes(), w.getnchannels(), w.getframerate()
        x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float64) / 32768.0
    x = x.reshape(-1, ch)
    if sr != SR:
        return None
    blk = int(0.4 * SR)
    hop = int(0.1 * SR)
    if len(x) < blk + hop:
        x = np.concatenate([x, np.zeros((blk + hop - len(x), ch))])
    kw = np.stack([_k_weight(x[:, c]) for c in range(ch)], 1)
    ms = []
    for i in range(0, len(kw) - blk + 1, hop):
        seg = kw[i:i + blk]
        ms.append(float(np.sum(np.mean(seg ** 2, axis=0))))
    ms = np.asarray(ms)
    lk = -0.691 + 10 * np.log10(np.maximum(ms, 1e-20))
    keep = lk > -70.0
    if not keep.any():
        return None
    rel = -0.691 + 10 * np.log10(np.mean(ms[keep])) - 10.0
    keep2 = keep & (lk > rel)
    if not keep2.any():
        return None
    return float(-0.691 + 10 * np.log10(np.mean(ms[keep2])))


def master_lufs(path, target=-23.0, ceiling_db=-1.0):
    cur = measure_lufs(path)
    if cur is None:
        print(f"    ! could not measure {os.path.basename(path)}")
        return None
    gain = target - cur
    with wave.open(path, "rb") as w:
        n, ch, sr = w.getnframes(), w.getnchannels(), w.getframerate()
        x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float64) / 32768.0
    x = x.reshape(-1, ch) * (10 ** (gain / 20))
    pk = np.abs(x).max()
    ceil = 10 ** (ceiling_db / 20)
    trimmed = 0.0
    if pk > ceil:
        trimmed = 20 * np.log10(ceil / pk)
        x *= ceil / pk
    with wave.open(path, "wb") as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
    final = measure_lufs(path)
    note = f"  (peak-limited {trimmed:+.1f} dB)" if trimmed else ""
    print(f"    {os.path.basename(path):22s} {cur:7.1f} -> {final:7.1f} LUFS{note}")
    return final


def to_mp3(wav, bitrate="192k"):
    mp3 = wav[:-4] + ".mp3"
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", wav, "-b:a", bitrate, mp3], check=True)
    return mp3


def silent_placeholder(path, dur):
    pcm = np.zeros((int(dur * 8000), 2), dtype="<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(8000)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    os.makedirs(SFX_OUT, exist_ok=True)
    for name, key, dur, kick_on in (("music-bed-reel", "reel", 90.0, False), ("music-bed-film", "film", 300.0, True)):
        print(f"{name}  {dur:.3f}s, continuous ...", flush=True)
        m = build_music(TL[key], dur, kick_on)
        p = os.path.join(OUT, name + ".wav")
        write_wav(p, m, peak_db=-15.5)
        master_lufs(p, target=-23.0)
        mp3 = to_mp3(p)
        print(f"  {os.path.basename(mp3)}  {os.path.getsize(mp3) / 1e6:5.1f} MB")

    print(f"\n{len(SOUNDS)} sfx cues ...", flush=True)
    for name, fn in SOUNDS.items():
        s = declick(np.asarray(fn(), dtype=np.float64))
        st = stereo(s, width=0.30, pre=0.006)
        dst = os.path.join(SFX_OUT, f"{name}.wav")
        write_wav(dst, st, peak_db=-3.0)
        master_lufs(dst, target=-23.0 + RELATIVE[name])

    silent_placeholder(os.path.join(OUT, "vo-reel.wav"), 90.0)
    silent_placeholder(os.path.join(OUT, "vo-film.wav"), 300.0)
    print("\n  vo-reel.wav / vo-film.wav — silent placeholders. Replace with the recorded takes.")
    print("done.")
