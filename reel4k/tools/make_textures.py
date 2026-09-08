"""Bake the paper-collage world textures for the MOTU camera-motion reel.

Everything soft (light streaks, paper mottle, grain, vignette) is pre-rendered
here rather than produced with runtime CSS filters, because a 2160x3840 canvas
makes per-frame blur prohibitively slow. The renderer then only has to translate
and scale these bitmaps, which is what keeps the parallax cheap.

All of these are strictly BACKDROP layers: they composite *below* every product
photograph, never over it (master brief S4 colour fidelity).
"""
import os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "tex")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(20260908)


def smooth_noise(h, w, octaves, base=4):
    """Fractal value noise in [0,1]."""
    acc = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        gh, gw = max(2, base << o), max(2, int(base * w / h) << o)
        g = rng.random((gh, gw)).astype(np.float32)
        img = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        acc += amp * (np.asarray(img, np.float32) / 255.0)
        tot += amp
        amp *= 0.55
    acc /= tot
    return (acc - acc.min()) / (np.ptp(acc) + 1e-9)


# ---------------------------------------------------------------- paper
PW, PH = 3000, 5200
print(f"paper {PW}x{PH} ...")
mottle = smooth_noise(PH, PW, 5, base=3)
fiber = smooth_noise(PH, PW, 2, base=140)
base = np.array([0.957, 0.940, 0.900], np.float32)       # warm cream
shade = 1.0 + (mottle - 0.5) * 0.052 + (fiber - 0.5) * 0.026
paper = base[None, None, :] * shade[:, :, None]

# broad soft creases running diagonally, as very low-contrast luminance ridges
yy, xx = np.mgrid[0:PH, 0:PW].astype(np.float32)
for cx, ang, wdt, amp in [(0.22, -0.42, 260, 0.013), (0.63, -0.36, 400, 0.010),
                          (0.88, -0.48, 300, 0.011), (0.42, -0.30, 620, 0.007)]:
    d = (xx - cx * PW) + (yy - PH * 0.5) * ang
    paper *= (1.0 + amp * np.exp(-(d / wdt) ** 2) * np.sign(np.cos(d / (wdt * 1.7))))[:, :, None]

img = Image.fromarray(np.clip(paper * 255, 0, 255).astype(np.uint8), "RGB")

# faint graph-paper grid, baked in so it parallaxes with the sheet
grid = Image.new("L", (PW, PH), 0)
gd = ImageDraw.Draw(grid)
STEP = 118
for x in range(0, PW, STEP):
    gd.line([(x, 0), (x, PH)], fill=34, width=2)
for y in range(0, PH, STEP):
    gd.line([(0, y), (PW, y)], fill=34, width=2)
grid = grid.filter(ImageFilter.GaussianBlur(0.8))
ink = Image.new("RGB", (PW, PH), (86, 92, 104))
img = Image.composite(Image.blend(img, ink, 0.30), img, grid)
img.save(os.path.join(OUT, "paper.jpg"), "JPEG", quality=92, subsampling=0, optimize=True)
print("  -> paper.jpg")

# ---------------------------------------------------------------- light streaks
SW, SH = 3000, 5200
print(f"streaks {SW}x{SH} ...")
yy, xx = np.mgrid[0:SH, 0:SW].astype(np.float32)
ANG = -0.52                                   # diagonal sweep, matches reference
u = xx + yy * ANG
light = np.zeros((SH, SW), np.float32)
dark = np.zeros((SH, SW), np.float32)
for c, w, a in [(-0.10, 300, 0.55), (0.14, 500, 0.75), (0.36, 210, 0.45),
                (0.55, 620, 0.62), (0.80, 330, 0.50), (1.05, 430, 0.40)]:
    light += a * np.exp(-(((u - c * SW) / w) ** 2))
for c, w, a in [(0.02, 380, 0.55), (0.27, 250, 0.42), (0.47, 300, 0.38),
                (0.70, 460, 0.50), (0.95, 280, 0.36)]:
    dark += a * np.exp(-(((u - c * SW) / w) ** 2))
light = np.clip(light, 0, 1)
dark = np.clip(dark, 0, 1)

