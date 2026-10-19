// Шаблон «Государство для людей» × КРДВ по макетам пользователя (SVG 1080×1080, 720×1280, 1280×720):
// фото-плашка со скруглением, цветная плашка с логотипами (ГДЛ | партнёр), заголовком и подзаголовком;
// в скруглении виден цвет фона. Цвета — только основные из логобука ГДЛ. Шрифт — Montserrat (веб-шрифт логобука).
// Все размеры — в логических пикселях макета; предпросмотр и файл рисует одна функция.

import { wrap } from "./text.js";

export const GDL_COBRAND_VERSION = "gdl-cobrand-1.0-draft";
const FONT = '"Montserrat"';
export const cobrandFontRequests = [`700 56px ${FONT}`, `400 32px ${FONT}`];

const C = { aqua: "#31B6B3", teal: "#0082A0", blue: "#015397", deep: "#004E8B" };

// Плашка с текстом + цвет в скруглении. Белый текст на всех вариантах, как в опубликованных постах
export const cobrandSchemes = {
  blue: { title: "Синий", plate: C.blue, gap: C.aqua },
  aqua: { title: "Аквамариновый", plate: C.aqua, gap: C.teal },
  teal: { title: "Бирюзовый", plate: C.teal, gap: C.aqua },
  deep: { title: "Синий + бирюзовый", plate: C.blue, gap: C.teal },
};

export const partners = {
  krdv: { title: "КРДВ", file: "assets/social/badge-white.png" },
  mvr: { title: "Герб МВР", file: "assets/portal/gdl/mvr-emblem-white.svg" },
  "mvr-text": { title: "Лого МВР", file: "assets/portal/gdl/mvr-emblem-text-white.svg" },
};

// Геометрия по присланным SVG. photo — область фото, corner — какой угол скруглён у фото и у плашки
export const formats = {
  square: {
    label: "Квадрат",
    w: 1080,
    h: 1080,
    photo: { x: 0, y: 0, w: 1080, h: 614, r: 115, corner: "br" },
    plate: { x: 0, y: 614, w: 1080, h: 466, r: 115, corner: "tr" },
    pad: 69,
    logoH: 62,
    logoTop: 678,
    title: { size: 58, line: 68, maxLines: 2 },
    sub: { size: 34, line: 48, maxLines: 3 },
    gapLogo: 48,
    gapSub: 18,
    bottom: 1080 - 66,
    export: { 1: [1080, 1080], 2: [2160, 2160] },
  },
  vertical: {
    label: "Вертикальный",
    w: 720,
    h: 1280,
    photo: { x: 0, y: 0, w: 720, h: 969, r: 75, corner: "br" },
    plate: { x: 0, y: 969, w: 720, h: 311, r: 75, corner: "tr" },
    pad: 46,
    logoH: 44,
    logoTop: 1009,
    title: { size: 38, line: 44, maxLines: 2 },
    sub: { size: 23, line: 31, maxLines: 2 },
    gapLogo: 26,
    gapSub: 10,
    bottom: 1280 - 44,
    export: { 1: [1080, 1920], 2: [1440, 2560] },
  },
  horizontal: {
    label: "Горизонтальный",
    w: 1280,
    h: 720,
    photo: { x: 311, y: 0, w: 969, h: 720, r: 75, corner: "tl" },
    plate: { x: 0, y: 0, w: 311, h: 720, r: 75, corner: "tr" },
    pad: 36,
    logoH: 34,
    logoTop: 40,
    title: { size: 30, line: 36, maxLines: 6 },
    sub: { size: 18, line: 25, maxLines: 5 },
    gapLogo: 40,
    gapSub: 12,
    bottom: 720 - 40,
    export: { 1: [1920, 1080], 2: [2560, 1440] },
  },
};

const GDL_RATIO = 252 / 62.98;

// Скругление только в одном углу (как в макетах)
function shapePath(ctx, { x, y, w, h, r, corner }) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  if (corner === "tl") {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
  } else if (corner === "tr") {
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
  } else {
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x, y + h);
  }
  ctx.closePath();
}

export function cobrandPhotoBox(format) {
  return formats[format].photo;
}

export function cobrandPhotoRect(photo, crop, box) {
  const iw = photo.bitmap.width;
  const ih = photo.bitmap.height;
  const base = Math.max(box.w / iw, box.h / ih) * crop.zoom;
  const w = iw * base;
  const h = ih * base;
  const x = Math.min(box.x, Math.max(box.x + box.w - w, box.x + box.w / 2 - crop.cx * w));
  const y = Math.min(box.y, Math.max(box.y + box.h - h, box.y + box.h / 2 - crop.cy * h));
  return { x, y, w, h };
}

// Ряд логотипов: ГДЛ | разделитель | логотип партнёра
// Как ставится логотип партнёра: высота от высоты ГДЛ, центр по вертикали, пустое поле слева в файле.
// «Лого МВР»: надпись выровнена по центру надписи ГДЛ (центр текста — 128/234 высоты файла), герб крупнее.
const partnerFit = {
  krdv: { k: 1.3, cy: 0.5, padL: 0 },
  mvr: { k: 1.45, cy: 0.5, padL: 0 },
  "mvr-text": { k: 1.85, cy: 128 / 234, padL: 18 / 687 },
};

