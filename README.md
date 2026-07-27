# MOTU UltraLite-mk5 & MOTU 828 — 178-Second Reel

Remotion project for a vertical 9:16 product reel covering the **MOTU UltraLite-mk5**
and the **MOTU 828**, produced for **Shivansh Electronics** — authorized distributor of
MOTU (Mark of the Unicorn, USA) for East & North-East India.

**Deliverable:** [`out/motu-ultralite-828-reel.mp4`](out/motu-ultralite-828-reel.mp4)
· 1080×1920 · 30 fps · 5340 frames · 178.000 s · h264 + AAC stereo

---

## The central-square constraint

The canvas is 1080×1920, but **all** video content is confined to a 1080×1080 square at
`y = 420 … 1500`.

```
y=0     ┌──────────────┐
        │ background   │  top strip — static ambient gradient, no content ever
y=420   ├──────────────┤
        │              │
        │  CONTENT     │  the only region carrying imagery, text, motion
        │  1080×1080   │
        │              │
y=1500  ├──────────────┤
        │ background   │  bottom strip — static ambient gradient, no content ever
y=1920  └──────────────┘
```

`src/components/Frame.tsx` enforces this structurally: `<Square>` is an
`overflow: hidden` box at exactly that rect, so nothing — including shadows, glows or
anything mid-animation — can reach the strips. `<Strips>` paints the full frame
underneath and is **completely static**: identical pixels for all 5340 frames.

`scripts/check_square.py` proves it automatically. It hashes the top and bottom strip of
every rendered still; all hashes must be identical across frames. Any leaked content or
motion would change those pixels on some frame.

---

## Structure

| Act | Time | Scenes | Content |
|---|---|---|---|
| 0 — Hook | 0:00–0:14 | S01–S02 | Strobe montage, both products named, distributor line |
| 1 — Shared thread | 0:14–0:34 | S03–S06 | CueMix 5 as the one deliberate commonality |
| 2 — UltraLite-mk5 | 0:34–1:24 | S07–S14 | Portability, panels, guitar/DI, iPad, 2.4 ms, standalone |
| 3 — 828 | 1:24–2:22 | S15–S23 | 1U rack, RGB LCD, talkback/monitoring, loopback, bundle |
| 4 — Together | 2:22–2:40 | S24–S25 | Spec comparison, use-case split, both on screen |
| 5 — Price & CTA | 2:40–2:58 | S26–S27 | Pricing cards, full contact wall |

The two products are given **deliberately non-mirrored** treatments. The mk5 act covers
portability, the rack-ear kit, guitar/stage use and iPad-as-mixer; the 828 act covers
loopback/streaming, talkback and A/B monitor control, insert loops, dual optical banks
and the bundled software. Neither subject appears in the other's act.

`src/lib/theme.ts` holds the scene table — the single source of truth for timing. Its
durations sum to exactly 5340 frames.

---

## Assets

- **69 product images**, all featured. Source files were renamed and downscaled into
  `public/img/`; `src/lib/images.ts` exposes them as a typed union.
- **The two logo files are deliberately unused.** Brand presence is entirely
  typographic — logos are added by hand afterwards.
- **Audio** is synthesised procedurally (`music-bed.mp3` + 14 SFX) and encoded with
  Remotion's bundled ffmpeg. `public/vo/voiceover-reel-ultralite-828.mp3` is a silent
  178 s placeholder for the narration.
- **Fonts** (Barlow Condensed / Inter / JetBrains Mono) are vendored into
  `public/fonts/` so a 5340-frame render never depends on a network fetch.

---

## Commands

```bash
npm install
npm run typecheck                       # tsc --noEmit
npx remotion studio                     # preview
npx remotion bundle                     # bundler check

# still-frame validation + automated central-square guard
node scripts/stills.mjs <outdir> 100 500 900
python3 scripts/check_square.py <outdir>

# full render
npx remotion render Reel out/motu-ultralite-828-reel.mp4 \
  --codec=h264 --crf=18 --pixel-format=yuv420p --concurrency=3

# thumbnails
python3 scripts/thumbnails.py
```

---

## Other files

- [`VO_SCRIPT_REEL_ULTRALITE_828.md`](VO_SCRIPT_REEL_ULTRALITE_828.md) — timestamped
  voiceover script for the 178 s runtime, ready for narration. The reel carries **no
  burned-in captions**; nothing spoken appears as on-screen text.
- `thumbnails/` — three 1080×1920 language variants (English / Hindi / Bengali),
  pixel-identical apart from the language badge.

---

## Pricing

| Product | Price |
|---|---|
| MOTU UltraLite-mk5 | Rs. 81,900 per unit (incl. GST) |
| MOTU 828 | Rs. 1,20,000 per unit (incl. GST) |

Final best price is confirmed directly by Shivansh Electronics — DM or call.
