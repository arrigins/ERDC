"""SVG → CMYK PDF + EPS для печати (19.10).

SVG — экранный формат (только RGB), поэтому для печати рядом с каждым векторным логотипом
кладём PDF и EPS в DeviceCMYK: чёрный текст — строго 0/0/0/100, белый — 0/0/0/0,
фирменные красный и синий КРДВ — значения из исходного PDF логотипа (5/100/100/0 и 100/75/0/0).
Остальные цвета (знаки режимов) — пересчёт из RGB.

Запуск: python3 scripts/print-vectors.py public/assets/logos/krdv-logo-ru-horizontal.svg [...]
Рядом с каждым SVG появятся .pdf и .eps с тем же именем (--no-eps — только PDF). Нужен пакет svgelements.
"""
import sys, zlib
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

def collect(svg_path):
    svg = SVG.parse(str(svg_path), reify=True)
    vb = svg.viewbox
    w, h = (vb.width, vb.height) if vb else (svg.width, svg.height)
    items = []
    for el in svg.elements():
        if not isinstance(el, Shape):
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
    for (c, m, y, k), evenodd, segs in items:
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
        lines.append(("eofill" if evenodd else "fill") if ps else ("f*" if evenodd else "f"))
    return "\n".join(lines)

def write_pdf(out, w, h, items, title):
    content = zlib.compress(body(items, h).encode())
    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {fmt(w)} {fmt(h)}] /Contents 4 0 R /Resources << >> >>".encode(),
        b"<< /Length %d /Filter /FlateDecode >>\nstream\n" % len(content) + content + b"\nendstream",
        f"<< /Title ({title}) /Producer (KRDV brandbook print-vectors) >>".encode(),
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
    used = sorted({c for c, _, _ in items})
    print(src.name, f"{fmt(w)}x{fmt(h)}", len(items), "shapes; CMYK:", used)
