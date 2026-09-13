"""Render the ten Sonicview slides as squares, at exactly 2160 x 2160.

This is a re-composition, not a crop, and it is the second one. The first kept
the 9:16 set's two stacked display lines and simply scaled them down -- which
looked right in the abstract and failed in practice, because the canvas never
lost any width. SONIC at 244px spans 529 of the 1092pt measure and BACK spans
470: the lines float at half width with a hole beside them, where in the 9:16
set the same words at 395px filled the measure edge to edge. Two full-measure
lines cannot be had in a square (SONIC alone would want ~500px, so the stack
would eat the whole canvas), so the display drops to ONE line set to the full
measure. The word is no longer split across a line break; it is set whole, at
whatever size fills 1096 -- 230px for CONNECTORS, 287px for BACKBONE. The ten
then share one measure and vary in scale, which is the reference poster's own
system rather than an approximation of it.

That buys back ~170px of height, which goes where the square needs it:

  - the lower photograph keeps a wide slot (672 x 340, ratio 1.98) instead of
    being squeezed towards a square and cropped through both ends of a desk;
  - the caption card turns on its side and becomes a figure caption under the
    photograph, where it stops covering it;
  - the plate register gets the full zone height, so twenty plates fit without
    the 4-row overrun into the colophon that the first attempt produced.

All eight mechanics survive; image assets are shared with the 9:16 build -- same
mattes, same trims, same colour handling -- so nothing is re-derived here.
"""
import json, os, sys, string, time

# One renderer, every series. `SERIES` names a sibling directory holding a
# spec.py and a prepared build/ -- sv and ms for the two TASCAM sets, ul5/m828/
# m16a/m848/m10p for the MOTU products. Everything else, the layout engine, the
# forward text layer and the verification hooks, is shared, so a fix lands on
# all of them rather than drifting between copies.
SERIES = os.environ.get('SERIES', 'sv')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, SERIES)            # spec + prepared assets
SP = os.path.join(ROOT, SERIES + 'q')       # this format's output
os.makedirs(SP, exist_ok=True)
assert os.path.isdir(SRC), f'no such series directory: {SRC}'
sys.path.insert(0, SRC)
from spec import SPEC

# Per-series branding. The rail's mark differs by manufacturer and so does its
# proportion: TASCAM's wordmark is 5.9:1 and MOTU's 3.2:1, so matching their
# heights would leave MOTU looking half the size. `logo_h` matches optical area
# instead, and is the only thing a new brand has to state.
BRAND = {'logo_h': 38}
_bp = os.path.join(SRC, 'brand.json')
if os.path.exists(_bp):
    BRAND.update(json.load(open(_bp)))
from PIL import Image

OUTDIR = os.path.join(SP, 'slides'); os.makedirs(OUTDIR, exist_ok=True)
# A control frame per slide with the forward text layer hidden. It is what lets
# the verification pass still prove the photograph itself is unaltered: the
# overlay tints the product on purpose, so comparing the final frame with the
# source would report a failure that is actually the approved design.
CTRL = os.path.join(SP, 'control'); os.makedirs(CTRL, exist_ok=True)
PAGES = os.path.join(SP, 'pages'); os.makedirs(PAGES, exist_ok=True)
CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

