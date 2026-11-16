import math
def f(v): return f"{v:.2f}".rstrip('0').rstrip('.')
def rot(p, c, deg):
    a = math.radians(deg); x, y = p[0]-c[0], p[1]-c[1]
    return (c[0] + x*math.cos(a) - y*math.sin(a), c[1] + x*math.sin(a) + y*math.cos(a))
def lens(top, bot, R):
    return f"M{f(bot[0])} {f(bot[1])}A{f(R)} {f(R)} 0 0 1 {f(top[0])} {f(top[1])}A{f(R)} {f(R)} 0 0 1 {f(bot[0])} {f(bot[1])}Z"
def lens_R(h, w):
    # lens height h, width w -> radius
    a = h/2; b = w/2  # b = R - d, a^2 = R^2 - d^2
    return (a*a + b*b) / (2*b)
def circle_x(c1, r1, c2, r2):
    (x1,y1),(x2,y2) = c1,c2
    dx,dy = x2-x1,y2-y1; d = math.hypot(dx,dy)
    a = (r1*r1 - r2*r2 + d*d)/(2*d); h = math.sqrt(r1*r1 - a*a)
    xm,ym = x1 + a*dx/d, y1 + a*dy/d
    return (xm - h*dy/d, ym + h*dx/d), (xm + h*dy/d, ym - h*dx/d)
def crescent(cx, oy, ro, iy, ri):
    p1, p2 = circle_x((cx,oy), ro, (cx,iy), ri)
    L, Rt = sorted([p1,p2])
    return (f"M{f(L[0])} {f(L[1])}A{f(ro)} {f(ro)} 0 0 0 {f(Rt[0])} {f(Rt[1])}"
            f"A{f(ri)} {f(ri)} 0 0 1 {f(L[0])} {f(L[1])}Z"), L, Rt

# ---------- Concept 1: lotus (box 240) ----------
def lotus(red='#E0262B', blue='#0058A8', side_angle=52, gap=7):
    cx = 120
    h, w = 118, 50
    R = lens_R(h, w)
    bot = (cx, 150); top = (cx, bot[1]-h)
    pivot = (cx, 176)
    hs, ws = 96, 44; Rs = lens_R(hs, ws)
    bs = (cx, 158); ts = (cx, bs[1]-hs)
    petals = [lens(top, bot, R)]
    for s in (-1, 1):
        petals.append(lens(rot(ts, pivot, s*side_angle), rot(bs, pivot, s*side_angle), Rs))
    bowl, L, Rt = crescent(cx, 118, 96, 60, 122)
    return petals, bowl, red, blue

def lotus_svg(size=240, red='#E0262B', blue='#0058A8', mono=None, **kw):
    petals, bowl, r, b = lotus(red, blue, **kw)
    if mono: r = b = mono
    ps = ''.join(f'<path d="{p}" fill="{r}"/>' for p in petals)
    return f'<svg viewBox="0 0 240 240" width="{size}" height="{size}">{ps}<path d="{bowl}" fill="{b}"/></svg>'

# ---------- Concept 3: north-east square (box 240) ----------
def ne_svg(size=240, navy='#0B1E4A', red='#E3262B', gap=10, r_frac=0.5):
    S = 200; o = 20; r = S*r_frac
    x0, y0, x1, y1 = o, o, o+S, o+S
    cr = r + gap
    # square minus circle(center top-right, cr): path square with arc cut
    sq = (f"M{x0} {y0}H{f(x1-cr)}A{f(cr)} {f(cr)} 0 0 0 {x1} {f(y0+cr)}V{y1}H{x0}Z")
    q = f"M{x1} {y0}V{f(y0+r)}A{f(r)} {f(r)} 0 0 1 {f(x1-r)} {y0}Z"
    return f'<svg viewBox="0 0 240 240" width="{size}" height="{size}"><path d="{sq}" fill="{navy}"/><path d="{q}" fill="{red}"/></svg>'

# ---------- Concept 1 v2: petal over cup (box 240) ----------
def opora_paths(gap=13, half=50, cr=10, pc=(120, 86), circ=(120, 112), R=106):
    import math
    cx, cy = pc
    # rounded rhombus
    k = cr * math.sqrt(2)  # offset along edges for corner rounding
    T=(cx, cy-half); Rr=(cx+half, cy); B=(cx, cy+half); L=(cx-half, cy)
    def toward(p, q, d):
        dx, dy = q[0]-p[0], q[1]-p[1]; n = math.hypot(dx, dy); return (p[0]+dx/n*d, p[1]+dy/n*d)
    pts = [T, Rr, B, L]; d = ''
    for i, p in enumerate(pts):
        prv = pts[i-1]; nxt = pts[(i+1) % 4]
        a = toward(p, prv, k); b = toward(p, nxt, k)
        d += ('M' if i == 0 else 'L') + f"{f(a[0])} {f(a[1])}Q{f(p[0])} {f(p[1])} {f(b[0])} {f(b[1])}"
    rh = d + 'Z'
    # cup: below V parallel to rhombus lower edges, inside circle
    ay = cy + half + gap * math.sqrt(2)
    ox, oy = circ
    # intersection of y = ay - t (x = cx + t) with circle
    # (t)^2 + (ay - t - oy)^2 = R^2 -> 2t^2 - 2(ay-oy)t + (ay-oy)^2 - R^2 = 0
    m = ay - oy
    t = (2*m + math.sqrt(4*m*m - 8*(m*m - R*R))) / 4
    xr, yr = cx + t, ay - t; xl = cx - t
    large = 1 if yr < oy else 0
    rv = 16  # rounding of V apex
    cup = (f"M{f(xl)} {f(yr)}L{f(cx-rv)} {f(ay-rv)}Q{f(cx)} {f(ay)} {f(cx+rv)} {f(ay-rv)}"
           f"L{f(xr)} {f(yr)}A{f(R)} {f(R)} 0 {large} 1 {f(xl)} {f(yr)}Z")
    return rh, cup

