#!/usr/bin/env bash
# Renders both 4K masters at CRF 17 (quality-targeted, no bitrate cap), then
# splits anything over GitHub's file limit by stream copy — never re-encoded.
# Run from avb-series-film/:  bash scripts/render-4k.sh [reel|film|all]
#
# Both masters are single continuous renders; Remotion retries a crashed
# browser frame on its own. Parts are cut afterwards by scripts/split-mp4.py.
set -uo pipefail
export PATH="$HOME/bin:$PATH"
WHAT="${1:-all}"
CONC="${CONCURRENCY:-2}"
mkdir -p out/parts out/qa

node scripts/scan-higgsfield.mjs
node --experimental-strip-types scripts/validate-plan.mjs 2>/dev/null || { echo "shot plan invalid"; exit 1; }

render_reel() {
  echo "═══ REEL 2160x3840 · 2700 frames ═══"
  npx remotion render Reel out/motu-avb-reel-4k.mp4 --concurrency="$CONC" --codec=h264 --crf=17 --pixel-format=yuv420p \
    2>&1 | tr '\r' '\n' | grep --line-buffered -aoE "Rendered [0-9]+/[0-9]+|.*[Ee]rror.*" | awk '{ if (++n % 150 == 0 || /rror/) { print strftime("%H:%M:%S"), $0; fflush() } }'
}

render_film() {
  echo "═══ FILM 3840x2160 · 9000 frames, one continuous render ═══"
  npx remotion render Film out/motu-avb-film-4k.mp4 --concurrency="$CONC" --codec=h264 --crf=17 --pixel-format=yuv420p \
    2>&1 | tr '\r' '\n' | grep --line-buffered -aoE "Rendered [0-9]+/[0-9]+|.*[Ee]rror.*|.*crash.*" | awk '{ if (++n % 150 == 0 || /rror|crash/) { print strftime("%H:%M:%S"), $0; fflush() } }'
}

package() {
  local f="$1" base="$2"
  [ -s "$f" ] || return 0
  ffmpeg -hide_banner -i "$f" 2>&1 | grep -E "Duration|Stream #" | sed 's/^/    /'
  local size; size=$(stat -c%s "$f"); local limit=$((95*1024*1024))
  if [ "$size" -gt "$limit" ]; then
    echo "  $((size/1024/1024)) MB exceeds GitHub's limit — splitting at keyframes (stream copy, no re-encode)"
    python3 scripts/split-mp4.py "$f" out/parts "$base" 88
  else
    echo "  $((size/1024/1024)) MB — under the limit, ships whole"
  fi
  # No downscaled or re-encoded copies: the client asked for the 4K masters
  # exactly as rendered — split into parts by stream copy only if needed.
}

case "$WHAT" in
  reel) render_reel; package out/motu-avb-reel-4k.mp4 motu-avb-reel ;;
  film) render_film; package out/motu-avb-film-4k.mp4 motu-avb-film ;;
  all) render_reel; package out/motu-avb-reel-4k.mp4 motu-avb-reel; render_film; package out/motu-avb-film-4k.mp4 motu-avb-film ;;
esac
echo "done."
