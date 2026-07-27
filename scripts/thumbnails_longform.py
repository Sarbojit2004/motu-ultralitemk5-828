#!/usr/bin/env python3
"""Builds the three language-variant thumbnails for the long-form video.

1920x1080 landscape. Same type system and palette as the reel's thumbnails,
but — unlike the reel — BOTH the MOTU logo and the Shivansh Electronics
logo are required here and are shown with a clean plate treatment.

  python3 scripts/thumbnails_longform.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public/img")
LOGO = os.path.join(ROOT, "public/logo")
TTF = "/tmp/claude-0/-home-user-motu-ultralitemk5-828/56858eaf-896a-579f-aa19-f4d8595fd900/ttf"
OUT = os.path.join(ROOT, "thumbnails")
os.makedirs(OUT, exist_ok=True)

W, H = 1920, 1080

INK = (244, 248, 253)
DIM = (150, 164, 182)
SOFT = (203, 214, 228)
UL = (47, 212, 200)
E8 = (255, 138, 61)
GOLD = (255, 194, 74)
BRAND = (61, 139, 255)
LINE = (40, 54, 70)


def bc(size, w=800):
    return ImageFont.truetype(f"{TTF}/bc-{w}.ttf", size)


def inter(size, w=600):
    f = ImageFont.truetype(f"{TTF}/inter-var.ttf", size)
    f.set_variation_by_axes([w])
    return f


def tw(draw, text, font, ls=0):
    if ls == 0:
        return draw.textlength(text, font=font)
    return sum(draw.textlength(c, font=font) for c in text) + ls * max(0, len(text) - 1)


def text(draw, xy, s, font, fill, ls=0, anchor="la"):
    x, y = xy
    total = tw(draw, s, font, ls)
    if anchor[0] == "m":
        x -= total / 2
    elif anchor[0] == "r":
        x -= total
    if ls == 0:
        draw.text((x, y), s, font=font, fill=fill)
        return total
    for c in s:
        draw.text((x, y), c, font=font, fill=fill)
        x += draw.textlength(c, font=font) + ls
    return total


def th(draw, s, font):
    b = draw.textbbox((0, 0), s, font=font)
    return b[3] - b[1] + b[1]


def line(draw, xy, s, font, fill, ls=0, anchor="la", gap=0):
    text(draw, xy, s, font, fill, ls=ls, anchor=anchor)
    return xy[1] + th(draw, s, font) + gap


def rrect(draw, box, r, fill=None, outline=None, width=2):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def background():
    y = np.linspace(0, 1, H)[:, None, None]
    top = np.array([5, 8, 14], np.float32)
    mid = np.array([13, 20, 31], np.float32)
    ramp = np.clip(1 - np.abs(y - 0.42) / 0.58, 0, 1) ** 1.2
    base = np.broadcast_to(top + (mid - top) * ramp, (H, W, 3)).astype(np.float32).copy()

    xx, yy = np.meshgrid(np.linspace(0, 1, W), np.linspace(0, 1, H))

    def glow(cx, cy, rx, ry, col, amp):
        d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
        m = np.clip(1 - d, 0, 1) ** 2.0 * amp
        return m[..., None] * np.array(col, np.float32)

    base += glow(0.24, 0.40, 0.62, 0.62, UL, 0.20)
    base += glow(0.76, 0.40, 0.62, 0.62, E8, 0.19)
    base += glow(0.50, 0.92, 0.66, 0.28, GOLD, 0.12)

    rng = np.random.default_rng(600)
    base += (rng.random((H, W, 1)).astype(np.float32) - 0.5) * 6.5

    vig = np.clip(1 - (np.sqrt(((xx - 0.5) / 0.80) ** 2 + ((yy - 0.5) / 0.82) ** 2)), 0, 1) ** 0.6
    base *= (0.40 + 0.60 * vig)[..., None]
    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")


def fit(name, box, pad=0):
    im = Image.open(os.path.join(IMG, name)).convert("RGBA")
    l, t, bw, bh = box
    bw -= pad * 2
    bh -= pad * 2
    s = min(bw / im.width, bh / im.height)
    nw, nh = max(1, int(im.width * s)), max(1, int(im.height * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    return im, (int(l + pad + (bw - nw) / 2), int(t + pad + (bh - nh) / 2))


def soft_glow(base, im, xy, colour, radius=44, strength=0.5):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.paste(im, xy, im)
    a = layer.split()[3].filter(ImageFilter.GaussianBlur(radius))
    tint = Image.new("RGBA", base.size, colour + (0,))
    tint.putalpha(a.point(lambda v: int(v * strength)))
    base.alpha_composite(tint)


def product_panel(base, draw, *, box, accent, img_name, name, name_size, spec, price):
    l, t, w, h = box
    rrect(draw, (l, t, l + w, t + h), 26, fill=(11, 16, 24, 235), outline=accent + (120,), width=2)
    draw.rounded_rectangle((l + 6, t + 18, l + 12, t + h - 18), radius=3, fill=accent)

    im, xy = fit(img_name, (l + 30, t + 20, w - 60, h * 0.44))
    soft_glow(base, im, xy, accent, radius=40, strength=0.4)
    base.paste(im, xy, im)

    ty = t + h * 0.48
    ty = line(draw, (l + w / 2, ty), "MOTU", inter(20, 800), accent, ls=5, anchor="ma", gap=8)
    nf = bc(name_size, 800)
    text(draw, (l + w / 2, ty), name, nf, INK, anchor="ma")
    ty += th(draw, name, nf) + 10
    ty = line(draw, (l + w / 2, ty), spec, inter(17, 700), SOFT, ls=1.2, anchor="ma", gap=16)
    draw.line((l + 50, ty, l + w - 50, ty), fill=LINE, width=1)
    ty += 16

    rs = bc(32, 700)
    pf = bc(54, 800)
    rsw = draw.textlength("Rs.", font=rs)
    pw = draw.textlength(price, font=pf)
    total = rsw + 10 + pw
    x0 = l + w / 2 - total / 2
    draw.text((x0, ty + th(draw, price, pf) - th(draw, "Rs.", rs)), "Rs.", font=rs, fill=GOLD)
    draw.text((x0 + rsw + 10, ty), price, font=pf, fill=GOLD)
    ty += th(draw, price, pf) + 8
    text(draw, (l + w / 2, ty), "PER UNIT · INCLUDING GST", inter(14, 700), DIM, ls=1.4, anchor="ma")
    bottom = ty + th(draw, "X", inter(14, 700))
    assert bottom < t + h - 10, f"product panel overflow ({bottom} vs {t+h})"


def logo_plate_abs(draw, base, box, path, accent):
    """Like the reel's LogoCard: dark plate, coloured glow border, logo contained inside."""
    l, t, w, h = box
    rrect(draw, (l, t, l + w, t + h), 16, fill=(12, 16, 23, 235), outline=accent + (110,), width=2)
    im = Image.open(path).convert("RGBA")
    bw, bh = w - 48, h - 36
    s = min(bw / im.width, bh / im.height)
    nw, nh = max(1, int(im.width * s)), max(1, int(im.height * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    xy = (int(l + 24 + (bw - nw) / 2), int(t + 18 + (bh - nh) / 2))
    base.paste(im, xy, im)


def build(lang, filename):
    base = background().convert("RGBA")
    draw = ImageDraw.Draw(base)

    # ---- language badge, top-right, consistent across all three ----
    bw_, bh_ = 300, 58
    bx, by = W - 60 - bw_, 44
    rrect(draw, (bx, by, bx + bw_, by + bh_), 29, fill=GOLD + (255,))
    text(draw, (bx + bw_ / 2, by + 14), lang, inter(26, 800), (10, 12, 16), ls=5, anchor="ma")

    # ---- header ----
    y = 46
    y = line(draw, (60, y), "SHIVANSH ELECTRONICS", bc(52, 800), INK, gap=10)
    y = line(draw, (60, y), "AUTHORIZED DISTRIBUTOR OF MOTU (MARK OF THE UNICORN, USA)", inter(20, 700), BRAND, ls=1.6, gap=4)
    y = line(draw, (60, y), "EAST & NORTH-EAST INDIA", inter(18, 600), SOFT, ls=1.6, gap=0)

    # ---- two product panels ----
    panel_top = 176
    panel_h = 500
    gap = 40
    panel_w = (W - 120 - gap) / 2
    product_panel(
        base, draw,
        box=(60, panel_top, panel_w, panel_h), accent=UL,
        img_name="ul-render-front.png", name="ULTRALITE-mk5", name_size=52,
        spec="18 × 22  ·  40 CHANNELS", price="81,900",
    )
    draw = ImageDraw.Draw(base)
    product_panel(
        base, draw,
        box=(60 + panel_w + gap, panel_top, panel_w, panel_h), accent=E8,
        img_name="e8-render-34b.png", name="828", name_size=76,
        spec="28 × 32  ·  60 CHANNELS", price="1,20,000",
    )
    draw = ImageDraw.Draw(base)

    # ---- shared-thread strip ----
    y = panel_top + panel_h + 22
    rrect(draw, (60, y, W - 60, y + 50), 14, fill=(20, 14, 34, 210), outline=(179, 107, 232, 120))
    text(draw, (W / 2, y + 13), "BOTH RUN CUEMIX 5 DSP  ·  ESS SABRE32  ·  UP TO 192 kHz",
         inter(19, 700), (206, 168, 240), ls=1.4, anchor="ma")
    y += 50 + 18

    # ---- both logos, clean plate treatment (required here, unlike the reel) ----
    logo_h = 84
    logo_w = (W - 120 - gap) / 2
    logo_plate_abs(draw, base, (60, y, logo_w, logo_h), os.path.join(LOGO, "motu-logo.png"), BRAND)
    logo_plate_abs(draw, base, (60 + logo_w + gap, y, logo_w, logo_h), os.path.join(LOGO, "shivansh-logo.png"), GOLD)
    draw = ImageDraw.Draw(base)
    y += logo_h + 18

    # ---- CTA ----
    cta_h = 90
    rrect(draw, (60, y, W - 60, y + cta_h), 20, fill=(38, 27, 6, 200), outline=GOLD + (255,), width=3)
    text(draw, (W / 2, y + 14), "DM OR CALL FOR THE BEST PRICE", bc(40, 800), GOLD, ls=1, anchor="ma")
    text(draw, (W / 2, y + 58), "+91 98316 62458   ·   +91 91477 00677   ·   +91 89818 07755",
         inter(18, 700), SOFT, ls=0.4, anchor="ma")
    y += cta_h + 16

    # ---- footer ----
    text(draw, (W / 2, y), "www.shivanshelectronics.in   ·   instagram.com/shivanshelectronics.in",
         inter(18, 700), GOLD, ls=0.6, anchor="ma")
    y += th(draw, "X", inter(18, 700))
    assert y < H - 24, f"footer overflows canvas ({y})"

    path = os.path.join(OUT, filename)
    base.convert("RGB").save(path, "PNG", optimize=True)
    print(f"{filename}  {os.path.getsize(path)//1024} KB")
    return path


def audit(path):
    im = Image.open(path).convert("L")
    a = np.asarray(im)
    left = a[:, :36].max()
    right = a[:, -36:].max()
    top = a[:36, :].max()
    bot = a[-36:, :].max()
    print(f"   edge-margin max luma  L={left} R={right} T={top} B={bot}")
    assert max(left, right, top, bot) < 130, "content is touching the frame edge"


if __name__ == "__main__":
    for lang, fn in [
        ("ENGLISH", "thumbnail-ultralite-828-longform-english.png"),
        ("HINDI", "thumbnail-ultralite-828-longform-hindi.png"),
        ("BENGALI", "thumbnail-ultralite-828-longform-bengali.png"),
    ]:
        audit(build(lang, fn))
    print("all long-form thumbnails written to", OUT)
