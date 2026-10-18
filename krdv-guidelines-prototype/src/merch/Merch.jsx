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
// Стикерпак: позиции и размеры — как на исходном листе (в % листа: left, top, width).
const merchStickers = [
  { id: "s01", at: [2.72, 1.52, 22.67], alt: "КРДВ. Когда решения двигают вперёд" },
  { id: "s02", at: [26.11, 1.74, 28.3], alt: "Логотип КРДВ" },
  { id: "s03", at: [55.01, 4.6, 42.84], alt: "КРДВ. (с) когда работа дарит восторг" },
  { id: "s04", at: [2.15, 17.84, 28.3], alt: "Логотип КРДВ на синем" },
  { id: "s05", at: [35.39, 16.73, 31.88], alt: "Всё начинается с развития" },
  { id: "s06", at: [69.56, 18.02, 28.3], alt: "Арктика закаляет. Восток вдохновляет" },
  { id: "s07", at: [2.15, 34.02, 28.3], alt: "КРДВ. Заряжены на развитие" },
  { id: "s08", at: [33.35, 35.0, 57.74], alt: "Большие проекты начинаются с небольшого блокнота" },
  { id: "s09", at: [2.72, 50.14, 22.67], alt: "Кофе — наш главный инвестор" },
  { id: "s10", at: [26.79, 50.21, 22.56], alt: "Арктика не терпит слабых решений" },
  { id: "s11", at: [50.86, 50.21, 22.56], alt: "Минвостокразвития России" },
  { id: "s12", at: [74.61, 50.37, 23.24], alt: "Сердце КРДВ, красное" },
  { id: "s13", at: [2.76, 66.31, 22.53], alt: "Несу добро и развиваю Дальний Восток" },
  { id: "s14", at: [26.9, 66.21, 22.71], alt: "Арктика закаляет, кофе согревает" },
  { id: "s15", at: [51.11, 66.21, 22.67], alt: "Герб Минвостокразвития на синем" },
  { id: "s16", at: [75.29, 66.21, 22.56], alt: "Не край земли, а край возможностей" },
  { id: "s17", at: [2.72, 82.56, 22.67], alt: "Дальний Восток — настоящее будущее" },
  { id: "s18", at: [26.9, 82.56, 22.6], alt: "Дальний Восток — там, где сердце" },
  { id: "s19", at: [50.75, 82.74, 23.39], alt: "Сердце КРДВ, синее" },
  { id: "s20", at: [75.29, 83.7, 22.56], alt: "Дальний Восток — близко к сердцу" },
];

// Ноутбук и лист лежат на столе (наклон в перспективе). Стикер отклеивается с листа — на его месте остаётся след,
// остальные не двигаются. Отпустили над крышкой — приклеился; мимо — плавно вернулся на своё место на листе.
const TILT = 24; // градусов
const PERSPECTIVE = 1500;
const stickerStart = { s19: { x: 22, y: 34 }, s05: { x: 72, y: 60 }, s09: { x: 44, y: 70 } };

// Экранная точка (относительно центра неповёрнутой крышки) → координаты на крышке
function screenToLid(sx, sy) {
  const r = (TILT * Math.PI) / 180;
  const y = (sy * PERSPECTIVE) / (PERSPECTIVE * Math.cos(r) + sy * Math.sin(r));
  const x = (sx * (PERSPECTIVE - y * Math.sin(r))) / PERSPECTIVE;
  return { x, y };
}

