"""Брендбук «Мастер-планы» → public/master-plans.html (страницы 1920×1080, печать в PDF).

Запуск: python3 build.py
Логотипы берутся из public/master-plans/logo (их делает extract-logos.py из исходного AI).
Графика «Радиусы» и плоские макеты носителей рисуются здесь же (SVG).
"""
import math, os, re

ROOT = os.path.join(os.path.dirname(__file__), "../../public")
OUT = os.path.join(ROOT, "master-plans.html")
LOGO = "master-plans/logo/"
PHOTO = "assets/brandbook/raster/"

C = {
    "ultra": "#030B92", "navy": "#003577", "coral": "#EC4B50", "sky": "#00BBFA",
    "ink": "#262425", "white": "#FFFFFF", "mist": "#EEF1F6", "line": "#D5DAE3",
}

# Логотип: габарит 773.5 × 263.75 (пт исходника); всё ниже — доли высоты H
LOGO_W, LOGO_H = 773.5, 263.75
LOGO_R = LOGO_W / LOGO_H
BAR = 48 / LOGO_H          # плашка «настоящее будущее» = охранное поле a
STROKE = 14 / LOGO_H       # толщина рамки x

NB_WORDS = r"(?<![\w-])(в|во|и|а|с|со|к|ко|о|об|от|до|на|по|за|из|у|не|ни|же|ли|бы|что|как|для|при|без|над|под|это|мы|вы|их|его|её|все|1|2|3)\s"


def T(s):
    """Типограф: неразрывный пробел после коротких слов и перед тире."""
    s = re.sub(NB_WORDS, lambda m: m.group(1) + " ", s, flags=re.I)
    s = re.sub(NB_WORDS, lambda m: m.group(1) + " ", s, flags=re.I)
    return s.replace(" —", " —")


# ───────────────────────── Графика «Радиусы» ─────────────────────────

def arc(cx, cy, r, a0, a1):
    """Дуга по часовой стрелке от a0 до a1 (градусы, 0 — вправо)."""
    p = lambda a: (cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
    x0, y0 = p(a0)
    x1, y1 = p(a1)
    large = 1 if (a1 - a0) % 360 > 180 else 0
    return f"M{x0:.2f} {y0:.2f}A{r:.2f} {r:.2f} 0 {large} 1 {x1:.2f} {y1:.2f}"


def rings(cx, cy, r0, t, segs, color, step=4):
    """Группа колец из одного центра. segs — по кольцу список дуг (a0, a1).
    Толщина кольца t, шаг колец step·t, срезы радиальные (butt)."""
    out = []
    for i, ring in enumerate(segs):
        r = r0 + i * step * t
        for a0, a1 in ring:
            if a1 - a0 >= 360:
                out.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}"/>')
                continue
            out.append(f'<path d="{arc(cx, cy, r, a0, a1)}"/>')
    return f'<g fill="none" stroke="{color}" stroke-width="{t:.2f}" stroke-linecap="butt">{"".join(out)}</g>'


def logo_img(x, y, w, color="blue", city=None, cls=""):
    """Логотип внутри SVG-макета. city — название города (набирается TT Norms Pro Regular)."""
    h = w / LOGO_R
    s = w / LOGO_W
    out = f'<image href="{LOGO}mp-{color}.svg" x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}"/>'
    if city:
        fill = "#FFFFFF" if color == "white" else C["ink"]
        out += (f'<text x="{x + (882.4 - 111) * s:.2f}" y="{y + (286.75 - 165.75) * s:.2f}" text-anchor="end" '
                f'font-size="{CITY_SIZE * s:.2f}" font-weight="400" fill="{fill}" class="city">{city}</text>')
    return f'<g class="{cls}">{out}</g>'


CITY_SIZE = 28.4  # кегль названия города в пт исходника (подогнан по Петропавловску-Камчатскому)


def plate(x, y, w, color="blue", city=None, radius=None):
    """Логотип на белой плашке: поля = охранное поле a, скругление = a/2."""
    h = w / LOGO_R
    a = BAR * h
    r = a / 2 if radius is None else radius
    return (f'<g class="ko"><rect x="{x:.2f}" y="{y:.2f}" width="{w + 2 * a:.2f}" height="{h + 2 * a:.2f}" rx="{r:.2f}" fill="#fff"/>'
            + logo_img(x + a, y + a, w, color, city) + "</g>")


def bubble(x, y, w, h, lines, size, t, color=None, fill="#fff", tail="left", lh=1.28, weight=700):
    """Реплика: белая плашка со скруглением t/2 и «хвостиком» снизу."""
    color = color or C["navy"]
    r = t * 0.6
    tl = t * 0.9
    if tail == "left":
        tx = x + t * 0.5
        tailp = f"M{tx:.1f} {y + h - 1:.1f}L{tx:.1f} {y + h + tl:.1f}L{tx + tl * 1.4:.1f} {y + h - 1:.1f}Z"
    else:
        tx = x + w - t * 0.5
        tailp = f"M{tx:.1f} {y + h - 1:.1f}L{tx:.1f} {y + h + tl:.1f}L{tx - tl * 1.4:.1f} {y + h - 1:.1f}Z"
    pad = t * 0.9
    txt = []
    cy = y + pad + size * 0.92
    for ln in lines:
        if ln == "":
            cy += size * 0.5
            continue
        txt.append(f'<tspan x="{x + pad:.1f}" y="{cy:.1f}">{ln}</tspan>')
        cy += size * lh
    return (f'<g class="ko"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r:.1f}" fill="{fill}"/>'
            f'<path d="{tailp}" fill="{fill}"/>'
            f'<text font-size="{size}" font-weight="{weight}" fill="{color}">{"".join(txt)}</text></g>')


def text_block(x, y, lines, size, color="#fff", weight=800, lh=0.98, anchor="start", caps=True, ls=0, cls="ko"):
    """Многострочный заголовок. lines — строки или (строка, цвет)."""
    out = []
    for i, ln in enumerate(lines):
        col = color
        if isinstance(ln, tuple):
            ln, col = ln
        out.append(f'<tspan x="{x}" y="{y + i * size * lh:.1f}" fill="{col}">{ln.upper() if caps else ln}</tspan>')
    tt = ""
    return (f'<text class="{cls}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" '
            f'style="{tt}letter-spacing:{ls}em">{"".join(out)}</text>')


def art(w, h, body, bg=None, t=None, cls="art", extra=""):
    """SVG-макет. Кольца (class=rings) автоматически прерываются перед текстом (class=ko) — см. скрипт внизу."""
    t = t or min(w, h) / 20
    bgr = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg class="{cls}" viewBox="0 0 {w} {h}" data-t="{t:.2f}" preserveAspectRatio="xMidYMid meet" {extra}>'
            f'{bgr}{body}</svg>')


def ring_layer(inner):
    return f'<g class="rings">{inner}</g>'


# ───────────────────────── Вёрстка страниц ─────────────────────────

pages = []
SECTIONS = {}


def page(body, cls="", section="", title=""):
    n = len(pages) + 1
    head = ""
    if section:
        head = (f'<header class="ph"><span class="ph-brand">Мастер-планы · Брендбук</span>'
                f'<span class="ph-sec">{section}</span><span class="ph-num">{n:02d}</span></header>')
    if title:
        SECTIONS.setdefault(section, n)
    pages.append(f'<section class="page {cls}" id="p{n}">{head}{body}</section>')
    return n


def h(title, lead=None, cls=""):
    lead_html = f'<p class="lead">{T(lead)}</p>' if lead else ""
    return f'<div class="ttl {cls}"><h2>{T(title)}</h2>{lead_html}</div>'


def ps(*texts):
    return "".join(f"<p>{T(x)}</p>" for x in texts)


def ul(*items):
    return "<ul>" + "".join(f"<li>{T(x)}</li>" for x in items) + "</ul>"


def divider(num, name, note, rings_svg):
    body = (f'<div class="dv-bg">{rings_svg}</div>'
            f'<div class="dv-num">{num}</div><h1 class="dv-title">{name}</h1>'
            f'<p class="dv-note">{T(note)}</p>')
    return page(body, "navy divider", name, name)


# ── типовые кольца для разделителей и обложки (формат 1920×1080, t = 54)
def deck_rings(cx, cy, r0, segs, color=None, step=4, t=54):
    return art(1920, 1080, ring_layer(rings(cx, cy, r0, t, segs, color or C["coral"], step)), t=t, cls="fill")


# 1. Обложка
cover_rings = deck_rings(1760, 1240, 324, [
    [(190, 300)],
    [(196, 248), (266, 330)],
    [(200, 236), (254, 316)],
])
page(f'''<div class="dv-bg">{cover_rings}</div>
<div class="cv-plate">{art(1000, 1000 / LOGO_R + 2 * BAR * 1000 / LOGO_R, plate(0, 0, 1000 - 2 * BAR * 1000 / LOGO_R), cls="cv-logo")}</div>
<div class="cv-foot"><p class="cv-kind">Брендбук</p><p class="cv-sub">{T("Руководство по фирменному стилю проекта")}</p><p class="cv-ver">Версия 1.0 · 2026</p></div>''', "navy cover")

