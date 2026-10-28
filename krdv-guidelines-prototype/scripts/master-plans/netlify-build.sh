#!/usr/bin/env bash
# Отдельный сайт брендбука «Мастер-планы» на Netlify: только его файлы, без гайда КРДВ.
set -euo pipefail
SRC=krdv-guidelines-prototype/public
OUT=netlify-mp
rm -rf "$OUT" && mkdir -p "$OUT/fonts" "$OUT/assets/brandbook/raster"
cp "$SRC/master-plans.html" "$OUT/index.html"
cp -r "$SRC/master-plans" "$OUT/"
for w in Regular Medium Bold ExtraBold; do cp "$SRC/fonts/TT-Norms-Pro-$w.woff2" "$OUT/fonts/"; done
grep -oE 'assets/brandbook/raster/[^"]+' "$SRC/master-plans.html" | sort -u | while read -r f; do cp "$SRC/$f" "$OUT/$f"; done
# старый адрес страницы тоже открывается
printf '/master-plans.html  /  301\n' > "$OUT/_redirects"
