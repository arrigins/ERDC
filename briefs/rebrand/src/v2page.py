import math
from v2marks import *
from marks import f

def svg(body, vb='0 0 240 240', cls='', label=''):
    al = f' role="img" aria-label="{label}"' if label else ' aria-hidden="true"'
    return f'<svg viewBox="{vb}" class="{cls}"{al}>{body}</svg>'

def word_path(fill, size=100, txt='КРДВ', tr=-10, x=0, y=None, weight=W):
    ch = cap_height(FAM, weight, size)
    d, wd = text_path(txt, FAM, weight, size, x, ch if y is None else y, tracking=tr)
    return f'<path d="{d}" fill="{fill}"/>', wd, ch

def lockup(markbody, ink, sub=True, gap=26):
    """mark (240 box) + КРДВ; returns svg"""
    wb, wd, ch = word_path(ink)
    ms = ch*1.6/200   # mark visual square 200 -> 1.6 cap
    mx = -20*ms; my = -20*ms - ch*.3
    w = 200*ms + gap + wd
    return svg(f'<g transform="translate({f(mx)} {f(my)}) scale({f(ms)})">{markbody}</g>'
               f'<g transform="translate({f(200*ms+gap)} 0)">{wb}</g>',
               vb=f'0 {f(-ch*.3)} {f(w)} {f(ch*1.6)}', cls='wm', label='КРДВ')

# ---------- palettes ----------
NE = dict(a='#0B1E4A', b='#E3262B', ice='#E8EDF5', mid='#3E5A9A')
IC = dict(a='#0C2B3E', b='#E3262B', ice='#DCEBF1', mid='#5E8597')
ST = dict(a='#1B1E23', b='#243D8D', ice='#DFE1E3', mid='#8A9097')

# ---------- applications ----------
def T(x, y, s, txt, fill, w=700, anchor='start', ls=None, op=1):
    lines = txt.split('|'); out = ''
    lh = ls or s*1.08
    for i, ln in enumerate(lines):
        out += f'<text x="{x}" y="{f(y + i*lh)}" font-size="{s}" font-weight="{w}" fill="{fill}" fill-opacity="{op}" text-anchor="{anchor}" letter-spacing="-0.01em">{ln}</text>'
    return out

def logo_inline(markfn, c, x, y, h, ink, markc=None):
    wb, wd, ch = word_path(ink)
    s = h/ch; ms = ch*1.6/200
    mc = markc or c
    return (f'<g transform="translate({x} {y}) scale({f(s)})">'
            f'<g transform="translate({f(-20*ms)} {f(-20*ms-ch*.3)}) scale({f(ms)})">{markfn(mc)}</g>'
            f'<g transform="translate({f(200*ms+26)} 0)">{wb}</g></g>')

def bb_ne():
    c = NE; W_, H_ = 1200, 600
    b = f'<rect width="{W_}" height="{H_}" fill="{c["a"]}"/>'
    b += f'<path d="M{W_} 0V300A300 300 0 0 1 {W_-300} 0Z" fill="{c["b"]}"/>'
    b += logo_inline(lambda cc: ne('A', cc), c, 64, 64, 34, '#fff', dict(a='#fff', b=c['b']))
    b += T(64, 400, 82, 'Здесь начинается|день', '#fff')
    b += T(66, 548, 26, 'Начните проект на Дальнем Востоке и в Арктике', '#fff', 400, op=.78)
    return svg(b, f'0 0 {W_} {H_}', 'app', 'Щит 6 × 3 м')

def sl_ne():
    c = NE; W_, H_ = 1280, 720
    b = f'<rect width="{W_}" height="{H_}" fill="#fff"/>'
    b += f'<path d="M{W_} 0V180A180 180 0 0 1 {W_-180} 0Z" fill="{c["b"]}"/>'
    b += etor_ne_body(72, 72, 30)
    b += T(72, 520, 70, 'Единый режим|поддержки', c['a'])
    b += T(74, 660, 24, 'Условия для инвесторов · 2027', c['a'], 400, op=.6)
    return svg(b, f'0 0 {W_} {H_}', 'app', 'Обложка презентации')

