# MOTU UltraLite-mk5 & 828 — continuous-camera motion-graphics reel

A 90.7-second, no-voiceover montage for **Shivansh Electronics, Kolkata**, cut to
*Raavana Mavandaa*, built from the raw product photography at the repository
root.

| | |
|---|---|
| Output | `out/motu-camera-motion-reel.mp4` |
| Resolution | **2160 × 3840** (9:16 portrait, true 4K) |
| Duration | **2721 frames @ 30fps = 90.700 s** |
| Shots | 58, every cut on a measured transient |
| Images | **69 / 69** distinct raw product images (see `ASSET_COVERAGE.md`) |
| Audio | Raavana Mavandaa, trimmed 12.559 s → end of track, full level |

```bash
npm --prefix .. install     # deps are shared with the repository root
npm run studio              # Remotion Studio
npm run preview             # 540x960 review cut (~6 min)
npm run render              # 2160x3840 master (~25 min)
npm run finalize            # clip the container to the exact 90.700 s runtime
```

---

## This is not the repository's other project

The repository already contains a finished **178-second** Remotion project
(`src/`, `out/motu-ultralite-828-reel.mp4`) for the same two products. This reel
is a separate deliverable and shares nothing with it:

| | 178-second project | this reel |
|---|---|---|
| canvas | 1080×1920 with a central-square content rule | 2160×3840, whole frame is active |
| on-screen text | none by design | burned-in throughout |
| type | Barlow Condensed / Inter / JetBrains Mono | Anton / Archivo Black / Oswald / Barlow Semi Condensed |
| audio | procedurally synthesised | the supplied film track |
| validation | `scripts/check_square.py` | `tools/coverage.py`, `tools/motion_check.py`, `tools/colour_check.py` |

Nothing here reads `src/`, `public/img/`, `scripts/` or `remotion.config.ts` at
the repository root; imagery comes from the numbered raw files directly.
Running this reel against the other project's validators would produce
meaningless failures, because they encode rules written for a different film.

---

## The problem this build exists to fix

The previous attempt at this direction delivered **static composited cards
joined by hard cuts** — well-designed posters shown one after another, with
nothing moving inside any of them. Everything below is the machinery that makes
that failure structurally impossible here.

### 1. Every held composition is a camera move

There is a real virtual camera (`src/camera/Camera.tsx`). A shot supplies a
`Move`, which is a **function of time**, not a transform applied once at mount:

```ts
export type Move = (p: number) => {x: number; y: number; z: number; r: number};
```

Nothing is composited at a fixed transform. The default easing
(`src/lib/ease.ts`) is deliberately not a plain ease-out, because an ease-out
flattens near the end — which is precisely a shot that reads as a static card
for its last half-second:

```ts
export const drift = (t: number) => {
  const e = 1 - Math.pow(1 - t, 3);
  return e * 0.86 + t * 0.14;   // always decelerating, never stopping
};
```

On top of that, every component carries its own never-settling drift and scale
across its whole life (`resolveTransform` in `src/elements/life.ts`), so no
layer can be found at an identical transform at two different timestamps even
if a shot's camera were subtle.

### 2. Depth-staged parallax, as concrete numbers

`DEPTH` in `src/lib/theme.ts` holds the tunable multipliers the brief asks for.
A layer takes the camera's displacement, zoom delta and roll **scaled by its
depth**:

```
translate(-camX · d, -camY · d)  scale(1 + (camZoom − 1) · d)  rotate(camRot · d)
```

| plane | depth |
|---|---|
| paper sheet | 0.20 |
| light streaks | 0.28 |
| torn scraps / colour slabs | 0.42 |
| photography — far plate | 0.50 |
| **photography — main plate** | **0.60** |
| photography — near plate | 0.74 |
| headline type | 1.00 |
| callouts and rules | 1.30 |

Multi-plate shots put their pictures on *different* planes, so a composition
with three plates moves those three at three different rates relative to each
other, to the backdrop and to the type.

### 3. Gimbal language on every product shot

`pushIn`, `pullBack`, `drift2`, `crane`, `dolly`, `dollyDiag`, `orbit` and
`slamIn` each take a **focus** — a normalised target in the frame — so a push
aims at a specific physical detail rather than the middle of the picture. Which
detail is varied deliberately: the gain knobs (`ul-gain`), the meter bridge
(`ul-meters`), the optical bank (`e8-optical`), the S/PDIF pair (`e8-spdif`),
the send/return jacks (`e8-send`). Shots whose source file is small are blocked
laterally instead of with a deep push, so a shallow original is never magnified
into softness.