TPL = string.Template(r'''<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face{font-family:Anton;src:url('../../sv/fonts/Anton-400.woff2') format('woff2');
  font-weight:400;font-display:block}
@font-face{font-family:ArchivoN;src:url('../../sv/fonts/ArchivoNarrow-500.woff2') format('woff2');
  font-weight:100 900;font-display:block}
@font-face{font-family:PlexMono;src:url('../../sv/fonts/IBMPlexMono-Regular.ttf') format('truetype');
  font-weight:400;font-display:block}
@font-face{font-family:PlexMono;src:url('../../sv/fonts/IBMPlexMono-Bold.ttf') format('truetype');
  font-weight:700;font-display:block}

:root{
  --paper:#F2F1EC; --ink:#151412; --red:#D5211B; --rule:#B6B2A8;
  --pad:52px; --cw:976px;
}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1080px}
body{background:var(--paper);color:var(--ink);
  font-family:ArchivoN,'Arial Narrow',sans-serif;
  -webkit-font-smoothing:antialiased;overflow:hidden}
.slide{position:relative;width:1080px;height:1080px;overflow:hidden;background:var(--paper)}

/* paper tooth, under every photographic layer so no supplied frame is tinted */
.grain{position:absolute;inset:0;background-image:url('../../sv/build/grain.png');
  background-size:256px 256px;mix-blend-mode:multiply;opacity:.30;z-index:2}
.grain2{position:absolute;inset:0;background-image:url('../../sv/build/grain.png');
  background-size:97px 97px;mix-blend-mode:multiply;opacity:.16;z-index:3}

/* 01 thin red rule with two flanking all-caps labels */
.top{position:absolute;left:var(--pad);top:40px;width:var(--cw);z-index:20}
.top .lbls{display:flex;justify-content:space-between;align-items:flex-end}
.top .lbls span{font-family:Anton,sans-serif;font-size:30px;line-height:1;
  letter-spacing:.055em;text-transform:uppercase}
.top .bar{height:4px;background:var(--red);margin-top:9px}

/* 05 halftone, bleeding in from the right edge behind the display line */
.halftone{position:absolute;right:0;top:96px;width:460px;height:276px;z-index:4;
  background-image:url('../../sv/build/halftone.png');background-size:100% 100%}

/* 02 one display line set to the full measure, interrupted by the photograph */
.head{position:absolute;left:-8px;top:96px;width:1096px;z-index:10}
.hl{font-family:Anton,sans-serif;color:var(--red);line-height:.815;
  letter-spacing:-.008em;white-space:nowrap;text-transform:uppercase}
.hl span{display:inline-block}
.hero{position:absolute;z-index:14}
.hero img{display:block;width:100%;height:auto}
/* 02b the same display line again, in front of the photograph and masked to the
   product's own silhouette, so ONLY the part of a glyph that would otherwise be
   hidden is brought forward. Everything outside the silhouette renders from the
   base layer below, untouched. */
.over{position:absolute;left:0;top:0;width:100%;z-index:15;opacity:.36;
  pointer-events:none;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;mask-mode:alpha}

/* 06 the lower photograph, bleeding off the left edge of the square */
.band{position:absolute;left:0;z-index:12;overflow:hidden}
.band img{display:block;width:100%;height:100%;object-fit:cover;object-position:$BANDPOS}
.bandtag{position:absolute;z-index:22;background:var(--paper);padding:5px 9px;
  font-family:PlexMono,monospace;font-size:9.5px;letter-spacing:.12em;
  text-transform:uppercase;color:#55514A}

/* 04 the boxed caption, now lying under the photograph as a figure caption */
.cap{position:absolute;z-index:16;left:var(--pad);width:620px;
  border:1.5px solid var(--ink);background:var(--paper);padding:14px 17px 15px;
  display:grid;grid-template-columns:174px 1fr;column-gap:18px;align-items:start}
.cap .t{grid-column:1;grid-row:1;font-weight:700;font-size:25px;line-height:1.02;
  letter-spacing:-.005em}
.cap .t em{font-style:normal;color:var(--red)}
.cap p{grid-column:2;grid-row:1 / span 2;font-weight:500;font-size:13.5px;line-height:1.31}
.cap .m{grid-column:1;grid-row:2;margin-top:10px;padding-top:7px;
  border-top:1px solid var(--rule);font-family:PlexMono,monospace;font-size:9px;
  letter-spacing:.09em;text-transform:uppercase;color:#6C685F}

/* a found fragment of the Sonicview logotype, set as a plate rather than a photo */
.found{position:absolute;z-index:16;border:1.5px solid var(--ink);background:#fff;padding:5px}
.found img{display:block;width:100%;height:auto}

/* 07 connective geometry: diagonal, outline, one solid block */
.geo{position:absolute;inset:0;z-index:30;pointer-events:none}
.mark{position:absolute;z-index:32;border:3px solid var(--red)}
.blk{position:absolute;z-index:31;background:var(--red)}

/* the plate register: a tall column beside the photograph, running the zone */
.reg{position:absolute;z-index:20;width:336px}
.reg .rh{display:flex;justify-content:space-between;align-items:baseline;
  border-bottom:1.5px solid var(--ink);padding-bottom:5px}
.reg .rh b{font-family:Anton,sans-serif;font-weight:400;font-size:17px;
  letter-spacing:.12em;text-transform:uppercase}
.reg .rh i{font-family:PlexMono,monospace;font-style:normal;font-size:9px;
  letter-spacing:.1em;color:#6C685F;text-transform:uppercase}
.reg .row{display:grid;gap:7px;margin-top:9px}
.reg figure{margin:0}
.reg .th{width:100%;aspect-ratio:4/3;border:1px solid #9C978C;background:#FFF;padding:2px;
  display:flex;align-items:center;justify-content:center;overflow:hidden}
.reg .th img{max-width:100%;max-height:100%;display:block}
.reg figcaption{font-family:PlexMono,monospace;font-size:8px;letter-spacing:.05em;
  color:#5A564E;margin-top:3px}

/* branding rail on its own white colophon band */
.colophon{position:absolute;left:0;top:900px;width:1080px;height:180px;z-index:18;
  background:#FFFFFF;border-top:1.5px solid var(--ink)}
.rail{position:absolute;left:var(--pad);top:928px;width:var(--cw);z-index:20;
  display:flex;justify-content:space-between;align-items:center}
.rail .marks{display:flex;align-items:center;gap:22px}
.rail .marks img.tsc{height:${LOGOH}px;width:auto;display:block}
.rail .marks img.shv{height:70px;width:auto;display:block}
.rail .vr{width:1.5px;height:68px;background:var(--rule)}
.rail .util{display:grid;grid-template-columns:29px auto;column-gap:12px;row-gap:4px;
  align-items:center}
.rail .util .ic{grid-column:1;display:flex;align-items:center;justify-content:center}
.rail .util .ic svg{display:block}
.rail .util .ic img{height:26px;width:auto;display:block}
.rail .util .www{grid-column:2;font-family:ArchivoN;font-weight:600;font-size:17px;
  letter-spacing:.012em;white-space:nowrap}
.rail .util .hr{grid-column:1 / -1;height:1px;background:var(--rule);margin:2px 0 1px}
.rail .util .num{grid-column:2;font-family:PlexMono,monospace;font-weight:400;
  font-size:14.5px;letter-spacing:.01em;white-space:nowrap}
</style></head>
<body>
<div class="slide">
  <div class="grain"></div><div class="grain2"></div>
  <div class="halftone"></div>

  <div class="top">
    <div class="lbls"><span>$LABEL_L</span><span>$LABEL_R</span></div>
    <div class="bar"></div>
  </div>

  <div class="head">
    <div class="hl l1"><span id="l1">$HEADWORD</span></div>
    <div class="hero" id="hero"><img src="../../sv/build/hero_$SL.png" alt=""></div>
    <div class="hl l1 over" id="over" aria-hidden="true"><span id="l1o">$HEADWORD</span></div>
  </div>

  <div class="band" id="band"><img src="../../sv/build/band_$SL.png" alt=""></div>
  <div class="bandtag" id="bandtag">$BAND_META</div>

  <div class="cap" id="cap">
    <div class="t">$CAP_T1<em>$CAP_T2</em></div>
    <p>$CAP_BODY</p>
    <div class="m">$CAP_META</div>
  </div>
  $FOUND

  <svg class="geo" width="1080" height="1080" viewBox="0 0 1080 1080" fill="none">
    <line id="diag" x1="1092" y1="0" x2="-12" y2="0" stroke="#D5211B" stroke-width="4"/>
  </svg>
  <div class="mark" id="extmark" style="display:none"></div>
  <div class="blk" id="blk"></div>

  <div class="reg" id="reg">
    <div class="rh"><b>Plates</b><i>$REG_NOTE</i></div>
    <div class="row" id="plrow"></div>
  </div>

  <div class="colophon"></div>
  <div class="rail">
    <div class="marks">
      <img class="tsc" src="../../sv/build/logo_brand.png" alt="$BRANDNAME">
      <div class="vr"></div>
      <img class="shv" src="../../sv/build/logo_shivansh.png" alt="Shivansh Electronics">
    </div>
    <div class="util">
      <span class="ic">
        <svg width="23" height="23" viewBox="0 0 24 24" stroke="#151412" stroke-width="1.6"
             fill="none" stroke-linecap="round">
          <circle cx="12" cy="12" r="9.1"/><ellipse cx="12" cy="12" rx="4.1" ry="9.1"/>
          <path d="M3.3 9.1h17.4M3.3 14.9h17.4"/>
        </svg>
      </span>
      <span class="www">www.shivanshelectronics.in</span>
      <span class="hr"></span>
      <span class="ic"><img src="../../sv/build/icon_whatsapp.png" alt="WhatsApp"></span>
      <span class="num">+91 98316 62458</span>
      <span class="num">+91 91477 00677</span>
      <span class="num">+91 89818 07755</span>
    </div>
  </div>
</div>

<script>
const PLATES = $PLATES, MARK = $MARK;
const BANDW = 672, BANDH = 340, ZONE_TOP = 386, ZONE_BOTTOM = 886, REGL = 692;
// Column count follows plate count so the thumbnails stay as large as the
// register can afford: three across for a short set, five for a dense one.
const COLS = PLATES.length <= 6 ? 3 : PLATES.length <= 12 ? 4 : 5;

document.getElementById('plrow').style.gridTemplateColumns = `repeat($${COLS},1fr)`;
document.getElementById('plrow').innerHTML = PLATES.map((k,i)=>
  `<figure><div class="th"><img src="../../sv/build/pl_$${k}.png" alt=""></div>`+
  `<figcaption>$${String(i+1).padStart(2,'0')}</figcaption></figure>`).join('');

const rr = el => { const b = el.getBoundingClientRect();
  return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };

async function layout(){
  await document.fonts.ready;

  // Measure the text, not its block container, and after the webfonts land.
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;'+
    'white-space:nowrap;font-family:Anton,sans-serif;letter-spacing:-.008em;'+
    'text-transform:uppercase;font-size:100px;line-height:1';
  document.body.appendChild(probe);
  const l1 = document.getElementById('l1');
  const head0 = document.querySelector('.head');
  probe.textContent = l1.textContent;
  const per100 = probe.getBoundingClientRect().width;
  const TARGET = 1096;
  // One line, set to the measure. The word decides the size rather than the
  // other way round, so CONNECTORS lands near 230 and BACKBONE near 287 and
  // both run edge to edge -- the reference poster's system exactly.
  let size = Math.max(205, Math.min(300, TARGET / (per100/100)));
  probe.style.fontSize = size+'px'; probe.textContent = l1.textContent;
  const natural = probe.getBoundingClientRect().width;
  let track = 0;
  if (natural < TARGET) {
    // n characters give n-1 gaps once the trailing space is pulled back off
    const n = Math.max(2, l1.textContent.length);
    // Cap the tracking at an optical maximum and let a short word end short.
    // The vertical budget already pins the size at 300, so a seven-letter word
    // like SURFACE cannot reach the measure by growing -- it can only be pulled
    // apart, and at 27px of spacing it stopped reading as a word at all. Ending
    // at ~85% of the measure is a ragged display line; 27px of tracking is a
    // row of letters. (This binds only on the Model set; the Sonicview words
    // are long enough that their tracking never exceeds 2px.)
    track = Math.min(0.03 * size, (TARGET - natural) / (n - 1));
  }
  probe.remove();

  l1.parentElement.style.fontSize = size+'px';
  // add to the inherited tracking, never replace it
  if (track > 0.4) {
    l1.style.letterSpacing = `calc(-0.008em + $${track}px)`;
    l1.style.marginRight = (-track)+'px';
  }

  // Drop the block until the cap line -- the painted top of the letters, which
  // canvas reports exactly -- sits INK_TOP down the page. Positioning by the
  // line box instead put the caps behind the red rule; both being red, that
  // read as the letters being sliced off rather than overlapped.
  const INK_TOP = 106;
  const cx = document.createElement('canvas').getContext('2d');
  cx.font = `$${size}px Anton`;
  const tm = cx.measureText(l1.textContent);
  const lead = (size * 0.815 - (tm.fontBoundingBoxAscent + tm.fontBoundingBoxDescent)) / 2;
  const inkOff = lead + tm.fontBoundingBoxAscent - tm.actualBoundingBoxAscent;
  head0.style.top = (INK_TOP - inkOff) + 'px';

  // seat the photograph between the first and last glyph, measured with a Range
  // so the kerning pairs are not broken
  const tn = l1.firstChild;
  const charRect = (i) => { const r = document.createRange();
                            r.setStart(tn, i); r.setEnd(tn, i+1);
                            return r.getBoundingClientRect(); };
  const hb = head0.getBoundingClientRect(), r1 = l1.getBoundingClientRect();
  const hero = document.getElementById('hero'), hImg = hero.querySelector('img');
  const ar = hImg.naturalWidth / hImg.naturalHeight;
  const a = charRect(0), z = charRect(tn.length - 1);

  // Size the photograph off the canvas, not off the gap between two glyphs.
  // Letting the gap drive it made the hero swing from 276px to 494px across the
  // set, because a four-letter word tracked to full width leaves a different
  // hole than a six-letter one. A fixed share of the measure reads as the same
  // gesture on all ten. 278 is the tallest that clears both the red rule above
  // and the lower zone below.
  const HMAX = 278;
  let hw = 0.42 * TARGET, hh = hw / ar;
  if (hh > HMAX) { hh = HMAX; hw = hh * ar; }
  if (hw > 0.50 * TARGET) { hw = 0.50 * TARGET; hh = hw / ar; }
  // then place it: centred on the line, but never more than 60% into either end
  // glyph, so the word stays inferable the way BRUTAL does behind the
  // reference's own block
  const lo = a.left + 0.40 * a.width, hi = z.right - 0.40 * z.width;
  let hx = (r1.left + r1.width / 2) - hw / 2;
  if (hi - lo >= hw) hx = Math.min(Math.max(hx, lo), hi - hw);
  const hxr = hx - hb.left, hyr0 = r1.top + (r1.height - hh) / 2;
  hero.style.left = hxr + 'px';
  hero.style.width = hw + 'px';
  let hy = Math.min(Math.max(hyr0, 100), ZONE_TOP - 12 - hh);
  const hyr = hy - hb.top;
  hero.style.top = hyr + 'px';

  // The forward copy: identical metrics, then masked by the hero's own alpha so
  // it exists only where the photograph actually covers the letters. A glyph
  // half behind the chassis gets its buried half brought forward and the rest
  // left alone; a glyph clear of the photograph is untouched, because the mask
  // is empty there and nothing paints.
  const ov = document.getElementById('over'), l1o = document.getElementById('l1o');
  ov.style.fontSize = size + 'px';
  if (track > 0.4) {
    l1o.style.letterSpacing = `calc(-0.008em + $${track}px)`;
    l1o.style.marginRight = (-track)+'px';
  }
  const mi = `url('../../sv/build/hero_$SL.png')`;
  const msz = `$${hw}px $${hh}px`, mps = `$${hxr}px $${hyr}px`;
  ov.style.webkitMaskImage = mi; ov.style.maskImage = mi;
  ov.style.webkitMaskSize = msz; ov.style.maskSize = msz;
  ov.style.webkitMaskPosition = mps; ov.style.maskPosition = mps;

  const headBottom = r1.bottom;

  // the lower zone: photograph left, register right, caption under the photograph
  const band = document.getElementById('band');
  band.style.top = ZONE_TOP + 'px';
  band.style.width = BANDW + 'px';
  band.style.height = BANDH + 'px';

  const reg = document.getElementById('reg');
  reg.style.left = REGL + 'px';
  reg.style.top = ZONE_TOP + 'px';

  // the caption is bottom-aligned to the zone, so its rule sits parallel to the
  // colophon's however many lines of body copy a slide carries
  const cap = document.getElementById('cap');
  cap.style.top = '0px';
  const capH = cap.getBoundingClientRect().height;
  cap.style.top = (ZONE_BOTTOM - capH) + 'px';

  // band tag on a paper chip, at the foot of the photograph
  const tag = document.getElementById('bandtag');
  tag.style.left = (BANDW - tag.getBoundingClientRect().width - 14) + 'px';
  tag.style.top = (ZONE_TOP + BANDH - 30) + 'px';

  // the found fragment rides in the register column, under the plates
  const found = document.getElementById('found');
  if (found) {
    found.style.left = REGL + 'px';
    found.style.top = (reg.getBoundingClientRect().bottom + 18) + 'px';
  }

  // the diagonal crosses the air between the headline and the lower zone
  const d = document.getElementById('diag');
  d.setAttribute('y1', (ZONE_TOP - 44)); d.setAttribute('y2', (ZONE_TOP + 32));
  document.getElementById('blk').style.cssText =
    `left:$${BANDW - 48}px;top:$${ZONE_TOP - 20}px;width:58px;height:44px`;

  if (MARK) {
    const bb = band.getBoundingClientRect();
    const m = document.getElementById('extmark');
    m.style.display = 'block';
    m.style.left   = (bb.left + bb.width  * MARK[0]) + 'px';
    m.style.top    = (bb.top  + bb.height * MARK[1]) + 'px';
    m.style.width  = (bb.width  * MARK[2]) + 'px';
    m.style.height = (bb.height * MARK[3]) + 'px';
  }

  document.documentElement.dataset.ready = '1';
  document.documentElement.dataset.fit = JSON.stringify({
    size: Math.round(size*10)/10, track: Math.round(track*10)/10,
    lineW: Math.round(r1.width), headBottom: Math.round(headBottom),
    hero: [Math.round(hx), Math.round(hw), Math.round(hh)],
    cols: COLS, regRows: Math.ceil(PLATES.length / COLS),
    regBottom: Math.round(reg.getBoundingClientRect().bottom),
    capTop: Math.round(ZONE_BOTTOM - capH), capH: Math.round(capH),
    // everything the verification pass must exclude before it can compare the
    // band's pixels with the supplied frame: the hero's own top edge, and the
    // three graphic elements that are deliberately composited over the band
    heroY: Math.round(hy),
    tag: rr(tag), blk: [BANDW - 48, ZONE_TOP - 20, 58, 44],
    diag: [ZONE_TOP - 44, ZONE_TOP + 32],
    markRect: MARK ? rr(document.getElementById('extmark')) : null
  });
}
layout();
</script>
</body></html>
''')