def etor_ne_body(x, y, h, sun=None, label='ЕТОР', ink=None):
    c = NE; ink = ink or c['a']
    wb, wd, ch = word_path(ink, txt=label)
    s = h/ch; ms = ch*1.6/200
    mk = ne('A', dict(a=c['a'], b=sun or c['b']))
    return (f'<g transform="translate({x} {y}) scale({f(s)})">'
            f'<g transform="translate({f(-20*ms)} {f(-20*ms-ch*.3)}) scale({f(ms)})">{mk}</g>'
            f'<g transform="translate({f(200*ms+26)} 0)">{wb}</g></g>')

def etor_ne():
    rows = [('ЕТОР', NE['b'], 'Единый режим поддержки'), ('Гектар', '#21AD49', 'Дальневосточный и арктический гектар'), ('Ипотека', '#5B8FE0', 'Дальневосточная ипотека')]
    b = ''
    for i, (lab, col, sub) in enumerate(rows):
        y = 40 + i*110
        b += etor_ne_body(20, y, 40, col, lab)
        b += T(20, y+76, 17, sub, NE['a'], 500, op=.6)
    return svg(b, '0 0 560 360', 'arch', 'ЕТОР и программы')

def bb_ice():
    c = IC; W_, H_ = 1200, 600
    cy = 330; tip = 600; ship_len = 150; sw = 34; gap = 16; stern = tip-ship_len; hw0 = sw+gap
    hwl = hw0 + stern*K
    b = f'<rect width="{W_}" height="{H_}" fill="{c["a"]}"/>'
    b += (f'<path fill="{c["ice"]}" d="M0 0H{W_}V{H_}H0V{f(cy+hwl)}L{stern} {cy+hw0}H{tip-50}'
          f'Q{tip+gap*1.4} {f(cy+hw0*.6)} {tip+gap*2} {cy}Q{tip+gap*1.4} {f(cy-hw0*.6)} {tip-50} {cy-hw0}H{stern}L0 {f(cy-hwl)}Z"/>')
    b += (f'<path fill="{c["b"]}" d="M{stern} {cy-sw}H{tip-56}Q{tip-12} {f(cy-sw*.7)} {tip} {cy}Q{tip-12} {f(cy+sw*.7)} {tip-56} {cy+sw}H{stern}Z"/>')
    b += T(670, 270, 46, 'Проложим путь|для вашего проекта', c['a'])
    b += T(672, 390, 22, 'Земля, льготы и инфраструктура|на Дальнем Востоке и в Арктике', c['a'], 400, ls=30, op=.75)
    b += logo_inline(lambda cc: ice_east(cc), c, 672, 64, 30, c['a'])
    return svg(b, f'0 0 {W_} {H_}', 'app', 'Щит 6 × 3 м')

def sl_ice():
    c = IC; W_, H_ = 1280, 720
    b = f'<rect width="{W_}" height="{H_}" fill="{c["a"]}"/>'
    # thin wake lines from a red ship at right
    sx, sy = 1060, 250
    for k in range(5):
        d = 70 + k*90
        b += f'<path d="M{sx-d} {f(sy-d*K)}L{sx} {sy}L{sx-d} {f(sy+d*K)}" fill="none" stroke="#fff" stroke-opacity="{.5-.08*k}" stroke-width="2"/>'
    b += f'<path fill="{c["b"]}" d="M{sx-70} {sy-12}H{sx-18}Q{sx-4} {sy-8} {sx+6} {sy}Q{sx-4} {sy+8} {sx-18} {sy+12}H{sx-70}Z"/>'
    b += logo_inline(lambda cc: ice_east(cc), dict(a='#fff', b=c['b']), 72, 72, 30, '#fff')
    b += T(72, 520, 70, 'Единый режим|поддержки', '#fff')
    b += T(74, 660, 24, 'Условия для инвесторов · 2027', '#fff', 400, op=.6)
    return svg(b, f'0 0 {W_} {H_}', 'app', 'Обложка презентации')

