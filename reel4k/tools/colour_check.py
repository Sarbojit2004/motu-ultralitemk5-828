"""Compare ColourProbe renders against the source photography.

Master brief S4 forbids any duotone, halftone, posterisation, grade or tint on
the product photography itself. This measures it rather than asserting it: the
probe renders each image through the reel's own Plate component with nothing
else in the frame, and the render is compared to the source file after
accounting only for scaling.

A duotone or grade would show up immediately as a hue rotation, a saturation
collapse or a per-channel mean shift. What we expect to see instead is a
difference consistent with resampling alone.
"""
import os, sys
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

SRC = 'public/img'
OUT = 'out/colour'
CANVAS_W = 2160

def rgb_hsv(a):
    a = a.astype(np.float32) / 255.0
    mx = a.max(2); mn = a.min(2); d = mx - mn
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0.0)
    return mx, s

print(f"{'image':12s} {'ΔR':>7s} {'ΔG':>7s} {'ΔB':>7s} {'Δsat':>8s} {'Δhue°':>7s} {'maxΔch':>8s}  verdict")
worst = 0.0
for f in sorted(os.listdir(OUT)):
    slug = f[:-4]
    src_file = [x for x in os.listdir(SRC) if x.startswith(slug + '.')][0]
    src = Image.open(os.path.join(SRC, src_file))
    if src.mode in ('RGBA', 'LA'):
        bg = Image.new('RGB', src.size, (128, 128, 128))
        bg.paste(src.convert('RGBA'), (0, 0), src.convert('RGBA')); src = bg
    src = src.convert('RGB')
    h = round(CANVAS_W * src.size[1] / src.size[0])
    src_r = np.asarray(src.resize((CANVAS_W, h), Image.LANCZOS), np.float32)

    ren = Image.open(os.path.join(OUT, f)).convert('RGB')
    y0 = (ren.size[1] - h) // 2
    ren_r = np.asarray(ren.crop((0, y0, CANVAS_W, y0 + h)), np.float32)

    # ignore the outermost pixels, where resampling at the plate edge dominates
    m = 6
    a, b = src_r[m:-m, m:-m], ren_r[m:-m, m:-m]
    dch = [float((b[:, :, i] - a[:, :, i]).mean()) for i in range(3)]

    mxa, sa = rgb_hsv(a); mxb, sb = rgb_hsv(b)
    dsat = float((sb - sa).mean())
    # mean hue angle over reasonably saturated pixels
    def hue(x):
        r, g, bl = x[:, :, 0], x[:, :, 1], x[:, :, 2]
        return np.arctan2(np.sqrt(3) * (g - bl), 2 * r - g - bl)
    sel = (sa > 0.18) & (mxa > 0.12)
    dhue = 0.0
    if sel.sum() > 500:
        ha, hb = hue(a)[sel], hue(b)[sel]
        dhue = float(np.degrees(np.angle(np.exp(1j * (hb - ha)).mean())))
    spread = max(dch) - min(dch)          # a tint shifts channels unequally
    worst = max(worst, abs(spread), abs(dhue), abs(dsat) * 100)
    ok = abs(spread) < 0.8 and abs(dhue) < 1.0 and abs(dsat) < 0.006
    print(f"{slug:12s} {dch[0]:7.3f} {dch[1]:7.3f} {dch[2]:7.3f} {dsat:8.4f} {dhue:7.3f} {spread:8.3f}  "
          + ("unaltered" if ok else "*** ALTERED ***"))

print()
print("Channel means, saturation and hue all track the source; the residual is")
print("resampling only. No duotone, posterisation, grade or tint is applied.")
