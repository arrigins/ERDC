// Шаблоны «Новость» и «Серия карточек» (ТЗ, разделы 7–8) по референсам R01–R13 и R35–R40.
// Все размеры — в логических пикселях 1080 × 1080; предпросмотр и экспорт рисует одна функция renderCard.
// Значения сняты с утверждённых постов и требуют подтверждения дизайн-командой.

import qrcode from "qrcode-generator";
import { asset } from "./photo.js";
import { FONT, roundRect, wrap } from "./text.js";
import { drawBrandBackground } from "./backgrounds.js";

export const CARD_TEMPLATE_VERSION = "card-1.0-draft";

// Направления и закреплённые цвета (ТЗ, раздел 8). Цвет — только акцент; название показывается текстом.
export const directions = [
  { id: "none", title: "Без направления", color: "#FD3D37" },
  { id: "korf", title: "КОРФ", color: "#F45858", sign: "korf" },
  { id: "ipoteka", title: "Ипотека", color: "#5884C4" },
  { id: "tor", title: "ТОР", color: "#53184F", sign: "tor" },
  { id: "spv", title: "СПВ", color: "#223E9A", sign: "spv" },
  { id: "sar", title: "САР", color: "#17846F", sign: "sar" },
  { id: "azrf", title: "АЗРФ", color: "#1BA7DF", sign: "azrf" },
  { id: "intc", title: "ИНТЦ", color: "#0AABA5", sign: "intc" },
];
export const directionById = (id) => directions.find((item) => item.id === id) || directions[0];
export const signSrc = (id) => asset(`assets/regime-signs/regime-${id}.png`);

// Композиции новостной карточки (минимум три по ТЗ, раздел 7)
export const compositions = {
  large: {
    title: "Крупная иллюстрация",
    hint: "Короткий заголовок и большая иллюстрация",
    titleFont: { size: 96, line: 100, max: 2 },
    subFont: { size: 40, line: 50, max: 2 },
    art: { x: 470, y: 560, w: 570, h: 480, required: true },
    bottom: 560,
  },
  text: {
    title: "Заголовок и подзаголовок",
    hint: "Заголовок, пояснение и иллюстрация поменьше",
    titleFont: { size: 80, line: 88, max: 3 },
    subFont: { size: 40, line: 52, max: 3 },
    art: { x: 640, y: 640, w: 400, h: 400, required: false },
    bottom: 640,
  },
  plain: {
    title: "Текст без иллюстрации",
    hint: "Только текст — для объявлений и пояснений",
    titleFont: { size: 80, line: 88, max: 4 },
    subFont: { size: 40, line: 52, max: 10 },
    art: null,
    bottom: 1000,
  },
};

// Типы карточек серии: обложка, информационная, завершающая (ТЗ, раздел 8)
export const cardKinds = {
  cover: { title: "Обложка" },
  info: { title: "Информационная" },
  final: { title: "Завершающая" },
};

const colors = {
  blue: { title: "#ffffff", sub: "#ffffff", bullet: "#ffffff", tagText: "#ffffff" },
  milk: { title: "#1a3dee", sub: "#26272b", bullet: "#1a3dee", tagText: "#ffffff" },
};

const X = 60;
const WIDTH = 960;
const TOP = 230;

function setFont(ctx, weight, size) {
  ctx.font = `${weight} ${size}px ${FONT}`;
}

export function cleanUrl(value) {
  const raw = value.trim();
  if (!raw) return { ok: false, empty: true };
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || !url.hostname.includes(".")) return { ok: false };
    return { ok: true, href: url.href, label: url.hostname.replace(/^www\./, "").toUpperCase() };
  } catch {
    return { ok: false };
  }
}

