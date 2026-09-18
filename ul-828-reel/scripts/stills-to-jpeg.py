#!/usr/bin/env python3
"""Re-encodes the generated PNG stills as quality-95 JPEGs.

A 2752x1536 PNG is ~9 MB and decodes slowly; sixteen of them cycling through
Chrome's decoded-image cache during a 4K render is real cost. JPEG at q95 is
visually identical here (photographic content) at ~1.5 MB.
"""
import glob, os
from PIL import Image
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "higgsfield")
for p in sorted(glob.glob(os.path.join(D, "img-*.png"))):
    im = Image.open(p).convert("RGB")
    q = p[:-4] + ".jpg"
    im.save(q, quality=95, subsampling=0, optimize=True)
    os.remove(p)
    print(os.path.basename(q), im.size, f"{os.path.getsize(q)/1e6:.1f} MB")
