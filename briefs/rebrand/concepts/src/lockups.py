"""Версии логотипа. sign — внутренности SVG знака в поле 240 (видимая часть 20..220)."""
from type import text, width, cap
from geo import f

NAME3 = ['Корпорация развития', 'Дальнего Востока', 'и Арктики']
NAME2 = ['Корпорация развития', 'Дальнего Востока и Арктики']
H = 200  # высота знака в единицах локапа


def _sign(sign, x, y, h=H):
    """sign = (svg, (minx, miny, maxx, maxy)); вписываем по высоте h, ширина пропорционально"""
    svg, (a, b, c, d) = sign
    s = h / (d - b)
    return f'<g transform="translate({f(x - a * s)} {f(y - b * s)}) scale({f(s)})">{svg}</g>'


def sw(sign, h=H):
    svg, (a, b, c, d) = sign
    return (c - a) * h / (d - b)


def _svg(body, w, h, pad=0, label='КРДВ'):
    return (f'<svg viewBox="{f(-pad)} {f(-pad)} {f(w + 2 * pad)} {f(h + 2 * pad)}" role="img" '
            f'aria-label="{label}">{body}</svg>')


def main(sign, ink, k=0.56, gap=0.24, word='КРДВ', wt=800, tr=-6):
    size = H * k / cap(wt, 1)
    ch = cap(wt, size)
    gx = sw(sign) + H * gap
    d, w = text(word, wt, size, gx, H / 2 + ch / 2, tr)
    return _svg(_sign(sign, 0, 0) + f'<path d="{d}" fill="{ink}"/>', gx + w, H)


def with_desc(sign, ink, rule=None, k=0.56):
    size = H * k / cap(800, 1)
    ch = cap(800, size)
    gx = sw(sign) + H * 0.24
    base = H / 2 + ch / 2
    d, w = text('КРДВ', 800, size, gx, base, -6)
    ds = ch / 1.98
    dc = cap(500, ds)
    lh = ds * 1.27
    rx = gx + w + H * 0.11
    tx = rx + H * 0.11
    body = _sign(sign, 0, 0) + f'<path d="{d}" fill="{ink}"/>'
    body += f'<rect x="{f(rx)}" y="{f(base - ch)}" width="{f(H * 0.012)}" height="{f(ch)}" fill="{rule or ink}"/>'
    mw = 0
    for i, ln in enumerate(NAME2):
        dd, ww = text(ln, 500, ds, tx, base - ch + dc + i * lh)
        body += f'<path d="{dd}" fill="{ink}"/>'
        mw = max(mw, ww)
    return _svg(body, tx + mw, H)


def full_h(sign, ink, wt=600, lines=NAME3, k=0.8):
    n = len(lines)
    # высота блока (верх заглавной первой строки → базовая линия последней) = k·H
    size = k * H / (cap(wt, 1) + (n - 1) * 1.16)
    ch = cap(wt, size)
    lh = size * 1.16
    blk = ch + (n - 1) * lh
    top = (H - blk) / 2
    gx = sw(sign) + H * 0.2
    body = _sign(sign, 0, 0)
    mw = 0
    for i, ln in enumerate(lines):
        dd, ww = text(ln, wt, size, gx, top + ch + i * lh, -4)
        body += f'<path d="{dd}" fill="{ink}"/>'
        mw = max(mw, ww)
    return _svg(body, gx + mw, H)


def full_v(sign, ink, wt=600, lines=NAME3):
    size = H * 0.2
    ch = cap(wt, size)
    lh = size * 1.18
    ws = [width(ln, wt, size, -4) for ln in lines]
    W = max(ws + [sw(sign)])
    body = _sign(sign, (W - sw(sign)) / 2, 0)
    y0 = H + H * 0.32
    for i, ln in enumerate(lines):
        dd, ww = text(ln, wt, size, (W - ws[i]) / 2, y0 + ch + i * lh, -4)
        body += f'<path d="{dd}" fill="{ink}"/>'
    return _svg(body, W, y0 + ch + (len(lines) - 1) * lh + size * 0.28)


def vert_short(sign, ink):
    size = H * 0.5 / cap(800, 1)
    ch = cap(800, size)
    w = width('КРДВ', 800, size, -6)
    W = max(w, sw(sign))
    d, _ = text('КРДВ', 800, size, (W - w) / 2, H + H * 0.3 + ch, -6)
    return _svg(_sign(sign, (W - sw(sign)) / 2, 0) + f'<path d="{d}" fill="{ink}"/>', W, H + H * 0.3 + ch)


def draft_full(sign, ink):
    """как в драфте: КОРПОРАЦИЯ РАЗВИТИЯ капсом + мелкий дескриптор — для сравнения «было»"""
    s1 = H * 0.3 / cap(800, 1)
    c1 = cap(800, s1)
    gx = sw(sign) + H * 0.18
    body = _sign(sign, 0, 0)
    d1, w1 = text('КОРПОРАЦИЯ', 800, s1, gx, H * 0.08 + c1, 0)
    d2, w2 = text('РАЗВИТИЯ', 800, s1, gx, H * 0.08 + c1 * 2.25, 0)
    s3 = s1 * 0.42
    d3, w3 = text('Дальнего Востока и Арктики', 500, s3, gx, H * 0.08 + c1 * 2.25 + c1 * 0.95, 0)
    body += ''.join(f'<path d="{d}" fill="{ink}"/>' for d in (d1, d2, d3))
    return _svg(body, gx + max(w1, w2, w3), H * 1.08)
