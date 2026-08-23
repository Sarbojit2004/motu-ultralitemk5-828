# MOTU UltraLite-mk5 & MOTU 828 — video deliverables

Three finished pieces on the "Architecture of Scale" framing, built on the
proven MOTU AVB ecosystem workflow:

| Deliverable | Canvas | Runtime | Frames | Project |
|---|---|---|---|---|
| Long-form | 1920×1080 landscape | 598 s | 17,940 | [`longform/`](longform/) |
| Reel 1 — *The Agile Hub* | 1080×1920 portrait | 178 s | 5,340 | [`reels/`](reels/) |
| Reel 2 — *The Studio Anchor* | 1080×1920 portrait | 178 s | 5,340 | [`reels/`](reels/) |

**Shivansh Electronics** — Authorized Distributor of MOTU (Mark of the Unicorn,
USA) Interfaces for East and North East India · **www.shivanshelectronics.in**

MOTU UltraLite-mk5 — **Rs. 81,900** · MOTU 828 — **Rs. 1,28,000**
Per unit, Market Operating Price, inclusive of GST. Best price on the website.

## The narrative

*The Architecture of Scale: One Standard, Two Environments.* Neither unit is a
step toward the other. They are architecturally distinct platforms sharing an
identical conversion tier (ESS Sabre32 Ultra / ES9026PRO, 125 dB(A)), an
identical redesigned preamplifier (+74 dB, −129 dBu EIN) and an identical
CueMix 5 ecosystem. The choice between them is scale and environment, not
quality — the UltraLite-mk5 as the **Agile Hub**, the 828 as the **Studio
Anchor**.

## Two asset layers, two different rule sets

This is the distinction the whole build is organised around, and the two are
tracked separately end to end so a validation pass can never confuse them.

**Real photography — 69 images, compulsory coverage.**
Never permanently cropped, clipped or trimmed. Every placement shows the
complete unit fully and legibly at some point in its screen time. Enforced
structurally in `Plate` (the image element box equals the content box) and
proved per-beat by `node scripts/qa-stills.mjs --resolve`, which samples every
camera move *after* it has resolved to the whole unit.

The `.jpg`/`.png` same-number pairs look like duplicates by filename, so every
pair was compared by pixel content before anything was consolidated. All 24
stem-pairs are essentially uncorrelated (dHash distance 93–142 of 240) with
differing aspect ratios, and content-hash grouping found no identical pairs
anywhere. **Nothing was deduplicated: the inventory is 69 distinct images.**

**Representational footage — 9 clips, discretionary.**
Editorially free per Section 0.3: trimmed, speed-ramped, re-framed, cropped,
graded and muted per beat. Never checked against the completeness rule above.

## Dual coverage

The coverage rule holds **twice, independently** — see
[`ASSET_COVERAGE.md`](ASSET_COVERAGE.md) for the full reconciliation.

- **69/69** in the 598 s long-form.
- **69/69** across the reel pair (Reel 1: 33 · Reel 2: 36 · disjoint), verified
  by `reels/scripts/check-pair.mjs` **without reference to the long-form's list**.

## Voiceover scripts

- [`VO_SCRIPT_MOTU_ULTRALITE828_LONGFORM_598S.md`](VO_SCRIPT_MOTU_ULTRALITE828_LONGFORM_598S.md)
- [`VO_SCRIPT_MOTU_ULTRALITE828_REEL1.md`](VO_SCRIPT_MOTU_ULTRALITE828_REEL1.md)
- [`VO_SCRIPT_MOTU_ULTRALITE828_REEL2.md`](VO_SCRIPT_MOTU_ULTRALITE828_REEL2.md)

English only, timestamped against the actual beat structure — each generated
from the same schedule that renders its video, so sync is by construction. No
burned-in captions; a silent VO slot at the exact runtime ships in each project.

## Audio

Two layers, per deliverable, both also shipped standalone alongside the embedded
mix:

- **Music bed** — five instrumental tracks and 17 stems from the AVB reference,
  selected on actual waveform analysis rather than filenames, deployed as the
  AVB-proven Path A / Path B blend with per-section loudness matching.
- **Transition SFX** — a 7-cue palette: four reused directly from the AVB
  reference (`encoder-click`, `talkback-click`, `data-stream`, `avb-ping`), one
  deliberately *not* reused (`rj45-snap` — neither product has an Ethernet
  port), and three newly synthesised for what this project genuinely needs
  (`trs-seat`, `xlr-lock`, `usbc-seat`).

## Note on the prior build

A previous production occupies the repository root (`src/`, `public/`,
`scripts/`, `out/`, `thumbnails/`, its own `package.json`, and the root
`README.md` that documents it — left exactly as it was). It is **not** part of
this work: none of it was read, adapted, referenced or modified. It was used for
exactly one purpose — confirming which raw assets already existed — and its
curated, renamed asset copies under `public/img/` were deliberately ignored in
favour of enumerating the raw files at the repository root independently. All
new work lives in `longform/`, `reels/` and `tools/`.
