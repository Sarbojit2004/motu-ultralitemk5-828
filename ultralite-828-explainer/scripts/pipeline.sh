#!/bin/sh
# Everything after the reel's chunks: mux, render the explainer, mux, covers,
# and split both masters into playable segments under GitHub's 100 MB ceiling.
#
# Run unattended. Each stage is idempotent — anything already on disk is
# skipped — so if the box restarts this can simply be started again.
set -e
cd "$(dirname "$0")/.."
SP=/tmp/claude-0/-home-user/5add9b72-8882-5bc8-a930-175fa0fdfeba/scratchpad/ms
FF=~/bin/ffmpeg

log() { echo "[$(date -u +%H:%M:%S)] $*"; }

# ── 1. wait for the reel's silent join ──────────────────────────────────────
log "waiting for the reel"
prev=-1
while [ ! -f out/motu-m-series-reel-silent.mp4 ]; do
  cur=$(ls out/motu-m-series-reel-chunks/chunk*.mp4 2>/dev/null | wc -l)
  [ "$cur" != "$prev" ] && { log "reel chunks: $cur/8"; prev=$cur; }
  sleep 30
done
log "reel picture done"

# ── 2. the reel's audio ─────────────────────────────────────────────────────
[ -f out/motu-m-series-reel.mp4 ] || { log "muxing reel"; python3 scripts/mux.py reel; }
# The silent join has been consumed. This box has a FIXED writable allowance,
# not a disk — df reports terabytes and still refuses a write — and holding a
# second copy of a 4K master for no reason is what makes the explainer's join
# fail four hours in.
[ -s out/motu-m-series-reel.mp4 ] && rm -f out/motu-m-series-reel-silent.mp4

# ── 3. the explainer ────────────────────────────────────────────────────────
if [ ! -f out/motu-m-series-explainer-silent.mp4 ]; then
  log "rendering the explainer"
  sh scripts/render.sh Explainer motu-m-series-explainer 8950 358
fi
[ -f out/motu-m-series-explainer.mp4 ] || { log "muxing explainer"; python3 scripts/mux.py video; }
[ -s out/motu-m-series-explainer.mp4 ] && rm -f out/motu-m-series-explainer-silent.mp4

# ── 4. the covers ───────────────────────────────────────────────────────────
[ -f out/motu-m-series-reel-cover.png ] || \
  npx remotion still ThumbnailReel out/motu-m-series-reel-cover.png --log=error
[ -f out/motu-m-series-explainer-cover.png ] || \
  npx remotion still ThumbnailVideo out/motu-m-series-explainer-cover.png --log=error
log "covers done"

# ── 5. playable segments under the 100 MB ceiling ───────────────────────────
# Stream copy, so nothing is re-encoded and rejoining is a concatenation rather
# than a render. The user asked for the uncompressed original, not a smaller
# version of it — so the master is cut, never squeezed.
for BASE in motu-m-series-reel motu-m-series-explainer; do
  D="out/$BASE-parts"
  if [ ! -d "$D" ]; then
    mkdir -p "$D"
    # Solved from THIS render's own size, not from the last one's. Restoring
    # the camera motion took the reel from 6.1 to 15.7 Mbps and a segment
    # length that had been comfortable came within 5 MB of the ceiling.
    SEG=$(python3 -c "
import os,sys
mb = os.path.getsize('out/$BASE.mp4') / 1048576
dur = {'motu-m-series-reel': 95.9, 'motu-m-series-explainer': 308.3}['$BASE']
# 78 MB a part leaves room for the keyframe alignment ffmpeg needs: a segment
# boundary lands on the next keyframe, never exactly where it was asked for.
print(max(6, int(dur * 78.0 / max(mb, 1e-6))))
")
    log "splitting $BASE (${SEG}s segments)"
    $FF -v error -y -i "out/$BASE.mp4" -c copy -map 0 -f segment \
      -segment_time "$SEG" -reset_timestamps 1 -movflags +faststart \
      "$D/$BASE-part%02d.mp4"
    : > "$D/rejoin.txt"
    for f in "$D"/$BASE-part*.mp4; do echo "file '$(basename "$f")'" >> "$D/rejoin.txt"; done
  fi
  log "$BASE parts:"
  ls -la "$D" | awk '{printf "    %10s  %s\n", $5, $9}' | grep -v '^\s*$'
done

log "PIPELINE COMPLETE"
ls -la out/*.mp4 out/*.png 2>/dev/null | awk '{printf "%12s  %s\n", $5, $9}'
