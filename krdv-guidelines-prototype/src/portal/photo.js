// Общие функции для работы с фотографиями в прототипе платформы: проверка, декодирование, кадр, скачивание.

export const asset = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;
export const FRAME = 1080;
export const MAX_ZOOM = 4;
const MAX_BYTES = 20 * 1024 * 1024;
// Очень большие снимки не отклоняем, а уменьшаем при открытии: для поста 2160 px хватает с запасом
const MAX_SIDE = 6000;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Проверка реального формата по первым байтам, а не по расширению (ТЗ, раздел 11)
async function sniffFormat(file) {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = String.fromCharCode(...bytes);
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes[0] === 0x89 && ascii.slice(1, 4) === "PNG") return "png";
  if (ascii.slice(0, 4) === "RIFF" && ascii.slice(8, 12) === "WEBP") return "webp";
  if (ascii.slice(4, 8) === "ftyp" && /heic|heix|hevc|mif1|msf1/.test(ascii.slice(8, 12))) return "heic";
  return null;
}

export async function decodePhoto(file) {
  if (file.size > MAX_BYTES) {
    throw new Error("Файл больше 20 МБ. Уменьшите его или сохраните в JPG с меньшим качеством.");
  }
  const format = await sniffFormat(file);
  if (format === "heic") {
    throw new Error("Формат HEIC пока не поддерживается. На iPhone откройте фото и сохраните как JPG (или выберите «Наиболее совместимый» в настройках камеры).");
  }
  if (!format) {
    throw new Error("Этот файл не похож на фотографию. Подойдут JPG, PNG или WebP.");
  }
  let bitmap;
  try {
    // Ориентация по EXIF применяется при декодировании
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Не удалось открыть фотографию — возможно, файл повреждён. Попробуйте другой файл.");
  }
  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest > MAX_SIDE) {
    const k = MAX_SIDE / longest;
    try {
      const smaller = await createImageBitmap(bitmap, { resizeWidth: Math.round(bitmap.width * k), resizeHeight: Math.round(bitmap.height * k), resizeQuality: "high" });
      bitmap.close();
      bitmap = smaller;
    } catch {
      // если браузер не умеет уменьшать — работаем с исходником
    }
  }
  // file сохраняем для черновика: фото восстанавливается после перезапуска
  return { bitmap, url: URL.createObjectURL(file), name: (file.name || "photo").replace(/\.[^.]+$/, ""), format, file };
}

// Отличаем нажатие от перетаскивания: короткое нажатие без сдвига — «заменить фото»
export function createTap() {
  let start = null;
  return {
    down(event) {
      start = { x: event.clientX, y: event.clientY, t: Date.now(), moved: 0 };
    },
    move(event) {
      if (start) start.moved = Math.max(start.moved, Math.hypot(event.clientX - start.x, event.clientY - start.y));
    },
    up() {
      const tap = Boolean(start) && start.moved < 6 && Date.now() - start.t < 500;
      start = null;
      return tap;
    },
  };
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Не удалось загрузить элемент шаблона. Проверьте интернет и попробуйте ещё раз."));
    image.src = src;
  });
}

// Кадр: масштаб и сдвиг фотографии внутри квадрата со стороной frame.
// Фото всегда закрывает квадрат целиком и не растягивается.
export function coverCrop(width, height, zoom = 1, center, frame = FRAME) {
  const base = frame / Math.min(width, height);
  const w = width * base * zoom;
  const h = height * base * zoom;
  const cx = center ? center.x : 0.5;
  const cy = center ? center.y : 0.5;
  return {
    zoom,
    w,
    h,
    x: clamp(frame / 2 - cx * w, frame - w, 0),
    y: clamp(frame / 2 - cy * h, frame - h, 0),
  };
}

export function zoomCrop(crop, photo, zoom, frame = FRAME) {
  const center = { x: (frame / 2 - crop.x) / crop.w, y: (frame / 2 - crop.y) / crop.h };
  return coverCrop(photo.bitmap.width, photo.bitmap.height, clamp(zoom, 1, MAX_ZOOM), center, frame);
}

export function moveCrop(crop, dx, dy, frame = FRAME) {
  return {
    ...crop,
    x: clamp(crop.x + dx, frame - crop.w, 0),
    y: clamp(crop.y + dy, frame - crop.h, 0),
  };
}

export async function downloadCanvas(canvas, format, filename) {
  const type = format === "jpg" ? "image/jpeg" : "image/png";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.92));
  if (!blob) throw new Error("Не удалось подготовить файл. Попробуйте ещё раз или выберите размер 1080.");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
}
