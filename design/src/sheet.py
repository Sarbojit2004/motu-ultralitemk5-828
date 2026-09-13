"""Labelled contact sheet + near-duplicate report for one product's frames."""
import os, sys, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
Image.MAX_IMAGE_PIXELS = None


def sig(path):
    im = Image.open(path).convert('L').resize((16, 16), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    return (a - a.mean()) / (a.std() + 1e-6)


def main(root, idsf, out, cols=8, cell=320):
    ids = json.load(open(idsf))
    keys = sorted(ids)
    sigs = {k: sig(os.path.join(root, ids[k])) for k in keys}
    near = []
    for i, a in enumerate(keys):
        for b in keys[i+1:]:
            d = float(np.abs(sigs[a] - sigs[b]).mean())
            if d < 0.28:
                near.append((round(d, 3), a, b))
    near.sort()
    print(f'near-duplicate candidates (perceptual): {len(near)}')
    for d, a, b in near[:12]:
        print(f'   {d}  {a} ~ {b}   ({ids[a]}  |  {ids[b]})')

    try:
        f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
    except Exception:
        f = ImageFont.load_default()
    rows = math.ceil(len(keys) / cols)
    W, H = cols * (cell + 8) + 8, rows * (cell + 34) + 8
    sh = Image.new('RGB', (W, H), (16, 16, 18)); d = ImageDraw.Draw(sh)
    for i, k in enumerate(keys):
        im = Image.open(os.path.join(root, ids[k])).convert('RGB')
        im.thumbnail((cell, cell), Image.LANCZOS)
        x = 8 + (i % cols) * (cell + 8); y = 8 + (i // cols) * (cell + 34)
        sh.paste(im, (x + (cell - im.width)//2, y + (cell - im.height)//2))
        d.text((x + 2, y + cell + 6), k, font=f, fill=(255, 214, 0))
    sh.save(out)
    print(f'{out}  {sh.size}  {len(keys)} frames')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], sys.argv[3])
