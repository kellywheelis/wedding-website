#!/bin/sh
# Rebuild the screenshot harness from the real project files. Run before every batch of shots.
# It makes a throwaway copy in tools/harness/.work/ : the page with the entry doors, info panel,
# bottom bar and motto hidden, and gallery3d.js with the test hooks (extra.js) appended.
H="$(cd "$(dirname "$0")" && pwd)"; P="$(cd "$H/../.." && pwd)"; W="$H/.work"
mkdir -p "$W" && ln -sfn "$P/assets" "$W/assets" && ln -sfn "$P/game" "$W/game"
python3 - "$P/The Gallery 3D.html" "$W/index.html" <<'PY'
import re,sys
s=open(sys.argv[1]).read()
s=s.replace('</head>','<style>#gate,#motto{display:none !important}</style><script>window.addEventListener("error",function(e){var d=document.createElement("pre");d.style.cssText="position:fixed;left:0;top:0;z-index:999;background:#000;color:#f66;font:13px monospace;padding:6px;white-space:pre-wrap";d.textContent="ERROR "+e.message+" @ "+e.filename+":"+e.lineno;document.body.appendChild(d)})</script></head>',1)
s=re.sub(r"<script>\n// every script is stamped.*?</script>", '<script src="game/arcade.js"></script><script src="game/italy.js"></script><script src="game/piazza.js"></script><script src="game/bouquet.js"></script><script type="module" src="gallery3d.js"></script>', s, flags=re.S)
open(sys.argv[2],'w').write(s)
PY
sed -e "s#camera.rotation.set(cam.pitch + LOOK.y, cam.yaw + LOOK.x, 0, 'YXZ')#camera.rotation.set(cam.pitch + LOOK.y + +(new URLSearchParams(location.search).get('pitch')||0), cam.yaw + LOOK.x, 0, 'YXZ')#" "$P/gallery3d.js" > "$W/gallery3d.js"
cat "$H/extra.js" >> "$W/gallery3d.js"
echo "harness rebuilt in $W"
