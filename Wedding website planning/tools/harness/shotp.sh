#!/bin/sh
# usage: shotp.sh OUT.png URL WIDTH HEIGHT SCALE BUDGET_MS  -> a screenshot of any URL at any size; Chrome is killed by PID once the file lands
OUT="$1"; URL="$2"; W="${3:-390}"; H="${4:-844}"; S="${5:-2}"; B="${6:-9000}"
PROF="$(dirname "$OUT")/.profile-$$"; rm -rf "$PROF"; rm -f "$OUT"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --use-angle=metal --enable-unsafe-swiftshader --hide-scrollbars --window-size="$W,$H" --force-device-scale-factor="$S" --virtual-time-budget="$B" --user-data-dir="$PROF" --screenshot="$OUT" "$URL" >/dev/null 2>&1 &
PID=$!; i=0; while [ ! -s "$OUT" ] && [ $i -lt 120 ]; do sleep 1; i=$((i+1)); done; sleep 1
kill $PID 2>/dev/null; pkill -f "user-data-dir=$PROF" 2>/dev/null; rm -rf "$PROF"; ls -la "$OUT" | awk '{print $5, $9}'
