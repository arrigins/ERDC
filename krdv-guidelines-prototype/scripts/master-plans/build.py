"""Брендбук «Мастер-планы» → public/master-plans.html (страницы 1920×1080, печать в PDF).

Запуск: python3 build.py
Логотипы — public/master-plans/logo (делает extract-logos.py из исходного AI).
Графика «Радиусы» и плоские макеты носителей рисуются здесь же (SVG).

Сетка страницы: поля 96 px, шапка 48 px сверху, заголовок с 150 px,
сцена (.stage) — от 330 px до нижнего поля. Всё содержимое живёт в сцене,
поэтому нижняя граница одинакова на всех страницах.
"""
import math, os, random, re

ROOT = os.path.join(os.path.dirname(__file__), "../../public")
OUT = os.path.join(ROOT, "master-plans.html")
LOGO = "master-plans/logo/"
PHOTO = "assets/brandbook/raster/"

C = {
    "blue": "#0B2A8C", "coral": "#EC4B50", "sky": "#00BBFA", "ink": "#262425", "white": "#FFFFFF",
    "mute": "#8C9AC6",      # приглушённый девиз на синем
    "pink": "#F8B1B3",      # приглушённый текст на коралловом
    "mist": "#F3F4F8", "line": "#DCDFE8",
}

LOGO_W, LOGO_H = 764.75, 263.75     # габарит логотипа, пт исходника
LOGO_R = LOGO_W / LOGO_H
BAR = 48 / LOGO_H                  # плашка «настоящее будущее» = охранное поле a (доля высоты)
CITY_SIZE = 28.4                   # кегль города в пт исходника
STAGE_W, STAGE_H = 1728, 654       # сцена страницы

NB_WORDS = r"(?<![\w-])(в|во|и|а|с|со|к|ко|о|об|от|до|на|по|за|из|у|не|ни|же|ли|бы|что|как|для|при|без|над|под|это|мы|вы|их|его|её|все|вам|вас)\s"


def T(s):
    s = re.sub(NB_WORDS, lambda m: m.group(1) + " ", s, flags=re.I)
    s = re.sub(NB_WORDS, lambda m: m.group(1) + " ", s, flags=re.I)
    return s.replace(" —", " —")


# ───────────────────────── Графика «Радиусы» ─────────────────────────