# 2. Содержание
toc = [("01", "Проект и идея", "3"), ("02", "Логотип", "5"), ("03", "Цвет", "15"), ("04", "Типографика", "18"),
       ("05", "Графика «Радиусы»", "21"), ("06", "Элементы и тон", "30"), ("07", "Носители", "33")]
page(h("Содержание") + '<ol class="toc">' + "".join(
    f'<li><span class="toc-n">{n}</span><span class="toc-t">{t}</span><span class="toc-p">{p}</span></li>' for n, t, p in toc
) + "</ol>", "light", "Содержание")
TOC_INDEX = len(pages) - 1

# ── 01 Проект и идея
divider("01", "Проект и идея", "Что за проект, для кого он и на чём держится фирменный стиль.",
        deck_rings(2060, 540, 324, [[(118, 242)], [(124, 172), (190, 238)], [(140, 212)]]))

page(h("О проекте", "«Мастер-планы» — проект о том, как меняются города Дальнего Востока по мастер-планам, которые поддерживает Минвостокразвития России.")
     + '<div class="cols3">'
     + '<div><h3>Что это</h3>' + ps("Мастер-план — долгосрочный план развития города: школы, больницы, спортивные объекты, набережные, дороги, общественные пространства.", "Фирменный стиль объединяет всё, что жители видят на улице: щиты на стройках, ограждения, транспорт, сообщения в соцсетях.") + "</div>"
     + '<div><h3>Для кого</h3>' + ps("Для жителей городов — тех, кто каждый день проходит мимо строящихся объектов.", "Главная задача — коротко и понятно сказать, что строится, зачем и когда это будет готово.") + "</div>"
     + '<div><h3>«Настоящее будущее»</h3>' + ps("Девиз проекта работает в двух смыслах: будущее, которое строится по-настоящему, и будущее, которое начинается уже сейчас.", "Отсюда тон стиля: конкретно, близко к человеку, без лозунгов ради лозунгов.") + "</div>"
     + "</div>"
     + '<div class="band">' + art(1728, 230, ring_layer(rings(1800, 300, 6 * 11.5, 11.5, [[(190, 262)], [(194, 236), (250, 272)], [(186, 262)], [(198, 250)]], C["coral"]))
                                 + text_block(60, 140, ["Настоящее будущее"], 64), bg=C["navy"], t=11.5) + "</div>", "light", "Проект и идея", "Проект и идея")

idea_art = art(900, 520, ring_layer(rings(450, 260, 70, 18, [[(200, 330), (350, 520 - 360 + 360)], [(150, 280), (300, 400)], [(220, 330), (350, 470)], [(160, 250), (275, 395)]], C["coral"], step=4))
               + '<circle cx="450" cy="260" r="10" fill="#fff" class="ko"/>', bg=C["navy"], t=18)
page(h("Идея стиля", "План, который становится городом. Стиль показывает момент, когда план превращается в реальность.")
     + '<div class="split"><div class="col-text">'
     + '<div class="idea"><b>Рамка</b>' + ps("Рамка логотипа — граница плана, участок на карте. Название выходит за её пределы: план перестаёт быть чертежом и становится улицей, школой, набережной.") + "</div>"
     + '<div class="idea"><b>Радиусы</b>' + ps("Фирменная графика — кольца, расходящиеся от точки, где строится объект. Так градостроители рисуют радиусы доступности: сколько людей рядом получат новую школу или поликлинику.") + "</div>"
     + '<div class="idea"><b>Здесь</b>' + ps("Главное слово стиля. Каждый носитель отвечает на вопрос «что будет здесь?» — конкретно, с названием объекта и сроком.") + "</div>"
     + f'</div><div class="col-art">{idea_art}</div></div>', "light", "Проект и идея")

# ── 02 Логотип
divider("02", "Логотип", "Основная версия, построение, цветовые и региональные версии, правила применения.",
        deck_rings(2000, 1160, 324, [[(186, 268)], [(192, 228), (244, 270)], [(198, 252)]]))


def callouts():
    # координаты в долях габарита логотипа
    pts = [
        ("1", 0.20, -0.14, "Рамка — граница плана"),
        ("2", -0.07, 0.27, "Строка поддержки с гербом Минвостокразвития России"),
        ("3", 0.78, 0.2, "Название выходит за рамку: план становится городом"),
        ("4", 0.17, 1.14, "Плашка с девизом «настоящее будущее»"),
    ]
    marks = "".join(f'<span class="cm" style="left:{x * 100}%;top:{y * 100}%">{n}</span>' for n, x, y, _ in pts)
    legend = "".join(f"<li><span class=\"cm-n\">{n}</span>{T(t)}</li>" for n, _, _, t in pts)
    return marks, legend


marks, legend = callouts()
page(h("Основная версия", "Логотип состоит из рамки, названия проекта, строки поддержки с гербом и плашки с девизом. Элементы не разделяются и не перестраиваются.")
     + f'<div class="logo-hero"><div class="logo-box"><div class="logo-wrap"><img src="{LOGO}mp-blue.svg" alt="Логотип «Мастер-планы»">{marks}</div></div>'
     + f'<ol class="legend">{legend}</ol></div>', "light", "Логотип", "Логотип")


# построение
def construction():
    W = 1100
    s = W / LOGO_W
    H = LOGO_H * s
    a = BAR * H
    x = STROKE * H
    pad = 120
    ox, oy = pad, pad
    g = []
    # охранное поле
    g.append(f'<rect x="{ox - a:.1f}" y="{oy - a:.1f}" width="{W + 2 * a:.1f}" height="{H + 2 * a:.1f}" fill="none" stroke="{C["coral"]}" stroke-width="2" stroke-dasharray="8 6"/>')
    g.append(f'<rect x="{ox - a:.1f}" y="{oy - a:.1f}" width="{W + 2 * a:.1f}" height="{a:.1f}" fill="{C["coral"]}" opacity=".1"/>')
    g.append(f'<rect x="{ox - a:.1f}" y="{oy + H:.1f}" width="{W + 2 * a:.1f}" height="{a:.1f}" fill="{C["coral"]}" opacity=".1"/>')
    g.append(f'<rect x="{ox - a:.1f}" y="{oy:.1f}" width="{a:.1f}" height="{H:.1f}" fill="{C["coral"]}" opacity=".1"/>')
    g.append(f'<rect x="{ox + W:.1f}" y="{oy:.1f}" width="{a:.1f}" height="{H:.1f}" fill="{C["coral"]}" opacity=".1"/>')
    g.append(f'<image href="{LOGO}mp-blue.svg" x="{ox}" y="{oy}" width="{W}" height="{H:.1f}"/>')
    # квадрат рамки
    g.append(f'<rect x="{ox:.1f}" y="{oy:.1f}" width="{H:.1f}" height="{H:.1f}" fill="none" stroke="{C["sky"]}" stroke-width="1.5"/>')
    g.append(f'<line x1="{ox:.1f}" y1="{oy + H / 2:.1f}" x2="{ox + H:.1f}" y2="{oy + H / 2:.1f}" stroke="{C["sky"]}" stroke-width="1" stroke-dasharray="4 4"/>')
    # плашки a
    def tag(xx, yy, label):
        return f'<text x="{xx:.1f}" y="{yy:.1f}" font-size="22" font-weight="500" fill="{C["coral"]}" text-anchor="middle">{label}</text>'
    g.append(tag(ox - a / 2, oy - a / 2 + 8, "a"))
    g.append(tag(ox + W + a / 2, oy + H + a / 2 + 8, "a"))
    g.append(tag(ox + H / 2, oy + H + a / 2 + 8, "a"))
    # x — толщина рамки
    g.append(f'<text x="{ox + H + 18:.1f}" y="{oy + 30:.1f}" font-size="22" font-weight="500" fill="{C["sky"]}">x</text>')
    g.append(f'<text x="{ox + H / 2:.1f}" y="{oy - a - 18:.1f}" font-size="22" font-weight="500" fill="{C["sky"]}" text-anchor="middle">квадрат H × H</text>')
    total_w = W + 2 * pad
    total_h = H + 2 * pad
    return f'<svg class="constr" viewBox="0 0 {total_w:.0f} {total_h + 20:.0f}">{"".join(g)}</svg>'


page(h("Построение и охранное поле")
     + f'<div class="split wide-art"><div class="col-art">{construction()}</div><div class="col-text">'
     + ps("Основа логотипа — квадрат рамки со стороной H, равной высоте логотипа. Толщина рамки x ≈ 1/19 H.",
          "Модуль a — высота плашки с девизом (≈ 0,18 H). Это охранное поле: на расстоянии a от логотипа не должно быть текста, краёв формата и других знаков.",
          "Правая сторона рамки доходит до 0,41 H и открывает место для названия проекта.")
     + "</div></div>"
     + '<div class="facts">' + "".join(f'<div><b>{a}</b><span>{T(b)}</span></div>' for a, b in [
         ("H", "высота логотипа = сторона квадрата рамки"), ("x ≈ 0,053 H", "толщина рамки"),
         ("a ≈ 0,18 H", "плашка с девизом и охранное поле"), ("W ≈ 2,93 H", "ширина логотипа")]) + "</div>", "light", "Логотип")

