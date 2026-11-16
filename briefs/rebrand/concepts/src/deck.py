"""Сборка HTML: три концепции ребрендинга КРДВ в формате презентации."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import to_path, f
import c1, c23
from signs import s1, s2, s3, bare
import lockups as L

INK = '#0B1324'

# ---------------- палитры ----------------
P1 = dict(night='#071A44', main='#245BED', sky='#ACC9FF', ice='#F2F6FD', acc='#E3262B')
P2 = dict(night='#0B1E4A', main='#1F3FA0', sun='#E8402A', dawn='#F4C3B2', ice='#EEF2F8')
P3 = dict(night='#0E2F44', ice='#DCEBF1', red='#E3262B', steel='#5E8597', white='#F7FAFB')


def svg_wrap(inner, vb, cls='', style='', par='xMidYMid slice'):
    return f'<svg viewBox="{vb}" preserveAspectRatio="{par}" class="{cls}" style="{style}" aria-hidden="true">{inner}</svg>'


# ---------------- паттерны ----------------
def pat1(dark=True, w=700, h=750, seed=2):
    parts = dict((r, g) for g, r in c1.VARIANTS[1]['fn']())
    cup, pet = to_path(parts['cup']), to_path(parts['petal'])
    bg = P1['night'] if dark else P1['ice']
    cupc = P1['main'] if dark else '#D9E4FB'
    petc = P1['sky'] if dark else P1['main']
    m, dy = 92, 60
    out = f'<rect width="{w}" height="{h}" fill="{bg}"/>'
    defs = f'<defs><symbol id="c1c{int(dark)}" viewBox="0 0 240 240"><path d="{cup}" fill="{cupc}"/></symbol>' \
           f'<symbol id="c1p{int(dark)}" viewBox="0 0 240 240"><path d="{pet}" fill="{petc}"/></symbol>' \
           f'<symbol id="c1r{int(dark)}" viewBox="0 0 240 240"><path d="{pet}" fill="{P1["acc"]}"/></symbol></defs>'
    j = 0
    y = -m * 0.6
    import random
    rnd = random.Random(seed)
    while y < h + m:
        x = -m / 2 if j % 2 else -m
        i = 0
        while x < w + m:
            out += f'<use href="#c1c{int(dark)}" x="{f(x)}" y="{f(y)}" width="{m}" height="{m}"/>'
            if (i + j) % 2 == 0:
                k = m * 0.34
                sym = 'c1r' if rnd.random() < 0.05 else 'c1p'
                out += f'<use href="#{sym}{int(dark)}" x="{f(x + (m - k) / 2)}" y="{f(y + m * 0.17)}" width="{f(k)}" height="{f(k)}"/>'
            x += m
            i += 1
        y += dy
        j += 1
    return defs + out


def pat2(dark=True, w=700, h=750, s=84):
    bands, suns = c23.ne_truchet(w, h, s)
    bg = P2['night'] if dark else P2['ice']
    bc = P2['main'] if dark else '#D5DEEE'
    out = f'<rect width="{w}" height="{h}" fill="{bg}"/><path d="{to_path(bands)}" fill="{bc}" fill-rule="evenodd"/>'
    out += ''.join(f'<path d="{to_path(q)}" fill="{P2["sun"]}"/>' for q in suns)
    return out


def pat3(dark=True, w=700, h=750, seed=5):
    groups, reds = c23.ice_field(w, h, seed=seed)
    bg = P3['night'] if dark else P3['white']
    tones = ['#24506A', '#1C455D', '#2E5D78'] if dark else ['#DCEBF1', '#E7F1F5', '#CFE2EA']
    out = f'<rect width="{w}" height="{h}" fill="{bg}"/>'
    out += ''.join(f'<path d="{to_path(g)}" fill="{tones[i]}" fill-rule="evenodd"/>' for i, g in enumerate(groups))
    out += ''.join(f'<path d="{to_path(r)}" fill="{P3["red"]}"/>' for r in reds)
    return out


# ---------------- слайды ----------------
def slide(body, cls='', bg=None):
    st = f' style="background:{bg}"' if bg else ''
    return f'<section class="slide {cls}"{st}>{body}</section>'


def title(t, sub=None, light=False):
    c = ' light' if light else ''
    s = f'<p class="sub{c}">{sub}</p>' if sub else ''
    return f'<div class="head"><h3 class="ttl{c}">{t}</h3>{s}</div>'


def palette(cols):
    cells = ''.join(f'<div class="sw"><span style="background:{h}"></span><b>{n}</b><code>{h}</code><em>{r}</em></div>' for n, h, r in cols)
    return f'<div class="pal">{cells}</div>'


def lock(svg, h='9cqw'):
    return svg.replace('<svg ', f'<svg style="height:{h};width:auto;max-width:100%" ', 1)


def concept(n, name, tagline, sign, sign_white, sign_on, P, pat, idea, geo_slide, variants_slide, palette_rows, mood, extra_lead, type_col=None):
    """sign — основной (svg,bbox); sign_white — белый для тёмных фонов; sign_on — (svg,bbox) с цветом для тёмного"""
    night = list(P.values())[0]
    out = []
    # 1 обложка
    out.append(slide(f'''<div class="cover-txt"><p class="kicker light">Концепция {n}</p><h2 class="cover-h">{name}</h2>
      <div class="rule"></div><p class="cover-sub">{tagline}</p></div>
      <div class="cover-mark">{bare(sign_on)}</div>''', 'cover', night))
    # 2 идея
    out.append(slide(title('Идея знака') + f'''<div class="idea-mark">{bare(sign)}</div><div class="idea-txt">{idea}</div>'''))
    # 3 геометрия / варианты
    out.append(geo_slide)
    if variants_slide:
        out.append(variants_slide)
    # 4 версии логотипа
    out.append(slide(title('Версии логотипа', 'Знак с аббревиатурой — основная версия. Полное наименование — для первого знакомства и документов.') + f'''
      <div class="vers">
        <div class="v-main">{lock(L.main(sign, INK), '8.4cqw')}<span class="v-cap">Основная: знак + КРДВ</span></div>
        <div class="v-desc">{lock(L.with_desc(sign, INK), '6.2cqw')}<span class="v-cap">С дескриптором</span></div>
        <div class="v-sign">{bare(sign)}<span class="v-cap">Знак</span></div>
      </div>
      <div class="v-dark" style="background:{night}">{lock(L.main(sign_white, '#fff'), '7.4cqw')}</div>''', 'vers-slide'))
    # 5 полное наименование
    out.append(slide(title('Полное наименование', extra_lead) + f'''
      <div class="full">
        <div class="full-h">{lock(L.full_h(sign, INK, lines=L.NAME2), '7.2cqw')}<span class="v-cap">Горизонтальная, две строки</span></div>
        <div class="full-h3">{lock(L.full_h(sign, INK), '7.2cqw')}<span class="v-cap">Компактная, три строки</span></div>
        <div class="full-v">{lock(L.full_v(sign, INK), '20cqw')}<span class="v-cap">Вертикальная</span></div>
      </div>'''))
    # 6 палитра
    out.append(slide(title('Фирменная палитра', mood) + palette(palette_rows)))
    # 7 типографика
    out.append(slide(title('Типографика') + f'''<p class="type-big" style="color:{type_col or list(P.values())[1]}">TT Norms Pro</p>
      <div class="type-row"><div><p class="type-k">КРДВ</p><p class="type-n"><b>ExtraBold</b> / короткие заголовки</p></div>
      <div><p class="type-r">Корпорация развития<br>Дальнего Востока и Арктики</p><p class="type-n">Medium / подписи и основной текст</p></div></div>
      <p class="type-note">Шрифт уже есть у КРДВ по лицензии. В этой презентации он временно заменён на свободный Onest.</p>'''))
    # 8-9 паттерн
    for dark in (True, False):
        bg = night if dark else '#FFFFFF'
        out.append(slide(f'''<div class="pat-txt">{title('Паттерн', pat['text'], light=dark)}</div>
          <div class="pat-art">{svg_wrap(pat['fn'](dark), '0 0 700 750')}</div>''', 'pat', bg))
    # 10 материалы
    out.append(slide(title('Пример оформления материалов') + f'''
      <div class="mat">
        <div class="mat-a" style="background:{pat['light_bg']}">
          <div class="mat-a-txt"><div class="mat-logo">{lock(L.main(sign, INK), '3.4cqw')}</div>
          <p class="mat-h">Поддержка инвесторов</p><p class="mat-s">Дальний Восток и Арктика</p></div>
          <div class="mat-a-art">{svg_wrap(pat['fn'](False), '0 0 700 750')}</div>
        </div>
        <div class="mat-b" style="background:{night}">
          <div class="mat-logo">{lock(L.main(sign_white, '#fff'), '2.6cqw')}</div>
          <p class="mat-h2">Помогаем вашему бизнесу</p>
          <div class="mat-b-art">{svg_wrap(pat['fn'](True), '0 0 700 750')}</div>
        </div>
      </div>'''))
    return f'<div class="deck" id="c{n}">' + ''.join(out) + '</div>'


# ---------------- концепция 1 ----------------
def build_c1():
    S = s1('v2')
    SW = s1('v2', '#fff', '#fff')
    old = '<img src="old-logo.svg" alt="Текущий логотип КРДВ" class="old-logo">'
    pres = slide(title('Преемственность') + f'''
      <div class="two"><div><p class="col-h">Текущий логотип</p><div class="col-art">{old}</div><div class="hr"></div>
      <p class="col-t">Раскрытый цветок узнаётся по красным лепесткам.</p></div>
      <div><p class="col-h">Точка опоры</p><div class="col-art">{lock(L.main(S, INK), '7cqw')}</div><div class="hr"></div>
      <p class="col-t">Тот же силуэт из двух форм: центральный лепесток и чаша, которая его держит.</p></div></div>''')
    # варианты
    cells = ''
    for v in c1.VARIANTS:
        svg, _ = c1.sign_svg(v['key'])
        mark = ' is-pick' if v['key'] in ('v2',) else (' is-alt' if v['key'] == 'v7' else '')
        tag = '<i>Основной</i>' if v['key'] == 'v2' else ('<i class="alt">Вариант</i>' if v['key'] == 'v7' else '')
        cells += f'<div class="var{mark}">{svg}<p><b>{v["name"]}</b>{tag}</p><span>{v["note"]}</span></div>'
    variants = slide(title('Поиск формы', 'Десять вариантов знака. В основу взят «Собранный»: он ближе всего к драфту и лучше всего держится на малых размерах.') + f'<div class="vars">{cells}</div>', 'vars-slide')
    # геометрия
    parts = dict((r, g) for g, r in c1.VARIANTS[1]['fn']())
    pet, cup = to_path(parts['petal']), to_path(parts['cup'])
    guides = ('<circle cx="120" cy="126" r="100" fill="none" stroke="#9AA8C7" stroke-width=".8" stroke-dasharray="3 3"/>'
              '<path d="M20 80H220M120 10V230M60 20L160 120M180 20L80 120" stroke="#9AA8C7" stroke-width=".8" stroke-dasharray="3 3" fill="none"/>')
    def g3(inner, cap_):
        return f'<div class="geo-c"><svg viewBox="0 0 240 240" aria-hidden="true">{inner}</svg><p>{cap_}</p></div>'
    geo = slide(title('Геометрия', 'Лепесток стоит на оси чаши. Стороны лепестка и края чаши идут под 45°, просвет между ними одинаковый.') +
                '<div class="geo">' + g3(f'<path d="{pet}" fill="{P1["main"]}"/>', 'Лепесток') +
                g3(f'<path d="{cup}" fill="{P1["main"]}"/>', 'Чаша') +
                g3(guides + f'<path d="{pet}" fill="{P1["main"]}"/><path d="{cup}" fill="{P1["main"]}"/>', 'Знак') + '</div>')
    deck = concept(1, 'Точка опоры', 'Доработка драфта команды: знак, версии логотипа и полное наименование',
                   S, SW, s1('v2', '#fff', P1['main']), P1,
                   dict(fn=pat1, text='Чаши складываются в волны. Каждый второй модуль дополнен маленьким лепестком, красный — редкий акцент.', light_bg=P1['ice']),
                   '<div class="blk"><p class="blk-h">Инициатива</p><p>Центральный лепесток — проект, с которым приходит предприниматель.</p></div>'
                   '<div class="blk"><p class="blk-h">Опора</p><p>Раскрытая чаша — роль КРДВ: корпорация помогает проекту вырасти на Дальнем Востоке и в Арктике.</p></div>',
                   geo, variants,
                   [('Ночной синий', P1['night'], 'Текст и тёмный фон'), ('Кобальт', P1['main'], 'Знак и крупная графика'),
                    ('Голубой', P1['sky'], 'Светлая графика'), ('Ледяной белый', P1['ice'], 'Фон материалов'),
                    ('Красный', P1['acc'], 'Точечный акцент')],
                   'Кобальт выделяет знак. Ночной синий и ледяной белый — два основных фона. Красный вместо мятного: точечный акцент и связь с прежним лотосом.',
                   'В драфте капс ExtraBold и мелкая строка спорили друг с другом. Здесь одно начертание и один размер: блок текста равен высоте знака.')
    # вставляем «Преемственность» вторым слайдом
    return deck.replace('<section class="slide ">', pres + '<section class="slide ">', 1)


# ---------------- концепция 2 ----------------
def build_c2():
    S = s2('B', P2['night'], P2['sun'])
    SW = s2('B', '#fff', P2['sun'])
    sq = c23.ne_sign('B')
    def g3(parts, cap_, cols):
        inner = ''.join(f'<path d="{to_path(g)}" fill="{cols.get(r, "none")}" fill-rule="evenodd"/>' for g, r in parts)
        return f'<div class="geo-c"><svg viewBox="0 0 240 240" aria-hidden="true">{inner}</svg><p>{cap_}</p></div>'
    from geo import box
    terr = [(box(20, 20, 220, 220), 'a')]
    sun = [(g, r) for g, r in sq if r == 'b']
    geo = slide(title('Геометрия', 'Квадрат — территория. В северо-восточном углу встаёт солнце, вокруг него — линия горизонта. Просветы равны.') +
                '<div class="geo">' + g3(terr, 'Территория', {'a': P2['night']}) + g3(sun, 'Солнце', {'b': P2['sun']}) +
                g3(sq, 'Знак', {'a': P2['night'], 'b': P2['sun']}) + '</div>')
    cells = ''
    for k, nm, nt in [('A', 'Солнце', 'Квадрат и четверть круга. Самый простой и узнаваемый.'),
                      ('B', 'Солнце и горизонт', 'Добавлена дуга: солнце встаёт над горизонтом. Основной.'),
                      ('C', 'Мягкий', 'Скруглённые углы, кроме северо-восточного.')]:
        cells += f'<div class="var{" is-pick" if k == "B" else ""}">{bare(s2(k, P2["night"], P2["sun"]))}<p><b>{nm}</b>{"<i>Основной</i>" if k == "B" else ""}</p><span>{nt}</span></div>'
    variants = slide(title('Варианты знака') + f'<div class="vars vars3">{cells}</div>', 'vars-slide')
    return concept(2, 'Северо-восток', 'Здесь начинается день. И рост.', S, SW, SW, P2,
                   dict(fn=pat2, text='Клетки с дугами складываются в волны, сопки и реки. Солнце появляется редко — как акцент.', light_bg=P2['ice']),
                   '<div class="blk"><p class="blk-h">Восток</p><p>Дальний Восток и Арктика — северо-восток страны. Здесь первым встаёт солнце: когда во Владивостоке 7 утра, в Москве полночь.</p></div>'
                   '<div class="blk"><p class="blk-h">Рост</p><p>На любом графике северо-восток — это рост: вправо и вверх. КРДВ помогает проектам расти.</p></div>',
                   geo, variants,
                   [('Северная ночь', P2['night'], 'Текст и тёмный фон'), ('Синий', P2['main'], 'Графика'),
                    ('Солнце', P2['sun'], 'Знак и акцент'), ('Рассвет', P2['dawn'], 'Светлый акцент'), ('Утренний лёд', P2['ice'], 'Фон материалов')],
                   'Синий — территория и надёжность, солнце — Восток и начало. Тёплый рассвет смягчает строгую пару.',
                   'Одно начертание, без капса. В вертикальной версии знак и текст центрированы.')


# ---------------- концепция 3 ----------------
def build_c3():
    S = s3('A', P3['night'], P3['red'])
    SW = s3('A', '#fff', P3['red'])
    sq = c23.ice_sign('A')
    def g3(parts, cap_, cols, extra=''):
        inner = ''.join(f'<path d="{to_path(g)}" fill="{cols.get(r, "none")}" fill-rule="evenodd"/>' for g, r in parts)
        return f'<div class="geo-c"><svg viewBox="0 0 240 240" aria-hidden="true">{inner}{extra}</svg><p>{cap_}</p></div>'
    from geo import box
    import math
    ang = ('<path d="M120 68V220" stroke="#9AA8C7" stroke-dasharray="3 3" stroke-width=".8"/>'
           '<path d="M120 112A44 44 0 0 1 134.7 109.5" fill="none" stroke="#E3262B" stroke-width="1.2"/>'
           '<text x="140" y="118" font-size="12" fill="#5A616C">19°28′</text>')
    geo = slide(title('Геометрия', 'Клин расходится под углом 19°28′ — под таким углом расходится след за любым судном, при любой скорости.') +
                '<div class="geo">' + g3([(box(20, 20, 220, 220), 'a')], 'Ледяное поле', {'a': P3['night']}) +
                g3([(g, r) for g, r in sq if r == 'b'], 'Путь', {'b': P3['red']}, ang) +
                g3(sq, 'Знак', {'a': P3['night'], 'b': P3['red']}) + '</div>')
    cells = ''
    for k, nm, nt in [('A', 'Красный клин', 'Клин раздвигает лёд. Второе прочтение — вершина вулкана. Основной.'),
                      ('B', 'Канал', 'Канал пустой, красный нос ледокола в вершине.'),
                      ('C', 'Льдина', 'Знак в круге: удобнее для аватара и значка.')]:
        cells += f'<div class="var{" is-pick" if k == "A" else ""}">{bare(s3(k, P3["night"], P3["red"]))}<p><b>{nm}</b>{"<i>Основной</i>" if k == "A" else ""}</p><span>{nt}</span></div>'
    variants = slide(title('Варианты знака') + f'<div class="vars vars3">{cells}</div>', 'vars-slide')
    return concept(3, 'Ледокол', 'Прокладываем путь. За нами идут проекты.', S, SW, SW, P3,
                   dict(fn=pat3, text='Ледовое поле: трещины и каналы под тем же углом 19°28′. Красные метки — проекты, которые идут по чистой воде.', light_bg=P3['white']),
                   '<div class="blk"><p class="blk-h">Путь</p><p>В Арктике первым идёт ледокол, за ним — караван. КРДВ первой проходит сложную часть пути: земля, разрешения, сети, льготы.</p></div>'
                   '<div class="blk"><p class="blk-h">Проект</p><p>Красный клин — проект, который идёт вперёд по расчищенному каналу. Корпуса российских ледоколов красные.</p></div>',
                   geo, variants,
                   [('Полярная вода', P3['night'], 'Текст и тёмный фон'), ('Лёд', P3['ice'], 'Светлая графика'),
                    ('Корпус ледокола', P3['red'], 'Знак и акцент'), ('Сталь', P3['steel'], 'Второстепенный'), ('Снег', P3['white'], 'Фон материалов')],
                   'Холодная пара воды и льда и один горячий красный — цвет корпуса ледокола.',
                   'Одно начертание, без капса. Блок текста равен высоте знака.', type_col=P3['night'])


# ---------------- референсы ----------------
REFS = [
    ('Сбер', 'Landor&Fitch, 2020', 'Банк стал экосистемой: короткое имя, знак-галочка, одна архитектура для десятков сервисов.'),
    ('Ørsted', 'Kontrapunkt, 2017', 'Госэнергетик сменил имя и стиль вместе со стратегией. Свой шрифт стал носителем бренда.'),
    ('Equinor', 'Superunion, 2018', 'Statoil стал Equinor: знак-звезда сохранён и повёрнут «на север», к новому курсу.'),
    ('Mastercard', 'Pentagram, 2016', 'Знак без названия: упрощение до двух кругов, версии со словом и без.'),
    ('Deutsche Bank', 'Антон Станковски, 1974', 'Косая черта в квадрате: «рост в надёжной среде». Близко к идее «Точки опоры».'),
    ('EDP', 'Pentagram, 2022', 'Энергокомпания сменила знак целиком; форма выросла из движения.'),
    ('NS', 'Studio Dumbar', 'Сильный знак сохранён, вокруг построен новый язык движения.'),
    ('MIT Media Lab', 'Pentagram, 2014', 'Одна сетка даёт общий знак и знаки подразделений — модель для КРДВ, ЕТОР и ДО.'),
]


def refs_block():
    cells = ''.join(f'<div class="ref"><b>{n}</b><span>{a}</span><p>{t}</p></div>' for n, a, t in REFS)
    return f'<section class="refs"><h2>Референсы</h2><p class="refs-lead">Ребрендинги, где короткое имя и знак работают вместе с длинным официальным названием.</p><div class="ref-grid">{cells}</div></section>'


def build():
    tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deck_template.html')).read()
    body = build_c1() + build_c2() + build_c3()
    return tpl.replace('{{DECKS}}', body).replace('{{REFS}}', refs_block())


if __name__ == '__main__':
    out = sys.argv[1]
    open(out, 'w').write(build())
    print('ok')
