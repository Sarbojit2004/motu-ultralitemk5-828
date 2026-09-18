#!/usr/bin/env python3
"""Writes the separated audio deliverables, exactly the length of each film:

  out/audio/motu-avb-<film>-music-bed.wav        the continuous bed, music only
  out/audio/motu-avb-<film>-transition-sfx.wav   every SFX cue at its exact frame,
                                                 music fully silent

Both are 48 kHz / 16-bit stereo, start at frame 0 and run to the last frame,
so they drop onto a timeline with no offset. Every cue is the same mastered
file the render embeds (public/audio/sfx/*.wav) placed at the time the cue
sheet in out/audio/motu-avb-<film>-sfx-plan.json gives — the same sheet
Film.tsx renders from. Run after scripts/sfx-plan.mjs and gen_audio.py.
"""
import json
import os
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HERE)
AUD = os.path.join(PROJ, "public", "audio")
OUT = os.path.join(PROJ, "out", "audio")
SR = 48000


def read_wav(path):
    with wave.open(path, "rb") as w:
        n, ch, sr, sw = w.getnframes(), w.getnchannels(), w.getframerate(), w.getsampwidth()
        assert sw == 2 and sr == SR, (path, sr, sw)
        x = np.frombuffer(w.readframes(n), dtype="<i2").astype(np.float64) / 32768.0
    x = x.reshape(-1, ch)
    return x if ch == 2 else np.repeat(x, 2, axis=1)


def write_wav(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def exact(x, seconds):
    n = int(round(seconds * SR))
    if len(x) >= n:
        return x[:n]
    return np.concatenate([x, np.zeros((n - len(x), 2))])


os.makedirs(OUT, exist_ok=True)
cues = {}
for name in os.listdir(os.path.join(AUD, "sfx")):
    if name.endswith(".wav"):
        cues[name[:-4]] = read_wav(os.path.join(AUD, "sfx", name))

for film in ("reel", "film"):
    plan = json.load(open(os.path.join(OUT, f"motu-avb-{film}-sfx-plan.json")))
    n = int(round(plan["runtime"] * SR))

    sfx = np.zeros((n, 2))
    for c in plan["cues"]:
        s = cues[c["cue"]]
        i = int(round(c["at"] * SR))
        j = min(n, i + len(s))
        if j > i:
            sfx[i:j] += s[: j - i]
    peak = np.abs(sfx).max()
    if peak > 0.98:  # overlapping cues can sum past full scale; guard, never clip
        sfx *= 0.98 / peak
    p = os.path.join(OUT, f"motu-avb-{film}-transition-sfx.wav")
    write_wav(p, sfx)
    print(f"{os.path.basename(p):40s} {plan['runtime']:.3f} s  {len(plan['cues'])} cues  {os.path.getsize(p)/1e6:5.1f} MB")

    bed = exact(read_wav(os.path.join(AUD, f"music-bed-{film}.wav")), plan["runtime"])
    p = os.path.join(OUT, f"motu-avb-{film}-music-bed.wav")
    write_wav(p, bed)
    print(f"{os.path.basename(p):40s} {plan['runtime']:.3f} s  bed only    {os.path.getsize(p)/1e6:5.1f} MB")
