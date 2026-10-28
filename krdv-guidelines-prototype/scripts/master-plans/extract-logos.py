"""Логотипы «Мастер-планы» из исходного AI (PDF-совместимого) → SVG в кривых.

Запуск: python3 extract-logos.py <путь к .ai>
Нужен pdftocairo (poppler). Исходный AI в репозиторий не кладём (внутри подмножества шрифтов).
Страницы AI (версия 28.10): 1 — основной, 2 — для малых размеров (упрощённый герб),
3–4 — то же с регионом. Цветные, чёрная и белая версии получаются перекраской основного.
"""
import os, re, subprocess, sys, tempfile

OUT = os.path.join(os.path.dirname(__file__), "../../public/master-plans/logo")
VIEWBOX = "111 165.75 764.75 263.75"  # габарит логотипа в пунктах исходника

INK = "rgb(13.725281%, 12.156677%, 12.548828%)"
WHITE = "rgb(100%, 100%, 100%)"
BLACK = "rgb(0%, 0%, 0%)"
FRAME = "rgb(86.66687%, 35.293579%, 34.117126%)"
# цвет рамки приводим к палитре брендбука
VERSIONS = {"coral": "#EC4B50", "blue": "#0B2A8C", "sky": "#00BBFA"}
INK_HEX, NAVY = "#262425", "#0B2A8C"


def page_svg(src, page, tmp):
    out = os.path.join(tmp, f"p{page}.svg")
    subprocess.run(["pdftocairo", "-svg", "-f", str(page), "-l", str(page), src, out], check=True)
    return open(out, encoding="utf-8").read()


def finish(svg, colors, viewbox=VIEWBOX):
    svg = re.sub(r'width="[^"]+" height="[^"]+" viewBox="[^"]+"', f'viewBox="{viewbox}"', svg, count=1)
    for a, b in colors.items():
        svg = svg.replace(f'"{a}"', f'"{b}"')
    return re.sub(r"<\?xml[^>]*>\s*", "", svg)


def main(src):
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for page, suffix in ((1, ""), (2, "-small")):
            svg = page_svg(src, page, tmp)
            for name, hx in VERSIONS.items():
                open(f"{OUT}/mp-{name}{suffix}.svg", "w").write(finish(svg, {INK: INK_HEX, WHITE: "#FFFFFF", BLACK: "#000000", FRAME: hx}))
            open(f"{OUT}/mp-black{suffix}.svg", "w").write(finish(svg, {INK: "#000000", WHITE: "#FFFFFF", BLACK: "#000000", FRAME: "#000000"}))
            # негатив: всё белое, вырезы (надпись в плашке, просветы герба) — цветом фона
            open(f"{OUT}/mp-white{suffix}.svg", "w").write(finish(svg, {INK: "#FFFFFF", WHITE: NAVY, BLACK: "#FFFFFF", FRAME: "#FFFFFF"}))
    print("ok:", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    main(sys.argv[1])
