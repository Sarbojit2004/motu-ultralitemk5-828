"""Verification pass over the delivered square set.

Same discipline as the 9:16 pass: check the things that can be measured rather
than asserted. The square adds one check the tall format did not need -- the
hero photograph is now a fixed 460px slot rather than a gap-derived one, so its
colour is verified as well as the band's, cut-out heroes being compared only
where their own alpha is fully opaque.
"""
import json, os, sys, re

# Mirrors build_sq.py: SERIES selects sv (Sonicview) or ms (Model).
SERIES = os.environ.get('SERIES', 'sv')
assert os.path.isdir(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), SERIES)), SERIES
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SP = os.path.join(_ROOT, SERIES + 'q')
SV = os.path.join(_ROOT, SERIES)
sys.path.insert(0, SV)
import numpy as np
from PIL import Image
from spec import SPEC
from collections import Counter

SLIDES = os.path.join(SP, 'slides')
BUILD = os.path.join(SV, 'build')
fits = json.load(open(os.path.join(SP, 'fits.json')))
ids = json.load(open(os.path.join(SV, 'ids.json')))
# The TASCAM id maps are filename -> id; the MOTU ones id -> filename. Pick the
# side that holds the ids rather than assuming an orientation.
ALL = (set(ids) if all('.' in str(v) for v in ids.values()) else set(ids.values()))
S = 2                       # device pixels per CSS px
ZONE_TOP, BANDW, BANDH = 386, 672, 340


def name(sl):
    return SPEC[sl]['name'].replace('_', '_sq_', 1) + '.png'


def cover(src, w, h):
    """Reproduce CSS object-fit: cover, object-position: center."""
    sw, sh = src.size
    k = max(w / sw, h / sh)
    rs = src.resize((max(1, round(sw * k)), max(1, round(sh * k))), Image.LANCZOS)
    ox, oy = (rs.width - w) // 2, (rs.height - h) // 2
    return rs.crop((ox, oy, ox + w, oy + h))


print('=' * 78)
print(f'SERIES: {SERIES}')
print('1. DIMENSIONS   (2160 x 2160 exact, not a minimum)')
bad = 0
for sl in sorted(SPEC):
    p = os.path.join(SLIDES, name(sl))
    if not os.path.exists(p):
        print(f'   {sl}  MISSING'); bad += 1; continue
    im = Image.open(p)
    ok = im.size == (2160, 2160)
    bad += (not ok)
    print(f'   {sl}  {im.size[0]} x {im.size[1]}  {"OK" if ok else "*** WRONG ***"}'
          f'   {os.path.getsize(p)/1e6:5.2f} MB   {name(sl)}')
print(f'   -> {10-bad}/10 exact')

print()
print('=' * 78)
print('2. COVERAGE   (every frame placed; none twice on a single slide)')
used = []
for sl, s in SPEC.items():
    used += [s['hero'], s['band']] + list(s['plates'])
    if 'found' in s:
        used.append(s['found'])
c = Counter(used)
logos = {'TASCAM BRAND LOGO.png', 'SHIVANSH ELECTRONICS BRAND LOGO.png', 'DANTE LOGO.jpg',
         'FACEBOOK ICON.png', 'INSTAGRAM ICON.webp', 'YOUTUBE ICON.png',
         'WEBSITE ICON.png', 'WHATSAPP ICON.png'}
# a series may declare its own held-back frames in spec.py
try:
    from spec import HELD_BACK as _HB
except ImportError:
    _HB = {}
HELD = {'sv': {'FPGA-05'}}.get(SERIES, set()) | set(_HB)
missing = [m for m in sorted(ALL - set(c) - HELD) if m not in logos]
# The TASCAM catalogues were large enough for the register to be a global
# partition -- every frame placed exactly once. The MOTU products carry 23-46
# frames, and ten slides need twenty for heroes and bands alone, so there the
# register is a curated per-slide selection: every frame still appears, but one
# may lead its own slide and return as a plate on a related one. What must
# never happen either way is the same frame twice on a single slide.
twice = []
for sl, s in SPEC.items():
    on = [s['hero'], s['band']] + list(s['plates']) + ([s['found']] if 'found' in s else [])
    for k, n in Counter(on).items():
        if n > 1:
            twice.append(f'{sl}:{k}x{n}')
reused = {k: n for k, n in c.items() if n > 1}
print(f'   placements   {len(used)}')
print(f'   distinct     {len(c)}')
print(f'   reused       {len(reused)} frames appear on more than one slide'
      + (f' (max {max(reused.values())}x)' if reused else ' -- a strict partition'))
print(f'   twice on one slide   {twice or "none"}')
print(f'   unplaced     {missing or "none"}')
if not HELD:
    print('   held back    nothing')
elif _HB:
    print('   held back    ' + str(len(_HB)) + ' frames, each with a stated reason:')
    for k in sorted(_HB):
        print(f'                  {k}  &mdash; {_HB[k]}'.replace('&mdash;', '--'))
