# MOTU UltraLite-mk5 & MOTU 828 — 90 s 4K vertical reel (Remotion × Higgsfield)

A narrated 4K portrait reel for the **MOTU UltraLite-mk5** and the **MOTU 828**,
built on the same script-driven system as the MOTU AVB Series films: one file
says what is said, one file says what is shown, and no frame number is typed
by hand anywhere in the render path.

| | |
|---|---|
| Canvas | **2160 × 3840** (9:16) |
| Runtime | 90.000 s (2,700 frames @ 30 fps) |
| Narration | 205 words · 00:00.0 – 01:22.9 · **148.3 wpm** over the whole read (150.9 wpm excluding the two picture-only holds) |
| End screen | last 6.5 s |
| Master | `out/motu-ultralite-828-reel-4k.mp4` — ships as stream-copied parts + its audio track in `out/parts/` (rejoin is bit-identical, see `out/parts/JOIN.md`) |
| Encode | H.264 CRF 17, yuv420p, 30 fps — quality-targeted, no bitrate cap, never re-encoded after render |
| Speech script | [`../VO_SCRIPT_MOTU_ULTRALITE828_REEL_90S.md`](../VO_SCRIPT_MOTU_ULTRALITE828_REEL_90S.md) |
| VO drop-in | `public/audio/vo-reel.wav` (a silent 90.000 s placeholder) |
| Coverage ledger | [`../ASSET_COVERAGE_ULTRALITE_828_REEL.md`](../ASSET_COVERAGE_ULTRALITE_828_REEL.md) |

**Shivansh Electronics is the authorized distributor of MOTU (Mark of the
Unicorn, USA) for East and North East India.** That line, the two logos, the
website and the 3 WhatsApp numbers appear once, on the end screen, and nowhere
else.

**No price appears anywhere in this reel** — not spoken, not captioned, not on
the end screen, not on the thumbnail. There is deliberately no pricing constant
in `src/theme.ts` to import, so a future edit cannot reintroduce one by
accident.

---

## The argument

*The Architecture of Scale — one standard, two environments.* This is the
framing the 598 s long-form and the 178 s reel pair in this repository already
established, and the reel keeps it intact rather than inventing a second story
for the same two boxes.

Neither unit is a step toward the other. They share a conversion tier, a
preamplifier and a mixer; what differs is scale and environment. So the reel
spends its middle proving the sameness and its two acts proving the difference,
and it never says *better*, *upgrade* or *entry level*.

**Both units carry exactly 2 MIC/LINE/INSTRUMENT combo inputs on the front.**
That was read off `ul-front-elev` and `e8-front-elev` in this repository, not
recalled — it is the single easiest fact here to get wrong, and getting it wrong
would invert the argument. The script is written so no line can be heard as
claiming the 828 has more preamplifiers than the UltraLite-mk5. What the 828 has
more of is I/O, monitoring and rack.

---

## Quick start

```bash
npm install
npm run assets      # repo photography -> public/images/ + src/assets.ts
node scripts/scan-higgsfield.mjs    # generated stills / clips -> src/higgsfield.ts
npm run audio       # music bed + 10 SFX cues, mastered to EBU R128
npm run script      # writes ../VO_SCRIPT_MOTU_ULTRALITE828_REEL_90S.md from src/script.ts
npm run validate    # every pin resolves?

npm run studio      # preview
npm run render      # 4K master, then split into parts if over GitHub's limit
```

The container that authored this build has Chromium pre-installed and
`remotion.config.ts` points Remotion at it. Set `REMOTION_CHROME` to override.
`ffmpeg`/`ffprobe` are the ones inside `@remotion/compositor-linux-x64-gnu`;
that build has no `hue` filter and no `ebur128`, which is why the wash plates
are baked by Pillow and the loudness meter is implemented in `gen_audio.py`.

---

## What drives what

