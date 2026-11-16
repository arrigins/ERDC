"""Выгрузка версий логотипа трёх концепций в SVG (для Codex и Illustrator)."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lockups as L
from signs import s1, s2, s3, bare
from deck import P1, P2, P3, INK

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
sets = {
    'c1-tochka-opory': (s1('v2'), s1('v2', '#fff', '#fff')),
    'c2-severo-vostok': (s2('B', P2['night'], P2['sun']), s2('B', '#fff', P2['sun'])),
    'c3-ledokol': (s3('A', P3['night'], P3['red']), s3('A', '#fff', P3['red'])),
}
for name, (S, SW) in sets.items():
    files = {
        'sign': bare(S), 'main': L.main(S, INK), 'main-white': L.main(SW, '#fff'),
        'desc': L.with_desc(S, INK), 'full-h': L.full_h(S, INK, lines=L.NAME2),
        'full-h3': L.full_h(S, INK), 'full-v': L.full_v(S, INK),
    }
    for k, svg in files.items():
        svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
        open(f'{out}/{name}-{k}.svg', 'w').write(svg)
print('ok')
