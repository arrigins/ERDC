"""SVG → CMYK PDF + EPS для печати (19.10).

SVG — экранный формат (только RGB), поэтому для печати рядом с каждым векторным логотипом
кладём PDF и EPS в DeviceCMYK: чёрный текст — строго 0/0/0/100, белый — 0/0/0/0,
фирменные красный и синий КРДВ — значения из исходного PDF логотипа (5/100/100/0 и 100/75/0/0).
Остальные цвета (знаки режимов) — пересчёт из RGB.

Запуск: python3 scripts/print-vectors.py public/assets/logos/krdv-logo-ru-horizontal.svg [...]
Рядом с каждым SVG появятся .pdf и .eps с тем же именем (--no-eps — только PDF). Нужен пакет svgelements.
"""
import re, sys, zlib
from pathlib import Path
from svgelements import SVG, Shape, Path as SPath, Move, Line, CubicBezier, QuadraticBezier, Arc, Close, Color

BRAND = {
    # красный КРДВ
    **{h: (0.05, 1, 1, 0) for h in ("#dc1318", "#e12227", "#e31f26", "#dc0c18", "#e31e24")},
    # синий КРДВ
    **{h: (1, 0.75, 0, 0) for h in ("#004a99", "#0056a3", "#0054a6", "#0055a2")},
}

def to_cmyk(color):
    r, g, b = color.red / 255, color.green / 255, color.blue / 255
    hexv = "#%02x%02x%02x" % (color.red, color.green, color.blue)
    if hexv in BRAND:
        return BRAND[hexv]
    if max(r, g, b) < 0.2 and max(r, g, b) - min(r, g, b) < 0.05:
        return (0, 0, 0, 1)  # чёрный — только K100
    if min(r, g, b) > 0.98:
        return (0, 0, 0, 0)
    k = 1 - max(r, g, b)
    c, m, y = ((1 - v - k) / (1 - k) for v in (r, g, b))
    return tuple(round(v, 3) for v in (c, m, y, k))

def segments(shape):
    path = abs(SPath(shape)) if not isinstance(shape, SPath) else abs(shape)
    out = []
    for seg in path:
        if isinstance(seg, Move):
            out.append(("m", seg.end))
        elif isinstance(seg, Line):
            out.append(("l", seg.end))
        elif isinstance(seg, CubicBezier):
            out.append(("c", seg.control1, seg.control2, seg.end))
        elif isinstance(seg, QuadraticBezier):
            s, q, e = seg.start, seg.control, seg.end
            out.append(("c", s + (q - s) * (2 / 3), e + (q - e) * (2 / 3), e))
        elif isinstance(seg, Arc):
            for cub in seg.as_cubic_curves():
                out.append(("c", cub.control1, cub.control2, cub.end))
        elif isinstance(seg, Close):
            out.append(("h",))
    return out

def parse_gradients(raw):
    """Линейные градиенты (userSpaceOnUse) из исходного текста SVG: координаты, transform, остановки."""
    grads = {}
    for m in re.finditer(r"<linearGradient([^>]*)>(.*?)</linearGradient>", raw, re.S):
        attrs, inner = m.group(1), m.group(2)
        get = lambda name: (re.search(name + r'="([^"]*)"', attrs) or [None, None])[1]
        x1, y1, x2, y2 = (float(get(n) or 0) for n in ("x1", "y1", "x2", "y2"))
        tf = get("gradientTransform") or ""
        t = re.search(r"translate\(([-\d.]+)[ ,]+([-\d.]+)\)", tf)
        sc = re.search(r"scale\(([-\d.]+)[ ,]+([-\d.]+)\)", tf)
        def apply(x, y):
            if sc:
                x, y = x * float(sc.group(1)), y * float(sc.group(2))
            if t:
                x, y = x + float(t.group(1)), y + float(t.group(2))
            return x, y
        (x1, y1), (x2, y2) = apply(x1, y1), apply(x2, y2)
        stops = [(float(o), Color(c)) for o, c in re.findall(r'<stop[^>]*offset="([\d.]+)"[^>]*stop-color="([^"]+)"', inner)]
        if stops[0][0] > 0:
            stops.insert(0, (0.0, stops[0][1]))
        if stops[-1][0] < 1:
            stops.append((1.0, stops[-1][1]))
        grads[get("id")] = {"coords": (x1, y1, x2, y2), "stops": [(o, to_cmyk(c)) for o, c in stops]}
    return grads

def collect(svg_path):
    raw = Path(svg_path).read_text(encoding="utf-8")
    grads = parse_gradients(raw)
    svg = SVG.parse(str(svg_path), reify=True)
    vb = svg.viewbox
    w, h = (vb.width, vb.height) if vb else (svg.width, svg.height)
    items = []
    for el in svg.elements():
        if not isinstance(el, Shape):
            continue
        fill_value = str(el.values.get("fill", ""))
        ref = re.match(r"url\(#([^)]+)\)", fill_value)
        if ref:
            # заливка градиентом: в PDF — осевая заливка (shading) в CMYK по форме
            evenodd = str(el.values.get("fill-rule", "nonzero")) == "evenodd"
            items.append(({"grad": grads[ref.group(1)]}, evenodd, segments(el)))
            continue
        if el.fill is None or el.fill.value is None or getattr(el.fill, "alpha", 255) == 0:
            continue
        if str(el.values.get("visibility", "")) == "hidden":
            continue
        evenodd = str(el.values.get("fill-rule", "nonzero")) == "evenodd"
        items.append((to_cmyk(el.fill), evenodd, segments(el)))
    return w, h, items