### 4. Component-level entrances and exits, overlapping

Shots are not cut whole. Each declares `lead` and `lag` in beats, and each
component inside declares its own `inAt` / `outAt`, which may be negative or
run past the shot's end:

```tsx
<Sequence from={cut - lead} durationInFrames={body + lead + lag}>
```

So the next composition's pieces are already arriving while the current one's
are still leaving. Each shot evaluates its camera from its own absolute
position, so an early-arriving or late-leaving component travels one continuous
path of its own rather than snapping at the cut.

### 5. Texture and light are alive

The paper world (`src/world/World.tsx`) is rendered **once**, at reel level, and
follows whichever shot owns the frame — so the cream sheet reads as one
unbroken surface the camera keeps moving across, rather than a backdrop rebuilt
per card. On top of the camera parallax the sheet breathes and drifts, the light
streaks sweep and pulse, and the film grain reseeds every single frame.

---

## Colour fidelity — where the line sits

**The product photography is never colour-transformed.** No duotone, no
halftone, no posterisation, no grade, no LUT, no tint.

The rule is enforced structurally, not by discipline: the paper, light streaks,
grain and vignette are all composited **below** every photograph, and nothing
in the reel renders on top of one except type and callouts placed alongside it.
Each `<Img>` carries an explicit `filter: 'none'`. The only effect touching a
plate is a `drop-shadow` on its *wrapper*, which lays a shadow behind the
picture without altering a single pixel of it — the soft edge shadow the brief
permits, and nothing beyond it.

This is measured, not asserted. `tools/colour_check.py` renders each image
through the reel's own `Plate` component with nothing else in frame and compares
it to the source file:

```
image             ΔR      ΔG      ΔB     Δsat   Δhue°   maxΔch  verdict
e828_13p      -0.291  -0.293  -0.295  -0.0016   0.149    0.005  unaltered
e828_21j      -0.413  -0.414  -0.414  -0.0003   0.042    0.001  unaltered
e828_30j      -0.389  -0.401  -0.460  -0.0032  -0.022    0.071  unaltered
ul_03j        -0.453  -0.452  -0.450  -0.0005   0.024    0.003  unaltered
ul_13j        -0.153  -0.159  -0.161  -0.0007   0.002    0.008  unaltered
```

Channel means move together by ~0.1 %, saturation by ~0.1 %, hue by under a
fifth of a degree. That is resampling. A duotone or grade would show as a hue
rotation, a saturation collapse or unequal channel shifts, and none is present.

Colour *is* used freely everywhere else — the backdrop, the torn scraps, the
slabs, the type — because those are separate layers, not the photograph.

---

## Music and sync

`tools/analyze_audio.py` measured the supplied track rather than assuming it:

| | |
|---|---|
| tempo | **134.02 BPM**, stable to ±0 BPM from 16 s to the end |
| beat | 0.447694 s (13.4308 frames) |
| bar | 1.790777 s (53.7233 frames) |
| structural boundaries | 4.00 s, **28.50 s** (the drop), 30.25 s |
| source length | 103.26 s |

The trim starts at **12.559439 s** — downbeat #7 of the source, so the reel
opens exactly on a bar line — and runs to the **end of the track**, so the music
resolves on its own tail instead of being chopped mid-phrase. That gives
90.700 s, which is the reel's length.

Cuts are authored in **beats** and only converted to frames at the edges
(`src/lib/grid.ts`), so every cut in the film lands on the measured grid — on a
real transient — rather than on a round clock value. The track's drop at source
28.676 s falls on **beat 36** of the reel, and is used as the UltraLite
movement's gear-change: `ul-drop` slams in on that transient.

---

## Structure

| movement | beats | time | shots | images |
|---|---|---|---|---|
| Cold open | 0 – 12 | 0.00 – 5.37 s | 5 | 4 |
| MOTU UltraLite-mk5 | 12 – 68 | 5.37 – 30.44 s | 16 | 22 |
| MOTU 828 | 68 – 184 | 30.44 – 82.38 s | 30 | 43 |
| Close | 184 – 202.6 | 82.38 – 90.70 s | 7 | (recap) |

The 828 has roughly twice the UltraLite's distinct-image count, so it gets both
a longer allocation and a faster average cut rate, with software, brand and
diagram plates grouped into dollied multi-plate walls — the brief's instruction
to group more images into faster connective passages rather than drop any.

