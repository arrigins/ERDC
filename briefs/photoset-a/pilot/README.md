# Пилот нейрофотосета, 29.10.2026 — концепция А «Встречаем день первыми»

Krea, модель `google/nano-banana-pro`, 2K (2528×1696, 3:2), 111 единиц за кадр. Потрачено 444 единицы из лимита 1000.
Здесь уменьшенные копии (1600 px), полные файлы отправлены Арине в чат.

## Кадр 09 — футболка на балконе, Владивосток
Образцы: `public/assets/merch/merch-ap2-tee-sky.webp` целиком + кроп принта.
- v1 — первая проба. Принт точный, надпись читается, настоящее солнце на одной высоте с нарисованным. Балкон слишком обшарпанный — для бренда читается как разруха.
- v2 — опрятный балкон, табурет с кружкой, герань, Золотой мост. **Рабочая версия.**

Промпт v2 (англ.): Documentary 35mm film photograph, Kodak Portra 400, early morning minutes after sunrise. A pale sky-blue cotton t-shirt from the reference image hangs on a clothesline on a tidy open balcony of a well-kept modern apartment building in Vladivostok, Russia, held by two wooden clothespins. Clean light-grey balcony parapet, simple metal railing, a small wooden stool with a mug, one potted geranium; nothing shabby, nothing broken. The t-shirt is shown fully, front facing the camera, fabric gently moving in the breeze, natural soft wrinkles. Its chest print must match the reference exactly: a soft pink gradient semicircle sun with thin horizontal stripes fading at the bottom, and below it the small logo and two short lines of Cyrillic text; do not invent or alter letters. Behind the railing: the Golden Horn bay of Vladivostok in soft morning haze, the cable-stayed bridge far away, hills with houses, and the real rising sun low over the water at exactly the same height as the printed sun, immediately to the left of the shirt, so the two suns read as a pair. Warm pink-orange first light touches the shirt and the right side of the balcony; the left side is still in cool blue shadow. No people. Eye-level camera, 50mm lens, shallow depth of field on the shirt, low horizon, lots of sky, empty space on the left for a caption. Soft film grain, muted true-to-life colours, no HDR, no glossy CGI look, no text overlays, no watermark.

## Кадр 13 — Тимур с термокружкой у верфи, Большой Камень
Образец: `public/assets/merch/merch-mug.webp`.
- v1 — пар светится в контровом свете, лицо и руки без брака, кружка по форме и цвету верная. Мелкий текст на кружке искажён («закаляе», «согреввет»), на борту судна псевдонадпись. **Рабочая версия, надпись заменить макетом в постобработке.**
- v2 — попытка исправить надпись правкой кадра (image edit). Не удалась: буквы снова перепутаны. Вывод: мелкие кириллические надписи нейросети не доверяем, накладываем настоящий принт.

Промпт v1 (англ.): Documentary 35mm film photograph, Kodak Portra 400, a frosty November morning at 8:10, a few minutes after sunrise, at a shipyard pier in Bolshoy Kamen, Russian Far East. A 33-year-old Tatar man, shipbuilding engineer, stands at the pier railing before his shift: short dark beard, thick eyebrows, broad shoulders, weathered working hands, calm slightly ironic eyes. He wears his own clothes: a dark olive insulated work jacket, grey fleece collar, a plain dark knitted beanie, no hard hat, no hi-vis vest, no logos. He holds the cream-coloured thermo mug from the reference image in both hands at chest height, the mug exactly as in the reference ... A dense column of steam rises from the mug and glows in the warm backlight of the low sun behind him, his breath also visible. He looks past the camera toward the sun over the bay, not posing. Background out of focus: shipyard gantry cranes, the dark hull of a ship under construction, frost on the railing, cold blue shadow everywhere except the warm rim light on his face, beard, the steam and the mug. Eye-level, 50mm, medium shot from the waist up, subject slightly right of centre, empty space on the left for a caption. Natural skin texture, pores, no retouching, no glossy CGI look, soft film grain, muted colours, no text overlays, no watermark.

## Выводы
- Nano Banana Pro держит вещь по образцу (форма, цвет, крупный принт) и даёт убедительный плёночный свет без «нейроглянца».
- Крупный принт (солнце + КРДВ) выходит точно; мелкий текст — нет. Замена макетом обязательна.
- Промежуточные генерации (отдельно герой, отдельно локация) для этих двух кадров не понадобились.
- Следить за «разрухой» в локациях: прямо просить опрятную среду.

## Второй круг (29.10, вечер)

Отзыв Арины на первый круг: кадр 09 v2 (цветы, кружка, Владивосток) нравится, но футболка слишком мятая — от мерча должно оставаться «вау, хочу»; лёгкая помятость допустима, грань — фэшн-естественность без «вылизанности». Кадр 09 v1 (облезлый балкон, чужие вещи) — антипример, в нарочитый реализм не уходить. Кадр 13 v1: место, свет и пар верные, герой не подошёл (волосатые руки, монобровь, странная шапка, внешность «не дальневосточная»).

- **13 v3 — новый герой.** Русский, 32, светло-русый, лёгкая щетина, серо-голубые глаза, тёмно-синее пальто, серая водолазка, аккуратная шапка; руки чистые. Место, свет и пар сохранены. Текст на кружке снова искажён (ожидаемо, заменяем макетом). **Рабочая версия.**
- **12 v1 — диптих с ремувкой.** Подоконник офиса, вид на бухту; слева тень и матовая надпись-призрак, справа первый луч и коралловое «ДАЛЬНИЙ ВОСТОК». Крупные буквы вышли точно. **Рабочая версия с первой попытки.**
- **08 — Аня на набережной.** Запущен, Krea посчитала, но ответ не дошёл (обрыв связи через 60 с), результат не получен — искать в истории генераций аккаунта Krea; при необходимости перезапустить (111 ед.).

Потрачено за два круга ≈ 926 единиц из лимита 1000.

Промпт 13 v3 (герой): A 32-year-old Russian man from the Far East, shipbuilding engineer... light brown hair, short and neat, two or three days of light stubble, grey-blue eyes, straight separate eyebrows, lean build, clean well-kept hands with short nails, almost no hair on the hands. Quiet half-smile... dark navy wool coat over a light grey turtleneck sweater, a simple fine-knit charcoal beanie worn high (остальное как в v1).

Промпт 12: Two-panel diptych in one image, side by side with a thin white gap between the panels, each panel 1:1. Still-life product photography on medium format film look, natural morning light only. A black nylon key-strap lanyard from the reference images on a wide light wooden windowsill in a modern office in Vladivostok, beside a dark grey backpack and the edge of a laptop. LEFT PANEL (07:40): cool blue pre-sunrise shadow; printed words barely visible, a faint matte grey ghost of lettering exactly as in the first reference. RIGHT PANEL (07:58): the first warm sunbeam has reached the strap and the thermochromic print has fully appeared: ДАЛЬНИЙ ВОСТОК in bright coral-orange capitals exactly as in the second reference, warm light pooling on the wood while the rest stays in blue shade. Same camera position, slightly top-down 45-degree angle, 80mm, shallow depth of field. Out of focus behind the window: the Golden Horn bay in morning haze. Fine film grain, muted colours, no HDR, no CGI gloss, no added text.

Следующее: футболка на балконе — снять лишние складки (правка кадра), Аня (повтор при необходимости), затем кадры 05/15/18.
