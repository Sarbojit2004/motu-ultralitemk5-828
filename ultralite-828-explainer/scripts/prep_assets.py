#!/usr/bin/env python3
"""Builds public/img/ and writes src/assets.generated.ts.

NOTHING ABOUT AN ASSET'S SHAPE IS TYPED BY HAND. Width, height, aspect and —
the one that matters for staging — the bounding box of the actual CONTENT are
all measured off the file here, so a shot can never claim a shape the picture
does not have.

WHY THE CONTENT BOX MATTERS. Several of these are studio shots of a single
interface floating on white, and the hardware occupies very different fractions
of each canvas. Centring those by canvas puts the product off-centre on screen
and the amount it is off by changes shot to shot. Centring by content puts the
product where the composition wants it every time. For a transparent PNG the box
is the alpha bounds; for a JPEG on a near-white ground it is found by thresholding
away that ground; otherwise it is the whole canvas.

Region luminance is measured too, so a detail push into a dark rear panel and one
into a white front panel can both be normalised to a ground that 64%-opacity
white type with a hard shadow reads cleanly against.

    python3 scripts/prep_assets.py
"""
import json, os, shutil, subprocess
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.dirname(ROOT)                     # the repository root
IMG_OUT = os.path.join(ROOT, "public", "img")
BROLL_IN = os.path.join(ROOT, "public", "broll")
FF = os.path.expanduser("~/bin/ffmpeg")
os.makedirs(IMG_OUT, exist_ok=True)
Image.MAX_IMAGE_PIXELS = None

# slug -> (source file, kind, model)
#
# kinds:  panel  the flat front/rear renders — transparent, high resolution, and
#                the only assets a DetailZoom is allowed to push into
#         hero   an isolated three-quarter render of one unit
#         photo  the unit in a room, a control close-up, a CueMix screen, or one
#                of the two supplied diagrams
#         mark   a wordmark shown whole and never cropped
#
# model:  5 = UltraLite-mk5, 8 = 828, 0 = neither
#
# WHY THE 828 HAS NO DetailZoom TARGET. Its flat panel renders are 3000 x 272
# and 3000 x 298 — an eleven-to-one strip. A region a fifth of the way across
# one is about 600 x 220 px, and filling a 3840-wide frame with that is a
# five-times upscale, which arrives as mush. The resolution guard in DetailZoom
# would widen the crop until it was no longer a detail. So the 828's controls
# are shown through the dedicated close-up PHOTOGRAPHS supplied with the product
# set, which are sharp at 4K, and the flat strips are used only for the shots
# that track along a whole panel. The UltraLite's renders are 3682 x 726, which
# is four times the pixel area, so it keeps its detail pushes.
SOURCES = {
    # ── UltraLite-mk5 ──────────────────────────────────────────────────────
    "ul-front":    ("MOTU UltraLite-mk5 (8).png", "panel", 5),
    "ul-rear":     ("MOTU UltraLite-mk5 (9).png", "panel", 5),
    "ul-face":     ("MOTU UltraLite-mk5 (2).png", "panel", 5),   # front-panel close-up
    "ul-3q":       ("MOTU UltraLite-mk5 (3).png", "hero",  5),
    "ul-3q-left":  ("MOTU UltraLite-mk5 (6).png", "hero",  5),
    "ul-3q-high":  ("MOTU UltraLite-mk5 (7).png", "hero",  5),
    "ul-desk":     ("MOTU UltraLite-mk5 (1).jpg", "photo", 5),
    "ul-laptop":   ("MOTU UltraLite-mk5 (2).jpg", "photo", 5),
    "ul-amp":      ("MOTU UltraLite-mk5 (3).jpg", "photo", 5),
    "ul-ipad":     ("MOTU UltraLite-mk5 (4).jpg", "photo", 5),
    "ul-room":     ("MOTU UltraLite-mk5 (5).jpg", "photo", 5),
    "ul-black":    ("MOTU UltraLite-mk5 (11).jpg", "photo", 5),
    "ul-white":    ("MOTU UltraLite-mk5 (12).jpg", "photo", 5),
    "ul-glow":     ("MOTU UltraLite-mk5 (13).jpg", "photo", 5),
    "ul-latency":  ("MOTU UltraLite-mk5 (10).jpg", "photo", 5),  # the round-trip diagram
    "ul-routing":  ("MOTU UltraLite-mk5 (14).jpg", "photo", 5),  # the connection diagram
    "cuemix-strip":("MOTU UltraLite-mk5 (6).jpg", "photo", 0),
    "cuemix-eq":   ("MOTU UltraLite-mk5 (7).jpg", "photo", 0),
    "cuemix-mix":  ("MOTU UltraLite-mk5 (8).jpg", "photo", 0),
    "cuemix-verb": ("MOTU UltraLite-mk5 (9).jpg", "photo", 0),

    # ── 828 ────────────────────────────────────────────────────────────────
    "e8-front":    ("MOTU 828 (4).png", "panel", 8),
    "e8-rear":     ("MOTU 828 (8).png", "panel", 8),
    "e8-front-3q": ("MOTU 828 (3).png", "panel", 8),
    "e8-rear-3q":  ("MOTU 828 (7).png", "panel", 8),
    "e8-3q":       ("MOTU 828 (1).png", "hero",  8),
    "e8-3q-left":  ("MOTU 828 (2).png", "hero",  8),
    "e8-back-3q":  ("MOTU 828 (5).png", "hero",  8),
    "e8-back-hi":  ("MOTU 828 (6).png", "hero",  8),
    "e8-black":    ("MOTU 828 (6).jpg", "photo", 8),
    "e8-lineout":  ("MOTU 828 (1).jpg", "photo", 8),
    "e8-loopback": ("MOTU 828 (2).jpg", "photo", 8),   # the routing list, loopback selected
    "e8-meter":    ("MOTU 828 (3).jpg", "photo", 8),   # the colour LCD, lit
    "e8-optical":  ("MOTU 828 (4).jpg", "photo", 8),
    "e8-spdif":    ("MOTU 828 (5).jpg", "photo", 8),
    "e8-meters":   ("MOTU 828 (7).jpg", "photo", 8),
    "e8-monitor":  ("MOTU 828 (9).jpg", "photo", 8),   # AB ON / MUTE / A / MONO / B / TALK
    "e8-rearopt":  ("MOTU 828 (10).jpg", "photo", 8),
    "e8-console":  ("MOTU 828 (11).jpg", "photo", 0),
    "e8-guitar":   ("MOTU 828 (18).jpg", "photo", 0),
    "e8-foot":     ("MOTU 828 (20).jpg", "photo", 8),
    "e8-rack":     ("MOTU 828 (21).jpg", "photo", 8),
    "e8-insert":   ("MOTU 828 (22).jpg", "photo", 8),  # SEND / MIC INSERT / RETURN
    "e8-mic":      ("MOTU 828 (25).jpg", "photo", 0),
    "e8-synth":    ("MOTU 828 (26).jpg", "photo", 0),
    "e8-group":    ("MOTU 828 (27).jpg", "photo", 8),
    "e8-laptop":   ("MOTU 828 (28).jpg", "photo", 8),
    "e8-desk":     ("MOTU 828 (29).jpg", "photo", 8),
    "e8-studio":   ("MOTU 828 (30).jpg", "photo", 8),

    # ── marks, shown whole ─────────────────────────────────────────────────
    "ess-mark":    ("MOTU 828 (19).jpg", "mark", 0),   # the converter maker's wordmark
    "usb-mark":    ("MOTU 828 (31).jpg", "mark", 0),   # USB 5 Gbps
    "cuemix-mark": ("MOTU 828 (9).png",  "mark", 0),   # the CueMix 5 badge
    "motu-logo":      ("MOTU (Mark of the Unicorn) BRAND LOGO.png", "logo", 0),
    "shivansh-logo":  ("SHIVANSH ELECTRONICS LOGO FOR VIDEO.png", "logo", 0),
}

