#!/usr/bin/env bash
# Turns a GIF (or any clip) into the web video pair a zone screen plays.
#
#   scripts/transcode-media.sh orion.gif          # -> public/media/orion.webm + orion.mp4
#   scripts/transcode-media.sh synthesis.mov synthesis
#
# ffmpeg is not on PATH on the authoring machine; run through nix:
#   nix shell nixpkgs#ffmpeg -c scripts/transcode-media.sh orion.gif
#
# Output is 1280 px wide, 24 fps, muted, with a VP9 webm as the primary and an
# H.264 mp4 as the fallback. Then set `src: "/media/<zone>.webm"` on the
# screen's entry in src/simulator/world/zoneScreens.ts.
set -euo pipefail

input="${1:?usage: transcode-media.sh <input> [name]}"
name="${2:-$(basename "${input%.*}")}"
out="$(dirname "$0")/../public/media"
mkdir -p "$out"

filters="scale=1280:-2:flags=lanczos,fps=24,format=yuv420p"

ffmpeg -y -i "$input" -an -vf "$filters" \
  -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -deadline good \
  "$out/$name.webm"

ffmpeg -y -i "$input" -an -vf "$filters" \
  -c:v libx264 -preset slow -crf 23 -movflags +faststart \
  "$out/$name.mp4"

ls -la "$out/$name.webm" "$out/$name.mp4"
