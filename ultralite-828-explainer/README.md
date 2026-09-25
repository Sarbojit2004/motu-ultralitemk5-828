# MOTU UltraLite-mk5 & 828 — the five-minute 4K explainer

A landscape companion to the 90-second 4K vertical reel in `../ultralite-828-reel`,
built on the same script-driven system as the MOTU AVB and M-Series films: one
file says what is said, one file says what is shown, and no frame number is
typed by hand anywhere in the render path.

| | |
|---|---|
| Canvas | **3840 × 2160** (16:9) |
| Runtime | 314.15 s · 5:14 · 9,424 frames @ 30 fps |
| Script | 8 chapters · 95 captions · 810 words · ~160 wpm |
| End screen | the last 10 s — the only branded frames in the film |
| Deployment footage | the eight Higgsfield clips from the reel project, composed three-up |
| Master | `out/motu-ultralite828-explainer.mp4`, shipped as byte parts + `rejoin.sh` |

## What it argues

The research brief in this repository is careful on one point, and the whole
film rests on it: the UltraLite-mk5 and the 828 do **not** share one internal
engine the way the AVB 16A, 848 and 10pre genuinely did. They are two
architectures that share a converter tier, a preamplifier design and an
ecosystem, and differ in bandwidth, form factor and channel count.

So the film refuses the good-versus-better framing. What decides how a take
sounds is identical in both; what you are choosing between is a desk and a rack.

## How it differs from the 1080p long-form in `../longform`

| | `../longform` | this |
|---|---|---|
| frame | 1920 × 1080 | **3840 × 2160** |
| runtime | 9:58 | 5:14 |
| loudness | −20.7 LUFS | **−23 LUFS**, matching the AVB and M-Series masters |
| pricing | a timestamped pricing moment at 09:18 | **none, anywhere** |
| footage | photography and motion graphics | the eight deployment clips as well |

Neither replaces the other: that one is the long deep-dive, this one is the
five-minute piece cut to the house standard.

## Running it

```bash
npm run assets      # measures every image and clip, writes src/assets.generated.ts
npm run audio       # music bed, transition layer, silent VO slot
npm run coverage    # proves the shot plan covers the timeline with no holes
npm run framing     # proves no picture is cropped, at any frame of any move
npm run typecheck
sh scripts/run.sh   # picture, mux, cover, byte split, rejoin proof
```

`public/vo/vo-video.wav` is a **silent** slot at exactly the film's length, for
a recorded read to drop into — the same contract as every other film in this
series. The captions carry the script on screen; music and transitions carry
the sound.