def etor_ice():
    c = IC
    b = logo_inline(lambda cc: ice_east(cc), c, 20, 60, 40, c['a'])
    wb, wd, ch = word_path(c['a'], txt='ЕТОР')
    s = 40/ch
    b += f'<g transform="translate(20 210) scale({f(s)})">{wb}</g>'
    b += f'<rect x="{f(20 + wd*s + 22)}" y="170" width="3" height="80" fill="{c["b"]}"/>'
    b += T(f(20 + wd*s + 44), 200, 18, 'Единый режим поддержки|Оператор — КРДВ', c['a'], 500, ls=26, op=.75)
    return svg(b, '0 0 560 300', 'arch', 'ЕТОР')

def bb_stone():
    c = ST; W_, H_ = 1200, 600
    b = f'<rect width="{W_}" height="{H_}" fill="{c["ice"]}"/>'
    b += T(64, 120, 84, 'Первый камень|вашего проекта', c['a'])
    b += f'<g transform="translate(-23.4 342.6) scale(1.17)">{stone(c)}</g>'
    b += T(300, 520, 26, 'Земля, льготы и инфраструктура|на Дальнем Востоке и в Арктике', c['a'], 400, ls=34, op=.75)
    return svg(b, f'0 0 {W_} {H_}', 'app', 'Щит 6 × 3 м')

def sl_stone():
    c = ST; W_, H_ = 1280, 720
    b = f'<rect width="{W_}" height="{H_}" fill="#fff"/>'
    b += f'<g transform="translate(144 566) scale(.7)">{stone(dict(a=c["b"]), "ЕТОР")}</g>'
    b += f'<g transform="translate(-14 566) scale(.7)">{stone(c)}</g>'
    b += T(72, 150, 70, 'Единый режим|поддержки', c['a'])
    b += T(74, 290, 24, 'Условия для инвесторов · 2027', c['a'], 400, op=.6)
    return svg(b, f'0 0 {W_} {H_}', 'app', 'Обложка презентации')

def etor_stone():
    b = f'<g transform="translate(0 20)">{stone(ST)}</g><g transform="translate(220 20)">{stone(dict(a=ST["b"]), "ЕТОР")}</g>'
    b += T(470, 92, 22, 'Камень КРДВ|и камень ЕТОР:|одна кладка', ST['a'], 500, ls=30, op=.7)
    return svg(b, '20 40 680 200', 'arch', 'КРДВ и ЕТОР')

def avatar(body, bg):
    return f'<div class="ava" style="background:{bg}">{svg(body, "-50 -50 340 340")}</div>'