# Deliberately unused, and why.
OMITTED = {
    "MOTU 828 (8).jpg":  "bigfishaudio bundle artwork — the film does not argue from bundled software",
    "MOTU 828 (23).jpg": "Lucid Masters bundle artwork — same reason",
    "MOTU 828 (24).jpg": "Lucid Samples bundle artwork — same reason",
    "MOTU 828 (10).png": "a grid of plug-in screenshots; at 4K it reads as clutter rather than as a picture of anything",
    "MOTU UltraLite-mk5 (4).png": "the rackmount-ear exploded diagram — an accessory, and not what this film is about",
    "MOTU UltraLite-mk5 (5).png": "the same ears going on",
    "MOTU UltraLite-mk5 (1).png": "a screenshot of CueMix with the unit beside it; the dedicated CueMix captures are cleaner",
}


def content_box(im):
    """[x0,y0,x1,y1] of real content, 0..1 of the canvas."""
    if im.mode == "RGBA":
        a = np.asarray(im.split()[-1])
        mask = a > 8
    else:
        g = np.asarray(im.convert("L")).astype(np.int16)
        # Only treat it as a cut-out if the border really is a flat pale ground.
        border = np.concatenate([g[0], g[-1], g[:, 0], g[:, -1]])
        if border.mean() < 232 or border.std() > 14:
            return [0.0, 0.0, 1.0, 1.0]
        mask = g < 236
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return [0.0, 0.0, 1.0, 1.0]
    H, W = mask.shape
    return [round(xs.min() / W, 4), round(ys.min() / H, 4),
            round((xs.max() + 1) / W, 4), round((ys.max() + 1) / H, 4)]


assets = []
for slug, (fname, kind, model) in sorted(SOURCES.items()):
    path = os.path.join(SRC, fname)
    if not os.path.exists(path):
        print(f"  MISSING {fname}")
        continue
    im = Image.open(path)
    transparent = im.mode == "RGBA"
    bbox = content_box(im)
    W, H = im.size
    out = os.path.join(IMG_OUT, slug + (".png" if transparent else ".webp"))
    if transparent:
        im.save(out, optimize=True)
    else:
        im.convert("RGB").save(out, "WEBP", quality=93, method=5)
    bw = (bbox[2] - bbox[0]) * W
    bh = (bbox[3] - bbox[1]) * H
    assets.append(dict(slug=slug, file="img/" + os.path.basename(out), kind=kind, model=model,
                       w=W, h=H, ar=round(bw / max(bh, 1), 4), bbox=bbox, transparent=transparent))
    print(f"  {slug:<14} {kind:<6} {W:>5}x{H:<5} bbox {bbox}  -> {os.path.basename(out)}")

