import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react";
import { MorphIcon } from "morphicons/react";

const assetPath = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;
const heroAsset = (filename) => assetPath(`/assets/hero/${filename}`);
const vectorAsset = (filename) => assetPath(`/assets/brandbook/vector/${filename}`);
const rasterAsset = (filename) => assetPath(`/assets/brandbook/raster/${filename}`);
const logoAsset = (filename) => assetPath(`/assets/logos/${filename}`);
const regimeSignAsset = (filename) => assetPath(`/assets/regime-signs/${filename}`);
const subsidiaryAsset = (filename) => assetPath(`/assets/subsidiaries/${filename}`);
const madeSignAsset = (filename) => assetPath(`/assets/made-signs/${filename}`);
const fontAsset = (filename) => assetPath(`/fonts/${filename}`);
const downloadAsset = (filename) => assetPath(`/downloads/${filename}`);

const ICONS = {
  arrowLeft: "M15 6l-6 6 6 6M9 12h12",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  arrowRight: "M9 6l6 6-6 6M3 12h12",
  check: "M5 12l4 4L19 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronUp: "M6 15l6-6 6 6",
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

const primaryPalette = [
  { name: "Дальневосточный синий", hex: "#0056a2", rgb: "0-86-162", cmyk: "100-75-00-00", pantone: "Pantone 286C" },
  { name: "Голубой", hex: "#22a8e0", rgb: "34-168-225", cmyk: "72-15-00-00" },
  { name: "Светло-синий", hex: "#9ec6eb", rgb: "158-198-235", cmyk: "24-13-00-00" },
  { name: "Ледяной голубой", hex: "#d4e6fa", rgb: "212-230-250", cmyk: "15-5-00-00" },
  { name: "Темно-синий", hex: "#001d37", rgb: "0-30-55", cmyk: "100-84-47-58" },
  { name: "Глубокий синий", hex: "#0c5082", rgb: "12-80-130", cmyk: "100-73-24-9" },
  { name: "Красный акцент", hex: "#de2327", rgb: "222-35-39", cmyk: "5-100-100-00", pantone: "Pantone 186C" },
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
  { name: "Арктический изумрудный", hex: "#003b39", rgb: "0-59-57", cmyk: "91-47-61-59" },
  { name: "Изумрудный", hex: "#308d86", rgb: "48-141-134", cmyk: "78-24-49-7" },
  { name: "Глубокий изумрудный", hex: "#0a5c57", rgb: "10-92-87", cmyk: "87-38-58-35" },
  { name: "Светлый арктический", hex: "#cce0e6", rgb: "204-224-230", cmyk: "24-5-10-00" },
  { name: "Ледяной арктический", hex: "#e4f0f2", rgb: "228-240-242", cmyk: "13-2-6-00" },
];

const regimes = [
  { short: "ТОР", title: "Территории опережающего развития", color: "#762a57" },
  { short: "СПВ", title: "Свободный порт Владивосток", color: "#26579a" },
  { short: "КОРФ", title: "Курильские острова Российской Федерации", color: "#5c829f" },
  { short: "САР", title: "Специальный административный район", color: "#4d8b85" },
  { short: "АЗРФ", title: "Арктическая зона Российской Федерации", color: "#51a5da" },
  { short: "ИНТЦ", title: "Инновационный научно-технологический центр", color: "#b5a1ea" },
  { short: "Гектар", title: "Программа гектар", color: "#20453a" },
  { short: "Работа", title: "Программа работа", color: "#2b3a46" },
  { short: "Ипотека", title: "Ипотека 2%", color: "#8a6f8e" },
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

const regimeColorCoding = ["Гектар", "СПВ", "КОРФ", "ТОР", "САР", "Работа", "АЗРФ", "Ипотека", "ИНТЦ"]
  .map((short) => regimes.find((item) => item.short === short))
  .filter(Boolean);

const positioningPrinciples = [
  { title: "Качественно", text: "Экспертиза, точность и профессиональный опыт в каждом контакте с аудиторией." },
  { title: "Просто", text: "Понятный путь к мерам поддержки, цифровым сервисам и практическим решениям." },
  { title: "Выгодно", text: "Льготы, инфраструктура и условия, которые усиливают экономику проектов." },
  { title: "Надежно", text: "Ответственная поддержка граждан и бизнеса в долгих сценариях развития." },
];

const textRecommendationImages = [
  { title: "Кавычки", caption: "Контроль русских кавычек «елочки» и вложенных „лапок“.", file: "text-recommendation-1.png" },
  { title: "Тире", caption: "Разделение длинного тире в предложении и среднего тире в числовых интервалах.", file: "text-recommendation-2.png" },
  { title: "Деньги", caption: "Неразрывный пробел между суммой и знаком валюты при постпозиции.", file: "text-recommendation-3.png" },
  { title: "Телефоны", caption: "Единая запись номера с кодом страны, кодом города и группами цифр.", file: "text-recommendation-4.png" },
  { title: "Сокращения", caption: "Сокращенные слова с точкой и физические единицы СИ без точки.", file: "text-recommendation-5.png" },
  { title: "Млн и млрд", caption: "Количественные сокращения без точки в деловых и презентационных текстах.", file: "text-recommendation-6.png" },
  { title: "География", caption: "Родовые термины, стороны света, официальные и неофициальные названия регионов.", file: "text-recommendation-7.png" },
  { title: "Финальная проверка", caption: "Пробелы, служебные слова и знаки приводятся к единому наборному стандарту.", file: "text-recommendation-8.png" },
];

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
const madeSignFormats = ["svg", "png", "jpg"];

const ttNormsFontFiles = [
  { label: "Thin", weight: 100, style: "normal", file: "TT-Norms-Pro-Thin.ttf" },
  { label: "Thin Italic", weight: 100, style: "italic", file: "TT-Norms-Pro-Thin-Italic.ttf" },
  { label: "ExtraLight", weight: 200, style: "normal", file: "TT-Norms-Pro-ExtraLight.ttf" },
  { label: "ExtraLight Italic", weight: 200, style: "italic", file: "TT-Norms-Pro-ExtraLight-Italic.ttf" },
  { label: "Light", weight: 300, style: "normal", file: "TT-Norms-Pro-Light.ttf" },
  { label: "Light Italic", weight: 300, style: "italic", file: "TT-Norms-Pro-Light-Italic.ttf" },
  { label: "Normal", weight: 350, style: "normal", file: "TT-Norms-Pro-Normal.ttf" },
  { label: "Normal Italic", weight: 350, style: "italic", file: "TT-Norms-Pro-Normal-Italic.ttf" },
  { label: "Regular", weight: 400, style: "normal", file: "TT-Norms-Pro-Regular.ttf" },
  { label: "Italic", weight: 400, style: "italic", file: "TT-Norms-Pro-Italic.ttf" },
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
    role: "Торжественная документация",
    cssFamily: "TT Tsars",
    sample: "Грамота за развитие территорий",
    description: "Гарнитура для благодарностей, благодарственных писем, почетных грамот и других наградных документов.",
    defaultFile: "TT-Tsars-A-Regular.woff2",
    files: ttTsarsFontFiles,
  },
];

const isDesktopFontFile = (fontFile) => /\.(ttf|otf)$/i.test(fontFile.file);
const downloadableFontFamilies = fontFamilies
  .map((family) => ({ ...family, files: family.files.filter(isDesktopFontFile) }))
  .filter((family) => family.files.length > 0);
const fontArchive = {
  title: "Все шрифты КРДВ",
  file: "krdv-fonts.zip",
  count: downloadableFontFamilies.reduce((total, family) => total + family.files.length, 0),
};

const logoVariants = {
  "ru-horizontal": {
    title: "Русская горизонтальная версия",
    role: "Основная версия",
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
    role: "Дополнительная версия",
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
    role: "Основная международная версия",
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
    role: "Дополнительная международная версия",
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
  { set: "ru-vertical", slug: "kamchatka-extra", title: "КРДВ Камчатка", note: "Дополнительный вариант из архива." },
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

const subsidiaryLogoSets = subsidiaryLogos.reduce((sets, item) => {
  sets[item.set] = [...(sets[item.set] || []), item];
  return sets;
}, {});

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
  preview: `regime-${item.slug}.svg`,
  files: {
    svg: `regime-${item.slug}.svg`,
    png: `regime-${item.slug}.png`,
    pdf: `regime-${item.slug}.pdf`,
  },
}));

