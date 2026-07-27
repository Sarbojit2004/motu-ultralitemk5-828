# MOTU UltraLite-mk5 & 828 — Long-Form Video (~10 min)

Remotion project for a ~600-second landscape companion video to the 178-second
reel in this same repository. Same two products, same Shivansh Electronics
branding, built as a **separate Remotion composition** (`LongForm`) alongside
the existing `Reel` composition — nothing here modifies the reel.

**Deliverable:** `out/motu-longform-ultralite-828.mp4` — 1920×1080 · 30 fps ·
18,000 frames · 600.000 s exactly.

---

## Reproducing the render on your own machine

This is the safety-net path if a render is lost to a session/usage limit.

```bash
# 1. Unzip the project (or clone the repo) and enter it
cd motu-ultralite-828-longform

# 2. Install dependencies (Node 18+ recommended)
npm install

# 3. Typecheck + bundle check (optional, but confirms the environment is sound)
npm run typecheck
npx remotion bundle

# 4. Render the long-form video
npm run render
# equivalent to:
#   npx remotion render LongForm out/motu-longform-ultralite-828.mp4 \
#     --codec=h264 --crf=18 --pixel-format=yuv420p

# (the original reel composition still renders too, if wanted:)
npm run render:reel
```

The render takes roughly 20–40 minutes depending on CPU, since it's a
600-second 1080p video with continuous Ken Burns motion and layered text
across 45 scenes. If your machine struggles with a single pass, render in
chunks and concatenate (this is exactly how the delivered MP4 was produced):

```bash
npx remotion render LongForm out/part1.mp4 --frames=0-3599      --codec=h264 --crf=18 --pixel-format=yuv420p
npx remotion render LongForm out/part2.mp4 --frames=3600-7199   --codec=h264 --crf=18 --pixel-format=yuv420p
npx remotion render LongForm out/part3.mp4 --frames=7200-10799  --codec=h264 --crf=18 --pixel-format=yuv420p
npx remotion render LongForm out/part4.mp4 --frames=10800-14399 --codec=h264 --crf=18 --pixel-format=yuv420p
npx remotion render LongForm out/part5.mp4 --frames=14400-17999 --codec=h264 --crf=18 --pixel-format=yuv420p

printf "file 'part1.mp4'\nfile 'part2.mp4'\nfile 'part3.mp4'\nfile 'part4.mp4'\nfile 'part5.mp4'\n" > out/concat.txt
npx remotion ffmpeg -f concat -safe 0 -i out/concat.txt -c copy out/motu-longform-ultralite-828.mp4
```

---

## What's in this project

- `src/LFReel.tsx` / `src/Root.tsx` — the `LongForm` composition entry point.
- `src/lib/lf-theme.ts` — the 45-scene timing table (single source of truth;
  durations sum to exactly 18,000 frames).
- `src/lib/lf-sfx.ts` — the audio cue table (32 SFX clips, round-robin
  assigned so transitions don't repeat).
- `src/scenes/lf/` — one file per chapter (`ColdOpen`, `Hook`, `UltraLite`,
  `E828`, `Comparison`, `Outro`) plus `registry.ts` wiring them to the
  timing table.
- `src/components/lf/` — landscape-specific building blocks: `LFFrame`
  (caption-box exclusion zone), `BeatCycle` (the data-driven multi-beat
  scene templates), `LogoCard`, `PriceCard`, `LFHead`, `LFBrandBar`.
- `src/components/{Photo,Type,Bits}.tsx`, `src/lib/{anim,theme,copy}.ts` —
  shared with the reel; reused as-is (see Section A of the build brief).
- `public/img/` — the 69 product/context images (shared with the reel).
- `public/logo/` — MOTU and Shivansh Electronics logos (used here; excluded
  from the reel by that project's own brief).
- `public/audio/lf/` — the long-form's own 600 s music bed + 32 SFX clips.
- `public/vo/voiceover-longform-ultralite-828.mp3` — silent 600 s placeholder
  for narration (see `VO_SCRIPT_LONGFORM_ULTRALITE_828.md`).
- `scripts/gen_audio_longform.py` — regenerates the music bed + SFX from
  scratch (numpy/scipy synthesis, no external samples).
- `scripts/audit_audio.py` — the isolated audio-pipeline validator; run it
  any time the audio is regenerated.
- `scripts/lf_stills.mjs` — renders arbitrary frames of `LongForm` to PNG
  for still-frame review.

## Validation already performed

- `npm run typecheck` — clean.
- `npx remotion bundle` — clean.
- Audio pipeline: 32/32 SFX + music bed + VO placeholder individually
  verified (exists, decodes, correct duration/rate, not silent, not
  clipped) via `scripts/audit_audio.py`.
- Every one of the 45 scenes rendered as a still and checked for: caption-band
  violations, text/image overlap, and legibility, with fixes applied and
  re-verified where issues were found.
- A range test (frames 2200–2700, spanning two scene transitions) rendered
  and audio-verified: no silent windows, safe peak levels, real variation
  confirming both music and SFX are present and mixed correctly.
