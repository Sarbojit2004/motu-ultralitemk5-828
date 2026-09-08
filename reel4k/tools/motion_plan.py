"""Write the frame plan for the Section 3 self-check.

Three timestamps inside every shot's body — 22%, 50% and 78% — which is the
"scrub to three random timestamps" check the brief requires before any scene is
considered finished, applied to all 58 shots rather than spot-checked.
"""
import json, os, re

BEAT = 0.447694 * 30
def beatF(n): return round(n * BEAT)

shots = []
for mod in ['coldOpen', 'ultralite', 'e828', 'close']:
    src = open(os.path.join('src', 'shots', mod + '.tsx')).read()
    for m in re.finditer(r"id: '([^']+)',\s*\n\s*beats: ([\d.]+)", src):
        shots.append((m.group(1), float(m.group(2))))

plan, b = [], 0.0
for sid, bt in shots:
    a, z = beatF(b), beatF(b + bt)
    n = z - a
    plan.append(dict(id=sid, frames=[a + max(1, round(n * p)) for p in (0.22, 0.50, 0.78)]))
    b += bt

os.makedirs('out', exist_ok=True)
json.dump(plan, open('out/motionplan.json', 'w'))
print(f"{len(plan)} shots, {sum(len(p['frames']) for p in plan)} frames -> out/motionplan.json")
