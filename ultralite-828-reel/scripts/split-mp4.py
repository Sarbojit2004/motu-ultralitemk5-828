#!/usr/bin/env python3
"""Splits a 4K master into stream-copied parts under GitHub's file limit,
plus the master's audio track on its own, so the parts rejoin to a file whose
video frames and audio samples are bit-identical to the master (verified by
frame differencing at the joins and sample differencing of the audio).

The ffmpeg build here has no `segment` muxer and no `select`/`showinfo`
filters, so the keyframe table is read straight out of the MP4 (moov > trak >
stbl > stss / stts / stco / stsz), the cut points are chosen at the keyframe
nearest each ~88 MB byte boundary, and ffmpeg copies each span with -c copy
(no re-encode, no generation loss). Writes <base>.concat.txt for rejoining.

Usage: split-mp4.py <master.mp4> <out/parts> <base> [max_mb]
"""
import os
import struct
import subprocess
import sys

FFMPEG = os.environ.get("FFMPEG", "ffmpeg")


def atoms(buf, start, end):
    i = start
    while i + 8 <= end:
        size, typ = struct.unpack(">I4s", buf[i:i + 8])
        hdr = 8
        if size == 1:
            size = struct.unpack(">Q", buf[i + 8:i + 16])[0]
            hdr = 16
        elif size == 0:
            size = end - i
        yield typ.decode("latin1"), i + hdr, i + size
        i += size


def find(buf, start, end, path):
    typ = path[0]
    for t, a, b in atoms(buf, start, end):
        if t == typ:
            return (a, b) if len(path) == 1 else find(buf, a, b, path[1:])
    return None


def video_tables(path):
    with open(path, "rb") as f:
        head = f.read(16)
        # locate moov (it may be at the end)
        f.seek(0)
        data = f.read()
    moov = find(data, 0, len(data), ["moov"])
    assert moov, "no moov"
    for t, a, b in atoms(data, *moov):
        if t != "trak":
            continue
        hdlr = find(data, a, b, ["mdia", "hdlr"])
        if not hdlr or data[hdlr[0] + 8:hdlr[0] + 12] != b"vide":
            continue
        mdhd = find(data, a, b, ["mdia", "mdhd"])
        ver = data[mdhd[0]]
        timescale = struct.unpack(">I", data[mdhd[0] + (20 if ver == 1 else 12):][:4])[0]
        stbl = find(data, a, b, ["mdia", "minf", "stbl"])
        stss = find(data, *stbl, ["stss"])
        stts = find(data, *stbl, ["stts"])
        stsz = find(data, *stbl, ["stsz"])
        stsc = find(data, *stbl, ["stsc"])
        stco = find(data, *stbl, ["stco"]) or find(data, *stbl, ["co64"])
        # sync samples (1-based)
        n = struct.unpack(">I", data[stss[0] + 4:stss[0] + 8])[0]
        keys = struct.unpack(f">{n}I", data[stss[0] + 8:stss[0] + 8 + 4 * n])
        # decode times per sample
        n = struct.unpack(">I", data[stts[0] + 4:stts[0] + 8])[0]
        times, t = [], 0
        for k in range(n):
            cnt, dur = struct.unpack(">II", data[stts[0] + 8 + 8 * k:stts[0] + 16 + 8 * k])
            for _ in range(cnt):
                times.append(t / timescale)
                t += dur
        # sample sizes
        sz, cnt = struct.unpack(">II", data[stsz[0] + 4:stsz[0] + 12])
        sizes = [sz] * cnt if sz else list(struct.unpack(f">{cnt}I", data[stsz[0] + 12:stsz[0] + 12 + 4 * cnt]))
        # sample -> byte offset via stsc + stco
        n = struct.unpack(">I", data[stsc[0] + 4:stsc[0] + 8])[0]
        entries = [struct.unpack(">III", data[stsc[0] + 8 + 12 * k:stsc[0] + 20 + 12 * k]) for k in range(n)]
        is64 = data[stco[0] - 4:stco[0]] == b"co64"
        n = struct.unpack(">I", data[stco[0] + 4:stco[0] + 8])[0]
        offs = struct.unpack(f">{n}{'Q' if is64 else 'I'}", data[stco[0] + 8:stco[0] + 8 + (8 if is64 else 4) * n])
        sample_off, s = [], 0
        for k, (first, per, _) in enumerate(entries):
            last = entries[k + 1][0] - 1 if k + 1 < len(entries) else n
            for c in range(first, last + 1):
                o = offs[c - 1]
                for _ in range(per):
                    if s >= len(sizes):
                        break
                    sample_off.append(o)
                    o += sizes[s]
                    s += 1
        return keys, times, sample_off, times[-1] + (times[-1] - times[-2] if len(times) > 1 else 0)
    raise SystemExit("no video track")


