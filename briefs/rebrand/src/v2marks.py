import math
from marks import f
from glyphs import text_path, cap_height, glyph_bounds
K = math.tan(math.radians(19.47))  # Kelvin wake half-angle

# ---- Северо-восток ----
def ne(v, c):
    a, b = c['a'], c['b']
    o, S = 20, 200; x1 = o+S
    if v == 'A':
        r, g = 100, 11
        return (f'<path d="M{o} {o}H{x1-r-g}A{r+g} {r+g} 0 0 0 {x1} {o+r+g}V{o+S}H{o}Z" fill="{a}"/>'
                f'<path d="M{x1} {o}V{o+r}A{r} {r} 0 0 1 {x1-r} {o}Z" fill="{b}"/>')
    if v == 'B':  # no gap, sun larger, square slightly rounded outer corners (bl only)
        r = 116
        return (f'<path d="M{o} {o}H{x1-r}A{r} {r} 0 0 0 {x1} {o+r}V{o+S}H{o}Z" fill="{a}"/>'
                f'<path d="M{x1} {o}V{o+r}A{r} {r} 0 0 1 {x1-r} {o}Z" fill="{b}"/>')
    if v == 'C':  # corner bracket + sun
        t = 46; r = 92
        return (f'<path d="M{o} {o+70}V{o+S}H{x1-70}V{o+S-t}H{o+t}V{o+70}Z" fill="{a}"/>'
                f'<path d="M{x1} {o}V{o+r}A{r} {r} 0 0 1 {x1-r} {o}Z" fill="{b}"/>')

# ---- Ледокол (Kelvin wake 19.47°) ----
def ice(v, c):
    a, b = c['a'], c['b']
    o, S = 20, 200; x1, y1 = o+S, o+S
    ax, ay = 120, 46
    if v == 'A':  # two floes parted by wake wedge, red ice-breaker at apex
        g = 8; gx = g / math.cos(math.radians(19.47))
        hw = (y1-ay)*K
        L = (f'<path d="M{o} {o}H{f(ax-gx)}V{f(ay)}L{f(ax-gx-hw)} {y1}H{o}Z" fill="{a}"/>')
        R = (f'<path d="M{x1} {o}H{f(ax+gx)}V{f(ay)}L{f(ax+gx+hw)} {y1}H{x1}Z" fill="{a}"/>')
        ship = f'<path d="M{ax} {ay-30}L{ax+11} {ay+6}H{ax-11}Z" fill="{b}"/>'
        # simpler: floes with gap starting at top edge, red prow sits in the opening
        return L + R + ship
    if v == 'B':  # solid prow: red wedge cutting the floe
        g = 9; gx = g / math.cos(math.radians(19.47)); hw = (y1-ay)*K
        L = f'<path d="M{o} {o}H{x1}V{y1}H{f(ax+hw+gx)}L{ax} {f(ay-gx/K*0.35)}L{f(ax-hw-gx)} {y1}H{o}Z" fill="{a}"/>'
        W = f'<path d="M{ax} {ay}L{f(ax+hw)} {y1}H{f(ax-hw)}Z" fill="{b}"/>'
        return L + W
    if v == 'C':  # wake lines on open water
        out = ''; sw = 16
        for k, (y0, ln) in enumerate([(70, 150), (112, 108), (154, 66)]):
            pass
        pts = []
        for d in (0, 44, 88):
            yy = ay + d; hw = (y1 - yy) * K
            out += (f'<path d="M{f(ax-hw-0)} {y1}L{ax} {yy}L{f(ax+hw)} {y1}" fill="none" stroke="{a}" stroke-width="{sw}" stroke-linejoin="miter"/>')
        out += f'<circle cx="{ax}" cy="{ay-26}" r="15" fill="{b}"/>'
        return f'<g clip-path="inset(0)">{out}</g>'

# ---- Основание: wordmarks ----
FAM, W = 'onest', 800
def osn(v, ink, accent=None, size=100):
    """returns (svg_body, width, height) in a local box starting at 0,0"""
    ch = cap_height(FAM, W, size)
    d, wd = text_path('КРДВ', FAM, W, size, 0, ch, tracking=-10)
    db = glyph_bounds('Д', FAM, W, size)
    feet = ch - db[1]  # Д bottom y
    acc = accent or ink
    if v == 'A':   # pedestal: letters stand ON a thick slab wider than the word
        ext = ch*.18; th = ch*.42
        body = f'<path d="M0 0" /><g transform="translate({f(ext)} 0)"><path d="{d}" fill="{ink}"/></g>'
        body += f'<rect x="0" y="{f(ch)}" width="{f(wd+2*ext)}" height="{f(th)}" fill="{acc}"/>'
        return body, wd+2*ext, ch+th
    if v == 'B':   # long base line; Д feet go through it
        th = ch*.12; gap = ch*.08; run = wd*1.15
        body = f'<path d="{d}" fill="{ink}"/>'
        body += f'<rect x="0" y="{f(ch+gap)}" width="{f(wd+run)}" height="{f(th)}" fill="{acc}"/>'
        return body, wd+run, max(feet, ch+gap+th)
    if v == 'C':   # monogram Д-portal on slab
        return None
