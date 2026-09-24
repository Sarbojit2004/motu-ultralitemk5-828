#!/bin/sh
# Puts motu-ultralite828-explainer.mp4 back together. Run from inside this directory.
set -e
cat motu-ultralite828-explainer.mp4.part* > motu-ultralite828-explainer.mp4
echo "2946786f2ac7f6ea2039e6501069972ad8ea930e75fa43f239eb513f883790bb  motu-ultralite828-explainer.mp4" | sha256sum -c -
