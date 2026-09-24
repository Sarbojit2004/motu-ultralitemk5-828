#!/usr/bin/env python3
"""Builds the film's music bed, transition layer and silent VO placeholder.

THE BED IS SYNTHESISED, NOT SAMPLED. The AVB series and the UltraLite-mk5 / 828
films did not license a track; they generated one — 96 BPM, a Cm / Ab / Eb / Bb
progression, a detuned saw pad over a sine sub, a sixteenth arpeggio that only
appears above an energy threshold, and a kit that drops out when the writing
needs room. That engine is reproduced here bar for bar, because the instruction
was to use the bed those films used, and the bed those films used is this
code. What changes is only the length and where the energy zones fall, both of
which are read from the chapter structure rather than typed.

THE TRANSITION CUES come from the palette cut for the Soundcraft Signature Plus
films, by instruction. Twenty-five single events plus a four-second outro bloom.

EVERYTHING IS MASTERED TO ONE REFERENCE (-23 LUFS, EBU R128) with each cue
trimmed relative to the bed, so every source plays at unity in the timeline. A
volume multiplier in the renderer would silently undo that.

Cues shorter than 400 ms cannot be measured by R128 — its gate needs a complete
window, so a 45 ms tick reads -70 LUFS however loud it is, and levelling against
that number drives it to full scale. Those are measured here instead, to
BS.1770: the K-weighting pair, then the loudest 400 ms window, zero-padded.

    python3 scripts/gen_audio.py
"""
import json, os, re, shutil, subprocess, wave
import numpy as np
from scipy.signal import lfilter

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.path.expanduser("~/bin/ffmpeg")
SFX_IN = os.path.join(ROOT, "public", "audio", "sfx")
OUT_PUB = os.path.join(ROOT, "public", "audio")
OUT_VO = os.path.join(ROOT, "public", "vo")
OUT_STEM = os.path.join(ROOT, "out")
for d in (OUT_PUB, OUT_VO, OUT_STEM):
    os.makedirs(d, exist_ok=True)

TL = json.load(open(os.path.join(ROOT, "scripts", "timeline.json")))
REFERENCE_LUFS = -23.0
rng = np.random.default_rng(206)

# ── primitives, carried over from the UltraLite/AVB engine ───────────────────
def t(n): return np.arange(n) / SR
def noise(n): return rng.standard_normal(n) * 0.5

def env(n, a, d, sl=0.6, r=0.0):
    e = np.ones(n)
    ai = min(int(a * SR), n); di = min(int(d * SR), max(0, n - ai)); ri = min(int(r * SR), n)
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if di: e[ai:ai + di] = np.linspace(1, sl, di)
    if ai + di < n: e[ai + di:] = sl
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e

def expd(n, tau): return np.exp(-t(n) / tau)

def _bq(fc, q, kind):
    """RBJ biquad. BOTH arrays are normalised by a0 — normalising only the
    numerator leaves the denominator unnormalised, which makes the filter
    unstable and blows the bed up to full scale."""
    w = 2 * np.pi * fc / SR; alpha = np.sin(w) / (2 * q); c = np.cos(w)
    if kind == "lp": b = np.array([(1 - c) / 2, 1 - c, (1 - c) / 2])
    else:            b = np.array([(1 + c) / 2, -(1 + c), (1 + c) / 2])
    a = np.array([1 + alpha, -2 * c, 1 - alpha])
    return b / a[0], a / a[0]

def lpf(x, fc, q=0.707): b, a = _bq(min(fc, SR / 2 - 100), q, "lp"); return lfilter(b, a, x)
def hpf(x, fc, q=0.707): b, a = _bq(min(fc, SR / 2 - 100), q, "hp"); return lfilter(b, a, x)

def saw(f, n, det=0.0):
    x = np.zeros(n)
    for d in (-det, 0.0, det):
        ph = np.cumsum(np.full(n, (f + d) / SR))
        x += 2 * (ph - np.floor(ph + 0.5))
    return x / 3

def sine(f, n): return np.sin(2 * np.pi * f * t(n))

def stereo(x, width=0.25, pre=0.012):
    d = int(pre * SR)
    y = np.zeros(len(x)); y[d:] = x[:len(x) - d]
    return np.stack([x + y * width, x - y * width], 1)

# ── the bed ──────────────────────────────────────────────────────────────────
BPM = 96.0
BEAT_S = 60 / BPM
BAR = BEAT_S * 4
PROG = [[130.81, 155.56, 196.00],   # Cm
        [103.83, 130.81, 155.56],   # Ab
        [155.56, 196.00, 233.08],   # Eb
        [116.54, 146.83, 174.61]]   # Bb
TRANSPOSE_RATIO = 2 ** (2 / 12)     # a whole step, at the midpoint