DIRS = [
 dict(id='ne', n=1, name='Северо-восток', thesis='Здесь начинается день. И рост.',
  insight='Дальний Восток и Арктика — северо-восток страны. День в России начинается на Чукотке: когда в Анадыре 9 утра, в Москве ещё полночь. А на любом графике северо-восток — это рост: вправо и вверх. Две правды сходятся в одном жесте.',
  legend='Синий квадрат — территория и надёжность. Красная четверть — солнце, которое встаёт в её правом верхнем углу. Это первое солнце страны и стрелка роста одновременно. Красный остаётся от старого лотоса: цвет восходящего солнца.',
  system=['Каждый формат — квадрат знака: солнце всегда в правом верхнем углу, текст начинается слева снизу.', 'Солнце растёт вместе с важностью: маленькое на бланке, огромное на щите.', 'Программы и ЕТОР — тот же квадрат, меняется цвет солнца.', 'Моушн: солнце поднимается из угла, затем появляется текст.'],
  slogans=['Здесь начинается день', 'Ближе к солнцу, ближе к росту', 'Ваш проект — в первом часовом поясе страны'],
  risks='Простая геометрия: обязательна проверка на сходство с зарегистрированными знаками. «Солнце» легко сделать банальным, поэтому никогда не рисуем лучи и горизонт.',
  marks=[('A', 'Основной. Солнце отделено просветом.'), ('B', 'Без просвета, солнце крупнее. Плотнее и проще в вышивке.'), ('C', 'Угол и солнце. Подходит как рамка для носителей.')],
  mk=lambda v, c=NE: ne(v, c), pal=[('Северная ночь', NE['a']), ('Первое солнце', NE['b']), ('Утренний лёд', NE['ice']), ('Белый', '#FFFFFF')],
  bb=bb_ne, sl=sl_ne, et=etor_ne, ava=lambda: avatar(ne('A', dict(a='#fff', b=NE['b'])), NE['a']),
  etnote='ЕТОР и программы получают тот же квадрат, меняется только цвет солнца. Сразу видно, что всё это — КРДВ.'),
 dict(id='stone', n=2, name='Первый камень', thesis='Мы в основании каждого проекта.',
  insight='У каждой стройки есть ритуал: закладка первого камня. С него начинается завод, порт, школа. КРДВ и есть этот первый камень: даёт землю, льготы, инфраструктуру, а дальше проект растёт сам. Идея «Основания» без подчёркиваний: опора становится предметом.',
  legend='Знак — квадратный камень с вырезанными буквами КР / ДВ, как надпись на закладном камне. Краеугольный камень кладут в угол основания здания, поэтому знак всегда стоит в левом нижнем углу носителя, вплотную к краю.',
  system=['Знак — всегда в левом нижнем углу, вплотную к краям формата: «камень в основании».', 'Любые четыре буквы становятся камнем той же кладки: ЕТОР, программы, проекты.', 'Камни складываются в стену: несколько программ на одном слайде — ряд камней.', 'Палитра — камень и бетон, без цветных пятен. Цвет даёт фото.'],
  slogans=['Первый камень вашего проекта', 'Основа для бизнеса на Дальнем Востоке', 'Строим вместе с вами'],
  risks='Монограмма из букв ближе к «ведомственному» стилю, если её не нарисовать идеально: нужна своя отрисовка букв под квадрат. Без цвета бренд строже и холоднее.',
  marks=[('S1', 'Основной. Тёмный камень, буквы вырезаны.'), ('S2', 'Камень ЕТОР в синем: та же кладка.'), ('S3', 'Крупнее буквы, плотнее кладка.')],
  mk=None, pal=[('Гранит', ST['a']), ('Бетон', ST['ice']), ('Синий ЕТОР', ST['b']), ('Белый', '#FFFFFF')],
  bb=bb_stone, sl=sl_stone, et=etor_stone, ava=lambda: avatar(stone(ST), ST['ice']),
  etnote='ЕТОР — второй камень той же кладки, синего цвета. Программы с длинными названиями — подписью рядом с камнем КРДВ.'),
 dict(id='ice', n=3, name='Ледокол', thesis='Прокладываем путь. За нами идут проекты.',
  insight='В Арктике первым идёт ледокол, за ним — караван. КРДВ делает то же для бизнеса: первой проходит сложную часть пути (земля, разрешения, сети, льготы), а проект идёт по готовому каналу. Корпуса российских ледоколов красные: это наш красный.',
  legend='Квадрат — ледяное поле. Красный ледокол идёт на восток, за ним остаётся расчищенный канал. Канал расходится под углом 19°28′: так расходится след за любым судном, при любой скорости (угол Кельвина). Это настоящая физика, а не украшение.',
  system=['Канал — главный приём: в макете он ведёт взгляд от текста к цели.', 'Лёд — светлый, вода — тёмная. Текст стоит на льду, цифры — в канале.', 'Тонкие линии следа под углом 19°28′ — графика для слайдов и данных.', 'Моушн: ледокол проходит кадр, лёд расходится, появляется сообщение.'],
  slogans=['Проложим путь для вашего проекта', 'Первыми проходим сложную часть пути', 'Идите по чистой воде'],
  risks='Визуально пока самая сырая идея: силуэт может читаться как стрелка или пуля. Образ сильнее про Арктику, чем про Дальний Восток. Нужны референсы и ещё один круг формы.',
  marks=[('E1', 'Основной. Ледокол идёт на восток, канал по углу Кельвина.'), ('E2', 'Короче корпус, шире канал.'), ('E3', 'Светлый лёд на тёмном поле.')],
  mk=None, pal=[('Полярная вода', IC['a']), ('Ледокол', IC['b']), ('Лёд', IC['ice']), ('Белый', '#FFFFFF')],
  bb=bb_ice, sl=sl_ice, et=etor_ice, ava=lambda: avatar(ice_east(dict(a='#fff', b=IC['b'])), IC['a']),
  etnote='ЕТОР — продукт, КРДВ — оператор. Шрифтовой логотип ЕТОР рядом со знаком КРДВ и красной чертой.'),
]

