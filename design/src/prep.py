"""Prepare image assets for one MOTU product.

Same discipline as the TASCAM preps and it shares their matte engine: every
operation is a silhouette matte, a bounding-box trim or a straight rectangular
crop. Nothing is recoloured and no texture is sourced -- the halftone and the
paper grain are generated here.
"""
import json, os, sys, time
SP = os.path.dirname(os.path.abspath(__file__))
ROOTDIR = os.path.dirname(SP)
sys.path.insert(0, os.path.join(ROOTDIR, 'sv'))
import numpy as np
from PIL import Image, ImageFilter
from matte import cutout, bbox_crop, open_srgb
Image.MAX_IMAGE_PIXELS = None

UL = '/home/user/sarbojit2004/motu-ultralitemk5-828'
AVB = ('/home/user/sarbojit2004/high-end-video-motu-avb-series-'
       '16a-848-10pre-avb-switch-shivansh-electronics-kolkata')
SVB = os.path.join(ROOTDIR, 'sv', 'build')

# series -> (repo holding the frames, ids file, repo holding the brand marks)
PRODUCTS = {
    'ul5':  (UL,  'ul5.json',  UL),
    'm828': (UL,  'm828.json', UL),
    'm16a': (AVB, 'm16a.json', AVB),
    'm848': (AVB, 'm848.json', AVB),
    'm10p': (AVB, 'm10p.json', AVB),
}
MOTU_LOGO = {UL: 'MOTU (Mark of the Unicorn) BRAND LOGO.png', AVB: 'MOTU LOGO.png'}


def halftone(w, h, pitch=21, gamma=1.85, maxr=0.44, alpha=0.50):
    from PIL import ImageDraw
    im = Image.new('L', (w*3, h*3), 0); d = ImageDraw.Draw(im)
    n = int(max(w, h) / pitch) + 4
    for j in range(-2, n*2):
        for i in range(-2, n*2):
            x, y = i*pitch, j*pitch
            if not (-pitch <= x <= w+pitch and -pitch <= y <= h+pitch):
                continue
            t = min(1., max(0., x/float(w))) ** gamma
            v = 1. - min(1., max(0., (y/float(h) - 0.55) / 0.45))
            r = pitch * maxr * t * (0.30 + 0.70*v)
            if r < 0.30:
                continue
            d.ellipse([(x-r)*3, (y-r)*3, (x+r)*3, (y+r)*3], fill=255)
    out = Image.new('RGBA', (w, h), (26, 24, 17, 0))
    out.putalpha(im.resize((w, h), Image.LANCZOS).point(lambda v: int(v*alpha)))
    return out


def main(series):
    root, idsf, brandroot = PRODUCTS[series]
    OUT = os.path.join(ROOTDIR, series, 'build'); os.makedirs(OUT, exist_ok=True)
    sys.path.insert(0, os.path.join(ROOTDIR, series))
    from spec import SPEC, PREP
    ids = json.load(open(os.path.join(SP, 'ids', idsf)))
    src = lambda k: os.path.join(root, ids[k])
    t0 = time.time()

    halftone(1120, 1440).save(f'{OUT}/halftone.png')
    rng = np.random.default_rng(1603)
    g = rng.normal(128, 9, (512, 512)).astype(np.uint8)
    g = Image.fromarray(g).filter(ImageFilter.GaussianBlur(0.4))
    g.convert('RGB').save(f'{OUT}/grain.png')

    # brand marks: MOTU from the product's own repo, Shivansh and the WhatsApp
    # glyph reused from the prepared TASCAM set -- the same supplied files
    for s_, name in ((os.path.join(brandroot, MOTU_LOGO[brandroot]), 'logo_brand'),
                     (os.path.join(brandroot, 'SHIVANSH ELECTRONICS LOGO FOR VIDEO.png'),
                      'logo_shivansh')):
        im = Image.open(s_).convert('RGBA')
        bb = Image.fromarray((np.asarray(im)[..., 3] > 6).astype(np.uint8)*255).getbbox()
        im.crop(bb).save(f'{OUT}/{name}.png')
    Image.open(f'{SVB}/icon_whatsapp.png').save(f'{OUT}/icon_whatsapp.png')

    warn = []

    def prepare(k, mode, **kw):
        """A silhouette matte keys on a white ground flooded in from the frame
        border. Handed a product lit on black it finds no background, keeps the
        whole rectangle and raises nothing -- so the slide silently gets a photo
        block where a cut-out was intended. Check the result rather than trust
        the mode: a cut that removed almost no alpha, or a trim that kept almost
        the whole frame, did not do its job."""
        if mode == 'cut':
            im = cutout(src(k), **kw)
            a = np.asarray(im.split()[3])
            if float((a < 250).mean()) < 0.02:
                warn.append(f'{k}: cut removed {(a < 250).mean()*100:.1f}% -- not a white sweep?')
            return im
        if mode == 'bbox':
            im = bbox_crop(src(k), pad=0.015, **kw)
            o = Image.open(src(k))
            if im.width * im.height > 0.97 * o.width * o.height:
                warn.append(f'{k}: bbox kept the whole frame -- not a white sweep?')
            return im
        return open_srgb(src(k))

    geom, done = {}, set()
    for sl, s in SPEC.items():
        g = {}
        hero = prepare(s['hero'], 'cut' if s['hero_mode'] == 'cut' else 'raw')
        hero.save(f'{OUT}/hero_{sl}.png'); g['hero'] = [hero.width, hero.height]

        band = (bbox_crop(src(s['band']), pad=0.004) if s['band_mode'] == 'bbox'
                else prepare(s['band'], 'raw'))
        if band.width > 2400:
            band = band.resize((2400, int(band.height*2400/band.width)), Image.LANCZOS)
        band.save(f'{OUT}/band_{sl}.png'); g['band'] = [band.width, band.height]

        for k in s['plates']:
            if k in done:
                continue
            p = PREP.get(k, dict(mode='raw'))
            kw = {kk: vv for kk, vv in p.items() if kk != 'mode'}
            im = prepare(k, p['mode'], **kw)
            if im.mode == 'RGBA':
                bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
                bg.alpha_composite(im); im = bg.convert('RGB')
            im.thumbnail((760, 760), Image.LANCZOS)
            im.save(f'{OUT}/pl_{k}.png'); done.add(k)
        geom[sl] = g
        print(f'  {sl}: hero {g["hero"]}  band {g["band"]} '
              f'(ar {g["band"][0]/g["band"][1]:.2f})  plates {len(s["plates"])}   {time.time()-t0:.0f}s')
    json.dump(geom, open(f'{OUT}/geom.json', 'w'), indent=1)
    for w in warn:
        print(f'  *** {w}')
    print(f'{series} done in {time.time()-t0:.0f}s'
          + (f'   {len(warn)} MATTE WARNINGS' if warn else ''))


if __name__ == '__main__':
    main(sys.argv[1])