else:
    print('   held back    ' + ', '.join(sorted(HELD)) + ' (Dante DDM READY badge, ruling 01)')

print()
print('=' * 78)
print('3. COLOUR FIDELITY   (rendered photograph vs the supplied frame)')
print('   any filter, blend or desaturation in the chain would show as drift here')
worst = 0.0
for sl in sorted(SPEC):
    p = os.path.join(SLIDES, name(sl))
    if not os.path.exists(p):
        continue
    # the control frame: identical in every respect but with the forward text
    # layer hidden, so this still measures the photograph rather than the design
    ctrl = os.path.join(SP, 'control', name(sl))
    slide = np.asarray(Image.open(ctrl if os.path.exists(ctrl) else p)
                       .convert('RGB')).astype(np.float32)
    out = []

    # --- lower band: object-fit cover into a fixed 672 x 340 slot.
    # Three graphic elements are deliberately drawn ON the band -- the paper
    # caption chip, the solid red block and the diagonal rule (plus the red
    # outline on two slides). In the 9:16 set the band was 2160px wide and they
    # were lost in the average; at 672 the chip alone is 2.5% of the area and
    # lifts the mean by ~4.6 on every channel. Mask them out, or this measures
    # the artwork rather than the photograph.
    f = fits[sl]
    r = slide[ZONE_TOP*S:(ZONE_TOP+BANDH)*S, 0:BANDW*S]
    b = np.asarray(cover(Image.open(os.path.join(BUILD, f'band_{sl}.png')).convert('RGB'),
                         BANDW*S, BANDH*S)).astype(np.float32)
    keep = np.ones(r.shape[:2], bool)

    def punch(rect, pad=2):
        if not rect:
            return
        x, y, w, h = rect
        y0 = max(0, round((y - ZONE_TOP - pad) * S)); y1 = round((y + h - ZONE_TOP + pad) * S)
        x0 = max(0, round((x - pad) * S)); x1 = round((x + w + pad) * S)
        if y1 > 0 and x1 > 0:
            keep[y0:y1, x0:x1] = False

    punch(f['tag']); punch(f['blk']); punch(f.get('markRect'))
    # the diagonal runs corner to corner across the band's top-left; clear a
    # generous strip either side of it rather than rasterising the line
    y1d, y2d = f['diag']
    yy, xx = np.mgrid[0:r.shape[0], 0:r.shape[1]]
    ly = (y1d + (y2d - y1d) * (1 - (xx / S + 12) / 1104) - ZONE_TOP) * S
    keep &= np.abs(yy - ly) > 9 * S

    d = [r[..., i][keep].mean() - b[..., i][keep].mean() for i in range(3)]
    out.append(('band', d, float((r.max(2)-r.min(2))[keep].mean()),
                float((b.max(2)-b.min(2))[keep].mean())))

    # --- hero: plain scale, no crop. Cut-outs are judged only where opaque.
    hx, hw, hh = fits[sl]['hero']
    hy = fits[sl].get('heroY')
    src = Image.open(os.path.join(BUILD, f'hero_{sl}.png'))
    hwD = round(hw*S); hhD = round(hwD * src.height / src.width)
    if hy is not None:
        rr = slide[round(hy*S):round(hy*S)+hhD, round(hx*S):round(hx*S)+hwD]
        ss = src.resize((hwD, hhD), Image.LANCZOS)
        m = (np.asarray(ss.split()[3]) > 250) if ss.mode == 'RGBA' else np.ones((hhD, hwD), bool)
        ss = np.asarray(ss.convert('RGB')).astype(np.float32)
        # The red diagonal and the solid block are drawn over the photograph on
        # purpose, and a tall hero reaches down into both. Left in, they read as
        # a +4.35 red lift in the hero's bottom third while the top two thirds
        # sit at the resampling floor -- so mask them, exactly as the band check
        # does, or this measures the rule rather than the photograph.
        yy, xx = np.mgrid[0:hhD, 0:hwD]
        px, py = hx + xx / S, hy + yy / S
        ly = f['diag'][0] + (f['diag'][1] - f['diag'][0]) * (1092 - px) / 1104
        m &= np.abs(py - ly) > 9
        bx, by, bw, bh = f['blk']
        m &= ~((px >= bx - 2) & (px <= bx + bw + 2) & (py >= by - 2) & (py <= by + bh + 2))
        if m.sum() > 5000 and rr.shape[:2] == m.shape:
            d = [rr[..., i][m].mean() - ss[..., i][m].mean() for i in range(3)]
            sa = float((rr.max(2)-rr.min(2))[m].mean()); sb = float((ss.max(2)-ss.min(2))[m].mean())
            out.append(('hero', d, sa, sb))

    for what, d, sa, sb in out:
        mx = max(abs(x) for x in d)
        worst = max(worst, mx)
        flag = 'OK' if mx < 4.0 and abs(sa-sb) < 4.0 else '*** CHECK ***'
        print(f'   {sl} {what:5} mean RGB drift {d[0]:+6.2f} {d[1]:+6.2f} {d[2]:+6.2f}   '
              f'saturation {sa:6.2f} vs {sb:6.2f}   {flag}')
