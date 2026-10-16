import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import { MorphIcon } from "morphicons/react";
import { ColorPanels, MeshGradient } from "@paper-design/shaders-react";

const assetPath = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;
const heroAsset = (filename) => assetPath(`/assets/hero/${filename}`);
const rasterAsset = (filename) => assetPath(`/assets/brandbook/raster/${filename}`);
const logoAsset = (filename) => assetPath(`/assets/logos/${filename}`);
const regimeSignAsset = (filename) => assetPath(`/assets/regime-signs/${filename}`);
const subsidiaryAsset = (filename) => assetPath(`/assets/subsidiaries/${filename}`);
const madeSignAsset = (filename) => assetPath(`/assets/made-signs/${filename}`);

const ICONS = {
  arrowLeft: "M15 6l-6 6 6 6M9 12h12",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  arrowRight: "M9 6l6 6-6 6M3 12h12",
  check: "M5 12l4 4L19 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M6 15l6-6 6 6",
  navChevronDown: "M1 7.5l11 9 11-9",
  navChevronUp: "M1 16.5l11-9 11 9",
  close: "M6 6l12 12M18 6L6 18",
  copy: "M8 8h10v12H8zM6 4h10v12",
  download: "M12 3v12M7 10l5 5 5-5M5 21h14",
  menu: "M4 7h16M4 12h16M4 17h16",
};

const LOTUS_MARK_PATHS = [
  "M74.5,25.07c-1.16-8.38-10.15-13.85-10.15-13.85,0,0,3.98,5.24,5.04,11.42.94,5.46-.59,9.25-.59,9.25,0,0-1.82-8.47-8.52-15.58-5.3-5.63-13.95-9.31-13.95-9.31,0,0-3.81,13.79,6.86,27.69-2.21-1.58-4.65-2.83-7.23-3.7-5.29-1.76-11.99-.96-11.99-.96,0,0,4.44,13.32,21.31,17.41-11.15-7.84-14.44-14.65-14.44-14.65,0,0,3.25.27,8.38,2.59,3.39,1.53,11.85,6.17,19.96,11.11-3.11-2.66-7.84-6.83-10.72-10.28-8.88-10.6-5.99-21.07-5.99-21.07,0,0,5.25,2.76,9.64,9.2,2.89,4.24,6.85,15.17,6.85,15.17,0,0,6.95-4.2,5.53-14.42",
  "M108.54,46.15c-4.84-1.36-9.8-2.28-14.81-2.73,0,0,4.25-.83,9.28-1.3,7.94-.74,15,1.38,15,1.38-.46,1.78-1.1,3.5-1.93,5.14,1.03-.48,2.01-1.05,2.93-1.71,3.61-2.65,3.82-5.6,3.82-5.6,0,0-6.18-3.39-15.75-2.35-.27.03-.81.16-.81.16.58-.28,1.13-.62,1.64-1.01,3.16-2.53,5.41-6.02,6.41-9.95,0,0-6.92-.88-12.24.27-10.36,2.25-13.88,10.65-13.88,10.65,0,0,5.33-3.83,8.95-5.08,4.35-1.51,8.91-1.41,8.91-1.41,0,0-4,5.88-11.78,8.29-5.28,1.62-11.14,2.1-11.14,2.1,0,0,3.17-12.91,18.8-16.83,9.45-2.36,23.15.27,23.15.27,0,0-16.28-8.38-30.69-1.62,9.81-10.52,2.4-24.82,2.4-24.82,0,0-9.76,1.91-15.87,7.35-5.18,4.62-6.73,10.92-5.8,14.55,0,0,2.26-4.39,7.09-9.1,4.14-4.02,9.15-6.72,9.15-6.72,0,0,1.77,10.26-2.69,20.59-7.07,16.4-16.26,21.16-16.26,21.16,0,0,17.13-1.92,27.76.7,8.96,2.2,13.34,5.39,13.34,5.39,0,0-13.04,9.02-34.3,4.5-14.2-3.02-21.23-8.58-21.23-8.58,0,0,10.59,10.82,27.59,13.85,27.83,4.93,36.94-8.4,36.94-8.4,0,0-5.35-6.64-13.99-9.15",
  "M35.29,65.48c7.07-.11,14.79-2.23,14.79-2.23,0,0-4.27,2.92-6.27,3.81-2.13.95-4.25,2.36-8.96,1.81-6.64-.77-10.87-3.67-14.06-5.81,0,0,4.06,2.56,14.49,2.41",
  "M32.67,58.81c-9.47-3.21-14.93-8.08-18.58-12.52,0,0,9.16,3.21,18.8,4.97,7.93,1.44,18.56,4.73,24.02,9.47-4.18-7.57-13.09-12.97-24.66-14.45C7.25,43.07,1.17,36.9,0,35.83c-.02,0,0,0,0,0,1.23,3.74,7.36,19.8,23.03,24.91,12.74,4.15,28.38.69,28.38.69,0,0-7.75,1.11-18.76-2.63",
];

const NBSP = "\u00a0";
const HANGING_WORDS = [
  "а",
  "в",
  "во",
  "и",
  "к",
  "ко",
  "о",
  "об",
  "обо",
  "с",
  "со",
  "у",
  "от",
  "до",
  "за",
  "из",
  "изо",
  "на",
  "над",
  "под",
  "по",
  "при",
  "про",
  "для",
  "без",
  "между",
  "через",
  "перед",
  "или",
  "но",
  "же",
  "ли",
  "бы",
  "не",
  "ни",
  "как",
  "что",
  "АО",
  "ДО",
  "ДЗО",
  "КРДВ",
  "QR",
  "TT",
  "RGB",
  "HEX",
  "CMYK",
];

const hangingPattern = new RegExp(`(^|[\\s([{«„])(${HANGING_WORDS.join("|")})\\s+`, "giu");

function typograf(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\s+/g, " ")
    .replace(/(^|[\s([{«„])"([^"]+?)"/giu, "$1«$2»")
    .replace(/(\d)\s(?=\d{3}(?:\D|$))/g, `$1${NBSP}`)
    .replace(/(\d)\s*[xх×]\s*(\d)/giu, "$1×$2")
    .replace(/(№)\s+/giu, `$1${NBSP}`)
    .replace(hangingPattern, `$1$2${NBSP}`)
    .replace(/(\d)\s+(?=(?:мм|см|м²|м|г\/м²|г|кг|pt|%|₽|руб\.?|год|года|годы|ч|мин)\b)/giu, `$1${NBSP}`)
    .replace(/\s+—\s+/g, `${NBSP}— `);
}

const t = typograf;
// Подписи в карточках — без точки в конце.
const noDot = (text) => (typeof text === "string" ? text.replace(/\.\s*$/, "") : text);

// Плитки палитры: цвета и фотографии. area — [колонка с, колонка по, ряд с, ряд по] в сетке из 12 колонок.
const primaryPalette = [
  { name: "Дальневосточный синий", hex: "#0056a2", rgb: "0-86-162", cmyk: "100-75-00-00", area: [1, 4, 1, 2] },
  { name: "Голубой", hex: "#22a8e0", rgb: "34-168-225", cmyk: "72-15-00-00", area: [4, 7, 1, 2] },
  { photo: "palette-ocean-kling25.webp", video: "palette-ocean-kling25.mp4", alt: "Подводный мир", area: [7, 9, 1, 3] },
  { name: "Светло-синий", hex: "#9ec6eb", rgb: "158-198-235", cmyk: "24-13-00-00", area: [9, 13, 1, 2] },
  { name: "Ледяной голубой", hex: "#d4e6fa", rgb: "212-230-250", cmyk: "15-5-00-00", area: [9, 13, 2, 3] },
  { name: "Темно-синий", hex: "#001d37", rgb: "0-30-55", cmyk: "100-84-47-58", area: [1, 4, 2, 3] },
  { name: "Глубокий синий", hex: "#0c5082", rgb: "12-80-130", cmyk: "100-73-24-9", area: [4, 7, 2, 3] },
  { name: "Красный акцент", hex: "#de2327", rgb: "222-35-39", cmyk: "5-100-100-00", area: [1, 4, 3, 4] },
  { photo: "palette-photo-sunset.webp", video: "palette-sunset-kling25.mp4", alt: "Закат над сопками", area: [10, 13, 3, 4], position: "100% 60%" },
  { name: "Розовый", hex: "#ef8a91", rgb: "239-138-145", cmyk: "0-42-39-6", area: [4, 7, 3, 4], proposal: true },
  { name: "Светло-розовый", hex: "#fce8ea", rgb: "252-232-234", cmyk: "0-8-7-1", area: [7, 10, 3, 4], proposal: true },
];

const colorHeroTiles = [
  { id: "tile-blue", color: "#0056a2" },
  { id: "tile-sky", color: "#22a8e0" },
  { id: "tile-red", color: "#de2327" },
  { id: "tile-dark", color: "#001d37" },
];
const colorHeroGridStates = [
  {
    x: 50,
    y: 50,
  },
  {
    x: 24,
    y: 72,
  },
  {
    x: 78,
    y: 30,
  },
  {
    x: 35,
    y: 34,
  },
  {
    x: 68,
    y: 76,
  },
];
const colorHeroHoldDuration = 1;

function smoothStepEase(progress) {
  return progress * progress * (3 - 2 * progress);
}

function buildColorHeroRects(state) {
  const { x, y } = state;

  return [
    { left: 0, top: 0, width: x, height: y },
    { left: x, top: 0, width: 100 - x, height: y },
    { left: 0, top: y, width: x, height: 100 - y },
    { left: x, top: y, width: 100 - x, height: 100 - y },
  ];
}

const colorHeroTileStates = colorHeroGridStates.map(buildColorHeroRects);

const secondaryPalette = [
  { name: "Арктический изумрудный", hex: "#003b39", rgb: "0-59-57", cmyk: "91-47-61-59", area: [1, 6, 1, 2] },
  { photo: "palette-green-aurora-sky.webp", video: "palette-green-aurora-sky.mp4", alt: "Северное сияние", area: [6, 9, 1, 3] },
  { name: "Изумрудный", hex: "#308d86", rgb: "48-141-134", cmyk: "78-24-49-7", area: [9, 13, 1, 3] },
  { name: "Глубокий изумрудный", hex: "#0a5c57", rgb: "10-92-87", cmyk: "87-38-58-35", area: [1, 6, 2, 3] },
  { name: "Светлый арктический", hex: "#cce0e6", rgb: "204-224-230", cmyk: "24-5-10-00", area: [1, 7, 3, 4] },
  { name: "Ледяной арктический", hex: "#e4f0f2", rgb: "228-240-242", cmyk: "13-2-6-00", area: [7, 10, 3, 4] },
  { photo: "palette-arctic-aurora-sky.webp", video: "palette-arctic-aurora-sky.mp4", alt: "Северное сияние над горизонтом", area: [10, 13, 3, 4] },
];

const regimes = [
  { short: "ТОР", title: "Территории опережающего развития", color: "#53184f" },
  { short: "СПВ", title: "Свободный порт Владивосток", color: "#223e9a" },
  { short: "КОРФ", title: "Курильские острова Российской Федерации", color: "#f45858" },
  { short: "САР", title: "Специальный административный район", color: "#17846f" },
  { short: "АЗРФ", title: "Арктическая зона Российской Федерации", color: "#1ba7df" },
  { short: "ИНТЦ", title: "Инновационный научно-технологический центр", color: "#0aaba5" },
  { short: "Гектар", title: "Программа гектар", color: "#21ad49" },
  { short: "Работа", title: "Программа работа", color: "#001d37" },
  { short: "Ипотека", title: "Ипотека 2%", color: "#5884c4" },
];

const subsidiaryHeroLogos = [
  { title: "КРДВ Амурская", file: "subsidiary-amurskaya-ru-horizontal.svg" },
  { title: "КРДВ Бурятия", file: "subsidiary-buryatia-ru-horizontal.svg" },
  { title: "КРДВ Камчатка", file: "subsidiary-kamchatka-ru-horizontal.svg" },
  { title: "КРДВ Мурманск", file: "subsidiary-murmansk-ru-horizontal.svg" },
  { title: "КРДВ Приморье", file: "subsidiary-primorye-ru-horizontal.svg" },
  { title: "КРДВ Сахалин и Курилы", file: "subsidiary-sakhalin-kurils-ru-horizontal.svg" },
  { title: "КРДВ Забайкалье", file: "subsidiary-zabaikalye-ru-horizontal.svg" },
  { title: "КРДВ Хабаровск", file: "subsidiary-khabarovsk-ru-horizontal.svg" },
  { title: "КРДВ Чукотка", file: "subsidiary-chukotka-ru-horizontal.svg" },
  { title: "КРДВ Якутия", file: "subsidiary-yakutia-ru-horizontal.svg" },
];

const regimeNotes = {
  ТОР: "Используется для коммуникаций о территориях опережающего развития: промышленные площадки, инфраструктура, резиденты и меры поддержки.",
  СПВ: "Маркирует материалы о свободном порте Владивосток, портовой инфраструктуре, логистике и международных сценариях.",
  КОРФ: "Подходит для коммуникаций о Курильских островах Российской Федерации и связанных проектах развития.",
  САР: "Используется в материалах о специальных административных районах и правовых режимах для бизнеса.",
  АЗРФ: "Выделяет арктическую повестку, Северный морской путь, инфраструктуру и проекты в Арктической зоне.",
  ИНТЦ: "Маркирует инновационные, научные и технологические проекты в системе поддержки КРДВ.",
  Гектар: "Применяется в сообщениях о земельной программе и возможностях развития территорий.",
  Работа: "Помогает быстро считывать кадровые, карьерные и образовательные коммуникации.",
  Ипотека: "Отдельный маркер для льготных ипотечных программ и жилищных сценариев.",
};

const regimeColorCoding = ["ТОР", "СПВ", "КОРФ", "САР", "АЗРФ", "ИНТЦ", "Ипотека", "Гектар", "Работа"]
  .map((short) => regimes.find((item) => item.short === short))
  .filter(Boolean);

function hexToRgbString(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255].join("-");
}

// CMYK рассчитан из RGB автоматически — перед печатью сверить с типографией.
function hexToCmykString(hex) {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => channel / 255);
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return "0-0-0-100";
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((part) => Math.round(part * 100)).join("-");
}

const regimePaletteTiles = regimeColorCoding.map((item, index) => ({
  name: item.short,
  hex: item.color,
  rgb: hexToRgbString(item.color),
  cmyk: hexToCmykString(item.color),
  area: [(index % 3) * 4 + 1, (index % 3) * 4 + 5, Math.floor(index / 3) + 1, Math.floor(index / 3) + 2],
}));

const downloadResources = {
  logos: {
    title: "Логотип АО «КРДВ»",
    description: "Общий архив с основными версиями логотипа.",
    url: "https://disk.yandex.ru/client/aa/d_ZPWFtN40OnCecA/",
  },
  subsidiaryLogos: {
    title: "Логотипы дочерних обществ",
    description: "Архив с логотипами ДО.",
    url: "https://disk.yandex.ru/d/YWZuuTkhvI0ijQ",
  },
  regimeLogos: {
    title: "Логотипы преференциальных режимов",
    description: "Архив со знаками и логотипами режимов.",
    url: "https://disk.yandex.ru/d/MKhMUbEWmLDgtQ",
  },
  businessCards: {
    title: "Шаблон стандартных визиток",
    description: "Исходники базовой визитки АО «КРДВ» для русской и английской версии.",
    url: "https://disk.yandex.ru/client/aa/d_RERxtjr3Ta2Ijw/",
  },
  businessCardsQr: {
    title: "Шаблон визиток с QR",
    description: "Макеты визиток, где контактный блок дополнен отдельной QR-зоной.",
    url: "https://disk.yandex.ru/d/Lx5eljRnfTYw7w",
  },
  businessCardsSubsidiary: {
    title: "Шаблон визиток ДО",
    description: "Комплект для адаптации визиток под фирменные знаки дочерних обществ.",
    url: "https://disk.yandex.ru/d/-3bHMVTnX4taLg",
  },
  subsidiaryLetterheads: {
    title: "Шаблон бланков ДО",
    description: "Фирменные бланки дочерних обществ с реквизитной частью.",
    url: "https://disk.yandex.ru/d/B70KKs8icO9yMA",
  },
  awards: {
    title: "Шаблон наградных документов",
    description: "Макеты грамот, благодарностей и писем с зонами фольгирования.",
    url: "https://disk.yandex.ru/d/CPo-pkUooJU_Lg",
  },
  madeSigns: {
    title: "Знак «Сделано в ТОР СПВ»",
    description: "Общий архив с версиями товарного знака.",
    url: "https://disk.yandex.ru/d/hwgUiBntRmelpA",
  },
  hectareBrandbook: {
    title: "Брендбук «Гектар»",
    description: "Руководство по использованию фирменного стиля",
    url: "https://disk.yandex.ru/i/58D6TDp8-ikn1w",
  },
  intcSite: {
    title: "Сайт ИНТЦ «Русский»",
    description: "Подробнее о проекте и его фирменном стиле — на сайте ИНТЦ «Русский».",
    url: "https://iostrov.ru/",
    action: "Перейти на сайт",
  },
  ma2030Brandbook: {
    title: "Брендбук «Муравьёв-Амурский 2030»",
    description: "Руководство по использованию фирменного стиля",
    url: "https://disk.yandex.ru/d/dWSOvini_jmUzg",
  },
  socialPortal: {
    title: "Портал для оформления постов",
    description: "Готовые шаблоны и наложения в одном месте — оформите пост без дизайнера",
    // Ссылка появится после запуска портала; пока карточка неактивна
    url: "",
    action: "Перейти на портал",
    pending: "Ссылка появится после запуска портала",
  },
  socialEmoji: {
    title: "Эмодзи КРДВ в Telegram",
    description: "Добавьте фирменный набор себе в Telegram и используйте эмодзи в тексте публикаций",
    url: "https://t.me/addemoji/ERDC_emoji",
    action: "Добавить набор в Telegram",
  },
  socialGuidePdf: {
    title: "Гайд в PDF",
    description: "Предыдущая редакция гайда по соцсетям · PDF, 2,4 МБ",
    url: assetPath("/assets/social/social-guide-previous.pdf"),
    action: "Скачать PDF",
  },
  socialGuide: {
    title: "Гайд по социальным сетям",
    description: "Материалы и правила оформления социальных сетей.",
    url: "https://disk.yandex.ru/d/ORusuBrCiRIEdw",
  },
};

const allDownloadResourceKeys = [
  "logos",
  "subsidiaryLogos",
  "regimeLogos",
  "businessCards",
  "businessCardsQr",
  "businessCardsSubsidiary",
  "subsidiaryLetterheads",
  "awards",
  "madeSigns",
  "socialGuide",
];

const logoFormats = ["svg", "png", "jpg", "pdf", "eps"];
const regimeSignFormats = ["svg", "png", "pdf"];
const subsidiaryFormats = ["svg", "png", "pdf"];
const madeSignFormats = ["svg", "png"];

const ttNormsFontFiles = [
  { label: "Thin", weight: 100, style: "normal", file: "TT-Norms-Pro-Thin.ttf" },
  { label: "Thin Italic", weight: 100, style: "italic", file: "TT-Norms-Pro-Thin-Italic.ttf" },
  { label: "ExtraLight", weight: 200, style: "normal", file: "TT-Norms-Pro-ExtraLight.ttf" },
  { label: "ExtraLight Italic", weight: 200, style: "italic", file: "TT-Norms-Pro-ExtraLight-Italic.ttf" },
  { label: "Light", weight: 300, style: "normal", file: "TT-Norms-Pro-Light.ttf" },
  { label: "Light Italic", weight: 300, style: "italic", file: "TT-Norms-Pro-Light-Italic.ttf" },
  { label: "Regular", weight: 400, style: "normal", file: "TT-Norms-Pro-Regular.ttf" },
  { label: "Italic", weight: 400, style: "italic", file: "TT-Norms-Pro-Italic.ttf" },
  { label: "Normal", weight: 450, style: "normal", file: "TT-Norms-Pro-Normal.ttf" },
  { label: "Normal Italic", weight: 450, style: "italic", file: "TT-Norms-Pro-Normal-Italic.ttf" },
  { label: "Medium", weight: 500, style: "normal", file: "TT-Norms-Pro-Medium.ttf" },
  { label: "Medium Italic", weight: 500, style: "italic", file: "TT-Norms-Pro-Medium-Italic.ttf" },
  { label: "DemiBold", weight: 600, style: "normal", file: "TT-Norms-Pro-DemiBold.ttf" },
  { label: "DemiBold Italic", weight: 600, style: "italic", file: "TT-Norms-Pro-DemiBold-Italic.ttf" },
  { label: "Bold", weight: 700, style: "normal", file: "TT-Norms-Pro-Bold.ttf" },
  { label: "Bold Italic", weight: 700, style: "italic", file: "TT-Norms-Pro-Bold-Italic.ttf" },
  { label: "ExtraBold", weight: 800, style: "normal", file: "TT-Norms-Pro-ExtraBold.ttf" },
  { label: "ExtraBold Italic", weight: 800, style: "italic", file: "TT-Norms-Pro-ExtraBold-Italic.ttf" },
  { label: "Black", weight: 900, style: "normal", file: "TT-Norms-Pro-Black.ttf" },
  { label: "Black Italic", weight: 900, style: "italic", file: "TT-Norms-Pro-Black-Italic.ttf" },
  { label: "ExtraBlack", weight: 950, style: "normal", file: "TT-Norms-Pro-ExtraBlack.ttf" },
  { label: "ExtraBlack Italic", weight: 950, style: "italic", file: "TT-Norms-Pro-ExtraBlack-Italic.ttf" },
];

