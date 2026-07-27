#!/usr/bin/env python3
"""Builds the three language-variant thumbnails for the UltraLite-mk5 / 828 reel.

1080x1920 to match the reel frame. Same type system, palette and product
renders as the video. No logo files are used — brand presence is typographic,
matching the in-video treatment.

  python3 scripts/thumbnails.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public/img")
TTF = "/tmp/claude-0/-home-user-motu-ultralitemk5-828/56858eaf-896a-579f-aa19-f4d8595fd900/ttf"
OUT = os.path.join(ROOT, "thumbnails")
os.makedirs(OUT, exist_ok=True)

W, H = 1080, 1920

VOID = (4, 6, 10)
INK = (244, 248, 253)
DIM = (132, 148, 168)
SOFT = (195, 208, 224)
UL = (47, 212, 200)
E8 = (255, 138, 61)
GOLD = (255, 194, 74)
BRAND = (61, 139, 255)
LINE = (34, 48, 63)


def bc(size, w=800):
    return ImageFont.truetype(f"{TTF}/bc-{w}.ttf", size)


def inter(size, w=600):
    f = ImageFont.truetype(f"{TTF}/inter-var.ttf", size)
    f.set_variation_by_axes([w])
    return f


def mono(size, w=700):
    f = ImageFont.truetype(f"{TTF}/jbm-var.ttf", size)
    f.set_variation_by_axes([w])
    return f


def tw(draw, text, font, ls=0):
    """Width of text including letter spacing."""
    if ls == 0:
        return draw.textlength(text, font=font)
    return sum(draw.textlength(c, font=font) for c in text) + ls * max(0, len(text) - 1)


def text(draw, xy, s, font, fill, ls=0, anchor="la"):
    """Draw text with optional letter spacing. anchor: la | ma | ra (left/mid/right, ascender)."""
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


def background():
    y = np.linspace(0, 1, H)[:, None]
    base = np.zeros((H, W, 3), np.float32)
    top = np.array([5, 8, 14], np.float32)
    mid = np.array([14, 22, 34], np.float32)
    bot = np.array([5, 7, 12], np.float32)
    ramp = 1 - np.abs(y - 0.46) / 0.54
    ramp = np.clip(ramp, 0, 1) ** 1.25
    base += top + (mid - top) * ramp
    base = base * np.ones((1, W, 1), np.float32)
    base[-1:] = bot

    xx, yy = np.meshgrid(np.linspace(0, 1, W), np.linspace(0, 1, H))

    def glow(cx, cy, rx, ry, col, amp):
        d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
        m = np.clip(1 - d, 0, 1) ** 2.1 * amp
        return m[..., None] * np.array(col, np.float32)

    base += glow(0.32, 0.27, 0.72, 0.30, UL, 0.20)
    base += glow(0.70, 0.62, 0.74, 0.30, E8, 0.19)
    base += glow(0.50, 0.86, 0.66, 0.20, GOLD, 0.13)

    rng = np.random.default_rng(828)
    base += (rng.random((H, W, 1)).astype(np.float32) - 0.5) * 7.0

    vig = np.clip(1 - (np.sqrt(((xx - 0.5) / 0.78) ** 2 + ((yy - 0.5) / 0.80) ** 2)), 0, 1) ** 0.65
    base *= (0.34 + 0.66 * vig)[..., None]

    return Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), "RGB")


def fit(name, box, pad=0):
    """Load an image and contain it inside box=(l,t,w,h). Returns (RGBA, paste_xy)."""
    im = Image.open(os.path.join(IMG, name)).convert("RGBA")
    l, t, bw, bh = box
    bw -= pad * 2
    bh -= pad * 2
    s = min(bw / im.width, bh / im.height)
    nw, nh = max(1, int(im.width * s)), max(1, int(im.height * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    return im, (int(l + pad + (bw - nw) / 2), int(t + pad + (bh - nh) / 2))


def soft_glow(base, im, xy, colour, radius=42, strength=0.55):
    """Coloured bloom behind a transparent product render."""
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.paste(im, xy, im)
    a = layer.split()[3].filter(ImageFilter.GaussianBlur(radius))
    tint = Image.new("RGBA", base.size, colour + (0,))
    tint.putalpha(a.point(lambda v: int(v * strength)))
    base.alpha_composite(tint)


def rrect(draw, box, r, fill=None, outline=None, width=2):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def product_card(base, draw, *, y, h, accent, img_name, kicker, name, name_size,
                 spec, price, note):
    l, r = 48, W - 48
    rrect(draw, (l, y, r, y + h), 26, fill=(11, 16, 24, 235), outline=accent + (110,), width=2)
    draw.rounded_rectangle((l + 6, y + 18, l + 12, y + h - 18), radius=3, fill=accent)

    im, xy = fit(img_name, (l + 34, y + 30, 470, h - 60))
    soft_glow(base, im, xy, accent, radius=46, strength=0.42)
    base.alpha_composite(Image.new("RGBA", (1, 1)), (0, 0))
    base.paste(im, xy, im)

    tx = l + 530
    ty = y + 52
    text(draw, (tx, ty), kicker, inter(23, 800), accent, ls=5)
    ty += 40
    draw.text((tx, ty), name, font=bc(name_size, 800), fill=INK)
    ty += int(name_size * 0.86)
    text(draw, (tx, ty), spec, mono(21, 700), SOFT, ls=1.4)
    ty += 42
    draw.line((tx, ty, r - 40, ty), fill=LINE, width=1)
    ty += 26

    rs = bc(52, 700)
    pf = bc(84, 800)
    draw.text((tx, ty + 24), "Rs.", font=rs, fill=GOLD)
    wrs = draw.textlength("Rs.", font=rs)
    draw.text((tx + wrs + 12, ty), price, font=pf, fill=GOLD)
    ty += 92
    text(draw, (tx, ty), note, mono(18, 700), DIM, ls=2.2)


def build(lang, filename):
    base = background().convert("RGBA")
    draw = ImageDraw.Draw(base)

    # ---- language badge (identical geometry across all three variants) ----
    bw_, bh_ = 430, 74
    bx = (W - bw_) // 2
    by = 60
    rrect(draw, (bx, by, bx + bw_, by + bh_), 37, fill=GOLD + (255,))
    text(draw, (W / 2, by + 20), lang, inter(34, 800), (10, 12, 16), ls=7, anchor="ma")

    # ---- brand block (typographic only — no logo files) ----
    y = 178
    text(draw, (W / 2, y), "SHIVANSH ELECTRONICS", inter(42, 800), INK, ls=8.5, anchor="ma")
    y += 62
    text(draw, (W / 2, y), "AUTHORIZED DISTRIBUTOR OF MOTU", inter(22, 700), BRAND, ls=3.4, anchor="ma")
    y += 32
    text(draw, (W / 2, y), "(MARK OF THE UNICORN, USA)  ·  EAST & NORTH-EAST INDIA",
         inter(20, 600), SOFT, ls=2.4, anchor="ma")
    y += 44
    draw.line((160, y, W - 160, y), fill=LINE, width=1)

    # ---- product + price cards ----
    product_card(base, draw, y=286, h=468, accent=UL, img_name="ul-render-34.png",
                 kicker="MOTU", name="ULTRALITE-mk5", name_size=64,
                 spec="18 × 22  ·  40 CHANNELS", price="81,900",
                 note="PER UNIT · INCLUDING GST")
    draw = ImageDraw.Draw(base)

    product_card(base, draw, y=790, h=468, accent=E8, img_name="e8-render-34b.png",
                 kicker="MOTU", name="828", name_size=104,
                 spec="28 × 32  ·  60 CHANNELS", price="1,20,000",
                 note="PER UNIT · INCLUDING GST")
    draw = ImageDraw.Draw(base)

    # ---- shared-thread strip ----
    y = 1296
    rrect(draw, (48, y, W - 48, y + 76), 18, fill=(20, 14, 34, 210), outline=(179, 107, 232, 120))
    text(draw, (W / 2, y + 26), "BOTH RUN CUEMIX 5 DSP  ·  ESS SABRE32  ·  UP TO 192 kHz",
         mono(23, 700), (206, 168, 240), ls=1.6, anchor="ma")

    # ---- call to action ----
    y = 1414
    rrect(draw, (48, y, W - 48, y + 246), 26, fill=(38, 27, 6, 200), outline=GOLD + (255,), width=3)
    text(draw, (W / 2, y + 34), "DM OR CALL", bc(78, 800), GOLD, ls=1, anchor="ma")
    text(draw, (W / 2, y + 116), "FOR THE BEST PRICE", bc(60, 800), INK, ls=1, anchor="ma")
    text(draw, (W / 2, y + 190), "+91 98316 62458   ·   +91 91477 00677   ·   +91 89818 07755",
         mono(24, 700), SOFT, ls=0.4, anchor="ma")

    # ---- footer ----
    y = 1712
    text(draw, (W / 2, y), "www.shivanshelectronics.in", mono(30, 700), GOLD, ls=1.2, anchor="ma")
    y += 50
    text(draw, (W / 2, y), "instagram.com/shivanshelectronics.in   ·   linktr.ee/shivanshelectronics.in",
         inter(21, 600), SOFT, ls=0.6, anchor="ma")
    y += 40
    text(draw, (W / 2, y), "3, Ramanath Das Road, Dhakuria, Garfa, Kolkata 700031",
         inter(19, 500), DIM, ls=0.6, anchor="ma")

    path = os.path.join(OUT, filename)
    base.convert("RGB").save(path, "PNG", optimize=True)
    print(f"{filename}  {os.path.getsize(path)//1024} KB")
    return path


def audit(path):
    """Fail loudly if any text ran outside the safe margins."""
    im = Image.open(path).convert("L")
    a = np.asarray(im)
    left = a[:, :40].max()
    right = a[:, -40:].max()
    top = a[:40, :].max()
    bot = a[-40:, :].max()
    print(f"   edge-margin max luma  L={left} R={right} T={top} B={bot}")
    assert max(left, right, top, bot) < 120, "content is touching the frame edge"


if __name__ == "__main__":
    for lang, fn in [
        ("ENGLISH", "thumbnail-ultralite-828-english.png"),
        ("HINDI", "thumbnail-ultralite-828-hindi.png"),
        ("BENGALI", "thumbnail-ultralite-828-bengali.png"),
    ]:
        audit(build(lang, fn))
    print("all thumbnails written to", OUT)