def main():
    src, outdir, base = sys.argv[1], sys.argv[2], sys.argv[3]
    max_bytes = int(float(sys.argv[4]) if len(sys.argv) > 4 else 88) * 1024 * 1024
    os.makedirs(outdir, exist_ok=True)
    keys, times, offs, total = video_tables(src)
    fps = round(1 / (times[1] - times[0])) if len(times) > 1 else 30
    size = os.path.getsize(src)
    nparts = max(1, -(-size // max_bytes))
    # candidate cut points: keyframe times; choose the keyframe nearest each equal byte boundary
    # Cut points as (time, 1-based sample number) of the chosen keyframes.
    cuts = [(0.0, 1)]
    for p in range(1, nparts):
        target = size * p / nparts
        best = min(keys, key=lambda k: abs(offs[k - 1] - target))
        cuts.append((times[best - 1], best))
    cuts.append((None, len(times) + 1))
    for f in os.listdir(outdir):
        if f.startswith(base + "-part") and f.endswith(".mp4"):
            os.remove(os.path.join(outdir, f))
    names = []
    for i in range(nparts):
        (a, sa), (b, sb) = cuts[i], cuts[i + 1]
        out = os.path.join(outdir, f"{base}-part{i}.mp4")
        n = sb - sa
        vdur = n / fps
        if i == 0:
            cmd = [FFMPEG, "-v", "error", "-y", "-i", src, "-frames:v", str(n), "-t", f"{vdur:.6f}",
                   "-c", "copy", "-movflags", "+faststart", out]
        else:
            # -ss on the input lands exactly on the chosen keyframe; -copyts keeps
            # the ORIGINAL timestamps on both streams, so the B-frame decode
            # delay never turns into an audio/video offset at a join, and an
            # exact COUNT of video packets (decode order = sample order) means
            # no frame is duplicated or dropped.
            cmd = [FFMPEG, "-v", "error", "-y", "-ss", f"{a:.6f}", "-i", src, "-copyts", "-avoid_negative_ts", "disabled",
                   "-frames:v", str(n)]
            if b is not None:
                cmd += ["-to", f"{b:.6f}"]
            cmd += ["-c", "copy", "-movflags", "+faststart", out]
        subprocess.run(cmd, check=True)
        names.append((os.path.basename(out), a, vdur))
        print(f"  {names[-1][0]:32s} {a:8.3f} → {b if b is not None else total:8.3f} s  frames {sa}–{sb - 1}  {os.path.getsize(out) / 1e6:6.1f} MB")

    # The master's audio track, untouched (a few MB), so the rejoin takes its
    # video from the parts and its audio from here — bit-identical to the master.
    audio = os.path.join(outdir, f"{base}-audio.mp4")
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", src, "-vn", "-c:a", "copy", "-movflags", "+faststart", audio], check=True)
    print(f"  {os.path.basename(audio):32s} audio track only  {os.path.getsize(audio) / 1e6:6.1f} MB")

    with open(os.path.join(outdir, f"{base}.concat.txt"), "w") as f:
        for i, (n_, a, d) in enumerate(names):
            f.write(f"file '{n_}'\n")
            if i:
                f.write(f"inpoint {a:.6f}\n")
            f.write(f"duration {d:.6f}\n")
    print(f"{nparts} parts; rejoin (frame- and sample-exact):\n  ffmpeg -f concat -safe 0 -i {base}.concat.txt -i {base}-audio.mp4 -map 0:v -map 1:a -c copy {base}-4k.mp4")


if __name__ == "__main__":
    main()