def arc(cx, cy, r, a0, a1):
    p = lambda a: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
    x0, y0 = p(a0)
    x1, y1 = p(a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return f"M{x0:.2f} {y0:.2f}A{r:.2f} {r:.2f} 0 {large} 1 {x1:.2f} {y1:.2f}"


def rings(cx, cy, radii, t, segs, color):
    """Кольца из одного центра: radii — радиусы, segs — дуги (a0, a1) для каждого кольца.
    Толщина t, срезы радиальные. pathLength=1 — для анимации прорисовки в веб-версии."""
    out = []
    for r, ring in zip(radii, segs):
        for a0, a1 in ring:
            data = f'data-arc="{cx:.2f} {cy:.2f} {r:.2f} {a0} {a1}"'
            if a1 - a0 >= 360:
                out.append(f'<circle class="arc" pathLength="1" cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" {data}/>')
            else:
                out.append(f'<path class="arc" pathLength="1" d="{arc(cx, cy, r, a0, a1)}" {data}/>')
    return (f'<g class="rings" fill="none" stroke="{color}" stroke-width="{t:.2f}" stroke-linecap="butt">'
            + "".join(out) + "</g>")


_CLIP = [0]


def art(w, h, body, bg=None, t=None, cls="art", extra="", r=0):
    """SVG-макет. Кольца (.rings) прерываются перед элементами .ko — см. brandbook.js.
    r — скругление углов в единицах макета: фон и всё содержимое обрезаются внутри SVG,
    поэтому в PDF края ровные и графика не выходит за плашку."""
    t = t or min(w, h) / 20
    _CLIP[0] += 1
    cid = f"cl{_CLIP[0]}"
    clip = f'<clipPath id="{cid}"><rect width="{w:.2f}" height="{h:.2f}" rx="{r:.2f}"/></clipPath>'
    bgr = f'<rect width="{w:.2f}" height="{h:.2f}" fill="{bg}"/>' if bg else ""
    return (f'<svg class="{cls}" viewBox="0 0 {w:.2f} {h:.2f}" data-t="{t:.2f}" preserveAspectRatio="xMidYMid meet" {extra}>'
            f'{clip}<g clip-path="url(#{cid})">{bgr}{body}</g></svg>')


def logo_img(x, y, w, color="coral", city=None, cls="", city_cls="city", small=False):
    h = w / LOGO_R
    s = w / LOGO_W
    out = f'<image href="{LOGO}mp-{color}{'-small' if small else ''}.svg" x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}"/>'
    if city:
        fill = "#FFFFFF" if color == "white" else C["ink"]
        cities = city if isinstance(city, list) else [city]
        for i, c in enumerate(cities):
            out += (f'<text class="{city_cls} c{i}" style="--i:{i}" x="{x + (874.2 - 111) * s:.2f}" y="{y + (286.75 - 165.75) * s:.2f}" '
                    f'text-anchor="end" font-size="{CITY_SIZE * s:.2f}" font-weight="400" fill="{fill}">{c}</text>')
    return f'<g class="{cls}">{out}</g>'


def plate(x, y, w, color="coral", city=None, anchor="start", small=False):
    """Логотип на белой плашке: поля = охранное поле a, скругление = a."""
    h = w / LOGO_R
    a = BAR * h
    pw = w + 2 * a
    if anchor == "middle":
        x -= pw / 2
    return (f'<g class="ko"><rect x="{x:.2f}" y="{y:.2f}" width="{pw:.2f}" height="{h + 2 * a:.2f}" rx="{a:.2f}" fill="#fff"/>'
            + logo_img(x + a, y + a, w, color, city, small=small) + "</g>")


def avatar(cx, cy, r):
    """Аватарка Минвостокразвития: белый круг с цветным гербом."""
    w = r * 1.3
    h = w * 142.5 / 137.1
    return (f'<g class="ko"><circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="#fff"/>'
            f'<image href="{LOGO}mp-emblem-color.svg" x="{cx - w / 2:.1f}" y="{cy - h * 0.52:.1f}" width="{w:.1f}" height="{h:.1f}"/></g>')


def bubble(x, y, w, lines, size, color=None, lh=1.25, weight=700, av=True):
    """Бабл-сообщение от Минвостокразвития: белая плашка, хвостик слева снизу, под ним — аватарка."""
    color = color or C["blue"]
    pad = size * 1.15
    n = sum(1 for ln in lines if ln) + 0.45 * sum(1 for ln in lines if not ln)
    h = pad * 2 + size * (0.75 + (n - 1) * lh)
    r = size * 1.0
    tail = size * 0.8
    # хвостик: левый край продолжает бабл и плавно уходит вниз, правый — вогнутая дуга
    x0, yb = x + r * 0.55, y + h
    tip = (x + r * 0.15, yb + tail)
    tp = (f"M{x0:.1f} {yb - r:.1f}L{x0:.1f} {yb - 0.5:.1f}"
          f"Q{x0:.1f} {yb + tail * 0.55:.1f} {tip[0]:.1f} {tip[1]:.1f}"
          f"Q{x + r * 1.15:.1f} {yb + tail * 0.75:.1f} {x + r * 1.9:.1f} {yb - 0.5:.1f}Z")
    out, cy = [], y + pad + size * 0.75
    for ln in lines:
        if not ln:
            cy += size * lh * 0.45
            continue
        out.append(f'<tspan x="{x + pad:.1f}" y="{cy:.1f}">{ln}</tspan>')
        cy += size * lh
    g = (f'<g class="ko"><rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r:.1f}" fill="#fff"/>'
         f'<path d="{tp}" fill="#fff"/><text font-size="{size}" font-weight="{weight}" fill="{color}">{"".join(out)}</text></g>')
    if av:
        ar = size * 1.35
        g += avatar(x + ar * 0.9, y + h + tail + ar + size * 0.35, ar)
    return g


def head(x, y, lines, size, anchor="start", lh=1.0, weight=800, color="#fff", ko=True):
    """Заголовок капсом, каждая строка — отдельный элемент (кольца обходят строки по отдельности).
    Строка: str | (str, цвет) | [(str, цвет), ...]."""
    out = []
    for i, ln in enumerate(lines):
        if isinstance(ln, tuple):
            ln = [ln]
        elif isinstance(ln, str):
            ln = [(ln, color)]
        spans = "".join(f'<tspan fill="{c}">{s.upper()}</tspan>' for s, c in ln)
        out.append(f'<text x="{x:.1f}" y="{y + i * size * lh:.1f}" font-size="{size}" '
                   f'font-weight="{weight}" text-anchor="{anchor}">{spans}</text>')
    return f'<g class="{"ko" if ko else ""}">' + "".join(out) + "</g>"


def para(x, y, lines, size, color="#fff", weight=500, lh=1.3, anchor="start", ko=True):
    sp = "".join(f'<tspan x="{x}" y="{y + i * size * lh:.1f}">{ln}</tspan>' for i, ln in enumerate(lines))
    return f'<text class="{"ko" if ko else ""}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{sp}</text>'


SITE = "25городов.рф"


def site(x, y, size, anchor="start", color="#fff"):
    """Адрес сайта проекта на носителях."""
    return para(x, y, [SITE], size, color=color, weight=500, anchor=anchor)


def trapezoid(x, y, w, h, fill, inset):
    return f'<polygon class="ko" points="{x},{y} {x + w},{y} {x + w - inset},{y + h} {x + inset},{y + h}" fill="{fill}"/>'


# ───────────────────────── Страницы ─────────────────────────

pages = []


def page(body, cls="light", section=""):
    n = len(pages) + 1
    hd = ""
    if section:
        hd = f'<header class="ph"><span>Мастер-планы</span><span>{section}</span><span class="ph-num">{n:02d}</span></header>'
    pages.append(f'<section class="page {cls}" id="p{n}">{hd}{body}</section>')
    return n


def ttl(title, lead=None):
    """Подзаголовок: каждое предложение — с новой строки (в PDF строки не рвутся на полуслове)."""
    if lead:
        parts = re.split(r"(?<=[.!?»])\s+(?=[А-ЯЁA-Z«])", lead)
        lead = "<br>".join(T(x) for x in parts)
    return f'<div class="ttl"><h2>{T(title)}</h2>' + (f'<p class="lead">{lead}</p>' if lead else "") + "</div>"


def stage(inner, cls=""):
    return f'<div class="stage {cls}">{inner}</div>'


def notes(*items):
    return '<ul class="notes">' + "".join(f"<li>{T(x)}</li>" for x in items) + "</ul>"


DL = "https://erdc-master-plans.pages.dev/master-plans/logo/"  # абсолютные ссылки — работают и в скачанном PDF


def dl(name, label=None, zip_all=False):
    """Кнопки скачивания логотипа: SVG · PNG · PDF (+ архив всех версий)."""
    btn = "".join(f'<a class="dl-btn" href="{DL}files/{name}.{ext}" download>{ext.upper()}</a>' for ext in ("svg", "png", "pdf"))
    if zip_all:
        btn += f'<a class="dl-btn dl-zip" href="{DL}master-plans-logo.zip" download>Все версии · ZIP</a>'
    lab = f'<span class="dl-label">{label}</span>' if label else ""
    return f'<div class="dl">{lab}{btn}</div>'


def cap(title):
    return f"<figcaption>{T(title)}</figcaption>"


def spec(items):
    return '<dl class="spec">' + "".join(f"<dt>{a}</dt><dd>{T(b)}</dd>" for a, b in items) + "</dl>"


def full_rings(cx, cy, radii, segs, t=48):
    return art(1920, 1080, rings(cx, cy, radii, t, segs, C["coral"]), t=t, cls="art fill")


def divider(num, name, rings_svg):
    return page(f'<div class="bg">{rings_svg}</div><div class="dv"><span class="dv-num">{num}</span>'
                f'<h1 class="dv-title">{T(name)}</h1></div>', "blue divider", name)


def cover(title, sub=""):
    w = 560
    plate_svg = art(w + 2 * BAR * w / LOGO_R, w / LOGO_R * (1 + 2 * BAR), plate(0, 0, w), cls="art")
    rg = full_rings(1500, 760, [300, 492, 684], [[(150, 290)], [(170, 236), (258, 330), (350, 400)], [(196, 250), (268, 318)]])
    return (f'<div class="bg">{rg}</div><div class="cv-plate">{plate_svg}</div>'
            f'<div class="cv-foot"><h1 class="cv-title">{title}</h1>' + (f'<p class="cv-sub">{sub}</p>' if sub else "") + "</div>")


SEC = {}

page(cover("Брендбук", '<span>Версия 1.0</span><span>2026</span>'), "blue cover")
TOC_AT = len(pages)
page("", "light", "Содержание")  # заполняется в конце

# ── 02 Логотип
SEC["01"] = divider("01", "Логотип", full_rings(2000, -40, [330, 522, 714], [[(96, 176)], [(100, 142), (160, 186)], [(106, 170)]]))

page(ttl("Логотип")
     + stage(f'<div class="logo-solo"><img src="{LOGO}mp-coral.svg" alt="Логотип «Мастер-планы»"></div>', "page-center")
     + '<div class="dl-dock">' + dl("mp-coral", "Скачать", zip_all=True) + "</div>", "light", "Логотип")


def clear_space():
    W = 1100
    H = W / LOGO_R
    a = BAR * H
    pad = a + 4
    ox, oy = pad, pad
    b = (f'<rect class="cs-fill" x="{ox - a:.1f}" y="{oy - a:.1f}" width="{W + 2 * a:.1f}" height="{H + 2 * a:.1f}" fill="{C["coral"]}" fill-opacity=".07"/>'
         f'<rect class="cs-line" pathLength="1" x="{ox - a:.1f}" y="{oy - a:.1f}" width="{W + 2 * a:.1f}" height="{H + 2 * a:.1f}" fill="none" stroke="{C["coral"]}" stroke-width="2"/>')
    for i, (x, y) in enumerate([(ox - a, oy - a), (ox + W, oy - a), (ox + W, oy + H), (ox - a, oy + H)]):
        b += (f'<g class="cs-sq" style="--i:{i}"><rect x="{x:.1f}" y="{y:.1f}" width="{a:.1f}" height="{a:.1f}" fill="{C["coral"]}" fill-opacity=".25"/>'
              f'<text x="{x + a / 2:.1f}" y="{y + a / 2 + 9:.1f}" font-size="26" font-weight="500" fill="{C["coral"]}" text-anchor="middle">a</text></g>')
    b += f'<image href="{LOGO}mp-coral.svg" x="{ox}" y="{oy}" width="{W}" height="{H:.1f}"/>'
    return art(W + 2 * pad, H + 2 * pad, b, cls="art cs")


page(ttl("Охранное поле", "Свободное поле вокруг логотипа равно высоте плашки «настоящее будущее».")
     + stage(f'<figure class="fit anim">{clear_space()}</figure>'), "light", "Логотип")

page(ttl("Цветные версии")
     + stage('<div class="versions">' + "".join(
         f'<figure><div class="v-pre"><img src="{LOGO}mp-{c}.svg" alt=""></div>{cap(n)}{dl("mp-" + c)}</figure>'
         for c, n in [("coral", "Основная версия"), ("blue", "Дополнительная версия"), ("sky", "Дополнительная версия")]) + "</div>"), "light", "Логотип")

page(ttl("Версия для малых размеров", "В мелком масштабе используется версия с упрощённым гербом: детали не сливаются и герб остаётся узнаваемым.")
     + stage('<div class="versions">' + "".join(
         f'<figure><div class="v-pre"><img src="{LOGO}mp-{c}-small.svg" alt=""></div>{cap(n)}{dl("mp-" + c + "-small")}</figure>'
         for c, n in [("coral", "Основная версия"), ("blue", "Дополнительная версия"), ("sky", "Дополнительная версия")]) + "</div>"), "light", "Логотип")


def plate_scene(photo=False):
    w, h = 848, 600
    b = ""
    if photo:
        b += f'<image href="{PHOTO}photostyle-composition-12.webp" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"/>'
    b += plate(w / 2, 190, 520, anchor="middle")
    return art(w, h, b, bg=None if photo else C["blue"], r=20)


page(ttl("Логотип на цвете и фото", "На синем фоне и фотографиях логотип ставится на белую подложку. Её поля равны охранному полю.")
     + stage(f'<div class="two"><figure class="fit">{plate_scene()}</figure><figure class="fit">{plate_scene(True)}</figure></div>'), "light", "Логотип")

CITIES = ["Петропавловск-Камчатский", "Владивосток", "Южно-Сахалинск", "Магадан", "Хабаровск", "Анадырь", "Николаевск-на-Амуре"]
loc_big = art(1300, 1300 / LOGO_R + 20, logo_img(0, 10, 1300, "coral", CITIES, city_cls="city cyc"), cls="art loc", extra=f'style="--n:{len(CITIES)}"')
loc_small = "".join(f'<figure>{art(520, 520 / LOGO_R + 8, logo_img(0, 4, 520, "coral", c))}</figure>' for c in ["Владивосток", "Южно-Сахалинск", "Николаевск-на-Амуре"])
page(ttl("Региональная локализация", "Название города стоит над названием проекта и выровнено по его правому краю. Шаблон один для любого города.")
     + stage(f'<div class="loc"><figure class="loc-main anim">{loc_big}</figure><div class="loc-row">{loc_small}</div></div>'), "light", "Логотип")

# ── 03 Цвет и шрифт
SEC["02"] = divider("02", "Цвет и шрифт", full_rings(2060, 640, [330, 522, 714], [[(118, 236)], [(126, 176), (194, 246)], [(132, 206)]]))

palette = [
    ("Синий", C["blue"], "11 · 42 · 140", "100 · 85 · 0 · 10", "main"),
    ("Коралловый", C["coral"], "236 · 75 · 80", "0 · 82 · 62 · 0", "accent"),
    ("Голубой", C["sky"], "0 · 187 · 250", "70 · 5 · 0 · 0", "small"),
    ("Графит", C["ink"], "38 · 36 · 37", "0 · 5 · 0 · 90", "small"),
    ("Белый", "#FFFFFF", "255 · 255 · 255", "0 · 0 · 0 · 0", "small"),
]


def swatch(n, hx, rgb, cmyk, kind):
    light = hx in ("#FFFFFF", C["sky"])
    return (f'<div class="sw sw-{kind}{" sw-light" if light else ""}" style="background:{hx}">'
            f'<b>{n}</b><dl><dt>HEX</dt><dd>{hx}</dd><dt>RGB</dt><dd>{rgb}</dd><dt>CMYK</dt><dd>{cmyk}</dd></dl></div>')


page(ttl("Палитра", "Синий — основной цвет стиля, фон всех носителей. Коралловый — графика и акцентные слова.")
     + stage('<div class="palette">' + swatch(*palette[0]) + swatch(*palette[1])
             + '<div class="sw-col">' + "".join(swatch(*p) for p in palette[2:]) + "</div></div>"), "light", "Цвет и шрифт")

weights = [(800, "ExtraBold", "Слоганы на носителях"), (700, "Bold", "Сообщения от министерства"),
           (500, "Medium", "Подзаголовки и текст"), (400, "Regular", "Сноски, город в логотипе")]
page(ttl("TT Norms Pro", "Фирменный шрифт — геометрический гротеск: чётко читается с расстояния и звучит современно.")
     + stage('<div class="type"><div class="type-aa">Аа</div><div class="type-w">'
             + "".join(f'<div class="w"><span style="font-weight:{w}">Строим будущее</span><em><b>{n}</b>{T(d)}</em></div>' for w, n, d in weights)
             + "</div></div>"), "light", "Цвет и шрифт")


def hierarchy():
    w, h = 1120, 654
    t = 32
    b = rings(640, 360, [330, 470], t, [[(150, 210), (300, 345)], [(165, 200), (328, 360)]], C["coral"])
    b += plate(40, 40, 240)
    b += head(640, 250, ["Строим", "будущее"], 104, anchor="middle", lh=0.98)
    b += head(640, 436, [[("Здесь ", "#fff"), ("будет", C["coral"])]], 60, anchor="middle")
    b += head(640, 612, [("Школа", C["coral"])], 176, anchor="middle")
    return art(w, h, b, bg=C["blue"], t=t, r=20)


page(ttl("Иерархия на носителе")
     + stage(f'<div class="split"><figure class="fit">{hierarchy()}</figure>' + spec([
         ("Слоган", "ExtraBold, капс, белый. Центральная выключка."),
         ("Связка", "Тот же шрифт мельче. Одно слово можно выделить коралловым."),
         ("Объект", "Самое крупное слово — что здесь будет. Коралловый."),
         ("Сообщение", "Bold, строчными — от имени министерства.")]) + "</div>"), "light", "Цвет и шрифт")

# ── 01 Идея
SEC["03"] = divider("03", "Идея", full_rings(2050, 900, [330, 522, 714], [[(150, 270)], [(160, 205), (224, 262)], [(172, 238)]]))


def hero():
    t = 54
    b = rings(1300, 560, [420, 620], t, [[(150, 205), (305, 352)], [(165, 196), (318, 350)]], C["coral"])
    b += plate(96, 96, 520, city="Петропавловск-Камчатский")
    b += head(1300, 380, ["Строим", "будущее"], 150, anchor="middle", lh=0.98)
    b += head(1300, 636, [[("Здесь ", "#fff"), ("будет", C["coral"])]], 86, anchor="middle")
    b += head(1300, 900, [("Школа", C["coral"])], 250, anchor="middle")
    b += bubble(96, 640, 560, ["Скоро здесь будет новая школа", "на 1100 мест — с бассейном", "и стадионом!"], 32)
    return art(1920, 1080, b, bg=C["blue"], t=t, cls="art fill")


page(f'<div class="bg">{hero()}</div>', "blue bleed", "Идея")


def plan_map():
    """Схема мастер-плана: кварталы и река растворяются слева направо, радиусы остаются — так появляется графика."""
    w, h = STAGE_W, STAGE_H
    cx, cy = 520, 300
    rnd = random.Random(11)

    def op(x):
        return 0.09 if x < 260 else max(0.0, 0.09 * (1 - (x - 260) / 820))

    blocks = []
    bw, bh, gap = 104, 74, 20
    for row in range(-1, h // (bh + gap) + 2):
        for col in range(-1, 12):
            if rnd.random() < 0.12:
                continue
            x = col * (bw + gap) + (row % 2) * 30
            y = row * (bh + gap)
            if 440 < y + bh / 2 < 560:      # здесь течёт река
                continue
            o = op(x + bw / 2)
            if o < 0.01:
                continue
            ww = bw * 2 + gap if rnd.random() < 0.15 else bw
            blocks.append(f'<rect x="{x}" y="{y}" width="{ww}" height="{bh}" rx="6" fill="#fff" fill-opacity="{o:.3f}"/>')
    river = (f'<defs><linearGradient id="rv" x1="0" x2="1"><stop offset="0" stop-color="{C["sky"]}" stop-opacity=".45"/>'
             f'<stop offset=".62" stop-color="{C["sky"]}" stop-opacity="0"/></linearGradient></defs>'
             f'<path d="M-20 520 C 220 470, 420 560, 660 505 S 1100 470, 1400 520" fill="none" stroke="url(#rv)" stroke-width="34" stroke-linecap="round"/>')
    b = f'<g class="map">{"".join(blocks)}{river}</g>'
    t = 30
    b += rings(cx, cy, [130, 250, 370, 490], t, [[(0, 360)], [(200, 330), (350, 520)], [(160, 290), (310, 470)], [(190, 330), (345, 440)]], C["coral"])
    b += f'<g class="ko"><circle cx="{cx}" cy="{cy}" r="16" fill="#fff"/></g>'
    b += para(cx + 34, cy + 9, ["Новая школа"], 26, weight=700)
    return art(w, h, b, bg=C["blue"], t=t, r=20)


page(ttl("Графика выросла из мастер-плана",
         "На карте радиусы показывают, кому станет ближе новая школа, поликлиника или парк. Мы сделали их фирменной графикой.")
     + stage(f'<figure class="fit anim">{plan_map()}</figure>'), "light", "Идея")


# ── 04 Графика
SEC["04"] = divider("04", "Фирменная графика", full_rings(1980, 1180, [330, 522, 714], [[(184, 262)], [(190, 226), (242, 272)], [(196, 250)]]))


def step(n):
    w, h = 554, 590
    t = 24
    cx, cy = 277, 295
    radii = [150, 246, 342]
    b = ""
    if n == 1:
        b += "".join(f'<circle class="guide" pathLength="1" cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>' for r in radii)
        b += f'<circle cx="{cx}" cy="{cy}" r="10" fill="#fff"/>'
    elif n == 2:
        b += rings(cx, cy, radii, t, [[(0, 360)]] * 3, C["coral"])
    else:
        b += rings(cx, cy, radii, t, [[(110, 250), (290, 395)], [(150, 228), (250, 300), (330, 420)], [(185, 300), (320, 365)]], C["coral"])
        b += head(cx, cy - 4, ["Здесь", ("будет", C["coral"])], 52, anchor="middle", lh=1.0)
    return art(w, h, b, bg=C["blue"], t=t, r=20)


page(ttl("Как устроена графика", "Радиусы расходятся от места, где строится объект. Кольца разорваны — город строится. В центре — сообщение.")
     + stage('<div class="three anim">' + "".join(f'<figure>{step(i)}{cap(c)}</figure>' for i, c in
                                                 [(1, "Радиусы от точки «здесь»"), (2, "Кольца одной толщины"), (3, "Разрывы и сообщение в центре")]) + "</div>"),
     "light", "Фирменная графика")


def text_case(cut):
    w, h = 848, 590
    t = 28
    b = rings(424, 300, [200, 312, 424], t, [[(150, 260), (290, 400)], [(170, 250), (270, 330), (350, 400)], [(190, 300), (320, 370)]], C["coral"])
    b += head(424, 262, ["Строим", "будущее"], 80, anchor="middle", ko=cut)
    b += head(424, 452, [("здесь", C["coral"])], 110, anchor="middle", ko=cut)
    return art(w, h, b, bg=C["blue"], t=t, r=20)


page(ttl("Графика и текст", "Кольцо прерывается перед буквами. Сообщение читается целиком, графика его обнимает.")
     + stage(f'<div class="two"><figure class="ok">{text_case(True)}{cap("Так")}</figure><figure class="no">{text_case(False)}{cap("Не так")}</figure></div>'),
     "light", "Фирменная графика")


def bad(kind):
    w, h = 554, 590
    t = 24
    if kind == "target":
        return art(w, h, rings(277, 295, [70, 150, 230], t, [[(0, 360)]] * 3, C["coral"]), bg=C["blue"], t=t, r=20)
    if kind == "thick":
        b = (f'<g fill="none" stroke="{C["coral"]}">' + "".join(
            f'<path d="{arc(277, 295, r, sa, sa + 150)}" stroke-width="{sw}"/>' for r, sw, sa in [(80, 8, 200), (160, 48, 330), (240, 16, 150)]) + "</g>")
        return art(w, h, b, bg=C["blue"], t=t, r=20)
    b = (f'<image href="{PHOTO}photostyle-composition-12.webp" width="{w}" height="{h}" preserveAspectRatio="xMidYMid slice"/>'
         + rings(277, 295, [110, 200, 290], t, [[(150, 290)], [(170, 240), (260, 330)], [(190, 300)]], C["coral"]))
    return art(w, h, b, t=t, r=20)


page(ttl("Так нельзя", "Кольца не замыкаются, не меняют толщину и не ложатся на фотографию.")
     + stage('<div class="three">' + "".join(f'<figure class="no">{bad(k)}{cap(n)}</figure>' for k, n in
                                            [("target", "Сплошные кольца — мишень"), ("thick", "Разная толщина"), ("photo", "Кольца поверх фотографии")]) + "</div>"),
     "light", "Фирменная графика")

# ── 05 Коммуникация
SEC["05"] = divider("05", "Коммуникация", full_rings(2160, 300, [330, 522, 714], [[(112, 222)], [(118, 160), (178, 226)], [(128, 206)]]))


def cityformat_stack():
    """Постер 1,2 × 1,8 м. Поля 40, ритм: слоган-эхо, слоган, коралловая плашка, белая плашка с логотипом, сайт."""
    w, h = 400, 600
    t = 20
    # кольца из центра сообщения: слоганы — в центре радиусов, дуги обнимают их по краям
    b = rings(200, 214, [136, 216, 296, 376], t, [[(-40, 20), (160, 218)], [(-62, 20), (150, 262)], [(-24, 20), (160, 214), (236, 300)], [(150, 238), (-16, 14)]], C["coral"])
    b += head(200, 76, [("Строим", C["mute"]), ("будущее", C["mute"]), ("вместе!", C["mute"])], 36, anchor="middle")
    b += head(200, 212, ["Строим", "будущее", "сегодня!"], 36, anchor="middle")
    b += trapezoid(28, 316, 344, 92, C["coral"], 12)
    b += head(200, 352, [("На Дальнем", C["pink"]), ("Востоке", C["pink"])], 30, anchor="middle")
    b += trapezoid(16, 408, 368, 120, "#fff", 12)
    lw = 236
    b += logo_img(200 - lw / 2, 408 + (120 - lw / LOGO_R) / 2, lw, "coral", "Магадан")
    b += site(200, 568, 15, anchor="middle")
    return art(w, h, b, bg=C["blue"], t=t)


page(ttl("Принципы вёрстки")
     + stage(f'<div class="split narrow"><figure class="fit">{cityformat_stack()}</figure>' + spec([
         ("Крупный капс по центру", "Слоган набирается ExtraBold и выключается по центру — как вывеска."),
         ("Ритм слогана", "Слоган повторяется в вариантах: активная строка белая, остальные — приглушённым синим."),
         ("Трапеции", "Плашки со скошенными краями: коралловая — для акцента, белая — для логотипа."),
         ("Одно акцентное слово", "Коралловым выделяем то, что здесь будет: школа, парк, больница.")]) + "</div>"),
     "light", "Коммуникация")


def bubble_anatomy():
    w, h = 1120, 654
    t = 32
    b = rings(1080, 720, [230, 360], t, [[(190, 300)], [(200, 250), (270, 330)]], C["coral"])
    b += bubble(90, 80, 760, ["Ваше здоровье бесценно!", "", "Сохранить его помогут врачи", "в новой больнице. Уже строим", "её для вас."], 44)
    return art(w, h, b, bg=C["blue"], t=t, r=20)


page(ttl("Сообщение от министерства", "Министерство говорит с жителями как в личной переписке: тепло, просто и о пользе для человека.")
     + stage(f'<div class="split"><figure class="fit">{bubble_anatomy()}</figure>' + spec([
         ("Как в мессенджере", "Белое сообщение и аватарка — цветной герб Минвостокразвития в белом круге."),
         ("О пользе для человека", "Что изменится для жителя: врачи в новой больнице, бассейн рядом с домом."),
         ("Коротко и на «вы»", "До пяти строк простыми словами. Bold, синий цвет.")]) + "</div>"),
     "light", "Коммуникация")

# ── 06 Носители
SEC["06"] = divider("06", "Носители", full_rings(2000, -80, [330, 522, 714], [[(94, 176)], [(98, 136), (152, 180)], [(102, 164)]]))


def billboard():
    w, h = 600, 300
    t = 15
    b = rings(400, 165, [150, 220, 290], t, [[(140, 215), (305, 350)], [(150, 196), (214, 262), (320, 356)], [(178, 236), (300, 334)]], C["coral"])
    b += plate(18, 18, 150, city="Петропавловск-Камчатский")
    b += head(400, 92, ["Строим", "будущее"], 48, anchor="middle", lh=0.98)
    b += head(400, 182, [[("Здесь ", "#fff"), ("будет", C["coral"])]], 30, anchor="middle")
    b += head(400, 270, [("Школа", C["coral"])], 84, anchor="middle")
    b += site(18, 282, 13)
    return art(w, h, b, bg=C["blue"], t=t)


page(ttl("Информационный щит 6 × 3 м")
     + stage(f'<div class="carrier"><figure class="fit">{billboard()}</figure>'
             + notes("Сообщение — в центре радиусов.", "Объект — самое крупное слово.", "Логотип с городом — на плашке слева сверху.") + "</div>"),
     "light", "Носители")


def city_photo():
    w, h = 400, 600
    t = 20
    b = f'<image href="{PHOTO}photostyle-composition-6.webp" width="{w}" height="360" preserveAspectRatio="xMidYMid slice"/>'
    b += f'<rect y="360" width="{w}" height="240" fill="{C["blue"]}"/>'
    b += f'<clipPath id="cpb"><rect y="360" width="{w}" height="240"/></clipPath>'
    b += f'<g clip-path="url(#cpb)">{rings(230, 660, [130, 210, 290], t, [[(190, 300)], [(196, 250), (268, 340)], [(200, 262), (290, 345)]], C["coral"])}</g>'
    b += plate(200, 24, 240, city="Магадан", anchor="middle")
    b += bubble(46, 290, 320, ["Скоро здесь будет новый", "образовательный центр!", "", "С лабораториями", "и коворкингом."], 17)
    b += site(372, 582, 15, anchor="end")
    return art(w, h, b, t=t)


page(ttl("Ситиформаты 1,2 × 1,8 м")
     + stage(f'<div class="carrier"><div class="pair"><figure class="fit">{cityformat_stack()}</figure><figure class="fit">{city_photo()}</figure></div>'
             + notes("Слоган в ритме повторов — для серии на одной улице.", "Фото объекта и сообщение от министерства.", "Кольца — только на синем, фото без графики.") + "</div>"),
     "light", "Носители")


def stele():
    """Стела в парке (экран 337 × 632 как на мокапе): логотип сверху, кольца вокруг сообщения, объект внизу."""
    w, h = 400, 750
    t = 14
    b = rings(196, 332, [84, 146, 208, 270], t, [[(190, 260), (300, 360)], [(196, 242), (262, 310), (340, 392)], [(206, 258), (284, 330)], [(214, 250), (300, 346)]], C["coral"])
    b += plate(31, 40, 206)
    b += head(31, 520, ["Больше", "места для"], 48, lh=1.14)
    b += head(31, 630, [("прогулок", C["coral"])], 48)
    b += site(31, 706, 20)
    return art(w, h, b, bg=C["blue"], t=t)


page(ttl("Парки и скверы", "Стела у входа в парк или сквер показывает, как мастер-план меняет городское пространство.")
     + stage(f'<div class="carrier"><figure class="photo-h"><img src="master-plans/mockups/park-stele-v2.webp" alt=""></figure>'
             f'<figure class="fit" id="stele-flat">{stele()}</figure></div>'),
     "light", "Носители")


def sign_plate():
    """Режимник 30 × 40 см у входа в построенный объект. Логотип министерства — как в образце руководителя."""
    w, h = 600, 800
    t = 26
    b = rings(430, 250, [230, 334, 438, 542], t, [[(-90, 70)], [(-84, 62)], [(-76, 50)], [(-66, 36)]], C["coral"])
    for i, ln in enumerate(["Эта", "поликлиника", "появилась", "благодаря", ("мастер-плану", C["coral"])]):
        b += head(52, 138 + i * 58.2, [ln], 56)  # строки — отдельные элементы: кольца обходят каждую
    b += plate(52, 424, 300, small=True)
    mw = 380  # логотип Минвостокразвития (белый, от пользователя), 628.9 × 142.5 — как в образце руководителя
    b += f'<g class="ko"><image href="{LOGO}mvr-logo-white.svg" x="52" y="612" width="{mw}" height="{mw * 142.5 / 628.9:.1f}"/></g>'
    b += site(52, 752, 20)
    return art(w, h, b, bg=C["blue"], t=t)


def sign_photo():
    w, h = 1600, 1213
    b = f'<image href="master-plans/mockups/polyclinic.webp" width="{w}" height="{h}"/>'
    x, y, mw, mh = 574, 868, 44, 59
    b += (f'<rect x="{x}" y="{y}" width="{mw}" height="{mh}" fill="{C["coral"]}" fill-opacity=".35" stroke="{C["coral"]}" stroke-width="6"/>'
          f'<line x1="{x + mw}" y1="{y + mh / 2}" x2="{x + mw + 110}" y2="{y + mh / 2}" stroke="{C["coral"]}" stroke-width="4"/>'
          f'<rect x="{x + mw + 110}" y="{y + mh / 2 - 38}" width="300" height="76" rx="38" fill="{C["coral"]}"/>'
          + para(x + mw + 260, y + mh / 2 + 11, ["Режимник 30 × 40"], 30, weight=700, anchor="middle", ko=False))
    return art(w, h, b, r=20)


page(ttl("Режимник 30 × 40 см", "Табличка у входа в построенный объект: что появилось благодаря мастер-плану.")
     + stage(f'<div class="carrier"><figure class="fit">{sign_photo()}</figure><figure class="fit">{sign_plate()}</figure></div>'),
     "light", "Носители")


def fence():
    w, h = 1500, 260
    t = 13
    b = rings(860, 140, [190, 260], t, [[(150, 215), (325, 390)], [(160, 200), (338, 372)]], C["coral"])
    b += rings(330, 420, [230, 300, 370], t, [[(250, 320)], [(232, 270), (290, 330)], [(240, 300)]], C["coral"])
    b += rings(1380, -60, [160, 230], t, [[(95, 170)], [(100, 135), (150, 182)]], C["coral"])
    b += bubble(60, 34, 430, ["Ваше здоровье бесценно!", "", "Сохранить его помогут врачи", "в новой больнице. Уже строим её для вас."], 17)
    b += head(860, 100, ["Строим"], 52, anchor="middle")
    b += head(860, 162, [("будущее", C["coral"])], 64, anchor="middle")
    b += head(860, 214, ["здесь"], 44, anchor="middle")
    b += plate(1330, 150, 210, city="Петропавловск-Камчатский", anchor="middle")
    b += site(1330, 46, 18, anchor="middle")
    return art(w, h, b, bg=C["blue"], t=t)


page(ttl("Баннер на ограждение", "Длинный формат собирается асимметрично: сообщение, слоган в центре колец, логотип. Группы колец — разного размера.")
     + stage(f'<div class="carrier col"><figure class="fit">{fence()}</figure>'
             + notes("Высота 2–4 м, модуль считается от высоты.", "На длинных ограждениях макет повторяется со сменой сообщений.") + "</div>"),
     "light", "Носители")


def post_sq():
    w = h = 1080
    t = 54
    b = rings(560, 600, [300, 452, 604], t, [[(160, 220), (300, 350)], [(170, 210), (228, 268), (318, 352)], [(186, 240), (290, 330)]], C["coral"])
    b += plate(60, 60, 400, city="Хабаровск")
    b += head(560, 560, [[("Здесь ", "#fff"), ("будет", C["coral"])]], 76, anchor="middle")
    b += head(560, 700, [("набережная", C["coral"])], 128, anchor="middle")
    b += site(540, 1036, 30, anchor="middle")
    return art(w, h, b, bg=C["blue"], t=t)


def story():
    w, h = 1080, 1920
    t = 54
    b = f'<image href="{PHOTO}photostyle-composition-6.webp" width="1080" height="1080" preserveAspectRatio="xMidYMid slice"/>'
    b += f'<rect y="1080" width="1080" height="840" fill="{C["blue"]}"/><clipPath id="cps"><rect y="1080" width="1080" height="840"/></clipPath>'
    b += f'<g clip-path="url(#cps)">{rings(540, 1500, [330, 482, 634], t, [[(150, 230), (300, 380)], [(170, 215), (235, 300), (320, 365)], [(190, 250), (290, 340)]], C["coral"])}</g>'
    b += bubble(54, 890, 780, ["Скоро здесь будет новый", "колледж — с мастерскими", "и общежитием!"], 46)
    b += head(540, 1450, ["Строим", ("будущее", C["coral"]), "здесь"], 96, anchor="middle")
    b += plate(540, 1660, 330, city="Хабаровск", anchor="middle")
    b += site(540, 1876, 34, anchor="middle")
    return art(w, h, b, t=t)


def passport():
    w, h = 800, 600
    t = 20
    b = f'<rect width="{w}" height="{h}" fill="#fff"/><rect width="{w}" height="150" fill="{C["blue"]}"/>'
    b += f'<clipPath id="cpp"><rect width="{w}" height="150"/></clipPath><g clip-path="url(#cpp)">{rings(780, 230, [120, 190], t, [[(190, 280)], [(200, 240), (256, 300)]], C["coral"])}</g>'
    b += plate(30, 30, 230)
    b += para(330, 72, ["ПАСПОРТ ОБЪЕКТА"], 26, weight=800)
    b += para(330, 110, ["Школа на 1100 мест"], 22, weight=500)
    b += f'<image href="{PHOTO}photostyle-composition-12.webp" x="30" y="180" width="350" height="300" preserveAspectRatio="xMidYMid slice"/>'
    rows = [("Адрес", "ул. Ленинградская, 74"), ("Заказчик", "Администрация города"), ("Подрядчик", "ООО «Строитель»"),
            ("Начало работ", "март 2026"), ("Окончание", "август 2027"), ("Ответственный", "+7 (4152) 00-00-00")]
    y = 196
    for k, v in rows:
        b += f'<text x="410" y="{y}" font-size="14" fill="{C["ink"]}" fill-opacity=".55">{k}</text><text x="410" y="{y + 22}" font-size="19" font-weight="500" fill="{C["ink"]}">{v}</text>'
        b += f'<line x1="410" y1="{y + 34}" x2="770" y2="{y + 34}" stroke="{C["line"]}"/>'
        y += 50
    b += f'<rect y="510" width="{w}" height="90" fill="{C["blue"]}"/>'
    b += head(30, 568, [[("Строим будущее ", "#fff"), ("здесь", C["coral"])]], 30)
    b += site(770, 566, 22, anchor="end")
    return art(w, h, b, t=t)


page(ttl("Паспорт объекта")
     + stage(f'<div class="carrier"><figure class="fit bordered">{passport()}</figure>'
             + notes("Обязательный щит на стройке: шапка в фирменном стиле, данные — графитом на белом.", "Состав полей — по требованиям региона. Данные на макете условные.") + "</div>"),
     "light", "Носители")


def slide_title():
    w, h = 1920, 1080
    t = 54
    b = rings(1560, 640, [330, 522, 714], t, [[(150, 260), (300, 380)], [(170, 214), (232, 290), (318, 360)], [(196, 250), (300, 330)]], C["coral"])
    b += plate(96, 96, 440, city="Петропавловск-Камчатский")
    b += head(96, 560, ["Что изменится", "в городе", ("к 2028 году", C["coral"])], 118)
    b += para(96, 984, ["Встреча с жителями  |  Октябрь 2026"], 30, color="#fff")
    b += site(1824, 984, 30, anchor="end")
    return art(w, h, b, bg=C["blue"], t=t)


def slide_content():
    w, h = 1920, 1080
    t = 54
    m, g = 96, 48
    b = f'<rect width="{w}" height="{h}" fill="#fff"/>'
    b += f'<image href="{LOGO}mp-coral.svg" x="{w - m - 300}" y="{m}" width="300" height="{300 / LOGO_R:.1f}"/>'
    b += para(m, m + 26, ["ОБРАЗОВАНИЕ"], 26, color=C["coral"], weight=700)
    b += para(m, m + 116, ["Новая школа на 1100 мест"], 72, color=C["blue"], weight=700)
    top, bot = 300, 900
    pw = 840
    b += (f'<clipPath id="scp"><rect x="{m}" y="{top}" width="{pw}" height="{bot - top}" rx="16"/></clipPath>'
          f'<image href="{PHOTO}photostyle-composition-6.webp" x="{m}" y="{top}" width="{pw}" height="{bot - top}" preserveAspectRatio="xMidYMid slice" clip-path="url(#scp)"/>')
    x2 = m + pw + g * 2
    rw = w - m - x2
    rows = [("1100", "мест для учеников"), ("2027", "год открытия"), ("3", "спортзала и бассейн")]
    rh = 150
    for i, (n, d) in enumerate(rows):
        y0 = top + i * rh
        b += f'<line x1="{x2}" y1="{y0}" x2="{w - m}" y2="{y0}" stroke="{C["line"]}" stroke-width="2"/>'
        b += para(x2, y0 + 112, [n], 104, color=C["blue"], weight=800)
        b += para(x2 + 330, y0 + 98, [d], 36, color=C["ink"], weight=500)
    y0 = top + 3 * rh
    b += f'<line x1="{x2}" y1="{y0}" x2="{w - m}" y2="{y0}" stroke="{C["line"]}" stroke-width="2"/>'
    b += para(x2, bot - 66, ["Готовность"], 32, color=C["ink"], weight=500)
    b += para(w - m, bot - 66, ["45%"], 32, color=C["ink"], weight=700, anchor="end")
    b += f'<rect x="{x2}" y="{bot - 36}" width="{rw}" height="20" rx="10" fill="{C["mist"]}"/><rect x="{x2}" y="{bot - 36}" width="{rw * 0.45:.0f}" height="20" rx="10" fill="{C["coral"]}"/>'
    b += para(m, h - m + 10, ["Данные условные"], 22, color="#8a8f9a", weight=400)
    b += para(w - m, h - m + 10, ["04"], 22, color="#8a8f9a", weight=500, anchor="end")
    return art(w, h, b, t=t)


page(ttl("Презентация")
     + stage(f'<div class="pair wide"><figure class="fit">{slide_title()}</figure><figure class="fit bordered">{slide_content()}</figure></div>'),
     "light", "Носители")

page(ttl("Носители в городе")
     + stage(f'<figure class="photo-full"><img src="master-plans/mockups/city-street.webp" alt=""></figure>'), "light", "Носители")
page(ttl("Ограждение стройки")
     + stage('<div class="two photos"><figure><img src="master-plans/mockups/city-fence.webp" alt=""></figure>'
             '<figure><img src="master-plans/mockups/city-fence-gate.webp" alt=""></figure></div>'), "light", "Носители")
page(ttl("Автобус")
     + stage(f'<figure class="photo-full"><img src="master-plans/mockups/concept-bus-v2.webp" alt=""></figure>'), "light", "Носители")

page(cover("Строим будущее здесь"), "blue cover")

toc = [("01", "Логотип"), ("02", "Цвет и шрифт"), ("03", "Идея"), ("04", "Фирменная графика"), ("05", "Коммуникация"), ("06", "Носители")]
toc_html = ttl("Содержание") + stage('<ol class="toc">' + "".join(
    f'<li><a href="#p{SEC[n]}"><span class="toc-n">{n}</span><span class="toc-t">{t}</span><span class="toc-p">{SEC[n]:02d}</span></a></li>'
    for n, t in toc) + "</ol>")
pages[TOC_AT] = pages[TOC_AT].replace("</header></section>", "</header>" + toc_html + "</section>")

CSS = open(os.path.join(os.path.dirname(__file__), "brandbook.css"), encoding="utf-8").read()
JS = open(os.path.join(os.path.dirname(__file__), "brandbook.js"), encoding="utf-8").read()

html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<!--! TT Norms Pro © TypeType (ООО «ТайпТайп»), https://typetype.org. Используется по веб-лицензии АО «КРДВ» (счёт-договор № КРДВ-001 от 20.11.2023). Копирование и распространение файлов шрифта запрещено. -->
<title>Мастер-планы — брендбук</title>
<style>
{CSS}
</style>
</head>
<body>
<div class="toolbar"><span>Мастер-планы · Брендбук</span><a href="master-plans/master-plans-brandbook.pdf" download>Скачать PDF</a></div>
<main class="deck">
{chr(10).join(pages)}
</main>
<script>
{JS}
</script>
</body>
</html>
"""
open(OUT, "w", encoding="utf-8").write(html)
print("pages:", len(pages), "→", OUT)
