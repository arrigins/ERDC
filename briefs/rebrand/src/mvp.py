import math
from marks import f, ne_svg
from glyphs import text_path, cap_height, glyph_bounds

FAM, W = 'onest', 800
def word(fill, size=100, plinth=False):
    ch = cap_height(FAM, W, size)
    d, wd = text_path('КРДВ', FAM, W, size, 0, ch)
    db = glyph_bounds('Д', FAM, W, size)
    body = f'<path d="{d}" fill="{fill}"/>'
    hgt = ch
    if plinth:
        top = ch + ch*.075; bot = ch - db[1]  # bottom of Д feet
        body += f'<rect x="0" y="{f(top)}" width="{f(wd)}" height="{f(bot-top)}" fill="{fill}"/>'
        hgt = bot
    return body, wd, hgt

def mark(i, c):
    if i == 1:  # north-east
        S, o, r, g = 200, 20, 100, 11
        x1, y0 = o+S, o
        return (f'<path d="M{o} {o}H{x1-r-g}A{r+g} {r+g} 0 0 0 {x1} {o+r+g}V{o+S}H{o}Z" fill="{c["a"]}"/>'
                f'<path d="M{x1} {y0}V{y0+r}A{r} {r} 0 0 1 {x1-r} {y0}Z" fill="{c["b"]}"/>')
    if i == 3:  # gate
        o, S = 24, 192; ow, oy = 76, 104   # opening width, arch spring y
        cx = 120; r = ow/2
        gate = (f'<path fill-rule="evenodd" fill="{c["a"]}" d="M{o} {o}H{o+S}V{o+S}H{o}Z '
                f'M{cx-r} {o+S}V{oy}A{r} {r} 0 0 1 {cx+r} {oy}V{o+S}Z"/>')
        sun = f'<path d="M{cx-31} {o+S}A31 31 0 0 1 {cx+31} {o+S}Z" fill="{c["b"]}"/>'
        return gate + sun
    if i == 4:  # coordinate
        out = ''; ys = [52, 92, 132, 172]; lens = [(40,200),(28,212),(20,220),(28,212)]
        t = 20; dot = (162, 132); dr = 22; gap = 9
        for y, (a, b) in zip(ys, lens):
            if y == dot[1]:
                out += f'<rect x="{a}" y="{y-t/2}" width="{dot[0]-dr-gap-a}" height="{t}" fill="{c["a"]}"/>'
                out += f'<rect x="{dot[0]+dr+gap}" y="{y-t/2}" width="{b-dot[0]-dr-gap}" height="{t}" fill="{c["a"]}"/>'
            else:
                out += f'<rect x="{a}" y="{y-t/2}" width="{b-a}" height="{t}" fill="{c["a"]}"/>'
        out += f'<circle cx="{dot[0]}" cy="{dot[1]}" r="{dr}" fill="{c["b"]}"/>'
        return out
    if i == 5:  # icebreaker
        out = ''; t = 18; step = 32; ys = [36 + k*step for k in range(6)]
        cw = 30  # channel half width
        tipy = 70  # prow tip
        prow_base = 120
        for y in ys:
            if y + t <= prow_base - 4:
                out += f'<rect x="24" y="{y}" width="192" height="{t}" fill="{c["a"]}"/>'
            else:
                out += f'<rect x="24" y="{y}" width="{120-cw-24-6}" height="{t}" fill="{c["a"]}"/>'
                out += f'<rect x="{120+cw+6}" y="{y}" width="{216-120-cw-6}" height="{t}" fill="{c["a"]}"/>'
        # top bars are cut by prow wedge
        out = ''
        for y in ys:
            yc = y + t/2
            if yc < tipy:
                out += f'<rect x="24" y="{y}" width="192" height="{t}" fill="{c["a"]}"/>'; continue
            # half width of cleared zone at this y (wedge from tip widening to cw at prow_base)
            hw = cw if yc >= prow_base else cw * (yc - tipy) / (prow_base - tipy)
            hw += 7
            out += f'<rect x="24" y="{y}" width="{f(120-hw-24)}" height="{t}" fill="{c["a"]}"/>'
            out += f'<rect x="{f(120+hw)}" y="{y}" width="{f(216-120-hw)}" height="{t}" fill="{c["a"]}"/>'
        out += f'<path d="M120 {tipy-30}L{120+cw} {prow_base-10}H{120-cw}Z" fill="{c["b"]}"/>'
        return out
    return ''

