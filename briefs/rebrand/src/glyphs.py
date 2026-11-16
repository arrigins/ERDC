# text -> SVG path via fontTools (OFL fonts from @fontsource)
import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import os
BASE = os.path.join(os.path.dirname(__file__), '..', 'node_modules', '@fontsource')
_cache = {}
def font(family, weight, subset='cyrillic'):
    key = (family, weight, subset)
    if key not in _cache:
        p = f"{BASE}/{family}/files/{family}-{subset}-{weight}-normal.woff2"
        _cache[key] = TTFont(p)
    return _cache[key]

def text_path(txt, family, weight, size, x=0, y=0, tracking=0, subset='cyrillic', fonts=None):
    """returns (d, width). y = baseline. tracking in em/1000"""
    f = font(family, weight, subset)
    upm = f['head'].unitsPerEm
    cmap = f.getBestCmap(); gs = f.getGlyphSet(); hmtx = f['hmtx']
    s = size / upm
    pen = SVGPathPen(gs)
    cx = 0
    for ch in txt:
        g = cmap.get(ord(ch))
        if g is None:
            f2 = font(family, weight, 'latin'); c2 = f2.getBestCmap()
            raise SystemExit(f'missing {ch}')
        tp = TransformPen(pen, (s, 0, 0, -s, x + cx * s, y))
        gs[g].draw(tp)
        cx += hmtx[g][0] + tracking * upm / 1000
    width = (cx - tracking * upm / 1000) * s
    return pen.getCommands(), width

def cap_height(family, weight, size, subset='cyrillic'):
    f = font(family, weight, subset)
    gs = f.getGlyphSet(); cmap = f.getBestCmap()
    bp = BoundsPen(gs); gs[cmap[ord('Н')]].draw(bp)
    return bp.bounds[3] * size / f['head'].unitsPerEm

def glyph_bounds(ch, family, weight, size, subset='cyrillic'):
    f = font(family, weight, subset)
    gs = f.getGlyphSet(); cmap = f.getBestCmap()
    bp = BoundsPen(gs); gs[cmap[ord(ch)]].draw(bp)
    s = size / f['head'].unitsPerEm
    return [v * s for v in bp.bounds]