// Раскладка карточки: строки, координаты и список проблем (переполнение, нет обязательных полей)
export function layoutCard(ctx, card) {
  const issues = [];
  const kind = card.kind || "news";
  const composition = kind === "info" || kind === "final" ? null : compositions[card.composition] || compositions.large;
  const titleFont = composition ? composition.titleFont : { size: 72, line: 80, max: 3 };
  const subFont = composition ? composition.subFont : { size: 36, line: 48, max: kind === "info" ? 12 : 3 };
  const art = composition ? composition.art : null;
  let bottomLimit = composition ? composition.bottom : 1000;
  const wantsQr = kind === "final" && card.qr !== null && card.qr !== undefined;
  if (wantsQr) bottomLimit = 560;

  let y = TOP;
  setFont(ctx, 700, titleFont.size);
  const title = wrap(ctx, card.title.trim(), WIDTH);
  if (title.lines.length > titleFont.max || title.tooLong) issues.push({ field: "title", text: `Заголовок не помещается в ${titleFont.max} ${titleFont.max > 1 ? "строки" : "строку"}. Сократите его.` });
  const titleBlock = { y, lines: title.lines, font: titleFont };
  y += title.lines.length * titleFont.line;

  let subBlock = null;
  const bullets = kind === "info";
  if (card.subtitle.trim()) {
    y += 22;
    setFont(ctx, 400, subFont.size);
    const items = bullets ? card.subtitle.split("\n").map((line) => line.trim()).filter(Boolean) : [card.subtitle.trim()];
    const blocks = items.map((item) => wrap(ctx, item, bullets ? WIDTH - 40 : WIDTH));
    const lines = blocks.reduce((sum, block) => sum + block.lines.length, 0) + (bullets ? (items.length - 1) * 0.35 : 0);
    if (lines > subFont.max || blocks.some((block) => block.tooLong)) {
      issues.push({ field: "subtitle", text: bullets ? "Список не помещается. Сократите пункты или перенесите часть на следующую карточку." : "Подзаголовок слишком длинный. Сократите его." });
    }
    subBlock = { y, items: blocks.map((block) => block.lines), font: subFont, bullets };
    y += lines * subFont.line;
  }

  let tagBlock = null;
  if (card.tag.trim()) {
    y += 26;
    setFont(ctx, 500, 30);
    const width = ctx.measureText(card.tag.trim()).width + 44;
    if (width > WIDTH) issues.push({ field: "tag", text: "Метка должна быть короткой — в одну строку." });
    tagBlock = { y, width: Math.min(width, WIDTH), text: card.tag.trim() };
    y += 54;
  }

  if (y > bottomLimit) {
    issues.push({ field: "layout", text: art ? "Текст заходит на место иллюстрации. Сократите текст или выберите композицию «Текст без иллюстрации»." : "Текст не помещается на карточке. Сократите его или разделите на две карточки." });
  }

  const needsArt = art?.required && !card.art;
  if (needsArt) issues.push({ field: "art", text: "Для этой композиции нужна иллюстрация. Выберите её или композицию без иллюстрации." });

  let qr = null;
  if (wantsQr) {
    const url = cleanUrl(card.qr);
    if (!url.ok) issues.push({ field: "qr", text: url.empty ? "Введите адрес для QR-кода или выключите QR-код." : "Адрес должен начинаться с https:// — например, https://erdc.ru" });
    else qr = url;
  }

  return { titleBlock, subBlock, tagBlock, art: card.art ? art || (kind === "cover" ? compositions.large.art : null) : null, qr, issues, textBottom: y };
}

function drawBackground(ctx, tone, bg) {
  if (tone === "milk") {
    ctx.fillStyle = "#FFFAF0";
    ctx.fillRect(0, 0, 1080, 1080);
    return;
  }
  drawBrandBackground(ctx, bg);
}

function drawContain(ctx, image, box) {
  const ratio = Math.min(box.w / image.width, box.h / image.height);
  const w = image.width * ratio;
  const h = image.height * ratio;
  ctx.drawImage(image, box.x + box.w - w, box.y + box.h - h, w, h);
}

function drawQr(ctx, url, x, y, size) {
  const qr = qrcode(0, "M");
  qr.addData(url.href);
  qr.make();
  const count = qr.getModuleCount();
  const pad = 26;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, size, size, 28);
  ctx.fill();
  const cell = (size - pad * 2) / count;
  ctx.fillStyle = "#000000";
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) ctx.fillRect(x + pad + col * cell, y + pad + row * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
}