print(f'   -> worst per-channel drift across the set: {worst:.2f} of 255')

print()
print('=' * 78)
print('4. CONTENT RULES   (scan the generated markup)')
BANNED = {
    'email address': r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}',
    'price figure': r'(?:₹|Rs\.?\s*\d|INR\s*\d|\$\s*\d|\bMRP\b|\bprice\b)',
    'social platform': r'\b(facebook|instagram|youtube|twitter|linkedin|tiktok|x\.com)\b',
    'dante logo file': r'DANTE LOGO',
    'css colour filter': r'(grayscale|sepia|saturate|hue-rotate)\s*\(',
}
pages = sorted(f for f in os.listdir(os.path.join(SP, 'pages')) if f.endswith('.html'))
hits = 0
for f in pages:
    txt = open(os.path.join(SP, 'pages', f)).read()
    for n_, pat in BANNED.items():
        m = re.findall(pat, txt, re.I)
        if m:
            print(f'   {f}: {n_} -> {set(m)}'); hits += 1
print(f'   -> {"no prohibited content in any of the 10 pages" if not hits else str(hits)+" HITS"}')
print()
print('   the four permitted items, on every slide:')
for item in ['logo_tascam.png', 'logo_shivansh.png', 'www.shivanshelectronics.in',
             'icon_whatsapp.png', '98316 62458', '91477 00677', '89818 07755']:
    ok = all(item in open(os.path.join(SP, 'pages', f)).read() for f in pages)
    print(f'     {"yes" if ok else "NO "}  {item}')

print()
print('=' * 78)
print('5. LAYOUT   (nothing overruns the colophon at y=900)')
for sl in sorted(fits):
    f = fits[sl]
    rb, cb = f['regBottom'], f['capTop'] + f['capH']
    ok = rb <= 890 and cb <= 890
    print(f'   {sl}  line {f["size"]:5.1f}px / {f["lineW"]}pt   hero {f["hero"][1]}x{f["hero"][2]}'
          f'   register {f["cols"]}col x{f["regRows"]} -> {rb:3}   caption -> {cb:3}'
          f'   {"OK" if ok else "*** OVERRUN ***"}')


print()
print('=' * 78)
print('5b. FORWARD TEXT LAYER   (final frame vs the same frame with it hidden)')
print('   the overlay must touch ONLY pixels inside the product silhouette --')
print('   any glyph ink on bare paper has to come from the untouched base layer')
worst_out = 0
for sl in sorted(SPEC):
    fin = os.path.join(SLIDES, name(sl)); ctl = os.path.join(SP, 'control', name(sl))
    if not (os.path.exists(fin) and os.path.exists(ctl)):
        continue
    a = np.asarray(Image.open(fin).convert('RGB')).astype(np.int16)
    b = np.asarray(Image.open(ctl).convert('RGB')).astype(np.int16)
    diff = np.abs(a - b).max(2) > 6

    # the hero's own alpha, placed exactly as the page places it
    f = fits[sl]
    hx, hw, hh = f['hero']; hy = f['heroY']
    src = Image.open(os.path.join(BUILD, f'hero_{sl}.png'))
    hwD, hhD = round(hw*S), round(hh*S)
    rs = src.resize((hwD, hhD), Image.LANCZOS)
    alpha = (np.asarray(rs.split()[3]) > 8) if rs.mode == 'RGBA' else np.ones((hhD, hwD), bool)
    foot = np.zeros(diff.shape, bool)
    y0, x0 = round(hy*S), round(hx*S)
    y1, x1 = min(y0+hhD, foot.shape[0]), min(x0+hwD, foot.shape[1])
    foot[y0:y1, x0:x1] = alpha[:y1-y0, :x1-x0]

    # The mattes carry a 0.7px Gaussian feather, and Chromium's mask resampling
    # does not land identically on PIL's reconstruction of it, so a handful of
    # boundary pixels take a faint partial overlay. Allow exactly one pixel of
    # edge tolerance and count anything further out as a genuine leak.
    def dilate(m, n=1):
        for _ in range(n):
            o = m.copy()
            o[1:, :] |= m[:-1, :]; o[:-1, :] |= m[1:, :]
            o[:, 1:] |= m[:, :-1]; o[:, :-1] |= m[:, 1:]
            m = o
        return m
    edge = dilate(foot, 1)
    outside = int((diff & ~edge).sum())
    fringe = int((diff & edge & ~foot).sum())
    inside = int((diff & foot).sum())
    worst_out = max(worst_out, outside)
    pct = 100.0 * inside / max(1, int(foot.sum()))
    print(f'   {sl}  changed inside silhouette {inside:8,} px ({pct:5.1f}% of it)   '
          f'1px fringe {fringe:4,}   beyond {outside:5,} px   '
          f'{"OK" if outside == 0 else "*** LEAK ***"}')
print(f'   -> pixels altered outside any product silhouette, whole set: {worst_out}')
