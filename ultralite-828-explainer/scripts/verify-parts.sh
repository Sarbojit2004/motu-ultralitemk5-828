#!/bin/sh
# Proves a split master goes back together EXACTLY.
#
# The films ship as pieces because GitHub refuses a file over 100 MB, and the
# instruction was the uncompressed original — so a master is cut, never
# squeezed. A cut is only honest if it reverses, and "ffmpeg wrote some files"
# is not evidence of that. See scripts/split-master.sh for why the pieces are
# byte ranges rather than playable segments; the short version is that
# rejoining AAC segments drifted the sound 21.3 ms against the picture.
#
#   sh scripts/verify-parts.sh motu-m-series-reel
set -e
cd "$(dirname "$0")/.."
BASE=$1
D="out/$BASE-parts"
[ -d "$D" ] || { echo "no parts directory: $D"; exit 1; }

echo "parts:"
ls -la "$D"/$BASE.mp4.part* | awk '{printf "  %7.1f MB  %s\n", $5/1048576, $9}'
OVER=$(find "$D" -name "$BASE.mp4.part*" -size +99M | wc -l)
[ "$OVER" -eq 0 ] || { echo "FAIL: $OVER part(s) over GitHub's 100 MB ceiling"; exit 1; }

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
cat "$D"/$BASE.mp4.part* > "$TMP/$BASE.mp4"

WANT=$(cut -d' ' -f1 "$D/SHA256SUM")
GOT=$(sha256sum "$TMP/$BASE.mp4" | cut -d' ' -f1)
echo "recorded  $WANT"
echo "rejoined  $GOT"
[ "$WANT" = "$GOT" ] || { echo "FAIL: the rejoin does not reproduce the master"; exit 1; }

# And against the master still on disk, when there is one — the recorded sum
# could in principle have been taken from something that no longer exists.
if [ -f "out/$BASE.mp4" ]; then
  LIVE=$(sha256sum "out/$BASE.mp4" | cut -d' ' -f1)
  [ "$LIVE" = "$GOT" ] || { echo "FAIL: the master on disk differs from the recorded sum"; exit 1; }
  echo "master on disk matches too"
fi

~/bin/ffmpeg -hide_banner -i "$TMP/$BASE.mp4" 2>&1 | grep -E "Duration|Stream" | sed 's/^/  /'
echo "PASS: every part under 100 MB, and the rejoin is byte-identical to the master"
