"""Section 3 self-check, run over the whole reel instead of by eye.

For every shot it takes the three rendered timestamps and, in three separate
regions of the frame - the type band, the product plane and a backdrop corner -
measures how far that region's content actually travelled between timestamps,
by normalised cross-correlation over a search window.

A shot passes only if all three regions moved. A region that comes back at
(0,0) with a near-perfect correlation is a layer that sat still, which is
exactly the failure this build exists to correct.
"""
import json, os, sys
import numpy as np
from PIL import Image

OUT = 'out/motion'
plan = json.load(open(sys.argv[1]))
W, H = 540, 960                       # quarter-scale render
REGIONS = {
    'type':    (60, 150, 480, 420),   # upper band, where headlines live
    'product': (70, 430, 470, 800),   # mid frame, the photography plane
    'backdrop':(0, 820, 200, 955),    # lower-left corner: paper + streaks only
}
SEARCH = 26                           # +/- px at quarter scale (= +/-104 px at 4K)


def gray(p):
    return np.asarray(Image.open(p).convert('L'), np.float32) / 255.0


def displacement(a, b, box):
    x0, y0, x1, y1 = box
    pad = SEARCH
    tpl = a[y0:y1, x0:x1]
    tpl = tpl - tpl.mean()
    if tpl.std() < 1e-4:
        return None, 0.0
    best, bestv = (0, 0), -2.0
    for dy in range(-pad, pad + 1, 2):
        for dx in range(-pad, pad + 1, 2):
            ys, xs = y0 + dy, x0 + dx
            if ys < 0 or xs < 0 or ys + (y1 - y0) > b.shape[0] or xs + (x1 - x0) > b.shape[1]:
                continue
            win = b[ys:ys + (y1 - y0), xs:xs + (x1 - x0)]
            win = win - win.mean()
            d = (np.linalg.norm(tpl) * np.linalg.norm(win))
            if d < 1e-6:
                continue
            v = float((tpl * win).sum() / d)
            if v > bestv:
                bestv, best = v, (dx, dy)
    return best, bestv


rows, fails = [], []
for shot in plan:
    f = shot['frames']
    imgs = [gray(os.path.join(OUT, f"{shot['id']}__{x}.png")) for x in f]
    res = {}
    for name, box in REGIONS.items():
        d1, c1 = displacement(imgs[0], imgs[1], box)
        d2, c2 = displacement(imgs[1], imgs[2], box)
        # total travel across the shot, in full-resolution pixels
        tot = 0.0
        for d in (d1, d2):
            if d:
                tot += (d[0] ** 2 + d[1] ** 2) ** 0.5 * 4
        # how much the region's pixels changed at all
        mad = float(np.abs(imgs[0][box[1]:box[3], box[0]:box[2]] -
                           imgs[2][box[1]:box[3], box[0]:box[2]]).mean())
        res[name] = (tot, mad)
    rows.append((shot['id'], res))
    bad = [n for n, (t, m) in res.items() if t < 8 and m < 0.012]
    if bad:
        fails.append((shot['id'], bad))

print(f"{'shot':16s} {'type px/MAD':>18s} {'product px/MAD':>18s} {'backdrop px/MAD':>18s}")
for sid, r in rows:
    print(f"{sid:16s} " + " ".join(f"{r[n][0]:8.0f}/{r[n][1]:.3f}   " for n in REGIONS))
print()
if fails:
    print("STATIC-LAYER FAILURES:")
    for sid, bad in fails:
        print(f"  {sid}: {', '.join(bad)}")
else:
    print(f"PASS - all {len(rows)} shots show movement in type, product and backdrop.")
