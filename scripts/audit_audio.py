#!/usr/bin/env python3
"""Isolated audio-pipeline validator for the long-form video.

Per the brief's Section 1: SFX correctness is a first-class deliverable,
verified with the same rigor as the video render — not "the script ran
without error." This checks every generated file:

  1. exists on disk and is non-trivially sized
  2. decodes cleanly via ffprobe (real codec/stream info, not a corrupt file)
  3. has the expected channel count / sample rate
  4. duration is sane for what it's supposed to be
  5. is not silent (RMS floor) and not just DC/clipped (peak ceiling)

Must be run — and must fully pass — before any scene code (sfx.ts cue
table) references a clip by name.

    python3 scripts/audit_audio.py
"""
import json
import os
import subprocess
import sys
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(ROOT, "public/audio/lf")
MUSIC = os.path.join(ROOT, "public/audio/lf/music-bed-longform.mp3")
VO = os.path.join(ROOT, "public/vo/voiceover-longform-ultralite-828.mp3")

EXPECTED_SFX = [
    "bell-soft", "chime-final", "chime-soft", "click-deep", "click-soft",
    "click-ui", "drop-heavy", "glitch", "impact-deep", "impact-hollow",
    "impact-light", "impact-mid", "page-turn", "riser", "riser-long",
    "riser-short", "shimmer", "shimmer-bright", "stinger-chapter",
    "sub-drop", "swell", "swell-dark", "tick", "tick-double",
    "transition-blip", "whoosh-air", "whoosh-bright", "whoosh-low",
    "whoosh-metal", "whoosh-rev", "whoosh-soft", "whoosh-swoop",
]

MIN_DUR = 0.15   # shortest legitimate SFX clip
MAX_DUR = 4.0    # longest legitimate SFX clip
SILENCE_FLOOR_DBFS = -55.0   # below this RMS, treat as effectively silent
CLIP_CEILING_DBFS = -0.1     # at/above this peak, treat as clipped


def ffprobe(path):
    out = subprocess.run(
        ["npx", "remotion", "ffprobe", "-v", "error", "-print_format", "json",
         "-show_format", "-show_streams", path],
        cwd=ROOT, capture_output=True, text=True, timeout=30,
    )
    if out.returncode != 0:
        return None, out.stderr.strip()
    try:
        return json.loads(out.stdout), None
    except json.JSONDecodeError as e:
        return None, f"unparseable ffprobe output: {e}"


def decode_levels(path):
    """Decode to a temp WAV and measure RMS/peak in dBFS."""
    tmp = "/tmp/claude-0/-home-user-motu-ultralitemk5-828/56858eaf-896a-579f-aa19-f4d8595fd900/_audit.wav"
    r = subprocess.run(
        ["npx", "remotion", "ffmpeg", "-v", "error", "-y", "-i", path,
         "-f", "wav", "-acodec", "pcm_s16le", tmp],
        cwd=ROOT, capture_output=True, text=True, timeout=30,
    )
    if r.returncode != 0:
        return None, None, r.stderr.strip()
    with wave.open(tmp, "rb") as w:
        raw = w.readframes(w.getnframes())
        ch = w.getnchannels()
    a = np.frombuffer(raw, dtype="<i2").astype(np.float64) / 32768.0
    if len(a) == 0:
        return None, None, "zero decoded samples"
    rms = float(np.sqrt((a ** 2).mean()))
    peak = float(np.abs(a).max())
    rms_db = 20 * np.log10(rms + 1e-12)
    peak_db = 20 * np.log10(peak + 1e-12)
    return rms_db, peak_db, None


