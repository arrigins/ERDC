"""Знаки трёх концепций: (svg, bbox)."""
from shapely import ops
from geo import to_path
import c1, c23


def _pack(parts, cols, rule='evenodd'):
    svg = ''.join(f'<path d="{to_path(g)}" fill="{cols[r]}" fill-rule="{rule}"/>' for g, r in parts)
    b = ops.unary_union([g for g, _ in parts]).bounds
    return svg, b


def s1(key='v2', petal='#245BED', cup='#245BED'):
    v = next(x for x in c1.VARIANTS if x['key'] == key)
    return _pack(v['fn'](), {'petal': petal, 'cup': cup})


def s2(kind='B', a='#0B1E4A', b='#E8402A'):
    return _pack(c23.ne_sign(kind), {'a': a, 'b': b})


def s3(kind='A', a='#0E2F44', b='#E3262B'):
    return _pack(c23.ice_sign(kind), {'a': a, 'b': b})


def bare(sign, size=None, cls=''):
    svg, (a, b, c, d) = sign
    pad = (d - b) * 0.0
    s = f' width="{size}"' if size else ''
    return f'<svg viewBox="{a} {b} {c - a} {d - b}"{s} class="{cls}" aria-hidden="true">{svg}</svg>'