# energy / brightness / drums, per chapter id. Chosen against what the writing
# is doing there, not against a curve: the hook and the deployments drive, the
# spec chapters pull back so the numbers can be heard.
# Energy, bass weight and whether the kit plays, per chapter. The shape of the
# film in three numbers a chapter: open cold and unresolved, settle for the one
# that establishes what is shared, build through the two environments, drop for
# the preamplifier chapter so a quiet claim lands quietly, lift for playability,
# hold flat through the figures so the graphics carry it, and resolve.
ZONE = {
    "bottleneck": (0.94, 1.30, True),
    "standard":   (0.62, 1.04, False),
    "agile":      (0.80, 0.98, True),
    "anchor":     (0.90, 1.14, True),
    "gain":       (0.68, 0.90, True),
    "latency":    (0.88, 1.10, True),
    "numbers":    (0.74, 1.02, True),
    "choose":     (0.64, 1.20, False),
}

def zones_for(film):
    """(start, end, energy, brightness, drums) straight off the chapter list."""
    z = []
    for s in film["segments"]:
        e, b, d = ZONE[s["id"]]
        z.append((s["start"], s["end"] + TL["pacing"]["SEGMENT_GAP"], e, b, d))
    # the end screen: pull back and brighten, so the bloom has somewhere to land
    z.append((film["speechEnd"], film["total"], 0.55, 1.25, False))
    return z

def secval(z, ts, idx):
    for s, e, en, br, dr in z:
        if s <= ts < e:
            return (en, br, dr)[idx]
    return (z[-1][2], z[-1][3], z[-1][4])[idx]

def build_bed(film):
    dur = film["total"]
    N = int(dur * SR)
    z = zones_for(film)
    half = film["speechEnd"] / 2
    pad = np.zeros(N); bass = np.zeros(N); arp = np.zeros(N); drum = np.zeros(N)

    for b in range(int(dur / BAR) + 1):
        ts = b * BAR
        if ts >= dur: break
        ch = [f * (TRANSPOSE_RATIO if ts >= half else 1.0) for f in PROG[b % 4]]
        i0 = int(ts * SR)
        ln = min(int(BAR * SR) + int(0.4 * SR), N - i0)
        if ln <= 0: break
        en = secval(z, ts, 0); br = secval(z, ts, 1); drums_on = secval(z, ts, 2)

        pv = np.zeros(ln)
        for j, f in enumerate(ch):
            pv += saw(f, ln, det=1.0 + j * 0.7) * 0.33 + saw(f * 2, ln, det=0.5) * 0.10
        pv *= env(ln, 0.35, 0.2, sl=0.85, r=0.5)
        pad[i0:i0 + ln] += lpf(pv, 700 * br) * 0.30 * en

        for k in range(8):
            ts2 = ts + k * BEAT_S / 2
            if ts2 >= dur: break
            j0 = int(ts2 * SR); jl = min(int(BEAT_S * 0.46 * SR), N - j0)
            if jl <= 0: break
            amp = 1.0 if k % 2 == 0 else 0.55
            bass[j0:j0 + jl] += (sine(ch[0] / 2, jl) * 0.9 + sine(ch[0], jl) * 0.18) * expd(jl, 0.11) * amp * 0.42 * en

        if en > 0.62:
            seq = [0, 1, 2, 1, 2, 0, 1, 2, 0, 2, 1, 0, 2, 1, 0, 1]
            for k in range(16):
                ts2 = ts + k * BEAT_S / 4
                if ts2 >= dur: break
                j0 = int(ts2 * SR); jl = min(int(BEAT_S * 0.30 * SR), N - j0)
                if jl <= 0: break
                f = ch[seq[k]] * 4
                av = (np.sin(2 * np.pi * f * t(jl)) + 0.3 * np.sin(2 * np.pi * f * 2 * t(jl))) * expd(jl, 0.045)
                arp[j0:j0 + jl] += av * 0.10 * en * (0.7 if k % 2 else 1.0)

        if drums_on and en > 0.5:
            for k, hit in enumerate([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0]):
                if not hit: continue
                ts2 = ts + k * BEAT_S / 4
                if ts2 >= dur: break
                j0 = int(ts2 * SR); jl = min(int(0.22 * SR), N - j0)
                if jl <= 0: break
                fsw = 62 * np.exp(-t(jl) / 0.030) + 42
                kv = np.sin(2 * np.pi * np.cumsum(fsw) / SR) * expd(jl, 0.10) + noise(jl) * expd(jl, 0.004) * 0.30
                drum[j0:j0 + jl] += kv * 0.48 * en
            for k in (4, 12):
                ts2 = ts + k * BEAT_S / 4
                if ts2 >= dur: continue
                j0 = int(ts2 * SR); jl = min(int(0.20 * SR), N - j0)
                if jl <= 0: continue
                sv = hpf(noise(jl), 1900) * expd(jl, 0.055) + np.sin(2 * np.pi * 185 * t(jl)) * expd(jl, 0.035) * 0.35
                drum[j0:j0 + jl] += sv * 0.24 * en
            for k in range(1, 16, 2):
                ts2 = ts + k * BEAT_S / 4
                if ts2 >= dur: break
                j0 = int(ts2 * SR); jl = min(int(0.055 * SR), N - j0)
                if jl <= 0: break
                drum[j0:j0 + jl] += hpf(noise(jl), 7500) * expd(jl, 0.014) * 0.10 * en

    mus = stereo(pad, 0.55, 0.020) + stereo(arp, 0.40, 0.009) + np.stack([bass, bass], 1) + stereo(drum, 0.16, 0.004)

    # a riser into every chapter after the first
    for s in [seg["start"] for seg in film["segments"][1:]]:
        j0 = int((s - 2.2) * SR)
        if j0 < 0: continue
        jl = min(int(2.2 * SR), N - j0)
        if jl <= 0: continue
        sw = np.linspace(300, 3000, jl)
        rv = (hpf(noise(jl), 600) * 0.5 + np.sin(2 * np.pi * np.cumsum(sw) / SR) * 0.28) * np.linspace(0, 1, jl) ** 2.4
        mus[j0:j0 + jl] += np.stack([rv, rv], 1) * 0.15

    g = np.ones(N)
    g[:int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR))
    g[-int(4.0 * SR):] = np.linspace(1, 0, int(4.0 * SR))
    mus *= g[:, None]
    mus /= max(1e-9, np.abs(mus).max())
    return mus * 0.60

