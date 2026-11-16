"""Концепция 1 «Точка опоры»: варианты знака."""
import math
from geo import *

CX = 120


def cup(apex_y, R, oy, gap_round=14, horn='round', horn_r=6, inner='v', split=0, W=None):
    c = circle(CX, oy, R)
    if inner == 'v':
        body = c.intersection(v_halfplane(CX, apex_y))
        # скругление вершины V (внутренний угол)
        notch = v_halfplane(CX, apex_y).buffer(-0.01)
        body = body.union(Point(CX, apex_y + gap_round * 0.3).buffer(0.1))
        body = soften(body, gap_round) if gap_round else body
    else:  # дуга
        inner_c = circle(CX, apex_y - R * 0.95, R * 0.95)
        body = c.difference(inner_c).intersection(box(0, apex_y - 200, 240, 240))
        body = body.intersection(box(0, oy - R, 240, 240))
    if W:
        body = body.intersection(box(CX - W, 0, CX + W, 240))
    if split:
        body = body.difference(box(CX - split / 2, 0, CX + split / 2, 240))
    if horn == 'round':
        body = round_convex(body, horn_r)
    return body


VARIANTS = []


def variant(key, name, note):
    def deco(fn):
        VARIANTS.append(dict(key=key, name=name, note=note, fn=fn))
        return fn
    return deco


@variant('v1', 'Драфт команды', 'Исходник из презентации: мягкий ромб, чаша с V-образным краем.')
def v1():
    h, g = 62, 13
    cy = 82
    apex = cy + h + g * math.sqrt(2)
    return [(rhombus(CX, cy, h, 14), 'petal'), (cup(apex, 100, 128, gap_round=16, horn='round', horn_r=3), 'cup')]


@variant('v2', 'Собранный', 'Меньше скругления, рога чаши срезаны по одной высоте, просвет ровный.')
def v2():
    h, g = 60, 12
    cy = 80
    apex = cy + h + g * math.sqrt(2)
    c = cup(apex, 100, 126, gap_round=12, horn='none')
    c = c.intersection(box(0, cy - 4, 240, 240))
    return [(rhombus(CX, cy, h, 7), 'petal'), (round_convex(c, 2.5), 'cup')]


@variant('v3', 'Лепесток', 'Острый верх и мягкий низ: ромб превращается в лепесток лотоса.')
def v3():
    h, g = 62, 12
    cy = 80
    apex = cy + h + g * math.sqrt(2)
    c = cup(apex, 100, 126, gap_round=26, horn='none').intersection(box(0, cy - 4, 240, 240))
    return [(petal2(CX, cy, h, 24, 6), 'petal'), (round_convex(c, 2.5), 'cup')]


@variant('v4', 'Полумесяц', 'Чаша — тонкий серп, лепесток парит. Легче и воздушнее.')
def v4():
    h = 54
    cy = 74
    R = 100
    oy = 120
    outer = circle(CX, oy, R)
    inner = circle(CX, oy - 30, R - 6)
    c = outer.difference(inner).intersection(box(0, oy - 10, 240, 240))
    return [(rhombus(CX, cy, h, 10), 'petal'), (round_convex(c, 3), 'cup')]


@variant('v5', 'Две ладони', 'Чаша разделена на две части: поддержка с двух сторон, как листья лотоса.')
def v5():
    h, g = 58, 12
    cy = 82
    apex = cy + h + g * math.sqrt(2)
    c = cup(apex, 100, 126, gap_round=12, horn='none', split=12).intersection(box(0, cy - 4, 240, 240))
    return [(rhombus(CX, cy, h, 8), 'petal'), (round_convex(c, 3), 'cup')]


@variant('v6', 'Монолит', 'Круг, рассечённый линией-чашей: бутон и опора — одна фигура. Сильно работает как аватар.')
def v6():
    R, oy = 100, 122
    disc = circle(CX, oy, R)
    apex, g = 150, 12
    lower = disc.intersection(v_halfplane(CX, apex))
    upper = disc.difference(v_halfplane(CX, apex - g * math.sqrt(2)))
    return [(round_convex(upper, 3), 'petal'), (soften(lower, 6), 'cup')]


@variant('v7', 'Красный лепесток', '«Собранный» знак в цветах прежнего лотоса: красное над синим.')
def v7():
    return v2()


@variant('v8', 'Шеврон', 'Только углы 45°: лепесток над шевроном. Строгий, «инженерный» характер.')
def v8():
    h, g, t = 56, 12, 40
    cy = 84
    a1 = cy + h + g * math.sqrt(2)
    a2 = a1 + t * math.sqrt(2)
    band = v_halfplane(CX, a1).difference(v_halfplane(CX, a2)).intersection(box(CX - 104, cy - 6, CX + 104, 240))
    return [(rhombus(CX, cy, h, 6), 'petal'), (round_convex(band, 4), 'cup')]


@variant('v9', 'Восход', 'Вместо ромба — круг: солнце встаёт из чаши. Связь с красным и Востоком.')
def v9():
    r, g = 46, 12
    cy = 92
    oy = 126
    R = 100
    c = circle(CX, oy, R).difference(circle(CX, cy, r + g)).intersection(box(0, cy - 2, 240, 240))
    return [(circle(CX, cy, r), 'petal'), (round_convex(c, 6), 'cup')]


@variant('v10', 'Линия', 'Контурная версия для тиснения, вышивки и пиктограмм.')
def v10():
    parts = v2()
    out = []
    for g_, role in parts:
        out.append((g_.difference(g_.buffer(-9, quad_segs=Q)), role))
    return out


def sign_svg(key, petal='#245BED', cup_='#245BED', size=None, mono=None):
    v = next(x for x in VARIANTS if x['key'] == key)
    parts = v['fn']()
    if key == 'v7' and not mono:
        petal, cup_ = '#E3262B', '#1D3F9E'
    out = ''
    for g_, role in parts:
        col = mono or (petal if role == 'petal' else cup_)
        out += f'<path d="{to_path(g_)}" fill="{col}" fill-rule="evenodd"/>'
    s = f' width="{size}" height="{size}"' if size else ''
    return f'<svg viewBox="0 0 240 240"{s} aria-hidden="true">{out}</svg>', out



def _v3():
    h, g = 60, 12
    cy = 80
    apex = cy + h + g * math.sqrt(2)
    c = cup(apex, 100, 126, gap_round=12, horn='none').intersection(box(0, cy - 4, 240, 240))
    pet = rhombus(CX, cy, h, 7).union(rhombus(CX, cy, h, 0).intersection(box(0, 0, 240, cy - h * 0.55)))
    return [(pet, 'petal'), (round_convex(c, 2.5), 'cup')]


for _v in VARIANTS:
    if _v['key'] == 'v3':
        _v['fn'] = _v3
        _v['name'] = 'Острая вершина'
        _v['note'] = 'Верх лепестка острый — знак тянется вверх, к росту. Низ остаётся мягким.'
