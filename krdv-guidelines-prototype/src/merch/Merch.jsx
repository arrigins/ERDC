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

const merchColors = [
  { name: "Ультрамарин", hex: "#1D4FD8", use: "Несессер, чехол, вязаный шоппер" },
  { name: "Синий", hex: "#2A2A8C", use: "Шоппер" },
  { name: "Голубой", hex: "#3D7EC1", use: "Шоппер" },
  { name: "Тёмно-синий", hex: "#283246", use: "Зонт, аккумулятор" },
  { name: "Красный", hex: "#EE3137", use: "Сердце" },
  { name: "Оранжевый", hex: "#E57A35", use: "Аккумулятор, ремувка" },
  { name: "Молочный", hex: "#ECE2D7", use: "Ветровка, термокружка" },
  { name: "Чёрный", hex: "#141414", use: "Шоппер, ветровка, ремувки" },
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

function LettersTile({ t }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.4);
  const reduceMotion = useReducedMotion();
  const letters = [
    { ch: "К", from: { x: "-30%", y: "-20%" } },
    { ch: "Р", from: { x: "30%", y: "-25%" } },
    { ch: "Д", from: { x: "-25%", y: "30%" } },
    { ch: "В", from: { x: "35%", y: "25%" } },
  ];
  return (
    <article ref={ref} className="ms-tile ms-letters">
      <div className="ms-letters-field" aria-hidden="true">
        {letters.map((letter, index) => (
          <motion.span
            key={letter.ch}
            className={`ms-letter is-${index}`}
            initial={reduceMotion ? false : { ...letter.from, opacity: 0 }}
            animate={inView || reduceMotion ? { x: 0, y: 0, opacity: 1 } : { ...letter.from, opacity: 0 }}
            transition={{ duration: 1.1, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {letter.ch}
          </motion.span>
        ))}
      </div>
      <header className="ms-label">
        <span>03</span> {t("Крупные буквы")}
      </header>
      <footer className="ms-foot">
        <p>{t("Буквы крупнее предмета и уходят за край.")}</p>
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
        <p>{t("Цвета самих вещей: ткань, металл, эмаль. Основной синий КРДВ здесь уступает яркому ультрамарину и тёплым оттенкам.")}</p>
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

// *слово* — акцент (курсив, цвет акцента), как на наборе 3D-стикеров
const merchStickers = [
  { text: "**КРДВ**\nКогда решения *двигают вперёд*", tone: "blue", shape: "square" },
  { text: "**КРДВ**\n(с) когда работа дарит восторг", tone: "milk", shape: "pill" },
  { text: "Всё начинается\n*с развития*", tone: "blue", shape: "circle" },
  { text: "Арктика закаляет.\n**Восток вдохновляет**", tone: "pink", shape: "pill" },
  { text: "**КРДВ**\nЗаряжены на развитие", tone: "pink", shape: "round" },
  { text: "Кофе — наш главный *инвестор*", tone: "blue", shape: "square" },
  { text: "**Арктика**\n*не терпит слабых решений*", tone: "milk", shape: "square" },
  { text: "**Дальний Восток**\n— близко к сердцу", tone: "red", shape: "circle" },
  { text: "Большие проекты начинаются с небольшого блокнота", tone: "milk", shape: "pill wide" },
  { text: "Несу добро и развиваю\n**Дальний Восток**", tone: "milk", shape: "square" },
  { text: "Дальний Восток\n*настоящее будущее*", tone: "blue", shape: "square" },
  { text: "Не край земли, а край *возможностей*", tone: "blue", shape: "circle" },
  { text: "**Дальний Восток —**\nтам, где сердце", tone: "pink", shape: "square" },
];

function StickerText({ text, t }) {
  return text.split("\n").map((line, lineIndex) => (
    <span key={lineIndex} className="mst-line">
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, index) => {
        if (part.startsWith("**")) return <strong key={index}>{t(part.slice(2, -2))}</strong>;
        if (part.startsWith("*")) return <em key={index}>{t(part.slice(1, -1))}</em>;
        return <span key={index}>{t(part)}</span>;
      })}
    </span>
  ));
}

export function MerchSlogans({ t }) {
  const boardRef = useRef(null);
  const reduceMotion = useReducedMotion();
  return (
    <div className="merch-stickers" ref={boardRef}>
      {merchStickers.map((sticker, index) => {
        const tilt = ((index * 37) % 9) - 4;
        return (
          <motion.div
            key={sticker.text}
            className={`mst is-${sticker.tone} ${sticker.shape
              .split(" ")
              .map((s) => `is-${s}`)
              .join(" ")}`}
            style={{ rotate: tilt }}
            drag={!reduceMotion}
            dragConstraints={boardRef}
            dragElastic={0.15}
            dragMomentum={false}
            whileHover={reduceMotion ? undefined : { y: -4, rotate: 0, scale: 1.03 }}
            whileDrag={{ scale: 1.08, rotate: 0, zIndex: 5, boxShadow: "0 24px 40px rgba(10, 20, 60, 0.22)" }}
          >
            <StickerText text={sticker.text} t={t} />
          </motion.div>
        );
      })}
      <span className="merch-stickers-hint">{t("Стикеры можно передвигать")}</span>
    </div>
  );
}

/* ───────── 3. Одежда: переключатель + лупа на принт ───────── */

const apparelItems = [
  { id: "tee", file: "merch-tee.webp", title: "Футболка", text: "Белая, тёплый тон. Сердце «Дальний Восток — близко к сердцу» на груди.", focus: [64, 30] },
  { id: "anorak-beige", file: "merch-anorak-beige.webp", title: "Ветровка, молочная", text: "Анорак оверсайз, то же сердце с плашкой.", focus: [62, 38] },
  { id: "anorak-black", file: "merch-anorak-black.webp", title: "Ветровка, чёрная", text: "Сердце КРДВ на груди, крупное — на спине.", focus: [62, 38] },
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
  { id: "blue", file: "merch-shopper-blue.webp", name: "Синий", swatch: "#2a2a8c", tint: "#e7e7f3", slogan: "«Приносим радость»" },
  { id: "sky", file: "merch-shopper-sky.webp", name: "Голубой", swatch: "#3d7ec1", tint: "#e4eef8", slogan: "«Когда работа дарит восторг»" },
  { id: "black", file: "merch-shopper-black.webp", name: "Чёрный", swatch: "#141414", tint: "#ededee", slogan: "Только «КРДВ», без фразы" },
];

function ShopperSwitcher({ t }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  const reduceMotion = useReducedMotion();
  const [manual, setManual] = useState(false);
  const [index, setIndex] = useCycle(shoppers.length, 3200, inView && !manual && !reduceMotion);
  const bag = shoppers[index];
  return (
    <article ref={ref} className="mb-card mb-shopper" style={{ "--tint": bag.tint }}>
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
      else if (elapsed < 3.7) sunLevel = 1;
      else {
        sunRef.current = 0;
        setSun(false);
      }
    }
    for (let i = 0; i < heat.length; i += 1) {
      let value = heat[i] * 0.988; // остывание ~4 с
      if (sunLevel > value) value = sunLevel;
      heat[i] = value;
      if (value > 0.004) alive = true;
      const s = Math.min(1, Math.max(0, (value - 0.05) / 0.4));
      data.data[i * 4 + 3] = Math.round(s * s * (3 - 2 * s) * 255);
    }
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
    const radius = 15;
    const heat = heatRef.current;
    for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(THERMO_H, cy + radius); y += 1) {
      for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(THERMO_W, cx + radius); x += 1) {
        const d = Math.hypot(x - cx, y - cy) / radius;
        if (d < 1) {
          const i = y * THERMO_W + x;
          heat[i] = Math.min(1, heat[i] + (1 - d) * 0.5);
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
        <button type="button" className="mt-sun" data-active={sun} onClick={toSun}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i * Math.PI) / 4;
              return <line key={i} x1={12 + Math.cos(a) * 7} y1={12 + Math.sin(a) * 7} x2={12 + Math.cos(a) * 9.6} y2={12 + Math.sin(a) * 9.6} />;
            })}
          </svg>
          {sun ? t("Греется на солнце…") : t("Вынести на солнце")}
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
        <img src={merchAsset("merch-thermo-grey.webp")} alt="" draggable="false" />
        <img ref={colorRef} className="mt-color-src" src={merchAsset("merch-thermo-color.webp")} alt="" onLoad={() => render()} />
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
  { id: "stickers", span: 5, fit: "contain", images: ["merch-stickers.webp"], title: "3D-стикеры", text: "Набор объёмных наклеек со слоганами и сердцами." },
  { id: "keychain", span: 6, fit: "contain", images: ["merch-keychain.webp"], title: "Брелоки", text: "Эмалевое сердце КРДВ, лотос и подвеска «Когда работа дарит восторг»." },
  { id: "lanyard", span: 6, images: ["merch-lanyard.webp"], title: "Шнур для телефона", text: "Серый шнур с карабином, бирка с подписью и сердцем." },
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
