// Шаблон квадратного поста в фирменном стиле проекта «Государство для людей» (логобук проекта, 2023).
// Цвета: аквамариновый #31B6B3, бирюзовый #0082A0, синий #004E8B, белый. Шрифт: в логобуке основной — Aeroport,
// для диджитала — Montserrat (его и используем: Aeroport у нас нет). Стилеобразующие элементы — плашки и круги.
// Все размеры — в логических пикселях 1080 × 1080; предпросмотр и файл рисует одна функция renderGdl.

import { wrap } from "./text.js";

export const GDL_TEMPLATE_VERSION = "gdl-1.0-draft";
export const GDL_FONT = '"Montserrat"';
export const gdlFontRequests = [`700 44px ${GDL_FONT}`, `400 30px ${GDL_FONT}`];

export const gdlColors = { aqua: "#31B6B3", teal: "#0082A0", blue: "#004E8B", white: "#FFFFFF" };

// Цветовые схемы — только основные цвета (дополнительные в плашках и кругах запрещены логобуком)
export const circleSchemes = {
  blue: { title: "Синий", bg: gdlColors.blue, circle: gdlColors.aqua },
  teal: { title: "Бирюзовый", bg: gdlColors.teal, circle: gdlColors.aqua },
  aqua: { title: "Аквамариновый", bg: gdlColors.aqua, circle: gdlColors.blue },
};
// Две плашки: нижняя плашка и цвет, который виден в скруглении справа (логобук, «Цветовая схема двух плашек»)
export const plateSchemes = {
  aqua: { title: "Аквамариновый", plate: gdlColors.aqua, gap: gdlColors.blue },
  blue: { title: "Синий", plate: gdlColors.blue, gap: gdlColors.aqua },
};

const M = 72; // отступ слева X; радиус скругления плашки — 2X (логобук, «Пропорции и построение плашек»)
const R = M * 2;
const ROW = 1080 / 6; // макет делится на 6 частей по высоте

const sign = { x: M, y: M, h: 84 };
const tag = { right: 1080 - M, y: M + 6, width: 430, size: 28, line: 36, maxLines: 2 };
const circle = { cx: 560, cy: 452, r: 352 };
const photoCircle = { cx: 560, cy: 452, r: 326 };
const step = { cx: 238, cy: 640, r: 104, size: 40, line: 44, maxLines: 2, width: 164 };
const caption = { x: M, width: 1080 - M * 2, bottom: 1080 - M + 8, size: 40, line: 50, maxLines: 3, top: 836 };

const plateTitle = { size: 44, line: 54, width: 1080 - M * 2 - 40 };

export function photoBox(data) {
  if (data.layout === "circle") return { shape: "circle", x: photoCircle.cx - photoCircle.r, y: photoCircle.cy - photoCircle.r, w: photoCircle.r * 2, h: photoCircle.r * 2, cx: photoCircle.cx, cy: photoCircle.cy, r: photoCircle.r };
  const h = ROW * (data.split === "text" ? 3 : 4);
  return { shape: "plate", x: 0, y: 0, w: 1080, h };
}

// Положение фото внутри области: центр кадра (0..1) и масштаб; фото всегда закрывает область
export function photoRect(photo, crop, box) {
  const iw = photo.bitmap.width;
  const ih = photo.bitmap.height;
  const base = Math.max(box.w / iw, box.h / ih) * crop.zoom;
  const w = iw * base;
  const h = ih * base;
  const x = Math.min(box.x, Math.max(box.x + box.w - w, box.x + box.w / 2 - crop.cx * w));
  const y = Math.min(box.y, Math.max(box.y + box.h - h, box.y + box.h / 2 - crop.cy * h));
  return { x, y, w, h };
}

function font(ctx, weight, size) {
  ctx.font = `${weight} ${size}px ${GDL_FONT}`;
}

export function layoutGdl(ctx, data) {
  const issues = [];
  const result = { issues };
  if (data.layout === "circle") {
    font(ctx, 400, tag.size);
    const tagWrap = data.tag.trim() ? wrap(ctx, data.tag.trim(), tag.width) : { lines: [] };
    if (tagWrap.lines.length > tag.maxLines) issues.push({ field: "tag", text: "Тема не помещается в две строки. Сократите её." });
    result.tag = tagWrap.lines;

    font(ctx, 700, step.size);
    const stepWrap = data.step.trim() ? wrap(ctx, data.step.trim(), step.width) : { lines: [] };
    if (stepWrap.lines.length > step.maxLines || stepWrap.tooLong) issues.push({ field: "step", text: "Надпись в круге — одно-два коротких слова." });
    result.step = stepWrap.lines;

    font(ctx, 700, caption.size);
    const capWrap = wrap(ctx, data.title.trim(), caption.width);
    if (capWrap.lines.length > caption.maxLines) issues.push({ field: "title", text: "Текст не помещается в три строки. Сократите его." });
    result.title = capWrap.lines;
    result.titleY = caption.bottom - capWrap.lines.length * caption.line;
    return result;
  }
  const top = ROW * (data.split === "text" ? 3 : 4);
  const logoTop = 1080 - 60 - 64;
  const maxLines = data.split === "text" ? 5 : 3;
  font(ctx, 700, plateTitle.size);
  const titleWrap = wrap(ctx, data.title.trim(), plateTitle.width);
  if (titleWrap.lines.length > maxLines) issues.push({ field: "title", text: `Заголовок не помещается в ${maxLines === 3 ? "три строки" : "пять строк"}. Сократите его${maxLines === 3 ? " или выберите «Больше текста»" : ""}.` });
  result.title = titleWrap.lines;
  result.titleY = top + 64;
  result.logoTop = logoTop;
  result.maxLines = maxLines;
  return result;
}

