// Шаблон «Цитата» по референсам R14–R18 и R42: белая карточка на фирменном градиенте,
// круглый портрет, имя, должность, знак цитаты и текст. Все размеры — в логических пикселях 1080 × 1080.
// Один и тот же код рисует предпросмотр и итоговый файл (ТЗ, раздел 9).
// Значения сняты с утверждённых постов и требуют подтверждения дизайн-командой.

export const QUOTE_TEMPLATE_VERSION = "quote-1.0-draft";

import { FONT, roundRect, wrap } from "./text.js";
const card = { x: 46, y: 44, w: 989, h: 987, r: 52 };
const text = { x: 105, width: 870, bottom: 985 };
export const portraitCircle = { cx: 298, cy: 296, r: 188 };

const styles = {
  normal: { quoteSize: 34, quoteLine: 47, gapName: 30, gapMark: 44, gapQuote: 34 },
  dense: { quoteSize: 30, quoteLine: 40, gapName: 18, gapMark: 30, gapQuote: 24 },
};

const name = { size: 72, line: 78, weight: 700, color: "#1a3dee", maxLines: 2 };
const role = { size: 30, line: 38, weight: 400, color: "#8c8c8c", maxLines: 3 };
const quote = { weight: 500, color: "#4f8fd6", maxLines: 8 };

export const fontRequests = [`700 72px ${FONT}`, `500 34px ${FONT}`, `400 30px ${FONT}`];

// Кавычки задаёт шаблон: снимаем кавычки по краям вставленного текста, чтобы не было двойных
export function cleanQuote(value) {
  return value.trim().replace(/^[«"„“”']+\s*/, "").replace(/\s*[»"“”']+$/, "");
}

function setFont(ctx, spec, size = spec.size) {
  ctx.font = `${spec.weight} ${size}px ${FONT}`;
}

// Раскладка без рисования: строки, координаты и проблемы переполнения
export function layoutQuote(ctx, data) {
  const style = styles[data.density] || styles.normal;
  const issues = [];
  let y = data.portrait ? 520 : 150;

  setFont(ctx, name);
  const nameWrap = wrap(ctx, data.name.trim(), text.width);
  if (nameWrap.lines.length > name.maxLines) issues.push({ field: "name", text: "Имя не помещается в две строки. Сократите его или перенесите часть в должность." });
  const nameBlock = { y, lines: nameWrap.lines };
  y += nameWrap.lines.length * name.line;

  let roleBlock = null;
  if (data.role.trim()) {
    y += style.gapName - 8;
    setFont(ctx, role);
    const roleWrap = wrap(ctx, data.role.trim(), text.width);
    if (roleWrap.lines.length > role.maxLines) issues.push({ field: "role", text: "Должность не помещается в три строки. Сократите её." });
    roleBlock = { y, lines: roleWrap.lines };
    y += roleWrap.lines.length * role.line;
  }

  y += style.gapMark;
  const markY = y;
  y += 26 + style.gapQuote;

  ctx.font = `${quote.weight} ${style.quoteSize}px ${FONT}`;
  const quoteWrap = wrap(ctx, cleanQuote(data.quote), text.width);
  const quoteBlock = { y, lines: quoteWrap.lines, size: style.quoteSize, line: style.quoteLine };
  const quoteBottom = y + quoteWrap.lines.length * style.quoteLine;
  if (quoteWrap.lines.length > quote.maxLines || quoteBottom > text.bottom) {
    issues.push({ field: "quote", text: "Сократите цитату или разделите её на карточки." });
  }

  // Без портрета блок текста центрируется по высоте карточки, чтобы не оставалось пустоты снизу
  let markTop = markY;
  if (!data.portrait && issues.length === 0) {
    const shift = Math.max(0, Math.round((text.bottom - quoteBottom) / 2) - 40);
    nameBlock.y += shift;
    if (roleBlock) roleBlock.y += shift;
    markTop += shift;
    quoteBlock.y += shift;
  }

  return { nameBlock, roleBlock, markY: markTop, quoteBlock, issues, quoteLines: quoteWrap.lines.length };
}

// Знак цитаты: две «девятки» фирменного синего
function drawQuoteMark(ctx, x, y) {
  ctx.fillStyle = "#0430f3";
  for (const dx of [0, 22]) {
    const cx = x + dx + 9;
    const cy = y + 9;
    ctx.beginPath();
    ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 9, cy);
    ctx.quadraticCurveTo(cx + 9, cy + 14, cx - 4, cy + 22);
    ctx.lineTo(cx - 6, cy + 18);
    ctx.quadraticCurveTo(cx + 2, cy + 12, cx, cy + 6);
    ctx.closePath();
    ctx.fill();
  }
}

function drawDots(ctx) {
  const colors = ["#8fd8f6", "#5cc2f2", "#4aa6f4", "#2f7ff4", "#1650f3", "#0030f3"];
  colors.forEach((color, index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(825 + index * 30.8, 107, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Рисует карточку на ctx, уже масштабированном к логическим 1080 × 1080
export function renderQuote(ctx, data, layout) {
  const background = ctx.createLinearGradient(0, 0, 0, 1080);
  background.addColorStop(0, "#1b3bf1");
  background.addColorStop(0.5, "#458df5");
  background.addColorStop(1, "#73e1f5");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = "#ffffff";
  roundRect(ctx, card.x, card.y, card.w, card.h, card.r);
  ctx.fill();

  drawDots(ctx);

  if (data.portrait) {
    const { cx, cy, r } = portraitCircle;
    // Цветной полукруг-обводка справа сверху, как в референсах
    const ring = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ring.addColorStop(0, "#1a3df0");
    ring.addColorStop(0.55, "#2f7ff4");
    ring.addColorStop(1, "#8fe0f6");
    ctx.fillStyle = ring;
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 7, r + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "#e9ecf2";
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    const { photo, crop } = data.portrait;
    if (photo && crop) {
      const f = (r * 2) / 1080;
      ctx.drawImage(photo.bitmap, cx - r + crop.x * f, cy - r + crop.y * f, crop.w * f, crop.h * f);
    } else {
      // Заглушка до загрузки портрета (только в предпросмотре — без портрета экспорт заблокирован)
      ctx.fillStyle = "#cfd4de";
      ctx.beginPath();
      ctx.arc(cx, cy - 34, 62, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx, cy + 150, 130, 110, 0, Math.PI, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Незаполненные поля в предпросмотре показываются подсказкой-заглушкой (в файл не попадают: экспорт заблокирован)
  const ghost = data.ghost || {};
  const paint = (isGhost, draw) => {
    ctx.globalAlpha = isGhost ? 0.3 : 1;
    draw();
    ctx.globalAlpha = 1;
  };

  paint(ghost.name, () => {
    setFont(ctx, name);
    ctx.fillStyle = name.color;
    layout.nameBlock.lines.forEach((line, index) => ctx.fillText(line, text.x, layout.nameBlock.y + index * name.line));
  });

  if (layout.roleBlock) {
    paint(ghost.role, () => {
      setFont(ctx, role);
      ctx.fillStyle = role.color;
      layout.roleBlock.lines.forEach((line, index) => ctx.fillText(line, text.x, layout.roleBlock.y + index * role.line));
    });
  }

  drawQuoteMark(ctx, text.x, layout.markY);

  paint(ghost.quote, () => {
    ctx.font = `${quote.weight} ${layout.quoteBlock.size}px ${FONT}`;
    ctx.fillStyle = quote.color;
    layout.quoteBlock.lines.forEach((line, index) => ctx.fillText(line, text.x, layout.quoteBlock.y + index * layout.quoteBlock.line));
  });
}