def opora_svg(size=240, red='#DE2327', blue='#243D8D', mono=None, **kw):
    rh, cup = opora_paths(**kw)
    r, b = (mono, mono) if mono else (red, blue)
    return f'<svg viewBox="0 0 240 240" width="{size}" height="{size}"><path d="{rh}" fill="{r}"/><path d="{cup}" fill="{b}"/></svg>'

# ---------- Concept 1 v3: rhombus over U-cup ----------
def opora3(half=50, cr=9, pc=(120, 84), gap=12, W=98, th=34, cut=5):
    cx, cy = pc
    k = cr*math.sqrt(2)
    T=(cx, cy-half); Rr=(cx+half, cy); B=(cx, cy+half); L=(cx-half, cy)
    def toward(p, q, d):
        dx, dy = q[0]-p[0], q[1]-p[1]; n = math.hypot(dx, dy); return (p[0]+dx/n*d, p[1]+dy/n*d)
    pts=[T,Rr,B,L]; d=''
    for i,p in enumerate(pts):
        a=toward(p,pts[i-1],k); b=toward(p,pts[(i+1)%4],k)
        d += ('M' if i==0 else 'L') + f"{f(a[0])} {f(a[1])}Q{f(p[0])} {f(p[1])} {f(b[0])} {f(b[1])}"
    rh = d+'Z'
    ay = cy + half + gap*math.sqrt(2)
    hy = ay - W          # V meets vertical side
    oy = ay + th - W     # semicircle centre
    rv = 14
    cup = (f"M{f(cx-W+cut)} {f(hy+cut)}L{f(cx-rv)} {f(ay-rv)}Q{f(cx)} {f(ay)} {f(cx+rv)} {f(ay-rv)}"
           f"L{f(cx+W-cut)} {f(hy+cut)}L{f(cx+W)} {f(hy+cut)}V{f(oy)}A{f(W)} {f(W)} 0 0 1 {f(cx-W)} {f(oy)}V{f(hy+cut)}Z")
    return rh, cup, dict(ay=ay, hy=hy, oy=oy, W=W, cx=cx, cy=cy, half=half, gap=gap, bottom=oy+W)

# ---------- Concept 1 v4: split lens «Над поверхностью» (box 240) ----------
def split_lens(h=204, w=100, split=0.60, gap=9, cx=120, top=18):
    R = lens_R(h, w); d = R - w/2   # circle centres at cx±d, y = top + h/2
    cy = top + h/2
    ys = top + h*split               # surface line
    def x_at(y):  # half-width of lens at y
        return math.sqrt(R*R - (y-cy)**2) - d
    y1 = ys - gap/2; y2 = ys + gap/2
    a1 = x_at(y1); a2 = x_at(y2)
    T = (cx, top); B = (cx, top+h)
    upper = (f"M{f(cx-a1)} {f(y1)}A{f(R)} {f(R)} 0 0 1 {f(cx)} {f(top)}A{f(R)} {f(R)} 0 0 1 {f(cx+a1)} {f(y1)}Z")
    lower = (f"M{f(cx-a2)} {f(y2)}H{f(cx+a2)}A{f(R)} {f(R)} 0 0 1 {f(cx)} {f(top+h)}A{f(R)} {f(R)} 0 0 1 {f(cx-a2)} {f(y2)}Z")
    return upper, lower, dict(R=R, d=d, cy=cy, ys=ys, top=top, h=h, w=w, a1=a1, a2=a2, y1=y1, y2=y2)
def split_svg(size=240, red='#DE2327', blue='#243D8D', mono=None, **kw):
    u, l, g = split_lens(**kw)
    r, b = (mono, mono) if mono else (red, blue)
    return f'<svg viewBox="0 0 240 240" width="{size}" height="{size}"><path d="{u}" fill="{r}"/><path d="{l}" fill="{b}"/></svg>'

# ---------- Concept 1 v5: fan lotus over surface ----------
def fan(n=5, step=34, h=104, w=34, pivot=(120,150), off=10, side_scale=1.0, base='bar', bh=18, bgap=10, bw=196):
    out = []
    R = lens_R(h, w)
    for i in range(n):
        ang = (i - (n-1)/2) * step
        sc = 1 if i == (n-1)//2 else side_scale
        hh = h*sc; RR = lens_R(hh, w*sc)
        bot = (pivot[0], pivot[1]-off); top = (pivot[0], pivot[1]-off-hh)
        out.append(lens(rot(top, pivot, ang), rot(bot, pivot, ang), RR))
    y = pivot[1] + bgap - off
    if base == 'bar':
        b = f"M{f(pivot[0]-bw/2)} {f(y)}H{f(pivot[0]+bw/2)}V{f(y+bh)}H{f(pivot[0]-bw/2)}Z"
    else:  # shallow bowl
        b, L, Rt = crescent(pivot[0], y-120+bh+ 6, 128, y-150, 150)
    return out, b
def fan_svg(size=240, red='#DE2327', blue='#243D8D', mono=None, **kw):
    ps, b = fan(**kw); r, bl = (mono, mono) if mono else (red, blue)
    return f'<svg viewBox="0 0 240 240" width="{size}" height="{size}">' + ''.join(f'<path d="{p}" fill="{r}"/>' for p in ps) + f'<path d="{b}" fill="{bl}"/></svg>'
