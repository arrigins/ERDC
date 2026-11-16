"""Геометрия знаков (shapely → SVG path). Поле 240×240."""
import math
from shapely.geometry import Polygon, Point, box, MultiPolygon
from shapely.affinity import rotate, scale, translate
from shapely import ops

Q = 64  # сегментов на четверть круга


def f(v):
    return f"{v:.2f}".rstrip('0').rstrip('.')


def to_path(geom):
    if geom.is_empty:
        return ''
    polys = list(geom.geoms) if hasattr(geom, 'geoms') else [geom]
    d = ''
    for p in polys:
        for ring in [p.exterior] + list(p.interiors):
            cs = list(ring.coords)
            d += 'M' + ' '.join(f"{f(x)} {f(y)}" for x, y in cs[:-1]) + 'Z'
    return d


def soften(g, r):
    """скругляет выпуклые и вогнутые углы радиусом r"""
    if r <= 0:
        return g
    return g.buffer(-r, quad_segs=Q).buffer(2 * r, quad_segs=Q).buffer(-r, quad_segs=Q)


def round_convex(g, r):
    if r <= 0:
        return g
    return g.buffer(-r, quad_segs=Q).buffer(r, quad_segs=Q)


def circle(cx, cy, r):
    return Point(cx, cy).buffer(r, quad_segs=Q)


def rhombus(cx, cy, h, r=0):
    p = Polygon([(cx, cy - h), (cx + h, cy), (cx, cy + h), (cx - h, cy)])
    return round_convex(p, r)


def petal(cx, cy, h, r_bottom, r_top=1.5):
    """лепесток: острый верх, скруглённый низ (ромб со скруглением снизу)"""
    p = rhombus(cx, cy, h)
    low = round_convex(p, r_bottom)
    top = round_convex(p, r_top)
    cut = box(cx - h - 1, cy - h - 1, cx + h + 1, cy)
    return ops.unary_union([top.intersection(cut), low.difference(cut)]).buffer(0)


def v_halfplane(cx, apex_y, big=600):
    """область ниже V с вершиной (cx, apex_y), стороны под 45°"""
    return Polygon([(cx - big, apex_y - big), (cx, apex_y), (cx + big, apex_y - big),
                    (cx + big, apex_y + big), (cx - big, apex_y + big)])


def petal2(cx, cy, h, rb=26, rs=7):
    """лепесток: острый верх, мягкие бока, круглый низ (выпуклая оболочка)"""
    from shapely.geometry import MultiPoint
    top = Point(cx, cy - h).buffer(1.2, quad_segs=Q)
    sl = Point(cx - h + rs * 1.41, cy).buffer(rs, quad_segs=Q)
    sr = Point(cx + h - rs * 1.41, cy).buffer(rs, quad_segs=Q)
    bt = Point(cx, cy + h - rb * 1.41).buffer(rb, quad_segs=Q)
    return ops.unary_union([top, sl, sr, bt]).convex_hull