function drawPhoto(ctx, data, box) {
  ctx.save();
  ctx.beginPath();
  if (box.shape === "circle") ctx.arc(box.cx, box.cy, box.r, 0, Math.PI * 2);
  else plateShape(ctx, 0, 0, 1080, box.h, "bottom");
  ctx.clip();
  if (data.photo && data.crop) {
    const rect = photoRect(data.photo, data.crop, box);
    ctx.drawImage(data.photo.bitmap, rect.x, rect.y, rect.w, rect.h);
  } else {
    // Заглушка до загрузки фото (без фото экспорт заблокирован)
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    const s = Math.min(box.w, box.h) / 660;
    ctx.beginPath();
    ctx.arc(cx, cy - 70 * s, 92 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy + 210 * s, 190 * s, 160 * s, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.restore();
}

// Плашка во всю ширину со скруглением справа радиусом 2X: снизу (у верхней плашки) или сверху (у нижней)
function plateShape(ctx, x, y, w, h, corner) {
  ctx.moveTo(x, y);
  if (corner === "top") {
    ctx.lineTo(x + w - R, y);
    ctx.arcTo(x + w, y, x + w, y + R, R);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
  } else {
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - R);
    ctx.arcTo(x + w, y + h, x + w - R, y + h, R);
    ctx.lineTo(x, y + h);
  }
  ctx.closePath();
}

export function renderGdl(ctx, data, layout, images) {
  const ghost = data.ghost || {};
  const paint = (isGhost, draw) => {
    ctx.globalAlpha = isGhost ? 0.45 : 1;
    draw();
    ctx.globalAlpha = 1;
  };
  ctx.textBaseline = "top";

  if (data.layout === "circle") {
    const scheme = circleSchemes[data.scheme] || circleSchemes.blue;
    ctx.fillStyle = scheme.bg;
    ctx.fillRect(0, 0, 1080, 1080);
    ctx.fillStyle = scheme.circle;
    ctx.beginPath();
    ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2);
    ctx.fill();
    drawPhoto(ctx, data, photoBox(data));

    const logo = data.logo === "full" ? images.full : images.sign;
    if (logo) {
      const w = (logo.width / logo.height) * sign.h;
      ctx.drawImage(logo, sign.x, sign.y, w, sign.h);
    }

    if (layout.tag.length) {
      paint(ghost.tag, () => {
        font(ctx, 400, tag.size);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "right";
        layout.tag.forEach((line, index) => ctx.fillText(line, tag.right, tag.y + index * tag.line));
        ctx.textAlign = "left";
      });
    }

    if (layout.step.length) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(step.cx, step.cy, step.r, 0, Math.PI * 2);
      ctx.fill();
      paint(ghost.step, () => {
        font(ctx, 700, step.size);
        ctx.fillStyle = scheme.bg === gdlColors.aqua ? gdlColors.blue : scheme.bg;
        ctx.textAlign = "center";
        const startY = step.cy - (layout.step.length * step.line) / 2 + 2;
        layout.step.forEach((line, index) => ctx.fillText(line, step.cx, startY + index * step.line));
        ctx.textAlign = "left";
      });
    }

    paint(ghost.title, () => {
      font(ctx, 700, caption.size);
      ctx.fillStyle = "#ffffff";
      layout.title.forEach((line, index) => ctx.fillText(line, caption.x, layout.titleY + index * caption.line));
    });
    return;
  }

  // Плашки: фото-контейнер сверху, плашка с текстом снизу, в скруглении виден второй цвет
  const scheme = plateSchemes[data.scheme] || plateSchemes.aqua;
  const box = photoBox(data);
  ctx.fillStyle = scheme.gap;
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = scheme.plate;
  ctx.beginPath();
  plateShape(ctx, 0, box.h, 1080, 1080 - box.h, "top");
  ctx.fill();
  ctx.fillStyle = scheme.gap === gdlColors.blue ? "#0a5d97" : "#2aa3a8";
  ctx.beginPath();
  plateShape(ctx, 0, 0, 1080, box.h, "bottom");
  ctx.fill();
  drawPhoto(ctx, data, box);

  paint(ghost.title, () => {
    font(ctx, 700, plateTitle.size);
    ctx.fillStyle = "#ffffff";
    layout.title.forEach((line, index) => ctx.fillText(line, M, layout.titleY + index * plateTitle.line));
  });

  const logo = images.full;
  if (logo) {
    const h = 64;
    ctx.drawImage(logo, M, layout.logoTop, (logo.width / logo.height) * h, h);
  }
}