export function MerchSlogans({ t }) {
  const reduceMotion = useReducedMotion();
  const lidBoxRef = useRef(null);
  const sheetRef = useRef(null);
  const slotRefs = useRef({});
  const [sheetW, setSheetW] = useState(0);
  const [placed, setPlaced] = useState(stickerStart);
  const [order, setOrder] = useState(Object.keys(stickerStart));
  const [ghost, setGhost] = useState(null); // { id, x, y, w, back }
  const dragRef = useRef(null);

  useEffect(() => {
    const node = sheetRef.current;
    if (!node) return undefined;
    const update = () => setSheetW(node.clientWidth);
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(node);
    return () => observer?.disconnect();
  }, []);

  const size = (item) => (item.at[2] / 100) * sheetW;

  const onDown = (event, item, from) => {
    if (event.button > 0 || ghost) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const w = size(item);
    const ratio = event.currentTarget.naturalHeight / event.currentTarget.naturalWidth || 1;
    dragRef.current = { id: item.id, from, ratio, offX: w / 2, offY: (w * ratio) / 2 };
    event.currentTarget.setPointerCapture(event.pointerId);
    // стикер «в руке» — по центру под пальцем, чуть крупнее (ближе к глазам)
    setGhost({ id: item.id, x: event.clientX, y: event.clientY, w, lift: true, sx: rect.left + rect.width / 2, sy: rect.top + rect.height / 2 });
  };
  const onMove = (event) => {
    if (!dragRef.current) return;
    setGhost((g) => (g ? { ...g, x: event.clientX, y: event.clientY } : g));
  };
  const onUp = (event) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    const box = lidBoxRef.current.getBoundingClientRect();
    const local = screenToLid(event.clientX - (box.left + box.width / 2), event.clientY - (box.top + box.height / 2));
    const item = merchStickers.find((s) => s.id === d.id);
    const w = size(item);
    const h = w * d.ratio;
    const W = box.width;
    const H = box.height;
    const inside = Math.abs(local.x) < W / 2 && Math.abs(local.y) < H / 2;
    if (inside) {
      const x = Math.min(W / 2 - w / 2, Math.max(-W / 2 + w / 2, local.x));
      const y = Math.min(H / 2 - h / 2, Math.max(-H / 2 + h / 2, local.y));
      setPlaced((v) => ({ ...v, [d.id]: { x: ((x + W / 2) / W) * 100, y: ((y + H / 2) / H) * 100 } }));
      setOrder((v) => [...v.filter((id) => id !== d.id), d.id]);
      setGhost(null);
      return;
    }
    // мимо крышки — вернуть на своё место на листе
    setPlaced((v) => {
      const next = { ...v };
      delete next[d.id];
      return next;
    });
    setOrder((v) => v.filter((id) => id !== d.id));
    const slot = slotRefs.current[d.id]?.getBoundingClientRect();
    if (!slot || reduceMotion) {
      setGhost(null);
      return;
    }
    setGhost((g) => (g ? { ...g, x: slot.left + slot.width / 2, y: slot.top + slot.height / 2, back: true, lift: false } : g));
    window.setTimeout(() => setGhost(null), 320);
  };

  const handlers = { onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp };
  const ghostItem = ghost ? merchStickers.find((s) => s.id === ghost.id) : null;

  return (
    <div className="merch-laptop">
      <div className="ml-scene">
        <div className="ml-lid-box" ref={lidBoxRef}>
          <div className="ml-lid" style={{ transform: `perspective(${PERSPECTIVE}px) rotateX(${TILT}deg)` }}>
            {order
              .filter((id) => placed[id])
              .map((id) => {
                const item = merchStickers.find((s) => s.id === id);
                return (
                  <img
                    key={id}
                    className={`mst is-stuck ${ghost?.id === id ? "is-hidden" : ""}`}
                    src={merchAsset(`stickers/${id}.webp`)}
                    alt={t(item.alt)}
                    draggable={false}
                    style={{ left: `${placed[id].x}%`, top: `${placed[id].y}%`, width: size(item) }}
                    onPointerDown={(event) => onDown(event, item, "lid")}
                    {...handlers}
                  />
                );
              })}
          </div>
        </div>
      </div>

      <div className="ml-scene is-sheet">
        <div className="ml-sheet" style={{ transform: `perspective(${PERSPECTIVE}px) rotateX(${TILT}deg)` }}>
          <div className="ml-sheet-inner" ref={sheetRef}>
            {merchStickers.map((item) => {
              const off = Boolean(placed[item.id]) || ghost?.id === item.id;
              return (
                <img
                  key={item.id}
                  ref={(node) => {
                    slotRefs.current[item.id] = node;
                  }}
                  className={`mst is-slot ${off ? "is-peeled" : ""}`}
                  src={merchAsset(`stickers/${item.id}.webp`)}
                  alt={off ? "" : t(item.alt)}
                  draggable={false}
                  style={{ left: `${item.at[0]}%`, top: `${item.at[1]}%`, width: `${item.at[2]}%` }}
                  onPointerDown={off ? undefined : (event) => onDown(event, item, "sheet")}
                  {...handlers}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="ml-hint">
        {t("Перетащите стикер с листа на крышку. Чтобы вернуть — унесите его с крышки обратно.")}
        {Object.keys(placed).length ? (
          <button
            type="button"
            onClick={() => {
              setPlaced({});
              setOrder([]);
            }}
          >
            {t("Вернуть все на лист")}
          </button>
        ) : null}
      </p>

      {ghost && ghostItem ? (
        <img
          className={`ml-ghost ${ghost.back ? "is-back" : ""} ${ghost.lift ? "is-lift" : ""}`}
          src={merchAsset(`stickers/${ghost.id}.webp`)}
          alt=""
          style={{ left: ghost.x, top: ghost.y, width: ghost.w }}
        />
      ) : null}
    </div>
  );
}

/* ───────── 3. Одежда: переключатель ───────── */

// Фото приведены к одному кадру: вещь вписана в одинаковое поле 1160×960 на холсте 1600×1200, по центру.
const apparelItems = [
  { id: "tee", file: "merch-ap2-tee.webp", title: "Футболка, белая", text: "Тёплый белый. Сердце «Дальний Восток — близко к сердцу» на груди." },
  { id: "tee-sky", file: "merch-ap2-tee-sky.webp", title: "Футболка, нежно-голубая", text: "Розовое солнце и подпись «Встречаем день первыми на Дальнем Востоке»." },
  { id: "anorak-beige", file: "merch-ap2-anorak-beige.webp", title: "Ветровка, молочная", text: "Анорак оверсайз, сердце с плашкой на груди." },
  { id: "anorak-black", file: "merch-ap2-anorak-black.webp", title: "Ветровка, чёрная", text: "Сердце КРДВ на груди, крупное — на спине." },
];

export function MerchApparel({ t }) {
  const [index, setIndex] = useState(0);
  const item = apparelItems[index];
  return (
    <div className="merch-apparel">
      <div className="mp-stage" data-item={item.id}>
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

const THERMO_W = 240;
const THERMO_H = 240;

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
      const s = Math.min(1, Math.max(0, (value - 0.04) / 0.5));
      data.data[i * 4 + 3] = Math.round(s * s * (3 - 2 * s) * 255);
    }
    if (!alive) coolRef.current = false;
    mctx.putImageData(data, 0, 0);
    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "copy";
    // маска мягко размывается, чтобы граница прогрева не была «ступенькой»
    ctx.imageSmoothingQuality = "high";
    ctx.filter = `blur(${Math.round(canvas.width / 140)}px)`;
    ctx.drawImage(mask, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
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
    const radius = 25;
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
        <img src={merchAsset("merch-thermo-grey-v4.webp")} alt="" draggable="false" />
        <img ref={colorRef} className="mt-color-src" src={merchAsset("merch-thermo-color-v4.webp")} alt="" onLoad={() => render()} />
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
