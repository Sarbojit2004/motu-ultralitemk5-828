"""Stage the raw MOTU product photography into public/img for this reel.

    python3 tools/prep_images.py

Colour fidelity (master brief S4): NO colour transform of any kind is applied.
Images are only resized (Lanczos, which is colour-preserving) and re-encoded
losslessly-ish: JPEG q=96 with 4:4:4 chroma (no subsampling) or PNG for alpha.
"""
import os, re, json
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

SRC = "/home/user/motu-ultralitemk5-828"
DST = "/home/user/motu-ultralitemk5-828/reel4k/public/img"
os.makedirs(DST, exist_ok=True)
MAXSIDE = 3200

pat = re.compile(r'^MOTU (828|UltraLite-mk5) \((\d+)\)\.(jpg|png)$')
man = []
for f in sorted(os.listdir(SRC)):
    m = pat.match(f)
    if not m:
        continue
    prod, num, ext = m.group(1), int(m.group(2)), m.group(3)
    slug = ("e828" if prod == "828" else "ul") + f"_{num:02d}{ext[0]}"
    im = Image.open(os.path.join(SRC, f))
    ow, oh = im.size
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    scale = min(1.0, MAXSIDE / max(ow, oh))
    if scale < 1.0:
        im = im.resize((max(1, round(ow * scale)), max(1, round(oh * scale))), Image.LANCZOS)
    if has_alpha:
        out = f"{slug}.png"
        im.convert("RGBA").save(os.path.join(DST, out), "PNG", optimize=True)
    else:
        out = f"{slug}.jpg"
        im.convert("RGB").save(os.path.join(DST, out), "JPEG", quality=96, subsampling=0, optimize=True)
    man.append(dict(slug=slug, file=out, src=f, product=prod, num=num,
                    w=im.size[0], h=im.size[1], ow=ow, oh=oh, alpha=has_alpha))
    print(f"{f:34s} -> {out:14s} {ow}x{oh} -> {im.size[0]}x{im.size[1]}")

# logos
for src, out in [("MOTU (Mark of the Unicorn) BRAND LOGO.png", "logo_motu.png"),
                 ("SHIVANSH ELECTRONICS LOGO FOR VIDEO.png", "logo_shivansh.png")]:
    im = Image.open(os.path.join(SRC, src))
    ow, oh = im.size
    s = min(1.0, 1800 / max(ow, oh))
    if s < 1.0:
        im = im.resize((round(ow * s), round(oh * s)), Image.LANCZOS)
    im.convert("RGBA").save("/home/user/motu-ultralitemk5-828/reel4k/public/logo/" + out, "PNG", optimize=True)
    print(f"{src} -> logo/{out} {im.size}")

json.dump(man, open("/tmp/claude-0/-home-user/3c601cef-510f-510f-982c-7be609bc7068/scratchpad/manifest.json", "w"), indent=1)
print("\nTOTAL images:", len(man))