const madeSignVariants = [
  { slug: "made-tor-spv-ru-purple", title: "Русская фиолетовая версия", tone: "purple" },
  { slug: "made-tor-spv-ru-black", title: "Русская черная версия", tone: "black" },
  { slug: "made-tor-spv-ru-outline", title: "Русская контурная версия", tone: "outline" },
  { slug: "made-tor-spv-ru-white", title: "Русская белая версия", tone: "white" },
  { slug: "made-tor-spv-en-purple", title: "Английская фиолетовая версия", tone: "purple" },
  { slug: "made-tor-spv-en-black", title: "Английская черная версия", tone: "black" },
  { slug: "made-tor-spv-en-outline", title: "Английская контурная версия", tone: "outline" },
].map((item) => ({
  ...item,
  preview: `${item.slug}.svg`,
  files: {
    svg: `${item.slug}.svg`,
    png: `${item.slug}.png`,
    jpg: `${item.slug}.jpg`,
  },
}));

const madeBrandingImages = [
  { title: "Упаковка резидента", caption: "Знак размещается как подтверждение происхождения продукции.", file: "made-branding-1.webp" },
  { title: "Пищевая продукция", caption: "Маркировка работает на этикетке и поддерживает доверие к производителю.", file: "made-branding-2.webp" },
  { title: "Серия упаковок", caption: "Единый знак помогает связать несколько товаров в одну линейку.", file: "made-branding-3.webp" },
  { title: "Бирка товара", caption: "Малый носитель сохраняет знак читаемым без лишней графики.", file: "made-branding-4.webp" },
  { title: "Потребительская тара", caption: "Размещение подбирается под форму и контраст упаковки.", file: "made-branding-5.webp" },
  { title: "Полка продукции", caption: "Серийное нанесение делает маркировку заметной в группе товаров.", file: "made-branding-6.webp", wide: true },
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
    { title: "Выступление", caption: "Кадр выступления с живой аудиторией и понятным контекстом.", file: "photostyle-composition-8.webp" },
  ],
  nature: [
    { title: "Полярное сияние", caption: "Захватывающий природный кадр Арктики.", file: "photostyle-composition-10.webp" },
    { title: "Вулканический пейзаж", caption: "Достоверный региональный пейзаж Дальнего Востока.", file: "photostyle-composition-9.webp" },
    { title: "Арктический маршрут", caption: "Природа и маршрут в условиях северного региона.", file: "photostyle-composition-15.webp" },
  ],
  people: [
    { title: "Культурный сюжет", caption: "Люди в контексте традиций и региональной культуры.", file: "photostyle-composition-5.webp" },
    { title: "Аутентичный сюжет", caption: "Сюжет с действием и культурным контекстом.", file: "photostyle-composition-13.webp" },
    { title: "Люди Арктики", caption: "Портретный сюжет с северной повседневностью.", file: "photostyle-composition-14.webp" },
    { title: "Традиционное выступление", caption: "Эмоциональный кадр людей и культуры региона.", file: "photostyle-composition-16.webp" },
  ],
};

const appendixSocialImages = [
  { title: "Публикация", caption: "Композиция для основного поста с фирменной графикой и текстовым блоком.", file: "appendix-social-1.webp", wide: true },
  { title: "Карточка с персоной", caption: "Формат для спикера, эксперта или героя материала.", file: "appendix-social-2.webp", contained: true },
];

const logoMisuseImages = [
  { title: "Старые версии", caption: "Запрещено использовать старые версии логотипа.", file: "logo-misuse-1.png" },
  { title: "Цвет", caption: "Запрещено изменение цвета.", file: "logo-misuse-2.png" },
  { title: "Знак без текста", caption: "Не допускается использование знака без текстовой части логотипа.", file: "logo-misuse-3.png" },
  { title: "Пропорции", caption: "Не допускается искажение пропорций элементов логотипа.", file: "logo-misuse-4.png" },
  { title: "Изменение типографики", caption: "Запрещено изменять типографику логотипа.", file: "logo-misuse-5.png" },
  { title: "Эффекты", caption: "Запрещено использовать дополнительные эффекты для элементов логотипа.", file: "logo-misuse-6.png" },
];

const logoBackgroundRuleImages = Array.from({ length: 8 }, (_, index) => ({
  title: `Фон и контраст ${index + 1}`,
  file: `logo-background-rule-${index + 1}.png`,
  embeddedText: true,
}));