const ttTsarsFontFiles = [
  { label: "Regular", weight: 400, style: "normal", file: "TT-Tsars-A-Regular.woff2" },
  { label: "Bold", weight: 700, style: "normal", file: "TT-Tsars-A-Bold.woff2" },
];

const fontFamilies = [
  {
    id: "norms",
    title: "TT Norms Pro",
    role: "Основная фирменная гарнитура",
    cssFamily: "TT Norms Pro",
    sample: "Единый стиль делает систему понятной",
    description: "Гротеск для заголовков, наборного текста, презентаций, рекламно-информационных материалов и интерфейсов.",
    defaultFile: "TT-Norms-Pro-DemiBold.ttf",
    files: ttNormsFontFiles,
  },
  {
    id: "serif",
    title: "TT Norms Pro Serif",
    role: "Акцидентная фирменная пара",
    cssFamily: "Georgia",
    sample: "Территория будущего начинается с ясной коммуникации",
    description: "Семейство используется как второй, преимущественно акцидентный элемент шрифтовой пары.",
    unavailable: "Для Serif-семейства используется отдельный лицензионный пакет TypeType.",
    files: [],
  },
  {
    id: "tsars",
    title: "TT Tsars A",
    role: "Наградные документы",
    cssFamily: "TT Tsars",
    sample: "Грамота за развитие территорий",
    description: "Гарнитура для благодарностей, благодарственных писем, почетных грамот и других наградных документов.",
    defaultFile: "TT-Tsars-A-Regular.woff2",
    files: ttTsarsFontFiles,
  },
];

const logoVariants = {
  "ru-horizontal": {
    title: "Русская горизонтальная версия",
    role: "Дополнительная версия",
    description: "Используется в русскоязычных материалах, когда есть достаточно горизонтального пространства и логотип должен читаться как главный идентификатор.",
    preview: "krdv-logo-ru-horizontal.svg",
    kind: "horizontal",
    files: {
      svg: "krdv-logo-ru-horizontal.svg",
      png: "krdv-logo-ru-horizontal.png",
      jpg: "krdv-logo-ru-horizontal.jpg",
      pdf: "krdv-logo-ru-horizontal.pdf",
      eps: "krdv-logo-ru-horizontal.eps",
    },
  },
  "ru-square": {
    title: "Русская вертикальная версия",
    role: "Основная версия",
    description: "Подходит для компактных зон, вертикальных композиций, карточек и носителей, где горизонтальная версия теряет масштаб.",
    preview: "krdv-logo-ru-square.svg",
    kind: "square",
    files: {
      svg: "krdv-logo-ru-square.svg",
      png: "krdv-logo-ru-square.png",
      jpg: "krdv-logo-ru-square.jpg",
      pdf: "krdv-logo-ru-square.pdf",
      eps: "krdv-logo-ru-square.eps",
    },
  },
  "en-horizontal": {
    title: "Английская горизонтальная версия",
    role: "Дополнительная международная версия",
    description: "Используется для англоязычных ресурсов, международных мероприятий и материалов для зарубежной аудитории.",
    preview: "krdv-logo-en-horizontal.svg",
    kind: "horizontal",
    files: {
      svg: "krdv-logo-en-horizontal.svg",
      png: "krdv-logo-en-horizontal.png",
      jpg: "krdv-logo-en-horizontal.jpg",
      pdf: "krdv-logo-en-horizontal.pdf",
      eps: "krdv-logo-en-horizontal.eps",
    },
  },
  "en-square": {
    title: "Английская вертикальная версия",
    role: "Основная международная версия",
    description: "Используется в международных коммуникациях, когда нужен компактный вертикальный знак с англоязычным написанием.",
    preview: "krdv-logo-en-square.svg",
    kind: "square",
    files: {
      svg: "krdv-logo-en-square.svg",
      png: "krdv-logo-en-square.png",
      jpg: "krdv-logo-en-square.jpg",
      pdf: "krdv-logo-en-square.pdf",
      eps: "krdv-logo-en-square.eps",
    },
  },
  mark: {
    title: "Фирменный знак лотоса",
    role: "Знак",
    description: "Самостоятельное использование знака требует согласования. В системе он показан как часть состава логотипа и как отдельный графический источник.",
    preview: "krdv-mark-lotus.svg",
    kind: "mark",
    inlineDownloads: true,
    files: {
      svg: "krdv-mark-lotus.svg",
    },
  },
};

const subsidiaryVersionLabels = {
  "ru-horizontal": "Русская горизонтальная версия",
  "ru-vertical": "Русская вертикальная версия",
  "en-horizontal": "Английская горизонтальная версия",
  "en-vertical": "Английская вертикальная версия",
};

const subsidiaryLogos = [
  { set: "ru-horizontal", slug: "amurskaya", title: "КРДВ Амурская" },
  { set: "ru-horizontal", slug: "buryatia", title: "КРДВ Бурятия" },
  { set: "ru-horizontal", slug: "murmansk", title: "КРДВ Мурманск" },
  { set: "ru-horizontal", slug: "primorye", title: "КРДВ Приморье" },
  { set: "ru-horizontal", slug: "zabaikalye", title: "КРДВ Забайкалье" },
  { set: "ru-horizontal", slug: "kamchatka", title: "КРДВ Камчатка" },
  { set: "ru-horizontal", slug: "sakhalin-kurils", title: "КРДВ Сахалин и Курилы" },
  { set: "ru-horizontal", slug: "khabarovsk", title: "КРДВ Хабаровск" },
  { set: "ru-horizontal", slug: "chukotka", title: "КРДВ Чукотка" },
  { set: "ru-horizontal", slug: "yakutia", title: "КРДВ Якутия" },
  { set: "ru-vertical", slug: "amurskaya", title: "КРДВ Амурская" },
  { set: "ru-vertical", slug: "buryatia", title: "КРДВ Бурятия" },
  { set: "ru-vertical", slug: "murmansk", title: "КРДВ Мурманск" },
  { set: "ru-vertical", slug: "primorye", title: "КРДВ Приморье" },
  { set: "ru-vertical", slug: "khabarovsk", title: "КРДВ Хабаровск" },
  { set: "ru-vertical", slug: "sakhalin-kurils", title: "КРДВ Сахалин и Курилы" },
  { set: "ru-vertical", slug: "kamchatka", title: "КРДВ Камчатка" },
  { set: "ru-vertical", slug: "zabaikalye", title: "КРДВ Забайкалье" },
  { set: "ru-vertical", slug: "chukotka", title: "КРДВ Чукотка" },
  { set: "ru-vertical", slug: "yakutia", title: "КРДВ Якутия" },
  { set: "en-horizontal", slug: "amurskaya", title: "FEDC Amurskaya" },
  { set: "en-horizontal", slug: "buryatia", title: "FEDC Buryatia" },
  { set: "en-horizontal", slug: "murmansk", title: "FEDC Murmansk" },
  { set: "en-horizontal", slug: "primorye", title: "FEDC Primorye" },
  { set: "en-horizontal", slug: "khabarovsk", title: "FEDC Khabarovsk" },
  { set: "en-horizontal", slug: "sakhalin-kurils", title: "FEDC Sakhalin and the Kurils" },
  { set: "en-horizontal", slug: "kamchatka", title: "FEDC Kamchatka" },
  { set: "en-horizontal", slug: "zabaikalye", title: "FEDC Zabaikalye" },
  { set: "en-horizontal", slug: "chukotka", title: "FEDC Chukotka" },
  { set: "en-horizontal", slug: "yakutia", title: "FEDC Yakutia" },
  { set: "en-vertical", slug: "amurskaya", title: "FEDC Amurskaya" },
  { set: "en-vertical", slug: "buryatia", title: "FEDC Buryatia" },
  { set: "en-vertical", slug: "murmansk", title: "FEDC Murmansk" },
  { set: "en-vertical", slug: "primorye", title: "FEDC Primorye" },
  { set: "en-vertical", slug: "khabarovsk", title: "FEDC Khabarovsk" },
  { set: "en-vertical", slug: "sakhalin-kurils", title: "FEDC Sakhalin and the Kurils" },
  { set: "en-vertical", slug: "kamchatka", title: "FEDC Kamchatka" },
  { set: "en-vertical", slug: "zabaikalye", title: "FEDC Zabaikalye" },
  { set: "en-vertical", slug: "chukotka", title: "FEDC Chukotka" },
  { set: "en-vertical", slug: "yakutia", title: "FEDC Yakutia" },
].map((item) => {
  const [lang, orientation] = item.set.split("-");
  const base = `subsidiary-${item.slug}-${lang}-${orientation}`;

  return {
    ...item,
    orientation,
    versionLabel: subsidiaryVersionLabels[item.set],
    preview: `${base}.svg`,
    files: {
      svg: `${base}.svg`,
      png: `${base}.png`,
      pdf: `${base}.pdf`,
    },
  };
});

// Ширина каждого SVG в единицах исходника. Лотос во всех файлах одного размера (≈575 ед.),
// поэтому все логотипы ДО выводятся в одном масштабе: ширина = единицы × общий коэффициент (--k в CSS).
const subsidiaryLogoUnits = {
  "amurskaya-en-horizontal": 1102,
  "amurskaya-en-vertical": 702,
  "amurskaya-ru-horizontal": 1033,
  "amurskaya-ru-vertical": 629,
  "buryatia-en-horizontal": 989,
  "buryatia-en-vertical": 606,
  "buryatia-ru-horizontal": 1004,
  "buryatia-ru-vertical": 618,
  "chukotka-en-horizontal": 1028,
  "chukotka-en-vertical": 628,
  "chukotka-ru-horizontal": 1004,
  "chukotka-ru-vertical": 618,
  "kamchatka-en-horizontal": 1096,
  "kamchatka-en-vertical": 697,
  "kamchatka-ru-horizontal": 1051,
  "kamchatka-ru-vertical": 648,
  "khabarovsk-en-horizontal": 1112,
  "khabarovsk-en-vertical": 712,
  "khabarovsk-ru-horizontal": 1081,
  "khabarovsk-ru-vertical": 678,
  "murmansk-en-horizontal": 1057,
  "murmansk-en-vertical": 657,
  "murmansk-ru-horizontal": 1050,
  "murmansk-ru-vertical": 644,
  "primorye-en-horizontal": 1006,
  "primorye-en-vertical": 606,
  "primorye-ru-horizontal": 1042,
  "primorye-ru-vertical": 639,
  "sakhalin-kurils-en-horizontal": 1544,
  "sakhalin-kurils-en-vertical": 787,
  "sakhalin-kurils-ru-horizontal": 1373,
  "sakhalin-kurils-ru-vertical": 970,
  "yakutia-en-horizontal": 989,
  "yakutia-en-vertical": 606,
  "yakutia-ru-horizontal": 1004,
  "yakutia-ru-vertical": 618,
  "zabaikalye-en-horizontal": 1073,
  "zabaikalye-en-vertical": 673,
  "zabaikalye-ru-horizontal": 1107,
  "zabaikalye-ru-vertical": 704,
};

const subsidiaryLogoSets = subsidiaryLogos.reduce((sets, item) => {
  sets[item.set] = [...(sets[item.set] || []), item];
  return sets;
}, {});

// Карточка региона: все четыре версии (RU/EN × горизонтальная/вертикальная) с кнопками скачивания под каждой.
const subsidiaryRegions = subsidiaryLogos
  .filter((item) => item.set === "ru-horizontal")
  .map((ruItem) => {
    const find = (set, slug = ruItem.slug) => subsidiaryLogos.find((item) => item.set === set && item.slug === slug);
    return {
      slug: ruItem.slug,
      title: ruItem.title,
      enTitle: find("en-horizontal")?.title,
      cells: [
        { label: "RU · горизонтальная", item: find("ru-horizontal") },
        { label: "EN · горизонтальная", item: find("en-horizontal") },
        { label: "RU · вертикальная", item: find("ru-vertical") },
        { label: "EN · вертикальная", item: find("en-vertical") },
      ].filter((cell) => cell.item),
    };
  });

const regimeSignIcons = new Set(["tor", "intc", "sar", "korf", "azrf", "spv"]);
// Ролики при наведении; при замене ролика меняем имя файла, чтобы браузер не взял старый из кэша.
const regimeSignHoverVideos = {
  tor: "regime-tor-hover.mp4",
  spv: "regime-spv-hover.mp4",
  korf: "regime-korf-hover.mp4",
  sar: "regime-sar-hover-v2.mp4",
  azrf: "regime-azrf-hover-v2.mp4",
  intc: "regime-intc-hover-v2.mp4",
};

const regimeSignLogos = [
  { slug: "tor", short: "ТОР", title: "Территории опережающего развития" },
  { slug: "spv", short: "СПВ", title: "Свободный порт Владивосток" },
  { slug: "korf", short: "КОРФ", title: "Курильские острова Российской Федерации" },
  { slug: "sar", short: "САР", title: "Специальный административный район" },
  { slug: "azrf", short: "АЗРФ", title: "Арктическая зона Российской Федерации" },
  { slug: "intc", short: "ИНТЦ", title: "Инновационный научно-технологический центр" },
].map((item) => ({
  ...item,
  color: regimes.find((regime) => regime.short === item.short)?.color || "#050505",
  description: regimeNotes[item.short],
  // Объёмные иконки для превью; файлы для скачивания — исходные векторные знаки.
  preview: regimeSignIcons.has(item.slug) ? `regime-${item.slug}-wide.webp` : `regime-${item.slug}.svg`,
  hasIcon: regimeSignIcons.has(item.slug),
  iconVideo: regimeSignHoverVideos[item.slug] || "",
  files: {
    svg: `regime-${item.slug}.svg`,
    png: `regime-${item.slug}.png`,
    pdf: `regime-${item.slug}.pdf`,
  },
}));

// Товарные знаки: одна карточка — один цвет, внутри русская и английская версии.
const madeSignGroups = [
  {
    id: "tor-spv",
    title: "Сделано в ТОР СПВ",
    prefix: "made-tor-spv",
    variants: [
      { tone: "purple", title: "Фиолетовая версия", langs: ["ru", "en"] },
      { tone: "outline", title: "Черная версия", langs: ["ru", "en"] },
      { tone: "white", title: "Белая версия", langs: ["ru", "en"] },
    ],
  },
  {
    id: "dvia",
    title: "Сделано на Дальнем Востоке и в Арктике",
    prefix: "made-dvia",
    variants: [
      { tone: "purple", title: "Фиолетовая версия", langs: ["ru", "en"] },
      { tone: "outline", title: "Черная версия", langs: ["ru", "en"], version: "-v2" },
      { tone: "white", title: "Белая версия", langs: ["ru", "en"] },
    ],
  },
].map((group) => ({
  ...group,
  variants: group.variants.map((variant) => ({
    ...variant,
    key: `${group.prefix}-${variant.tone}`,
    signs: variant.langs.map((lang) => ({ lang, file: `${group.prefix}-${lang}-${variant.tone}${variant.version || ""}` })),
  })),
}));

// Слайды шаблонов презентаций — показываются листалкой.
const presentationDecks = [
  {
    id: "light",
    title: "Светлый шаблон",
    // Ссылка на файл шаблона — вписать, когда будет (пока кнопка неактивна)
    download: "",
    slides: [
      { title: "Обложка", file: "pres-light-cover-v2.webp" },
      { title: "Таблица и ключевые цифры", file: "pres-light-slide-1.webp" },
      { title: "Карточки услуг", file: "pres-light-slide-2.webp" },
      { title: "Иконки-иллюстрации", file: "pres-light-slide-3.webp" },
    ],
  },
  {
    id: "dark",
    title: "Темный шаблон",
    download: "",
    slides: [
      { title: "Обложка", file: "pres-dark-cover.webp" },
      { title: "Инфографика", file: "pres-dark-slide-1.webp" },
      { title: "Иконки-иллюстрации", file: "pres-dark-slide-2.webp" },
      { title: "Карта и показатели", file: "pres-dark-slide-3.webp" },
    ],
  },
];

// ── Логотип: примеры «можно / нельзя», собранные из исходников (вместо скриншотов из PDF) ──
const logoUsageExamples = [
  { verdict: "yes", preview: { kind: "logo", file: "krdv-logo-ru-square.svg" }, text: "Логотип используется как неделимый блок: знак и написание вместе" },
  { verdict: "no", preview: { kind: "logo", file: "krdv-mark-lotus.svg", width: "34%" }, text: "Знак не используется без текстовой части — его легко спутать со знаками других брендов" },
  { verdict: "no", preview: { kind: "swapText", text: "Дальневосточный\nинвестиционный\nсовет" }, text: "Написание нельзя заменять другим текстом — только «Корпорация развития Дальнего Востока и Арктики»" },
];