| File | Owns |
|---|---|
| `src/script.ts` | **what is said.** Every caption's duration comes from its *spoken* word count (numerals expand: "125 dB" is 9 spoken words) at 162 wpm, plus a 0.2 s beat where a thought ends and a 0.4 s breath between segments. That lands the read at 148.3 wpm effective. |
| `src/shots.ts` | **what is shown.** Every shot is pinned by hand to the caption it starts on; it runs until the next pin. Six kinds: generated `still`, generated `video` (falls back to the still if the clip is missing), real `bleed`, real `panel`, `split`, `mosaic`. |
| `src/Film.tsx` | **how it is staged**, transitioned, annotated and mixed. |

Re-time a line in `script.ts` and the picture, the demonstratives, the SFX cue
sheet and the printed VO script all move with it.

### The two acts never borrow each other's pictures

Enforced by the shot plan, not by discipline alone: every `ul-*` asset and mk5
clip sits inside the UltraLite-mk5 act or a shared section, every `e8-*` asset
inside the 828 act. The only places both units share a frame are the hook, the
bridge and the close — which is exactly where the script says they belong
together. Material that depicts the *shared platform* (the CueMix 5 screens, the
ESS and bus marks) is reassigned to `shared` in `scripts/prep-assets.mjs` so it
cannot be mistaken for one product's evidence.

---

## The layer stack

```
4  outro    the end screen — the only brand marks anywhere in the reel
3  overlay  ALL typography, held at 0.64 opacity (36% transparent)
            ├ caption lockup — bottom-left, inside the safe box
            └ product tag + demonstrative + spec chips — top-left
2  scrim    a gradient only where the dense text lives
1  picture  full-bleed stills / B-roll / photography under a camera move
```

**Typography** is the AVB reel's system: a brush script face carrying the one
word each sentence turns on, a black geometric sans carrying the rest, the whole
typographic layer at 64% opacity so the picture reads through the letterforms,
with legibility bought back by a hard, tight drop shadow rather than a scrim.
Drop real faces at `public/fonts/script.ttf` and `public/fonts/display.ttf` and
re-render. **Every number on screen is a numeral.**

**Per-product accent.** Unlike the AVB films — which invented a fresh palette so
the three films would not read as re-edits — this reel *inherits* the colours
these two products already have in this repository, from the long-form and the
reel pair:

| | Accent | Why |
|---|---|---|
| UltraLite-mk5 | teal `#2FD4C8` | light, portable, fresh — the Agile Hub |
| 828 | amber `#FF8A3D` | bigger, rack-mounted, room-filling — the Studio Anchor |
| shared | blue `#3D8BFF` | the platform both sit on |

The two are equal in weight and chroma, one cool and one warm, rather than a
light and a dark of one hue — because the reel's whole claim is that neither
ranks above the other.

---

## Demonstratives

The two units are near-identical on paper until you count channels, so the
graphics exist to make the *difference* visible while keeping the *sameness*
visible at the same time:

- **The I/O ladder** — two rows of 32 slots, inputs over outputs, filled to the
  product's real counts (18 × 22 and 28 × 32), with the 2 combo preamplifiers
  drawn solid with an XLR dot at the head of the input row in **both** products.
  The heads are identical, the tails are not.
- **Three scale meters** across the shared section, each anchored to the caption
  that speaks its number: 125 dB dynamic range, +74 dB gain, −129 dBu EIN.
- **A latency trace** under the UltraLite-mk5's 2.4 ms line.
- **The comparison ladder** at the bridge — the same two-row scale, side by side,
  under the header *SAME HEAD · DIFFERENT TAIL*.

Nothing uses `filter: blur()` — at 4K every effect is a transform, a gradient or
a clip-path.

---

## The Higgsfield material

Generated with the Higgsfield MCP against **this repository's real UltraLite-mk5
and 828 photography as image references**, so every unit on screen is the actual
product — same chassis, same front panel, same printed name.

| | Model | Count | Credits |
|---|---|---|---|
| Workflow stills, 9:16 @ 2K (1536 × 2752) | Nano Banana Pro | 8 scenes | 2 each · 16 |
| B-roll, 5 s silent, 1076 × 1928 | Kling 3.0 pro, image-to-video from those stills | 8 clips | 7.5 each · 60 |
| | | **Total** | **76** |

