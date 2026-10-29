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