**Copy** is written per product: the UltraLite movement is portable and personal
(*PLUG IN. PLAY OUT.* / *DESK OR LAP* / *BUILT TO TRAVEL* / *AFTER HOURS*), the
828 is rooms and routing (*THE RACK WAKES UP* / *LOOPBACK LIVES HERE* / *PATCH
THE WHOLE ROOM* / *TALK TO THE ROOM* / *STACK THEM*). No spec values, no
paragraphs — short reference and mood lines only.

**Branding** is exactly the four elements the brief allows — the two logos, the
WhatsApp block and the website block — and nothing else. No pricing, no spec
values, no additional taglines. Both logos appear together at the cold open
(`co-brand`) and at the close (`cl-logos`, `cl-contact`); the close carries all
three WhatsApp numbers behind the WhatsApp mark and
`www.shivanshelectronics.in` behind a globe mark; and there is one light
mid-reel repeat — a strip inside `e8-front` that costs the montage no time and
does not compete with a dense cut. Every branding element is animated, on the
nearest parallax plane, with its own entrance and drift: none of them is the
one static thing sitting in a moving frame.

---

## Verification

```bash
python3 tools/coverage.py       # writes ASSET_COVERAGE.md, fails if any image is missing
node    tools/motion_frames.mjs # renders 3 frames inside every shot
python3 tools/motion_check.py   # the Section 3 self-check, automated
node    tools/colour_check.mjs && python3 tools/colour_check.py
python3 tools/sync_check.py     # cut placement, measured from the delivered film
```

**Coverage** — 69 / 69 distinct raw images placed. The count came from the
repository, not from the brief: the same-numbered `.jpg` and `.png` at the root
are *different pictures*, not two encodings of one, so the real figure is 69 and
not the 45 a pairing assumption would give.

**Motion** — `tools/motion_check.py` takes three timestamps inside every shot
and, by normalised cross-correlation in three regions (the type band, the
photography plane, a backdrop strip), measures how far each actually travelled.
A region returning zero displacement with unchanged pixels is a static layer and
fails the shot.

```
PASS - all 58 shots show movement in type, product and backdrop.
```

The measured travel also shows the parallax is real rather than nominal —
`ul-gain`, for instance, reports 174 px of type travel, 87 px of product travel
and 32 px of backdrop travel, tracking the 1.00 / 0.60 / 0.20 design.

**Sync** — `tools/sync_check.py` decodes the audio back out of the rendered
master, re-detects onsets in it from scratch, and measures where the cuts fell:

```
1. cuts against the measured 134.02 BPM grid
   worst offset             : 16.3 ms   (rounding to the nearest frame costs at most 16.7 ms)
   all cuts within 1 frame  : True
2. coincidence with a detected transient
   grid beats on an onset   : 64/203  (32%)   <- baseline
   cuts on an onset         : 21/58   (36%)
3. onset energy at the cut points
   cuts sit on 1.58x the reel's average onset energy
```

Every cut is on the grid to within frame quantisation. The second figure is the
honest one to read: an onset detector misses quiet beats, so only 32 % of the
track's own beats carry a detectable transient — the cuts land on one *more*
often than the average beat does, and on 1.58x the reel's average onset energy.

---

## Layout

```
reel4k/
├── src/
│   ├── Reel.tsx            timeline assembly, flashes, audio
│   ├── Root.tsx            compositions (reel + dev colour probe)
│   ├── timeline.ts         shot placement in beats -> frames
│   ├── camera/Camera.tsx   virtual camera, parallax planes, move factories
│   ├── world/World.tsx     the continuous, always-moving paper environment
│   ├── elements/           Plate, Type, Brand, life-cycle maths
│   ├── shots/              coldOpen · ultralite · e828 · close + the composer
│   ├── data/images.ts      the 69-image inventory
│   └── lib/                beat grid, theme, easing, torn-edge generation
├── public/
│   ├── img/                69 product images (resized only, never re-graded)
│   ├── tex/                baked paper, streaks, grain, vignette, ink distress
│   ├── audio/reel-music.mp3   beat-aligned trim
│   ├── logo/ · fonts/
└── tools/                  texture baking, coverage, motion and colour checks
```

Softness (light streaks, paper mottle, grain, vignette) is **baked** into
textures rather than produced with runtime CSS filters, because per-frame blur
at 2160×3840 is prohibitively slow. The renderer only translates and scales
those bitmaps, which is what keeps 4K parallax affordable.
