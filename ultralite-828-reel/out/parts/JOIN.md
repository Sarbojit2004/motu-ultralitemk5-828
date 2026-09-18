# Rejoining the 4K master

GitHub rejects files over 100 MB and git-lfs is not available here, so the
177 MB 4K master ships as stream-copied parts (no re-encode, no generation
loss) plus its untouched audio track. The rejoin takes the video from the parts
and the audio from that track, and the result is **byte-identical to the
master** — verified, not assumed: the video and audio elementary streams of the
rejoined file hash the same as the master's, and both carry 2,700 video packets.

```bash
cd ultralite-828-reel/out/parts
ffmpeg -f concat -safe 0 -i motu-ultralite-828-reel.concat.txt \
       -i motu-ultralite-828-reel-audio.mp4 \
       -map 0:v -map 1:a -c copy ../motu-ultralite-828-reel-4k.mp4
```

Each part also plays on its own, with its own audio, exactly in sync.

| Part | Covers | Frames |
|---|---|---|
| `motu-ultralite-828-reel-part0.mp4` | 0.000 – 25.933 s | 1 – 778 |
| `motu-ultralite-828-reel-part1.mp4` | 25.933 – 57.200 s | 779 – 1716 |
| `motu-ultralite-828-reel-part2.mp4` | 57.200 – 90.000 s | 1717 – 2700 |
