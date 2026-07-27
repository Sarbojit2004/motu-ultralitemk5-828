#!/usr/bin/env python3
"""Automated proof of the central-square constraint.

For every rendered still: the top strip (y 0..419) and bottom strip
(y 1500..1919) must be byte-identical across ALL frames. Identical strips
across time proves they carry no content and no animation — only the static
ambient background. Any text, image, callout or moving element that leaked
outside the 1080x1080 square would change those pixels on some frame.

Also reports the darkest/brightest pixel in the strips so a flat void or a
blown-out edge would be visible in the numbers.

  python3 scripts/check_square.py <stills-dir>
"""
import sys, os, glob, hashlib
from PIL import Image

TOP = (0, 0, 1080, 420)
BOT = (0, 1500, 1080, 1920)


def main(d):
    files = sorted(glob.glob(os.path.join(d, "f*.png")))
    if not files:
        print("no stills found in", d)
        return 1

    top_h, bot_h, rows = {}, {}, []
    for p in files:
        im = Image.open(p).convert("RGB")
        if im.size != (1080, 1920):
            print(f"FAIL {os.path.basename(p)}: size {im.size} != (1080, 1920)")
            return 1
        t = im.crop(TOP).tobytes()
        b = im.crop(BOT).tobytes()
        th = hashlib.sha256(t).hexdigest()[:16]
        bh = hashlib.sha256(b).hexdigest()[:16]
        top_h.setdefault(th, []).append(os.path.basename(p))
        bot_h.setdefault(bh, []).append(os.path.basename(p))
        ext = im.crop(TOP).convert("L").getextrema()
        ext2 = im.crop(BOT).convert("L").getextrema()
        rows.append((os.path.basename(p), th, bh, ext, ext2))

    ok = True
    if len(top_h) != 1:
        ok = False
        print(f"FAIL top strip varies across frames: {len(top_h)} distinct hashes")
        for h, fs in top_h.items():
            print(f"   {h}: {len(fs)} frames e.g. {fs[:4]}")
    if len(bot_h) != 1:
        ok = False
        print(f"FAIL bottom strip varies across frames: {len(bot_h)} distinct hashes")
        for h, fs in bot_h.items():
            print(f"   {h}: {len(fs)} frames e.g. {fs[:4]}")

    lum_t = rows[0][3]
    lum_b = rows[0][4]
    print(f"frames checked      : {len(files)}")
    print(f"top-strip hash      : {rows[0][1]} (unique across all frames: {len(top_h) == 1})")
    print(f"bottom-strip hash   : {rows[0][2]} (unique across all frames: {len(bot_h) == 1})")
    print(f"top-strip luma      : min={lum_t[0]} max={lum_t[1]}")
    print(f"bottom-strip luma   : min={lum_b[0]} max={lum_b[1]}")
    print("CENTRAL-SQUARE CONSTRAINT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "stills"))