def mark_variants(d):
    out = ''
    for key, cap in d['marks']:
        if d['id'] == 'ne': body = ne(key, NE); bg = '#fff'
        elif d['id'] == 'stone':
            body = {'S1': stone(ST), 'S2': stone(dict(a=ST['b']), 'ЕТОР'), 'S3': stone(ST, cap=.64)}[key]; bg = '#fff'
        else:
            body = {'E1': ice_east(IC), 'E2': ice_east(IC, tip=150, ship_len=40, ship_w=30), 'E3': ice_east(dict(a=IC['ice'], b=IC['b']))}[key]
            bg = IC['a'] if key == 'E3' else '#fff'
        out += f'<figure class="mv"><div class="mvb" style="background:{bg}">{svg(body)}</div><figcaption>{cap}</figcaption></figure>'
    return out

def main_lockup(d):
    if d['id'] == 'ne': return lockup(ne('A', NE), NE['a'])
    if d['id'] == 'ice': return lockup(ice_east(IC), IC['a'])
    return lockup(stone(ST), ST['a'])

def hero(d):
    if d['id'] == 'ne': return svg(ne('A', NE), cls='heromk')
    if d['id'] == 'ice': return svg(ice_east(IC), cls='heromk')
    return svg(stone(ST), cls='heromk')

secs = ''
for d in DIRS:
    pal = ''.join(f'<li><span style="background:{h}"></span><b>{n}</b><code>{h.upper()}</code></li>' for n, h in d['pal'])
    sysl = ''.join(f'<li>{s}</li>' for s in d['system'])
    slg = ''.join(f'<li>{s}</li>' for s in d['slogans'])
    secs += f'''
<section class="dir" id="{d['id']}">
  <div class="dirhead">
    <div class="dh-mark">{hero(d)}</div>
    <div class="dh-text">
      <p class="eyebrow">Направление {d['n']}</p>
      <h2>{d['name']}</h2>
      <p class="thesis">{d['thesis']}</p>
      <div class="lock">{main_lockup(d)}</div>
    </div>
  </div>
  <div class="grid2">
    <div><h3>Инсайт</h3><p>{d['insight']}</p></div>
    <div><h3>Легенда знака</h3><p>{d['legend']}</p></div>
  </div>
  <h3>Знак: варианты</h3>
  <div class="mvs">{mark_variants(d)}</div>
  <div class="grid2">
    <div><h3>Как растёт в систему</h3><ul class="bl">{sysl}</ul></div>
    <div><h3>Как говорит</h3><ul class="slg">{slg}</ul><h3>Цвет</h3><ul class="pal">{pal}</ul></div>
  </div>
  <h3>Носители</h3>
  <div class="apps">
    <figure class="wide">{d['bb']()}<figcaption>Щит 6 × 3 м</figcaption></figure>
    <figure>{d['sl']()}<figcaption>Обложка презентации</figcaption></figure>
    <figure class="et"><div class="etbox">{d['et']()}</div><figcaption>{d['etnote']}</figcaption></figure>
    <figure class="avf">{d['ava']()}<figcaption>Аватар в соцсетях</figcaption></figure>
  </div>
  <p class="risk"><b>Риски.</b> {d['risks']}</p>
</section>'''

html = open('v2_template.html').read().replace('{{SECTIONS}}', secs)
open('../krdv-rebrand-round2.html', 'w').write(html)

# flat layouts for Codex
import os
os.makedirs('../layouts', exist_ok=True)
for d in DIRS:
    for k, fn in (('billboard', d['bb']), ('slide', d['sl'])):
        s = fn()
        open(f"../layouts/{d['id']}-{k}.html", 'w').write('<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;700&display=swap"><style>body{margin:0}svg{display:block;width:100%;height:auto;font-family:Onest,sans-serif}</style></head><body>' + s + '</body></html>')
print('ok')
