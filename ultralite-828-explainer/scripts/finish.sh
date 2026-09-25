#!/bin/sh
# Mux the reel, render the explainer, mux it, rebuild both covers.
#
# Separate from pipeline.sh and started as its own process group, because the
# last run was lost when a process-tree walk aimed at the renderer took the
# pipeline with it. Every stage is idempotent, so this can simply be started
# again after any interruption.
set -e
cd "$(dirname "$0")/.."
log() { echo "[$(date -u +%H:%M:%S)] $*"; }

if [ ! -f out/motu-m-series-reel.mp4 ]; then log "muxing reel"; python3 scripts/mux.py reel; fi
log "reel master ready"

if [ ! -f out/motu-m-series-explainer-silent.mp4 ]; then
  log "rendering the explainer"
  sh scripts/render.sh Explainer motu-m-series-explainer 8950 358
fi
if [ ! -f out/motu-m-series-explainer.mp4 ]; then log "muxing explainer"; python3 scripts/mux.py video; fi
log "explainer master ready"

npx remotion still ThumbnailReel  out/motu-m-series-reel-cover.png --log=error
npx remotion still ThumbnailVideo out/motu-m-series-explainer-cover.png --log=error
log "FINISH COMPLETE"
ls -la out/*.mp4 out/*.png | awk '{printf "%10s  %s\n",$5,$9}'
