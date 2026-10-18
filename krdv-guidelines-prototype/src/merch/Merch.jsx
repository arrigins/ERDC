// Раздел «Мерч» (18.10): визуальная система, слоганы-стикеры, носители и «термо»-ремувки.
// Анимации — только там, где показывают устройство системы или свойство предмета.
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./merch.css";

const merchAsset = (file) => `${import.meta.env.BASE_URL}assets/merch/${file}`;

function useInView(ref, threshold = 0.3) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}

// Таймер по кругу, пока блок виден и пользователь не выбрал вариант сам
function useCycle(length, delay, active) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || length < 2) return undefined;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % length), delay);
    return () => window.clearInterval(timer);
  }, [length, delay, active]);
  return [index, setIndex];
}

/* ───────── 1. Визуальная система ───────── */

// Слоганы с предметов: подпись «КРДВ + фраза» на цвете самого предмета
const signatureSlogans = [
  { text: "Энергия Дальнего Востока", item: "Аккумулятор", bg: "#e57a35", fg: "#ffffff" },
  { text: "Работаем в любую погоду", item: "Зонт и дождевик", bg: "#283246", fg: "#ffffff" },
  { text: "Арктика закаляет, кофе согревает", item: "Термокружка", bg: "#ece2d7", fg: "#5a5550" },
  { text: "Когда работа дарит восторг", item: "Шоппер и несессер", bg: "#3d7ec1", fg: "#ffffff" },
  { text: "Приносим радость", item: "Шоппер", bg: "#2a2a8c", fg: "#ffffff" },
  { text: "Арктика держит заряд", item: "Аккумулятор", bg: "#1e2433", fg: "#ffffff" },
  { text: "Бодрость уровня Дальний Восток", item: "Термокружка", bg: "#2b3a78", fg: "#ffffff" },
  { text: "Большие проекты начинаются с небольшого блокнота", item: "Блокнот", bg: "#f1ede6", fg: "#1a1a1a" },
  { text: "Крутые решения двигают вперёд", item: "Шоппер", bg: "#111111", fg: "#ffffff" },
];

const merchHearts = [
  { file: "merch-heart-label.svg", title: "«Дальний Восток — близко к сердцу»", text: "Сердце с плашкой — на груди футболки и ветровки" },
  { file: "merch-heart-red.svg", title: "Сердце КРДВ, красное", text: "Рисованные буквы внутри сердца — брелок, спина ветровки" },
  { file: "merch-heart-blue.svg", title: "Сердце КРДВ, синее", text: "Нашивки и бирки на сумках и чехлах" },
];

// Цвета графики: принты, нашивки, стикеры. Цвет самого предмета подбирается под задачу и в систему не входит.
const merchColors = [
  { name: "Синий", hex: "#0055A2", use: "Сердце КРДВ, нашивки, стикеры" },
  { name: "Ультрамарин", hex: "#1D4FD8", use: "Крупные буквы стёганой серии" },
  { name: "Красный", hex: "#EE3137", use: "Сердце «Близко к сердцу», брелок" },
  { name: "Розовый", hex: "#F8CAD0", use: "Принт «Солнце» на футболке, стикеры", light: true },
  { name: "Светло-серый", hex: "#DCDFE6", use: "Буквы на синем, вязка", light: true },
  { name: "Молочный", hex: "#F3EFE9", use: "Стикеры", light: true },
  { name: "Белый", hex: "#FFFFFF", use: "Подписи на тёмных вещах", light: true },
  { name: "Чёрный", hex: "#141414", use: "Подписи на светлых вещах" },
];

