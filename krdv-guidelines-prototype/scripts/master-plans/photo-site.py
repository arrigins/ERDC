"""Дописывает адрес сайта «25городов.рф» на макеты в фотографиях носителей (мелкий белый текст TT Norms Medium).
Запуск (при сервере на 4180 из public/): python3 photo-site.py
Исходники — public/master-plans/mockups/src/*.webp (до добавления адреса), результат — рядом, без src/.
Каждая запись: файл → список (x, y, размер, поворот°, якорь) в пикселях фото."""
import os, subprocess, tempfile
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, "../../public")
MK = os.path.join(PUB, "master-plans/mockups")
JOBS = {
    "city-fence.webp": [(157, 770, 28, 1.9, "start")],
    "city-street.webp": [(1096, 752, 14, 0, "middle"), (1423, 622, 12.5, -1.3, "start"), (172, 910, 14.5, -2.2, "start")],
}
for name, items in JOBS.items():
    src = os.path.join(MK, "src", name)
    im = Image.open(src).convert("RGB")
    W, H = im.size
    texts = "".join(
        f'<text x="{x}" y="{y}" font-size="{s}" font-family="N" font-weight="500" fill="#fff" text-anchor="{a}" transform="rotate({r} {x} {y})">25городов.рф</text>'
        for x, y, s, r, a in items)
    html = (f'<!doctype html><meta charset="utf-8"><style>@font-face{{font-family:N;font-weight:500;src:url(/fonts/TT-Norms-Pro-Medium.woff2)}}'
            f'html,body{{margin:0;background:transparent}}svg{{display:block}}</style>'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{texts}</svg>')
    tmp = os.path.join(PUB, "_ov.html")
    open(tmp, "w", encoding="utf-8").write(html)
    ov = os.path.join(tempfile.gettempdir(), "photo-ov.png")
    js = (f"const {{chromium}}=require('playwright');(async()=>{{const b=await chromium.launch();"
          f"const p=await b.newPage({{viewport:{{width:{W},height:{H}}},deviceScaleFactor:3}});"
          f"await p.goto('http://localhost:4180/_ov.html');await p.evaluate(()=>document.fonts.load('500 20px N'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);"
          f"await p.screenshot({{path:{ov!r},omitBackground:true}});await b.close()}})()")
    subprocess.run(["node", "-e", js], check=True, cwd=HERE)
    os.remove(tmp)
    o = Image.open(ov).convert("RGBA").resize((W, H), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.45))
    # чуть приглушаем, чтобы текст «сидел» на баннере
    a = o.split()[3].point(lambda v: int(v * 0.92))
    o.putalpha(a)
    base = im.convert("RGBA"); base.alpha_composite(o)
    base.convert("RGB").save(os.path.join(MK, name), quality=92)
    print(name, W, H)
