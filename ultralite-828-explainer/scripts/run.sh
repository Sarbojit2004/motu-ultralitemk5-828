#!/bin/sh
# The whole film, unattended: picture in resumable chunks, then the mastered
# mix, then the cover, then the byte split and its proof.
#
# Every stage is idempotent — anything already on disk is skipped — so if this
# box restarts it can simply be started again.
set -e
cd "$(dirname "$0")/.."
log() { echo "[$(date -u +%H:%M:%S)] $*"; }

if [ ! -f out/motu-ultralite828-explainer-silent.mp4 ]; then
  log "rendering the picture"
  sh scripts/render.sh Explainer motu-ultralite828-explainer 9424 344
fi
if [ ! -f out/motu-ultralite828-explainer.mp4 ]; then
  log "muxing"
  python3 scripts/mux.py video
fi
# The silent join has been consumed. This box has a FIXED writable allowance,
# not a disk, and holding a second copy of a 4K master is what makes a later
# step fail for space.
[ -s out/motu-ultralite828-explainer.mp4 ] && rm -f out/motu-ultralite828-explainer-silent.mp4

[ -f out/motu-ultralite828-explainer-cover.png ] || \
  npx remotion still ThumbnailVideo out/motu-ultralite828-explainer-cover.png --log=error
log "cover done"

[ -d out/motu-ultralite828-explainer-parts ] || sh scripts/split-master.sh out/motu-ultralite828-explainer.mp4
sh scripts/verify-parts.sh motu-ultralite828-explainer
log "ALL DONE"
ls -la out/*.mp4 out/*.png 2>/dev/null | awk '{printf "%12s  %s\n", $5, $9}'