const logoBackgroundExamples = [
  { verdict: "yes", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", bg: "#d8e5f6" }, text: "Фирменные цвета и их оттенки с высоким уровнем контраста" },
  { verdict: "yes", preview: { kind: "logo", file: "krdv-logo-ru-square-ondark.svg", bg: "#000000" }, text: "Черный фон — с версией логотипа с белым написанием" },
  { verdict: "yes", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", photo: "photostyle-composition-15.webp", width: "20%", position: "top-left" }, text: "Фотография со светлым однородным участком под логотипом" },
  { verdict: "yes", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", photo: "photostyle-composition-1.webp", position: "plate", plate: true }, text: "Если однородного участка нет — используйте белую плашку" },
  { verdict: "no", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", bg: "#2a64d8" }, text: "Фирменные цвета и оттенки с низким уровнем контраста" },
  { verdict: "no", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", bg: "#b06bff" }, text: "Нефирменные цвета ярких оттенков" },
  { verdict: "no", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", bg: "linear-gradient(115deg, #3cb39a 0%, #6a3fb5 30%, #d43b5b 62%, #f2b84b 100%)" }, text: "Активные цветные паттерны и градиенты" },
  { verdict: "no", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", photo: "photostyle-composition-11.webp", width: "20%", position: "top-left" }, text: "Неоднородный участок фотографии без плашки" },
];

const logoMisuseExamples = [
  { verdict: "no", title: "Старые версии", preview: { kind: "logo", raster: "krdv-logo-old-version.webp", width: "58%" }, text: "Нельзя использовать прежние версии логотипа" },
  { verdict: "no", title: "Цвет", preview: { kind: "logo", file: "krdv-logo-ru-square-misuse-color-v2.svg" }, text: "Нельзя менять цвета знака и написания" },
  { verdict: "no", title: "Пропорции", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", style: { transform: "scaleX(1.45)" } }, text: "Нельзя растягивать, сжимать и искажать пропорции" },
  { verdict: "no", title: "Поворот", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", style: { transform: "rotate(-14deg)" } }, text: "Нельзя поворачивать и наклонять логотип" },
  { verdict: "no", title: "Типографика", preview: { kind: "swapText", text: "КОРПОРАЦИЯ РАЗВИТИЯ\nДАЛЬНЕГО ВОСТОКА\nИ АРКТИКИ", font: "system" }, text: "Нельзя набирать написание другим шрифтом или менять его компоновку" },
  { verdict: "no", title: "Эффекты", preview: { kind: "logo", file: "krdv-logo-ru-square.svg", style: { filter: "drop-shadow(6px 8px 5px rgba(0, 0, 0, 0.38))" } }, text: "Нельзя добавлять тени, обводки, свечение и другие эффекты" },
];

// Кобрендинг: высоты логотипов подобраны так, чтобы знаки выглядели соразмерно.
const cobrandLogos = {
  ministry: { file: "minvostok-logo.webp", alt: "Минвостокразвития России", h: 58 },
  krdv: { file: "krdv-logo-ru-horizontal.svg", alt: "КРДВ", h: 52 },
  hectare: { file: "hectare-logo.svg", alt: "Гектар", h: 30 },
  ma2030: { file: "ma2030-logo.svg", alt: "Муравьёв-Амурский 2030", h: 52 },
};

const cobrandRules = [
  { label: "Порядок", text: "Если в коммуникации есть КРДВ и министерство, логотип министерства всегда стоит первым — слева" },
  { label: "Охранное поле", text: "Расстояние между логотипами не меньше охранного поля x; между ними можно поставить тонкую вертикальную линию" },
  { label: "Соразмерность", text: "Логотипы выравниваются по оптическому весу: ни один не доминирует и не выглядит мельче остальных" },
  { label: "Расположение", text: "Логотипы стоят в один ряд и выравниваются по горизонтальной оси; все — в одной цветовой версии" },
];

const cobrandExamples = [
  { verdict: "yes", preview: { kind: "cobrand", logos: ["ministry", "krdv"], divider: true }, text: "Министерство слева, КРДВ справа, между ними — охранное поле и тонкий разделитель" },
  { verdict: "yes", preview: { kind: "cobrand", logos: ["ministry", "krdv", "ma2030"], divider: true, scale: 0.7 }, text: "Три участника — в один ряд, министерство первым, отступы между логотипами равные" },
];

const LOGO_PETAL_PATH = "m74.38,25.03c-1.16-8.38-10.13-13.83-10.13-13.83,0,0,3.97,5.23,5.03,11.41.94,5.45-.59,9.24-.59,9.24,0,0-1.82-8.46-8.51-15.56-5.3-5.62-13.93-9.3-13.93-9.3,0,0-3.8,13.78,6.86,27.65-2.21-1.58-4.64-2.82-7.22-3.69-5.29-1.76-11.97-.96-11.97-.96,0,0,4.44,13.3,21.28,17.38-11.14-7.85-14.42-14.62-14.42-14.62,0,0,3.23.27,8.37,2.59,3.38,1.53,11.83,6.16,19.93,11.09-3.1-2.66-7.82-6.82-10.7-10.26-8.86-10.58-5.98-21.03-5.98-21.03,0,0,5.24,2.75,9.63,9.16,2.89,4.23,6.84,15.14,6.84,15.14,0,0,6.93-4.19,5.52-14.4";

const madeSignLangLabels = { ru: "RU", en: "EN" };
const madeSignLangNames = { ru: "русская", en: "английская" };

const madeBrandingImages = [
  { title: "Упаковка резидента", caption: "Знак размещается как подтверждение происхождения продукции.", file: "made-branding-1.webp" },
  { title: "Пищевая продукция", caption: "Маркировка работает на этикетке и поддерживает доверие к производителю.", file: "made-branding-2.webp" },
  { title: "Серия упаковок", caption: "Единый знак помогает связать несколько товаров в одну линейку.", file: "made-branding-3.webp" },
  { title: "Бирка товара", caption: "Малый носитель сохраняет знак читаемым без лишней графики.", file: "made-branding-4.webp" },
  { title: "Потребительская тара", caption: "Размещение подбирается под форму и контраст упаковки.", file: "made-branding-5.webp" },
  { title: "Полка продукции", caption: "Серийное нанесение делает маркировку заметной в группе товаров.", file: "made-branding-6.webp" },
];

const photostyleImages = {
  infrastructure: [
    { title: "Ледокол и Северный морской путь", caption: "Инфраструктурный кадр для тем Арктики и транспортного развития.", file: "photostyle-composition-1.webp" },
    { title: "Командный кадр", caption: "Сюжет единства, общих целей и прогресса.", file: "photostyle-composition-2.webp" },
    { title: "Промышленный объект", caption: "Работающее предприятие как подтверждение результата.", file: "photostyle-composition-3.webp" },
    { title: "Проект на территории", caption: "Региональный проект с понятным контекстом места.", file: "photostyle-composition-4.webp" },
    { title: "Технологичное производство", caption: "Производственная среда и выращивание продукции.", file: "photostyle-composition-11.webp" },
    { title: "Инфраструктура города", caption: "Мост, портовый и городской масштаб Дальнего Востока.", file: "photostyle-composition-12.webp" },
  ],
  events: [
    { title: "Деловой стенд", caption: "Коммуникационный кадр с выставки или форума.", file: "photostyle-composition-6.webp" },
    { title: "Вовлеченная аудитория", caption: "Событие с участниками, которые включены в процесс.", file: "photostyle-composition-7.webp" },
  ],
  nature: [
    { title: "Полярное сияние", caption: "Захватывающий природный кадр Арктики.", file: "photostyle-composition-10.webp" },
    { title: "Вулканический пейзаж", caption: "Достоверный региональный пейзаж Дальнего Востока.", file: "photostyle-composition-9.webp" },
    { title: "Арктический маршрут", caption: "Природа и маршрут в условиях северного региона.", file: "photostyle-composition-15.webp" },
    { title: "Место для фотографии", caption: "Пример будет добавлен.", file: "placeholder-nature-4", placeholder: true },
  ],
  people: [
    { title: "Культурный сюжет", caption: "Люди в контексте традиций и региональной культуры.", file: "photostyle-composition-5.webp" },
    { title: "Аутентичный сюжет", caption: "Сюжет с действием и культурным контекстом.", file: "photostyle-composition-13.webp" },
    { title: "Люди Арктики", caption: "Портретный сюжет с северной повседневностью.", file: "photostyle-composition-14.webp" },
    { title: "Традиционное выступление", caption: "Эмоциональный кадр людей и культуры региона.", file: "photostyle-composition-16.webp" },
  ],
};

const appendixSocialImages = [
  { title: "Карточка с персоной", caption: "Формат для спикера, эксперта или героя материала.", file: "appendix-social-2.webp", contained: true },
];

// ── «Дизайн соцсетей» по ТЗ WebGuide (16.10.2026) с правками пользователя.
// Все работы — примеры оформления с историческими текстами.
const socialAsset = (filename) => assetPath(`/assets/social/${filename}`);
const socialWork = (id, alt, extra = {}) => ({
  id,
  sm: socialAsset(`${id}-sm.webp`),
  lg: socialAsset(`${id}-lg.webp`),
  alt,
  ratio: id === "r41" ? 4735 / 2663 : 1,
  ...extra,
});

const socialWorks = {
  r01: socialWork("r01", "Новостная карточка: 14 соглашений на 2,5 трлн рублей в сфере транспортной и логистической инфраструктуры"),
  r03: socialWork("r03", "Обложка программы: 2% ипотека в 2026 году, объёмная иллюстрация с креслом"),
  r08: socialWork("r08", "Обложка серии КОРФ: 20 лет без налогов"),
  r09: socialWork("r09", "Светлая карточка серии КОРФ: налоговые льготы"),
  r10: socialWork("r10", "Карточка серии КОРФ: пониженный тариф по страховым взносам 7,6%"),
  r11: socialWork("r11", "Светлая карточка серии КОРФ: административная поддержка"),
  r12: socialWork("r12", "Карточка серии КОРФ: как получить статус резидента"),
  r13: socialWork("r13", "Завершающая карточка серии: узнайте больше на сайте КРДВ, QR-код"),
  r14: socialWork("r14", "Цитата: Александр Колобов, компания «Умбатревел», резидент АЗРФ"),
  r15: socialWork("r15", "Цитата: Василий Гребенников, морской фермер, резидент Свободного порта"),
  r16: socialWork("r16", "Цитата: Оксана Цветкова, учитель математики из Приморского края"),
  r17: socialWork("r17", "Цитата: Федор Бондарчук, режиссер, продюсер, актер"),
  r18: socialWork("r18", "Цитата: Эльвира Нургалиева, заместитель главы Минвостокразвития России"),
  r20: socialWork("r20", "Светлая карточка ярмарки трудоустройства: более 300 вакансий от 25 работодателей"),
  r22: socialWork("r22", "Карточка ярмарки: даты и адреса, рукописные штрихи и объёмное сердце"),
  r28: socialWork("r28", "Обложка грантового конкурса на съёмку фильмов с объёмной хлопушкой"),
  r35: socialWork("r35", "Обложка серии: программа профпереподготовки «Управление креативными пространствами»"),
  r36: socialWork("r36", "Светлая карточка серии: от идеи к проекту, цифры программы"),
  r37: socialWork("r37", "Светлая карточка серии: что в программе"),
  r38: socialWork("r38", "Карточка серии: 6% — вклад креативных индустрий в ВВП к 2030 году"),
  r39: socialWork("r39", "Карточка серии: ДФО — лидер креативной экономики страны"),
  r40: socialWork("r40", "Завершающая светлая карточка серии: креативные индустрии"),
  r41: socialWork("r41", "Горизонтальный коллаж: второй победитель «Дальневосточного квеста» отправится в Бурятию"),
  r42: socialWork("r42", "Шаблон цитаты: портрет, имя, подпись и текст высказывания"),
};

const socialPhotoBranded = {
  id: "photo",
  sm: socialAsset("demo-photo-branded.webp"),
  lg: socialAsset("demo-photo-branded.webp"),
  alt: "Фотография вулкана с белым круглым знаком КРДВ в левом верхнем углу",
  ratio: 1,
};

const socialPage = {
  id: "social",
  number: "13",
  cursorIcons: true,
  heroImage: "cover-social-bubbles.webp",
  heroTone: "plain",
  title: "Дизайн соцсетей",
  intro:
    "В соцсетях КРДВ фирменный стиль становится более эмоциональным. Фотографии, крупная типографика, градиенты и объёмные иллюстрации помогают рассказывать о проектах, людях и возможностях Дальнего Востока и Арктики.",
  sections: [
    {
      id: "social-guide",
      title: "Визуальный язык соцсетей",
      paragraphs: ["Общий язык объединяет разные форматы: фотографию с логотипом, новостную карточку, цитату и пост из нескольких карточек."],
      socialFeed: ["r01", "r03", "r14", "r20", "r28", "r35", "r08", "r17", "r22", "r38", "r10", "r16", "r39", "r12"].map((id) => socialWorks[id]),
      socialNote: "Примеры оформления. Даты, суммы и условия в работах исторические и могли измениться.",
    },
    {
      id: "social-photo",
      title: "Логотип для соцсетей",
      paragraphs: [
        "Используйте готовое PNG наложение поверх фотографии. Не меняйте пропорции, надпись и положение логотипа. В публикации с одной фотографией брендируется эта фотография; в альбоме — первая.",
        "Охранное поле со всех сторон — минимум половина диаметра круга, в том числе до края изображения. Размер и положение уже заданы в наложениях: вычислять их вручную не нужно.",
      ],
      socialPhoto: true,
    },
    {
      id: "social-formats",
      title: "Форматы публикаций",
      paragraphs: ["Для каждого формата — назначение и короткое правило. Нажмите на пример, чтобы открыть его целиком."],
      socialFormats: [
        { title: "Фото с логотипом", purpose: "Документальные и репортажные публикации.", rule: "Фотография остаётся главной, логотип не перекрывает важные детали кадра.", work: socialPhotoBranded },
        { title: "Новостная карточка", purpose: "Одна главная мысль: заголовок и при необходимости иллюстрация.", rule: "Цифра или главный факт читаются первыми.", work: socialWorks.r01 },
        { title: "Цитата", purpose: "Портрет, имя, должность и высказывание.", rule: "Имя и высказывание должны читаться в ленте. Длинную цитату сокращают редакционно с согласованием смысла или делят на несколько карточек.", work: socialWorks.r14, group: [socialWorks.r14, socialWorks.r15, socialWorks.r16, socialWorks.r17, socialWorks.r18, socialWorks.r42] },
        { title: "Пост из нескольких карточек", purpose: "Последовательное раскрытие темы в одном посте.", rule: "Обложка, основные сообщения и завершающее действие.", work: socialWorks.r35, group: [socialWorks.r35, socialWorks.r36, socialWorks.r37, socialWorks.r38, socialWorks.r39, socialWorks.r40], count: 6 },
        { title: "Горизонтальный коллаж", purpose: "Несколько визуальных свидетельств в одной композиции.", rule: "Изображения дополняют одну историю. Коллаж сохраняет крупный главный акцент и читаемый заголовок.", work: socialWorks.r41, wide: true },
      ],
      socialNote: "Примеры оформления. Даты, суммы и условия в работах исторические и могли измениться.",
    },
    {
      id: "social-anatomy",
      title: "Устройство карточки",
      paragraphs: [
        "Одна карточка передаёт одну главную мысль. Заголовок задаёт иерархию, подзаголовок уточняет сообщение, иллюстрация поддерживает тему. Дополнительные метки выделяют дату, условие или действие.",
      ],
      socialAnatomy: {
        work: socialWorks.r03,
        parts: [
          { at: 10, title: "Логотип", text: "Круглый логотип КРДВ в левом верхнем углу." },
          { at: 31, title: "Заголовок", text: "Главная мысль карточки, самый крупный текст." },
          { at: 41, title: "Подзаголовок", text: "Уточняет сообщение заголовка." },
          { at: 48, title: "Дополнительная метка", text: "Дата, условие или действие на цветной плашке." },
          { at: 74, title: "Иллюстрация", text: "Объёмный образ поддерживает тему." },
          { at: 92, title: "Фон", text: "Фирменный синий градиент или светлый бежевый." },
        ],
      },
    },
    {
      id: "social-series",
      title: "Пост из нескольких карточек",
      paragraphs: [
        "Карточки в одном посте раскрывают тему последовательно: обложка, основные сообщения и завершающее действие. Синие и бежевые карточки создают ритм. Композиция и акценты меняются по содержанию, а сетка и типографика связывают карточки между собой.",
      ],
      socialSeries: [
        { title: "Пост о программе «Управление креативными пространствами»", alt: "Шесть карточек одного поста о программе профпереподготовки с чередованием синего и светлого фона", items: [socialWorks.r35, socialWorks.r36, socialWorks.r37, socialWorks.r38, socialWorks.r39, socialWorks.r40] },
      ],
    },
    {
      id: "social-graphics",
      title: "Иллюстрации и эмодзи",
      paragraphs: [
        "Иллюстрации помогают быстро передать тему. Используйте согласованные изображения с общим характером объёма, света и материалов. Линии, стрелки и плашки расставляют акценты и помогают читать карточку.",
      ],
      socialGraphics: [
        { title: "Объёмные иллюстрации", text: "Передают тему карточки: транспорт, дом, кино. Один образ — одна мысль.", works: [socialWorks.r01, socialWorks.r03, socialWorks.r28] },
        { title: "Линии, стрелки и плашки", text: "Рукописные штрихи, стрелки и цветные плашки выделяют даты, условия и действия.", works: [socialWorks.r22, socialWorks.r35] },
      ],
    },
    {
      id: "social-downloads",
      title: "Материалы для работы",
      paragraphs: ["Посты можно оформить на новом портале. Фирменные эмодзи добавляются в Telegram одной кнопкой и используются в тексте публикаций."],
      resourceLinks: ["socialPortal", "socialEmoji"],
    },
  ],
};

const pagesData = [
  {
    id: "overview",
    number: "00",
    title: "Обзор",
    heroLibrary: "overview-panels",
    intro: "Руководство по визуальной системе АО «КРДВ»: логотип, цвета, типографика, фотостиль, носители и материалы для скачивания.",
    sections: [
      {
        id: "contents",
        title: "Содержание",
        lead: "Руководство по использованию фирменного стиля АО «КРДВ»",
        directory: true,
      },
      {
        id: "downloads",
        title: "Материалы для скачивания",
        lead: "Внешние архивы собраны по разделам, чтобы быстро перейти к нужным исходникам и шаблонам.",
        resourceLinks: allDownloadResourceKeys,
      },
    ],
  },
  {
    id: "positioning",
    number: "01",
    title: "Позиционирование",
    intro: "Дальний Восток и Арктика в коммуникации КРДВ показываются как территории будущего, успеха, мечты, знаний, инфраструктуры, карьеры, льгот, масштаба и ипотеки 2%.",
    sections: [
      {
        id: "promise",
        title: "Бренд-обещание",
        paragraphs: ["Дальний Восток и Арктика — ближе к будущему, ближе к успеху, ближе к мечте. В основе этого обещания — возможности для жизни, работы и развития бизнеса в этих регионах."],
        keywords: ["ближе к будущему", "ближе к успеху", "ближе к мечте", "земля", "знания", "инфраструктура", "карьера", "льготы", "гектар", "масштаб", "ипотека 2%"],
        positioningShowcase: true,
      },
      {
        id: "principles",
        title: "Основные принципы",
        lead: "Наша работа — ваши достижения",
        paragraphs: ["Привлекаем активных граждан и организации на Дальний Восток и в Арктику, помогаем успешно реализовать проекты, направленные на ускоренное социально-экономическое развитие регионов, решаем проблемы."],
        principles: [
          { title: "Качественно", tone: "#0b2a78", text: "Экспертиза и профессиональный опыт", video: "cover-typography.mp4" },
          { title: "Просто", tone: "#0f7a84", text: "Упрощенные процедуры, цифровые сервисы", video: "cover-text.mp4" },
          { title: "Выгодно", tone: "#8e1b1d", text: "Льготы и меры поддержки, повышающие экономическую эффективность проектов", video: "cover-advertising.mp4" },
          { title: "Надежно", tone: "#0c4fc4", text: "Защищаем интересы граждан и бизнеса, решаем сложные задачи", video: "cover-corporate.mp4" },
        ],
      },
    ],
  },
  {
    id: "logo",
    number: "02",
    title: "Логотип",
    heroVideo: "logo-cover.mp4",
    heroLogo: "krdv-logo-ru-horizontal.svg",
    introAction: { label: "Скачать логотипы", resource: "logos" },
    intro: "Правила работы с логотипом: версии, размещение, охранное поле, работа с фоном и ограничения по использованию.",
    sections: [
      {
        id: "full",
        title: "Полная версия",
        paragraphs: [
          "Логотип АО «КРДВ» — это неделимый блок, состоящий из фирменного графического знака и написания. Взаимное расположение элементов зафиксировано и не может быть изменено.",
          "Графический знак представляет собой стилизованное изображение цветущего лотоса — священного растения во многих культурах. Растение обладает большим потенциалом и способно преодолевать любые барьеры при росте, постепенно осваивая территорию водоема.",
          "Рост лотоса символизирует прогресс и развитие, способность противостоять любым трудностям на благо социально-экономического развития территорий Дальнего Востока и Арктики.",
          "Любая версия с измененной подписью или самостоятельным знаком допустима только по письменному решению Департамента визуальных коммуникаций АО «КРДВ».",
        ],
        logos: ["ru-square", "ru-horizontal"],
      },
      {
        id: "versions",
        title: "Версии",
        lead: "Версия выбирается по языку коммуникации и пропорциям носителя.",
        paragraphs: [
          "Вертикальная и горизонтальная версии логотипа могут равноправно использоваться для идентификации компании.",
          "Русский и английский варианты являются основными видами логотипа. Следует выбирать подходящую версию, учитывая языковую группу аудитории, на которую направлено информационное или рекламное сообщение.",
        ],
        logoPairs: true,
        resourceLinks: ["logos"],
      },
      {
        id: "usage",
        title: "Использование",
        paragraphs: [
          "Графический знак нельзя использовать без текстовой части. Нарушение этого правила может способствовать смешению идентичности бренда АО «КРДВ» с брендом Восточного экономического форума и других компаний, что недопустимо.",
          "Логотип нельзя использовать с другим текстом, кроме оригинального — Корпорация развития Дальнего Востока и Арктики.",
          "Если задаче требуется иной состав, сначала фиксируется причина изменения, затем макет направляется в профильный департамент.",
        ],
        logoExamples: logoUsageExamples,
      },
      {
        id: "clearspace",
        title: "Охранное поле",
        paragraphs: [
          "Охранное поле — пространство вокруг логотипа, в котором нельзя размещать другие графические элементы, текст и края носителя.",
          "Размер поля равен высоте левого лепестка знака — около трети высоты логотипа. На схеме этот модуль показан квадратами в углах. Поле одинаково для основной и дополнительной версий и отсчитывается от крайних точек логотипа.",
          "Если логотип используется в инвертированных цветах, белым начертанием на синем фоне, размеры фона сплошной заливки должны быть не меньше охранной зоны.",
        ],
        clearSpace: true,
      },
      {
        id: "backgrounds",
        title: "Фоны и цвет",
        lead: "Выбор фона и работа с цветом при использовании полноцветного логотипа",
        paragraphs: ["Использование полноцветного логотипа допускается только на фоне, гарантирующем достаточный контраст для читаемости логотипа. В противном случае необходимо использовать дополнительные графические элементы, например плашки."],
        logoBackdrops: true,
        logoExamples: logoBackgroundExamples,
        logoExampleColumns: 4,
      },
      {
        id: "misuse",
        title: "Запреты",
        lead: "Любое отступление от рекомендаций по нанесению логотипа недопустимо.",
        logoExamples: logoMisuseExamples,
      },
      {
        id: "cobranding",
        title: "Кобрендинг",
        paragraphs: ["Правила совместного размещения логотипа КРДВ с логотипами министерств, партнеров и проектов."],
        rules: cobrandRules,
        logoExamples: cobrandExamples,
        logoExampleColumns: 2,
      },
    ],
  },
  {
    id: "subsidiaries",
    number: "03",
    title: "Дочерние общества",
    heroVideo: "subsidiaries-cover.mp4",
    heroAnimation: "subsidiaryRegions",
    introAction: { label: "Скачать логотипы", resource: "subsidiaryLogos" },
    intro: "Раздел объединяет версии логотипов дочерних обществ: русские и английские, горизонтальные и вертикальные.",
    sections: [
      {
        id: "logos",
        title: "Логотипы обществ",
        lead: "У каждого дочернего общества четыре версии логотипа: русская и английская, горизонтальная и вертикальная.",
        paragraphs: [
          "Горизонтальная версия — основная: используйте ее, когда носитель дает достаточно места для уверенного чтения полного названия. Вертикальная — для узких и компактных форматов: карточек, стоек, боковых полей.",
          "Английские версии применяются на международных мероприятиях, англоязычных ресурсах и в материалах для зарубежных партнеров. Кнопки под каждым логотипом скачивают именно эту версию.",
        ],
        subsidiaryRegions: true,
        resourceLinks: ["subsidiaryLogos"],
      },
    ],
  },
  {
    id: "regimes",
    number: "04",
    title: "Префрежимы и программы",
    navTitle: "Режимы и программы",
    cardTitle: "Префрежимы и программы",
    heroImage: "cover-regimes-glass-dark.webp",
    heroTone: "plain",
    intro: "Для преференциальных режимов используется единая система сокращений, знаков и названий. Она помогает быстро различать программы поддержки в коммуникационных материалах.",
    sections: [
      {
        id: "signs",
        title: "Знаки префрежимов",
        paragraphs: ["Система включает сокращения и полные расшифровки режимов: ТОР, СПВ, КОРФ, САР, АЗРФ и ИНТЦ."],
        regimeSigns: true,
        resourceLinks: ["regimeLogos"],
      },
      {
        id: "coding",
        title: "Цвета направлений",
        paragraphs: ["Каждый цвет закреплен за конкретным направлением поддержки и используется как навигационный маркер в лифлетах, презентациях и информационных блоках."],
        palette: regimePaletteTiles,
        paletteSeparate: true,
      },
      {
        id: "hectare",
        title: "Программа «Дальневосточный и арктический гектар»",
        navTitle: "Программа Гектар",
        paragraphs: ["Программа «Дальневосточный и арктический гектар» реализуется Минвостокразвития России совместно с корпорацией, КРДВ выступает оператором программы и помогает гражданам на всех этапах: от подачи заявления и выбора земли до сопровождения проектов. У программы свой фирменный стиль. Правила его использования — в брендбуке ниже."],
        brandLogoVersions: [
          { title: "Основная версия", file: "hectare-logo-main", alt: "Логотип «Гектар», основная версия", shape: "square" },
          { title: "Горизонтальная версия", file: "hectare-logo", alt: "Логотип «Гектар», горизонтальная версия", shape: "wide" },
        ],
        resourceLinks: ["hectareBrandbook"],
      },
      {
        id: "ma2030",
        title: "Программа «Муравьёв-Амурский 2030»",
        navTitle: "МА 2030",
        paragraphs: ["«Муравьёв-Амурский 2030» — бесплатная годовая образовательная программа по подготовке управленческих кадров для госслужбы. Проект реализуется Министерством по развитию Дальнего Востока и Арктики совместно с КРДВ. У программы свой фирменный стиль. Правила его использования — в брендбуке ниже."],
        brandLogoVersions: [
          { title: "Основная версия", file: "ma2030-logo-main-v2", alt: "Логотип «Муравьёв-Амурский 2030», основная версия", shape: "square" },
          { title: "Горизонтальная версия", file: "ma2030-logo", alt: "Логотип «Муравьёв-Амурский 2030», горизонтальная версия", shape: "wide" },
        ],
        resourceLinks: ["ma2030Brandbook"],
      },
      {
        id: "intc",
        title: "ИНТЦ «Русский»",
        paragraphs: ["ИНТЦ «Русский» — это территория с особым преференциальным режимом, созданная для развития высокотехнологичного бизнеса на Дальнем Востоке и продвижения наукоемких продуктов и технологий на рынки стран Азиатско-Тихоокеанского региона.", "У логотипа ИНТЦ «Русский» две версии: основная и горизонтальная."],
        brandLogoVersions: [
          { title: "Основная версия", file: "intc-russky-logo-frame", alt: "Логотип ИНТЦ «Русский», основная версия", shape: "square" },
          { title: "Горизонтальная версия", file: "intc-russky-logo", alt: "Логотип ИНТЦ «Русский», горизонтальная версия", shape: "wide" },
        ],
        resourceLinks: ["intcSite"],
      },
    ],
  },
  {
    id: "color",
    number: "05",
    title: "Цвет",
    heroAnimation: "colorTiles",
    intro: "Синий цвет олицетворяет омывающие Дальний Восток и Арктику океаны — Северный Ледовитый и Тихий. Красный цвет связан с восходящим на востоке солнцем.",
    sections: [
      {
        id: "primary",
        title: "Фирменные цвета",
        paragraphs: ["Основная палитра задает узнаваемость бренда в интерфейсах, печатных материалах, презентациях и рекламных носителях."],
        palette: primaryPalette,
      },
      {
        id: "secondary",
        title: "Дополнительные цвета",
        paragraphs: ["Дополнительная цветовая палитра используется для оформления презентаций."],
        palette: secondaryPalette,
      },
    ],
  },
  {
    id: "typography",
    heroVideo: "cover-typography.mp4",
    number: "06",
    title: "Типографика",
    intro: "Шрифтовая система включает основной гротеск, акцидентную пару для выразительных заголовков и отдельную гарнитуру для наградных документов.",
    sections: [
      {
        id: "families",
        title: "Шрифтовая система",
        paragraphs: [
          "Основной набор строится на TT Norms Pro: он держит деловой тон, хорошо работает в длинном тексте и остается читаемым в интерфейсах. Serif-семейство используется как акцент, а TT Tsars — для наградных документов.",
        ],
        fontWorkbench: true,
      },
      {
        id: "usage",
        title: "Применение",
        rules: [
          { label: "Основной набор", text: "TT Norms Pro используется в интерфейсах, презентациях, деловых документах и информационных материалах." },
          { label: "Акцент", text: "Serif-семейство уместно в титульных блоках и представительских носителях, где нужен более выразительный ритм." },
          { label: "Наградные документы", text: "TT Tsars применяется в благодарностях, благодарственных письмах и почетных грамотах." },
          { label: "Исключения", text: "Другие шрифты допускаются только для проектов и мероприятий с собственным фирменным стилем. В офисных документах допустимы Arial и Times New Roman." },
        ],
      },
    ],
  },
  {
    id: "text",
    heroVideo: "cover-text.mp4",
    number: "07",
    title: "Оформление текста",
    intro: "При работе с текстом рекомендуется придерживаться базовых правил оформления русскоязычных текстов. Такое внимание к деталям помогает всем носителям АО «КРДВ» выглядеть профессионально и аккуратно.",
    sections: [
      {
        id: "quotes-dash",
        title: "Кавычки и тире",
        paragraphs: [
          "Для русскоязычных текстов основной используемый тип кавычек — «елочки». Если внутри закавыченного текста содержится другой закавыченный текст, то он оформляется кавычками типа „лапки“.",
          "Для обозначения тире нужно использовать знак «длинное тире» (—). Длинное тире отбивается пробелами с двух сторон. Для разделения числовых интервалов используется среднее тире (–), которое не отбивается пробелами.",
        ],
        textExamples: [
          { label: "Кавычки", good: "«Цитата „внутри“ цитаты»", bad: "\"Цитата \"внутри\" цитаты\"" },
          { label: "Название организации", good: "АО\u00a0«КРДВ»", bad: "АО \"КРДВ\"" },
          { label: "Длинное тире", good: "Тире\u00a0— знак препинания.", bad: "Тире - знак препинания." },
          { label: "Числовой интервал", good: "1992–2021\u00a0годы", bad: "1992 — 2021 годы" },
        ],
      },
      {
        id: "money-phone",
        title: "Валюты и телефоны",
        paragraphs: [
          "Знаки валют, указываемые после числа, отбиваются неразрывным пробелом. Знаки валют, указываемые в препозиции, пишутся слитно с числом. В тексте рекомендуется написание валют словами.",
          "Номера телефонов записываются в международном формате: со знаком «+» и кодом страны. Код страны, код города и номер отбиваются друг от друга неразрывным пробелом, внутри номера цифры делятся дефисами.",
        ],
        textExamples: [
          { label: "Знак валюты после числа", good: "100\u00a0000\u00a0₽", bad: "100 000₽" },
          { label: "Знак валюты перед числом", good: "¥100\u00a0000", bad: "¥ 100 000" },
          { label: "Валюта в тексте", good: "Бюджет проекта — 100\u00a0000 рублей", bad: "Бюджет проекта — 100 000 ₽" },
          { label: "Телефон", good: "+7\u00a0495\u00a0531-06-44", bad: "8 (495) 5310644" },
        ],
      },
      {
        id: "abbr-geo",
        title: "Сокращения и география",
        paragraphs: [
          "Сокращения с усечением части слова пишутся с точкой в конце, кроме обозначений физических единиц СИ. Без точки пишутся также «млн» и «млрд».",
          "Со строчной буквы пишутся родовые географические термины, названия сторон света и прилагательные от них. С прописной буквы — географические названия и неофициальные названия географических регионов.",
        ],
        textExamples: [
          { label: "Сокращения", good: "г.\u00a0Владивосток, д.\u00a05", bad: "г Владивосток, д 5" },
          { label: "Составные сокращения", good: "т.\u00a0к., т.\u00a0е.", bad: "т.к., т.е." },
          { label: "Единицы СИ", good: "5\u00a0м, 2\u00a0ч", bad: "5 м., 2 ч." },
          { label: "Млн и млрд", good: "15\u00a0млн рублей", bad: "15 млн. рублей" },
          { label: "Родовые термины и стороны света", good: "север Якутии, арктические льды", bad: "Север Якутии, Арктические льды" },
          { label: "Названия регионов", good: "Дальний Восток, Заполярье, Республика Бурятия", bad: "дальний восток, заполярье, республика Бурятия" },
        ],
      },
      {
        id: "line-breaks",
        title: "Переносы строк",
        paragraphs: [
          "Короткие предлоги, союзы и частицы — «в», «и», «к», «с», «на», «по», «не» и другие — не оставляют в конце строки: их связывают со следующим словом неразрывным пробелом. Так же не разрывают число и единицу измерения, инициалы и фамилию.",
        ],
        lineBreakExamples: [
          {
            label: "Предлоги и союзы",
            bad: ["Корпорация поддерживает бизнес |в|", "регионах Дальнего Востока |и|", "Арктики"],
            good: ["Корпорация поддерживает бизнес", "в регионах Дальнего Востока", "и Арктики"],
          },
          {
            label: "Числа и единицы измерения",
            bad: ["Протяженность новой трассы — |120|", "км, строительство займет |2|", "года"],
            good: ["Протяженность новой трассы —", "120 км, строительство займет", "2 года"],
          },
        ],
      },
    ],
  },
  {
    id: "corporate",
    heroVideo: "cover-corporate.mp4",
    number: "08",
    title: "Корпоративные материалы",
    navTitle: "Корп. материалы",
    intro: "Корпоративные носители переводят фирменную систему в рабочие документы: презентации, визитки, QR-форматы, материалы дочерних обществ, бланки, навигацию кабинетов, режимник и наградные документы.",
    sections: [
      {
        id: "presentations",
        title: "Презентации",
        paragraphs: ["Для корпоративных презентаций есть два шаблона: светлый — для документов и отчетов, темный — для выступлений и мероприятий.", "Листайте слайды каждого шаблона стрелками: первым идет обложка."],
        slideDecks: presentationDecks,
      },
      {
        id: "business-card",
        title: "Визитки",
        paragraphs: ["Формат: 90×50 мм, красочность: 4+0, односторонние."],
        specs: [
          { title: "Наборный шрифт", items: ["10 pt: фамилия, имя — TT Norms Pro Medium.", "6,5 pt: должность — TT Norms Pro Regular.", "7 pt: контактные данные — TT Norms Pro Regular.", "7 pt: адресный блок — TT Norms Pro Regular."] },
          { title: "Материал", items: ["Матовая белая бумага или touch cover.", "Возможно тиснение и матовый ламинат.", "Плотность не менее 300 г/м²."] },
          { title: "Способ печати", items: ["Офсетная печать.", "Цифровая печать.", "УФ-печать."] },
        ],
        assetImages: [
          { title: "Русская визитка", caption: "Без QR-кода, для партнеров в России.", file: "business-card-ru-white.webp", mockup: true },
          { title: "Английская визитка", caption: "Без QR-кода, для иностранных партнеров.", file: "business-card-en-white.webp", mockup: true },
        ],
        resourceLinks: ["businessCards"],
      },
      {
        id: "qr-card",
        title: "Визитки с QR-кодом",
        paragraphs: ["Базовый формат сохраняется: 90×50 мм, 4+0, лицевая сторона. Отличие — выделенная зона QR-кода, которая не должна смещать контактный блок."],
        specs: [
          { title: "QR-зона", items: ["Кегли и гарнитура сохраняют базовую сетку.", "Код размещается только в отведенной области.", "Контактный блок не сдвигается и не теряет иерархию."] },
        ],
        assetImages: [
          { title: "Русская визитка с QR-кодом", caption: "QR-код размещается справа от контактов.", file: "business-card-qr-ru-43.webp", mockup: true },
          { title: "Английская визитка с QR-кодом", caption: "Тот же макет на английском языке.", file: "business-card-qr-en-43.webp", mockup: true },
        ],
        resourceLinks: ["businessCardsQr"],
      },
      {
        id: "subsidiary-card",
        title: "Визитки ДО",
        paragraphs: ["Визитки дочерних обществ используют тот же размер 90×50 мм и одностороннюю печать 4+0, но меняют идентификатор и реквизитную часть под конкретное общество."],
        specs: [
          { title: "Идентификатор ДО", items: ["Шрифтовая сетка наследует стандартную визитку АО «КРДВ».", "Логотип и адресный блок подставляются из комплекта дочернего общества.", "QR-зона используется только в макетах, где она предусмотрена."] },
        ],
        assetImages: [
          { title: "Визитка без QR-кода", caption: "Основной вариант визитки дочернего общества.", file: "subsidiary-card-2-white.webp", mockup: true },
          { title: "Визитка с местом для QR-кода", caption: "QR-код размещается справа от контактов.", file: "subsidiary-card-1-white.webp", mockup: true },
        ],
        resourceLinks: ["businessCardsSubsidiary"],
      },
      {
        id: "letterhead",
        title: "Бланки ДО",
        lead: "Официальная основа для писем, приказов и деловой переписки дочерних обществ",
        paragraphs: ["В шапке размещаются логотип ДЗО, наименование, полный адрес, телефон, электронная почта и сайт. Для печати используется офисная или офсетная бумага."],
        assetImages: [
          { title: "Бланк: фирменная шапка", caption: "Основная зона идентификации дочернего общества.", file: "subsidiary-letterhead-1-white.webp", mockup: true },
          { title: "Бланк: реквизиты", caption: "Нижняя часть содержит контактные данные и служебную информацию.", file: "subsidiary-letterhead-2-white.webp", mockup: true },
        ],
        resourceLinks: ["subsidiaryLetterheads"],
      },
      {
        id: "office-navigation",
        title: "Навигация кабинетов",
        paragraphs: ["Кабинетные таблички подстраиваются под планировку офиса и видимость маршрута. Рекомендованное соотношение сторон: 3 по вертикали к 2 по горизонтали."],
        rules: [{ label: "Заказ табличек", text: "Перед изготовлением нужно передать список кабинетов, размеры и условия размещения в профильный департамент." }],
        assetImages: [
          { title: "Кабинеты", caption: "Табличка подразделения в интерьере офиса.", file: "office-navigation-mockup.webp", mockup: true, cover: true },
          { title: "Переговорные", caption: "Название и номер помогают быстро найти нужную комнату.", file: "office-sign-meeting.webp", mockup: true },
          { title: "Кабинеты", caption: "Название подразделения на двери кабинета.", file: "office-sign-accounting.webp", mockup: true },
          { title: "Общие зоны", caption: "Гардероб, кухня и другие помещения общего пользования.", file: "office-sign-cloakroom.webp", mockup: true },
        ],
      },
      {
        id: "schedule-sign",
        title: "Режимник",
        paragraphs: ["Режимник фиксирует график работы предприятия или дочернего общества. Размер выбирается по месту установки, но композиция сохраняет вертикальную доминанту 3:2."],
        assetImages: [{ title: "Режимник работы", caption: "Табличка объединяет расписание, адрес и контакты организации.", file: "schedule-sign-layout-white.webp", mockup: true },
          { title: "Режимник у входа", caption: "Табличка на фасаде рядом с входом в офис.", file: "schedule-sign-mockup.webp", mockup: true, cover: true },
        ],
      },
      {
        id: "awards",
        title: "Наградные документы",
        paragraphs: [
          "Формат А4. Бумага — Majestic Classic белый мрамор, под заказ. Заголовки выполняются тиснением золотой фольгой, рама — тиснением серебряной фольгой.",
          "Перед производством наградного комплекта нужно уточнить тираж, имена получателей и состав тиснения.",
        ],
        assetImageMode: "row3",
        assetImages: [
          { title: "Грамота", caption: "Композиция с рамой и крупным заголовком под тиснение.", file: "award-document-1.webp" },
          { title: "Благодарность", caption: "Лист для официального текста с более спокойной иерархией.", file: "award-document-2.webp" },
          { title: "Благодарственное письмо", caption: "Письменный формат с акцентной типографикой и фольгированием.", file: "award-document-3.webp" },
        ],
        resourceLinks: ["awards"],
      },
    ],
  },
  {
    id: "advertising",
    heroVideo: "cover-advertising.mp4",
    number: "09",
    title: "Рекламные материалы",
    navTitle: "Рекламные",
    intro: "Рекламно-информационные материалы включают лифлеты и роллап.",
    sections: [
      {
        id: "leaflets",
        title: "Лифлеты",
        paragraphs: ["В дизайне лифлетов используется цветовое кодирование — у каждого преференциального режима свой цвет. Формат А4: 297×210 мм, 2 бига. Печать 4+4, двухсторонние, офсет или цифра."],
        keywords: ["САР", "КОРФ", "Гектар", "Работа", "ТОР", "Ипотека", "АЗРФ", "СПВ"],
        assetImageMode: "stack",
        assetImages: [
          { title: "Лифлеты: общий вид", caption: "Набор обложек показывает цветовую навигацию по режимам.", file: "leaflets-layout-1.webp" },
          { title: "Лифлеты: развороты", caption: "Внутренние блоки продолжают палитру выбранного направления.", file: "leaflets-layout-2.webp" },
        ],
      },
      {
        id: "rollup",
        title: "Роллап",
        paragraphs: ["Мобильный вертикальный носитель для входных зон, небольших стендов и презентационных точек. Размер: 800×1800 мм."],
        rules: [{ label: "Отклонение от шаблона", text: "Измененный роллап передается на проверку до запуска в производство." }],
        assetImages: [{ title: "Роллап", caption: "Вертикальная конструкция с крупным сообщением и фирменным знаком.", file: "rollup-layout.webp", wide: true }],
      },
    ],
  },
  {
    id: "merch",
    heroVideo: "cover-merch.mp4",
    number: "10",
    title: "Мерч",
    intro: "Раздел показывает ключевые носители бренда: одежду, аксессуары и фирменный пакет.",
    sections: [
      {
        id: "apparel",
        title: "Одежда",
        lead: "Фирменная графика на текстиле: знак-сердце «КРДВ» работает как главный акцент носителя.",
        assetImages: [
          { title: "Футболка", caption: "Белая футболка унисекс, крупное сердце на спине.", file: "merch-tshirt.webp" },
          { title: "Ветровка", caption: "Бежевая ветровка оверсайз, небольшой знак на груди.", file: "merch-jacket.webp" },
        ],
      },
      {
        id: "accessories",
        title: "Аксессуары",
        lead: "Практичные носители с короткими слоганами и крупной графикой",
        assetImages: [
          { title: "Шоппер", caption: "Синий стёганый шоппер «Когда работа дарит восторг».", file: "merch-shopper.webp" },
          { title: "Зонт", caption: "Складной синий зонт «Работаем в любую погоду».", file: "merch-umbrella.webp" },
          { title: "Чехол для ноутбука", caption: "Крупная типографика КРДВ на светлом стёганом чехле.", file: "merch-laptop.webp" },
          { title: "Термокружка", caption: "Бежевая вакуумная термокружка «Арктика закаляет, кофе согревает».", file: "merch-mug.webp" },
          { title: "Ремувки", caption: "Красная и белая ремувки «Дальний Восток» и «Арктика».", file: "merch-lanyard.webp", wide: true },
        ],
      },
      {
        id: "package",
        title: "Пакет",
        lead: "Брендированный пакет с QR-кодом",
        paragraphs: ["Пакет используется для деловых наборов, мероприятий и передачи материалов. Новый рисунок или иной формат проверяется до печати."],
        specs: [{ title: "Производство", items: ["Материал: плотная бумага или картон.", "Вид нанесения: офсет или прямая печать."] }],
        assetImages: [{ title: "Пакет с QR-кодом", caption: "Бумажный носитель соединяет фирменный знак и цифровой переход.", file: "package-layout.webp", wide: true }],
      },
    ],
  },
  {
    id: "made",
    heroImage: "cover-made-stickers-dark.webp",
    heroTone: "plain",
    number: "11",
    title: "Товарный знак",
    intro: "Товарный знак помогает продвигать товары и услуги резидентов Дальнего Востока в России и за рубежом.",
    sections: [
      {
        id: "sign",
        title: "Знак",
        paragraphs: [
          "Знак используется для обозначения товаров и услуг резидентов ТОР и свободного порта Владивосток. Его размещают на упаковке, этикетках и рекламно-информационных материалах.",
          "Право использования знака оформляется через КРДВ. Макеты с его размещением согласовываются с корпорацией.",
        ],
        madeSigns: true,
        resourceLinks: ["madeSigns"],
      },
      {
        id: "branding",
        title: "Применение",
        paragraphs: ["Примеры показывают, как знак работает на упаковке, бирках, этикетках и серийной продукции без усложнения композиции."],
        assetImages: madeBrandingImages,
      },
    ],
  },
  {
    id: "photostyle",
    number: "12",
    title: "Фотостиль",
    heroVideo: "photostyle-cover.mp4",
    intro: "Фотостиль КРДВ строится на реальных территориях, работающих проектах, людях и событиях Дальнего Востока и Арктики.",
    sections: [
      {
        id: "principles",
        title: "Принципы съемки",
        paragraphs: [
          "Фотографии должны подтверждать действие бренда: показывать инфраструктуру, новые предприятия, события, людей и узнаваемый региональный контекст.",
          "Приоритет получают кадры с понятным сюжетом, естественными эмоциями и визуальным качеством, достаточным для презентаций, публикаций и рекламных материалов.",
          "Если подходящего изображения нет, вместо слабого фото лучше использовать графические элементы системы.",
        ],
      },
      {
        id: "infrastructure",
        title: "Единый прогресс",
        lead: "Единый прогресс, общие взгляды",
        paragraphs: [
          "Ключевым аспектом деятельности КРДВ является достижение результатов, связанных с развитием инфраструктуры.",
          "Выбирая материал для презентаций, следует особое внимание уделять фотографиям, отражающим ключевые достижения.",
          "Подходящие сюжеты: ледоколы, порты, грузовые суда, спутники, символы Северного морского пути, командные фото, символ единства, общих целей и прогресса.",
          "Также подходят работающие предприятия и заводы Дальнего Востока и Арктики, фото актуальных предприятий, открытых на «бесплатном гектаре», а также новых проектов резидентов.",
        ],
        assetImages: photostyleImages.infrastructure,
        cardsPlacement: "afterAssets",
        cards: [
          { title: "ФГУП «Атомфлот»", text: "Фотоисточник для арктической инфраструктуры и Северного морского пути" },
          { title: "Алена Медведева", text: "Авторские кадры для сюжетов о людях, командах и территориях" },
        ],
      },
      {
        id: "events",
        title: "Выступления",
        paragraphs: [
          "КРДВ принимает участие в культурно-развлекательных, образовательных и деловых мероприятиях.",
          "В коммуникации о прошедших событиях важно как можно чаще использовать фото с участием людей.",
          "Хороший кадр: участники заинтересованы, вовлечены в процесс, эмоциональны, кадр выглядит естественно.",
          "Неподходящий кадр: участники не вовлечены, людей много и лица не в фокусе, композиция неудачная, на переднем плане затылки или обилие текстур мешает считыванию.",
        ],
        assetImages: photostyleImages.events,
        footnote: ["Автор фото: Максим Блинов.", "Источник: Фотохост-агентство РИА Новости"],
      },
      {
        id: "nature",
        title: "Природа",
        lead: "Захватывающая природа",
        paragraphs: [
          "Кадры природы, используемые в публикациях корпорации, следует подбирать визуально захватывающие, демонстрирующие уникальную красоту и разнообразие регионов Дальнего Востока и Арктики.",
          "Они особенно актуальны для публикаций о туризме.",
          "Главный принцип при подборе фотографий пейзажей и природы — высокое качество изображения.",
          "Второй важный принцип — достоверность места, о котором идет речь в коммуникационном сообщении.",
          "Поскольку КРДВ работает с большим количеством регионов, мероприятий и людей, корректный подбор изображений иногда затруднителен. В случаях отсутствия изображения хорошего качества рекомендуется использовать графические элементы.",
        ],
        assetImages: photostyleImages.nature,
      },
      {
        id: "people",
        title: "Люди",
        lead: "Люди Дальнего Востока и Арктики",
        paragraphs: [
          "Главным принципом съемки людей является запечатление оригинальных аутентичных сюжетов, связанных с их сферой деятельности, культурными обычаями, мероприятиями, демонстрирующими жизнь народов Дальнего Востока и Арктики.",
          "Рекомендации позволяют раскрыть сюжеты наиболее полно, создать убедительные эмоциональные образы, продемонстрировать культурное богатство и многообразие жизни в регионах.",
        ],
        assetImages: photostyleImages.people,
      },
    ],
  },
  socialPage,
  {
    id: "contacts",
    heroVideo: "cover-contacts.mp4",
    number: "14",
    title: "Контакты",
    intro: "Реквизиты компании и обратная связь по руководству.",
    hideIntro: true,
    sections: [
      {
        id: "contacts-info",
        title: "Контакты",
        contacts: [
          "Акционерное общество «Корпорация развития Дальнего Востока и Арктики»",
          "Дата последнего обновления руководства: 01.11.2026",
        ],
        contactCta: {
          title: "Нашли ошибку?",
          text: "Если заметили неточность в макете, ссылке, формулировке или составе файлов, напишите нам — поправим материалы и обновим веб-версию.",
          label: "Связаться",
          href: "https://max.ru/u/f9LHodD0cOLm8OTuC0vxJbEiD8IBADIo2D-cV3s7BjYmOVCFuycEt1v7OXg",
          image: "contact-support-icon.png",
        },
      },
    ],
  },
];

const pagesById = Object.fromEntries(pagesData.map((page) => [page.id, page]));
const routeAliases = {
  strategy: "positioning",
  gallery: "overview",
  typography: "typography",
  color: "color",
  photography: "photostyle",
  illustration: "regimes",
  iconography: "regimes",
  language: "text",
  resources: "social",
  appendix: "social",
  "social-preview": "social",
  photo: "photostyle",
};

function getInitialPage() {
  if (typeof window === "undefined") return "overview";
  const raw = window.location.hash.replace(/^#\/?/, "");
  const normalized = routeAliases[raw] || raw;
  return pagesById[normalized] ? normalized : "overview";
}

function App() {
  const [activePageId, setActivePageId] = useState(getInitialPage);
  const [openGroup, setOpenGroup] = useState(getInitialPage);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeSectionId, setActiveSectionId] = useState("");
  const activePage = pagesById[activePageId] || pagesById.overview;

  // Текущий подраздел — последний, чей заголовок уже прокручен до верхней трети экрана.
  useEffect(() => {
    const scroller = document.getElementById("page");
    if (!scroller) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const limit = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.33;
      let current = "";
      scroller.querySelectorAll(".content-section").forEach((section) => {
        if (section.getBoundingClientRect().top <= limit) current = section.id;
      });
      setActiveSectionId(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [activePageId]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setShowPreloader(false), reducedMotion ? 260 : 1650);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const next = getInitialPage();
      setActivePageId(next);
      setOpenGroup(next);
      setMenuOpen(false);
      document.getElementById("page")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  useEffect(() => {
    const scroller = document.getElementById("page");
    const targets = [...(scroller?.querySelectorAll(".intro-panel, .content-section, .end-links") || [])];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!targets.length) return undefined;

    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-index", String(Math.min(index, 8)));
      delete target.dataset.inview;
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => {
        target.dataset.inview = "true";
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.dataset.inview = "true";
          observer.unobserve(entry.target);
        });
      },
      {
        root: scroller,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      },
    );

    const frame = requestAnimationFrame(() => {
      targets.forEach((target) => observer.observe(target));
      targets.slice(0, 2).forEach((target) => {
        target.dataset.inview = "true";
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [activePageId]);

  function navigate(pageId) {
    const nextHash = `#/${pageId}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
    setActivePageId(pageId);
    setOpenGroup(pageId);
    setMenuOpen(false);
    document.getElementById("page")?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  function jumpTo(sectionId) {
    const target = document.getElementById(sectionId);
    target?.scrollIntoView({ block: "start", behavior: "smooth" });
    setMenuOpen(false);
  }

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>
      <LayoutGroup id="brandbook-shell">
        <AnimatePresence>{showPreloader ? <BrandPreloader /> : null}</AnimatePresence>
        <div className={`guideline-shell ${menuOpen ? "nav-open" : ""}`}>
          <button className="mobile-menu-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
            <span>{t(menuOpen ? "Закрыть" : "Меню")}</span>
            <UiIcon icon={menuOpen ? ICONS.close : ICONS.menu} className="menu-icon" />
          </button>
          <Sidebar activePageId={activePageId} activeSectionId={activeSectionId} openGroup={openGroup} setOpenGroup={setOpenGroup} navigate={navigate} jumpTo={jumpTo} preloading={showPreloader} />
          <button className="nav-backdrop" type="button" aria-label={t("Закрыть меню")} onClick={() => setMenuOpen(false)} />
          <motion.main id="page" className="page-scroll" layoutScroll>
            <GuidelinePage key={activePageId} page={activePage} activePageId={activePageId} navigate={navigate} />
          </motion.main>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

function Sidebar({ activePageId, activeSectionId, openGroup, setOpenGroup, navigate, jumpTo, preloading }) {
  return (
    <aside className="sidebar" aria-label={t("Навигация брендбука")}>
      <button className="brand-lockup" type="button" onClick={() => navigate("overview")} aria-label={t("Открыть обзор")}>
        <motion.img layoutId={preloading ? undefined : "krdv-menu-logo"} src={logoAsset("krdv-logo-ru-square.svg")} alt={t("КРДВ")} />
      </button>

      <div className="sidebar-scroll">
      <div className="sidebar-meta">
        <strong>{t("Руководство по использованию фирменного стиля")}</strong>
        <span>{t("Обновлено: 1 ноября 2026")}</span>
      </div>

      <nav className="nav-list">
        {pagesData.map((group) => {
          const isOpen = openGroup === group.id;
          const isActive = activePageId === group.id;

          return (
            <div className={`nav-group ${isActive ? "is-active" : ""} ${isOpen ? "is-open" : ""}`} key={group.id}>
              <button
                className="nav-parent"
                type="button"
                aria-expanded={isOpen}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (isActive) {
                    setOpenGroup(isOpen ? "" : group.id);
                    return;
                  }
                  navigate(group.id);
                }}
              >
                <span>{group.number}</span>
                <strong>{t(group.navTitle || group.title)}</strong>
                <UiIcon icon={isOpen ? ICONS.navChevronUp : ICONS.navChevronDown} className="nav-chevron" strokeWidth={1} />
              </button>
              <NavChildren group={group} isOpen={isOpen} activePageId={activePageId} activeSectionId={isActive ? activeSectionId : ""} navigate={navigate} jumpTo={jumpTo} />
            </div>
          );
        })}
      </nav>
      </div>
    </aside>
  );
}

function NavChildren({ group, isOpen, activePageId, activeSectionId, navigate, jumpTo }) {
  const innerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = innerRef.current;
    if (!element) return undefined;

    const shell = element.parentElement;
    let firstFrame = 0;
    let secondFrame = 0;

    if (isOpen) {
      setHeight(0);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setHeight(element.scrollHeight);
        });
      });
    } else {
      setHeight(shell?.getBoundingClientRect().height || element.scrollHeight);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          setHeight(0);
        });
      });
    }

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [group.sections, isOpen]);

  return (
    <div className="nav-children-shell" aria-hidden={!isOpen} style={{ height }}>
      <div className="nav-children" ref={innerRef}>
        {group.sections.map((section) => (
          <button key={section.id} type="button" tabIndex={isOpen ? 0 : -1} aria-current={section.id === activeSectionId ? "location" : undefined} onClick={() => (activePageId === group.id ? jumpTo(section.id) : navigate(group.id))}>
            {t(section.navTitle || section.title)}
          </button>
        ))}
      </div>
    </div>
  );
}

function BrandPreloader() {
  const columns = Array.from({ length: 6 });
  const rows = Array.from({ length: 5 });

  return (
    <motion.div
      className="brand-preloader"
      role="status"
      aria-label={t("Загрузка брендбука")}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 } }}
    >
      <div className="preloader-blueprint" aria-hidden="true">
        {columns.map((_, index) => (
          <motion.i
            className="preloader-v-line"
            key={`v-${index}`}
            style={{ left: `${(index / (columns.length - 1)) * 100}%` }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
        {rows.map((_, index) => (
          <motion.i
            className="preloader-h-line"
            key={`h-${index}`}
            style={{ top: `${(index / (rows.length - 1)) * 100}%` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.12 + index * 0.055, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
      <motion.div className="preloader-frame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
        <motion.p className="preloader-statement" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}>
          {t("Руководство по использованию фирменного стиля АО «КРДВ»")}
        </motion.p>
        <motion.img
          layoutId="krdv-menu-logo"
          className="preloader-logo"
          src={logoAsset("krdv-logo-ru-square.svg")}
          alt=""
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroLogoLockup({ source, compact = false }) {
  return (
    <div className={`hero-cover-logo ${compact ? "is-compact" : ""}`} aria-hidden="true">
      <svg className="hero-cover-mark" viewBox="0 0 125.09 68.99" focusable="false">
        <g className="hero-cover-mark-outline">
          {LOTUS_MARK_PATHS.map((path) => (
            <path key={`outline-${path}`} d={path} pathLength={1} />
          ))}
        </g>
        <g className="hero-cover-mark-fill">
          {LOTUS_MARK_PATHS.map((path) => (
            <path key={`fill-${path}`} d={path} />
          ))}
        </g>
      </svg>
      <span className="hero-cover-wordmark">
        <img src={logoAsset(source)} alt="" />
      </span>
    </div>
  );
}

function ColorHeroAnimation() {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!rootRef.current) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    let cancelled = false;
    let ctx;

    import("gsap").then(({ gsap }) => {
      if (cancelled || !rootRef.current) return;

      ctx = gsap.context(() => {
        const tiles = gsap.utils.toArray(".color-hero-tile", rootRef.current);
        const firstState = colorHeroTileStates[0];
        const toRect = (rects) => ({
          left: (index) => `${rects[index].left}%`,
          top: (index) => `${rects[index].top}%`,
          width: (index) => `${rects[index].width}%`,
          height: (index) => `${rects[index].height}%`,
        });

        gsap.set(tiles, toRect(firstState));

        const timeline = gsap.timeline({
          repeat: -1,
          repeatDelay: 0.22,
          defaults: { duration: 4.6, ease: smoothStepEase },
        });

        colorHeroTileStates.slice(1).forEach((state) => {
          timeline.to(tiles, toRect(state));
          timeline.to({}, { duration: colorHeroHoldDuration });
        });

        timeline.to(tiles, toRect(firstState));
        timeline.to({}, { duration: colorHeroHoldDuration });
      }, rootRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div className="color-hero-animation" ref={rootRef} aria-hidden="true">
      {colorHeroTiles.map((tile, index) => {
        const rect = colorHeroTileStates[0][index];
        return (
          <span
            className="color-hero-tile"
            key={tile.id}
            style={{
              "--tile-color": tile.color,
              left: `${rect.left}%`,
              top: `${rect.top}%`,
              width: `${rect.width}%`,
              height: `${rect.height}%`,
            }}
          />
        );
      })}
    </div>
  );
}

function SubsidiaryHeroAnimation() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % subsidiaryHeroLogos.length);
    }, 1850);

    return () => window.clearInterval(timer);
  }, []);

  const logo = subsidiaryHeroLogos[activeIndex];

  return (
    <div className="subsidiary-hero-lockup" aria-hidden="true">
      <img className="subsidiary-hero-fixed" src={subsidiaryAsset(subsidiaryHeroLogos[0].file)} alt="" />
      <span className="subsidiary-hero-region-window">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={logo.file}
            src={subsidiaryAsset(logo.file)}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>
      </span>
    </div>
  );
}

function LibraryMiniPreview({ variant }) {
  return (
    <div className={`library-hero-bg is-miniature is-${variant}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function LibraryHeroBackground({ variant, miniature = false }) {
  if (!variant) return null;
  if (miniature) return <LibraryMiniPreview variant={variant} />;

  const shaderProps = {
    className: "library-shader",
    fit: "cover",
    maxPixelCount: 2400000,
    minPixelRatio: 1,
    style: { width: "100%", height: "100%" },
  };

  switch (variant) {
    case "overview-panels":
      return (
        <div className="library-hero-bg is-overview-panels" aria-hidden="true">
          <ColorPanels {...shaderProps} colors={["#0056a2", "#22a8e0", "#9ec6eb", "#de2327"]} colorBack="#001d37" density={1.18} length={1.7} angle1={0.34} angle2={-0.18} blur={0.06} edges speed={0.16} gradient={0.18} />
        </div>
      );
    default:
      return null;
  }
}

function GuidelinePage({ page, activePageId, navigate }) {
  const hasMediaHero = Boolean(page.heroVideo || page.heroImage);
  const hasAnimatedHero = Boolean(page.heroAnimation);
  const hasSubsidiaryHero = page.heroAnimation === "subsidiaryRegions";
  const hasLibraryHero = Boolean(page.heroLibrary);

  return (
    <article className={`guideline-page ${page.softLayout === false ? "" : "is-soft"}`}>
      <header className={`hero-band ${hasMediaHero ? "is-media" : ""} ${hasAnimatedHero ? "is-animated" : ""} ${hasSubsidiaryHero ? "is-subsidiary" : ""} ${hasLibraryHero ? "is-library" : ""} ${page.heroTone === "light" ? "is-light" : ""} ${page.heroTone === "plain" ? "is-plain" : ""}`} aria-label={t(page.title)}>
        {page.heroVideo ? <video className="hero-video" src={heroAsset(page.heroVideo)} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" /> : null}
        {page.heroImage ? <img className="hero-video" src={heroAsset(page.heroImage)} alt="" aria-hidden="true" /> : null}
        {page.heroAnimation === "colorTiles" ? <ColorHeroAnimation /> : null}
        {hasSubsidiaryHero ? <SubsidiaryHeroAnimation /> : null}
        {page.heroLibrary ? <LibraryHeroBackground variant={page.heroLibrary} /> : null}
        {page.heroLogo ? <HeroLogoLockup source={page.heroLogo} /> : null}
        <span className="hero-number">{page.number}</span>
        <h1 className="hero-title">{t(page.title)}</h1>
      </header>

      {page.hideIntro ? null : (
      <section className="intro-panel">
        <p>{t(page.intro)}</p>
        {page.introAction && downloadResources[page.introAction.resource] ? (
          <a
            className="intro-action"
            href={downloadResources[page.introAction.resource].url}
            target="_blank"
            rel="noreferrer"
          >
            {page.introAction.label}
          </a>
        ) : null}
      </section>
      )}

      {page.sections.map((section) => (
        <ContentSection key={section.id} section={section} navigate={navigate} activePageId={activePageId} />
      ))}

      <EndLinks activePageId={activePageId} navigate={navigate} />
      <SiteFooter />
      {page.cursorIcons ? <CursorIconTrail /> : null}
    </article>
  );
}

// «Контакты»: при движении курсора по странице появляются иконки на темы КРДВ —
// всплывают с лёгким поворотом и через секунду растворяются. На тач-устройствах и при «уменьшении движения» выключено.
const TRAIL_ICONS = [
  { id: "globe", paths: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M3 12h18", "M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"] },
  { id: "compass", paths: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M15.5 8.5l-2 5-5 2 2-5z"] },
  { id: "pin", paths: ["M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z", "M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"] },
  { id: "snowflake", paths: ["M12 3v18", "M4.2 7.5l15.6 9", "M4.2 16.5l15.6-9", "M9.5 4.5L12 6.5l2.5-2", "M9.5 19.5l2.5-2 2.5 2"] },
  { id: "anchor", paths: ["M12 7.5V21", "M12 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4z", "M8 11h8", "M4.5 14.5c.8 3.6 3.8 6.5 7.5 6.5s6.7-2.9 7.5-6.5"] },
  { id: "mountain", paths: ["M2.5 19.5l6.5-11 4 6.5", "M10.5 19.5l5-8 6 8z", "M2.5 19.5h19"] },
  { id: "wave", paths: ["M3 9c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0", "M3 14c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0"] },
  { id: "mail", paths: ["M3.5 6h17v12h-17z", "M3.5 6.5l8.5 6.5 8.5-6.5"] },
  { id: "chat", paths: ["M4 5h16v11H9l-5 4z", "M8 9.5h8", "M8 12.5h5"] },
  { id: "sun", paths: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 2.5v2.5", "M12 19v2.5", "M2.5 12H5", "M19 12h2.5", "M5.3 5.3l1.8 1.8", "M16.9 16.9l1.8 1.8", "M5.3 18.7l1.8-1.8", "M16.9 7.1l1.8-1.8"] },
  { id: "lotus", lotus: true },
];
const TRAIL_TONES = ["is-blue", "is-light", "is-white", "is-blue", "is-light"];

function CursorIconTrail() {
  const [items, setItems] = useState([]);
  const last = useRef(null);
  const counter = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    const timers = new Set();

    const onMove = (event) => {
      if (!event.target.closest?.(".guideline-page") || event.target.closest(".site-footer")) return;
      const { clientX: x, clientY: y } = event;
      const prev = last.current;
      if (prev && Math.hypot(x - prev.x, y - prev.y) < 34) return;
      last.current = { x, y };
      counter.current += 1;
      const id = counter.current;
      const item = {
        id,
        x,
        y,
        icon: TRAIL_ICONS[id % TRAIL_ICONS.length],
        tone: TRAIL_TONES[id % TRAIL_TONES.length],
        rotate: ((id * 37) % 30) - 15,
      };
      setItems((current) => [...current.slice(-27), item]);
      const timer = setTimeout(() => {
        setItems((current) => current.filter((entry) => entry.id !== id));
        timers.delete(timer);
      }, 950);
      timers.add(timer);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      timers.forEach(clearTimeout);
    };
  }, [reduceMotion]);

  return (
    <div className="cursor-trail" aria-hidden="true">
      <AnimatePresence>
        {items.map((item) => (
          <motion.span
            key={item.id}
            className={`cursor-trail-icon ${item.tone}`}
            style={{ left: item.x, top: item.y }}
            initial={{ opacity: 0, scale: 0.3, rotate: item.rotate - 20 }}
            animate={{ opacity: 1, scale: 1, rotate: item.rotate }}
            exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            {item.icon.lotus ? (
              <svg viewBox="0 0 125.09 68.99" className="is-lotus">
                {LOTUS_MARK_PATHS.map((path) => (
                  <path key={path} d={path} />
                ))}
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                {item.icon.paths.map((path) => (
                  <path key={path} d={path} />
                ))}
              </svg>
            )}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ContentSection({ section, navigate, activePageId }) {
  const cardsBeforeAssets = section.cards && section.cardsPlacement !== "afterAssets";
  const cardsAfterAssets = section.cards && section.cardsPlacement === "afterAssets";

  // Карточки, картинки и ссылки идут на всю ширину секции (под заголовком и текстом), текст — в правой колонке.
  const wideContent = [
    section.positioningShowcase ? <PositioningShowcase key="positioning" /> : null,
    section.principles ? <PrincipleCards key="principles" items={section.principles} /> : null,
    section.directory ? <SectionDirectory key="directory" navigate={navigate} activePageId={activePageId} /> : null,
    section.socialMosaic ? <SocialMosaic key="social-mosaic" rows={section.socialMosaic} note={section.socialNote} /> : null,
    section.socialFeed ? <SocialFeed key="social-feed" items={section.socialFeed} note={section.socialNote} /> : null,
    section.socialPhoto ? <SocialPhotoBlock key="social-photo" /> : null,
    section.socialFormats ? <SocialFormats key="social-formats" items={section.socialFormats} note={section.socialNote} /> : null,
    section.socialAnatomy ? <SocialAnatomy key="social-anatomy" data={section.socialAnatomy} /> : null,
    section.socialSeries ? <SocialSeries key="social-series" series={section.socialSeries} link={section.socialSeriesLink} navigate={navigate} /> : null,
    section.socialGraphics ? <SocialGraphics key="social-graphics" groups={section.socialGraphics} /> : null,
    section.textExamples ? <TextExampleGrid key="text-examples" items={section.textExamples} /> : null,
    section.lineBreakExamples ? <LineBreakExamples key="line-breaks" items={section.lineBreakExamples} /> : null,
    cardsBeforeAssets ? <CardGrid key="cards-before" items={section.cards} /> : null,
    section.logos ? <LogoLibrary key="logos" items={section.logos} /> : null,
    section.logoPairs ? <LogoPairLibrary key="logo-pairs" /> : null,
    section.subsidiaryLogos ? <SubsidiaryLogoLibrary key="subsidiary-logos" setId={section.subsidiaryLogos} /> : null,
    section.subsidiaryRegions ? <SubsidiaryRegionCards key="subsidiary-regions" /> : null,
    section.preAssetImages ? <AssetImageGrid key="pre-assets" items={section.preAssetImages} mode={section.preAssetImageMode} /> : null,
    section.brandLogo ? (
      <div className="brand-logo-preview" key="brand-logo">
        <img src={logoAsset(section.brandLogo.file)} alt={t(section.brandLogo.alt)} loading="lazy" />
      </div>
    ) : null,
    section.brandLogoVersions ? <BrandLogoVersions key="brand-logo-versions" items={section.brandLogoVersions} /> : null,
    section.typeSamples ? <TypeSpecimens key="type-samples" items={section.typeSamples} /> : null,
    section.fontWorkbench ? <FontWorkbench key="font-workbench" /> : null,
    section.regimePalette ? <RegimePalette key="regime-palette" items={section.regimePalette} /> : null,
    section.regimeSigns ? <RegimeSignLibrary key="regime-signs" /> : null,
    section.madeSigns ? <MadeSignLibrary key="made-signs" /> : null,
    section.slideDecks ? <SlideViewer key="slides" decks={section.slideDecks} /> : null,
    section.logoBackdrops ? <LogoBackdrops key="logo-backdrops" /> : null,
    section.clearSpace ? <ClearSpaceBoard key="clearspace" /> : null,
    section.logoExamples ? <LogoExampleGrid key="logo-examples" items={section.logoExamples} columns={section.logoExampleColumns} /> : null,
    section.assetImages ? <AssetImageGrid key="assets" items={section.assetImages} mode={section.assetImageMode} /> : null,
    cardsAfterAssets ? <CardGrid key="cards-after" items={section.cards} /> : null,
    section.footnote ? (
      <p className="section-footnote" key="footnote">
        {section.footnote.map((line) => (
          <span key={line}>{t(line)}</span>
        ))}
      </p>
    ) : null,
    section.visuals ? <PlaceholderGrid key="visuals" items={section.visuals} /> : null,
    section.palette ? <PaletteGrid key="palette" colors={section.palette} separate={section.paletteSeparate} /> : null,
    section.resourceLinks ? <ResourceLinks key="resources" keys={section.resourceLinks} /> : null,
    section.contacts ? <ContactBlock key="contacts" items={section.contacts} /> : null,
    section.contactCta ? <ContactCta key="contact-cta" item={section.contactCta} /> : null,
  ].filter(Boolean);

  return (
    <section className={`content-section ${wideContent.length ? "has-wide" : ""}`} id={section.id}>
      <div className="section-title">
        <h2>{t(section.title)}</h2>
      </div>
      <div className="section-body">
        {section.lead ? <p className="lead-copy">{t(section.lead)}</p> : null}
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph}>{t(paragraph)}</p>
        ))}
        {section.keywords && !section.positioningShowcase ? <KeywordWall items={section.keywords} /> : null}
        {section.specs || section.rules ? (
          <div className="spec-columns">
            {(section.rules || []).map((rule) => (
              <div className="spec-text" key={rule.label}>
                <h3>{t(rule.label)}</h3>
                <p>
                  <span>{t(rule.text)}</span>
                </p>
              </div>
            ))}
            {(section.specs || []).map((spec) => (
              <div className="spec-text" key={spec.title}>
                <h3>{t(spec.title)}</h3>
                <ul className="bullet-list">
                  {spec.items.map((item) => (
                    <li key={item}>{t(item)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {wideContent.length ? <div className={`section-wide ${section.regimeSigns ? "is-signs" : ""}`}>{wideContent}</div> : null}
    </section>
  );
}

function UiIcon({ icon, className = "", label, size = 18, strokeWidth = 1.7 }) {
  return (
    <MorphIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth
      reducedMotion="user"
      spring="snappy"
      className={`ui-icon ${className}`}
      label={label}
    />
  );
}

function KeywordWall({ items }) {
  return (
    <div className="keyword-wall">
      {items.map((item) => (
        <span key={item}>{t(item)}</span>
      ))}
    </div>
  );
}

// Примеры «правильно / неправильно» для правил оформления текста. Текст выводится как есть, без типографа:
// иначе типограф «исправил» бы и неправильные примеры.
function TextExampleGrid({ items }) {
  return (
    <div className="text-example-grid">
      {items.map((item) => (
        <motion.article className="text-example" key={item.label} whileHover={{ y: -2 }}>
          <span className="text-example-label">{t(item.label)}</span>
          <div className="text-example-row is-yes">
            <VerdictBadge verdict="yes" />
            <p>{item.good}</p>
          </div>
          <div className="text-example-row is-no">
            <VerdictBadge verdict="no" />
            <p>{item.bad}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

// Наглядный перенос: одна и та же фраза с «висящими» словами в конце строк и с правильной привязкой.
// В неправильном варианте слово между |…| подсвечивается.
function LineBreakExamples({ items }) {
  const renderLine = (line) =>
    line.split(/\|(.+?)\|/).map((part, index) => (index % 2 ? <mark key={index}>{part}</mark> : part));

  return (
    <div className="line-break-examples">
      {items.map((item) => (
        <motion.article className="line-break-example" key={item.label} whileHover={{ y: -2 }}>
          <span className="text-example-label">{t(item.label)}</span>
          <div className="line-break-pair">
            {[
              ["no", item.bad],
              ["yes", item.good],
            ].map(([verdict, lines]) => (
              <div className={`line-break-sample is-${verdict}`} key={verdict}>
                <VerdictBadge verdict={verdict} />
                <p>
                  {lines.map((line) => (
                    <span key={line}>{renderLine(line)}</span>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function CardGrid({ items }) {
  return (
    <LayoutGroup>
      {/* Текстовые карточки — без белых плашек: серый текст с тонкой линией сбоку, как у визиток */}
      <div className="spec-columns is-notes">
        {items.map((item, index) => (
          <div className="spec-text" key={`${item.title}-${index}`}>
            <h3>{t(item.title)}</h3>
            <p>
              <span>{t(item.text)}</span>
            </p>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}

// Нежно-голубое «северное сияние» на фоне блока (позиционирование, типографика).
function AuroraBackground({ className }) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`aurora-bg ${className || ""}`} aria-hidden="true">
      <MeshGradient
        colors={["#ffffff", "#d6e9fb", "#a9d2f3", "#eef6ff", "#8fc3ee", "#cfe4f8"]}
        distortion={0.85}
        swirl={0.35}
        grainMixer={0}
        grainOverlay={0}
        speed={reduceMotion ? 0 : 0.4}
        frame={42000}
        scale={1.15}
        maxPixelCount={1600000}
        minPixelRatio={1}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

const promiseWords = ["будущему", "успеху", "мечте"];
const promisePairs = ["земля", "знания", "инфраструктура", "карьера", "льготы", "гектар", "масштаб", "ипотека 2%"];

// Бренд-обещание: статичная часть слогана и сменяющееся слово (только «будущему / успеху / мечте»).
// Под слоганом слева — переключатели этих трёх слов, справа отдельной группой — смысловые акценты.
// На фоне — медленная нежно-голубая «северное сияние» анимация (MeshGradient).
function PositioningShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const timer = setInterval(() => setIndex((value) => (value + 1) % promiseWords.length), 2400);
    return () => clearInterval(timer);
  }, [paused, reduceMotion]);

  const pick = (value) => {
    setPaused(true);
    setIndex(value);
  };

  return (
    <div className="promise-board">
      <AuroraBackground className="promise-aurora" />
      <p className="promise-slogan">
        <span className="promise-static">Дальний Восток</span>
        <span className="promise-static">и{"\u00a0"}Арктика{"\u00a0"}—</span>
        <span className="promise-row">
          <span className="promise-static">ближе к</span>
          <span className="promise-slot">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={promiseWords[index]}
                className="promise-word"
                initial={{ y: "70%", opacity: 0, filter: "blur(8px)" }}
                animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "-70%", opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {promiseWords[index]}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      </p>
      <div className="promise-groups">
        <div className="promise-group" onMouseLeave={() => setPaused(false)}>
          <span className="promise-group-label">Ближе к</span>
          <div className="promise-tags">
            {promiseWords.map((word, value) => (
              <button
                type="button"
                key={word}
                data-active={value === index}
                aria-pressed={value === index}
                onMouseEnter={() => pick(value)}
                onFocus={() => pick(value)}
                onClick={() => pick(value)}
                onBlur={() => setPaused(false)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
        <div className="promise-group is-pairs">
          <span className="promise-group-label">{t("Смысловые акценты")}</span>
          <div className="promise-tags">
            {promisePairs.map((word) => (
              <span key={word}>{t(word)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Принципы: четыре карточки на фирменных «шёлковых» видео, крупное слово сверху и пояснение снизу.
function PrincipleCards({ items }) {
  return (
    <div className="principle-cards">
      {items.map((item) => (
        <article className="principle-card" key={item.title} style={{ "--tone": item.tone }}>
          <video className="principle-video" src={heroAsset(item.video)} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
          <h3>{t(item.title)}</h3>
          <p>{t(item.text)}</p>
        </article>
      ))}
    </div>
  );
}

function SectionDirectory({ navigate, activePageId }) {
  return (
    <LayoutGroup>
      <motion.div className="section-directory" layout>
        {pagesData.map((page) => {
          const isCurrent = activePageId === page.id;
          const hasCover = Boolean(page.heroVideo || page.heroImage);
          const hasMotionCover = page.heroAnimation === "colorTiles";
          const hasLibraryCover = Boolean(page.heroLibrary);

          return (
            <motion.button
              className="directory-card"
              data-current={isCurrent}
              key={page.id}
              type="button"
              layout
              onClick={() => navigate(page.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.992 }}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={t(`Открыть раздел ${page.title}`)}
            >
              <div className={`directory-visual ${hasCover || hasMotionCover || hasLibraryCover ? "has-cover" : ""} ${hasMotionCover ? "has-motion-cover" : ""} ${hasLibraryCover ? "has-library-cover" : ""}`} aria-hidden="true">
                {page.heroVideo ? <video className="directory-video" src={heroAsset(page.heroVideo)} autoPlay muted loop playsInline preload="metadata" /> : null}
                {page.heroImage ? <img className="directory-video" src={heroAsset(page.heroImage)} alt="" loading="lazy" /> : null}
                {hasMotionCover ? <ColorHeroAnimation /> : null}
                {hasLibraryCover ? <LibraryHeroBackground variant={page.heroLibrary} miniature /> : null}
                {hasCover || hasMotionCover || hasLibraryCover ? null : <div className="directory-fallback" />}
              </div>
              <div className="directory-copy">
                <h3>{t(page.cardTitle || page.title)}</h3>
                <p>{t(noDot(page.intro))}</p>
                <small>
                  <span>{t("Открыть раздел")}</span>
                  <UiIcon icon={ICONS.arrowRight} className="directory-arrow" />
                </small>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}

function pluralizeSections(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "разделов";
  if (last === 1) return "раздел";
  if (last >= 2 && last <= 4) return "раздела";
  return "разделов";
}

// Версии логотипа парами: русская и английская одного вида в одной карточке.
const logoPairs = [
  {
    id: "square",
    role: "Основная версия",
    title: "Вертикальная версия",
    description: "Подходит для компактных зон, вертикальных композиций, карточек и носителей, где горизонтальная версия теряет масштаб. Русская — для русскоязычных материалов, английская — для международных коммуникаций и зарубежной аудитории",
    langs: { ru: "ru-square", en: "en-square" },
    // Ширина пропорциональна ширине исходного файла — знак в обеих версиях одного размера, без искажений.
    ratios: { ru: 1, en: 183.59 / 209.8 },
  },
  {
    id: "horizontal",
    role: "Дополнительная версия",
    title: "Горизонтальная версия",
    description: "Используется, когда на носителе достаточно горизонтального пространства и логотип должен читаться как главный идентификатор. Русская — для русскоязычных материалов, английская — для англоязычных ресурсов и международных мероприятий",
    langs: { ru: "ru-horizontal", en: "en-horizontal" },
    ratios: { ru: 1, en: 343.43 / 384.61 },
  },
];

function LogoPairLibrary() {
  return (
    <div className="logo-pair-library">
      {logoPairs.map((pair) => (
        <motion.article className={`logo-pair-card is-${pair.id}`} key={pair.id} whileHover={{ y: -2 }}>
          <div className="logo-pair-preview">
            <div className="logo-pair-stack">
              {Object.entries(pair.langs).map(([lang, id]) => (
                <img
                  key={lang}
                  src={logoAsset(logoVariants[id].preview)}
                  alt={t(logoVariants[id].title)}
                  loading="lazy"
                  style={{ "--logo-ratio": pair.ratios[lang] }}
                />
              ))}
            </div>
          </div>
          <div className="logo-pair-copy">
            <span>{t(pair.role)}</span>
            <h3>{t(pair.title)}</h3>
            <p>{t(noDot(pair.description))}</p>
            <div className="logo-pair-downloads">
              {Object.entries(pair.langs).map(([lang, id]) => {
                const variant = logoVariants[id];
                return (
                  <div className="logo-pair-download-row" key={lang}>
                    <span>{t(lang === "ru" ? "Русская" : "Английская")}</span>
                    <div className="logo-downloads">
                      <div>
                        {logoFormats
                          .filter((format) => variant.files[format])
                          .map((format) => (
                            <LogoDownloadLink key={format} file={variant.files[format]} format={format} title={variant.title} />
                          ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function LogoLibrary({ items }) {
  const variants = items.map((id) => logoVariants[id]).filter(Boolean);

  return (
    <LayoutGroup>
      <motion.div className="logo-library" layout data-count={variants.length}>
        {variants.map((variant) => {
          const downloads = <LogoDownloads variant={variant} />;

          return (
            <motion.article className={`logo-card is-${variant.kind}`} key={variant.preview} layout whileHover={{ y: -2 }}>
              <div className="logo-preview">
                <img src={logoAsset(variant.preview)} alt={t(variant.title)} loading="lazy" />
              </div>
              <div className="logo-card-copy">
                <span>{t(variant.role)}</span>
                <h3>{t(variant.title)}</h3>
                <p>{t(noDot(variant.description))}</p>
                {variant.inlineDownloads ? downloads : null}
              </div>
              {variant.inlineDownloads ? null : downloads}
            </motion.article>
          );
        })}
      </motion.div>
    </LayoutGroup>
  );
}

function LogoDownloads({ variant }) {
  return (
    <div className="logo-downloads" aria-label={t(`Скачать ${variant.title}`)}>
            <div>
        {logoFormats
          .filter((format) => variant.files[format])
          .map((format) => (
            <LogoDownloadLink key={format} file={variant.files[format]} format={format} title={variant.title} />
          ))}
      </div>
    </div>
  );
}

function SubsidiaryRegionCards() {
  return (
    <div className="subsidiary-region-grid">
      {subsidiaryRegions.map((region) => (
        <motion.article className="subsidiary-region-card" key={region.slug} whileHover={{ y: -2 }}>
          <header>
            <h3>{t(region.title)}</h3>
            {region.enTitle ? <span>{region.enTitle}</span> : null}
          </header>
          <div className={`subsidiary-row-cells ${region.cells.some(({ item }) => subsidiaryLogoUnits[item.preview.replace(/^subsidiary-|\.svg$/g, "")] > 1200) ? "is-wide" : ""}`}>
            {region.cells.map(({ item }) => (
              <div className="subsidiary-cell" key={item.preview}>
                <div className={`subsidiary-cell-preview is-${item.orientation}`}>
                  <img
                    src={subsidiaryAsset(item.preview)}
                    alt={t(`${item.title}, ${item.versionLabel.toLowerCase()}`)}
                    loading="lazy"
                    style={{ "--u": subsidiaryLogoUnits[item.preview.replace(/^subsidiary-|\.svg$/g, "")] }}
                  />
                </div>
                <div className="logo-downloads">
                  <div>
                    {subsidiaryFormats.map((format) => (
                      <LogoDownloadLink
                        key={format}
                        file={item.files[format]}
                        format={format}
                        title={`${item.title}, ${item.versionLabel.toLowerCase()}`}
                        asset={subsidiaryAsset}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function SubsidiaryLogoLibrary({ setId }) {
  const items = subsidiaryLogoSets[setId] || [];

  return (
    <LayoutGroup>
      <motion.div className={`subsidiary-logo-grid is-${setId}`} layout data-count={items.length}>
        {items.map((item) => (
          <motion.article className={`subsidiary-logo-card is-${item.orientation}`} key={item.preview} layout whileHover={{ y: -2 }}>
            <div className="subsidiary-logo-preview">
              <img src={subsidiaryAsset(item.preview)} alt={t(item.title)} loading="lazy" />
            </div>
            <div className="subsidiary-logo-copy">
              <span>{t(item.versionLabel)}</span>
              <h3>{t(item.title)}</h3>
              {item.note ? <p>{t(noDot(item.note))}</p> : null}
              <div className="logo-downloads" aria-label={t(`Скачать ${item.title}`)}>
                                <div>
                  {subsidiaryFormats.map((format) => (
                    <LogoDownloadLink
                      key={format}
                      file={item.files[format]}
                      format={format}
                      title={item.title}
                      asset={subsidiaryAsset}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

// Анимация иконки играет, пока курсор над карточкой; при уходе — снова статичная картинка.
function playCardVideo(event) {
  const video = event.currentTarget.querySelector("video");
  if (!video) return;
  video.play().then(() => video.parentElement?.classList.add("is-playing")).catch(() => {});
}

function resetCardVideo(event) {
  const video = event.currentTarget.querySelector("video");
  if (!video) return;
  video.parentElement?.classList.remove("is-playing");
  video.pause();
  video.currentTime = 0;
}

function RegimeSignLibrary() {
  return (
    <LayoutGroup>
      <motion.div className="regime-sign-library" layout>
        {regimeSignLogos.map((item) => (
          <motion.article
            className="regime-sign-card"
            key={item.slug}
            style={{ "--sign-color": item.color }}
            layout
            whileHover={{ y: -2 }}
            onMouseEnter={item.iconVideo ? playCardVideo : undefined}
            onMouseLeave={item.iconVideo ? resetCardVideo : undefined}
          >
            <div className={`regime-sign-preview ${item.hasIcon ? "is-icon is-cover" : ""}`}>
              <img src={regimeSignAsset(item.preview)} alt={t(item.short)} loading="lazy" />
              {item.iconVideo ? <video src={regimeSignAsset(item.iconVideo)} muted loop playsInline preload="auto" aria-hidden="true" /> : null}
            </div>
            <div className="regime-sign-copy">
              <span>{t(item.short)}</span>
              <h3>{t(item.title)}</h3>
              <p>{t(noDot(item.description))}</p>
              <div className="logo-downloads" aria-label={t(`Скачать знак ${item.short}`)}>
                <div>
                  {regimeSignFormats.map((format) => (
                    <LogoDownloadLink key={format} file={item.files[format]} format={format} title={item.title} asset={regimeSignAsset} />
                  ))}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

function VerdictBadge({ verdict }) {
  return (
    <span className={`verdict-badge is-${verdict}`} role="img" aria-label={t(verdict === "yes" ? "Можно" : "Нельзя")}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="14" />
        {verdict === "yes" ? <path d="M10 16.5l4 4 8-8.5" /> : <path d="M6.2 25.8L25.8 6.2" />}
      </svg>
    </span>
  );
}

function LogoExamplePreview({ preview }) {
  if (preview.kind === "cobrand") {
    const scale = preview.scale || 1;
    return (
      <div className={`cobrand-row is-align-${preview.align || "center"}`} style={preview.gap != null ? { "--cobrand-gap": `${preview.gap}px` } : undefined}>
        {preview.logos.map((id, index) => {
          const logo = cobrandLogos[id];
          const height = (preview.sizes?.[id] || logo.h) * scale;
          return (
            <Fragment key={id}>
              {index > 0 && preview.divider ? <span className="cobrand-divider" /> : null}
              <img src={logoAsset(logo.file)} alt={t(logo.alt)} style={{ height }} loading="lazy" />
            </Fragment>
          );
        })}
      </div>
    );
  }

  if (preview.kind === "swapText") {
    return (
      <div className={`logo-swap-text ${preview.font === "system" ? "is-system" : ""}`}>
        <img src={logoAsset("krdv-mark-lotus.svg")} alt="" />
        <span>{preview.text}</span>
      </div>
    );
  }

  const img = (
    <img
      src={logoAsset(preview.raster || preview.file)}
      alt=""
      loading="lazy"
      style={{ width: preview.width, ...preview.style }}
    />
  );

  return (
    <div className={`logo-example-art ${preview.position ? `is-${preview.position}` : ""}`}>
      {preview.plate ? <span className="logo-example-plate">{img}</span> : img}
    </div>
  );
}

function LogoExampleGrid({ items, columns = 3 }) {
  return (
    <div className={`logo-example-grid cols-${columns}`}>
      {items.map((item, index) => {
        const { preview } = item;
        const background = preview.photo ? `center / cover no-repeat url(${rasterAsset(preview.photo)})` : preview.bg;
        return (
          <motion.article className={`logo-example is-${item.verdict}`} key={`${item.text}-${index}`} whileHover={{ y: -2 }}>
            <div className="logo-example-preview" style={background ? { background } : undefined}>
              <LogoExamplePreview preview={preview} />
            </div>
            <div className="logo-example-copy">
              <div>
                {item.title ? <h3>{t(item.title)}</h3> : null}
                <p>{t(noDot(item.text))}</p>
              </div>
              <VerdictBadge verdict={item.verdict} />
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}

function LogoBackdrops() {
  const versions = ["ru-square", "en-square"];
  return (
    <div className="logo-backdrops">
      <motion.figure className="logo-backdrop is-light" whileHover={{ y: -2 }}>
        <div>
          {versions.map((id) => (
            <img key={id} className={`is-${id.split("-")[1]}`} src={logoAsset(`krdv-logo-${id}.svg`)} alt="" loading="lazy" style={{ "--logo-ratio": id.startsWith("en") ? 183.59 / 209.8 : 1 }} />
          ))}
        </div>
        <figcaption>{t("Для светлых фонов — написание черного цвета")}</figcaption>
      </motion.figure>
      <motion.figure className="logo-backdrop is-dark" whileHover={{ y: -2 }}>
        <div>
          {versions.map((id) => (
            <img key={id} className={`is-${id.split("-")[1]}`} src={logoAsset(`krdv-logo-${id}-ondark.svg`)} alt="" loading="lazy" style={{ "--logo-ratio": id.startsWith("en") ? 183.59 / 209.8 : 1 }} />
          ))}
        </div>
        <figcaption>{t("Для темных фонов — написание белого цвета")}</figcaption>
      </motion.figure>
    </div>
  );
}

// Схема охранного поля: x — высота левого лепестка знака (≈ треть высоты логотипа).
const CLEARSPACE_X = 40;

function ClearSpaceDiagram({ file, width, height, label }) {
  const x = CLEARSPACE_X;
  const pad = 30;
  const vb = [-x - pad, -x - pad, width + 2 * (x + pad), height + 2 * (x + pad)];
  const corners = [
    [-x, -x],
    [width, -x],
    [-x, height],
    [width, height],
  ];
  const guide = (key, x1, y1, x2, y2, delay) => (
    <line key={key} className="cs-draw cs-guide" x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} style={{ "--cs-delay": `${delay}ms` }} />
  );

  return (
    <motion.figure className="clearspace-card" whileHover={{ y: -2 }}>
      <svg className="clearspace-diagram" viewBox={vb.join(" ")} role="img" aria-label={t(`Охранное поле: ${label}`)}>
        <rect className="cs-fade cs-zone" x={-x} y={-x} width={width + 2 * x} height={height + 2 * x} style={{ "--cs-delay": "200ms" }} />
        <image className="cs-fade cs-logo" href={logoAsset(file)} x={0} y={0} width={width} height={height} style={{ "--cs-delay": "0ms" }} />
        {guide("t", vb[0], 0, vb[0] + vb[2], 0, 500)}
        {guide("b", vb[0], height, vb[0] + vb[2], height, 620)}
        {guide("l", 0, vb[1], 0, vb[1] + vb[3], 740)}
        {guide("r", width, vb[1], width, vb[1] + vb[3], 860)}
        <rect className="cs-draw cs-outline" x={-x} y={-x} width={width + 2 * x} height={height + 2 * x} pathLength={1} style={{ "--cs-delay": "1000ms" }} />
        {corners.map(([cx, cy], index) => (
          <g key={`${cx}-${cy}`} className="cs-fade cs-unit" style={{ "--cs-delay": `${1500 + index * 120}ms` }}>
            <rect x={cx} y={cy} width={x} height={x} />
            <path d={LOGO_PETAL_PATH} transform={`translate(${cx - 33.9} ${cy - 7})`} />
          </g>
        ))}
      </svg>
      <figcaption>{t(label)}</figcaption>
    </motion.figure>
  );
}

function ClearSpaceBoard() {
  return (
    <div className="clearspace-board">
      <ClearSpaceDiagram file="krdv-logo-ru-square.svg" width={209.8} height={125.31} label="Основная версия" />
      <ClearSpaceDiagram file="krdv-logo-ru-horizontal.svg" width={384.61} height={69} label="Дополнительная версия" />
    </div>
  );
}

// Шаблоны презентаций: у каждого своя листалка (первый слайд — обложка) и кнопка скачивания.
function SlideViewer({ decks }) {
  return (
    <div className="slide-decks">
      {decks.map((deck) => (
        <DeckViewer key={deck.id} deck={deck} />
      ))}
    </div>
  );
}

function DeckViewer({ deck }) {
  const [index, setIndex] = useState(0);
  const total = deck.slides.length;
  const slide = deck.slides[index] || deck.slides[0];
  const go = (step) => setIndex((current) => (current + step + total) % total);

  return (
    <div className="slide-viewer">
      <div className="slide-viewer-stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={`${deck.id}-${index}`}
            src={rasterAsset(slide.file)}
            alt={t(`${deck.title}: ${slide.title}`)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        </AnimatePresence>
      </div>
      <div className="slide-viewer-bar">
        <h3 className="slide-viewer-title">{t(deck.title)}</h3>
        <div className="slide-viewer-nav">
          <span>
            {index + 1} / {total}
          </span>
          <button type="button" onClick={() => go(-1)} aria-label={t("Предыдущий слайд")}>
            <UiIcon icon={ICONS.arrowLeft} size={16} strokeWidth={1.5} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label={t("Следующий слайд")}>
            <UiIcon icon={ICONS.arrowRight} size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="slide-viewer-thumbs">
        {deck.slides.map((item, itemIndex) => (
          <button
            key={item.file}
            type="button"
            data-active={itemIndex === index}
            onClick={() => setIndex(itemIndex)}
            aria-label={t(`Слайд ${itemIndex + 1}: ${item.title}`)}
          >
            <img src={rasterAsset(item.file)} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      {deck.download ? (
        <a className="slide-viewer-download" href={deck.download} target="_blank" rel="noreferrer">
          <UiIcon icon={ICONS.download} size={16} strokeWidth={1.5} />
          {t("Скачать шаблон")}
        </a>
      ) : (
        <span className="slide-viewer-download is-pending" title={t("Ссылка на шаблон будет добавлена")}>
          <UiIcon icon={ICONS.download} size={16} strokeWidth={1.5} />
          {t("Скачать шаблон")}
        </span>
      )}
    </div>
  );
}

function MadeSignLibrary() {
  return (
    <div className="made-sign-groups">
      {madeSignGroups.map((group) => (
        <div className="made-sign-group" key={group.id}>
          <h3 className="made-sign-group-title">{t(group.title)}</h3>
          <div className="made-sign-library">
            {group.variants.map((item) => (
              <motion.article className="made-sign-card" data-tone={item.tone} key={item.key} whileHover={{ y: -2 }}>
                <div className="made-sign-preview">
                  {item.signs.map((sign) => (
                    <figure key={sign.lang}>
                      <img src={madeSignAsset(`${sign.file}.svg`)} alt={t(`${group.title}: ${madeSignLangNames[sign.lang]} ${item.title.toLowerCase()}`)} loading="lazy" />
                    </figure>
                  ))}
                </div>
                <div className="made-sign-copy">
                  <h3>{t(item.title)}</h3>
                  <div className="made-sign-downloads">
                    {item.signs.map((sign) => (
                      <div className="made-sign-download-row" key={sign.lang}>
                        <span>{madeSignLangLabels[sign.lang]}</span>
                        <div className="logo-downloads">
                          <div>
                            {madeSignFormats.map((format) => (
                              <LogoDownloadLink
                                key={format}
                                file={`${sign.file}.${format}`}
                                format={format}
                                title={`${group.title}, ${madeSignLangNames[sign.lang]} ${item.title.toLowerCase()}`}
                                asset={madeSignAsset}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Версии логотипа программы/проекта: превью и скачивание каждой версии в SVG и PNG.
function BrandLogoVersions({ items }) {
  return (
    <div className="brand-logo-versions">
      {items.map((item) => (
        <motion.article className="brand-logo-version" key={item.file} whileHover={{ y: -2 }}>
          <div className={`brand-logo-version-preview is-${item.shape}`}>
            <img src={logoAsset(`${item.file}.svg`)} alt={t(item.alt)} loading="lazy" />
          </div>
          <div className="brand-logo-version-copy">
            <h3>{t(item.title)}</h3>
            <div className="logo-downloads">
              <div>
                {["svg", "png"].map((format) => (
                  <LogoDownloadLink key={format} file={`${item.file}.${format}`} format={format} title={item.alt} />
                ))}
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function LogoDownloadLink({ file, format, title, asset = logoAsset }) {
  const [active, setActive] = useState(false);

  return (
    <a
      href={asset(file)}
      download={file}
      onBlur={() => setActive(false)}
      onFocus={() => setActive(true)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      aria-label={t(`Скачать ${title} в формате ${format.toUpperCase()}`)}
    >
      <UiIcon icon={active ? ICONS.arrowDown : ICONS.download} className="format-icon" />
      <span>{format.toUpperCase()}</span>
    </a>
  );
}

// ── «Дизайн соцсетей»: увеличение изображений ──
// Закрывается Escape и кнопкой, держит фокус внутри, возвращает его на исходный элемент; стрелки листают группу.
function SocialLightbox({ items, index, onClose, onIndex }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const item = items[index];
  const many = items.length > 1;

  useEffect(() => {
    const opener = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (many && event.key === "ArrowRight") onIndex((index + 1) % items.length);
      if (many && event.key === "ArrowLeft") onIndex((index - 1 + items.length) % items.length);
      if (event.key === "Tab") {
        const focusable = [...(dialogRef.current?.querySelectorAll("button") || [])];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, many, onClose, onIndex]);

  return (
    <div className="social-lightbox" role="dialog" aria-modal="true" aria-label={t(item.alt)} ref={dialogRef} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <figure className="social-lightbox-figure">
        <img src={item.lg} alt={t(item.alt)} />
        <figcaption>
          {many ? <span className="social-lightbox-count">{index + 1} / {items.length}</span> : null}
          {t(item.alt)}
        </figcaption>
      </figure>
      <div className="social-lightbox-controls">
        {many ? (
          <button type="button" onClick={() => onIndex((index - 1 + items.length) % items.length)} aria-label={t("Предыдущее изображение")}>
            <UiIcon icon={ICONS.arrowLeft} size={18} strokeWidth={1.5} />
          </button>
        ) : null}
        {many ? (
          <button type="button" onClick={() => onIndex((index + 1) % items.length)} aria-label={t("Следующее изображение")}>
            <UiIcon icon={ICONS.arrowRight} size={18} strokeWidth={1.5} />
          </button>
        ) : null}
        <button type="button" ref={closeRef} onClick={onClose} aria-label={t("Закрыть")}>
          <UiIcon icon={ICONS.close} size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

// Состояние увеличения для блока: open(items, index).
function useSocialLightbox() {
  const [state, setState] = useState(null);
  const open = (items, index = 0) => setState({ items, index });
  const node = state ? (
    <SocialLightbox items={state.items} index={state.index} onClose={() => setState(null)} onIndex={(index) => setState((current) => ({ ...current, index }))} />
  ) : null;
  return [open, node];
}

function SocialThumb({ work, onOpen, className = "", label }) {
  return (
    <button type="button" className={`social-thumb ${className}`} onClick={onOpen} aria-label={t(`Открыть целиком: ${label || work.alt}`)} style={{ "--ar": work.ratio }}>
      <img src={work.sm} alt={t(work.alt)} loading="lazy" width={720} height={Math.round(720 / work.ratio)} />
    </button>
  );
}

function SocialMosaic({ rows, note }) {
  const [open, lightbox] = useSocialLightbox();
  const all = rows.flat();
  return (
    <div className="social-mosaic-wrap">
      <div className="social-mosaic">
        {rows.map((row, rowIndex) => (
          <div className="social-mosaic-row" key={rowIndex}>
            {row.map((work) => (
              <SocialThumb key={work.id} work={work} onOpen={() => open(all, all.indexOf(work))} />
            ))}
          </div>
        ))}
      </div>
      {note ? <p className="social-note">{t(note)}</p> : null}
      {lightbox}
    </div>
  );
}

// Лента постов как в соцсети: бесконечно уходит влево, под каждой работой — условные кнопки.
function SocialFeedActions() {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <span className="social-feed-actions" aria-hidden="true">
      <svg viewBox="0 0 24 24" {...common}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>
      <svg viewBox="0 0 24 24" {...common}><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z" /></svg>
      <svg viewBox="0 0 24 24" {...common}><path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Zm-11 10 5-5" /></svg>
      <svg className="social-feed-save" viewBox="0 0 24 24" {...common}><path d="M6 3.5h12v17l-6-4.5-6 4.5v-17Z" /></svg>
    </span>
  );
}

function SocialFeed({ items, note }) {
  const [open, lightbox] = useSocialLightbox();
  const renderSet = (copy) =>
    items.map((work, index) => (
      <button
        key={`${copy}-${work.id}`}
        type="button"
        className="social-feed-post"
        onClick={() => open(items, index)}
        aria-label={t(`Открыть целиком: ${work.alt}`)}
        aria-hidden={copy ? true : undefined}
        tabIndex={copy ? -1 : undefined}
      >
        <img src={work.sm} alt={copy ? "" : t(work.alt)} loading="lazy" width={720} height={720} />
        <SocialFeedActions />
      </button>
    ));
  return (
    <div className="social-feed-wrap">
      <div className="social-feed">
        <div className="social-feed-track" style={{ "--feed-duration": `${items.length * 6}s` }}>
          {renderSet(0)}
          {renderSet(1)}
        </div>
      </div>
      {note ? <p className="social-note">{t(note)}</p> : null}
      {lightbox}
    </div>
  );
}

const socialOverlayVariants = [
  { id: "white", file: "white", title: "Белый", text: "Для фона, на котором логотип хорошо читается." },
  { id: "translucent", file: "translucent", title: "Полупрозрачный", text: "Для спокойного контрастного фона, когда нужен более мягкий акцент." },
  { id: "shade", file: "white-shade", title: "Белый с затемнением", text: "Для светлого или пёстрого фона в зоне логотипа." },
  { id: "translucent-shade", file: "translucent-shade", title: "Полупрозрачный с затемнением", text: "Мягкий акцент на светлом или пёстром фоне." },
];

function SocialBrandedPhoto({ variant = "white", className = "", label }) {
  const translucent = variant.startsWith("translucent");
  const shaded = variant.endsWith("shade");
  return (
    <div className={`social-branded is-${variant} ${className}`} role={label ? "img" : undefined} aria-label={label ? t(label) : undefined} aria-hidden={label ? undefined : true}>
      <img src={socialAsset("demo-photo.webp")} alt="" loading="lazy" width={1080} height={1080} />
      {shaded ? <span className="social-branded-shade" /> : null}
      <img className="social-branded-badge" src={socialAsset(translucent ? "badge-translucent.png" : "badge-white.png")} alt="" loading="lazy" />
    </div>
  );
}

function SocialOverlayDownloads({ file, title }) {
  return (
    <div className="logo-downloads social-overlay-downloads">
      <div>
        {[1080, 2160].map((size) => (
          <a key={size} href={socialAsset(`overlays/krdv-social-${file}-${size}.png`)} download={`krdv-social-${file}-${size}.png`} aria-label={t(`Скачать наложение «${title}», PNG ${size} пикселей`)}>
            <UiIcon icon={ICONS.download} className="format-icon" />
            <span>PNG {size}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// Охранное поле на квадратном посте: при появлении блока по очереди рисуются отступы ½ диаметра
// от логотипа до краёв кадра и до зоны, куда нельзя ставить другие элементы (как схема охранного поля логотипа КРДВ).
function SocialClearSpace() {
  const d = 90;
  const x = d / 2;
  const c = x + d / 2;
  const zone = x + d + x;
  return (
    <svg className="social-clearspace" viewBox="0 0 360 360" role="img" aria-label={t("Схема охранного поля на квадратном посте: от логотипа до краёв кадра и до других элементов — не меньше половины диаметра круга")}>
      <rect x="0.5" y="0.5" width="359" height="359" rx="8" className="cs-post" />
      <rect x="0.5" y="0.5" width={zone} height={zone} className="cs-zone-fill cs-fade" style={{ "--cs-delay": "1200ms" }} />
      <rect x={x} y={x} width={d} height={d} pathLength={1} className="cs-draw cs-guide-box" style={{ "--cs-delay": "250ms" }} />
      <circle cx={c} cy={c} r={d / 2} className="cs-badge cs-fade" />
      <text x={c} y={c + 6} className="cs-badge-text cs-fade">КРДВ</text>
      <line x1="1" y1={c} x2={x} y2={c} pathLength={1} className="cs-draw cs-measure" style={{ "--cs-delay": "500ms" }} />
      <line x1={c} y1="1" x2={c} y2={x} pathLength={1} className="cs-draw cs-measure" style={{ "--cs-delay": "650ms" }} />
      <line x1={x + d} y1={c} x2={zone} y2={c} pathLength={1} className="cs-draw cs-measure" style={{ "--cs-delay": "800ms" }} />
      <line x1={c} y1={x + d} x2={c} y2={zone} pathLength={1} className="cs-draw cs-measure" style={{ "--cs-delay": "950ms" }} />
      <rect x="0.5" y="0.5" width={zone} height={zone} pathLength={1} className="cs-draw cs-zone" style={{ "--cs-delay": "1100ms" }} />
      <text x={x / 2} y={c - 8} className="cs-label cs-fade" style={{ "--cs-delay": "700ms" }}>½</text>
      <text x={c + 8} y={x / 2 + 4} className="cs-label cs-fade" style={{ "--cs-delay": "800ms" }}>½</text>
      <text x={x + d + x / 2} y={c - 8} className="cs-label cs-fade" style={{ "--cs-delay": "950ms" }}>½</text>
      <text x={c + 8} y={x + d + x / 2 + 4} className="cs-label cs-fade" style={{ "--cs-delay": "1100ms" }}>½</text>
      <text x={zone + 18} y={c - 6} className="cs-note-strong cs-fade" style={{ "--cs-delay": "1300ms" }}>Охранное поле</text>
      <text x={zone + 18} y={c + 18} className="cs-note cs-fade" style={{ "--cs-delay": "1350ms" }}>½ диаметра круга</text>
      <text x={zone + 18} y={c + 40} className="cs-note cs-fade" style={{ "--cs-delay": "1400ms" }}>до краёв кадра</text>
      <text x={zone + 18} y={c + 62} className="cs-note cs-fade" style={{ "--cs-delay": "1450ms" }}>и других элементов</text>
      <text x="180" y="330" className="cs-post-label cs-fade" style={{ "--cs-delay": "1500ms" }}>Пост 1:1</text>
    </svg>
  );
}

function SocialPhotoBlock() {
  return (
    <div className="social-photo-block">
      <div className="social-photo-intro">
        <figure className="social-card social-badge-card">
          <div className="social-badge-stage">
            <img src={socialAsset("badge-white.png")} alt={t("Логотип для соцсетей КРДВ")} loading="lazy" />
          </div>
          <figcaption>{t("Логотип для соцсетей КРДВ")}</figcaption>
        </figure>
        <figure className="social-card social-clearspace-card">
          <div className="social-clearspace-stage">
            <SocialClearSpace />
          </div>
          <figcaption>{t("Охранное поле на квадратном посте")}</figcaption>
        </figure>
      </div>
      <div className="social-variants">
        {socialOverlayVariants.map((variant) => (
          <figure className="social-card social-variant" key={variant.id}>
            <SocialBrandedPhoto variant={variant.id} label={`Фотография с логотипом КРДВ: ${variant.title.toLowerCase()}`} />
            <figcaption>
              <strong>{t(variant.title)}</strong>
              <span>{t(variant.text)}</span>
            </figcaption>
            <SocialOverlayDownloads file={variant.file} title={variant.title} />
          </figure>
        ))}
      </div>
      <div className="social-large">
        <div className="spec-columns is-notes">
          <div className="spec-text">
            <h3>{t("Укрупнённый логотип")}</h3>
            <p>
              <span>{t("Для альбома из нескольких фотографий есть укрупнённый логотип: в миниатюре альбома обычный теряется. Его ставят только на первую фотографию, остальные публикуются без логотипа. Раскладка альбома в соцсети может отличаться от схемы.")}</span>
            </p>
          </div>
        </div>
        <SocialOverlayDownloads file="large" title="Укрупнённый" />
        <div className="social-albums">
          {[6, 9].map((count) => (
            <figure className="social-card social-album" key={count}>
              <div className={`social-album-grid is-${count}`} role="img" aria-label={t(`Схема альбома из ${count} фотографий: первая — с укрупнённым логотипом`)}>
                {Array.from({ length: count }, (_, index) =>
                  index === 0 ? <SocialBrandedPhoto key={index} variant="large" className="is-tile" /> : <span key={index} className="social-album-tile" />,
                )}
              </div>
              <figcaption>{t(`Альбом из ${count} фотографий`)}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialFormats({ items, note }) {
  const [open, lightbox] = useSocialLightbox();
  return (
    <div className="social-formats-wrap">
      <div className="social-formats">
        {items.map((item) => (
          <article className={`social-card social-format ${item.wide ? "is-wide" : ""}`} key={item.title}>
            <div className="social-format-media">
              <SocialThumb work={item.work} onOpen={() => open(item.group || [item.work], 0)} label={item.title} />
              {item.count ? <span className="social-format-count">{t(`${item.count} карточек`)}</span> : null}
            </div>
            <div className="social-format-copy">
              <h3>{t(item.title)}</h3>
              <p className="is-purpose">{t(item.purpose)}</p>
              <p>{t(item.rule)}</p>
            </div>
          </article>
        ))}
      </div>
      {note ? <p className="social-note">{t(note)}</p> : null}
      {lightbox}
    </div>
  );
}

function SocialAnatomy({ data }) {
  const [open, lightbox] = useSocialLightbox();
  return (
    <div className="social-anatomy">
      <div className="social-anatomy-media">
        <ol className="social-anatomy-markers" aria-hidden="true">
          {data.parts.map((part, index) => (
            <li key={part.title} style={{ top: `${part.at}%` }}>
              {index + 1}
            </li>
          ))}
        </ol>
        <SocialThumb work={data.work} onOpen={() => open([data.work], 0)} />
      </div>
      <div className="social-anatomy-copy">
        <ol className="social-anatomy-list">
          {data.parts.map((part, index) => (
            <li key={part.title}>
              <b>{index + 1}</b>
              <span>
                <strong>{t(part.title)}</strong>
                {t(part.text)}
              </span>
            </li>
          ))}
        </ol>
        <div className="social-type-roles">
          <div>
            <span className="text-example-label">TT Norms Pro Bold — заголовок</span>
            <p className="is-bold">2% ипотека</p>
          </div>
          <div>
            <span className="text-example-label">TT Norms Pro Light — короткий подзаголовок</span>
            <p className="is-light">в 2026 году</p>
          </div>
        </div>
      </div>
      {lightbox}
    </div>
  );
}

function SocialSeries({ series, link, navigate }) {
  const [open, lightbox] = useSocialLightbox();
  return (
    <div className="social-series-wrap">
      {series.map((item) => (
        <figure className="social-series" key={item.title}>
          <figcaption>
            <h3>{t(item.title)}</h3>
          </figcaption>
          <ol className="social-series-grid" aria-label={t(item.alt)}>
            {item.items.map((work, index) => (
              <li key={work.id}>
                <SocialThumb work={work} onOpen={() => open(item.items, index)} label={`${item.title}, карточка ${index + 1} из ${item.items.length}`} />
              </li>
            ))}
          </ol>
        </figure>
      ))}
      {link ? (
        <button type="button" className="social-inline-link" onClick={() => navigate(link.page)}>
          {t(link.label)}
          <UiIcon icon={ICONS.arrowRight} size={16} strokeWidth={1.5} />
        </button>
      ) : null}
      {lightbox}
    </div>
  );
}

function SocialGraphics({ groups }) {
  const [open, lightbox] = useSocialLightbox();
  return (
    <div className="social-graphics">
      {groups.map((group) => (
        <article className="social-graphics-group" key={group.title}>
          <div className="spec-columns is-notes">
            <div className="spec-text">
              <h3>{t(group.title)}</h3>
              <p>
                <span>{t(group.text)}</span>
              </p>
            </div>
          </div>
          <div className="social-graphics-row">
            {group.works.map((work, index) => (
              <SocialThumb key={work.id} work={work} onOpen={() => open(group.works, index)} />
            ))}
          </div>
        </article>
      ))}
      {lightbox}
    </div>
  );
}

function ResourceLinks({ keys }) {
  const links = keys.map((key) => downloadResources[key]).filter(Boolean);

  return (
    <div className={`resource-links ${links.length === 1 ? "is-single" : ""}`}>
      {links.map((item) =>
        !item.url ? (
          <div className="resource-link-pending" key={item.title} aria-disabled="true">
            <div>
              <strong>{t(item.title)}</strong>
              <p>{t(noDot(item.description))}</p>
            </div>
            <em>{t(item.pending || "Ссылка появится позже")}</em>
          </div>
        ) : (
        <motion.a key={item.url} href={item.url} target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }}>
          <div>
            <strong>{t(item.title)}</strong>
            <p>{t(noDot(item.description))}</p>
          </div>
          <em>
            {t(item.action || "Открыть архив")}
            <UiIcon icon={ICONS.arrowRight} className="resource-link-icon" />
          </em>
        </motion.a>
        ),
      )}
    </div>
  );
}

function AssetImageGrid({ items, mode = "grid" }) {
  const imagesOnly = mode === "imagesOnly" || mode === "stack" || mode === "row3";

  return (
    <LayoutGroup>
      <motion.div className={`asset-image-grid is-${mode}`} layout>
        {items.map((item) => (
          <motion.article className={`asset-image-card ${item.wide ? "is-wide" : ""} ${item.contained ? "is-contained" : ""} ${item.embeddedText ? "has-embedded-text" : ""} ${item.mockup ? "is-mockup" : ""} ${item.cover ? "is-cover" : ""}`} key={item.file} layout whileHover={{ y: -2 }}>
            <div className="asset-image-frame">
              {item.placeholder ? (
                <div className="asset-image-placeholder" role="img" aria-label={t(item.title)} style={item.ratio ? { aspectRatio: item.ratio } : undefined}>
                  <span>{t(item.mockup ? "Мокап будет добавлен" : "Фото будет добавлено")}</span>
                </div>
              ) : (
                <img src={rasterAsset(item.file)} alt={t(item.title)} loading="lazy" />
              )}
            </div>
            {item.embeddedText || imagesOnly ? null : (
              <div className="asset-image-copy">
                <h3>{t(item.title)}</h3>
                <p>{t(noDot(item.caption))}</p>
              </div>
            )}
          </motion.article>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

function PlaceholderGrid({ items }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <LayoutGroup>
      <div className="asset-morph-board">
        <motion.div className={`placeholder-grid count-${Math.min(items.length, 4)}`} layout>
          {items.map((item, index) => (
            <MediaPlaceholder
              key={`${item.title}-${index}`}
              title={item.title}
              caption={item.caption}
              selected={selectedIndex === index}
              onSelect={() => setSelectedIndex(index)}
            />
          ))}
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

function MediaPlaceholder({ title, caption, selected, onSelect }) {
  return (
    <motion.button
      className="media-placeholder"
      data-active={selected}
      type="button"
      layout
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.992 }}
    >
      <div>
        <span>{t(title)}</span>
      </div>
      <span className="media-caption">{t(noDot(caption))}</span>
    </motion.button>
  );
}

function isDarkColor(hex) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 150;
}

function PalettePhoto({ item, style }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useReducedMotion();
  const mediaStyle = item.position ? { objectPosition: item.position } : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    let cancelled = false;
    if (reduceMotion) {
      video.pause();
      setPlaying(false);
    } else {
      video.play().catch(() => {
        if (!cancelled) setPlaying(false);
      });
    }
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [reduceMotion]);

  return (
    <div className="swatch-photo" style={style} data-playing={playing}>
      <img src={rasterAsset(item.photo)} alt={t(item.alt)} loading="lazy" style={mediaStyle} />
      {item.video && (
        <video ref={videoRef} src={rasterAsset(item.video)} poster={rasterAsset(item.photo)}
          autoPlay={!reduceMotion} loop muted playsInline preload="metadata"
          aria-hidden="true" tabIndex={-1} style={mediaStyle}
          onPlaying={() => {
            if (!reduceMotion) setPlaying(true);
            else videoRef.current?.pause();
          }}
          onError={() => setPlaying(false)} />
      )}
    </div>
  );
}

// Палитра как в DevRev: цветные плитки с кодами внутри, «Скопировать HEX» появляется при наведении.
function PaletteGrid({ colors, separate = false }) {
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = window.setTimeout(() => setCopied(""), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyHex(hex) {
    setCopied(hex);
    try {
      await navigator.clipboard?.writeText(hex);
    } catch {
      // Clipboard is optional in local preview and restricted browser contexts.
    }
  }

  return (
    <div className={`swatch-board ${separate ? "is-separate" : ""}`}>
      {colors.map((item) => {
        const [colStart, colEnd, rowStart, rowEnd] = item.area;
        const style = { "--col": `${colStart} / ${colEnd}`, "--row": `${rowStart} / ${rowEnd}` };

        if (item.photo) {
          return (
            <PalettePhoto key={item.photo} item={item} style={style} />
          );
        }

        return (
          <button
            key={item.hex}
            type="button"
            className={`swatch ${isDarkColor(item.hex) ? "is-dark" : ""}`}
            style={{ ...style, backgroundColor: item.hex }}
            onClick={() => copyHex(item.hex)}
            aria-label={t(`Скопировать HEX цвета ${item.name}`)}
          >
            <span className="swatch-copy" data-copied={copied === item.hex}>
              {t(copied === item.hex ? "Скопировано" : "Скопировать HEX")}
            </span>
            <span className="swatch-info">
              <strong>{t(item.name)}</strong>
              <span>HEX: {item.hex}</span>
              <span>RGB: {item.rgb}</span>
              <span>CMYK: {item.cmyk}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TypeSpecimens({ items }) {
  return (
    <div className="type-stack">
      {items.map((item) => (
        <TypeSpecimen key={item} title={item} />
      ))}
    </div>
  );
}

function TypeSpecimen({ title }) {
  const variant = title.includes("Tsars") ? "tsars" : title.includes("Serif") ? "serif" : "norms";
  const copy = variant === "tsars" ? "Благодарность за вклад в развитие" : "Коммуникация должна быть точной";

  return (
    <article className={`type-specimen is-${variant}`}>
      <span>{title}</span>
      <p>{t(noDot(copy))}</p>
      <em>{t(variant === "tsars" ? "Гарнитура для наградных документов." : "Фирменная шрифтовая система КРДВ.")}</em>
    </article>
  );
}

function getDefaultFontIndex(family) {
  const index = family.files.findIndex((file) => file.file === family.defaultFile);
  return index >= 0 ? index : 0;
}

function FontWorkbench() {
  const [familyId, setFamilyId] = useState("norms");
  const selectedFamily = fontFamilies.find((family) => family.id === familyId) || fontFamilies[0];
  const [styleIndex, setStyleIndex] = useState(getDefaultFontIndex(selectedFamily));
  const [previewSize, setPreviewSize] = useState(64);
  const [sample, setSample] = useState(selectedFamily.sample);
  const selectedStyle = selectedFamily.files[styleIndex] || selectedFamily.files[0];
  const fallback = selectedFamily.id === "tsars" || selectedFamily.id === "serif" ? "Georgia, serif" : "Arial, sans-serif";
  const preferredStyles = ["Light", "Regular", "Normal", "Medium", "DemiBold", "Bold", "Black"];
  const styleOptions = selectedFamily.files.filter((file) => preferredStyles.includes(file.label) || file.file === selectedStyle?.file);

  function selectFamily(family) {
    setFamilyId(family.id);
    setStyleIndex(getDefaultFontIndex(family));
    setSample((current) => (current === selectedFamily.sample ? family.sample : current));
  }

  return (
    <div className="font-workbench">
      <div className="font-preview-panel">
        <AuroraBackground className="font-preview-aurora" />
        <div className="font-preview-meta">
          <span>{t(selectedFamily.role)}</span>
          <em>{selectedStyle ? `${selectedStyle.label} · ${selectedStyle.weight}` : t("Лицензионный пакет")}</em>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedFamily.id}-${selectedStyle?.file || "missing"}-${sample}-${previewSize}`}
            className="font-preview-sample"
            style={{
              "--preview-size": `${previewSize}px`,
              fontFamily: `"${selectedFamily.cssFamily}", ${fallback}`,
              fontWeight: selectedStyle?.weight || 400,
              fontStyle: selectedStyle?.style || "normal",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {t(sample || selectedFamily.sample)}
          </motion.div>
        </AnimatePresence>
        <p>{t(noDot(selectedFamily.description))}</p>
        {selectedFamily.unavailable ? <small>{t(selectedFamily.unavailable)}</small> : null}
      </div>

      <div className="font-workbench-controls">
        <div className="font-family-tabs" role="tablist" aria-label={t("Семейства шрифтов")}>
          {fontFamilies.map((family) => (
            <button
              key={family.id}
              type="button"
              role="tab"
              aria-selected={selectedFamily.id === family.id}
              data-active={selectedFamily.id === family.id}
              onClick={() => selectFamily(family)}
            >
              <strong>{family.title}</strong>
              <span>{t(family.role)}</span>
            </button>
          ))}
        </div>

        <label className="font-preview-input">
          <span>{t("Фраза для проверки")}</span>
          <input
            value={sample}
            onChange={(event) => setSample(event.target.value)}
          />
        </label>

        <div className="font-style-chips" aria-label={t("Начертания")}>
          <span>{t("Начертание")}</span>
          {styleOptions.length ? (
            <div>
              {styleOptions.map((file) => {
                const index = selectedFamily.files.findIndex((item) => item.file === file.file);
                return (
                  <button key={file.file} type="button" data-active={selectedStyle?.file === file.file} onClick={() => setStyleIndex(index)}>
                    {file.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <p>{t("Для Serif-семейства используется отдельный лицензионный пакет TypeType.")}</p>
          )}
        </div>

        <label className="font-size-control">
          <span>{t("Размер")}</span>
          <strong>{previewSize}px</strong>
          <input
            type="range"
            min="32"
            max="104"
            value={previewSize}
            onChange={(event) => setPreviewSize(Number(event.target.value))}
          />
        </label>

      </div>
    </div>
  );
}

function RegimePalette({ items }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState("");
  const selected = items[selectedIndex] || items[0];

  async function copyHex(item) {
    setCopied(item.short);
    try {
      await navigator.clipboard?.writeText(item.color);
    } catch {
      // Clipboard access can be unavailable in local preview contexts.
    }
  }

  return (
    <LayoutGroup>
      <div className="regime-palette-stage" style={{ "--active-regime-color": selected?.color }}>
        <motion.div className="regime-palette" layout>
          {items.map((item, index) => (
            <motion.button
              key={item.short}
              type="button"
              layout
              data-active={selectedIndex === index}
              style={{ "--regime-color": item.color }}
              onClick={() => {
                setSelectedIndex(index);
                copyHex(item);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.992 }}
              aria-label={t(`Скопировать HEX цвета ${item.short}`)}
            >
              <i />
              <strong>{t(item.short)}</strong>
              <span>{t(item.title)}</span>
              <em>{item.color}</em>
              <span className="copy-action" data-copied={copied === item.short}>
                <UiIcon icon={copied === item.short ? ICONS.check : ICONS.copy} className="copy-action-icon" />
                <span>{t(copied === item.short ? "Скопировано" : "Скопировать HEX")}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

function ContactBlock({ items }) {
  return (
    <address className="contact-block">
      {items.map((item) => (
        <span key={item}>{t(item)}</span>
      ))}
    </address>
  );
}

function ContactCta({ item }) {
  return (
    <a className="contact-cta" href={item.href} target="_blank" rel="noreferrer">
      <span className="contact-cta-copy">
        <span>{t(item.title)}</span>
        <p>{t(noDot(item.text))}</p>
        <strong>
          {t(item.label)}
          <UiIcon icon={ICONS.arrowRight} className="contact-cta-icon" />
        </strong>
      </span>
      {item.image ? (
        <span className="contact-cta-visual" aria-hidden="true">
          <img src={rasterAsset(item.image)} alt="" loading="lazy" />
        </span>
      ) : null}
    </a>
  );
}

// Тонкая стрелка навигации между разделами: длинное древко, острый наконечник — в характере стрелок меню.
function NavArrow({ direction }) {
  return (
    <svg className="end-link-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d={direction === "left" ? "M23 12H1.5M8.5 5L1.5 12l7 7" : "M1 12h21.5M15.5 5l7 7-7 7"} />
    </svg>
  );
}

function EndLinks({ activePageId, navigate }) {
  const baseId = pagesById[activePageId]?.previewOf || activePageId;
  const currentIndex = pagesData.findIndex((page) => page.id === baseId);
  const previous = pagesData[currentIndex - 1] || pagesData[pagesData.length - 1];
  const next = pagesData[currentIndex + 1] || pagesData[0];

  return (
    <nav className="end-links" aria-label={t("Переходы между разделами")}>
      <button type="button" onClick={() => navigate(previous.id)} aria-label={t(`Предыдущий раздел: ${previous.title}`)}>
        <span>
          <b>{previous.number}</b>
          {t(previous.navTitle || previous.title)}
        </span>
        <NavArrow direction="left" />
      </button>
      <button type="button" onClick={() => navigate(next.id)} aria-label={t(`Следующий раздел: ${next.title}`)}>
        <span>
          <b>{next.number}</b>
          {t(next.navTitle || next.title)}
        </span>
        <NavArrow direction="right" />
      </button>
    </nav>
  );
}

const footerContactHref = pagesById.contacts.sections[0].contactCta.href;

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <p>{t("Руководство по использованию фирменного стиля")}</p>
        <p className="is-muted">{t("Версия 1.0")}</p>
        <div>
          <p>{t("Вопросы по руководству:")}</p>
          <a className="is-muted" href={footerContactHref} target="_blank" rel="noreferrer">
            {t("написать в MAX")}
          </a>
        </div>
        <div className="site-footer-links">
          <a href="https://erdc.ru" target="_blank" rel="noreferrer">
            erdc.ru
          </a>
        </div>
      </div>
      <div className="site-footer-bottom">
        <img className="site-footer-logo" src={logoAsset("krdv-logo-ru-horizontal-white.svg")} alt={t("Корпорация развития Дальнего Востока и Арктики")} />
        <p>{t(`© ${new Date().getFullYear()} АО «КРДВ»`)}</p>
        <button type="button" onClick={() => document.getElementById("page")?.scrollTo({ top: 0, behavior: "smooth" })}>
          {t("Наверх")}
        </button>
      </div>
    </footer>
  );
}

export { App };
