# Генератор черновых знаков ребрендинга (Python → SVG/HTML)

Нужны: `pip install fonttools brotli`, шрифты из npm в папке на уровень выше `src/`:
`npm i @fontsource/onest@5.2.5 @fontsource/manrope@5.2.5` (пути в `glyphs.py`: `../node_modules/@fontsource`).

- `v2page.py` — страница второго круга (`../krdv-rebrand-round2.html`) и плоские макеты для Codex.
- `export.py` — SVG знаков в `briefs/rebrand/marks/`.
- `mvp.py` — первая страница (пять идей).