def osn_symbol(ink, acc):
    # Д as portal: trapezoid-free geometric: two piers + lintel on a wide slab
    return (f'<path fill="{ink}" fill-rule="evenodd" d="M62 42H178V164H62Z M100 80H140V164H100Z"/>'
            f'<rect x="28" y="172" width="184" height="36" fill="{acc}"/>')

# ---- Ледокол v2: ship breaking into intact ice, Kelvin wake behind ----
def ice2(c, apex=92, ship_w=30, gap=8, o=20, S=200):
    a, b = c['a'], c['b']
    x1, y1 = o+S, o+S; cx = o+S/2
    hw0 = ship_w/2 + gap         # channel half-width at the ship's stern
    stern = apex + 46            # where the wake starts
    hwb = hw0 + (y1-stern)*K
    ice = (f'<path d="M{o} {o}H{x1}V{y1}H{f(cx+hwb)}L{f(cx+hw0)} {f(stern)}V{f(apex-gap*1.1)}'
           f'Q{f(cx+hw0)} {f(apex-26-gap)} {cx} {f(apex-38-gap*1.6)}Q{f(cx-hw0)} {f(apex-26-gap)} {f(cx-hw0)} {f(apex-gap*1.1)}'
           f'V{f(stern)}L{f(cx-hwb)} {y1}H{o}Z" fill="{a}"/>')
    sw = ship_w/2
    ship = (f'<path d="M{f(cx-sw)} {f(stern)}V{f(apex)}Q{f(cx-sw)} {f(apex-24)} {cx} {f(apex-36)}'
            f'Q{f(cx+sw)} {f(apex-24)} {f(cx+sw)} {f(apex)}V{f(stern)}Z" fill="{b}"/>')
    return ice + ship

# ---- Первый камень: 2x2 engraved block ----
def stone(c, letters='КРДВ', o=20, S=200, cap=0.56, pad_k=0.0, round_=0):
    from glyphs import font
    a = c['a']; ink = c.get('t', '#fff')
    cell = S/2
    out = f'<rect x="{o}" y="{o}" width="{S}" height="{S}" rx="{round_}" fill="{a}"/>'
    size = 100
    chh = cap_height(FAM, W, size)
    sc = cell*cap/chh
    for i, ch in enumerate(letters):
        bx = glyph_bounds(ch, FAM, W, size)
        gw = (bx[2]-bx[0])
        cx0 = o + (i % 2)*cell + cell/2; cy0 = o + (i//2)*cell + cell/2
        d, _ = text_path(ch, FAM, W, size, 0, 0)
        tx = cx0 - (bx[0] + gw/2)*sc; ty = cy0 + chh*sc/2
        out += f'<path transform="translate({f(tx)} {f(ty)}) scale({f(sc)})" d="{d}" fill="{ink}"/>'
    return out

def ice_east(c, o=20, S=200, tip=168, ship_len=44, ship_w=26, gap=8):
    a, b = c['a'], c['b']; x1 = o+S; y1 = o+S; cy = o+S/2
    stern = tip - ship_len
    hw0 = ship_w/2 + gap
    hwl = hw0 + (stern - o)*K
    ice = (f'<path fill="{a}" d="M{o} {o}H{x1}V{y1}H{o}V{f(cy+hwl)}L{f(stern)} {f(cy+hw0)}H{f(tip-16)}'
           f'Q{f(tip+gap*1.2)} {f(cy+hw0*0.6)} {f(tip+gap*1.6)} {cy}Q{f(tip+gap*1.2)} {f(cy-hw0*0.6)} {f(tip-16)} {f(cy-hw0)}'
           f'H{f(stern)}L{o} {f(cy-hwl)}Z"/>')
    sw = ship_w/2
    ship = (f'<path fill="{b}" d="M{f(stern)} {f(cy-sw)}H{f(tip-20)}Q{f(tip-4)} {f(cy-sw*0.7)} {tip} {cy}'
            f'Q{f(tip-4)} {f(cy+sw*0.7)} {f(tip-20)} {f(cy+sw)}H{f(stern)}Z"/>')
    return ice + ship

def wake_chev(c, o=20, S=200, t=30):
    a, b = c['a'], c['b']; ax, ay = 120, 78; y1 = o+S
    hw = (y1-ay)*K; tx = t/ math.cos(math.radians(19.47))
    # outer and inner chevron
    outer = f'M{f(ax-hw-tx/2)} {y1}L{ax} {f(ay - tx/2/K*0)}L{f(ax+hw+tx/2)} {y1}'
    d = (f'M{f(ax-hw-tx/2)} {y1}L{ax} {f(ay-tx/2/K)}L{f(ax+hw+tx/2)} {y1}H{f(ax+hw-tx/2)}L{ax} {f(ay+tx/2/K)}L{f(ax-hw+tx/2)} {y1}Z')
    return f'<path d="{d}" fill="{a}"/><circle cx="{ax}" cy="{f(ay-tx/2/K-30)}" r="17" fill="{b}"/>'