The eight scenes, four per unit plus one that holds both:

1. **ul-desk** — a bedroom producer's desk in window light
2. **ul-road** — a hotel table on tour, mixing from an iPad
3. **ul-guitar** — a rehearsal room, the unit on a guitar amp
4. **ul-stage** — a backstage touring rack on rack ears
5. **e8-control** — a control room, a finger on TALK, vocalist through the glass
6. **e8-stream** — a night streaming desk
7. **e8-tracking** — a tracking session, the 828 racked over outboard preamps
8. **both-studio** — a compact studio holding both units in one frame

Everything was generated at 2K and upscaled inside the 4K composition rather
than paid for at 4K — every generated frame is under a camera move anyway.

**How the files got here.** The authoring container cannot reach Higgsfield's
result CDN (the egress policy answers 403 to CONNECT), so
`higgsfield-manifest.json` lists each result URL and its destination, and
`.github/workflows/fetch-higgsfield-assets.yml` downloads them on a GitHub
runner and commits them to the branch whenever the manifest changes.

---

## Real photography

The 69 distinct product photographs curated for this repository
(`src/lib/images.json`) are re-exported here **from the originals in the
repository root** at up to 3840 px on the long edge — the existing copies in
`public/img` are capped at 2200 px for a 1080-wide canvas, which leaves a
full-bleed shot no margin for a camera move at 2160. The slug names, the
source mapping and the duplicate reconciliation are inherited verbatim from that
earlier curation rather than guessed again from filenames.

The reel places **32 of the 69**. Total coverage is deliberately not a goal for
a 90 s cut: the 598 s long-form and the 178 s reel pair already carry the 69/69
obligation between them. Here each photograph is chosen for the line it proves.
Run `npm run coverage` to regenerate the ledger.

---

## Audio

Everything is synthesised from scratch by `scripts/gen_audio.py` — nothing is
sampled or fetched. One continuous 90 s bed (E major at 104 BPM, shaped to the
script's own segment map) and 10 transition cues, each married to a transition
kind in `src/components/Transitions.tsx`. The two acts are given deliberately
different characters rather than the same curve twice: the UltraLite-mk5 runs
brighter and lighter, the 828 weightier and darker — the same contrast the
teal/amber accents carry.

Every source is mastered to **−23 LUFS (EBU R128)** with a single computed gain
and plays at unity in the timeline. The narration is recorded by the client; a
silent 90.000 s placeholder sits at `public/audio/vo-reel.wav`.

### Separated audio deliverables

So the recorded narration can be balanced against them without losing sync.
Both files are 48 kHz / 16-bit stereo, exactly 90.000 s, starting at frame 0 —
they drop onto a timeline with no offset.

| File | Contents |
|---|---|
| `out/audio/motu-ultralite-828-reel-music-bed.wav` | the continuous bed, music only, −23 LUFS |
| `out/audio/motu-ultralite-828-reel-transition-sfx.wav` | **transition SFX only, music fully silent** — all 79 cues at the exact frame each fires in the render |
| `out/audio/motu-ultralite-828-reel-sfx-plan.json` | the cue sheet itself: `{at, frame, cue}` per cue |

`npm run audio:deliver` regenerates them from `src/sfx.ts` — the same function
`Film.tsx` renders from, so the standalone file and the mix cannot differ by a
frame.

---

## One deliberate exception in the cut

`npm run validate` reports three shots under 1.0 s, all in the hook, at 00:05.4,
00:06.1 and 00:06.9. Those are *Same converters. / Same preamps. / Same mixer.* —
two spoken words each, 22 frames apiece. It is a staccato triplet, not an
oversight: the transitions in `src/transitions-data.ts` run 7–13 frames, so each
of the three still settles before it cuts, and the three pictures behind them
(both chassis, the 828's front panel, both CueMix screens) are the three claims
the line is making. Everything else in the reel holds for at least a second.
