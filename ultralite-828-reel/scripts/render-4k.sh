#!/usr/bin/env bash
# Renders the 4K master at CRF 17 (quality-targeted, no bitrate cap), then
# splits it by stream copy if it exceeds GitHub's file limit — never re-encoded.
# Run from ultralite-828-reel/:  bash scripts/render-4k.sh
#
# The master is a single continuous render; Remotion retries a crashed browser
# frame on its own. Parts are cut afterwards by scripts/split-mp4.py.
set -uo pipefail
export PATH="$HOME/bin:$PATH"
CONC="${CONCURRENCY:-3}"
mkdir -p out/parts out/qa

node scripts/scan-higgsfield.mjs
node --experimental-strip-types scripts/validate-plan.mjs 2>/dev/null || { echo "shot plan invalid"; exit 1; }

echo "═══ REEL 2160x3840 · 2700 frames ═══"
npx remotion render Reel out/motu-ultralite-828-reel-4k.mp4 --concurrency="$CONC" --codec=h264 --crf=17 --pixel-format=yuv420p \
  2>&1 | tr '\r' '\n' | grep --line-buffered -aoE "Rendered [0-9]+/[0-9]+|.*[Ee]rror.*|.*crash.*" | awk '{ if (++n % 60 == 0 || /rror|crash/) { print strftime("%H:%M:%S"), $0; fflush() } }'

f=out/motu-ultralite-828-reel-4k.mp4
[ -s "$f" ] || { echo "no master written"; exit 1; }
ffmpeg -hide_banner -i "$f" 2>&1 | grep -E "Duration|Stream #" | sed 's/^/    /'
size=$(stat -c%s "$f"); limit=$((95*1024*1024))
if [ "$size" -gt "$limit" ]; then
  echo "  $((size/1024/1024)) MB exceeds GitHub's limit — splitting at keyframes (stream copy, no re-encode)"
  python3 scripts/split-mp4.py "$f" out/parts motu-ultralite-828-reel 88
else
  echo "  $((size/1024/1024)) MB — under the limit, ships whole"
fi
echo "done."
