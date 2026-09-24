#!/bin/sh
# Renders one composition in resumable chunks, video-only, then joins by stream
# copy. A single 8950-frame 4K pass is hours of work that Remotion cannot
# resume; this box has restarted mid-render before and taken the whole thing
# with it. Each chunk survives on disk, so a restart costs one chunk.
#
# Video-only because concatenating chunks that each carry their own audio
# segment risks drift at every join. The full mastered mix is attached
# afterwards, as one continuous track with no joins in it at all.
#
#   scripts/render.sh Reel  motu-m-series-reel        2696 344
#   scripts/render.sh Explainer motu-m-series-explainer 8950 358
set -e
cd "$(dirname "$0")/.."
COMP=$1; BASE=$2; TOTAL=$3; STEP=$4
CONC=${REMOTION_CONCURRENCY:-4}
OUT=out/$BASE-chunks
mkdir -p "$OUT"
i=0
while [ $((i * STEP)) -lt "$TOTAL" ]; do
  a=$((i * STEP)); b=$((a + STEP - 1))
  [ $b -ge "$TOTAL" ] && b=$((TOTAL - 1))
  f="$OUT/chunk$(printf %02d $i).mp4"
  if [ -f "$f" ]; then
    echo "=== $COMP chunk $i ($a-$b) already done"
  else
    echo "=== $COMP chunk $i ($a-$b)  $(date -u +%H:%M:%S)"
    # Rendered under a scratch name and moved on success: a chunk killed
    # halfway leaves a partial file, and a partial file carrying the final
    # name would be skipped by the check above. (The scratch name still ends
    # .mp4 — Remotion rejects any other extension for h264.)
    npx remotion render "$COMP" "$OUT/wip$(printf %02d $i).mp4" \
      --frames="$a-$b" --muted --concurrency="$CONC" --log=info
    mv "$OUT/wip$(printf %02d $i).mp4" "$f"
  fi
  i=$((i + 1))
done
echo "=== joining  $(date -u +%H:%M:%S)"
: > "$OUT/list.txt"
for f in "$OUT"/chunk*.mp4; do echo "file '$PWD/$f'" >> "$OUT/list.txt"; done
~/bin/ffmpeg -v error -y -f concat -safe 0 -i "$OUT/list.txt" -c copy \
  -movflags +faststart "out/$BASE-silent.mp4"
# The chunks have served their purpose once the join exists, and this box does
# not have room to keep a second copy of a 4K master lying around.
if [ -s "out/$BASE-silent.mp4" ]; then
  rm -rf "$OUT"
  echo "=== chunks cleared"
fi
echo "=== done  $(date -u +%H:%M:%S)"
ls -la "out/$BASE-silent.mp4"
