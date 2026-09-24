#!/bin/sh
# Cuts a 4K master into pieces that fit GitHub, and can be put back EXACTLY.
#
# WHY NOT ffmpeg -f segment. That is the obvious answer and it is wrong here.
# It produces individually playable segments, but each one carries its own AAC
# encoder priming, so rejoining them does not give back the master: measured on
# the 89.9 s reel, the rejoin came out 1024 samples — one AAC frame, 21.3 ms —
# LONGER, and 99.5% of its samples differed from the original, worst case
# -0.9 dBFS. The picture rejoined bit-identically; the sound drifted 21 ms
# against it for the whole back half of the film. Small, inaudible in isolation,
# and completely unacceptable in something called a master.
#
# So the master is split by BYTES and rejoined with cat. A byte split has no
# opinion about codecs, priming or timestamps: the concatenation IS the
# original file, and sha256 proves it. The parts are not individually playable,
# which is the price — and the reason a single-file 1080p viewing copy ships
# alongside them, so nobody has to rejoin anything just to watch it.
#
#   sh scripts/split-master.sh out/motu-m-series-reel.mp4
set -e
cd "$(dirname "$0")/.."
SRC=$1
[ -f "$SRC" ] || { echo "no such master: $SRC"; exit 1; }
BASE=$(basename "$SRC" .mp4)
D="out/$BASE-parts"
rm -rf "$D"; mkdir -p "$D"

# 78 MB a part: comfortably inside the 100 MB ceiling with room for the .part
# suffix to never be the thing that matters.
split -b 78M -d -a 2 "$SRC" "$D/$BASE.mp4.part"

SUM=$(sha256sum "$SRC" | cut -d' ' -f1)
cat > "$D/rejoin.sh" <<EOF
#!/bin/sh
# Puts $BASE.mp4 back together. Run from inside this directory.
set -e
cat $BASE.mp4.part* > $BASE.mp4
echo "$SUM  $BASE.mp4" | sha256sum -c -
EOF
chmod +x "$D/rejoin.sh"
printf '%s  %s\n' "$SUM" "$BASE.mp4" > "$D/SHA256SUM"

echo "$BASE split into:"
ls -la "$D"/$BASE.mp4.part* | awk '{printf "  %7.1f MB  %s\n", $5/1048576, $9}'
