"""Логотипы «Мастер-планы» из исходного AI (PDF-совместимого) → чистые SVG в кривых.

Запуск: python3 extract-logos.py <путь к .ai>
Нужны pdftocairo (poppler) и пакеты skia-pathops, svgelements, fonttools.
Исходный AI в репозиторий не кладём (внутри подмножества шрифтов).

Очистка: рисунок проходится в порядке наложения, обрезки-маски применяются пересечением,
белые детали вырезаются из того, что под ними, пустые обводки (мусор из AI) отбрасываются.
В итоге в файле на каждый цвет — один сплошной контур: без масок, обводок и белых подложек.
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


def _pp(d, fill_rule="nonzero"):
    import pathops, svgelements
    p = pathops.Path(fillType=pathops.FillType.EVEN_ODD if fill_rule == "evenodd" else pathops.FillType.WINDING)
    for seg in svgelements.Path(d):
        if isinstance(seg, svgelements.Move):
            p.moveTo(seg.end.x, seg.end.y)
        elif isinstance(seg, svgelements.Close):
            p.close()
        elif isinstance(seg, svgelements.Line):
            p.lineTo(seg.end.x, seg.end.y)
        elif isinstance(seg, svgelements.CubicBezier):
            p.cubicTo(seg.control1.x, seg.control1.y, seg.control2.x, seg.control2.y, seg.end.x, seg.end.y)
        elif isinstance(seg, svgelements.QuadraticBezier):
            p.quadTo(seg.control.x, seg.control.y, seg.end.x, seg.end.y)
        elif isinstance(seg, svgelements.Arc):
            for c in seg.as_cubic_curves():
                p.cubicTo(c.control1.x, c.control1.y, c.control2.x, c.control2.y, c.end.x, c.end.y)
    return p


def _d(path):
    from fontTools.pens.svgPathPen import SVGPathPen
    pen = SVGPathPen(None, ntos=lambda v: ("%.3f" % v).rstrip("0").rstrip("."))
    path.draw(pen)
    return pen.getCommands()


def flatten(svg):
    """SVG от pdftocairo → {цвет: контур}. Белый — «пустота», из итога выкидывается."""
    import pathops
    import xml.etree.ElementTree as ET
    NS = "{http://www.w3.org/2000/svg}"
    root = ET.fromstring(svg)
    clips = {}
    for cp in root.iter(NS + "clipPath"):
        shape = None
        for el in cp:
            d = el.get("d") if el.tag == NS + "path" else None
            if el.tag == NS + "rect":
                x, y, w, h = (float(el.get(k)) for k in ("x", "y", "width", "height"))
                d = f"M{x} {y}H{x + w}V{y + h}H{x}Z"
            if d:
                q = _pp(d, el.get("clip-rule", "nonzero"))
                shape = q if shape is None else pathops.op(shape, q, pathops.PathOp.INTERSECTION)
        clips[cp.get("id")] = shape
    regions = {}

    def paint(color, area):
        for k in list(regions):
            if k != color:
                regions[k] = pathops.op(regions[k], area, pathops.PathOp.DIFFERENCE)
        regions[color] = pathops.op(regions[color], area, pathops.PathOp.UNION) if color in regions else area

    def walk(node, clip):
        for el in node:
            if el.tag == NS + "defs":
                continue
            c = clip
            ref = el.get("clip-path")
            if ref:
                cs = clips[ref[5:-1]]
                c = cs if c is None else pathops.op(c, cs, pathops.PathOp.INTERSECTION)
            if el.tag == NS + "g":
                walk(el, c)
            elif el.tag == NS + "path" and el.get("fill", "none") != "none" and not el.get("transform"):
                area = _pp(el.get("d"), el.get("fill-rule", "nonzero"))
                if c is not None:
                    area = pathops.op(area, c, pathops.PathOp.INTERSECTION)
                paint(el.get("fill"), area)
            # обводки нулевой длины и прочий мусор из AI не переносим
    walk(root, None)
    for k in regions:
        regions[k].simplify()
    return regions


def clean_svg(regions, colors, viewbox=VIEWBOX):
    body = "".join(f'<path fill="{colors[k]}" d="{_d(v)}"/>' for k, v in regions.items() if colors.get(k))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}">{body}</svg>\n'


def finish(svg, colors, viewbox=VIEWBOX):
    svg = re.sub(r'width="[^"]+" height="[^"]+" viewBox="[^"]+"', f'viewBox="{viewbox}"', svg, count=1)
    for a, b in colors.items():
        svg = svg.replace(f'"{a}"', f'"{b}"')
    return re.sub(r"<\?xml[^>]*>\s*", "", svg)


def main(src):
    os.makedirs(OUT, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for page, suffix in ((1, ""), (2, "-small")):
            reg = flatten(page_svg(src, page, tmp))
            # чёрные детали в AI — часть рисунка герба, сливаем с основным тёмным
            if BLACK in reg:
                import pathops
                reg[INK] = pathops.op(reg.get(INK, pathops.Path()), reg.pop(BLACK), pathops.PathOp.UNION)
                reg[INK].simplify()
            for name, hx in VERSIONS.items():
                open(f"{OUT}/mp-{name}{suffix}.svg", "w").write(clean_svg(reg, {INK: INK_HEX, FRAME: hx}))
            open(f"{OUT}/mp-black{suffix}.svg", "w").write(clean_svg(reg, {INK: "#000000", FRAME: "#000000"}))
            # белая версия: всё белое, вырезы прозрачные — работает на любом фоне
            import pathops
            allp = pathops.op(reg[INK], reg[FRAME], pathops.PathOp.UNION)
            open(f"{OUT}/mp-white{suffix}.svg", "w").write(clean_svg({"all": allp}, {"all": "#FFFFFF"}))
    print("ok:", sorted(os.listdir(OUT)))


if __name__ == "__main__":
    main(sys.argv[1])