streak = np.zeros((SH, SW, 4), np.float32)
streak[:, :, 0] = 1.0
streak[:, :, 1] = 0.985
streak[:, :, 2] = 0.94
streak[:, :, 3] = light * 0.20
Image.fromarray((streak * 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "streak_light.png"))
shadow = np.zeros((SH, SW, 4), np.float32)
shadow[:, :, 0] = 0.16
shadow[:, :, 1] = 0.15
shadow[:, :, 2] = 0.13
shadow[:, :, 3] = dark * 0.13
Image.fromarray((shadow * 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "streak_dark.png"))
print("  -> streak_light.png / streak_dark.png")

# ---------------------------------------------------------------- grain tile
print("grain tile ...")
G = 1200
n = rng.normal(0.5, 0.16, (G, G)).astype(np.float32)
n = np.asarray(Image.fromarray((np.clip(n, 0, 1) * 255).astype(np.uint8)).filter(
    ImageFilter.GaussianBlur(0.55)), np.float32) / 255.0
# cross-fade the wrap edges so the tile repeats seamlessly
b = 90
w = np.linspace(0, 1, b)[None, :]
n[:, :b] = n[:, :b] * w + n[:, -b:][:, ::-1] * (1 - w)
n[:b, :] = n[:b, :] * w.T + n[-b:, :][::-1, :] * (1 - w.T)
g = np.zeros((G, G, 4), np.uint8)
g[:, :, :3] = 30
g[:, :, 3] = np.clip(np.abs(n - 0.5) * 2 * 74, 0, 255).astype(np.uint8)
Image.fromarray(g, "RGBA").save(os.path.join(OUT, "grain.png"))
print("  -> grain.png")

# ---------------------------------------------------------------- vignette
print("vignette ...")
VW, VH = 1080, 1920
yy, xx = np.mgrid[0:VH, 0:VW].astype(np.float32)
r = np.sqrt(((xx / VW - 0.5) * 1.16) ** 2 + ((yy / VH - 0.5) * 1.02) ** 2) * 2.0
v = np.clip((r - 0.70) / 0.80, 0, 1) ** 1.9
vg = np.zeros((VH, VW, 4), np.uint8)
vg[:, :, :3] = 24
vg[:, :, 3] = (v * 74).astype(np.uint8)
Image.fromarray(vg, "RGBA").save(os.path.join(OUT, "vignette.png"))
print("  -> vignette.png")
print("done")

# ---------------------------------------------------------------- ink distress mask
# Mostly-opaque tile with sparse transparent speckles and scratches. Applied as a
# CSS mask over type and colour slabs so the cream paper shows through the ink,
# giving the worn letterpress look of the reference without touching photography.
print("distress mask ...")
D = 1000
rng2 = np.random.default_rng(77123)
a = np.ones((D, D), np.float32)
spk = rng2.random((D, D))
fine = np.asarray(Image.fromarray((rng2.random((D // 2, D // 2)) * 255).astype(np.uint8))
                  .resize((D, D), Image.BICUBIC), np.float32) / 255.0
a -= np.clip((fine - 0.83) / 0.17, 0, 1) * 0.42           # broad worn patches
a -= (spk > 0.9986) * 0.85                                 # pinholes
# a few long scratches
yy2, xx2 = np.mgrid[0:D, 0:D].astype(np.float32)
for _ in range(5):
    x0, y0 = rng2.random(2) * D
    ang = rng2.random() * np.pi
    d = np.abs((xx2 - x0) * np.sin(ang) - (yy2 - y0) * np.cos(ang))
    lng = np.abs((xx2 - x0) * np.cos(ang) + (yy2 - y0) * np.sin(ang))
    a -= np.exp(-(d / (0.5 + rng2.random() * 0.9)) ** 2) * (lng < 40 + rng2.random() * 160) * 0.55
a = np.clip(a, 0, 1)
a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.4)),
               np.float32) / 255.0
m = np.zeros((D, D, 4), np.uint8)
m[:, :, :3] = 255
m[:, :, 3] = (a * 255).astype(np.uint8)
Image.fromarray(m, "RGBA").save(os.path.join(OUT, "distress.png"))
print("  -> distress.png  (mean opacity %.3f)" % a.mean())
