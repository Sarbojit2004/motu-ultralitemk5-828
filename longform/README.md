# MOTU UltraLite-mk5 & MOTU 828 — long-form video (598 s)

Light-background landscape long-form video, 1920×1080 at 30 fps, exactly
**17,940 frames**. Built with Remotion.

**Shivansh Electronics** — Authorized Distributor of MOTU (Mark of the Unicorn,
USA) Interfaces for East and North East India · www.shivanshelectronics.in

## Reproducing the render

```bash
npm install
npm run render          # -> out/motu-ultralite828-longform.mp4
npm run render:thumb    # -> out/thumbnail-motu-ultralite828-longform.png
npm run render:audio    # -> the two standalone audio deliverables
```

The project is self-contained: every image, clip, logo, font and both prebuilt
audio layers ship inside `public/`. Nothing is fetched at render time.

## What is in here

| Path | What it is |
|---|---|
| `src/schedule.json` | The single source of truth — 66 beats across 6 chapters. Drives the picture, both audio layers, the coverage audit and the VO script, so they cannot drift apart. |
| `src/Scenes.tsx` | The twenty scene layouts each beat maps to. |
| `src/components/Media.tsx` | Image treatment. `Plate` is where the never-cropped rule lives. |
| `src/theme.ts` | Design tokens, pulled from the approved MOTU AVB ecosystem branches. |
| `public/img/` | All 69 real product photographs, index-named `i01`…`i69`. |
| `public/clip/` | The 9 unique representational clips, de-watermarked. |
| `public/audio/` | The built music bed and SFX timeline, plus the 7-cue SFX palette. |

## Verification

```bash
npm run typecheck   # TypeScript
npm run coverage    # every real image has a confirmed placement
npm run branding    # timestamped branding cadence + gap check
npm run qa          # one still per beat, into out/qa/
node scripts/qa-stills.mjs --resolve   # proves each camera move resolves to the whole unit
```

## The two asset layers

They are governed by **different** rules and are tracked separately throughout:

- **Real photography (69 images)** — compulsory coverage. Never permanently
  cropped, clipped or trimmed: every placement shows the complete unit fully and
  legibly at some point in its screen time. `Plate` enforces this, and
  `--resolve` proves it for every camera move.
- **Representational footage (9 clips)** — discretionary and editorially free:
  trimmed, speed-ramped, re-framed, cropped and muted as each beat requires, and
  never checked against the completeness rule above.