# цветовые версии
page(h("Цветовые версии", "Синяя версия — основная. Голубая и коралловая — дополнительные: для серий носителей и для разделения тем. На одном носителе — одна версия.")
     + '<div class="cards3">'
     + "".join(f'<figure class="card"><div class="card-pre"><img src="{LOGO}mp-{c}.svg" alt=""></div><figcaption><b>{n}</b><span>{T(d)}</span></figcaption></figure>'
               for c, n, d in [("blue", "Основная", "Ультрамарин #030B92. Используется по умолчанию."),
                               ("sky", "Дополнительная голубая", "#00BBFA. Не меньше 150 мм в ширину: белая надпись в плашке на голубом теряет контраст."),
                               ("coral", "Дополнительная коралловая", "#EC4B50. Для серий, где нужен тёплый акцент.")])
     + "</div>", "light", "Логотип")

# монохромные
page(h("Монохромные версии", "Для печати в одну краску, гравировки, тиснения и тёмных фонов, где нельзя поставить белую плашку.")
     + '<div class="cards2">'
     + f'<figure class="card"><div class="card-pre"><img src="{LOGO}mp-black.svg" alt=""></div><figcaption><b>Чёрная</b><span>{T("Одноцветная печать, документы, факс, газеты.")}</span></figcaption></figure>'
     + f'<figure class="card"><div class="card-pre" style="background:{C["navy"]}"><img src="{LOGO}mp-white.svg" alt=""></div><figcaption><b>Белая (негатив)</b><span>{T("Только на фирменном синем. Надпись в плашке и просветы герба — цветом фона. Для другого фона файл пересобирается.")}</span></figcaption></figure>'
     + "</div>", "light", "Логотип")

# на фонах
bg_cases = [
    ("#FFFFFF", "", "На белом — цветная версия напрямую", "ok"),
    (C["mist"], "", "На светлом — цветная версия напрямую", "ok"),
    (C["navy"], "plate", "На синем — на белой плашке", "ok"),
    (C["coral"], "plate", "На коралловом — на белой плашке", "ok"),
    ("photo", "plate", "На фото — на белой плашке", "ok"),
    (C["navy"], "direct", "Цветная версия на тёмном — нельзя", "no"),
]
cells = []
for bg, mode, cap, ok in bg_cases:
    style = f"background:{bg}" if bg != "photo" else f"background:url({PHOTO}photostyle-composition-12.webp) center/cover"
    if mode == "plate":
        inner = f'<div class="mini-plate"><img src="{LOGO}mp-blue.svg" alt=""></div>'
    else:
        inner = f'<img class="mini-logo" src="{LOGO}mp-blue.svg" alt="">'
    cells.append(f'<figure class="bgc {ok}"><div class="bgc-pre" style="{style}">{inner}</div><figcaption>{T(cap)}</figcaption></figure>')
page(h("Логотип на фонах", "Цветная версия ставится напрямую только на белый и светлые фоны. На синем, коралловом и на фотографиях логотип стоит на белой плашке.")
     + f'<div class="grid3">{"".join(cells)}</div>', "light", "Логотип")

# плашка
plate_demo = art(900, 380, plate(150, 70, 520, "blue") +
                 f'<g stroke="{C["coral"]}" stroke-width="2" fill="none" stroke-dasharray="6 5">'
                 f'<rect x="{150 + BAR * 520 / LOGO_R:.1f}" y="{70 + BAR * 520 / LOGO_R:.1f}" width="520" height="{520 / LOGO_R:.1f}"/></g>'
                 f'<text x="{150 + BAR * 520 / LOGO_R / 2:.1f}" y="{70 + 520 / LOGO_R / 2 + 40:.1f}" fill="{C["coral"]}" font-size="20" text-anchor="middle">a</text>',
                 bg=C["navy"], t=22)
page(h("Белая плашка", "Плашка — основной способ поставить логотип на цветной фон или фотографию.")
     + f'<div class="split"><div class="col-text">'
     + ul("Поля плашки равны охранному полю a со всех сторон.", "Скругление углов — a/2.", "Плашка всегда белая, без тени, обводки и прозрачности.", "Плашка стоит в углу формата на расстоянии не меньше модуля графики t от краёв (см. раздел «Графика»).", "Кольца графики не заходят на плашку.")
     + f'</div><div class="col-art">{plate_demo}</div></div>', "light", "Логотип")

# региональная локализация — построение
loc_W = 1100
loc_s = loc_W / LOGO_W
loc_H = LOGO_H * loc_s
loc = art(1300, 520,
          logo_img(100, 120, loc_W, "blue", "Петропавловск-Камчатский")
          + f'<line x1="{100 + (882.4 - 111) * loc_s:.1f}" y1="70" x2="{100 + (882.4 - 111) * loc_s:.1f}" y2="{120 + loc_H + 40:.1f}" stroke="{C["coral"]}" stroke-width="2" stroke-dasharray="6 5"/>'
          + f'<line x1="{100 + (374.75 - 111 + 14) * loc_s:.1f}" y1="70" x2="{100 + (374.75 - 111 + 14) * loc_s:.1f}" y2="{120 + 40 * loc_s:.1f}" stroke="{C["sky"]}" stroke-width="2" stroke-dasharray="6 5"/>'
          + f'<text x="{100 + (374.75 - 111 + 14) * loc_s + 12:.1f}" y="90" font-size="20" fill="{C["sky"]}">граница: рамка + x</text>'
          + f'<text x="{100 + (882.4 - 111) * loc_s - 12:.1f}" y="90" font-size="20" fill="{C["coral"]}" text-anchor="end">выключка вправо</text>',
          t=20)
page(h("Региональная локализация", "Название города или региона добавляется над названием проекта и привязано к его правому краю.")
     + f'<div class="split wide-art"><div class="col-art">{loc}</div><div class="col-text">'
     + ul("Шрифт — TT Norms Pro Regular, цвет — как у названия проекта.",
          "Высота прописных — 0,29 высоты прописных в слове «Мастер-планы».",
          "Выключка вправо по правому краю слова «Мастер-планы». Базовая линия — над названием на расстоянии 2/3 x.",
          "Только одна строка. Название не заходит левее рамки + x. Если не помещается — используйте короткое официальное название.",
          "Пишем в именительном падеже, без «г.» и «город».")
     + "</div></div>", "light", "Логотип")

# примеры городов
cities = ["Владивосток", "Хабаровск", "Южно-Сахалинск", "Магадан", "Анадырь", "Николаевск-на-Амуре"]
city_cells = "".join(
    f'<figure class="city-cell">{art(820, 290, logo_img(25, 13, 770, "blue", c), t=10)}</figure>' for c in cities)
page(h("Примеры локализации", "Один шаблон для всех городов. Готовые файлы логотипа с городом выпускаются по запросу — название не набирается вручную на макете.")
     + f'<div class="grid-cities">{city_cells}</div>', "light", "Логотип")

# минимальный размер и компактная версия
page(h("Минимальный размер", "Строка поддержки — самый мелкий элемент логотипа. От неё зависит минимальный размер полной версии.")
     + '<div class="cards2">'
     + f'<figure class="card"><div class="card-pre"><img src="{LOGO}mp-blue.svg" alt="" style="width:400px"></div><figcaption><b>Полная версия</b><span>{T("Не меньше 100 мм в печати и 400 px на экране — иначе строка поддержки нечитаема.")}</span></figcaption></figure>'
     + f'<figure class="card"><div class="card-pre"><img src="{LOGO}mp-compact-blue.svg" alt="" style="width:240px"></div><figcaption><b>Компактная версия · предложение</b><span>{T("Без герба и строки поддержки, от 40 мм / 160 px: значки, сувениры, аватар, мелкие форматы. Требует согласования с Минвостокразвития России; поддержка министерства указывается на носителе отдельно.")}</span></figcaption></figure>'
     + "</div>", "light", "Логотип")

# недопустимое
misuse = [
    ("transform:scaleX(1.35)", "", "Не растягивать и не сжимать"),
    ("transform:rotate(-8deg)", "", "Не поворачивать"),
    ("filter:hue-rotate(110deg)", "", "Не менять цвета"),
    ("", "shadow", "Не добавлять тени и эффекты"),
    ("", "navy", "Не ставить цветную версию на тёмный фон"),
    ("", "photo", "Не ставить на фото без плашки"),
]
mcells = []
for style, kind, cap in misuse:
    bg = ""
    st = style
    if kind == "shadow":
        st = "filter:drop-shadow(6px 8px 6px rgba(0,0,0,.45))"
    if kind == "navy":
        bg = f"background:{C['navy']}"
    if kind == "photo":
        bg = f"background:url({PHOTO}photostyle-composition-4.webp) center/cover"
    mcells.append(f'<figure class="bgc no"><div class="bgc-pre" style="{bg}"><img class="mini-logo" src="{LOGO}mp-blue.svg" alt="" style="{st}"></div><figcaption>{T(cap)}</figcaption></figure>')
page(h("Недопустимое использование") + f'<div class="grid3">{"".join(mcells)}</div>', "light", "Логотип")

# ── 03 Цвет
divider("03", "Цвет", "Палитра, пропорции и допустимые сочетания.",
        deck_rings(2000, -80, 324, [[(92, 172)], [(96, 132), (150, 178)], [(100, 160)]]))


