#!/usr/bin/env bash
# Cut the reel's music bed: beat-aligned in-point, natural out-point.
# Values come from tools/analyze_audio.py (see README "Music and sync").
set -euo pipefail
cd "$(dirname "$0")/.."
FF=$(python3 -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())" 2>/dev/null || echo ffmpeg)
SRC="../Raavana Mavandaa (Full Video)  Jana Nayagan  Thalapathy Vijay  Pooja Hegde  H Vinoth  Anirudh.mp3"
"$FF" -hide_banner -loglevel error -y -ss 12.559439 -i "$SRC" \
  -af "afade=t=in:st=0:d=0.06,apad,afade=t=out:st=90.45:d=0.25" \
  -t 90.700 -c:a libmp3lame -b:a 256k -ar 44100 public/audio/reel-music.mp3
echo "wrote public/audio/reel-music.mp3"
