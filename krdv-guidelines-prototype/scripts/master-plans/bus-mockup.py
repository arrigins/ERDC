"""Автобус: цветокоррекция кузова под фирменный синий и чистые векторные плашки (логотип, герб, слоган).
Запуск (при сервере на 4180 из public/): python3 bus-mockup.py <concept-bus.webp> → public/master-plans/mockups/concept-bus-v2.webp
Исходник — мокап из концепции (1784 px). Кузов увеличивается вдвое, плашки рисуются поверх векторно."""
import os, sys, subprocess, tempfile
import numpy as np
from PIL import Image

src = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, "../../public")
OUT = os.path.join(PUB, "master-plans/mockups/concept-bus-v2.webp")
K = 2

im = Image.open(src).convert("RGB")
W, H = im.size
a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
# кузов: синий с сероватым оттенком → фирменный #0B2A8C (множители подобраны по средним цветам кузова)
body = np.clip((b - r - 25) / 25, 0, 1) * np.clip((b - g - 25) / 25, 0, 1)
red = np.clip((r - g - 70) / 30, 0, 1) * np.clip((r - b - 70) / 30, 0, 1)
out = a.copy()
for c, mul in enumerate((0.5, 1.0, 1.3)):
    out[..., c] = a[..., c] * (1 - body) + np.clip(a[..., c] * mul, 0, 255) * body
out[..., 0] = out[..., 0] * (1 - red) + np.clip(out[..., 0] * 1.22, 0, 255) * red   # коралловый ближе к #EC4B50
base = Image.fromarray(out.astype(np.uint8)).resize((W * K, H * K), Image.LANCZOS)

html = f"""<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:N;font-weight:800;src:url(/fonts/TT-Norms-Pro-ExtraBold.woff2)}}
html,body{{margin:0;background:transparent}}svg{{display:block}}</style>
<svg id="s" xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
<rect x="560" y="231" width="649" height="80" rx="22" fill="#fff"/>
<text x="884.5" y="285" text-anchor="middle" font-family="N" font-weight="800" font-size="38" fill="#0B2A8C">СТРОИМ БУДУЩЕЕ СЕГОДНЯ!</text>
<circle cx="474" cy="263" r="31" fill="#fff"/>
<image href="/master-plans/logo/mp-emblem-color.svg" x="{474-20.2}" y="{263-21*1.04*0.52*1.9:.1f}" width="40.4" height="42"/>
<rect x="1424" y="228" width="226" height="94" rx="18" fill="#fff"/>
<image href="/master-plans/logo/mp-coral.svg" x="1437" y="241" width="200" height="{200/764.75*263.75:.1f}"/>
</svg>"""
tmp = os.path.join(PUB, "_bus-overlay.html")
open(tmp, "w", encoding="utf-8").write(html)
ov = os.path.join(tempfile.gettempdir(), "bus-overlay.png")
js = f"""const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();const p=await b.newPage({{viewport:{{width:{W},height:{H}}},deviceScaleFactor:{K}}});
await p.goto('http://localhost:4180/_bus-overlay.html');await p.evaluate(()=>Promise.all([document.fonts.ready,...[...document.images].map(i=>i.decode())]));await p.waitForTimeout(300);
await p.screenshot({{path:{ov!r},omitBackground:true}});await b.close()}})()"""
subprocess.run(["node", "-e", js], check=True, cwd=HERE)
os.remove(tmp)
over = Image.open(ov).convert("RGBA")
base = base.convert("RGBA"); base.alpha_composite(over)
base.convert("RGB").save(OUT, quality=90)
print(OUT, base.size)
