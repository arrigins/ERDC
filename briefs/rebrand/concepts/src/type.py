"""Текст в кривые (Onest, OFL) с поддержкой пробела и латиницы."""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'node_modules', '@fontsource', 'onest', 'files')
_c = {}


def _font(w, sub):
    k = (w, sub)
    if k not in _c:
        _c[k] = TTFont(f"{BASE}/onest-{sub}-{w}-normal.woff2")
    return _c[k]


def _glyph(ch, w):
    for sub in ('cyrillic', 'latin'):
        f = _font(w, sub)
        g = f.getBestCmap().get(ord(ch))
        if g:
            return f, g
    return None, None


def cap(w, size):
    f, g = _glyph('Н', w)
    bp = BoundsPen(f.getGlyphSet()); f.getGlyphSet()[g].draw(bp)
    return bp.bounds[3] * size / f['head'].unitsPerEm


def text(txt, w, size, x=0, y=0, tr=0):
    """путь и ширина; y — базовая линия; tr — трекинг в тысячных em"""
    d = ''
    cx = 0.0
    for ch in txt:
        if ch == ' ':
            cx += size * 0.26 + tr * size / 1000
            continue
        f, g = _glyph(ch, w)
        if not f:
            cx += size * 0.5
            continue
        upm = f['head'].unitsPerEm
        s = size / upm
        pen = SVGPathPen(f.getGlyphSet())
        f.getGlyphSet()[g].draw(TransformPen(pen, (s, 0, 0, -s, x + cx, y)))
        d += pen.getCommands()
        cx += f['hmtx'][g][0] * s + tr * size / 1000
    return d, cx - tr * size / 1000


def width(txt, w, size, tr=0):
    return text(txt, w, size, 0, 0, tr)[1]
