"""Мокап «Парки и скверы»: плоский макет стелы (PNG из park-mockup.cjs) вставляется на экран стелы на фото.
Запуск: python3 park-mockup.py <park-photo> <stele.png>  → public/master-plans/mockups/park-stele.webp
Фото — скриншот примера из переписки: кроп без рамки, увеличение ×2."""
import os, sys
from PIL import Image, ImageFilter

photo, stele = sys.argv[1], sys.argv[2]
OUT = os.path.join(os.path.dirname(__file__), "../../public/master-plans/mockups/park-stele.webp")
CROP = (84, 334, 610, 912)            # фото без рамки мессенджера
FACE = (301, 470, 446, 728)           # экран стелы на исходнике
K = 2

im = Image.open(photo).convert("RGB").crop(CROP)
im = im.resize((im.width * K, im.height * K), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2))
x0, y0 = (FACE[0] - CROP[0]) * K, (FACE[1] - CROP[1]) * K
w, h = (FACE[2] - FACE[0]) * K, (FACE[3] - FACE[1]) * K
face = Image.open(stele).convert("RGB").resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.5))
im.paste(face, (x0, y0))
im.save(OUT, quality=88)
print(OUT, im.size)