const pagesData = [
  {
    id: "overview",
    number: "00",
    title: "Обзор",
    intro: "Руководство определяет визуальную систему АО «КРДВ»: от позиционирования и логотипа до цветов, шрифтов, носителей, фотостиля и материалов для скачивания.",
    sections: [
      {
        id: "guide",
        title: "Руководство",
        lead: "Руководство по использованию фирменного стиля АО «КРДВ».",
        paragraphs: ["Единые правила помогают сохранять узнаваемость корпорации во внутренних и внешних коммуникациях, печатных материалах, презентациях, рекламных носителях и цифровой среде."],
        keywords: ["АО «КРДВ»", "Дальний Восток", "Арктика", "фирменный стиль", "визуальные коммуникации"],
      },
      {
        id: "contents",
        title: "Содержание",
        lead: "Навигационная карта ведет в каждый раздел и показывает, сколько смысловых блоков внутри.",
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
        lead: "Дальний Восток и Арктика — ближе к будущему!",
        paragraphs: ["Вокруг этого обещания строятся смысловые пары: ближе к успеху, ближе к мечте, земля, знания, инфраструктура, карьера, льготы, гектар, масштаб, ипотека 2%."],
        keywords: ["ближе к будущему", "ближе к успеху", "ближе к мечте", "земля", "знания", "инфраструктура", "карьера", "льготы", "гектар", "масштаб", "ипотека 2%"],
        positioningShowcase: true,
      },
      {
        id: "principles",
        title: "Основные принципы",
        lead: "Наша работа — ваши достижения.",
        paragraphs: ["Привлекаем активных граждан и организации на Дальний Восток и в Арктику, помогаем успешно реализовать проекты, направленные на ускоренное социально-экономическое развитие регионов, решаем проблемы."],
        cards: [
          { title: "Качественно", text: "Экспертиза и профессиональный опыт." },
          { title: "Просто", text: "Упрощенные процедуры, цифровые сервисы." },
          { title: "Выгодно", text: "Льготы и меры поддержки, повышающие экономическую эффективность проектов." },
          { title: "Надежно", text: "Защищаем интересы граждан и бизнеса, решаем сложные задачи." },
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
    intro: "Раздел показывает состав логотипа, доступные версии, правила размещения, охранное поле, работу с фоном и ограничения по использованию.",
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
        logos: ["ru-horizontal", "ru-square", "mark"],
      },
      {
        id: "versions",
        title: "Версии",
        lead: "Версия выбирается по языку коммуникации и пропорциям носителя.",
        paragraphs: [
          "Вертикальная и горизонтальная версии логотипа могут равноправно использоваться для идентификации компании.",
          "Русский и английский варианты являются основными видами логотипа. Следует выбирать подходящую версию, учитывая языковую группу аудитории, на которую направлено информационное или рекламное сообщение.",
        ],
        logos: ["ru-horizontal", "ru-square", "en-horizontal", "en-square"],
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
        rules: [
          { label: "Да", text: "Использовать логотип как неделимый блок с оригинальным написанием." },
          { label: "Нет", text: "Использовать знак отдельно, менять фразу или подменять текстовую часть без письменного разрешения." },
        ],
        assetImages: [{ title: "Использование полного логотипа", caption: "Схема из брендбука: знак без текстовой части не используется как самостоятельный логотип.", file: "logo-usage-do-dont.png", wide: true }],
      },
      {
        id: "clearspace",
        title: "Охранное поле",
        paragraphs: [
          "Охранное поле равно части знака логотипа.",
          "Это пространство вокруг логотипа, в котором запрещено размещение каких-либо графических элементов, не являющихся частью логотипа.",
          "В случае если логотип используется в инвертированных цветах, белым начертанием на синем фоне, размеры фона сплошной заливки должны быть не меньше охранной зоны.",
        ],
        assetImages: [{ title: "Схема охранного поля", caption: "Минимальное свободное пространство вокруг логотипа.", file: "logo-clearspace.png", wide: true }],
      },
      {
        id: "backgrounds",
        title: "Фоны и цвет",
        lead: "Выбор фона и работа с цветом при использовании полноцветного логотипа.",
        paragraphs: ["Использование полноцветного логотипа допускается только на фоне, гарантирующем достаточный контраст для читаемости логотипа. В противном случае необходимо использовать дополнительные графические элементы, например плашки."],
        assetImages: [
          { title: "Версии для разных фонов", caption: "Светлые и темные фоны для русской и английской версий логотипа.", file: "logo-background-versions.png", wide: true, embeddedText: true },
          ...logoBackgroundRuleImages,
        ],
      },
      {
        id: "misuse",
        title: "Запреты",
        lead: "Любое отступление от рекомендаций по нанесению логотипа недопустимо.",
        assetImages: logoMisuseImages,
      },
    ],
  },
  {
    id: "subsidiaries",
    number: "03",
    title: "Дочерние общества",
    heroVideo: "subsidiaries-cover.mp4",
    heroAnimation: "subsidiaryRegions",
    intro: "Раздел объединяет версии логотипов дочерних обществ: русские и английские, горизонтальные и вертикальные.",
    sections: [
      {
        id: "ru-horizontal",
        title: "Основная версия",
        lead: "Основной способ подписи дочернего общества.",
        paragraphs: ["Используйте горизонтальную версию, когда носитель дает достаточно места для уверенного чтения полного названия общества."],
        subsidiaryLogos: "ru-horizontal",
        resourceLinks: ["subsidiaryLogos"],
      },
      {
        id: "ru-vertical",
        title: "Дополнительная версия",
        lead: "Решение для узких и компактных носителей.",
        paragraphs: ["Вертикальный знак помогает сохранить масштаб и читаемость в карточках, стойках, боковых полях и других ограниченных форматах."],
        subsidiaryLogos: "ru-vertical",
      },
      {
        id: "en-horizontal",
        title: "Англоязычная горизонтальная",
        lead: "Основная версия для внешней англоязычной коммуникации.",
        paragraphs: ["Она используется на международных мероприятиях, англоязычных ресурсах и в материалах для зарубежных партнеров."],
        subsidiaryLogos: "en-horizontal",
      },
      {
        id: "en-vertical",
        title: "Англоязычная вертикальная",
        lead: "Вертикальная англоязычная версия закрывает компактные форматы.",
        paragraphs: ["Выбирайте ее для международных материалов, где горизонтальная подпись становится слишком мелкой или нарушает композицию носителя."],
        subsidiaryLogos: "en-vertical",
      },
    ],
  },
  {
    id: "regimes",
    number: "04",
    title: "Режимы",
    intro: "Для преференциальных режимов используется единая система сокращений, знаков и названий. Она помогает быстро различать программы поддержки в коммуникационных материалах.",
    sections: [
      {
        id: "signs",
        title: "Знаки",
        lead: "Знаки преференциальных режимов.",
        paragraphs: ["Система включает сокращения и полные расшифровки режимов: ТОР, СПВ, КОРФ, САР, АЗРФ и ИНТЦ."],
        regimeSigns: true,
        resourceLinks: ["regimeLogos"],
      },
      {
        id: "coding",
        title: "Цветовое кодирование",
        paragraphs: ["Каждый цвет закреплен за конкретным направлением поддержки и используется как навигационный маркер в лифлетах, презентациях и информационных блоках."],
        regimePalette: regimeColorCoding,
      },
      {
        id: "programs",
        title: "Программы",
        paragraphs: ["В прикладной графике также используются направления «Гектар», «Работа» и «Ипотека». Они должны считываться в одной системе с режимами."],
        cards: [
          { title: "Гектар", text: "Программа, связанная с территорией и возможностью развития." },
          { title: "Работа", text: "Коммуникационный маркер для карьерных и кадровых сценариев." },
          { title: "Ипотека", text: "Ипотека 2% как отдельный узнаваемый элемент системы." },
        ],
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
        preAssetImages: [{ title: "Слайд основной палитры", caption: "Фрагмент брендбука с ключевыми цветами и логикой их применения.", file: "color-primary-slide.png", wide: true }],
        palette: primaryPalette,
      },
      {
        id: "secondary",
        title: "Дополнительные цвета",
        paragraphs: ["Дополнительная цветовая палитра используется для оформления презентаций."],
        preAssetImages: [{ title: "Слайд расширенной палитры", caption: "Оттенки для режимов, акцентов и вспомогательной графики.", file: "color-secondary-slide.png", wide: true }],
        palette: secondaryPalette,
      },
    ],
  },
  {
    id: "typography",
    number: "06",
    title: "Типографика",
    intro: "Раздел задает шрифтовую иерархию: рабочий гротеск, акцидентную пару и отдельную гарнитуру для торжественных документов.",
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
      {
        id: "font-files",
        title: "Файлы",
        paragraphs: ["Доступные начертания можно скачать отдельно или одним архивом для передачи в работу дизайнеру, подрядчику или внутренней команде."],
        fontDownloads: true,
      },
    ],
  },
  {
    id: "text",
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
        examples: ["«Цитата „внутри“ цитаты»", "Тире — знак препинания.", "1992–2021 год"],
      },
      {
        id: "money-phone",
        title: "Валюты и телефоны",
        paragraphs: [
          "Знаки валют, указываемые после числа, отбиваются неразрывным пробелом. Знаки валют, указываемые в препозиции, пишутся слитно с числом. В тексте рекомендуется написание валют словами.",
          "Номера телефонов рекомендуется записывать в международном формате, со знаком «+» и кодом страны, или начинать с цифры «8» как оператора выхода на междугороднюю связь. Код страны, код города и номер телефона отбиваются друг от друга неразрывным пробелом.",
        ],
        examples: ["100 000 ₽", "¥100 000", "8 (495) 531-06-44"],
      },
      {
        id: "abbr-geo",
        title: "Сокращения и география",
        paragraphs: [
          "Сокращения с усечением части слова пишутся с точкой в конце, кроме обозначений физических единиц СИ.",
          "Пишется без точки: млн, млрд.",
          "Со строчной буквы пишутся родовые географические термины, названия сторон света и прилагательные от них.",
          "С прописной буквы пишутся географические названия и неофициальные названия географических регионов.",
        ],
        examples: ["г. (город), д. (дом)", "т. к. (так как)", "м (метр), ч (час)", "южный, дальневосточная ипотека, арктические льды", "Дальний Восток, Заполярье, Республика Бурятия"],
      },
      {
        id: "recommendations",
        title: "Контрольные примеры",
        paragraphs: ["Ниже собраны готовые контрольные ситуации из брендбука. Они не дублируют правила, а помогают быстро сверить набор перед публикацией."],
        assetImageMode: "imagesOnly",
        assetImages: textRecommendationImages,
      },
      {
        id: "typograf",
        title: "Типограф",
        paragraphs: ["В русскоязычных материалах короткие союзы и предлоги не оставляются в конце строки, числа и единицы измерения не разрываются, кавычки приводятся к русской форме."],
        typografDemo: true,
      },
    ],
  },
  {
    id: "corporate",
    number: "08",
    title: "Корпоративные материалы",
    navTitle: "Корп. материалы",
    intro: "Корпоративные носители переводят фирменную систему в рабочие документы: визитки, QR-форматы, материалы дочерних обществ и бланки.",
    sections: [
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
          { title: "Русская визитка", caption: "Основной вариант для деловой коммуникации внутри России.", file: "business-card-ru.png" },
          { title: "Английская визитка", caption: "Версия для международных встреч и англоязычных контактов.", file: "business-card-en.png" },
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
          { title: "Русская визитка с QR", caption: "Контактная информация дополнена переходом в цифровой профиль.", file: "business-card-qr-ru.png" },
          { title: "Английская визитка с QR", caption: "Международная версия с тем же расположением кода.", file: "business-card-qr-en.png" },
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
          { title: "Визитки ДО: серия", caption: "Группа карточек показывает, как меняется региональный идентификатор.", file: "subsidiary-card-1.png" },
          { title: "Визитки ДО: контакты", caption: "Компоновка держит должность, телефон, почту и адрес в общей сетке.", file: "subsidiary-card-2.png" },
          { title: "Визитки ДО: регионы", caption: "Серия проверяет единый масштаб логотипов разных обществ.", file: "subsidiary-card-3.png" },
        ],
        resourceLinks: ["businessCardsSubsidiary"],
      },
      {
        id: "letterhead",
        title: "Бланки ДО",
        lead: "Официальная основа для писем, приказов и деловой переписки дочерних обществ.",
        paragraphs: ["В шапке размещаются логотип ДЗО, наименование, полный адрес, телефон, электронная почта и сайт. Для печати используется офисная или офсетная бумага."],
        assetImages: [
          { title: "Бланк: фирменная шапка", caption: "Основная зона идентификации дочернего общества.", file: "subsidiary-letterhead-1.png" },
          { title: "Бланк: реквизиты", caption: "Нижняя часть содержит контактные данные и служебную информацию.", file: "subsidiary-letterhead-2.png" },
        ],
        resourceLinks: ["subsidiaryLetterheads"],
      },
    ],
  },
  {
    id: "advertising",
    number: "09",
    title: "Рекламные материалы",
    navTitle: "Рекламные",
    intro: "Рекламно-информационные материалы включают лифлеты, прессволл, роллап, навигацию кабинетов, режимник и наградные документы.",
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
        id: "presswall",
        title: "Прессволл",
        paragraphs: ["Крупный фон для фотозон, выставочных стендов и имиджевых мероприятий. Размер конструкции: 2000×3000 мм."],
        rules: [{ label: "Перед печатью", text: "Новый дизайн прессволла проверяется в Департаменте визуальных коммуникаций КРДВ." }],
        assetImages: [{ title: "Прессволл", caption: "Баннерная плоскость с повторяющимся фирменным знаком.", file: "presswall-layout.webp", wide: true }],
      },
      {
        id: "rollup",
        title: "Роллап",
        paragraphs: ["Мобильный вертикальный носитель для входных зон, небольших стендов и презентационных точек. Размер: 800×1800 мм."],
        rules: [{ label: "Отклонение от шаблона", text: "Измененный роллап передается на проверку до запуска в производство." }],
        assetImages: [{ title: "Роллап", caption: "Вертикальная конструкция с крупным сообщением и фирменным знаком.", file: "rollup-layout.webp", wide: true }],
      },
      {
        id: "office-navigation",
        title: "Навигация кабинетов",
        paragraphs: ["Кабинетные таблички подстраиваются под планировку офиса и видимость маршрута. Рекомендованное соотношение сторон: 3 по вертикали к 2 по горизонтали."],
        rules: [{ label: "Заказ табличек", text: "Перед изготовлением нужно передать список кабинетов, размеры и условия размещения в профильный департамент." }],
        assetImages: [
          { title: "Кабинетная табличка", caption: "Базовый вариант с номером и названием кабинета.", file: "office-navigation-1.webp" },
          { title: "Серия навигации", caption: "Несколько табличек должны сохранять единый масштаб набора.", file: "office-navigation-2.webp" },
          { title: "Вертикальная табличка", caption: "Формат для узкой зоны или отдельной стены.", file: "office-navigation-3.webp" },
        ],
      },
      {
        id: "schedule-sign",
        title: "Режимник",
        paragraphs: ["Режимник фиксирует график работы предприятия или дочернего общества. Размер выбирается по месту установки, но композиция сохраняет вертикальную доминанту 3:2."],
        assetImages: [{ title: "Режимник работы", caption: "Табличка объединяет расписание, адрес и контакты организации.", file: "schedule-sign-layout.webp" }],
      },
      {
        id: "awards",
        title: "Наградные документы",
        paragraphs: [
          "Формат А4. Бумага — Majestic Classic белый мрамор, под заказ. Заголовки выполняются тиснением золотой фольгой, рама — тиснением серебряной фольгой.",
          "Перед производством наградного комплекта нужно уточнить тираж, имена получателей и состав тиснения.",
          "Дизайнерам: после внесения ФИО и текста в шаблон необходимо убрать на всех макетах два элемента: рамку и заголовок «Почетная грамота», «Благодарность» или «Благодарственное письмо». Они выполняются тиснением, поэтому предоставляются типографии отдельным файлом.",
        ],
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
    id: "merch",
    number: "10",
    title: "Мерч",
    intro: "Раздел описывает прикладные носители бренда: канцелярские материалы, упаковку и текстиль.",
    sections: [
      {
        id: "carriers",
        title: "Канцелярия",
        paragraphs: ["Блокноты, ручки и карандаши используют фирменную графику без усложнения формы носителя. Если дизайн меняется, макет согласуется до производства."],
        specs: [
          { title: "Блокнот", items: ["Формат А5, размер 148×210 мм, два варианта обложки — мягкая и твердая.", "Формат B5, размер 190×250 мм, два варианта обложки — мягкая и твердая."] },
          { title: "Канцелярские принадлежности", items: ["Брендированная письменная ручка, черная.", "Брендированная шариковая ручка, матовая белая.", "Брендированный деревянный карандаш. Вид нанесения: тампопечать."] },
        ],
        assetImages: [{ title: "Канцелярский набор", caption: "Блокноты и письменные принадлежности собраны в единой системе.", file: "merch-carriers-layout.webp", wide: true }],
      },
      {
        id: "package",
        title: "Пакет",
        lead: "Брендированный пакет с QR-кодом.",
        paragraphs: ["Пакет используется для деловых наборов, мероприятий и передачи материалов. Новый рисунок или иной формат проверяется до печати."],
        specs: [{ title: "Производство", items: ["Материал: плотная бумага или картон.", "Вид нанесения: офсет или прямая печать."] }],
        assetImages: [{ title: "Пакет с QR-кодом", caption: "Бумажный носитель соединяет фирменный знак и цифровой переход.", file: "package-layout.webp", wide: true }],
      },
      {
        id: "tshirt",
        title: "Футболка",
        lead: "Фирменная футболка для участия в мероприятиях.",
        specs: [{ title: "Нанесение на футболку", items: ["Цифровая прямая печать по ткани.", "Шелкография для тиражных партий.", "Термотрансфер или машинная вышивка по задаче носителя."] }],
        assetImages: [{ title: "Фирменная футболка", caption: "Передняя и задняя стороны показывают масштаб нанесения.", file: "tshirt-layout.webp", wide: true }],
      },
      {
        id: "shopper",
        title: "Шоппер",
        lead: "Текстильный носитель для мероприятий, наборов и повседневной коммуникации бренда.",
        specs: [{ title: "Нанесение на шоппер", items: ["Основной сценарий — печать по ткани.", "Для плотных материалов подходит шелкография.", "Вышивка используется, когда нужен более долговечный знак."] }],
        assetImages: [{ title: "Макет шоппера", caption: "Черный текстильный носитель с фирменным логотипом.", file: "shopper-layout.webp", wide: true }],
      },
    ],
  },
  {
    id: "made",
    number: "11",
    title: "Сделано в ТОР СПВ",
    intro: "Самостоятельный раздел для товарного знака, который поддерживает продукцию резидентов и помогает маркировать происхождение товаров.",
    sections: [
      {
        id: "sign",
        title: "Знак",
        paragraphs: [
          "Товарный знак «Сделано в ТОР СПВ» разработан для поддержки резидентов и дополнительной узнаваемости бренда. Он используется для брендирования продукции, произведенной резидентами, после одобрения заявки.",
          "Версия на английском языке применяется при сотрудничестве с международными резидентами. Технология маркировки упаковки подбирается индивидуально для каждого товара и материала.",
          "В отдельных случаях допускается адаптация цвета знака под цвет упаковки, если сохраняется читаемость и узнаваемость маркировки.",
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
        lead: "Единый прогресс, общие взгляды.",
        paragraphs: [
          "Ключевым аспектом деятельности КРДВ является достижение результатов, связанных с развитием инфраструктуры.",
          "Выбирая материал для презентаций, следует особое внимание уделять фотографиям, отражающим ключевые достижения.",
          "Подходящие сюжеты: ледоколы, порты, грузовые суда, спутники, символы Северного морского пути, командные фото, символ единства, общих целей и прогресса.",
          "Также подходят работающие предприятия и заводы Дальнего Востока и Арктики, фото актуальных предприятий, открытых на «бесплатном гектаре», а также новых проектов резидентов.",
        ],
        assetImages: photostyleImages.infrastructure,
        cardsPlacement: "afterAssets",
        cards: [
          { title: "ФГУП «Атомфлот»", text: "Фотоисточник для арктической инфраструктуры и Северного морского пути." },
          { title: "Алена Медведева", text: "Авторские кадры для сюжетов о людях, командах и территориях." },
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
        cardsPlacement: "afterAssets",
        cards: [{ title: "Максим Блинов / РИА Новости", text: "Источник для событийных кадров с участием людей и деловой среды." }],
      },
      {
        id: "nature",
        title: "Природа",
        lead: "Захватывающая природа.",
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
        lead: "Люди Дальнего Востока и Арктики.",
        paragraphs: [
          "Главным принципом съемки людей является запечатление оригинальных аутентичных сюжетов, связанных с их сферой деятельности, культурными обычаями, мероприятиями, демонстрирующими жизнь народов Дальнего Востока и Арктики.",
          "Рекомендации позволяют раскрыть сюжеты наиболее полно, создать убедительные эмоциональные образы, продемонстрировать культурное богатство и многообразие жизни в регионах.",
        ],
        assetImages: photostyleImages.people,
      },
    ],
  },
  {
    id: "appendix",
    number: "13",
    title: "Приложение",
    intro: "Приложение собирает дополнительные материалы для оформления социальных сетей и обратной связи по руководству.",
    sections: [
      {
        id: "social",
        title: "Социальные сети",
        paragraphs: ["Гайд помогает сохранять узнаваемый визуальный язык в постах, карточках, обложках и регулярных публикациях КРДВ. Макеты ниже показывают базовую композицию и работу с персонами."],
        assetImageMode: "stack",
        assetImages: appendixSocialImages,
        resourceLinks: ["socialGuide"],
      },
      {
        id: "contacts",
        title: "Контакты",
        contacts: [
          "Акционерное общество «Корпорация развития Дальнего Востока и Арктики»",
          "8 (800) 707-55-58",
          "erdc.ru",
          "12/2025",
          "© Все права защищены.",
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
  resources: "appendix",
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
  const activePage = pagesById[activePageId] || pagesById.overview;

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
    document.getElementById("page")?.scrollTo({ top: 0, left: 0, behavior: "smooth" });
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
          <Sidebar activePageId={activePageId} openGroup={openGroup} setOpenGroup={setOpenGroup} navigate={navigate} jumpTo={jumpTo} preloading={showPreloader} />
          <button className="nav-backdrop" type="button" aria-label={t("Закрыть меню")} onClick={() => setMenuOpen(false)} />
          <motion.main id="page" className="page-scroll" layoutScroll>
            <GuidelinePage key={activePageId} page={activePage} activePageId={activePageId} navigate={navigate} />
          </motion.main>
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}

function Sidebar({ activePageId, openGroup, setOpenGroup, navigate, jumpTo, preloading }) {
  return (
    <aside className="sidebar" aria-label={t("Навигация брендбука")}>
      <button className="brand-lockup" type="button" onClick={() => navigate("overview")} aria-label={t("Открыть обзор")}>
        <motion.img layoutId={preloading ? undefined : "krdv-menu-logo"} src={logoAsset("krdv-logo-ru-square.svg")} alt={t("КРДВ")} />
      </button>

      <div className="sidebar-meta">
        <strong>{t("Руководство по фирменному стилю")}</strong>
      </div>

      <nav className="nav-list">
        {pagesData.map((group) => {
          const isOpen = openGroup === group.id;
          const isActive = activePageId === group.id;

          return (
            <motion.div className={`nav-group ${isActive ? "is-active" : ""}`} key={group.id} layout>
              <button
                className="nav-parent"
                type="button"
                aria-expanded={isOpen}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  setOpenGroup(isOpen ? "" : group.id);
                  navigate(group.id);
                }}
              >
                <span>{group.number}</span>
                <strong>{t(group.navTitle || group.title)}</strong>
                <UiIcon icon={isOpen ? ICONS.chevronUp : ICONS.chevronDown} className="nav-chevron" />
              </button>
              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    className="nav-children"
                    key={`${group.id}-children`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {group.sections.map((section) => (
                      <button key={section.id} type="button" onClick={() => (activePageId === group.id ? jumpTo(section.id) : navigate(group.id))}>
                        {t(section.navTitle || section.title)}
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </nav>

    </aside>
  );
}

function BrandPreloader() {
  const cellOrder = [0, 1, 5, 6, 2, 10, 7, 11, 3, 15, 8, 12, 4, 16, 9, 13, 17, 14, 18, 19];

  return (
    <motion.div
      className="brand-preloader"
      role="status"
      aria-label={t("Загрузка брендбука")}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 } }}
    >
      <div className="preloader-grid" aria-hidden="true">
        {cellOrder.map((orderIndex, index) => (
          <i key={index} style={{ "--cell-index": orderIndex }} />
        ))}
      </div>
      <motion.div className="preloader-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.36, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}>
        <motion.img layoutId="krdv-menu-logo" className="preloader-logo" src={logoAsset("krdv-logo-ru-square.svg")} alt="" />
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: 0.54, ease: [0.16, 1, 0.3, 1] }}>
          {t("Руководство по использованию фирменного стиля АО «КРДВ»")}
        </motion.p>
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

function GuidelinePage({ page, activePageId, navigate }) {
  const hasMediaHero = Boolean(page.heroVideo);
  const hasAnimatedHero = Boolean(page.heroAnimation);
  const hasSubsidiaryHero = page.heroAnimation === "subsidiaryRegions";

  return (
    <article className="guideline-page">
      <header className={`hero-band ${hasMediaHero ? "is-media" : ""} ${hasAnimatedHero ? "is-animated" : ""} ${hasSubsidiaryHero ? "is-subsidiary" : ""}`} aria-label={t(page.title)}>
        {page.heroVideo ? <video className="hero-video" src={heroAsset(page.heroVideo)} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" /> : null}
        {page.heroAnimation === "colorTiles" ? <ColorHeroAnimation /> : null}
        {hasSubsidiaryHero ? <SubsidiaryHeroAnimation /> : null}
        {page.heroLogo ? <HeroLogoLockup source={page.heroLogo} /> : null}
        <span className="hero-number">{page.number}</span>
        <h1 className="hero-title">{t(page.title)}</h1>
      </header>

      <section className="intro-panel">
        <p>{t(page.intro)}</p>
      </section>

      {page.sections.map((section) => (
        <ContentSection key={section.id} section={section} navigate={navigate} activePageId={activePageId} />
      ))}

      <EndLinks activePageId={activePageId} navigate={navigate} />
    </article>
  );
}

function ContentSection({ section, navigate, activePageId }) {
  const cardsBeforeAssets = section.cards && section.cardsPlacement !== "afterAssets";
  const cardsAfterAssets = section.cards && section.cardsPlacement === "afterAssets";

  return (
    <section className="content-section" id={section.id}>
      <div className="section-title">
        <h2>{t(section.title)}</h2>
      </div>
      <div className="section-body">
        {section.lead ? <p className="lead-copy">{t(section.lead)}</p> : null}
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph}>{t(paragraph)}</p>
        ))}
        {section.keywords && !section.positioningShowcase ? <KeywordWall items={section.keywords} /> : null}
        {section.positioningShowcase ? <PositioningShowcase /> : null}
        {section.directory ? <SectionDirectory navigate={navigate} activePageId={activePageId} /> : null}
        {section.examples ? <ExampleGrid items={section.examples} /> : null}
        {cardsBeforeAssets ? <CardGrid items={section.cards} /> : null}
        {section.rules ? <RuleList items={section.rules} /> : null}
        {section.specs ? <SpecGrid items={section.specs} /> : null}
        {section.logos ? <LogoLibrary items={section.logos} /> : null}
        {section.subsidiaryLogos ? <SubsidiaryLogoLibrary setId={section.subsidiaryLogos} /> : null}
        {section.preAssetImages ? <AssetImageGrid items={section.preAssetImages} mode={section.preAssetImageMode} /> : null}
        {section.palette ? <PaletteGrid colors={section.palette} /> : null}
        {section.typeSamples ? <TypeSpecimens items={section.typeSamples} /> : null}
        {section.fontWorkbench ? <FontWorkbench /> : null}
        {section.fontDownloads ? <FontDownloadLibrary /> : null}
        {section.regimePalette ? <RegimePalette items={section.regimePalette} /> : null}
        {section.regimeSigns ? <RegimeSignLibrary /> : null}
        {section.madeSigns ? <MadeSignLibrary /> : null}
        {section.assetImages ? <AssetImageGrid items={section.assetImages} mode={section.assetImageMode} /> : null}
        {cardsAfterAssets ? <CardGrid items={section.cards} /> : null}
        {section.visuals ? <PlaceholderGrid items={section.visuals} /> : null}
        {section.resourceLinks ? <ResourceLinks keys={section.resourceLinks} /> : null}
        {section.typografDemo ? <TypografDemo /> : null}
        {section.contacts ? <ContactBlock items={section.contacts} /> : null}
        {section.contactCta ? <ContactCta item={section.contactCta} /> : null}
      </div>
    </section>
  );
}

function UiIcon({ icon, className = "", label, size = 18 }) {
  return (
    <MorphIcon
      icon={icon}
      size={size}
      strokeWidth={1.7}
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

function ExampleGrid({ items }) {
  return (
    <div className="example-grid">
      {items.map((item) => (
        <code key={item}>{t(item)}</code>
      ))}
    </div>
  );
}

function CardGrid({ items }) {
  return (
    <LayoutGroup>
      <motion.div className="card-grid" layout>
        {items.map((item, index) => (
          <motion.article className="info-card" key={`${item.title}-${index}`} layout whileHover={{ y: -2 }}>
            <h3>{t(item.title)}</h3>
            <p>{t(item.text)}</p>
          </motion.article>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

function PositioningShowcase() {
  const promiseTags = ["ближе к будущему", "ближе к успеху", "ближе к мечте", "земля", "знания", "инфраструктура", "карьера", "льготы", "гектар", "масштаб", "ипотека 2%"];

  return (
    <div className="positioning-showcase">
      <div className="positioning-promise">
        <div>
          <span>{t("Бренд-обещание")}</span>
          <strong>{t("Дальний Восток и Арктика — ближе к будущему")}</strong>
        </div>
        <div className="positioning-tag-cloud" aria-label={t("Смысловые направления")}>
          {promiseTags.map((tag) => (
            <em key={tag}>{t(tag)}</em>
          ))}
        </div>
        <p>{t("Смысловые пары помогают говорить о территориях через конкретное движение: проекты, людей, инфраструктуру, карьеру и понятную пользу для резидентов.")}</p>
      </div>
      <div className="positioning-principles">
        {positioningPrinciples.map((item, index) => (
          <motion.article key={item.title} whileHover={{ y: -2 }} style={{ "--principle-index": index }}>
            <span>{`0${index + 1}`}</span>
            <h3>{t(item.title)}</h3>
            <p>{t(item.text)}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function SectionDirectory({ navigate, activePageId }) {
  return (
    <LayoutGroup>
      <motion.div className="section-directory" layout>
        {pagesData.map((page) => {
          const isCurrent = activePageId === page.id;
          const hasCover = Boolean(page.heroVideo);
          const hasMotionCover = page.heroAnimation === "colorTiles";

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
              <div className={`directory-visual ${hasCover || hasMotionCover ? "has-cover" : ""} ${hasMotionCover ? "has-motion-cover" : ""}`} aria-hidden="true">
                {page.heroVideo ? <video className="directory-video" src={heroAsset(page.heroVideo)} autoPlay muted loop playsInline preload="metadata" /> : null}
                {hasMotionCover ? <ColorHeroAnimation /> : null}
                {hasCover || hasMotionCover ? null : <div className="directory-fallback" />}
              </div>
              <div className="directory-copy">
                <h3>{t(page.title)}</h3>
                <p>{t(page.intro)}</p>
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
                <p>{t(variant.description)}</p>
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
      <strong>{t("Скачать")}</strong>
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
              {item.note ? <p>{t(item.note)}</p> : null}
              <div className="logo-downloads" aria-label={t(`Скачать ${item.title}`)}>
                <strong>{t("Скачать")}</strong>
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

function RegimeSignLibrary() {
  return (
    <LayoutGroup>
      <motion.div className="regime-sign-library" layout>
        {regimeSignLogos.map((item) => (
          <motion.article className="regime-sign-card" key={item.slug} style={{ "--sign-color": item.color }} layout whileHover={{ y: -2 }}>
            <div className="regime-sign-preview">
              <img src={regimeSignAsset(item.preview)} alt={t(item.short)} loading="lazy" />
            </div>
            <div className="regime-sign-copy">
              <span>{t(item.short)}</span>
              <h3>{t(item.title)}</h3>
              <p>{t(item.description)}</p>
              <div className="logo-downloads" aria-label={t(`Скачать знак ${item.short}`)}>
                <strong>{t("Скачать")}</strong>
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

function MadeSignLibrary() {
  return (
    <LayoutGroup>
      <motion.div className="made-sign-library" layout>
        {madeSignVariants.map((item) => (
          <motion.article className="made-sign-card" data-tone={item.tone} key={item.slug} layout whileHover={{ y: -2 }}>
            <div className="made-sign-preview">
              <img src={madeSignAsset(item.preview)} alt={t(item.title)} loading="lazy" />
            </div>
            <div className="made-sign-copy">
              <span>{t("Знак")}</span>
              <h3>{t(item.title)}</h3>
              <div className="logo-downloads" aria-label={t(`Скачать ${item.title}`)}>
                <strong>{t("Скачать")}</strong>
                <div>
                  {madeSignFormats.map((format) => (
                    <LogoDownloadLink key={format} file={item.files[format]} format={format} title={item.title} asset={madeSignAsset} />
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

function ResourceLinks({ keys }) {
  const links = keys.map((key) => downloadResources[key]).filter(Boolean);

  return (
    <div className={`resource-links ${links.length === 1 ? "is-single" : ""}`}>
      {links.map((item) => (
        <motion.a key={item.url} href={item.url} target="_blank" rel="noreferrer" whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }}>
          <div>
            <strong>{t(item.title)}</strong>
            <p>{t(item.description)}</p>
          </div>
          <em>
            {t("Открыть архив")}
            <UiIcon icon={ICONS.arrowRight} className="resource-link-icon" />
          </em>
        </motion.a>
      ))}
    </div>
  );
}

function AssetImageGrid({ items, mode = "grid" }) {
  const imagesOnly = mode === "imagesOnly" || mode === "stack";

  return (
    <LayoutGroup>
      <motion.div className={`asset-image-grid is-${mode}`} layout>
        {items.map((item) => (
          <motion.article className={`asset-image-card ${item.wide ? "is-wide" : ""} ${item.contained ? "is-contained" : ""} ${item.embeddedText ? "has-embedded-text" : ""}`} key={item.file} layout whileHover={{ y: -2 }}>
            <div className="asset-image-frame">
              <img src={rasterAsset(item.file)} alt={t(item.title)} loading="lazy" />
            </div>
            {item.embeddedText || imagesOnly ? null : (
              <div className="asset-image-copy">
                <h3>{t(item.title)}</h3>
                <p>{t(item.caption)}</p>
              </div>
            )}
          </motion.article>
        ))}
      </motion.div>
    </LayoutGroup>
  );
}

function RuleList({ items }) {
  return (
    <div className="rule-list">
      {items.map((item, index) => (
        <article key={`${item.label}-${index}`}>
          <strong>{t(item.label)}</strong>
          <p>{t(item.text)}</p>
        </article>
      ))}
    </div>
  );
}

function SpecGrid({ items }) {
  return (
    <div className="spec-grid">
      {items.map((spec) => (
        <article key={spec.title}>
          <h3>{t(spec.title)}</h3>
          <ul>
            {spec.items.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
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
      <span className="media-caption">{t(caption)}</span>
    </motion.button>
  );
}

function PaletteGrid({ colors }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState("");
  const selected = colors[selectedIndex] || colors[0];

  async function copyHex(hex) {
    setCopied(hex);
    try {
      await navigator.clipboard?.writeText(hex);
    } catch {
      // Clipboard is optional in local preview and restricted browser contexts.
    }
  }

  return (
    <LayoutGroup>
      <div className="palette-stage" style={{ "--active-color": selected?.hex }}>
        <motion.div className="palette-grid" layout>
          {colors.map((color, index) => (
            <motion.button
              key={color.hex}
              type="button"
              layout
              data-active={selectedIndex === index}
              onClick={() => {
                setSelectedIndex(index);
                copyHex(color.hex);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.992 }}
              aria-label={t(`Скопировать HEX цвета ${color.name}`)}
            >
              <i style={{ backgroundColor: color.hex }} />
              <strong>{t(color.name)}</strong>
              <span>HEX: {color.hex}</span>
              <span>RGB: {color.rgb}</span>
              <span>CMYK: {color.cmyk}</span>
              {color.pantone ? <span>{color.pantone}</span> : null}
              <span className="copy-action" data-copied={copied === color.hex}>
                <UiIcon icon={copied === color.hex ? ICONS.check : ICONS.copy} className="copy-action-icon" />
                <span>{t(copied === color.hex ? "Скопировано" : "Скопировать HEX")}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </LayoutGroup>
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
      <p>{t(copy)}</p>
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
  const canDownloadSelected = selectedStyle && isDesktopFontFile(selectedStyle);
  const fallback = selectedFamily.id === "tsars" || selectedFamily.id === "serif" ? "Georgia, serif" : "Arial, sans-serif";
  const preferredStyles = ["Regular", "Medium", "DemiBold", "Bold", "Black"];
  const styleOptions = selectedFamily.files.filter((file) => preferredStyles.includes(file.label) || file.file === selectedStyle?.file);

  function selectFamily(family) {
    setFamilyId(family.id);
    setStyleIndex(getDefaultFontIndex(family));
    setSample((current) => (current === selectedFamily.sample ? family.sample : current));
  }

  return (
    <div className="font-workbench">
      <div className="font-preview-panel">
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
        <p>{t(selectedFamily.description)}</p>
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

        {canDownloadSelected ? (
          <div className="font-current-file">
            <span>{t("Скачать выбранное начертание")}</span>
            <FontFileLink file={selectedStyle} familyTitle={selectedFamily.title} compact />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FontDownloadLibrary() {
  return (
    <div className="font-download-library">
      {downloadableFontFamilies.map((family) => (
        <section className="font-download-family" key={family.id}>
          <div>
            <span>{t(family.role)}</span>
            <h3>{family.title}</h3>
            <p>{t(`${family.files.length} ${pluralizeFontFiles(family.files.length)} доступно для скачивания.`)}</p>
          </div>
          <div className="font-file-grid">
            {family.files.map((file) => (
              <FontFileLink key={file.file} file={file} familyTitle={family.title} />
            ))}
          </div>
        </section>
      ))}

      <a className="font-archive-link" href={downloadAsset(fontArchive.file)} download={fontArchive.file}>
        <span>
          <strong>{t("Скачать весь архив шрифтов")}</strong>
          <em>{t(`${fontArchive.count} ${pluralizeFontFiles(fontArchive.count)} · ZIP`)}</em>
        </span>
        <UiIcon icon={ICONS.download} className="font-archive-icon" />
      </a>
    </div>
  );
}

function FontFileLink({ file, familyTitle, compact = false }) {
  const [active, setActive] = useState(false);
  const extension = file.file.split(".").pop()?.toUpperCase() || "FONT";

  return (
    <a
      className={`font-file-link ${compact ? "is-compact" : ""}`}
      href={fontAsset(file.file)}
      download={file.file}
      onBlur={() => setActive(false)}
      onFocus={() => setActive(true)}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      aria-label={t(`Скачать ${familyTitle} ${file.label}`)}
    >
      <UiIcon icon={active ? ICONS.arrowDown : ICONS.download} className="font-file-icon" />
      <span>{file.label}</span>
      <em>{extension}</em>
    </a>
  );
}

function pluralizeFontFiles(count) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return "файлов";
  if (last === 1) return "файл";
  if (last >= 2 && last <= 4) return "файла";
  return "файлов";
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

function TypografDemo() {
  const [value, setValue] = useState("АО КРДВ помогает бизнесу и гражданам на Дальнем Востоке и в Арктике.");
  const output = useMemo(() => t(value), [value]);

  return (
    <div className="typograf-demo">
      <label>
        <span>{t("Ввод")}</span>
        <textarea value={value} onChange={(event) => setValue(event.target.value)} />
      </label>
      <div>
        <span>{t("Результат")}</span>
        <p>{output}</p>
      </div>
    </div>
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
        <p>{t(item.text)}</p>
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

function EndLinks({ activePageId, navigate }) {
  const currentIndex = pagesData.findIndex((page) => page.id === activePageId);
  const previous = pagesData[currentIndex - 1] || pagesData[pagesData.length - 1];
  const next = pagesData[currentIndex + 1] || pagesData[0];

  return (
    <nav className="end-links" aria-label={t("Переходы между разделами")}>
      <button type="button" onClick={() => navigate(previous.id)}>
        <span>{t(`${previous.number} ${previous.title}`)}</span>
        <em>
          <UiIcon icon={ICONS.arrowLeft} className="end-link-icon" />
          {t("предыдущий раздел")}
        </em>
      </button>
      <button type="button" onClick={() => navigate(next.id)}>
        <span>{t(`${next.number} ${next.title}`)}</span>
        <em>
          {t("следующий раздел")}
          <UiIcon icon={ICONS.arrowRight} className="end-link-icon" />
        </em>
      </button>
    </nav>
  );
}

export { App };