IDEAS = [
 dict(n=1, key='ne', name='Северо-восток', meta='Здесь начинается день и рост',
      text='Дальний Восток и Арктика — северо-восток страны. Здесь первым встаёт солнце, а на любом графике северо-восток означает рост. Знак: квадрат территории и красная четверть солнца в правом верхнем углу.',
      system='Каждый формат — это квадрат знака: солнце в правом верхнем углу, текст идёт от левого нижнего. У программ свой цвет солнца.',
      slogan='Здесь начинается день', risk='Простая геометрия: нужна проверка на сходство с чужими знаками.',
      c=dict(a='#0B1E4A', b='#E3262B', bg='#EEF1F6', ink='#0B1E4A')),
 dict(n=2, key='base', name='Основание', meta='Опора для проекта',
      text='Знака-картинки нет: логотип — само название. Все буквы стоят на общей плите, и только «Д» опирается на неё ногами. Корпорация — основание, на котором бизнес строит проект.',
      system='Плита — единственный графический элемент. На любом носителе заголовок стоит на плите, условия и цифры — под ней. ЕТОР стоит на той же плите.',
      slogan='Основа для вашего проекта', risk='Без цвета и символа бренд холоднее; буквы нужно рисовать заново.',
      c=dict(a='#121417', b='#121417', bg='#E4EAEE', ink='#121417')),
 dict(n=3, key='gate', name='Ворота', meta='Вход на Восток и одно окно для бизнеса',
      text='Дальний Восток — ворота России в Азию. КРДВ — одна дверь, через которую инвестор получает землю, льготы и сопровождение. Знак: арка, в проёме встаёт солнце.',
      system='Проём — окно для главного: в нём фото площадки, ключевая цифра или условие. Остальное поле спокойное.',
      slogan='Одна дверь для вашего проекта', risk='Арки и двери часто встречаются у банков и девелоперов.',
      c=dict(a='#1C3FAA', b='#F0442E', bg='#ECEFF8', ink='#13235A')),
 dict(n=4, key='coord', name='Координата', meta='Точная точка на большой карте',
      text='Территория огромная, а проекту нужно конкретное место. КРДВ находит его: параллели широты и красная точка площадки. Знак говорит о точности и о знании территории.',
      system='Параллели — сетка для данных, карт и таблиц. Точка всегда означает проект или площадку, больше нигде не появляется.',
      slogan='Найдём место для проекта', risk='Может выглядеть холодно и по-инженерному.',
      c=dict(a='#0A2540', b='#E3262B', bg='#E8F1F7', ink='#0A2540')),
 dict(n=5, key='ice', name='Ледокол', meta='Прокладываем путь, за нами идут другие',
      text='Как ледокол в Арктике, КРДВ первой проходит сложный путь — земля, разрешения, инфраструктура, — а за ней идут проекты. Знак: ледяное поле, канал и нос ледокола, который читается как стрелка вверх.',
      system='Полосы-льдины и канал задают направление в макетах: текст и фото «идут» по каналу снизу вверх.',
      slogan='Проложим путь для вашего бизнеса', risk='Образ тяжёлый и сильнее про Арктику, чем про Дальний Восток.',
      c=dict(a='#0E3A52', b='#E3262B', bg='#E6F0F3', ink='#0E3A52')),
]

def mark_svg(i, c, size=None, override=None):
    cc = dict(c); 
    if override: cc.update(override)
    s = f' width="{size}" height="{size}"' if size else ''
    return f'<svg viewBox="0 0 240 240"{s} aria-hidden="true">{mark(i, cc)}</svg>'

def lockup(idea, onfield=False):
    c = idea['c']; i = idea['n']
    ink = '#fff' if onfield else c['ink']
    if i == 2:
        body, wd, hgt = word(ink, 100, plinth=True)
        return f'<svg class="wm" viewBox="-2 -2 {f(wd+4)} {f(hgt+4)}" aria-label="КРДВ">{body}</svg>'
    body, wd, hgt = word(ink, 100)
    ov = dict(a='#fff') if onfield else None
    m = mark(i, dict(c, **(ov or {})))
    # mark scaled to cap height * 1.5
    ms = hgt * 1.55 / 240
    return (f'<svg class="wm" viewBox="-2 {f(-hgt*.275-2)} {f(240*ms + 28 + wd + 4)} {f(hgt*1.55+4)}" aria-label="КРДВ">'
            f'<g transform="translate(0 {f(-hgt*.275)}) scale({f(ms)})">{m}</g>'
            f'<g transform="translate({f(240*ms+28)} 0)">{body}</g></svg>')

def avatar(idea):
    c = idea['c']; i = idea['n']
    if i == 2:
        body, wd, hgt = word('#fff', 100, plinth=True)
        return f'<div class="ava" style="background:{c["a"]}"><svg viewBox="{f(-wd*.32)} {f(-wd*.5+hgt/2)} {f(wd*1.64)} {f(wd*1.0)}">{body}</svg></div>'
    ov = dict(a='#fff')
    return f'<div class="ava" style="background:{c["a"]}"><svg viewBox="-60 -60 360 360">{mark(i, dict(c, **ov))}</svg></div>'

cards = ''
for d in IDEAS:
    c = d['c']
    hero = lockup(d) if d['n'] == 2 else mark_svg(d['n'], c)
    cards += f'''
<article class="idea" id="idea-{d['n']}">
  <div class="stage" style="--bg:{c['bg']}">
    <div class="hero {'is-word' if d['n']==2 else ''}">{hero}</div>
  </div>
  <div class="copy">
    <p class="num">Идея {d['n']}</p>
    <h2>{d['name']}</h2>
    <p class="meta">{d['meta']}</p>
    <p>{d['text']}</p>
    <p class="sys"><b>Как растёт в систему.</b> {d['system']}</p>
    <p class="risk"><b>Риск.</b> {d['risk']}</p>
  </div>
  <div class="apps">
    <div class="lock">{lockup(d)}<span class="full" style="color:{c['ink']}">Корпорация развития<br>Дальнего Востока и Арктики</span></div>
    <div class="row">
      {avatar(d)}
      <div class="poster" style="background:{c['a']}">
        <div class="pl">{lockup(d, onfield=True)}</div>
        <p class="ps">{d['slogan']}</p>
      </div>
    </div>
  </div>
</article>'''

html = open('mvp_template.html').read().replace('{{CARDS}}', cards)
open('../krdv-rebrand-ideas.html', 'w').write(html)
print('ok', len(html))
