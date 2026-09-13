"""Inventory + dedup a MOTU product's supplied frames.

The repositories carry many frames twice, once as .jpg and once as .png of the
same photograph, so a straight listing would place the same picture in two
plates. Frames are hashed on their decoded pixels (downscaled, so a re-encode
does not change the hash) and only one of each is kept -- preferring the PNG,
which is the lossless copy where both exist.
"""
import os, sys, json, hashlib
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
EXT = ('.png', '.jpg', '.jpeg', '.webp')


def phash(path):
    im = Image.open(path).convert('RGB').resize((32, 32), Image.LANCZOS)
    return hashlib.md5(np.asarray(im).tobytes()).hexdigest()


def ingest(root, match, prefix, out):
    files = sorted(f for f in os.listdir(root)
                   if f.lower().endswith(EXT) and match.lower() in f.lower())
    seen, ids, dupes = {}, {}, []
    # PNG first so the lossless copy wins when a photograph exists as both
    for f in sorted(files, key=lambda f: (not f.lower().endswith('.png'), f)):
        p = os.path.join(root, f)
        try:
            h = phash(p)
        except Exception as e:
            print(f'  !! {f}: {e}'); continue
        if h in seen:
            dupes.append((f, seen[h])); continue
        seen[h] = f
    for i, f in enumerate(sorted(seen.values()), 1):
        ids[f'{prefix}-{i:02d}'] = f
    json.dump(ids, open(out, 'w'), indent=1)
    print(f'{prefix}: {len(files)} files -> {len(ids)} distinct  ({len(dupes)} duplicates dropped)')
    for f, of in dupes[:4]:
        print(f'    dup: {f}  ==  {of}')
    if len(dupes) > 4:
        print(f'    ... and {len(dupes)-4} more')
    return ids


if __name__ == '__main__':
    root, match, prefix, out = sys.argv[1:5]
    ingest(root, match, prefix, out)
