#!/usr/bin/env bash
# Trim the rendered master's container to the composition's exact length.
#
# LAME pads the music bed to an MP3 frame boundary, which leaves ~50 ms of
# silence past the last video frame and makes players report 90.75 s for a
# 90.700 s film. This clips the container to the reel's real runtime without
# re-encoding either stream (master brief S6: the music duration must match the
# reel's runtime exactly).
set -euo pipefail
cd "$(dirname "$0")/.."
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())" 2>/dev/null || echo ffmpeg)
IN=${1:-out/motu-camera-motion-reel.mp4}
TMP="${IN%.mp4}.trimmed.mp4"
"$FF" -hide_banner -loglevel error -y -i "$IN" -t 90.700 -c copy -movflags +faststart "$TMP"
mv "$TMP" "$IN"
"$FF" -hide_banner -i "$IN" 2>&1 | grep -E "Duration|Stream"