def check_file(path, label, *, expect_channels=2, expect_rate=48000,
               dur_range=None, allow_silent=False):
    row = {"file": label, "ok": True, "notes": []}
    if not os.path.isfile(path):
        row["ok"] = False
        row["notes"].append("MISSING")
        return row
    size = os.path.getsize(path)
    if size < 500:
        row["ok"] = False
        row["notes"].append(f"suspiciously small ({size}B)")

    meta, err = ffprobe(path)
    if err or meta is None:
        row["ok"] = False
        row["notes"].append(f"ffprobe failed: {err}")
        return row
    streams = [s for s in meta.get("streams", []) if s.get("codec_type") == "audio"]
    if not streams:
        row["ok"] = False
        row["notes"].append("no audio stream")
        return row
    s = streams[0]
    ch = int(s.get("channels", 0))
    rate = int(s.get("sample_rate", 0))
    dur = float(meta.get("format", {}).get("duration", s.get("duration", 0)) or 0)
    row["duration"] = round(dur, 3)
    row["channels"] = ch
    row["rate"] = rate
    row["size_kb"] = size // 1024

    if ch != expect_channels:
        row["ok"] = False
        row["notes"].append(f"channels={ch} expected {expect_channels}")
    if rate != expect_rate:
        row["ok"] = False
        row["notes"].append(f"rate={rate} expected {expect_rate}")
    if dur_range and not (dur_range[0] <= dur <= dur_range[1]):
        row["ok"] = False
        row["notes"].append(f"duration={dur:.3f}s outside [{dur_range[0]},{dur_range[1]}]")

    rms_db, peak_db, derr = decode_levels(path)
    if derr:
        row["ok"] = False
        row["notes"].append(f"decode failed: {derr}")
        return row
    row["rms_dbfs"] = round(rms_db, 1)
    row["peak_dbfs"] = round(peak_db, 1)
    if not allow_silent and rms_db < SILENCE_FLOOR_DBFS:
        row["ok"] = False
        row["notes"].append(f"effectively silent (RMS {rms_db:.1f} dBFS)")
    if peak_db >= CLIP_CEILING_DBFS:
        row["ok"] = False
        row["notes"].append(f"clipped (peak {peak_db:.1f} dBFS)")
    return row


def main():
    rows = []

    for name in EXPECTED_SFX:
        p = os.path.join(AUDIO_DIR, f"{name}.mp3")
        rows.append(check_file(p, f"sfx/{name}.mp3", dur_range=(MIN_DUR, MAX_DUR)))

    on_disk = {f[:-4] for f in os.listdir(AUDIO_DIR) if f.endswith(".mp3") and f != "music-bed-longform.mp3"}
    extra = on_disk - set(EXPECTED_SFX)
    for name in sorted(extra):
        rows.append({"file": f"sfx/{name}.mp3 (UNEXPECTED)", "ok": False, "notes": ["not in expected manifest"]})

    rows.append(check_file(MUSIC, "music-bed-longform.mp3", dur_range=(598.0, 602.0)))
    rows.append(check_file(VO, "voiceover-longform-ultralite-828.mp3", dur_range=(598.0, 602.0), allow_silent=True))

    width = max(len(r["file"]) for r in rows) + 2
    n_ok = sum(r["ok"] for r in rows)
    print(f"{'FILE':{width}} {'OK':4} {'DUR(s)':8} {'CH':3} {'RATE':6} {'RMS':7} {'PEAK':7} NOTES")
    for r in rows:
        mark = "PASS" if r["ok"] else "FAIL"
        print(
            f"{r['file']:{width}} {mark:4} "
            f"{r.get('duration', '-'):>8} {r.get('channels', '-'):>3} {r.get('rate', '-'):>6} "
            f"{r.get('rms_dbfs', '-'):>7} {r.get('peak_dbfs', '-'):>7} "
            f"{'; '.join(r['notes'])}"
        )

    print()
    print(f"{n_ok}/{len(rows)} files passed  ({len(EXPECTED_SFX)} expected SFX + music bed + VO placeholder)")
    if n_ok != len(rows):
        print("AUDIO PIPELINE VALIDATION: FAIL — fix before writing any scene code that references these cues")
        sys.exit(1)
    print("AUDIO PIPELINE VALIDATION: PASS")


if __name__ == "__main__":
    main()
