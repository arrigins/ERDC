"""Логотипы «Мастер-планы» из исходного AI (PDF-совместимого) → SVG в кривых.

Запуск: python3 extract-logos.py <путь к .ai>
Нужен pdftocairo (poppler). Исходный AI в репозиторий не кладём (внутри подмножества шрифтов).
Страницы AI: 1 голубой, 2 коралловый, 3 синий; 4–6 — то же с городом (Петропавловск-Камчатский).
"""
import os, re, subprocess, sys, tempfile

OUT = os.path.join(os.path.dirname(__file__), "../../public/master-plans/logo")
VIEWBOX = "111 165.75 773.5 263.75"  # габарит логотипа в пунктах исходника

INK = "rgb(14.901733%, 14.117432%, 14.509583%)"
WHITE = "rgb(100%, 100%, 100%)"
FRAMES = {
    "sky": "rgb(0%, 73.33374%, 98.039246%)",
    "coral": "rgb(92.549133%, 29.411316%, 31.37207%)",
    "blue": "rgb(1.176453%, 4.31366%, 57.255554%)",
}
HEX = {"ink": "#262425", "sky": "#00BBFA", "coral": "#EC4B50", "blue": "#030B92", "navy": "#003577"}
PAGES = {1: "sky", 2: "coral", 3: "blue"}


def page_svg(src, page, tmp):
    out = os.path.join(tmp, f"p{page}.svg")
    subprocess.run(["pdftocairo", "-svg", "-f", str(page), "-l", str(page), src, out], check=True)
    return open(out, encoding="utf-8").read()


def finish(svg, colors, drop_emblem=False):
    """colors: {исходный цвет: новый}. drop_emblem — без герба и строки поддержки (компактная версия)."""
    svg = re.sub(r'width="[^"]+" height="[^"]+" viewBox="[^"]+"', f'viewBox="{VIEWBOX}"', svg, count=1)
    if drop_emblem:
        head, body = svg.split("</defs>", 1)
        frame_fill = next(c for c in FRAMES.values() if c in body)
        cut = body.index(f'fill="{frame_fill}"')
        cut = body.rfind("<path", 0, cut)
        svg = head + "</defs>\n" + body[cut:]
    for src, dst in colors.items():
        svg = svg.replace(f'"{src}"', f'"{dst}"')
    svg = re.sub(r"<\?xml[^>]*>\s*", "", svg)
    return svg


def main(src):
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for page, name in PAGES.items():
            for suffix, p in (("", page), ("-city", page + 3)):
                svg = page_svg(src, p, tmp)
                frame = FRAMES[name]
                colored = finish(svg, {INK: HEX["ink"], WHITE: "#FFFFFF", frame: HEX[name]})
                open(f"{OUT}/mp-{name}{suffix}.svg", "w").write(colored)
                if name == "blue":
                    open(f"{OUT}/mp-black{suffix}.svg", "w").write(
                        finish(svg, {INK: "#000000", WHITE: "#FFFFFF", frame: "#000000"}))
                    # Негатив: всё белое, вырезы (надпись в плашке, просветы герба) — цветом фона
                    open(f"{OUT}/mp-white{suffix}.svg", "w").write(
                        finish(svg, {INK: "#FFFFFF", WHITE: HEX["navy"], frame: "#FFFFFF"}))
                    if not suffix:
                        open(f"{OUT}/mp-compact-blue.svg", "w").write(
                            finish(svg, {INK: HEX["ink"], WHITE: "#FFFFFF", frame: HEX["blue"]}, drop_emblem=True))
    print("ok:", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    main(sys.argv[1])
