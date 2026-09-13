# UltraLite mk5 and 828 — social slides

Twenty editorial slides, ten per product, at **2160 × 2160** for the Instagram
feed. Same design system as the TASCAM Sonicview and Model sets; the MOTU mark
takes the TASCAM mark's place in the branding rail.

| Folder | Product |
|---|---|
| `ultralite-mk5-square-2160/` | MOTU UltraLite mk5 |
| `828-square-2160/` | MOTU 828 |

`_contact-sheet.png` in each folder shows all ten together.

## The composition

One display line set to the full measure, a photograph punched through it, a
wide lower photograph, a figure caption beneath it, a plate register beside it,
and the branding rail on a white colophon.

Where the photograph covers the display line, the buried part of the type is
brought forward over it at 36% rather than being lost. This is per-pixel, not
per-letter: the headline is drawn twice, the base layer staying behind the
photograph at full opacity so every uncovered part renders unchanged, and a
second copy above it masked by the hero's own alpha. A glyph half behind a
chassis keeps its exposed half at full strength and brings only its buried half
forward, with the transition on the product's outline rather than a bounding box.

## Two things these libraries forced

**The register is a curated selection, not a partition.** The Sonicview
catalogue ran to 129 distinct frames, so every frame could be placed exactly
once. The UltraLite has 23 and the 828 has 46, and ten slides need twenty for
heroes and bands alone — which would leave three plates for the whole UltraLite
set. So a frame may lead its own slide and return as a plate on a related one.
Every frame still appears, and no frame ever appears twice on a single slide;
the verification pass checks both.

**Nothing on the 828 is silhouette-matted.** Every 828 product frame is lit on
black. The matte keys on a white ground flooded in from the frame border, so on
those frames it finds no background, keeps the whole rectangle and *raises
nothing* — the slide would silently get a photo block where a cut-out was
intended. `prep.py` now checks the result rather than trusting the mode: a cut
that removed almost no alpha, or a trim that kept almost the whole frame, is
reported. The UltraLite's four white-sweep frames do matte, and do.

## Rules the build holds to

- Every product photograph and both logos appear in their **original colour**,
  unmodified. Nothing is desaturated, filtered or AI-generated.
- All textures (halftone, paper grain) are generated programmatically.
- Only four informational items appear: the MOTU logo, the Shivansh Electronics
  logo, the website, and the WhatsApp icon with the three numbers.
- No social handles, email, pricing, unverified specification claims, or a
  call-to-action sentence. Latency figures are read off MOTU's own diagrams
  rather than asserted independently.
- **Five 828 frames are held back**, under the same ruling that kept the Dante
  certification mark off the Sonicview slides: they are other companies' artwork
  rather than photographs of the product — the ESS Technology mark and the
  Loopmasters, Lucid Samples and Big Fish Audio bundle covers, plus a collage of
  bundled instrument thumbnails. MOTU's own CueMix mark and its own "USB 5 Gbps"
  and latency drawings are kept, being the manufacturer's own material.

Latest verification — both sets 10/10 exact at 2160 × 2160; every frame placed,
none twice on a slide; worst per-channel colour drift **0.76** (UltraLite) and
**1.00** (828) of 255; no prohibited content; **zero pixels altered outside any
product silhouette** by the forward text layer.

## Rebuilding

```
python3 ingest.py <repo> "UltraLite-mk5" UL ids_ultralite-mk5.json   # dedup + inventory
python3 prep.py ul5                                                  # mattes, trims, textures
SERIES=ul5 python3 build_sq.py                                       # render
SERIES=ul5 python3 verify_sq.py                                      # measure
```

`build_sq.py` and `verify_sq.py` are shared with every other series and select
with `SERIES=`, so a fix lands on all of them rather than drifting between
copies. The renderer must launch with `--allow-file-access-from-files`: a CSS
`mask-image` is fetched as a cross-origin resource and Chromium blocks `file://`
for those, so without it the forward text layer silently never paints.