def fmt(v):
    return ("%.3f" % v).rstrip("0").rstrip(".")

def body(items, h, ps=False):
    lines = []
    shade_index = 0
    for color, evenodd, segs in items:
        grad = color.get("grad") if isinstance(color, dict) else None
        if grad:
            if ps:
                raise SystemExit("градиенты поддержаны только в PDF (запускайте с --no-eps)")
            shade_index += 1
            lines.append("q")
        else:
            c, m, y, k = color
            lines.append(f"{fmt(c)} {fmt(m)} {fmt(y)} {fmt(k)} {'setcmykcolor' if ps else 'k'}")
        if ps:
            lines.append("newpath")
        for s in segs:
            if s[0] == "m":
                lines.append(f"{fmt(s[1].x)} {fmt(h - s[1].y)} {'moveto' if ps else 'm'}")
            elif s[0] == "l":
                lines.append(f"{fmt(s[1].x)} {fmt(h - s[1].y)} {'lineto' if ps else 'l'}")
            elif s[0] == "c":
                pts = " ".join(f"{fmt(p.x)} {fmt(h - p.y)}" for p in s[1:])
                lines.append(f"{pts} {'curveto' if ps else 'c'}")
            else:
                lines.append("closepath" if ps else "h")
        if grad:
            lines.append(("W* n" if evenodd else "W n") + f" /Sh{shade_index} sh Q")
        else:
            lines.append(("eofill" if evenodd else "fill") if ps else ("f*" if evenodd else "f"))
    return "\n".join(lines)

def shading_objects(items, h, first_id):
    """PDF-объекты осевых заливок: ShadingType 2 в DeviceCMYK, функция-сшивка из отрезков между остановками."""
    objs, names = [], []
    for color, _, _ in items:
        grad = color.get("grad") if isinstance(color, dict) else None
        if not grad:
            continue
        x1, y1, x2, y2 = grad["coords"]
        stops = grad["stops"]
        funcs = []
        for (o0, c0), (o1, c1) in zip(stops, stops[1:]):
            funcs.append("<< /FunctionType 2 /Domain [0 1] /C0 [%s] /C1 [%s] /N 1 >>" % (" ".join(fmt(v) for v in c0), " ".join(fmt(v) for v in c1)))
        bounds = " ".join(fmt(o) for o, _ in stops[1:-1])
        encode = " ".join("0 1" for _ in funcs)
        fn = "<< /FunctionType 3 /Domain [0 1] /Functions [%s] /Bounds [%s] /Encode [%s] >>" % (" ".join(funcs), bounds, encode)
        obj_id = first_id + len(objs)
        names.append(f"/Sh{len(names) + 1} {obj_id} 0 R")
        objs.append(f"<< /ShadingType 2 /ColorSpace /DeviceCMYK /Coords [{fmt(x1)} {fmt(h - y1)} {fmt(x2)} {fmt(h - y2)}] /Function {fn} /Extend [true true] >>".encode())
    return objs, names

def write_pdf(out, w, h, items, title):
    content = zlib.compress(body(items, h).encode())
    shades, names = shading_objects(items, h, 6)
    resources = f"<< /Shading << {' '.join(names)} >> >>" if names else "<< >>"
    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {fmt(w)} {fmt(h)}] /Contents 4 0 R /Resources {resources} >>".encode(),
        b"<< /Length %d /Filter /FlateDecode >>\nstream\n" % len(content) + content + b"\nendstream",
        f"<< /Title ({title}) /Producer (KRDV brandbook print-vectors) >>".encode(),
        *shades,
    ]
    data = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    offsets = []
    for i, obj in enumerate(objs, 1):
        offsets.append(len(data))
        data += b"%d 0 obj\n" % i + obj + b"\nendobj\n"
    xref = len(data)
    data += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
    data += b"".join(b"%010d 00000 n \n" % o for o in offsets)
    data += b"trailer\n<< /Size %d /Root 1 0 R /Info 5 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, xref)
    out.write_bytes(data)

def write_eps(out, w, h, items, title):
    head = (
        "%!PS-Adobe-3.0 EPSF-3.0\n"
        f"%%Title: {title}\n%%Creator: KRDV brandbook print-vectors\n"
        f"%%BoundingBox: 0 0 {int(-(-w // 1))} {int(-(-h // 1))}\n%%HiResBoundingBox: 0 0 {fmt(w)} {fmt(h)}\n"
        "%%LanguageLevel: 2\n%%DocumentProcessColors: Cyan Magenta Yellow Black\n%%EndComments\n"
    )
    out.write_text(head + "gsave\n" + body(items, h, ps=True) + "\ngrestore\nshowpage\n%%EOF\n", encoding="latin-1", errors="replace")

args = [a for a in sys.argv[1:] if not a.startswith("--")]
with_eps = "--no-eps" not in sys.argv
for arg in args:
    src = Path(arg)
    w, h, items = collect(src)
    write_pdf(src.with_suffix(".pdf"), w, h, items, src.stem)
    if with_eps:
        write_eps(src.with_suffix(".eps"), w, h, items, src.stem)
    used = sorted({str(c) if isinstance(c, tuple) else "градиент" for c, _, _ in items})
    print(src.name, f"{fmt(w)}x{fmt(h)}", len(items), "shapes; CMYK:", used)
