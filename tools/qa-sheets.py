import os, math, json, sys
from PIL import Image, ImageDraw, ImageFont
SRC=sys.argv[1]; OUT=sys.argv[2]; SCH=sys.argv[3]
os.makedirs(OUT, exist_ok=True)
S=json.load(open(SCH))
files=[f"{b['chapter'] if 'chapter' in b else 0}-{b['id']}.png" for b in S["beats"]]
files=[f for f in files if os.path.exists(os.path.join(SRC,f))]
portrait = S["height"] > S["width"]
try: font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
except: font=ImageFont.load_default()
if portrait: CW,CH,COLS,ROWS = 300,533,6,2
else:        CW,CH,COLS,ROWS = 620,349,3,4
PER=COLS*ROWS; PAD=10; LBL=26
for s in range(math.ceil(len(files)/PER)):
    chunk=files[s*PER:(s+1)*PER]
    sheet=Image.new("RGB",(COLS*(CW+PAD)+PAD, ROWS*(CH+LBL+PAD)+PAD),(225,228,233)); d=ImageDraw.Draw(sheet)
    for j,f in enumerate(chunk):
        x=PAD+(j%COLS)*(CW+PAD); y=PAD+(j//COLS)*(CH+LBL+PAD)
        sheet.paste(Image.open(os.path.join(SRC,f)).convert("RGB").resize((CW,CH), Image.LANCZOS),(x,y))
        d.rectangle([x,y,x+CW,y+CH], outline=(150,156,166), width=1)
        d.text((x+3,y+CH+3), f[:-4], fill=(10,14,20), font=font)
    sheet.save(f"{OUT}/qa{s+1}.png")
print(f"{math.ceil(len(files)/PER)} sheets from {len(files)} stills")