# ── region luminance, for DetailZoom normalisation ───────────────────────────
from_assets = {a["slug"]: a for a in assets}
REGION_LUM = {}


def measure(region_name, slug, x, y, w, h):
    a = from_assets.get(slug)
    if not a:
        print(f"  MISSING region source {slug} for {region_name}")
        return
    im = Image.open(os.path.join(IMG_OUT, os.path.basename(a["file"]))).convert("L")
    W, H = im.size
    crop = im.crop((int(x * W), int(y * H), int((x + w) * W), int((y + h) * H)))
    REGION_LUM[region_name] = round(float(np.asarray(crop).mean()) / 255.0, 4)


# Rectangles read off the panel renders themselves, against a printed grid —
# see the note on SOURCES for why only the UltraLite's panels carry these.
REGIONS = {
    "ul.inputs":  ("ul-front", 0.020, 0.05, 0.300, 0.88),
    "ul.phones":  ("ul-front", 0.325, 0.08, 0.095, 0.82),
    "ul.gain":    ("ul-front", 0.420, 0.06, 0.225, 0.80),
    "ul.meter":   ("ul-front", 0.655, 0.10, 0.305, 0.78),
    "ul.power":   ("ul-rear",  0.010, 0.55, 0.150, 0.42),
    "ul.midi":    ("ul-rear",  0.030, 0.10, 0.230, 0.48),
    "ul.optical": ("ul-rear",  0.145, 0.55, 0.125, 0.40),
    "ul.spdif":   ("ul-rear",  0.270, 0.12, 0.075, 0.82),
    "ul.lineout": ("ul-rear",  0.340, 0.15, 0.380, 0.78),
    "ul.linein":  ("ul-rear",  0.720, 0.15, 0.250, 0.78),
    "ul.face":    ("ul-face",  0.030, 0.06, 0.420, 0.88),
    "ul.oled":    ("ul-face",  0.470, 0.06, 0.500, 0.88),
}
for name, (slug, x, y, w, h) in REGIONS.items():
    measure(name, slug, x, y, w, h)
    print(f"  lum {name:<12} {REGION_LUM.get(name)}")

# ── no three-quarter cut-out step ────────────────────────────────────────────
#
# The M-Series project this system came from had to cut the M2 and M4 out of
# studio JPEGs on white, because only the M6 shipped a transparent three-quarter
# render and a lineup of three units at three different treatments looks broken.
# Both units here ship their own transparent renders — three of the UltraLite
# and four of the 828 — so there is nothing to cut and that whole step is gone
# rather than carried along unused.

# Absent by design until the clips are committed: cloudfront.net is blocked from
# the build session, so they come in through the repository. Both films render
# either way — the shot plan falls back to the product photography for any clip
# it cannot find, so nothing is ever a black hole waiting for an asset.
clips = []
if os.path.isdir(BROLL_IN):
    for f in sorted(os.listdir(BROLL_IN)):
        if not f.endswith(".mp4"):
            continue
        p = os.path.join(BROLL_IN, f)
        probe = subprocess.run([FF, "-hide_banner", "-i", p], capture_output=True, text=True).stderr
        import re
        m = re.search(r"(\d{3,5})x(\d{3,5})", probe)
        d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
        if not (m and d):
            print(f"  UNREADABLE {f}")
            continue
        w, h = int(m.group(1)), int(m.group(2))
        dur = int(d.group(1)) * 3600 + int(d.group(2)) * 60 + float(d.group(3))
        clips.append(dict(slug=f[:-4], file="broll/" + f, w=w, h=h,
                          ar=round(w / h, 4), dur=round(dur, 3)))
        print(f"  clip {f[:-4]:<26} {w}x{h}  {dur:.3f}s")

if not clips:
    print("  no B-roll present — both films will render on the product photography")

gen = os.path.join(ROOT, "src", "assets.generated.ts")
with open(gen, "w") as fh:
    fh.write("// GENERATED by scripts/prep_assets.py — do not edit by hand.\n")
    fh.write("// Every size and every bounding box here was measured off the file on disk.\n\n")
    fh.write('import type { Asset, Clip } from "./assets.ts";\n\n')
    fh.write("export const ASSETS: Asset[] = " + json.dumps(assets, indent=1) + ";\n\n")
    fh.write("export const CLIPS: Clip[] = " + json.dumps(clips, indent=1) + ";\n\n")
    fh.write("export const REGION_LUM: Record<string, number> = " + json.dumps(REGION_LUM, indent=1) + ";\n")

print(f"\n{len(assets)} assets, {len(clips)} clips, {len(REGION_LUM)} regions -> src/assets.generated.ts")
for f, why in OMITTED.items():
    print(f"omitted  {f:<24} {why}")
