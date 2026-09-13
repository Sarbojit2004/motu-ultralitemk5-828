"""Silhouette extraction for the Sonicview studio shots.

The supplied frames are the unit on a white sweep, with TASCAM's own model caption
set in the bottom-right margin. We need a real alpha matte -- the chassis' own
outline -- so the headline type is interrupted by the hardware the way the
reference poster's type is interrupted by the building.

Connected components are grown with PIL's C-speed flood fill rather than a numpy
dilation loop: seeding the background from the frame border keeps white areas
*inside* the product (silkscreen, labels, chrome barrels) opaque, which a plain
luminance threshold would punch straight through. Small islands are then dropped,
which is what removes the burned-in model caption without touching the hardware.
"""
import io
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

_BG, _FG = 128, 64


def open_srgb(path):
    """Open a source frame, converting any embedded colour profile to sRGB.

    21 of the supplied frames carry an ICC profile. Chromium colour-manages those
    on render while PIL passes the raw numbers through, so without this the
    delivered pixels and the verification pass disagree by a few units of green
    and blue. Converting here means both see the same sRGB values -- and honouring
    the profile is the correct rendition of the photograph, not a recolour of it.
    """
    im = Image.open(path)
    icc = im.info.get('icc_profile')
    if icc:
        try:
            from PIL import ImageCms
            src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
            im = ImageCms.profileToProfile(im.convert('RGB'), src,
                                           ImageCms.createProfile('sRGB'),
                                           outputMode='RGB')
        except Exception:
            pass
    return im.convert('RGB')


def _flood_background(is_white):
    """Mask of white pixels reachable from the frame border."""
    h, w = is_white.shape
    # NB: .copy() is required. An image built by Image.fromarray shares the
    # numpy buffer and silently discards floodfill's writes.
    img = Image.fromarray((is_white * 255).astype(np.uint8)).copy()
    px = img.load()
    seeds = ([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] +
             [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    for s in seeds:
        if px[s] == 255:
            ImageDraw.floodfill(img, s, _BG, thresh=0)
    return np.asarray(img) == _BG


def _keep_blobs(fg, keep_frac=0.03, cap=600, drop_in=()):
    """Keep foreground components at least `keep_frac` of the largest.

    `drop_in` is a list of fractional (x0,y0,x1,y1) regions; any component whose
    centroid lands inside one is discarded whole. That is how the composited
    INTER BEE award badges come off these frames -- the badge is its own blob, so
    it is removed exactly, with no product pixels cropped away.
    """
    h, w = fg.shape
    # NB: .copy() is required. An image built by Image.fromarray shares the
    # numpy buffer and silently discards floodfill's writes.
    img = Image.fromarray((fg * 255).astype(np.uint8)).copy()
    comps = []
    while len(comps) < cap:
        arr = np.asarray(img)
        todo = arr == 255
        if not todo.any():
            break
        idx = int(np.argmax(todo.ravel()))
        y, x = divmod(idx, w)
        ImageDraw.floodfill(img, (x, y), _FG, thresh=0)
        filled = (np.asarray(img) == _FG)
        comps.append(filled.copy())
        # retire this component so the next scan finds a fresh one
        img.paste(Image.new('L', img.size, 1), (0, 0),
                  Image.fromarray((filled * 255).astype(np.uint8)))
    if not comps:
        return fg
    big = max(int(c.sum()) for c in comps)
    keep = np.zeros_like(fg)
    for c in comps:
        if int(c.sum()) < big * keep_frac:
            continue
        if drop_in:
            ys, xs = np.nonzero(c)
            cx, cy = xs.mean() / w, ys.mean() / h
            if any(x0 <= cx <= x1 and y0 <= cy <= y1 for (x0, y0, x1, y1) in drop_in):
                continue
        keep |= c
    return keep


def _dilate(m, n=1):
    for _ in range(n):
        o = m.copy()
        o[1:, :] |= m[:-1, :]; o[:-1, :] |= m[1:, :]
        o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
        m = o
    return m


def _erode(m, n=1):
    return ~_dilate(~m, n)


def _matte(path, white=236, sat=16, keep_frac=0.03, feather=0.7, drop_boxes=(),
           drop_in=()):
    """Returns (defringed RGB, alpha L, bbox on source). Interior stays fully
    opaque; only the outer boundary is soft."""
    im = open_srgb(path)
    a = np.asarray(im).astype(np.int16)
    mn, mx = a.min(2), a.max(2)

    is_white = (mn > white) & ((mx - mn) < sat)
    fg = ~_flood_background(is_white)

    h, w = fg.shape
    for (x0, y0, x1, y1) in drop_boxes:
        fg[int(h * y0):int(h * y1), int(w * x0):int(w * x1)] = False

    keep = _keep_blobs(fg, keep_frac, drop_in=drop_in)

    # de-fringe: push interior colour outward so the antialiased edge carries
    # chassis colour, not the white sweep behind it
    rgb = np.asarray(im).copy()
    inner = _erode(keep, 2)
    for _ in range(3):
        grown = _dilate(inner, 1)
        ring = grown & ~inner
        src = np.zeros(rgb.shape, np.float32)
        cnt = np.zeros(inner.shape, np.float32)
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sh = np.roll(np.roll(inner, dy, 0), dx, 1)
            sv = np.roll(np.roll(rgb, dy, 0), dx, 1).astype(np.float32)
            use = sh & ring
            src[use] += sv[use]
            cnt[use] += 1
        ok = ring & (cnt > 0)
        rgb[ok] = (src[ok] / cnt[ok, None]).astype(np.uint8)
        inner = grown

    ai = Image.fromarray((keep * 255).astype(np.uint8))
    if feather:
        ai = ai.filter(ImageFilter.GaussianBlur(feather))
    bb = Image.fromarray((np.asarray(ai) > 6).astype(np.uint8) * 255).getbbox()
    return Image.fromarray(rgb), ai, bb


def cutout(path, **kw):
    """RGBA of the product alone, cropped tight. Colour untouched."""
    rgb, ai, bb = _matte(path, **kw)
    out = rgb.convert('RGBA')
    out.putalpha(ai)
    return out.crop(bb)


def bbox_crop(path, pad=0.015, **kw):
    """The original frame trimmed to the product's own bounding box, which also
    removes TASCAM's burned-in model caption from the margin."""
    im = open_srgb(path)
    _, _, bb = _matte(path, **kw)
    W, H = im.size
    px, py = int(W * pad), int(H * pad)
    return im.crop((max(0, bb[0] - px), max(0, bb[1] - py),
                    min(W, bb[2] + px), min(H, bb[3] + py)))