function logoRow(f, partner, images) {
  const img = images[partner];
  const ratio = img ? img.width / img.height : 1;
  const fit = partnerFit[partner] || partnerFit.krdv;
  const measure = (h) => {
    const gdlW = h * GDL_RATIO;
    const gap = Math.round(h * 0.5);
    const ph = h * fit.k;
    const pw = ratio * ph;
    const shiftL = pw * fit.padL;
    return { h, gdlW, gap, ph, pw, shiftL, cy: fit.cy, width: gdlW + gap * 2 + pw - shiftL };
  };
  let m = measure(f.logoH);
  const available = f.plate.w - f.pad * 2;
  // В узкой плашке (горизонтальный формат) ряд уменьшается целиком, чтобы поместиться
  if (m.width > available) m = measure((f.logoH * available) / m.width);
  const lineX = f.pad + m.gdlW + m.gap;
  return { ...m, lineX, lineH: m.h * 1.35, px: lineX + m.gap - m.shiftL };
}

export function layoutCobrand(ctx, data, images) {
  const f = formats[data.format];
  const issues = [];
  const row = logoRow(f, data.partner, images);
  const width = f.plate.w - f.pad * 2;

  ctx.font = `700 ${f.title.size}px ${FONT}`;
  const title = wrap(ctx, data.title.trim(), width);
  ctx.font = `400 ${f.sub.size}px ${FONT}`;
  const sub = data.sub.trim() ? wrap(ctx, data.sub.trim(), width) : { lines: [] };
  if (title.lines.length > f.title.maxLines) issues.push({ field: "title", text: "Заголовок не помещается. Сократите его." });
  if (sub.lines.length > f.sub.maxLines) issues.push({ field: "sub", text: "Подзаголовок не помещается. Сократите его." });

  const textH = title.lines.length * f.title.line + (sub.lines.length ? f.gapSub + sub.lines.length * f.sub.line : 0);
  // Текст прижат к низу плашки, как в опубликованных постах; сверху — ряд логотипов
  const titleY = f.bottom - textH;
  if (titleY < f.logoTop + f.logoH + f.gapLogo) issues.push({ field: sub.lines.length ? "sub" : "title", text: "Текст не помещается на плашке. Сократите заголовок или подзаголовок." });
  return { row, title: title.lines, sub: sub.lines, titleY, subY: titleY + title.lines.length * f.title.line + f.gapSub, issues };
}

export function renderCobrand(ctx, data, layout, images) {
  const f = formats[data.format];
  const scheme = cobrandSchemes[data.scheme] || cobrandSchemes.blue;
  const ghost = data.ghost || {};

  ctx.fillStyle = scheme.gap;
  ctx.fillRect(0, 0, f.w, f.h);
  ctx.fillStyle = scheme.plate;
  shapePath(ctx, f.plate);
  ctx.fill();

  // Фото-плашка: фото или заглушка
  ctx.save();
  shapePath(ctx, f.photo);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(f.photo.x, f.photo.y, f.photo.w, f.photo.h);
  if (data.photo && data.crop) {
    const rect = cobrandPhotoRect(data.photo, data.crop, f.photo);
    ctx.drawImage(data.photo.bitmap, rect.x, rect.y, rect.w, rect.h);
  } else {
    ctx.fillStyle = "#e9eef3";
    ctx.fillRect(f.photo.x, f.photo.y, f.photo.w, f.photo.h);
    const cx = f.photo.x + f.photo.w / 2;
    const cy = f.photo.y + f.photo.h / 2;
    const s = Math.min(f.photo.w, f.photo.h) / 600;
    ctx.fillStyle = "#cfd8e2";
    // пиктограмма «фото»: рамка, горы, солнце
    ctx.lineWidth = 10 * s;
    ctx.strokeStyle = "#cfd8e2";
    ctx.strokeRect(cx - 110 * s, cy - 80 * s, 220 * s, 160 * s);
    ctx.beginPath();
    ctx.moveTo(cx - 100 * s, cy + 70 * s);
    ctx.lineTo(cx - 30 * s, cy - 10 * s);
    ctx.lineTo(cx + 20 * s, cy + 40 * s);
    ctx.lineTo(cx + 50 * s, cy + 10 * s);
    ctx.lineTo(cx + 100 * s, cy + 70 * s);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 55 * s, cy - 35 * s, 18 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = `400 ${Math.round(26 * s)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#9aa8b6";
    ctx.fillText("Место для фотографии", cx, cy + 108 * s);
    ctx.textAlign = "left";
  }
  ctx.restore();

  // Логотипы
  const { row } = layout;
  const rowMid = f.logoTop + f.logoH / 2;
  if (images.gdl) ctx.drawImage(images.gdl, f.pad, rowMid - row.h / 2, row.gdlW, row.h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(row.lineX, rowMid - row.lineH / 2, Math.max(1.5, row.h / 31), row.lineH);
  const partnerImg = images[data.partner];
  if (partnerImg) ctx.drawImage(partnerImg, row.px, rowMid - row.ph * row.cy, row.pw, row.ph);

  // Текст
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = ghost.title ? 0.45 : 1;
  ctx.font = `700 ${f.title.size}px ${FONT}`;
  layout.title.forEach((line, index) => ctx.fillText(line, f.pad, layout.titleY + index * f.title.line));
  ctx.globalAlpha = ghost.sub ? 0.45 : 1;
  ctx.font = `400 ${f.sub.size}px ${FONT}`;
  layout.sub.forEach((line, index) => ctx.fillText(line, f.pad, layout.subY + index * f.sub.line));
  ctx.globalAlpha = 1;
}
