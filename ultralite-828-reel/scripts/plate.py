#!/usr/bin/env python3
"""Writes the 512 px ambient wash plate for one image: downscaled, desaturated
and darkened, so the film needs no CSS filter on the full-frame wash layer.
Usage: plate.py <src> <dst> [saturation] [brightness]"""
import sys
from PIL import Image, ImageEnhance
src, dst = sys.argv[1], sys.argv[2]
sat = float(sys.argv[3]) if len(sys.argv) > 3 else 0.55
bri = float(sys.argv[4]) if len(sys.argv) > 4 else 0.28
im = Image.open(src)
if im.mode in ("RGBA", "LA", "P"):
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, (24, 24, 28, 255))
    bg.alpha_composite(im)
    im = bg.convert("RGB")
else:
    im = im.convert("RGB")
im.thumbnail((512, 512 * 4))
im = ImageEnhance.Color(im).enhance(sat)
im = ImageEnhance.Brightness(im).enhance(bri)
im.save(dst, quality=80)