def build_html(sl, s):
    found = ''
    if 'found' in s:
        found = ('<div class="found" id="found" style="width:270px">'
                 f'<img src="../../sv/build/found_{sl}.png" alt=""></div>')
    n = len(s['plates'])
    html = TPL.substitute(
        SL=sl, LABEL_L=s['labels'][0], LABEL_R=s['labels'][1],
        # the two halves of the 9:16 line break, set as one word on one measure
        HEADWORD=s['head'][0] + s['head'][1],
        CAP_T1=s['cap_title'][0], CAP_T2=s['cap_title'][1],
        CAP_BODY=s['cap_body'], CAP_META=s['cap_meta'],
        BAND_META=s['band_meta'], BANDPOS=s.get('band_pos', 'center'),
        REG_NOTE=('One frame' if n == 1 else f'{n} frames'),
        LOGOH=BRAND['logo_h'], BRANDNAME=BRAND.get('name', 'TASCAM'),
        PLATES=json.dumps(s['plates']),
        MARK=json.dumps(list(s['mark'])) if 'mark' in s else 'null',
        FOUND=found,
    )
    # Only the prepared assets are per-series. The webfonts deliberately stay
    # at one shared path: pointing them at the series directory meant a series
    # without its own copy silently fell back to a wider system face, which
    # then overflowed the measure by 340px with no error raised.
    html = html.replace('../../sv/build/', f'../../{SERIES}/build/')
    p = os.path.join(PAGES, f'sq{sl}.html')
    open(p, 'w').write(html)
    return p