# ── measurement ──────────────────────────────────────────────────────────────
_K1_B = np.array([1.53512485958697, -2.69169618940638, 1.19839281085285])
_K1_A = np.array([1.0, -1.69065929318241, 0.73248077421585])
_K2_B = np.array([1.0, -2.0, 1.0])
_K2_A = np.array([1.0, -1.99004745483398, 0.99007225036621])

def momentary(x, window=0.4):
    """Loudest 400 ms of K-weighted loudness, in LUFS — works on a 45 ms tick."""
    if x.ndim == 1: x = x[:, None]
    n = int(window * SR)
    y = lfilter(_K2_B, _K2_A, lfilter(_K1_B, _K1_A, x, axis=0), axis=0)
    if len(y) < n: y = np.vstack([y, np.zeros((n - len(y), y.shape[1]))])
    e = (y ** 2).sum(1)
    cs = np.cumsum(np.concatenate([[0.0], e]))
    mean = (cs[n:] - cs[:-n]) / n
    return -0.691 + 10 * np.log10(max(mean.max(), 1e-12))

def read_wav(path):
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR),
                          "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype="<i2").astype(np.float64).reshape(-1, 2) / 32768.0

def write_wav(path, x):
    w = wave.open(path, "w"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()); w.close()

def lufs_of(path):
    p = subprocess.run([FF, "-hide_banner", "-i", path, "-af", "ebur128=peak=true",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", p)
    P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", p)
    return (float(I[-1]) if I else -70.0, float(P[-1]) if P else -70.0)

# ── the transition layer ─────────────────────────────────────────────────────
# Which cue fires where. A chapter turn gets a riser into it and an impact on
# it; a caption that closes a thought gets a light tick. Nothing fires on every
# caption — a cue on every line stops being punctuation and becomes a rhythm.
# The single hit that lands on each chapter's first frame, chosen for what the
# chapter is about rather than for variety: a deep impact under the problem, a
# lift under the chapter that settles what is shared, a whip into each of the
# two environments, a tight hit under the preamplifiers, a hard snap under
# latency, and air under the close.
CHAPTER_IMPACT = {
    "bottleneck": "impact-deep",
    "standard":   "chime-lift",
    "agile":      "whip-mid",
    "anchor":     "impact-full",
    "gain":       "impact-tight",
    "latency":    "snap-hard",
    "numbers":    "gate-snap",
    "choose":     "air-long",
}
BEAT_TICKS = ["tick-tiny", "tick-glass", "tick-hi", "blip-one", "count-blip"]

def plan_cues(film):
    cues = []
    for n, seg in enumerate(film["segments"]):
        if n:  # no riser into the cold open
            cues.append({"at": round(max(0.0, seg["start"] - 0.62), 4), "cue": "riser-short", "gain": 0.85})
        cues.append({"at": round(seg["start"], 4), "cue": CHAPTER_IMPACT[seg["id"]], "gain": 1.0})
        k = 0
        for c in seg["captions"]:
            if c["beat"] and c["i"] < len(seg["captions"]) - 1:
                cues.append({"at": round(c["end"], 4), "cue": BEAT_TICKS[k % len(BEAT_TICKS)], "gain": 0.55})
                k += 1
    cues.append({"at": round(film["speechEnd"] - 0.9, 4), "cue": "riser-sub", "gain": 0.9})
    cues.append({"at": round(film["speechEnd"], 4), "cue": "outro-bloom", "gain": 1.0})
    return sorted(cues, key=lambda c: c["at"])

# ── run ──────────────────────────────────────────────────────────────────────
# Cue levels are set RELATIVE to the bed's reference, so the palette keeps its
# internal balance: an impact is meant to be heard over the bed, a tick is meant
# to sit just under it.
CUE_REL = {"impact": +1.0, "riser": -2.0, "chime": -1.0, "whip": -1.5,
           "gate": 0.0, "snap": 0.0, "air": -3.0, "tick": -6.0,
           "blip": -6.0, "count": -6.0, "data": -5.0, "outro": -1.0}

def cue_target(name):
    return REFERENCE_LUFS + CUE_REL.get(name.split("-")[0], -2.0)

print("cue                target    measured   applied")
cue_audio = {}
for f in sorted(os.listdir(SFX_IN)):
    if not f.endswith(".wav"): continue
    name = f[:-4]
    x = read_wav(os.path.join(SFX_IN, f))
    m = momentary(x)
    tgt = cue_target(name)
    g = 10 ** ((tgt - m) / 20)
    peak = np.abs(x * g).max()
    if peak > 0.98:                      # never let a level decision clip
        g *= 0.98 / peak
    cue_audio[name] = x * g
    print(f"{name:<18} {tgt:7.1f}  {m:8.1f}  {20*np.log10(max(g,1e-9)):+8.1f} dB")

summary = {}
all_cues = {}
for key, base in (("video", "motu-ultralite828-explainer"),):
    film = TL[key]
    N = int(film["total"] * SR)

    bed = build_bed(film)
    bed_wav = os.path.join(OUT_STEM, base + "-music-bed.wav")
    write_wav(bed_wav, bed)
    I, _ = lufs_of(bed_wav)
    bed *= 10 ** ((REFERENCE_LUFS - I) / 20)
    pk = np.abs(bed).max()
    if pk > 0.95:                       # headroom for the cue layer on top
        bed *= 0.95 / pk
    write_wav(bed_wav, bed)

    cues = plan_cues(film)
    all_cues[key] = cues
    layer = np.zeros((N, 2))
    for c in cues:
        x = cue_audio[c["cue"]] * c["gain"]
        j0 = int(c["at"] * SR)
        jl = min(len(x), N - j0)
        if jl <= 0: continue
        layer[j0:j0 + jl] += x[:jl]
    pk = np.abs(layer).max()
    if pk > 0.98: layer *= 0.98 / pk
    cue_wav = os.path.join(OUT_STEM, base + "-transitions.wav")
    write_wav(cue_wav, layer)

    # deliverables: the bed as MP3, the cue layer as FLAC (mostly silence, so
    # lossless is SMALLER here, and it carries no encoder padding so it lines
    # up with the film sample for sample)
    bed_mp3 = os.path.join(OUT_STEM, base + "-music-bed.mp3")
    cue_flac = os.path.join(OUT_STEM, base + "-transitions.flac")
    subprocess.run([FF, "-v", "error", "-y", "-i", bed_wav, "-b:a", "256k", bed_mp3], check=True)
    subprocess.run([FF, "-v", "error", "-y", "-i", cue_wav, cue_flac], check=True)
    for d in (OUT_PUB,):
        subprocess.run([FF, "-v", "error", "-y", "-i", bed_wav, "-b:a", "256k",
                        os.path.join(d, f"music-bed-{key}.mp3")], check=True)
        # WAV in public/: the renderer reads it directly and it carries no
        # encoder padding, so it lines up with the film sample for sample.
        shutil.copyfile(cue_wav, os.path.join(d, f"transitions-{key}.wav"))

    # a silent VO slot at exactly the film's length — drop the recorded read in
    write_wav(os.path.join(OUT_VO, f"vo-{key}.wav"), np.zeros((N, 2)))

    bI, bP = lufs_of(bed_mp3)
    cI, cP = lufs_of(cue_flac)
    summary[key] = dict(total=film["total"], bed=(bI, bP), cues=(cI, cP), n=len(cues))
    os.remove(bed_wav); os.remove(cue_wav)

json.dump(all_cues, open(os.path.join(ROOT, "scripts", "cues.json"), "w"), indent=1)

print()
print("%-10s %9s %26s %28s" % ("film", "length", "music bed", "transitions"))
for k, v in summary.items():
    print("%-10s %8.2fs   %6.1f LUFS  peak %5.1f dBFS   %6.1f LUFS  peak %5.1f dBFS  %3d cues"
          % (k, v["total"], v["bed"][0], v["bed"][1], v["cues"][0], v["cues"][1], v["n"]))
