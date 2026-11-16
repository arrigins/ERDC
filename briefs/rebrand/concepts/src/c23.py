"""Концепции 2 «Северо-восток» и 3 «Ледокол»: знаки и паттерны."""
import math, random
from shapely.geometry import LineString
from geo import *

K = math.tan(math.radians(19.47))   # угол Кельвина


# ---------- 2. Северо-восток ----------
def ne_sign(kind='A', o=20, S=200):
    x1, y0 = o + S, o
    sq = box(o, o, o + S, o + S)
    if kind == 'A':
        r, g = 104, 11
        sun = circle(x1, y0, r).intersection(sq)
        body = sq.difference(circle(x1, y0, r + g))
        return [(body, 'a'), (sun, 'b')]
    if kind == 'B':   # солнце и одна дуга-горизонт
        r, g, t = 66, 10, 30
        sun = circle(x1, y0, r).intersection(sq)
        arc = circle(x1, y0, r + g + t).difference(circle(x1, y0, r + g)).intersection(sq)
        body = sq.difference(circle(x1, y0, r + 2 * g + t))
        return [(body, 'a'), (arc, 'a'), (sun, 'b')]
    if kind == 'C':   # скруглённый квадрат: углы кроме северо-восточного
        r, g = 104, 11
        sun = circle(x1, y0, r).intersection(sq)
        body = soften(sq, 26).union(box(o + S / 2, o, o + S, o + S / 2)).difference(circle(x1, y0, r + g))
        return [(body, 'a'), (sun, 'b')]


def ne_tile(x, y, s, rot, sun=False):
    """клетка паттерна: четверть круга в одном из углов"""
    corners = [(x + s, y), (x + s, y + s), (x, y + s), (x, y)]
    cx, cy = corners[rot % 4]
    sq = box(x, y, x + s, y + s)
    r = s * 0.5
    g = s * 0.06
    q = circle(cx, cy, r).intersection(sq)
    body = sq.difference(circle(cx, cy, r + g)).buffer(-g / 2)
    return body, q


def ne_pattern(w, h, s, seed=3, suns=0.06):
    rnd = random.Random(seed)
    tiles, qs, red = [], [], []
    for j in range(int(h / s) + 1):
        for i in range(int(w / s) + 1):
            # волны: поворот зависит от синуса — получаются «сопки и волны»
            rot = int((math.sin(i * 0.55 + j * 0.25) + 1.2) * 1.7 + rnd.random() * 1.2) % 4
            b, q = ne_tile(i * s, j * s, s, rot)
            tiles.append(b)
            (red if rnd.random() < suns else qs).append(q)
    return tiles, qs, red


# ---------- 3. Ледокол ----------
def ice_sign(kind='A', o=20, S=200):
    sq = box(o, o, o + S, o + S)
    cx = o + S / 2
    apex = o + S * 0.24
    hw = (o + S - apex) * K
    wedge = Polygon([(cx, apex), (cx + hw, o + S), (cx - hw, o + S)])
    g = 10
    if kind == 'A':   # красный клин раздвигает лёд
        body = sq.difference(wedge.buffer(g, join_style=2))
        return [(body, 'a'), (wedge, 'b')]
    if kind == 'B':   # пустой канал, красный нос в вершине
        bow = Polygon([(cx, apex - 4), (cx + 14, apex + 34), (cx - 14, apex + 34)])
        chan = wedge.buffer(g * .6, join_style=2)
        body = sq.difference(chan)
        return [(body, 'a'), (bow.intersection(sq), 'b')]
    if kind == 'C':   # круг-льдина
        disc = circle(cx, o + S / 2, S / 2)
        body = disc.difference(wedge.buffer(g, join_style=2))
        return [(body, 'a'), (wedge.intersection(disc), 'b')]


def ice_pattern(w, h, seed=5, ships=6, gap=6):
    rnd = random.Random(seed)
    field = box(0, 0, w, h)
    cuts = []
    reds = []
    for _ in range(ships):
        ax, ay = rnd.uniform(0.05, 0.95) * w, rnd.uniform(0.0, 0.7) * h
        L = h * 1.6
        cuts.append(LineString([(ax, ay), (ax - L * K, ay + L)]))
        cuts.append(LineString([(ax, ay), (ax + L * K, ay + L)]))
        reds.append(Polygon([(ax, ay - 10), (ax + 6, ay + 10), (ax - 6, ay + 10)]))
    # горизонтальные трещины
    for _ in range(4):
        y = rnd.uniform(0.1, 0.9) * h
        cuts.append(LineString([(0, y), (w, y + rnd.uniform(-30, 30))]))
    net = ops.unary_union([c.buffer(gap / 2, cap_style=2) for c in cuts])
    floes = field.difference(net)
    return floes, reds


def ne_truchet(w, h, s, seed=7, sun_p=0.05, t=None):
    """классические плитки Трюше: две дуги в противоположных углах"""
    rnd = random.Random(seed)
    t = t or s * 0.22
    bands, suns = [], []
    r = s / 2
    for j in range(int(h / s) + 2):
        for i in range(int(w / s) + 2):
            x, y = i * s, j * s
            sq = box(x, y, x + s, y + s)
            flip = (math.sin(i * 0.7) + math.cos(j * 0.9) + rnd.uniform(-.8, .8)) > 0
            cs = [(x, y), (x + s, y + s)] if flip else [(x + s, y), (x, y + s)]
            if rnd.random() < sun_p:
                suns.append(circle(*cs[0], r - t / 2).intersection(sq))
                cs = cs[1:]
            for cx, cy in cs:
                ring = circle(cx, cy, r + t / 2).difference(circle(cx, cy, r - t / 2)).intersection(sq)
                bands.append(ring)
    return ops.unary_union(bands), suns


def ice_field(w, h, seed=5, ships=9, cracks=10, gap=4.5, tones=3):
    rnd = random.Random(seed)
    field = box(0, 0, w, h)
    cuts, reds = [], []
    for _ in range(ships):
        ax, ay = rnd.uniform(0.05, 0.95) * w, rnd.uniform(-0.1, 0.8) * h
        L = h * 2
        cuts += [LineString([(ax, ay), (ax - L * K, ay + L)]), LineString([(ax, ay), (ax + L * K, ay + L)])]
        reds.append(Polygon([(ax, ay - 9), (ax + 5.5, ay + 8), (ax - 5.5, ay + 8)]))
    for _ in range(cracks):
        y = rnd.uniform(0, 1) * h
        a = rnd.uniform(-0.18, 0.18)
        cuts.append(LineString([(-10, y), (w + 10, y + a * w)]))
    net = ops.unary_union([c.buffer(gap / 2, cap_style=2) for c in cuts])
    floes = field.difference(net)
    groups = [[] for _ in range(tones)]
    for p in (floes.geoms if hasattr(floes, 'geoms') else [floes]):
        groups[rnd.randrange(tones)].append(p)
    return [ops.unary_union(g) for g in groups], reds