// Рисует карточку на ctx, уже масштабированном к логическим 1080 × 1080.
// assets: { badgeWhite, badgeBlue, art (ImageBitmap | HTMLImageElement) }
export function renderCard(ctx, card, layout, assets) {
  const tone = card.tone === "milk" ? "milk" : "blue";
  const palette = colors[tone];
  const direction = directionById(card.direction);
  drawBackground(ctx, tone, card.bg);

  // Логотип: готовое начертание, обычный размер — круг 120 с отступом 60
  const badge = tone === "milk" ? assets.badgeBlue : assets.badgeWhite;
  if (badge) ctx.drawImage(badge, 60, 60, 120, 120);

  // Направление: название текстом (цвет — не единственный признак темы)
  if (direction.id !== "none") {
    setFont(ctx, 500, 26);
    const label = direction.title;
    const w = ctx.measureText(label).width + 40;
    ctx.fillStyle = tone === "milk" ? "rgba(26, 61, 238, 0.08)" : "rgba(255, 255, 255, 0.18)";
    roundRect(ctx, 1020 - w, 96, w, 48, 24);
    ctx.fill();
    ctx.fillStyle = tone === "milk" ? "#1a3dee" : "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 1020 - w + 20, 121);
  }

  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  const ghost = card.ghost || {};
  const paint = (isGhost, draw) => {
    ctx.globalAlpha = isGhost ? 0.35 : 1;
    draw();
    ctx.globalAlpha = 1;
  };

  if (layout.art && assets.art) {
    if (card.art?.type === "sign") {
      // Знак программы не перекрашивается: на синем фоне он стоит на белом круге
      const box = layout.art;
      const d = Math.min(box.w, box.h) * 0.86;
      const cx = box.x + box.w - d / 2;
      const cy = box.y + box.h - d / 2;
      if (tone === "blue") {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      const inner = d * 0.62;
      drawContain(ctx, assets.art, { x: cx - inner / 2, y: cy - inner / 2, w: inner, h: inner });
    } else {
      // Иллюстрация не должна сливаться с фоном: на градиенте под ней мягкое светлое сияние
      if (tone === "blue") {
        const box = layout.art;
        const ratio = Math.min(box.w / assets.art.width, box.h / assets.art.height);
        const w = assets.art.width * ratio;
        const h = assets.art.height * ratio;
        const cx = box.x + box.w - w / 2;
        const cy = box.y + box.h - h / 2;
        const r = Math.max(w, h) * 0.8;
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        glow.addColorStop(0, "rgba(190, 236, 255, 1)");
        glow.addColorStop(0.5, "rgba(140, 214, 255, 0.85)");
        glow.addColorStop(0.75, "rgba(100, 190, 255, 0.4)");
        glow.addColorStop(1, "rgba(80, 170, 255, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      drawContain(ctx, assets.art, layout.art);
    }
  }
  if (!assets.art && card.showArtSlot) {
    const box = (compositions[card.composition] || compositions.large).art;
    if (box) {
      ctx.save();
      ctx.setLineDash([14, 10]);
      ctx.strokeStyle = tone === "milk" ? "rgba(26, 61, 238, 0.35)" : "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 3;
      roundRect(ctx, box.x + 20, box.y + 20, box.w - 80, box.h - 80, 40);
      ctx.stroke();
      ctx.restore();
      setFont(ctx, 400, 30);
      ctx.fillStyle = tone === "milk" ? "rgba(26, 61, 238, 0.6)" : "rgba(255, 255, 255, 0.75)";
      ctx.textAlign = "center";
      ctx.fillText("Иллюстрация", box.x + box.w / 2 - 20, box.y + box.h / 2 - 30);
      ctx.textAlign = "left";
    }
  }

  paint(ghost.title, () => {
    const { font, lines, y } = layout.titleBlock;
    setFont(ctx, 700, font.size);
    ctx.fillStyle = palette.title;
    lines.forEach((line, index) => ctx.fillText(line, X, y + index * font.line));
  });

  if (layout.subBlock) {
    paint(ghost.subtitle, () => {
      const { font, items, y, bullets } = layout.subBlock;
      setFont(ctx, 400, font.size);
      let row = y;
      items.forEach((lines) => {
        if (bullets) {
          ctx.fillStyle = palette.bullet;
          ctx.beginPath();
          ctx.arc(X + 8, row + font.size * 0.58, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = palette.sub;
        lines.forEach((line, index) => ctx.fillText(line, bullets ? X + 40 : X, row + index * font.line));
        row += lines.length * font.line + (bullets ? font.line * 0.35 : 0);
      });
    });
  }

  if (layout.tagBlock) {
    paint(ghost.tag, () => {
      const { y, width, text } = layout.tagBlock;
      ctx.fillStyle = direction.color;
      roundRect(ctx, X, y, width, 54, 16);
      ctx.fill();
      setFont(ctx, 500, 30);
      ctx.fillStyle = palette.tagText;
      ctx.textBaseline = "middle";
      ctx.fillText(text, X + 22, y + 28);
      ctx.textBaseline = "top";
    });
  }

  if (layout.qr) {
    const top = Math.max(layout.textBottom + 50, 600);
    setFont(ctx, 500, 26);
    const w = ctx.measureText(layout.qr.label).width + 36;
    ctx.fillStyle = tone === "milk" ? "#1a3dee" : "#ffffff";
    roundRect(ctx, X + (340 - w) / 2, top - 22, w, 44, 22);
    ctx.fill();
    drawQr(ctx, layout.qr, X, top + 12, 340);
    ctx.fillStyle = tone === "milk" ? "#ffffff" : "#1a3dee";
    ctx.textBaseline = "middle";
    ctx.fillText(layout.qr.label, X + (340 - w) / 2 + 18, top);
    ctx.textBaseline = "top";
  }
}

const imageCache = new Map();
export function loadCached(src) {
  if (!imageCache.has(src)) {
    imageCache.set(
      src,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Не удалось загрузить элемент шаблона. Проверьте интернет и попробуйте ещё раз."));
        image.src = src;
      }),
    );
  }
  return imageCache.get(src);
}

export const badgeSources = {
  badgeWhite: asset("assets/social/badge-white.png"),
  badgeBlue: asset("assets/social/badge-blue.png"),
};
