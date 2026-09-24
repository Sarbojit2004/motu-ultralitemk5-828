#!/bin/sh
# Downloads the ten deployment clips and puts them where the shot plan expects.
#
# RUN THIS ON YOUR OWN MACHINE, not in the build session. The session's egress
# policy denies cloudfront.net, which is where Higgsfield serves every result —
# it can generate but it cannot fetch. Everything else is already done; this is
# the one step that has to happen outside.
#
#   sh scripts/fetch-broll.sh          # into public/broll/
#   git add public/broll && git commit -m "Add the ten deployment clips" && git push
#
# Then, back in the session (or locally):
#   npm run assets          # measures them and writes them into the manifest
#   npm run coverage        # re-proves both films
#   npm run render:reel && npm run render:video
#
# Nothing in the shot plan changes. Every shot that wants a clip already names
# one and falls back to a still until it is there.
set -e
cd "$(dirname "$0")/.."
DEST=public/broll
mkdir -p "$DEST"
BASE=https://d8j0ntlcm91z4.cloudfront.net/user_38HrvKOOtPO8XbBYIfwrYWYySAd

get() { # name  stamp  jobid
  if [ -f "$DEST/$1.mp4" ]; then echo "  have $1.mp4"; return; fi
  echo "  fetching $1.mp4"
  curl -fsSL -o "$DEST/$1.mp4" "$BASE/hf_$2_$3.mp4"
}

get broll-01-home-studio     20260920_215137 dae1bf3c-c618-4e50-9e12-26e5d5871998
get broll-02-podcast-table   20260920_215137 7f44c17c-02be-427a-b228-7a610819a1b8
get broll-03-teaching-lab    20260920_215137 237f0519-a473-4ab2-a8e3-f9709355a33b
get broll-04-rehearsal       20260920_215137 aca6058b-0c7c-4355-a158-8c23a441e2b4
get broll-05-location-kit    20260920_215149 c45acab8-2dec-4af8-b81b-3891c423d4b7
get broll-06-streaming-desk  20260920_215137 d36d5bf1-2572-492a-8969-c76b17aec0c9
get broll-07-dealer-counter  20260920_215137 685f0963-0f4f-40fc-b661-25086070f5a3
get broll-08-listening-room  20260920_215137 c9bac5b3-39c4-4325-8c08-005aa7b60215
get broll-09-live-event      20260920_215137 48c292fb-d9ae-42cf-96b0-81bc57302c18
get broll-10-producers       20260920_215138 123f3f7f-7439-48a6-bf4a-f5650b826262

echo
echo "in $DEST:"
ls -la "$DEST"/*.mp4 2>/dev/null | awk '{printf "  %6.1f MB  %s\n", $5/1048576, $9}'
echo
echo "If a fetch 404s the CDN link has aged out — open the Higgsfield gallery,"
echo "download the ten clips by hand and name them exactly as above."
