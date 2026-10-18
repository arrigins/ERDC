// Обложки разделов: сравнение трёх направлений на сетке «Обзора» (19.10). Отдельная страница covers.html,
// в гайд не встроена. Ничего из текущих обложек здесь не меняется.
import { useEffect, useRef, useState } from "react";

const A = (path) => `${import.meta.env.BASE_URL}assets/${path}`;

// Сетка 6 колонок: s — 2, l — 4, full — 6. Первая и последняя строки — как сейчас.
const proposedGrid = [
  ["positioning", "s"], ["logo", "l"],
  ["subsidiaries", "l"], ["regimes", "s"],
  ["color", "s"], ["typography", "s"], ["text", "s"],
  ["corporate", "s"], ["advertising", "l"],
  ["merch", "l"], ["made", "s"],
  ["photostyle", "full"],
  ["social", "l"], ["contacts", "s"],
];

// Текущая сетка (как на сайте сейчас)
const currentGrid = [
  ["positioning", "s"], ["logo", "l"],
  ["subsidiaries", "s"], ["regimes", "s"], ["color", "s"],
  ["typography", "l"], ["text", "s"],
  ["corporate", "s"], ["advertising", "s"], ["merch", "s"],
  ["made", "s"], ["photostyle", "l"],
  ["social", "l"], ["contacts", "s"],
];

const sections = {
  positioning: { n: "01", title: "Позиционирование" },
  logo: { n: "02", title: "Логотип" },
  subsidiaries: { n: "03", title: "Дочерние общества" },
  regimes: { n: "04", title: "Префрежимы и программы" },
  color: { n: "05", title: "Цвет" },
  typography: { n: "06", title: "Типографика" },
  text: { n: "07", title: "Оформление текста" },
  corporate: { n: "08", title: "Корпоративные материалы" },
  advertising: { n: "09", title: "Рекламные материалы" },
  merch: { n: "10", title: "Мерч" },
  made: { n: "11", title: "Товарный знак" },
  photostyle: { n: "12", title: "Фотостиль" },
  social: { n: "13", title: "Дизайн соцсетей" },
  contacts: { n: "14", title: "Контакты" },
};

// Насыщенность общего градиента для разделов (направления Б и В)
const tone = {
  positioning: "light", logo: "sat", subsidiaries: "deep", regimes: "deep", color: "light", typography: "light",
  text: "light", corporate: "sat", advertising: "sat", merch: "light", made: "violet", photostyle: "photo", social: "sat", contacts: "deep",
};

