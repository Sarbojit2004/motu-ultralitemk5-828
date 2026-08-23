# MOTU UltraLite-mk5 & MOTU 828 — portrait reel pair (2 × 178 s)

Two light-background portrait reels, 1080×1920 at 30 fps, exactly **5,340
frames** each. Built with Remotion.

They are a genuine **pair**, not one video cut two ways. Each is a complete
standalone piece: its own hook, its own beat structure, its own thumbnail, its
own audio deliverables, and its own full CTA with both Market Operating Prices —
because a viewer may see either one without the other, or without the long-form.

| | Reel 1 | Reel 2 |
|---|---|---|
| Title | **The Agile Hub** | **The Studio Anchor** |
| Leads with | MOTU UltraLite-mk5 | MOTU 828 |
| Beats | 27 (avg 6.6 s) | 30 (avg 5.9 s) |
| Real images | 33 | 36 |

**Shivansh Electronics** — Authorized Distributor of MOTU (Mark of the Unicorn,
USA) Interfaces for East and North East India · www.shivanshelectronics.in

## Reproducing the renders

```bash
npm install
npm run render:reel1     # -> out/motu-ultralite828-reel-1.mp4
npm run render:reel2     # -> out/motu-ultralite828-reel-2.mp4
npm run render:thumb1    # -> out/thumbnail-motu-ultralite828-reel-1.png
npm run render:thumb2    # -> out/thumbnail-motu-ultralite828-reel-2.png
npm run render:music1    # the standalone audio deliverables, per reel
npm run render:sfx1
npm run render:music2
npm run render:sfx2
```

Self-contained: every image, clip, logo, font and both prebuilt audio layers per
reel ship inside `public/`. Nothing is fetched at render time.

## The reel-pair coverage rule

Section 1 requires the real-image coverage rule to hold **twice, independently** —
once across the long-form, and once across the reel pair. This project satisfies
the second half on its own terms:

```bash
npm run coverage 1     # Reel 1 against its own 33-image portion
npm run coverage 2     # Reel 2 against its own 36-image portion
node scripts/check-pair.mjs   # 33 + 36 = 69, disjoint, union = the full inventory
```

`check-pair.mjs` is the one that matters: it proves the two reels together
account for all 69 enumerated real images **without relying on the long-form's
coverage list at all**.

## Verification

```bash
npm run typecheck
node scripts/branding.mjs 1        # cadence + gap check, per reel
node scripts/branding.mjs 2
node scripts/qa-stills.mjs 1       # one still per beat -> out/qa-reel1/
node scripts/qa-stills.mjs 2 --resolve   # proves each move resolves to the whole unit
```

## The two asset layers

Governed by **different** rules, tracked separately throughout:

- **Real photography** — compulsory coverage, never permanently cropped,
  clipped or trimmed. Every placement shows the complete unit fully and legibly
  at some point in its screen time.
- **Representational footage (9 clips)** — discretionary and editorially free:
  trimmed, speed-ramped, re-framed, cropped and muted per beat, and never
  checked against the completeness rule above.

## Portrait specifics

All critical content sits inside the caption-safe zone pulled verbatim from the
approved AVB reels branch — **top 180 px, bottom 220 px, marginX 64 px** — so
nothing important falls under platform UI. Background imagery may still bleed to
the true edge.

These are not the long-form's landscape scenes rescaled: side-by-side rows
become vertical stacks, type runs larger relative to the frame so it holds at a
glance on a phone, and montages run one or two columns rather than three.
