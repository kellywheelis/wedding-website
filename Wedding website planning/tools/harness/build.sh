#!/bin/sh
# Rebuild the screenshot harness from the real project files. Run before every batch of shots.
# It makes a throwaway copy in tools/harness/.work/ : the page with the entry doors, info panel,
# bottom bar and motto hidden, and gallery3d.js with the test hooks (extra.js) appended.
H="$(cd "$(dirname "$0")" && pwd)"; P="$(cd "$H/../.." && pwd)"; W="$H/.work"
mkdir -p "$W" && ln -sfn "$P/assets" "$W/assets"
sed -e 's#</head>#<style>\#gate,\#label,\#nav,\#motto{display:none !important}</style></head>#' -e 's#gallery3d.js?v=[0-9]*#gallery3d.js#' "$P/The Gallery 3D.html" > "$W/index.html"
sed -e "s#camera.rotation.set(cam.pitch, cam.yaw, 0, 'YXZ')#camera.rotation.set(cam.pitch + +(new URLSearchParams(location.search).get('pitch')||0), cam.yaw, 0, 'YXZ')#" "$P/gallery3d.js" > "$W/gallery3d.js"
cat "$H/extra.js" >> "$W/gallery3d.js"
echo "harness rebuilt in $W"