function SignatureTile({ t }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref);
  const [index] = useCycle(signatureSlogans.length, 2600, inView && !reduceMotion);
  const slogan = signatureSlogans[index];
  return (
    <article ref={ref} className="ms-tile ms-signature" style={{ "--tile-bg": slogan.bg, "--tile-fg": slogan.fg }}>
      <header className="ms-label">
        <span>01</span> {t("Подпись")}
      </header>
      <div className="ms-lockup" aria-live="polite">
        <strong>КРДВ</strong>
        <span className="ms-slogan-slot">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={slogan.text}
              className="ms-slogan"
              initial={reduceMotion ? false : { y: "70%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { y: "-70%", opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              {t(slogan.text)}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
      <footer className="ms-foot">
        <p>{t("Короткое «КРДВ» и фраза под ним. Подпись стоит на самом предмете, в его цвете — без плашек и рамок.")}</p>
        <span className="ms-meta">{t(slogan.item)}</span>
      </footer>
    </article>
  );
}

function HeartTile({ t }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(ref);
  const [index, setIndex] = useCycle(merchHearts.length, 3000, inView && !reduceMotion);
  const heart = merchHearts[index];
  return (
    <article ref={ref} className="ms-tile ms-heart">
      <header className="ms-label">
        <span>02</span> {t("Сердце")}
      </header>
      <div className="ms-heart-stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={heart.file}
            src={merchAsset(heart.file)}
            alt={t(heart.title)}
            initial={reduceMotion ? false : { scale: 0.86, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { scale: [0.86, 1.06, 1, 1.04, 1], opacity: 1 }}
            exit={reduceMotion ? undefined : { scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </AnimatePresence>
      </div>
      <footer className="ms-foot">
        <p>
          <strong>{t(heart.title)}</strong>
          {t(heart.text)}
        </p>
        <span className="ms-dots" role="tablist">
          {merchHearts.map((item, itemIndex) => (
            <button key={item.file} type="button" aria-label={t(item.title)} data-active={itemIndex === index} onClick={() => setIndex(itemIndex)} />
          ))}
        </span>
      </footer>
    </article>
  );
}

// Крупные буквы — как на стёганом чехле и несессере: «КР» сверху уходит за правый и верхний край,
// «ДВ» снизу — за левый и нижний; в свободных углах — маленькая подпись и нашивка с сердцем.
// Два цветовых решения (светлый чехол / синий несессер) сменяют друг друга — композиция не меняется.
const letterColorways = [
  { id: "light", bg: "#dcdfe6", fg: "#1d4fd8", patch: "#ffffff", name: "Чехол для ноутбука" },
  { id: "blue", bg: "#1d4fd8", fg: "#dcdfe6", patch: "#eef0f5", name: "Несессер" },
];

function LettersTile({ t }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.4);
  const reduceMotion = useReducedMotion();
  const [index] = useCycle(letterColorways.length, 3600, inView && !reduceMotion);
  const way = letterColorways[index];
  const shown = inView || reduceMotion;
  const ease = [0.16, 1, 0.3, 1];
  const row = (from) => ({
    initial: reduceMotion ? false : { x: from, opacity: 0 },
    animate: shown ? { x: 0, opacity: 1 } : { x: from, opacity: 0 },
  });
  return (
    <article ref={ref} className="ms-tile ms-letters">
      <header className="ms-label">
        <span>03</span> {t("Крупные буквы")}
        <em className="ms-label-meta">{t(way.name)}</em>
      </header>
      <div className="ms-letters-canvas">
        <svg viewBox="0 0 1270 1000" role="img" aria-label={t("Композиция крупных букв КРДВ: две строки со сдвигом, буквы уходят за края предмета")} style={{ "--bg": way.bg, "--fg": way.fg, "--patch": way.patch }}>
          <rect className="msl-bg" width="1270" height="1000" />
          <g className="msl-quilt">
            <line x1="635" y1="0" x2="635" y2="1000" />
            <line x1="0" y1="500" x2="1270" y2="500" />
          </g>
          <motion.g {...row(160)} transition={{ duration: 1.1, ease }}>
            <text className="msl-big" x="392" y="472">К</text>
            <text className="msl-big" x="842" y="472">Р</text>
          </motion.g>
          <motion.g {...row(-160)} transition={{ duration: 1.1, delay: 0.1, ease }}>
            <text className="msl-big" x="-46" y="1022">Д</text>
            <text className="msl-big" x="436" y="1022">В</text>
          </motion.g>
          <motion.g initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: shown ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <text className="msl-lock" x="96" y="176">
              <tspan className="msl-lock-b">КРДВ</tspan>
              <tspan x="96" dy="50">когда работа</tspan>
              <tspan x="96" dy="42">дарит восторг</tspan>
            </text>
            <rect className="msl-patch" x="1062" y="812" width="128" height="128" rx="16" />
            <image href={merchAsset("merch-heart-blue.svg")} x="1078" y="832" width="96" height="90" />
          </motion.g>
        </svg>
      </div>
      <footer className="ms-foot">
        <p>{t("Две строки со сдвигом: «КР» уходит за правый край, «ДВ» — за левый. В свободных углах — подпись и нашивка.")}</p>
      </footer>
    </article>
  );
}

function PaletteTile({ t }) {
  const [active, setActive] = useState(0);
  return (
    <article className="ms-tile ms-palette">
      <header className="ms-label">
        <span>04</span> {t("Цвета")}
      </header>
      <div className="ms-strips" onMouseLeave={() => setActive(0)}>
        {merchColors.map((color, index) => (
          <button
            key={color.hex}
            type="button"
            className="ms-strip"
            data-active={index === active}
            data-light={color.light ? "true" : undefined}
            style={{ "--c": color.hex }}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => setActive(index)}
            aria-label={`${color.name} ${color.hex}`}
          >
            <span className="ms-strip-info">
              <strong>{t(color.name)}</strong>
              <span>{color.hex}</span>
              <em>{t(color.use)}</em>
            </span>
          </button>
        ))}
      </div>
      <footer className="ms-foot">
        <p>{t("Цвета принтов, нашивок и стикеров. Цвет самого предмета подбирается под задачу и в систему не входит.")}</p>
      </footer>
    </article>
  );
}

export function MerchSystem({ t }) {
  return (
    <div className="merch-system">
      <SignatureTile t={t} />
      <HeartTile t={t} />
      <LettersTile t={t} />
      <PaletteTile t={t} />
    </div>
  );
}

/* ───────── 2. Слоганы-стикеры ───────── */

// Стикеры — вырезаны из макета набора 3D-стикеров (сохранены иллюстрации и объём). w — ширина в исходном масштабе.
const merchStickers = [
  { id: "s05", w: 445, alt: "Всё начинается с развития" },
  { id: "s01", w: 316, alt: "КРДВ. Когда решения двигают вперёд" },
  { id: "s03", w: 598, alt: "КРДВ. (с) когда работа дарит восторг" },
  { id: "s12", w: 324, alt: "Сердце КРДВ, красное" },
  { id: "s06", w: 395, alt: "Арктика закаляет. Восток вдохновляет" },
  { id: "s09", w: 316, alt: "Кофе — наш главный инвестор" },
  { id: "s02", w: 395, alt: "Логотип КРДВ" },
  { id: "s17", w: 316, alt: "Дальний Восток — настоящее будущее" },
  { id: "s10", w: 315, alt: "Арктика не терпит слабых решений" },
  { id: "s19", w: 326, alt: "Сердце КРДВ, синее" },
  { id: "s07", w: 395, alt: "КРДВ. Заряжены на развитие" },
  { id: "s14", w: 317, alt: "Арктика закаляет, кофе согревает" },
  { id: "s08", w: 806, alt: "Большие проекты начинаются с небольшого блокнота" },
  { id: "s13", w: 314, alt: "Несу добро и развиваю Дальний Восток" },
  { id: "s20", w: 315, alt: "Дальний Восток — близко к сердцу" },
  { id: "s16", w: 315, alt: "Не край земли, а край возможностей" },
  { id: "s18", w: 315, alt: "Дальний Восток — там, где сердце" },
  { id: "s04", w: 395, alt: "Логотип КРДВ на синем" },
  { id: "s11", w: 315, alt: "Минвостокразвития России" },
  { id: "s15", w: 316, alt: "Герб Минвостокразвития на синем" },
];

// Перетаскивание — своё, на pointer-событиях: стикер едет строго за пальцем/курсором, не выходит за доску,
// не подпрыгивает и не улетает по инерции; взятый стикер поднимается над остальными.
export function MerchSlogans({ t }) {
  const boardRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [pos, setPos] = useState({});
  const [order, setOrder] = useState({});
  const [dragging, setDragging] = useState(null);
  const top = useRef(10);
  const drag = useRef(null);

  const onDown = (event, id) => {
    if (reduceMotion || event.button > 0) return;
    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    const board = boardRef.current.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const start = pos[id] || { x: 0, y: 0 };
    drag.current = {
      id,
      sx: event.clientX,
      sy: event.clientY,
      start,
      min: { x: start.x + (board.left - rect.left), y: start.y + (board.top - rect.top) },
      max: { x: start.x + (board.right - rect.right), y: start.y + (board.bottom - rect.bottom) },
    };
    top.current += 1;
    setOrder((value) => ({ ...value, [id]: top.current }));
    setDragging(id);
  };
  const onMove = (event) => {
    const d = drag.current;
    if (!d) return;
    const x = Math.min(d.max.x, Math.max(d.min.x, d.start.x + event.clientX - d.sx));
    const y = Math.min(d.max.y, Math.max(d.min.y, d.start.y + event.clientY - d.sy));
    setPos((value) => ({ ...value, [d.id]: { x, y } }));
  };
  const onUp = () => {
    drag.current = null;
    setDragging(null);
  };

  return (
    <div className="merch-stickers" ref={boardRef}>
      {merchStickers.map((sticker, index) => {
        const p = pos[sticker.id] || { x: 0, y: 0 };
        const tilt = ((index * 37) % 7) - 3;
        return (
          <img
            key={sticker.id}
            src={merchAsset(`stickers/${sticker.id}.webp`)}
            alt={t(sticker.alt)}
            className={`mst ${dragging === sticker.id ? "is-dragging" : ""}`}
            style={{ "--w": sticker.w, transform: `translate(${p.x}px, ${p.y}px) rotate(${tilt}deg)`, zIndex: order[sticker.id] || 1 }}
            draggable={false}
            onPointerDown={(event) => onDown(event, sticker.id)}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        );
      })}
      <span className="merch-stickers-hint">{t("Стикеры можно передвигать")}</span>
    </div>
  );
}

/* ───────── 3. Одежда: переключатель + лупа на принт ───────── */

// Фото приведены к одному кадру: вещь вписана в одинаковое поле 1160×960 на холсте 1600×1200, по центру.
const apparelItems = [
  { id: "tee", file: "merch-ap-tee.webp", title: "Футболка, белая", text: "Тёплый белый. Сердце «Дальний Восток — близко к сердцу» на груди." },
  { id: "tee-sky", file: "merch-ap-tee-sky.webp", title: "Футболка, нежно-голубая", text: "Розовое солнце и подпись «Встречаем день первыми на Дальнем Востоке»." },
  { id: "anorak-beige", file: "merch-ap-anorak-beige.webp", title: "Ветровка, молочная", text: "Анорак оверсайз, сердце с плашкой на груди." },
  { id: "anorak-black", file: "merch-ap-anorak-black.webp", title: "Ветровка, чёрная", text: "Сердце КРДВ на груди, крупное — на спине." },
];

export function MerchApparel({ t }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(null);
  const item = apparelItems[index];
  const onMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setZoom([((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100]);
  };
  return (
    <div className="merch-apparel">
      <div
        className={`mp-stage ${zoom ? "is-zoom" : ""}`}
        data-item={item.id}
        onPointerMove={onMove}
        onPointerLeave={() => setZoom(null)}
      >
        <div className="mp-zoom" style={zoom ? { transformOrigin: `${zoom[0]}% ${zoom[1]}%` } : undefined}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={item.file}
              src={merchAsset(item.file)}
              alt={t(item.title)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        </div>
        <span className="mp-hint">{t("Наведите, чтобы рассмотреть принт")}</span>
      </div>
      <div className="mp-list">
        {apparelItems.map((entry, entryIndex) => (
          <button key={entry.id} type="button" data-active={entryIndex === index} onClick={() => setIndex(entryIndex)}>
            <span className="mp-num">{String(entryIndex + 1).padStart(2, "0")}</span>
            <strong>{t(entry.title)}</strong>
            <span>{t(entry.text)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── 4. Сумки и чехлы ───────── */

const shoppers = [
  { id: "blue", file: "merch-shopper-blue-v2.webp", name: "Синий", swatch: "#2a2a8c", slogan: "«Приносим радость»" },
  { id: "sky", file: "merch-shopper-sky-v2.webp", name: "Голубой", swatch: "#3d7ec1", slogan: "«Когда работа дарит восторг»" },
  { id: "black", file: "merch-shopper-black-v2.webp", name: "Чёрный", swatch: "#141414", slogan: "«Несу добро и развиваю Дальний Восток»" },
];

function ShopperSwitcher({ t }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();
  const [manual, setManual] = useState(false);
  const [index, setIndex] = useCycle(shoppers.length, 3200, inView && !manual && !reduceMotion);
  const bag = shoppers[index];
  return (
    <article ref={ref} className="mb-card mb-shopper">
      <div className="mb-stage">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={bag.id}
            src={merchAsset(bag.file)}
            alt={t(`Шоппер, ${bag.name.toLowerCase()}`)}
            initial={reduceMotion ? false : { rotate: 7, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { rotate: -5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 11, opacity: { duration: 0.25 } }}
          />
        </AnimatePresence>
      </div>
      <div className="mb-copy">
        <h3>{t("Стёганый шоппер")}</h3>
        <p>
          {t("Один крой, три цвета и разные фразы.")} <span className="mb-quote">{t(bag.slogan)}</span>
        </p>
        <div className="mb-swatches" role="tablist" aria-label={t("Цвет шоппера")}>
          {shoppers.map((entry, entryIndex) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={entryIndex === index}
              data-active={entryIndex === index}
              onClick={() => {
                setManual(true);
                setIndex(entryIndex);
              }}
            >
              <i style={{ background: entry.swatch }} />
              {t(entry.name)}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export function MerchBags({ t }) {
  return (
    <div className="merch-bags">
      <ShopperSwitcher t={t} />
      <motion.article className="mb-card mb-quilted" whileHover={{ y: -2 }}>
        <div className="mb-stage">
          <img src={merchAsset("merch-quilted.webp")} alt={t("Стёганый чехол для ноутбука и несессер с крупными буквами КРДВ")} loading="lazy" />
        </div>
        <div className="mb-copy">
          <h3>{t("Чехол и несессер")}</h3>
          <p>{t("Стёганая серия: буквы КРДВ во весь предмет, сердце — на нашивке.")}</p>
        </div>
      </motion.article>
      <motion.article className="mb-card mb-knit" whileHover={{ y: -2 }}>
        <div className="mb-stage">
          <img src={merchAsset("merch-shopper-knit.webp")} alt={t("Вязаный шоппер с буквами КРДВ")} loading="lazy" />
        </div>
        <div className="mb-copy">
          <h3>{t("Вязаный шоппер")}</h3>
          <p>{t("Те же буквы в жаккардовой вязке. Пример брендирования.")}</p>
        </div>
      </motion.article>
    </div>
  );
}

/* ───────── 5. Ремувки: термоактивная печать ───────── */

const THERMO_W = 154;
const THERMO_H = 154;

export function MerchThermo({ t }) {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const heatRef = useRef(new Float32Array(THERMO_W * THERMO_H));
  const maskRef = useRef(null);
  const colorRef = useRef(null);
  const rafRef = useRef(0);
  const sunRef = useRef(0); // 0 — нет, иначе время старта
  const coolRef = useRef(false); // быстрое остывание после ручного выключения солнца
  const [sun, setSun] = useState(false);
  const [touched, setTouched] = useState(false);
  const reduceMotion = useReducedMotion();

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const color = colorRef.current;
    if (!canvas || !color || !color.complete) return false;
    const heat = heatRef.current;
    let mask = maskRef.current;
    if (!mask) {
      mask = document.createElement("canvas");
      mask.width = THERMO_W;
      mask.height = THERMO_H;
      maskRef.current = mask;
    }
    const mctx = mask.getContext("2d");
    const data = mctx.createImageData(THERMO_W, THERMO_H);
    let alive = false;
    // солнце: прогрев 1,2 с, держится 2,5 с, дальше остывает само
    let sunLevel = 0;
    if (sunRef.current) {
      const elapsed = (performance.now() - sunRef.current) / 1000;
      if (elapsed < 1.2) sunLevel = elapsed / 1.2;
      else if (elapsed < 6) sunLevel = 1;
      else {
        sunRef.current = 0;
        setSun(false);
      }
    }
    for (let i = 0; i < heat.length; i += 1) {
      // остывание: полный цвет держится ~3 с, гаснет к ~6 с; после «убрать с солнца» — быстро
      let value = Math.max(0, heat[i] - (coolRef.current ? 0.035 : 0.0028));
      if (sunLevel > value) value = sunLevel;
      heat[i] = value;
      if (value > 0.004) alive = true;
      const s = Math.min(1, Math.max(0, (value - 0.05) / 0.4));
      data.data[i * 4 + 3] = Math.round(s * s * (3 - 2 * s) * 255);
    }
    if (!alive) coolRef.current = false;
    mctx.putImageData(data, 0, 0);
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "copy";
    ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(color, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    return alive || Boolean(sunRef.current);
  }, []);

  const loop = useCallback(() => {
    const keep = render();
    rafRef.current = keep ? requestAnimationFrame(loop) : 0;
  }, [render]);

  const kick = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(loop);
  }, [loop]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return undefined;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(stage.clientWidth * ratio);
      canvas.height = Math.round(stage.clientHeight * ratio);
      render();
    };
    resize();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(stage);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [render]);

  const warm = (event) => {
    const rect = stageRef.current.getBoundingClientRect();
    const cx = ((event.clientX - rect.left) / rect.width) * THERMO_W;
    const cy = ((event.clientY - rect.top) / rect.height) * THERMO_H;
    const radius = 16;
    const heat = heatRef.current;
    for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(THERMO_H, cy + radius); y += 1) {
      for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(THERMO_W, cx + radius); x += 1) {
        const d = Math.hypot(x - cx, y - cy) / radius;
        if (d < 1) {
          const i = y * THERMO_W + x;
          heat[i] = Math.min(1, heat[i] + (1 - d) * 0.9);
        }
      }
    }
    if (!touched) setTouched(true);
    kick();
  };

  const toSun = () => {
    if (reduceMotion) {
      heatRef.current.fill(sun ? 0 : 1);
      setSun(!sun);
      render();
      return;
    }
    if (sun) {
      // ручное выключение: солнце убрано, лента быстро остывает
      sunRef.current = 0;
      coolRef.current = true;
      setSun(false);
      kick();
      return;
    }
    coolRef.current = false;
    sunRef.current = performance.now();
    setSun(true);
    kick();
  };

  return (
    <div className="merch-thermo">
      <div className="mt-copy">
        <span className="mt-label">{t("Термоактивная печать")}</span>
        <h3>{t("Надпись проявляется от тепла")}</h3>
        <p>{t("В обычном состоянии надпись — тёмно-серая на чёрной ленте. В тёплой руке или на солнце краска становится яркой, а остывая, снова прячется.")}</p>
        <button type="button" className="mt-sun" data-active={sun} aria-pressed={sun} onClick={toSun}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return <line key={i} x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7} x2={12 + Math.cos(a) * 9.6} y2={12 + Math.sin(a) * 9.6} />;
            })}
          </svg>
          {sun ? t("Убрать с солнца") : t("Вынести на солнце")}
        </button>
      </div>
      <div
        ref={stageRef}
        className="mt-stage"
        onPointerMove={warm}
        onPointerDown={warm}
        role="img"
        aria-label={t("Ремувки «Арктика» и «Дальний Восток»: надпись проявляется цветом там, где ленту согрели")}
      >
        <img src={merchAsset("merch-thermo-grey-v2.webp")} alt="" draggable="false" />
        <img ref={colorRef} className="mt-color-src" src={merchAsset("merch-thermo-color-v2.webp")} alt="" onLoad={() => render()} />
        <canvas ref={canvasRef} />
        <span className={`mt-hint ${touched ? "is-hidden" : ""}`}>{t("Проведите по лентам — согрейте их")}</span>
      </div>
    </div>
  );
}

/* ───────── 6. Аксессуары ───────── */

const accessoryCards = [
  { id: "power", span: 7, stage: "#eef0f4", images: ["merch-powerbanks.webp"], title: "Аккумуляторы", text: "«Энергия Дальнего Востока» и «Арктика держит заряд» — фраза подсказывает, зачем вещь." },
  { id: "mug", span: 5, fit: "contain", images: ["merch-mug.webp"], title: "Термокружка", text: "«Арктика закаляет, кофе согревает». В коробке — QR-код на сайт." },
  { id: "weather", span: 7, images: ["merch-raincoat.webp", "merch-umbrella.webp"], title: "Зонт и дождевик", text: "Одна фраза на двух вещах: «Работаем в любую погоду»." },
  { id: "notebooks", span: 5, fit: "contain", images: ["merch-notebooks.webp"], title: "Блокноты", text: "«План развития: здесь», «Дальний Восток — территория идей» и «Большие проекты начинаются с небольшого блокнота»." },
  { id: "keychain", span: 6, fit: "contain", images: ["merch-keychain.webp"], title: "Брелоки", text: "Эмалевое сердце КРДВ, лотос и подвеска «Когда работа дарит восторг»." },
  { id: "lanyard", span: 6, fit: "contain", images: ["merch-lanyard.webp"], title: "Шнур для телефона", text: "Серый шнур с карабином, бирка с подписью и сердцем." },
];

export function MerchAccessories({ t }) {
  return (
    <div className="merch-acc">
      {accessoryCards.map((card) => (
        <motion.article key={card.id} className={`ma-card span-${card.span}`} whileHover={{ y: -2 }}>
          <div className={`ma-stage ${card.images.length > 1 ? "is-pair" : ""} ${card.fit === "contain" ? "is-contain" : ""}`} style={card.stage ? { background: card.stage } : undefined}>
            {card.images.map((file) => (
              <img key={file} src={merchAsset(file)} alt="" loading="lazy" />
            ))}
          </div>
          <div className="ma-copy">
            <h3>{t(card.title)}</h3>
            <p>{t(card.text)}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
