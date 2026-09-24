#!/usr/bin/env python3
"""Attaches the mastered mix to a finished silent render.

WHY THE RENDER IS SILENT. The chunks are rendered video-only and joined by
stream copy; chunks that each carried their own audio segment would risk drift
at every join. The mix is built here instead, once, as a single continuous
track with no joins in it at all, and muxed on with the picture COPIED rather
than re-encoded — so this step costs seconds and cannot touch a pixel.

The stems are summed at unity. They were levelled against each other in
gen_audio.py; a gain here would silently undo that.

    python3 scripts/mux.py reel
    python3 scripts/mux.py video
"""
import os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FF = os.path.expanduser("~/bin/ffmpeg")
KEY = sys.argv[1] if len(sys.argv) > 1 else "reel"
BASE = {"video": "motu-ultralite828-explainer"}[KEY]

silent = os.path.join(ROOT, "out", f"{BASE}-silent.mp4")
final = os.path.join(ROOT, "out", f"{BASE}.mp4")
bed = os.path.join(ROOT, "public", "audio", f"music-bed-{KEY}.mp3")
cues = os.path.join(ROOT, "public", "audio", f"transitions-{KEY}.wav")
vo = os.path.join(ROOT, "public", "vo", f"vo-{KEY}.wav")

for p in (silent, bed, cues, vo):
    if not os.path.exists(p):
        sys.exit(f"missing: {p}")

subprocess.run([
    FF, "-v", "error", "-y",
    "-i", silent, "-i", bed, "-i", cues, "-i", vo,
    "-filter_complex", "[1:a][2:a][3:a]amix=inputs=3:duration=first:normalize=0[a]",
    "-map", "0:v", "-map", "[a]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
    "-movflags", "+faststart", final,
], check=True)


def probe(p):
    s = subprocess.run([FF, "-hide_banner", "-i", p], capture_output=True, text=True).stderr
    d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", s)
    v = re.search(r"Video: (\w+).*?(\d{3,5})x(\d{3,5}).*?(\d+(?:\.\d+)?) fps", s, re.S)
    l = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", l)
    P = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", l)
    secs = int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3)) if d else 0
    return secs, (v.group(2), v.group(3), v.group(4), v.group(1)) if v else None, \
        (float(I[-1]) if I else None), (float(P[-1]) if P else None)


secs, vid, I, P = probe(final)
mb = os.path.getsize(final) / 1e6
print(f"{os.path.basename(final)}")
print(f"  {vid[0]}x{vid[1]}  {vid[3]}  {vid[2]} fps  {secs:.2f}s  {mb:.1f} MB")
print(f"  audio  {I:.1f} LUFS integrated   peak {P:.1f} dBFS")