/* ───────── Сейчас ───────── */
function CurrentTile({ id }) {
  const video = {
    logo: "logo-cover.mp4", subsidiaries: "subsidiaries-cover.mp4", text: "cover-text.mp4", corporate: "cover-corporate.mp4",
    advertising: "cover-advertising.mp4", merch: "cover-merch.mp4", photostyle: "photostyle-cover.mp4", contacts: "cover-contacts.mp4",
  }[id];
  const image = { regimes: "cover-regimes-glass-dark.webp", made: "cover-made-stickers-dark.webp", social: "cover-social-bubbles.webp" }[id];
  if (video) {
    return (
      <>
        <video className="cv-media" src={A(`hero/${video}`)} autoPlay muted loop playsInline />
        {id === "logo" ? <img className="cv-cur-logo" src={A("logos/krdv-logo-ru-horizontal-white.svg")} alt="" /> : null}
      </>
    );
  }
  if (image) return <img className="cv-media" src={A(`hero/${image}`)} alt="" />;
  if (id === "positioning") return <div className="cv-cur-aurora"><span>Ближе к будущему</span></div>;
  if (id === "typography") return <div className="cv-cur-type"><b>TT Norms Pro</b><i>Аа Бб Вв</i></div>;
  if (id === "color") {
    return (
      <div className="cv-cur-color">
        {["#0056a2", "#e31f26", "#ffffff", "#7fb2e5", "#ef8a91", "#0b2a5b"].map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
      </div>
    );
  }
  return null;
}

/* ───────── А. Одна студия — разные предметы ───────── */
const clay = (text, cls = "") => <span className={`cv-clay ${cls}`}>{text}</span>;

function StudioObject({ id }) {
  switch (id) {
    case "positioning":
      return clay("Ближе к будущему", "is-phrase");
    case "logo":
      return (
        <span className="cv-squircle">
          <img src={A("logos/krdv-mark-lotus.svg")} alt="" />
        </span>
      );
    case "subsidiaries":
      return <img className="cv-obj" src={A("portal/illustrations/il-12.webp")} alt="" />;
    case "regimes":
      return <img className="cv-obj is-petals" src={A("hero/cover-regimes-petals.webp")} alt="" />;
    case "color":
      return (
        <span className="cv-spheres">
          <i style={{ "--c": "#0056a2" }} />
          <i style={{ "--c": "#e31f26" }} />
          <i style={{ "--c": "#f4f6fb" }} />
        </span>
      );
    case "typography":
      return clay("Аа", "is-big");
    case "text":
      return clay("«—»", "is-big");
    case "corporate":
      return <img className="cv-obj" src={A("portal/illustrations/il-18.webp")} alt="" />;
    case "advertising":
      return <img className="cv-obj" src={A("portal/illustrations/il-04.webp")} alt="" />;
    case "merch":
      return (
        <span className="cv-pair">
          <img src={A("merch/stickers/s19.webp")} alt="" />
          <img src={A("merch/stickers/s12.webp")} alt="" />
        </span>
      );
    case "made":
      return <img className="cv-obj cv-tilt" src={A("made-signs/made-dvia-ru-purple.png")} alt="" />;
    case "photostyle":
      return (
        <span className="cv-prints">
          <img src={A("brandbook/raster/photostyle-composition-1.webp")} alt="" />
          <img src={A("brandbook/raster/photostyle-composition-9.webp")} alt="" />
          <img src={A("brandbook/raster/photostyle-composition-4.webp")} alt="" />
        </span>
      );
    case "social":
      return <img className="cv-obj" src={A("portal/illustrations/il-01.webp")} alt="" />;
    case "contacts":
      return <img className="cv-obj" src={A("portal/illustrations/il-05.webp")} alt="" />;
    default:
      return null;
  }
}

/* ───────── Б. Градиент + белый знак ───────── */
function Gradient({ kind }) {
  return (
    <span className={`cv-grad is-${kind}`} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

const S = (children, vb = "0 0 200 120") => (
  <svg className="cv-sign" viewBox={vb} fill="none" aria-hidden="true">
    {children}
  </svg>
);

function LineSign({ id }) {
  switch (id) {
    case "positioning":
      return <span className="cv-word">Ближе к будущему</span>;
    case "logo":
      return <img className="cv-lotus" src={A("logos/krdv-mark-lotus.svg")} alt="" />;
    case "subsidiaries": {
      const pts = [[30, 70], [52, 40], [70, 82], [92, 30], [104, 64], [124, 46], [138, 88], [150, 26], [166, 60], [178, 38], [186, 80]];
      return S(
        <>
          <polyline points={pts.map((p) => p.join(",")).join(" ")} className="cv-draw" pathLength="1" />
          {pts.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" className="cv-dot" />
          ))}
        </>,
      );
    }
    case "regimes":
      return S(
        <g transform="translate(100 104)">
          {[-60, -30, 0, 30, 60].map((a) => (
            <ellipse key={a} cx="0" cy="-46" rx="13" ry="44" transform={`rotate(${a})`} className="cv-draw" pathLength="1" />
          ))}
        </g>,
      );
    case "color":
      return S(
        <>
          <circle cx="82" cy="52" r="30" className="cv-draw" pathLength="1" />
          <circle cx="118" cy="52" r="30" className="cv-draw" pathLength="1" />
          <circle cx="100" cy="80" r="30" className="cv-draw" pathLength="1" />
        </>,
      );
    case "typography":
      return S(<text x="100" y="92" textAnchor="middle" className="cv-sign-text">Аа</text>);
    case "text":
      return S(<text x="100" y="86" textAnchor="middle" className="cv-sign-text is-light">«—»</text>);
    case "corporate":
      return S(
        <>
          <rect x="58" y="26" width="92" height="54" rx="4" className="cv-draw" pathLength="1" />
          <rect x="46" y="40" width="92" height="54" rx="4" className="cv-draw cv-fill" pathLength="1" />
          <line x1="58" y1="58" x2="96" y2="58" className="cv-draw" pathLength="1" />
          <line x1="58" y1="66" x2="84" y2="66" className="cv-draw" pathLength="1" />
        </>,
      );
    case "advertising":
      return S(
        <>
          <rect x="44" y="18" width="112" height="56" rx="3" className="cv-draw" pathLength="1" />
          <line x1="100" y1="74" x2="100" y2="108" className="cv-draw" pathLength="1" />
          <text x="54" y="44" className="cv-sign-small is-bold">ЛЬГОТЫ</text>
          <text x="54" y="58" className="cv-sign-small">для бизнеса</text>
        </>,
      );
    case "merch":
      return S(<path d="M100 104 C 40 70, 46 18, 78 18 C 92 18, 100 30, 100 38 C 100 30, 108 18, 122 18 C 154 18, 160 70, 100 104 Z" className="cv-draw" pathLength="1" />);
    case "made":
      return S(
        <>
          <rect x="66" y="8" width="68" height="104" rx="10" className="cv-draw" pathLength="1" />
          <text x="76" y="48" className="cv-sign-small">СДЕЛАНО</text>
          <text x="76" y="62" className="cv-sign-small">НА ДАЛЬНЕМ</text>
          <text x="76" y="76" className="cv-sign-small">ВОСТОКЕ</text>
        </>,
      );
    case "social":
      return S(
        <>
          <rect x="62" y="12" width="96" height="96" rx="8" className="cv-draw" pathLength="1" />
          <circle cx="76" cy="26" r="6" className="cv-draw" pathLength="1" />
          <path d="M110 84 C 92 72, 94 56, 103 56 C 107 56, 110 60, 110 62 C 110 60, 113 56, 117 56 C 126 56, 128 72, 110 84 Z" className="cv-draw" pathLength="1" />
        </>,
      );
    case "contacts":
      return S(
        <>
          <path d="M58 22 H142 a10 10 0 0 1 10 10 V74 a10 10 0 0 1 -10 10 H92 L72 102 V84 H58 a10 10 0 0 1 -10 -10 V32 a10 10 0 0 1 10 -10 Z" className="cv-draw" pathLength="1" />
          <circle cx="82" cy="53" r="3.5" className="cv-dot" />
          <circle cx="100" cy="53" r="3.5" className="cv-dot" />
          <circle cx="118" cy="53" r="3.5" className="cv-dot" />
        </>,
      );
    default:
      return null;
  }
}

function PhotoGraded({ withFrame }) {
  return (
    <>
      <img className="cv-media" src={A("brandbook/raster/photostyle-composition-9.webp")} alt="" />
      <span className="cv-photo-grade" />
      {withFrame
        ? S(
            <>
              <path d="M40 22 V12 H54 M146 12 H160 V22 M160 98 V108 H146 M54 108 H40 V98" className="cv-draw" pathLength="1" />
              <circle cx="100" cy="60" r="3" className="cv-dot" />
            </>,
          )
        : null}
    </>
  );
}

/* ───────── Плитка и сетка ───────── */
const objectSections = new Set(["subsidiaries", "regimes", "corporate", "advertising", "merch", "made", "social", "contacts"]);

function Tile({ id, size, mode }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return setSeen(true);
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  const k = tone[id];
  let body = null;
  let theme = "dark";
  if (mode === "now") {
    body = <CurrentTile id={id} />;
    theme = ["typography"].includes(id) ? "dark" : id === "positioning" ? "light" : "dark";
  } else if (mode === "a") {
    body = (
      <>
        <span className="cv-studio" />
        <span className="cv-stage">
          <StudioObject id={id} />
          <span className="cv-floor" />
        </span>
      </>
    );
  } else if (mode === "b") {
    if (k === "photo") body = <PhotoGraded withFrame />;
    else
      body = (
        <>
          <Gradient kind={k} />
          <span className="cv-stage">
            <LineSign id={id} />
          </span>
        </>
      );
    theme = k === "light" ? "light" : "dark";
  } else if (mode === "c") {
    if (k === "photo") body = <PhotoGraded />;
    else
      body = (
        <>
          <Gradient kind={k} />
          <span className="cv-stage">
            {objectSections.has(id) ? <StudioObject id={id} /> : <LineSign id={id} />}
            {objectSections.has(id) ? <span className="cv-floor is-soft" /> : null}
          </span>
        </>
      );
    theme = k === "light" ? "light" : "dark";
  }
  const s = sections[id];
  return (
    <article ref={ref} className={`cv-tile is-${size} is-${id} theme-${theme} ${seen ? "is-seen" : ""}`}>
      {body}
      <span className="cv-title">
        <b>{s.n}</b>
        {s.title}
      </span>
    </article>
  );
}

const modes = [
  {
    id: "now",
    tab: "Сейчас",
    title: "Текущий набор",
    lead: "Для сравнения. Три языка вперемешку: шёлк (6 разделов, цвет почти ничего не говорит о содержании), 3D-предметы (режимы, товарный знак, соцсети) и фото (фотостиль, контакты).",
    grid: currentGrid,
  },
  {
    id: "a",
    tab: "А. Одна студия",
    title: "А. Одна студия — разные предметы",
    lead: "У каждого раздела — один главный предмет из его содержания: мегафон у рекламы, документы у корпоративных материалов, объёмные сердца у мерча, облачка сообщений у контактов. Все сняты «в одной студии»: общий синий фон с мягким светом, одинаковая тень на полу, один пластиковый материал.",
    unite: "Общий фон, свет, тень и материал. Предметы — в стиле уже готовых 3D-иконок (портал, соцсети).",
    keep: "Предмет буквально называет раздел.",
    risk: "Для финала нужны 3D-объекты одного качества (часть есть, часть — генерировать или заказать). Абстрактные разделы (позиционирование, типографика) приходится решать объёмным текстом.",
    grid: proposedGrid,
  },
  {
    id: "b",
    tab: "Б. Градиент и знак",
    title: "Б. Градиент как фон раздела",
    lead: "Основа — нежный градиент из «Бренд-обещания» в трёх силах: светлой, насыщенной синей и глубокой. Поверх — один тонкий знак из содержания раздела: лотос, «Аа», рамка билборда, контур сердца, квадрат поста, облачко. Линии дорисовываются при появлении, градиент медленно дышит.",
    unite: "Один градиент, одна толщина линии, один шрифт. Силу градиента чередуем по строкам — сетка получает ритм.",
    keep: "Знак коротко указывает на содержание, не перегружая.",
    risk: "Самое сдержанное направление: «Товарный знак» и «Соцсети» станут спокойнее, чем сейчас.",
    grid: proposedGrid,
  },
  {
    id: "c",
    tab: "В. Смешанный",
    title: "В. Градиент + предметы (рекомендую)",
    lead: "Фон у всех — общий градиент из Б. Разделы-понятия (позиционирование, логотип, цвет, типографика, текст) получают тонкий знак, разделы с вещами (ДО, режимы, корпоративные, рекламные, мерч, товарный знак, соцсети, контакты) — объёмный предмет из А. Фотостиль — фото в той же цветовой обработке.",
    unite: "Общий фон и свет; знаки и предметы в одной сине-белой гамме.",
    keep: "У каждого раздела свой характер: где предмет — там предмет, где идея — там знак.",
    risk: "Нужно аккуратно держать баланс плоских знаков и объёмных предметов в одной строке.",
    grid: proposedGrid,
  },
];

export function Covers() {
  const [mode, setMode] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get("v") || "c";
    } catch {
      return "c";
    }
  });
  const m = modes.find((item) => item.id === mode) || modes[3];
  const pick = (id) => {
    setMode(id);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("v", id);
      window.history.replaceState(null, "", url);
    } catch {
      /* ничего */
    }
  };
  return (
    <main className="cv-page">
      <header className="cv-head">
        <p className="cv-kicker">Веб-гайд КРДВ · черновик для выбора</p>
        <h1>Обложки разделов</h1>
        <p className="cv-intro">
          Три направления единой системы обложек на сетке страницы «Обзор». Первая и последняя строки — как сейчас, остальные переставлены под обложки: светлая тройка «Цвет — Типографика — Текст», фотостиль на всю ширину.
        </p>
        <nav className="cv-tabs" aria-label="Направления">
          {modes.map((item) => (
            <button key={item.id} type="button" data-active={item.id === m.id} onClick={() => pick(item.id)}>
              {item.tab}
            </button>
          ))}
        </nav>
      </header>

      <section className="cv-about" key={`about-${m.id}`}>
        <h2>{m.title}</h2>
        <p>{m.lead}</p>
        {m.unite ? (
          <dl>
            <div>
              <dt>Что объединяет</dt>
              <dd>{m.unite}</dd>
            </div>
            <div>
              <dt>Как сохраняется смысл</dt>
              <dd>{m.keep}</dd>
            </div>
            <div>
              <dt>На что обратить внимание</dt>
              <dd>{m.risk}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className={`cv-grid mode-${m.id}`} key={m.id}>
        {m.grid.map(([id, size]) => (
          <Tile key={id} id={id} size={size} mode={m.id} />
        ))}
      </section>

      <footer className="cv-foot">
        Предметы в вариантах А и В — из готовых материалов (3D-иконки портала, стикеры, знаки, лепестки режимов) и показывают принцип; для финала их можно доработать в одном качестве. Текущие обложки и сетка сохранены — откат в любой момент.
      </footer>
    </main>
  );
}
