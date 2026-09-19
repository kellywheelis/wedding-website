#!/bin/sh
# usage: shot.sh NAME "QUERY"   ->  tools/harness/.work/NAME.png
# Headless-Chrome screenshot of the harness page. Starts a local server on port 8011 if none is
# running. A fresh Chrome profile is used per shot and Chrome is killed once the file lands
# (headless Chrome otherwise lingers and locks the profile).
H="$(cd "$(dirname "$0")" && pwd)"; W="$H/.work"
lsof -i :8011 -sTCP:LISTEN >/dev/null 2>&1 || (cd "$W" && nohup python3 -m http.server 8011 --bind 127.0.0.1 >/dev/null 2>&1 &) ; /bin/sleep 1
PROF="$W/profile-$$"
rm -f "$W/$1.png"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --use-angle=metal --enable-unsafe-swiftshader --hide-scrollbars --window-size=1400,760 --virtual-time-budget=9000 --user-data-dir="$PROF" --screenshot="$W/$1.png" "http://127.0.0.1:8011/index.html?$2" >/dev/null 2>&1 &
i=0; while [ ! -s "$W/$1.png" ] && [ $i -lt 60 ]; do /bin/sleep 1; i=$((i+1)); done
/bin/sleep 1; pkill -f "user-data-dir=$PROF"; rm -rf "$PROF"
ls -la "$W/$1.png"