def lum(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


palette = [
    ("Ультрамарин", C["ultra"], "3 · 11 · 146", "100 · 90 · 0 · 10", "Рамка логотипа, акценты на белом", True),
    ("Синий", C["navy"], "0 · 53 · 119", "100 · 75 · 10 · 30", "Основное поле носителей", True),
    ("Коралловый", C["coral"], "236 · 75 · 80", "0 · 82 · 62 · 0", "Графика «Радиусы», акцентные слова", True),
    ("Голубой", C["sky"], "0 · 187 · 250", "70 · 5 · 0 · 0", "Дополнительная версия логотипа", False),
    ("Графит", C["ink"], "38 · 36 · 37", "0 · 5 · 0 · 90", "Название проекта, текст на белом", False),
    ("Белый", C["white"], "255 · 255 · 255", "0 · 0 · 0 · 0", "Плашки, реплики, текст на синем", False),
]
sw = "".join(
    f'<figure class="sw {"big" if big else ""}"><div class="sw-c" style="background:{hx}{";box-shadow:inset 0 0 0 1px " + C["line"] if hx == C["white"] else ""}"></div>'
    f'<figcaption><b>{n}</b><span class="sw-use">{T(use)}</span><dl><dt>HEX</dt><dd>{hx}</dd><dt>RGB</dt><dd>{rgb}</dd><dt>CMYK</dt><dd>{cmyk}</dd></dl></figcaption></figure>'
    for n, hx, rgb, cmyk, use, big in palette)
page(h("Палитра") + f'<div class="swatches">{sw}</div>'
     + f'<p class="note">{T("HEX и RGB — по исходному файлу логотипа. CMYK — расчётные, перед тиражом сверить по пробной печати. Синий #003577 снят с макетов носителей — подтвердить у автора концепции.")}</p>',
     "light", "Цвет", "Цвет")

prop = (f'<div class="prop"><div style="flex:55;background:{C["navy"]}"><span>Синий 55%</span></div>'
        f'<div style="flex:22;background:#fff;box-shadow:inset 0 0 0 1px {C["line"]}"><span style="color:{C["ink"]}">Белый 22%</span></div>'
        f'<div style="flex:15;background:{C["coral"]}"><span>Коралловый 15%</span></div>'
        f'<div style="flex:5;background:{C["ultra"]}"><span></span></div><div style="flex:3;background:{C["sky"]}"></div></div>')
pairs = [("#FFFFFF", C["navy"], "Белый на синем"), (C["coral"], C["navy"], "Коралловый на синем"),
         ("#FFFFFF", C["coral"], "Белый на коралловом"), (C["navy"], "#FFFFFF", "Синий на белом"),
         (C["ultra"], "#FFFFFF", "Ультрамарин на белом"), ("#FFFFFF", C["sky"], "Белый на голубом")]


def verdict(r):
    if r >= 4.5:
        return "любой текст"
    if r >= 3:
        return "только крупный текст и графика"
    return "не для текста"


pc = "".join(
    f'<div class="pair" style="background:{bg};color:{fg}"><b>Аа</b><span>{T(n)}</span><em>{contrast(fg, bg):.1f} : 1 · {verdict(contrast(fg, bg))}</em></div>'
    for fg, bg, n in pairs)
page(h("Пропорции и сочетания", "Синий — основное поле. Коралловый — для графики и одного акцентного слова, не для фона больших площадей.")
     + prop + f'<div class="pairs">{pc}</div>', "light", "Цвет")

# ── 04 Типографика
divider("04", "Типографика", "Фирменный шрифт TT Norms Pro: начертания, иерархия и правила набора.",
        deck_rings(2060, 640, 324, [[(118, 236)], [(126, 176), (194, 246)], [(132, 206)]]))

weights = [(800, "ExtraBold", "Заголовки на носителях, капсом"), (700, "Bold", "Реплики, подзаголовки"),
           (500, "Medium", "Надзаголовки, акценты в тексте"), (400, "Regular", "Основной текст, название города в логотипе")]
wrows = "".join(
    f'<div class="wrow"><span class="w-s" style="font-weight:{w}">Строим будущее</span><span class="w-n"><b>{n}</b>{T(d)}</span></div>'
    for w, n, d in weights)
page(h("TT Norms Pro", "Геометрический гротеск с мягкими пропорциями: читается на расстоянии и не выглядит казённо.")
     + f'<div class="split"><div class="col-text type-abc"><p class="abc">Аа Бб Вв Гг Дд Ее Ёё Жж Зз Ии Йй Кк Лл Мм Нн Оо Пп Рр Сс Тт Уу Фф Хх Цц Чч Шш Щщ Ъъ Ыы Ьь Ээ Юю Яя</p><p class="abc num">0123456789 — «» ! ? , . : ; № %</p>'
     + f'<p class="note">{T("Слово «Мастер-планы» в логотипе нарисовано отдельно (основа — Montserrat Alternates SemiBold) и не используется для набора. Лицензия TT Norms Pro — у АО «КРДВ»; подрядчикам шрифт не передаётся, макеты сдаются в кривых или PDF.")}</p></div>'
     + f'<div class="col-text">{wrows}</div></div>', "light", "Типографика", "Типографика")

hier = art(1100, 620,
           f'<text x="70" y="110" font-size="26" font-weight="500" fill="{C["sky"]}" style="letter-spacing:.06em" class="ko">ПЕТРОПАВЛОВСК-КАМЧАТСКИЙ</text>'
           + text_block(70, 210, ["Здесь будет", ("школа", C["coral"])], 92, lh=1.0)
           + f'<text x="70" y="430" font-size="34" font-weight="500" fill="#fff" class="ko"><tspan x="70">На 1100 мест, с бассейном</tspan><tspan x="70" dy="44">и стадионом. Откроется в 2027 году.</tspan></text>'
           + f'<text x="70" y="560" font-size="20" font-weight="400" fill="#fff" opacity=".7" class="ko">Заказчик: администрация города · Подрядчик: ООО «Строитель»</text>',
           bg=C["navy"], t=24)
page(h("Иерархия набора")
     + f'<div class="split wide-art"><div class="col-art">{hier}</div><div class="col-text">'
     + '<dl class="spec">'
     + "".join(f"<dt>{a}</dt><dd>{T(b)}</dd>" for a, b in [
         ("Надзаголовок", "Medium, капс, разрядка +6%. Город, адрес, тема."),
         ("Заголовок", "ExtraBold, капс, интерлиньяж 100%. Не больше 4 строк. Одно акцентное слово — коралловым."),
         ("Текст", "Medium, кегль ⅓–½ заголовка, интерлиньяж 130%. Не длиннее 3–4 строк на наружных носителях."),
         ("Сноска", "Regular, 70% белого. Заказчик, подрядчик, сроки, правовая информация.")])
     + "</dl></div></div>", "light", "Типографика")

page(h("Правила набора")
     + '<div class="cols3">'
     + '<div><h3>Заголовок</h3>' + ul("Капсом — только короткие заголовки до 4 строк.", "Выключка влево; по центру — только на симметричных форматах (баннер-лента).", "Акцентное слово коралловым — не больше одного на заголовок.") + "</div>"
     + '<div><h3>Текст</h3>' + ul("Строчными, без капса и разрядки.", "Короткие предлоги и союзы не висят в конце строки.", "Числа — цифрами, сроки — конкретно: «в 2027 году», а не «в ближайшее время».") + "</div>"
     + '<div><h3>Знаки</h3>' + ul("Кавычки «ёлочки», тире «—» с пробелами.", "Буква «ё» обязательна.", "Не больше одного восклицательного знака на носитель.") + "</div>"
     + "</div>", "light", "Типографика")

# ── 05 Графика
divider("05", "Графика «Радиусы»", "Как устроена фирменная графика и как строить композиции на любых форматах.",
        deck_rings(1980, 1180, 324, [[(184, 262)], [(190, 226), (242, 272)], [(196, 250)]]))

g_idea = art(960, 640,
             "".join(f'<circle cx="480" cy="320" r="{60 + i * 88}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="4 8"/>' for i in range(4))
             + f'<g opacity=".95">{ring_layer(rings(480, 320, 60, 22, [[(200, 330)], [(150, 260), (290, 400)], [(220, 330), (350, 470)], [(160, 245), (270, 395)]], C["coral"], step=4))}</g>'
             + f'<circle cx="480" cy="320" r="11" fill="#fff"/>'
             + f'<text x="500" y="312" font-size="22" font-weight="700" fill="#fff" style="text-transform:uppercase;letter-spacing:.04em">ЗДЕСЬ</text>',
             bg=C["navy"], t=22)
page(h("Идея графики", "Радиусы доступности — инструмент градостроителя: круги показывают, сколько людей вокруг получат новую школу, поликлинику или парк.")
     + f'<div class="split"><div class="col-text">'
     + ps("Фирменная графика проекта — кольца, расходящиеся от точки «здесь», где строится объект.",
          "Кольца разорваны: город ещё строится, план заполняется. Разрывы задают движение — графика кажется вращающейся и не превращается в мишень.",
          "Графика работает как подпись к месту: она «отмечает» стройку на щите, ограждении, транспорте и в соцсетях.")
     + f'</div><div class="col-art">{g_idea}</div></div>', "light", "Графика «Радиусы»", "Графика «Радиусы»")


# построение
def g_construct():
    t = 26
    cx, cy = 140, 640
    r0 = 6 * t
    body = []
    segs = [[(275, 340)], [(268, 300), (318, 352)], [(282, 345)], [(272, 310), (328, 356)]]
    body.append(ring_layer(rings(cx, cy, r0, t, segs, C["coral"], step=4)))
    # вспомогательные полные окружности
    for i in range(4):
        r = r0 + i * 4 * t
        body.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{C["navy"]}" stroke-opacity=".18" stroke-width="1.2" stroke-dasharray="5 5"/>')
    body.append(f'<circle cx="{cx}" cy="{cy}" r="7" fill="{C["navy"]}"/>')
    body.append(f'<text x="{cx + 16}" y="{cy + 8}" font-size="20" font-weight="700" fill="{C["navy"]}">центр «здесь»</text>')
    # радиус r0
    a = math.radians(-20)
    body.append(f'<line x1="{cx}" y1="{cy}" x2="{cx + r0 * math.cos(a):.1f}" y2="{cy + r0 * math.sin(a):.1f}" stroke="{C["navy"]}" stroke-width="1.5"/>')
    body.append(f'<text x="{cx + 16}" y="{cy + 36}" font-size="20" fill="{C["navy"]}">первое кольцо ≥ 6t</text>')
    # шаг 4t — радиальная мерка
    a = math.radians(-62)
    for i in range(3):
        r1 = r0 + i * 4 * t
        r2 = r1 + 4 * t
        x1, y1 = cx + r1 * math.cos(a), cy + r1 * math.sin(a)
        x2, y2 = cx + r2 * math.cos(a), cy + r2 * math.sin(a)
        body.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{C["navy"]}" stroke-width="1.5" marker-start="url(#tk)" marker-end="url(#tk)"/>')
    body.append(f'<text x="{cx + 240}" y="{cy - 430}" font-size="20" fill="{C["navy"]}">шаг колец 4t</text>')
    # толщина t
    body.append(f'<text x="{cx + r0 + 12 * t + 40:.0f}" y="{cy - 20}" font-size="20" fill="{C["navy"]}">толщина t</text>')
    # радиальный срез
    a0 = 340
    rr = r0
    xx, yy = cx + (r0 + 14 * t) * math.cos(math.radians(a0)), cy + (r0 + 14 * t) * math.sin(math.radians(a0))
    body.append(f'<line x1="{cx}" y1="{cy}" x2="{cx + (r0 + 14 * t) * math.cos(math.radians(a0)):.1f}" y2="{cy + (r0 + 14 * t) * math.sin(math.radians(a0)):.1f}" stroke="{C["navy"]}" stroke-width="1" stroke-dasharray="3 4"/>')
    body.append(f'<text x="{xx + 10:.0f}" y="{yy + 6:.0f}" font-size="20" fill="{C["navy"]}">срез по радиусу</text>')
    defs = f'<defs><marker id="tk" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M5 0V10" stroke="{C["navy"]}" stroke-width="1.5"/></marker></defs>'
    return art(1000, 680, defs + "".join(body), bg="#fff", t=t)


page(h("Построение")
     + f'<div class="split wide-art"><div class="col-art">{g_construct()}</div><div class="col-text">'
     + '<dl class="spec">'
     + "".join(f"<dt>{a}</dt><dd>{T(b)}</dd>" for a, b in [
         ("Модуль t", "Толщина кольца = 1/20 короткой стороны формата."),
         ("Шаг", "Кольца одной группы идут с шагом 4t (между осями), радиус первого кольца — не меньше 6t."),
         ("Группа", "2–4 кольца из одного центра. На формате — одна группа, на длинных форматах — до трёх."),
         ("Дуги", "Каждое кольцо разбито на 1–3 дуги длиной от 30° до 200°. Срезы — по радиусу к центру."),
         ("Ритм", "Разрывы соседних колец не совпадают — сдвиг не меньше 15°."),
     ])
     + "</dl></div></div>", "light", "Графика «Радиусы»")


# композиция: положение центра
def mini(w, h, body, bg=C["navy"]):
    return art(w, h, body, bg=bg)


def scheme(kind):
    w, h = 600, 400
    t = h / 20
    if kind == "corner":
        rg = rings(w + 20, h + 30, 6 * t, t, [[(185, 262)], [(190, 222), (240, 268)], [(182, 250)], [(195, 235)]], C["coral"])
        txt = text_block(40, 90, ["Здесь", "будет", ("парк", C["coral"])], 54)
    elif kind == "edge":
        rg = rings(w + 10, h / 2, 6 * t, t, [[(120, 240)], [(105, 165), (190, 250)], [(125, 230)], [(110, 150), (170, 230)]], C["coral"])
        txt = text_block(40, 150, ["Строим", "будущее", ("здесь", C["coral"])], 54)
    elif kind == "accent":
        rg = rings(440, 250, 4 * t, t, [[(170, 330)], [(150, 260), (290, 390)], [(200, 330), (350, 450)]], C["coral"])
        txt = text_block(40, 90, ["Здесь будет"], 44) + f'<circle cx="440" cy="250" r="9" fill="#fff" class="ko"/>'
    else:  # long
        w, h = 1200, 260
        t = h / 20
        rg = (rings(140, h / 2, 6 * t, t, [[(110, 250)], [(100, 170), (195, 255)], [(120, 240)]], C["coral"])
              + rings(1060, h / 2, 6 * t, t, [[(-70, 70)], [(-80, -10), (15, 80)], [(-60, 60)]], C["coral"]))
        txt = text_block(600, 110, ["Строим будущее", ("здесь", C["coral"])], 46, anchor="middle")
    return art(w, h, ring_layer(rg) + txt, bg=C["navy"], t=t)


schemes = [("corner", "Центр за углом формата", "Основная схема: кольца входят из угла, текст — в противоположной части."),
           ("edge", "Центр за боковой стороной", "Для вертикальных и квадратных форматов и разворотов."),
           ("accent", "Центр на объекте", "Центр отмечает место на карте, фото или схеме. Внутри первого кольца — только точка.")]
page(h("Положение центра", "Центр колец — смысловая точка «здесь». Он стоит за краем формата или отмечает конкретное место, но никогда не под заголовком.")
     + '<div class="grid3">' + "".join(f'<figure class="sch">{scheme(k)}<figcaption><b>{T(n)}</b><span>{T(d)}</span></figcaption></figure>' for k, n, d in schemes)
     + "</div>", "light", "Графика «Радиусы»")

# взаимодействие с текстом
tx_ok = art(800, 500, ring_layer(rings(820, 520, 5 * 25, 25, [[(180, 270)], [(185, 230), (245, 272)], [(178, 268)], [(186, 240), (252, 270)], [(180, 262)]], C["coral"]))
            + text_block(50, 120, ["Строим", "будущее", ("здесь", C["coral"])], 82), bg=C["navy"], t=25)
tx_no = art(800, 500, rings(820, 520, 5 * 25, 25, [[(180, 270)], [(185, 230), (245, 272)], [(178, 268)], [(186, 240), (252, 270)], [(180, 262)]], C["coral"])
            + text_block(50, 120, ["Строим", "будущее", ("здесь", C["coral"])], 82, cls=""), bg=C["navy"], t=25)
page(h("Графика и текст", "Кольцо прерывается перед текстом, логотипом и репликой. Отступ от букв до среза — не меньше t.")
     + '<div class="cards2 tall">'
     + f'<figure class="bgc ok">{tx_ok}<figcaption>{T("Кольца обрезаны по охранному полю текста — слова читаются целиком")}</figcaption></figure>'
     + f'<figure class="bgc no">{tx_no}<figcaption>{T("Кольца проходят через буквы — заголовок рассыпается")}</figcaption></figure>'
     + "</div>", "light", "Графика «Радиусы»")


# цветовые варианты
def color_var(fg, bg, op=1):
    t = 20
    g = rings(420, 290, 6 * t, t, [[(185, 300)], [(195, 245), (262, 330)], [(180, 290)], [(200, 250), (270, 320)]], fg)
    if op < 1:
        g = f'<g opacity="{op}">{g}</g>'
    return art(400, 260, g, bg=bg, t=t)


cvars = [(C["coral"], C["navy"], 1, "Коралловые на синем", "Основной вариант"),
         ("#FFFFFF", C["navy"], 1, "Белые на синем", "Официальные и спокойные носители"),
         (C["navy"], "#FFFFFF", 1, "Синие на белом", "Документы, таблички, светлые носители"),
         (C["sky"], C["ultra"], 1, "Голубые на ультрамарине", "Серии с голубой версией логотипа")]
page(h("Цвет графики", "Кольца — всегда одним цветом, без градиентов, прозрачности и обводки.")
     + '<div class="grid4">' + "".join(f'<figure class="sch">{color_var(a, b, o)}<figcaption><b>{n}</b><span>{T(d)}</span></figcaption></figure>' for a, b, o, n, d in cvars)
     + "</div>", "light", "Графика «Радиусы»")


# масштабирование
def fmt(w, h, cx, cy, segs, txt, plate_w=None):
    t = min(w, h) / 20
    body = ring_layer(rings(cx, cy, 6 * t, t, segs, C["coral"])) + txt
    if plate_w:
        body += plate(t * 1.5, t * 1.5, plate_w)
    return art(w, h, body, bg=C["navy"], t=t)


f_h = fmt(600, 300, 620, 320, [[(185, 265)], [(192, 230), (245, 272)], [(180, 262)], [(190, 250)]],
          text_block(40, 190, ["Здесь будет", ("школа", C["coral"])], 40), 150)
f_v = fmt(240, 360, 260, 380, [[(190, 262)], [(195, 235), (248, 270)], [(185, 262)]],
          text_block(20, 210, ["Здесь", "будет", ("школа", C["coral"])], 30), 100)
f_s = fmt(300, 300, 310, 320, [[(185, 265)], [(192, 232), (245, 270)], [(182, 262)]],
          text_block(22, 170, ["Здесь будет", ("школа", C["coral"])], 26), 110)
f_l = art(1200, 160, ring_layer(rings(70, 80, 48, 8, [[(110, 250)], [(100, 168), (190, 255)], [(120, 240)], [(105, 160), (180, 250)]], C["coral"])
                                + rings(1130, 80, 48, 8, [[(-70, 70)], [(-80, -12), (12, 78)], [(-60, 60)], [(-75, -20), (0, 70)]], C["coral"]))
          + text_block(600, 92, ["Строим будущее здесь"], 34, anchor="middle")
          + f'<text x="600" y="130" font-size="20" font-weight="500" fill="#fff" text-anchor="middle" class="ko">Здесь будет новая набережная · 2027</text>', bg=C["navy"], t=8)
page(h("Масштабирование", "Модуль t считается от короткой стороны — поэтому графика одинаково выглядит на ситиформате и на 30-метровом ограждении.")
     + f'<div class="fmts"><figure>{f_h}<figcaption>Щит 6 × 3 м · t = 15 см</figcaption></figure>'
     + f'<figure>{f_v}<figcaption>Ситиформат 1,2 × 1,8 м · t = 6 см</figcaption></figure>'
     + f'<figure>{f_s}<figcaption>Пост 1080 × 1080 · t = 54 px</figcaption></figure></div>'
     + f'<figure class="fmt-long">{f_l}<figcaption>{T("Ограждение 30 × 4 м · t = 20 см, две группы по краям")}</figcaption></figure>', "light", "Графика «Радиусы»")


# недопустимое
def bad(kind):
    t = 20
    w, h = 400, 220
    if kind == "target":
        g = rings(200, 110, 1.5 * t, t, [[(0, 360)], [(0, 360)], [(0, 360)]], C["coral"], step=3)
    elif kind == "thick":
        g = (f'<g fill="none" stroke="{C["coral"]}" stroke-linecap="butt">'
             + "".join(f'<path d="{arc(420, 290, r, 190, 275)}" stroke-width="{sw}"/>' for r, sw in [(110, 8), (180, 34), (260, 14)]) + "</g>")
    elif kind == "round":
        g = rings(420, 290, 6 * t, t, [[(185, 260)], [(195, 240), (255, 270)], [(185, 262)]], C["coral"]).replace('stroke-linecap="butt"', 'stroke-linecap="round"')
    elif kind == "dense":
        g = rings(420, 290, 3 * t, t, [[(185, 268)]] * 9, C["coral"], step=1.6)
    elif kind == "grad":
        g = ('<defs><linearGradient id="bg1" x1="0" x2="1"><stop offset="0" stop-color="#ff9a3c"/><stop offset="1" stop-color="#d81b60"/></linearGradient></defs>'
             + rings(420, 290, 6 * t, t, [[(185, 260)], [(195, 240), (255, 270)], [(185, 262)]], "url(#bg1)"))
    else:  # photo
        return (f'<div class="bad-photo" style="background-image:url({PHOTO}photostyle-composition-12.webp)">'
                + art(w, h, rings(420, 290, 6 * t, t, [[(185, 260)], [(195, 240), (255, 270)], [(185, 262)]], C["coral"]), t=t) + "</div>")
    return art(w, h, g, bg=C["navy"], t=t)


bads = [("target", "Замкнутые кольца — «мишень»"), ("thick", "Разная толщина и шаг"), ("round", "Скруглённые концы"),
        ("dense", "Слишком много колец"), ("grad", "Градиенты и чужие цвета"), ("photo", "Кольца поверх фотографии")]
page(h("Недопустимое использование графики")
     + '<div class="grid3">' + "".join(f'<figure class="bgc no">{bad(k)}<figcaption>{T(n)}</figcaption></figure>' for k, n in bads)
     + "</div>", "light", "Графика «Радиусы»")

# графика с фото
ph_ok = art(600, 800,
            f'<image href="{PHOTO}photostyle-composition-7.webp" x="0" y="0" width="600" height="520" preserveAspectRatio="xMidYMid slice"/>'
            f'<rect y="520" width="600" height="280" fill="{C["navy"]}"/>'
            + ring_layer(f'<clipPath id="phc"><rect y="520" width="600" height="280"/></clipPath><g clip-path="url(#phc)">'
                         + rings(620, 830, 6 * 30, 30, [[(190, 262)], [(196, 238), (250, 270)], [(186, 262)]], C["coral"]) + "</g>")
            + text_block(40, 600, ["Здесь будет", ("колледж", C["coral"])], 44, lh=1.0)
            + f'<text x="40" y="730" font-size="22" font-weight="500" fill="#fff" class="ko"><tspan x="40">Откроется в 2027 году</tspan></text>', t=30)
page(h("Графика и фотография", "Кольца не накладываются на фото. Фотография и графика делят формат: фото сверху или сбоку, кольца — на синем поле.")
     + f'<div class="split"><div class="col-text">'
     + ul("Граница фото — прямая, без скруглений и масок по кругу.", "Фото занимает от ½ до ⅔ формата.", "Кольца входят в синее поле из-за его края и не пересекают границу фото.", "Подходят фото и визуализации будущего объекта, стройки, людей в городе. Не подходят стоковые «счастливые семьи».")
     + f'</div><div class="col-art narrow">{ph_ok}</div></div>', "light", "Графика «Радиусы»")

# ── 06 Элементы и тон
divider("06", "Элементы и тон", "Плашки, реплики и то, как проект разговаривает с жителями.",
        deck_rings(2160, 300, 324, [[(112, 222)], [(118, 160), (178, 226)], [(128, 206)]]))

el_bubble = art(700, 420, bubble(60, 80, 580, 210, ["Скоро здесь будет новый", "плавательный бассейн.", "", "С аквааэробикой, кроссфитом", "и боксом!"], 30, 30)
                , bg=C["navy"], t=30)
el_accent = art(700, 420, f'<rect x="0" y="130" width="700" height="150" fill="{C["coral"]}"/>'
                + text_block(350, 222, ["Строим будущее вместе"], 40, anchor="middle"), bg=C["navy"], t=30)
page(h("Элементы", "Кроме логотипа и графики в стиле есть два элемента. Они используются, когда нужно сказать больше одного заголовка.")
     + '<div class="cards2 tall">'
     + f'<figure class="sch">{el_bubble}<figcaption><b>Реплика</b><span>{T("Голос проекта: польза для жителя простыми словами. Bold, синий текст, до 5 строк. Скругление — 0,6 t, хвостик — t.")}</span></figcaption></figure>'
     + f'<figure class="sch">{el_accent}<figcaption><b>Акцентная лента</b><span>{T("Для девиза или главной даты. Одна на носитель, только на вертикальных и длинных форматах. Высота — от 3t до 5t.")}</span></figcaption></figure>'
     + "</div>", "light", "Элементы и тон", "Элементы и тон")

page(h("Как мы говорим", "Проект говорит с жителями о конкретном месте и конкретной пользе. Формула: что будет — где — когда — что это даст.")
     + '<div class="cols3">'
     + '<div><h3>Главные формулы</h3><p class="quote">Здесь будет школа</p><p class="quote">Строим будущее здесь</p><p class="quote">Настоящее будущее</p></div>'
     + '<div><h3>Правила</h3>' + ul("На «вы» и по-человечески — без канцелярита.", "Называем объект: школа, поликлиника, набережная.", "Указываем срок и цифры: «на 1100 мест», «в 2027 году».", "Одна мысль — один носитель.") + "</div>"
     + '<div><h3>Было и стало</h3>'
     + f'<p class="bad-ex">{T("Реализация мероприятий по строительству объекта образования в рамках мастер-плана")}</p>'
     + f'<p class="good-ex">{T("Здесь будет школа на 1100 мест. Откроется в 2027 году.")}</p>'
     + f'<p class="bad-ex">{T("Улучшение качества городской среды!")}</p>'
     + f'<p class="good-ex">{T("Новая набережная: 2 км прогулочной зоны и велодорожка.")}</p>'
     + "</div></div>", "light", "Элементы и тон")

# сетка и поля
grid_demo = art(1200, 600,
                f'<g fill="none" stroke="{C["sky"]}" stroke-opacity=".35" stroke-width="1">'
                + "".join(f'<line x1="{x}" y1="0" x2="{x}" y2="600"/>' for x in range(0, 1201, 30))
                + "".join(f'<line x1="0" y1="{y}" x2="1200" y2="{y}"/>' for y in range(0, 601, 30)) + "</g>"
                + f'<rect x="45" y="45" width="1110" height="510" fill="none" stroke="{C["coral"]}" stroke-width="2" stroke-dasharray="8 6"/>'
                + ring_layer(rings(1230, 640, 6 * 30, 30, [[(185, 262)], [(194, 236), (250, 270)], [(184, 262)], [(196, 250)]], C["coral"]))
                + plate(45, 45, 300)
                + text_block(45, 380, ["Здесь будет", ("школа", C["coral"])], 80, lh=1.0),
                bg=C["navy"], t=30)
page(h("Модульная сетка", "Все размеры на носителе кратны модулю t: поля, отступы, кегль заголовка, плашка логотипа.")
     + f'<div class="split wide-art"><div class="col-art">{grid_demo}</div><div class="col-text">'
     + ul("Поля формата — 1,5t.", "Ширина логотипа на плашке — 10t (на ситиформате и щите), не меньше 6t на мелких форматах.", "Кегль заголовка — от 2,5t до 4t; акцентное слово можно увеличить до 6t.", "Сетка 1:1 с шагом t — для выравнивания колец и текстовых блоков.")
     + "</div></div>", "light", "Элементы и тон")

# ── 07 Носители
divider("07", "Носители", "Плоские макеты основных носителей. Фотомокапы в городской среде будут добавлены отдельно.",
        deck_rings(2000, -80, 324, [[(94, 176)], [(98, 136), (152, 180)], [(102, 164)]]))


def billboard():
    w, h = 600, 300
    t = 15
    body = ring_layer(rings(640, 340, 6 * t, t, [[(185, 268)], [(190, 225), (242, 272)], [(184, 262)], [(194, 238), (254, 270)], [(186, 250)]], C["coral"]))
    body += plate(1.5 * t, 1.5 * t, 10 * t, city="Петропавловск-Камчатский")
    body += text_block(1.5 * t, 168, ["Здесь будет", ("школа", C["coral"])], 46, lh=1.0)
    body += f'<text x="{1.5 * t}" y="262" font-size="15" font-weight="500" fill="#fff" class="ko">На 1100 мест · откроется в 2027 году</text>'
    return art(w, h, body, bg=C["navy"], t=t)


page(h("Информационный щит 6 × 3 м", "Главный носитель на стройке. Одна мысль: что здесь будет. Читается с 50 метров за 3 секунды.")
     + f'<figure class="mock">{billboard()}</figure>'
     + '<p class="note">' + T("Плашка с логотипом — 10t, слева сверху. Заголовок — 3t, акцентное слово коралловым. Кольца — из правого нижнего угла.") + "</p>",
     "light", "Носители", "Носители")


def city_text():
    w, h = 240, 360
    t = 12
    body = ring_layer(rings(270, 390, 6 * t, t, [[(186, 262)], [(194, 235), (248, 272)], [(184, 260)], [(196, 250)]], C["coral"]))
    body += plate(1.5 * t, 1.5 * t, 9.5 * t, city="Петропавловск-Камчатский")
    body += text_block(1.5 * t, 128, ["Строим", "будущее", ("сегодня", C["coral"])], 27, lh=1.02)
    body += f'<text x="{1.5 * t}" y="232" font-size="11" font-weight="500" fill="#fff" class="ko"><tspan x="{1.5 * t}">Новая школа, поликлиника</tspan><tspan x="{1.5 * t}" dy="14">и набережная — к 2028 году</tspan></text>'
    return art(w, h, body, bg=C["navy"], t=t)


def city_photo():
    w, h = 240, 360
    t = 12
    body = f'<image href="{PHOTO}photostyle-composition-6.webp" x="0" y="0" width="240" height="210" preserveAspectRatio="xMidYMid slice"/>'
    body += f'<rect y="210" width="240" height="150" fill="{C["navy"]}"/>'
    body += ring_layer(f'<clipPath id="cpc"><rect y="210" width="240" height="150"/></clipPath><g clip-path="url(#cpc)">'
                       + rings(260, 390, 6 * t, t, [[(186, 262)], [(194, 235), (248, 272)], [(184, 260)]], C["coral"]) + "</g>")
    body += plate(1.5 * t, 1.5 * t, 9.5 * t, city="Петропавловск-Камчатский")
    body += bubble(1.5 * t, 186, 190, 76, ["Скоро здесь будет новый", "образовательный центр.", "С лабораториями", "и коворкингом!"], 10.5, t)
    return art(w, h, body, t=t)


page(h("Ситиформаты 1,2 × 1,8 м", "Два сценария: заголовок с девизом и фото объекта с репликой.")
     + f'<div class="mock-row"><figure class="mock v">{city_text()}</figure><figure class="mock v">{city_photo()}</figure>'
     + f'<div class="col-text">' + ul("Плашка с логотипом — слева сверху, 9,5t.", "В фото-версии кольца живут только на синем поле.", "Реплика перекрывает границу фото и поля — она связывает картинку и сообщение.", "Фото — объект, визуализация или люди в городе.") + "</div></div>",
     "light", "Носители")


def fence():
    w, h = 1500, 200
    t = 10
    body = ring_layer(rings(-10, 100, 6 * t, t, [[(-70, 70)], [(-80, -12), (12, 78)], [(-60, 60)], [(-75, -20), (5, 70)]], C["coral"])
                      + rings(1510, 100, 6 * t, t, [[(110, 250)], [(102, 168), (192, 258)], [(120, 240)], [(110, 175), (195, 250)]], C["coral"]))
    body += bubble(180, 46, 330, 92, ["Ваше здоровье бесценно!", "", "Новая поликлиника на 500 посещений", "в смену откроется в 2027 году."], 15, t)
    body += text_block(750, 92, ["Строим", ("будущее", C["coral"]), "здесь"], 34, lh=1.0, anchor="middle")
    body += plate(1180, 64, 170, city="Петропавловск-Камчатский")
    return art(w, h, body, bg=C["navy"], t=t)


page(h("Баннер на ограждение", "Длинный формат вдоль стройки. Две группы колец по краям, сообщение — по центру, логотип и реплика — по сторонам.")
     + f'<figure class="mock long">{fence()}</figure>'
     + '<div class="cols3 small">'
     + '<div>' + ul("Высота 2–4 м, длина — по ограждению.", "Модуль t считается от высоты.") + "</div>"
     + '<div>' + ul("Для ограждений длиннее 20 м макет повторяется с шагом; реплики меняются.") + "</div>"
     + '<div>' + ul("Ткань или сетка: проверьте контраст на пробнике — коралловый на сетке темнеет.") + "</div>"
     + "</div>", "light", "Носители")


def passport():
    w, h = 400, 300
    t = 10
    body = f'<rect width="{w}" height="{h}" fill="#fff"/>'
    body += f'<rect width="{w}" height="70" fill="{C["navy"]}"/>'
    body += ring_layer(f'<clipPath id="ppc"><rect width="{w}" height="70"/></clipPath><g clip-path="url(#ppc)">'
                       + rings(420, 100, 5 * t, t, [[(185, 268)], [(195, 238), (252, 272)], [(186, 262)]], C["coral"]) + "</g>")
    body += plate(15, 12, 95, city="Петропавловск-Камчатский")
    body += text_block(140, 32, ["Паспорт объекта"], 14, ls=0.04, weight=700)
    body += f'<text x="140" y="52" font-size="11" font-weight="500" fill="#fff" class="ko">Школа на 1100 мест</text>'
    body += f'<image href="{PHOTO}photostyle-composition-12.webp" x="15" y="85" width="175" height="140" preserveAspectRatio="xMidYMid slice"/>'
    body += f'<text x="15" y="238" font-size="7.5" fill="{C["ink"]}" opacity=".6">Визуализация объекта</text>'
    rows = [("Адрес", "ул. Ленинградская, 74"), ("Заказчик", "Администрация города"),
            ("Подрядчик", "ООО «Строитель»"), ("Начало работ", "март 2026"), ("Окончание", "август 2027"),
            ("Ответственный", "Иванов И. И., +7 (4152) 00-00-00")]
    y = 95
    for k, v in rows:
        body += f'<text x="205" y="{y}" font-size="7.5" fill="{C["ink"]}" opacity=".6">{k}</text><text x="205" y="{y + 12}" font-size="9.5" font-weight="500" fill="{C["ink"]}">{v}</text>'
        body += f'<line x1="205" y1="{y + 18}" x2="385" y2="{y + 18}" stroke="{C["line"]}" stroke-width=".6"/>'
        y += 26
    body += f'<rect x="0" y="{h - 40}" width="{w}" height="40" fill="{C["mist"]}"/>'
    body += f'<text x="15" y="{h - 16}" font-size="10" font-weight="700" fill="{C["navy"]}">Строим будущее здесь</text>'
    body += f'<text x="385" y="{h - 16}" font-size="8" fill="{C["ink"]}" text-anchor="end" opacity=".7">Подробнее о мастер-плане: masterplan.example.ru</text>'
    return art(w, h, body, t=t)


page(h("Паспорт объекта", "Обязательный информационный щит на стройке. Фирменная шапка, визуализация и данные об объекте — в одной сетке.")
     + f'<div class="split wide-art"><figure class="col-art mock pass">{passport()}</figure><div class="col-text">'
     + ul("Формат 2 × 1,5 м (или по требованиям региона).", "Шапка — синяя, с логотипом на плашке и кольцами справа.", "Данные — графитом на белом, Medium; подписи полей — 60% графита.", "Состав полей — по требованиям регионального законодательства. Адрес сайта и данные на макете — условные.")
     + "</div></div>", "light", "Носители")


def post_sq():
    w = h = 1080
    t = 54
    body = ring_layer(rings(1120, 1130, 6 * t, t, [[(185, 268)], [(192, 232), (248, 272)], [(184, 262)], [(195, 240)]], C["coral"]))
    body += plate(1.5 * t, 1.5 * t, 8 * t, city="Хабаровск")
    body += text_block(1.5 * t, 560, ["Здесь будет", ("набережная", C["coral"])], 92, lh=1.0)
    body += f'<text x="{1.5 * t}" y="790" font-size="38" font-weight="500" fill="#fff" class="ko"><tspan x="{1.5 * t}">2 км прогулочной зоны,</tspan><tspan x="{1.5 * t}" dy="50">велодорожка и амфитеатр</tspan></text>'
    return art(w, h, body, bg=C["navy"], t=t)


def story():
    w, h = 1080, 1920
    t = 54
    body = f'<image href="{PHOTO}photostyle-composition-7.webp" x="0" y="0" width="1080" height="1100" preserveAspectRatio="xMidYMid slice"/>'
    body += f'<rect y="1100" width="1080" height="820" fill="{C["navy"]}"/>'
    body += ring_layer(f'<clipPath id="stc"><rect y="1100" width="1080" height="820"/></clipPath><g clip-path="url(#stc)">'
                       + rings(1120, 1970, 6 * t, t, [[(186, 262)], [(194, 236), (248, 272)], [(184, 260)], [(196, 250)]], C["coral"]) + "</g>")
    body += plate(1.5 * t, 1.5 * t, 8 * t, city="Хабаровск")
    body += bubble(1.5 * t, 990, 820, 260, ["Скоро здесь будет новый", "колледж — с мастерскими", "и общежитием."], 50, t)
    body += text_block(1.5 * t, 1450, ["Строим", ("будущее", C["coral"]), "здесь"], 96, lh=1.0)
    return art(w, h, body, t=t)


page(h("Соцсети", "Пост и история. Те же правила, что на улице: одна мысль, логотип на плашке, кольца из угла.")
     + f'<div class="mock-row"><figure class="mock sq">{post_sq()}<figcaption>Пост 1080 × 1080</figcaption></figure>'
     + f'<figure class="mock st">{story()}<figcaption>История 1080 × 1920</figcaption></figure>'
     + '<div class="col-text">' + ul("Логотип с городом — для местных аккаунтов, без города — для общих.", "Заголовок — не меньше 80 px на квадрате: пост читают в ленте с телефона.", "Текст в описании поста, а не на картинке.") + "</div></div>",
     "light", "Носители")


def slide_title():
    w, h = 1920, 1080
    t = 54
    body = ring_layer(rings(1980, 1140, 6 * t, t, [[(186, 262)], [(194, 234), (250, 272)], [(184, 262)], [(196, 248)]], C["coral"]))
    body += plate(1.5 * t, 1.5 * t, 9 * t)
    body += text_block(1.5 * t, 640, ["Мастер-план", ("Петропавловска-", "#fff"), "Камчатского"], 110, lh=1.0)
    body += f'<text x="{1.5 * t}" y="1000" font-size="34" font-weight="500" fill="#fff" opacity=".75" class="ko">Отчёт о ходе реализации · 2026</text>'
    return art(w, h, body, bg=C["navy"], t=t)


def slide_content():
    w, h = 1920, 1080
    t = 54
    body = f'<rect width="{w}" height="{h}" fill="#fff"/>'
    body += f'<image href="{LOGO}mp-blue.svg" x="{1920 - 81 - 360}" y="60" width="360" height="{360 / LOGO_R:.1f}"/>'
    body += f'<text x="81" y="130" font-size="30" font-weight="500" fill="{C["coral"]}" style="text-transform:uppercase;letter-spacing:.06em">ОБРАЗОВАНИЕ</text>'
    body += f'<text x="81" y="230" font-size="76" font-weight="700" fill="{C["navy"]}">Что строим в 2026 году</text>'
    stats = [("3", "новые школы"), ("1100", "мест в крупнейшей"), ("2027", "открытие первой")]
    for i, (n, d) in enumerate(stats):
        x = 81 + i * 600
        body += f'<text x="{x}" y="560" font-size="200" font-weight="800" fill="{C["navy"]}">{n}</text>'
        body += f'<text x="{x}" y="640" font-size="36" font-weight="500" fill="{C["ink"]}">{d}</text>'
    body += ring_layer(rings(1980, 1140, 6 * t, t, [[(196, 252)], [(200, 236), (250, 268)]], C["navy"]))
    body += f'<text x="81" y="1000" font-size="22" fill="{C["ink"]}" opacity=".6" class="ko">Источник: администрация города, данные на 1 октября 2026 · цифры условные</text>'
    return art(w, h, body, t=t)


page(h("Презентация", "Титульный слайд на синем, рабочие слайды — на белом с синими кольцами в углу.")
     + f'<div class="mock-row two"><figure class="mock wide">{slide_title()}</figure><figure class="mock wide bordered">{slide_content()}</figure></div>',
     "light", "Носители")


def rollup():
    w, h = 170, 400
    t = w / 20 * 1.0
    body = ring_layer(rings(190, 420, 6 * t, t, [[(186, 262)], [(194, 236), (248, 272)], [(184, 260)], [(196, 250)]], C["coral"]))
    body += plate(1.5 * t, 1.5 * t, 13 * t, city="Магадан")
    body += text_block(1.5 * t, 150, ["Строим", "будущее", ("вместе", C["coral"])], 24, lh=1.02)
    body += f'<text x="{1.5 * t}" y="250" font-size="9.5" font-weight="500" fill="#fff" class="ko"><tspan x="{1.5 * t}">Узнайте, что появится</tspan><tspan x="{1.5 * t}" dy="13">в вашем районе</tspan></text>'
    return art(w, h, body, bg=C["navy"], t=t)


def flag():
    w, h = 300, 200
    t = 10
    body = ring_layer(rings(320, 220, 6 * t, t, [[(186, 262)], [(194, 236), (248, 272)], [(184, 260)]], C["coral"]))
    body += plate(1.5 * t, 1.5 * t, 12 * t)
    return art(w, h, body, bg=C["navy"], t=t)


page(h("Ролл-ап и флаг", "Для встреч с жителями, публичных слушаний и открытий объектов.")
     + f'<div class="mock-row"><figure class="mock ru">{rollup()}<figcaption>Ролл-ап 0,85 × 2 м</figcaption></figure>'
     + f'<figure class="mock fl">{flag()}<figcaption>Флаг 1,5 × 1 м</figcaption></figure>'
     + '<div class="col-text">' + ul("На ролл-апе логотип — в верхней трети: нижнюю часть закрывают люди и мебель.", "Ссылка или QR — на уровне глаз, не ниже середины.", "Флаг — только логотип на плашке и кольца, без текста.") + "</div></div>",
     "light", "Носители")

page(h("Фотомокапы в среде", "Следующий шаг — фотореалистичные мокапы. Готовим отдельно и добавим в эту версию.")
     + '<div class="cols3">'
     + '<div><h3>Город</h3>' + ul("Щит 6 × 3 м на стройке", "Ситиформат на остановке", "Ограждение вдоль улицы") + "</div>"
     + '<div><h3>Транспорт</h3>' + ul("Автобус — борт и корма", "Брендированный служебный автомобиль") + "</div>"
     + '<div><h3>События</h3>' + ul("Ролл-ап и пресс-волл на открытии объекта", "Флаги на площадке") + "</div>"
     + "</div>", "light", "Носители")

# Задник
back = deck_rings(2000, 1160, 324, [[(186, 268)], [(192, 228), (244, 270)], [(198, 252)]])
page(f'<div class="dv-bg">{back}</div><div class="cv-plate end">{art(800, 800 / LOGO_R + 2 * BAR * 800 / LOGO_R, plate(0, 0, 800 - 2 * BAR * 800 / LOGO_R), cls="cv-logo")}</div>'
     f'<div class="cv-foot"><p class="cv-sub">{T("Вопросы по стилю и файлы логотипов — у команды проекта.")}</p></div>', "navy cover")

# Номера страниц в содержании
sec_pages = {}
for i, p in enumerate(pages):
    m = re.search(r'class="dv-num">(\d+)<', p)
    if m:
        sec_pages[m.group(1)] = i + 2  # первая страница после разделителя
toc_html = h("Содержание") + '<ol class="toc">' + "".join(
    f'<li><a href="#p{sec_pages.get(n, 1) - 1}"><span class="toc-n">{n}</span><span class="toc-t">{t}</span><span class="toc-p">{sec_pages.get(n, 0):02d}</span></a></li>' for n, t, _ in toc
) + "</ol>"
pages[TOC_INDEX] = re.sub(r'(<header class="ph">.*?</header>).*(</section>)$', lambda m: m.group(1) + toc_html + m.group(2), pages[TOC_INDEX], flags=re.S)

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
<div class="toolbar"><span>Мастер-планы · Брендбук · {len(pages)} стр.</span><a href="master-plans/master-plans-brandbook.pdf" download>Скачать PDF</a><span class="tb-hint">или Файл → Печать → Сохранить как PDF</span></div>
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