def main(only=None):
    from playwright.sync_api import sync_playwright
    targets = [k for k in sorted(SPEC) if (only is None or k in only)]
    fits, t0 = {}, time.time()
    fitpath = os.path.join(SP, 'fits.json')
    if os.path.exists(fitpath):
        fits = json.load(open(fitpath))
    with sync_playwright() as pw:
        # --allow-file-access-from-files: a CSS mask-image is fetched as a
        # cross-origin resource, and Chromium blocks file:// for those even
        # though an <img> from the same path loads fine. Without it the mask
        # silently resolves to nothing and the forward text layer never paints.
        b = pw.chromium.launch(executable_path=CHROME,
                               args=['--no-sandbox', '--disable-dev-shm-usage',
                                     '--force-color-profile=srgb',
                                     '--allow-file-access-from-files'])
        for sl in targets:
            s = SPEC[sl]
            page = build_html(sl, s)
            pg = b.new_page(viewport={'width': 1080, 'height': 1080}, device_scale_factor=2)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.goto('file://' + page)
            pg.wait_for_function("document.documentElement.dataset.ready==='1'", timeout=40000)
            pg.wait_for_timeout(300)
            fit = pg.evaluate("document.documentElement.dataset.fit")
            stem = s['name'].replace('_', '_sq_', 1) + '.png'
            # control first, in the same page context -- no reload needed
            pg.evaluate("document.getElementById('over').style.display='none'")
            pg.screenshot(path=os.path.join(CTRL, stem), scale='device')
            pg.evaluate("document.getElementById('over').style.display=''")
            out = os.path.join(OUTDIR, stem)
            pg.screenshot(path=out, scale='device')
            pg.close()
            im = Image.open(out)
            ok = 'OK' if im.size == (2160, 2160) else '*** WRONG SIZE ***'
            fits[sl] = json.loads(fit)
            # A line wider than the measure means the display face did not load
            # and a fallback was measured instead -- silent, and it clips the
            # last letters off the canvas.
            if fits[sl]['lineW'] > 1096 + max(12, fits[sl]['track'] * 1.5):
                ok = f"*** LINE OVERFLOWS MEASURE ({fits[sl]['lineW']}pt) ***"
            fits[sl]['ok'] = ok
            print(f"{sl}  {im.size[0]}x{im.size[1]} {ok}  {os.path.getsize(out)/1e6:5.2f} MB  {fit}")
            if errs:
                print('    PAGE ERRORS:', errs)
        b.close()
    json.dump(fits, open(fitpath, 'w'), indent=1)
    print(f'rendered {len(targets)} square slides in {time.time()-t0:.0f}s')


if __name__ == '__main__':
    main(sys.argv[1:] or None)
