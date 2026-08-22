import { useEffect, useMemo, useState } from "react";

const assetPath = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;
const vectorAsset = (filename) => assetPath(`/assets/brandbook/vector/${filename}`);
const rasterAsset = (filename) => assetPath(`/assets/brandbook/raster/${filename}`);
const photoAsset = (filename) => assetPath(`/assets/photos/${filename}`);

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
  "QR",
  "TT",
  "СИ",
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
  { name: "Дальневосточный синий", hex: "#0056a2", rgb: "0 86 162", cmyk: "100 75 00 00", pantone: "286C" },
  { name: "Голубой", hex: "#22a8e0", rgb: "34 168 225", cmyk: "72 15 00 00" },
  { name: "Светло-синий", hex: "#9ec6eb", rgb: "158 198 235", cmyk: "24 13 00 00" },
  { name: "Ледяной голубой", hex: "#d4e6fa", rgb: "212 230 250", cmyk: "15 05 00 00" },
  { name: "Темно-синий", hex: "#001d37", rgb: "0 30 55", cmyk: "100 84 47 58" },
  { name: "Средний синий", hex: "#0c5082", rgb: "12 80 130", cmyk: "100 73 24 09" },
  { name: "Восходящий красный", hex: "#de2327", rgb: "222 35 39", cmyk: "05 100 100 00", pantone: "186C" },
];

const secondaryPalette = [
  { name: "Арктический изумрудный", hex: "#003b39", rgb: "0 59 57", cmyk: "91 47 61 59" },
  { name: "Изумрудный", hex: "#308d86", rgb: "48 141 134", cmyk: "78 24 49 07" },
  { name: "Темный изумрудный", hex: "#0a5c57", rgb: "10 92 87", cmyk: "87 38 58 35" },
  { name: "Светлый изумрудный", hex: "#cce0e6", rgb: "204 224 230", cmyk: "24 05 10 00" },
  { name: "Мягкий изумрудный", hex: "#e4f0f2", rgb: "228 240 242", cmyk: "13 02 06 00" },
];

const regimeItems = [
  { short: "ТОР", name: "Территории опережающего развития", color: "#7d2675" },
  { short: "СПВ", name: "Свободный порт Владивосток", color: "#1e4b8f" },
  { short: "КОРФ", name: "Курильские острова Российской Федерации", color: "#5e9bb5" },
  { short: "САР", name: "Специальный административный район", color: "#308d86" },
  { short: "АЗРФ", name: "Арктическая зона Российской Федерации", color: "#55a9df" },
  { short: "ИНТЦ", name: "Инновационный научно-технологический центр", color: "#6f5bd6" },
  { short: "Гектар", name: "Программа земельных участков", color: "#194e42" },
  { short: "Работа", name: "Коммуникации о трудоустройстве", color: "#143746" },
  { short: "Ипотека", name: "Льготные ипотечные программы", color: "#a98da2" },
];

const sections = [
  {
    id: "platform",
    eyebrow: "Framework",
    title: "Позиционирование",
    nav: "Платформа",
    tone: "dark",
    summary:
      "Смысловая рамка бренда: Дальний Восток и Арктика показаны как территории будущего, где поддержка корпорации превращает идеи, льготы и инфраструктуру в достижения.",
    hero: ["Дальний Восток", "и Арктика", "ближе к будущему"],
    blocks: [
      {
        type: "statement",
        title: "Наша работа — ваши достижения",
        text:
          "КРДВ привлекает активных граждан и организации на Дальний Восток и в Арктику, помогает успешно реализовывать проекты, направленные на ускоренное социально-экономическое развитие регионов, и решает проблемы на пути роста.",
      },
      {
        type: "principles",
        items: [
          ["Качественно", "Экспертиза и профессиональный опыт помогают работать с реальными задачами резидентов и партнеров."],
          ["Просто", "Упрощенные процедуры и цифровые сервисы делают взаимодействие понятным и быстрым."],
          ["Выгодно", "Льготы и меры поддержки повышают экономическую эффективность проектов."],
          ["Надежно", "Корпорация защищает интересы граждан и бизнеса и берет на себя сложные вопросы сопровождения."],
        ],
      },
    ],
  },
  {
    id: "logo",
    eyebrow: "Logo",
    title: "Логотип",
    nav: "Лого",
    tone: "light",
    summary:
      "Логотип АО «КРДВ» — неделимый блок из фирменного знака и написания. Знак основан на образе цветущего лотоса: рост, развитие и способность преодолевать барьеры.",
    hero: ["Знак", "слово", "система"],
    blocks: [
      { type: "logoLab" },
      {
        type: "assetStrip",
        title: "Векторные версии",
        text:
          "Вертикальная и горизонтальная версии равноправны. Русский или английский вариант выбирается по языку аудитории и среде размещения.",
        assets: [
          ["krdv-logo-full.svg", "Основной логотип"],
          ["logo-versions.svg", "Полный набор версий"],
          ["logo-clearspace.svg", "Охранное поле"],
          ["logo-usage.svg", "Контраст и фон"],
        ],
      },
      {
        type: "rules",
        title: "Нельзя",
        items: [
          "Отделять графический знак от текстовой части логотипа.",
          "Использовать другой текст вместо оригинального написания.",
          "Менять цвет, пропорции, типографику или добавлять эффекты.",
          "Размещать логотип на активном фоне без дополнительной плашки.",
        ],
      },
    ],
  },
  {
    id: "architecture",
    eyebrow: "Brand architecture",
    title: "Дочерние общества",
    nav: "ДО",
    tone: "dark",
    summary:
      "Логотипы дочерних обществ строятся от единого знака и наименования. Основная версия — горизонтальная, вертикальная используется, когда горизонтальная не помещается.",
    hero: ["Единый знак", "разные организации", "одна система"],
    blocks: [
      {
        type: "assetGrid",
        title: "Архитектура логотипов",
        text:
          "Англоязычные версии применяются для международных мероприятий, англоязычных ресурсов и взаимодействия с зарубежными партнерами.",
        assets: [
          ["subsidiaries-ru-a.svg", "Русскоязычная горизонтальная версия"],
          ["subsidiaries-ru-b.svg", "Русскоязычная вертикальная версия"],
          ["subsidiaries-en-a.svg", "English horizontal"],
          ["subsidiaries-en-b.svg", "English vertical"],
        ],
      },
      {
        type: "miniSpec",
        specs: [
          ["Основная логика", "знак плюс наименование общества"],
          ["Приоритет", "горизонтальная версия"],
          ["Дополнение", "вертикальная версия для узких форматов"],
          ["Язык", "русская или английская версия по аудитории"],
        ],
      },
    ],
  },
  {
    id: "regimes",
    eyebrow: "Iconography",
    title: "Преференциальные режимы",
    nav: "Режимы",
    tone: "light",
    summary:
      "Для режимов и программ используется единая система знаков, сокращений и цветов. Она помогает быстро различать направления поддержки в коммуникациях и рекламе.",
    hero: ["ТОР", "СПВ", "АЗРФ"],
    blocks: [
      { type: "regimeGrid" },
      {
        type: "assetStrip",
        title: "Извлеченный SVG-актив",
        text:
          "Оригинальный набор знаков сохранен как чистый SVG. В интерфейсе подписи и пояснения набраны живым текстом.",
        assets: [["regime-signs.svg", "Набор знаков преференциальных режимов"]],
      },
    ],
  },
  {
    id: "color",
    eyebrow: "Color",
    title: "Цвет",
    nav: "Цвет",
    tone: "dark",
    summary:
      "Синий связан с океанами, омывающими Дальний Восток и Арктику. Красный — с восходящим на востоке солнцем. Изумрудная палитра усиливает арктический и технологичный слой.",
    hero: ["Северный", "Тихий", "восход"],
    blocks: [{ type: "palette" }],
  },
  {
    id: "typography",
    eyebrow: "Typography",
    title: "Типографика",
    nav: "Шрифт",
    tone: "light",
    summary:
      "Основная гарнитура для рекламно-информационных материалов — TT Norms Pro. Для наградных документов используется TT Tsars; тонкие и сверхжирные начертания работают преимущественно в крупном кегле.",
    hero: ["TT Norms Pro", "TT Tsars", "Aa"],
    blocks: [
      { type: "typeLab" },
      {
        type: "rules",
        title: "Правила выбора начертаний",
        items: [
          "Наборный текст должен оставаться спокойным и читаемым.",
          "Тонкие и сверхжирные начертания лучше использовать крупно.",
          "Другие шрифты допустимы только для проектов со своим стилем или офисных документов.",
          "TT Tsars применяется для благодарностей, грамот и благодарственных писем.",
        ],
      },
    ],
  },
  {
    id: "editorial",
    eyebrow: "Voice & Tone",
    title: "Оформление текста",
    nav: "Текст",
    tone: "dark",
    summary:
      "Аккуратная русская типографика делает носители профессиональными: кавычки, тире, интервалы, валюты, телефоны и сокращения должны быть единообразными.",
    hero: ["Ясно", "аккуратно", "без висячих слов"],
    blocks: [{ type: "textRules" }, { type: "typografDemo" }],
  },
  {
    id: "graphics",
    eyebrow: "System",
    title: "Базовая графика",
    nav: "Графика",
    tone: "light",
    summary:
      "Базовая графика развивает систему режимов: каждому направлению соответствует знак, цвет и устойчивый способ кодирования в коммуникационных и рекламных носителях.",
    hero: ["код", "знак", "цвет"],
    blocks: [
      { type: "regimeGrid" },
      {
        type: "assetImage",
        title: "Цветовое кодирование",
        text:
          "Для каждого режима разработан свой цветовой слой. В цифровом интерфейсе эти цвета используются как фильтр, акцент и быстрый навигационный маркер.",
        src: rasterAsset("regime-coding.webp"),
        alt: "Пример цветового кодирования преференциальных режимов",
      },
    ],
  },
  {
    id: "corporate",
    eyebrow: "Materials",
    title: "Корпоративные материалы",
    nav: "Материалы",
    tone: "dark",
    summary:
      "Визитки, QR-визитки, материалы дочерних обществ и бланки строятся на единой сетке, логотипе и спокойном наборе контактов.",
    hero: ["90×50 мм", "4+0", "300 г/м²"],
    blocks: [
      { type: "businessCards" },
      {
        type: "assetStrip",
        title: "Векторные шаблоны",
        text:
          "Схемы носителей сохранены в SVG, а спецификации и контактная информация набраны в интерфейсе живым текстом.",
        assets: [
          ["business-card-clean.svg", "Визитка"],
          ["qr-card-clean.svg", "Визитка с QR-кодом"],
          ["subsidiary-card.svg", "Визитка дочернего общества"],
          ["office-signs.svg", "Навигационная табличка"],
        ],
      },
    ],
  },
  {
    id: "advertising",
    eyebrow: "Applications",
    title: "Рекламно-информационные материалы",
    nav: "Реклама",
    tone: "light",
    summary:
      "Лифлеты, прессволл, роллап, навигация, режимники и наградные документы показывают, как бренд ведет себя в прикладной коммуникации.",
    hero: ["А4", "2000×3000", "800×1800"],
    blocks: [{ type: "applicationGrid" }],
  },
  {
    id: "merch",
    eyebrow: "Merch",
    title: "Сувенирная продукция",
    nav: "Мерч",
    tone: "dark",
    summary:
      "Мерч использует знак и логотип аккуратно: блокноты, ручки, карандаши, пакет, футболка и шоппер должны сохранять читаемость и достаточный контраст.",
    hero: ["носители", "подарки", "события"],
    blocks: [{ type: "merchGrid" }],
  },
  {
    id: "made",
    eyebrow: "Product mark",
    title: "Сделано в ТОР СПВ",
    nav: "Сделано",
    tone: "light",
    summary:
      "Товарный знак разработан для поддержки резидентов и дополнительной узнаваемости продукции. Его нанесение на упаковку согласовывается индивидуально с каждым резидентом.",
    hero: ["Сделано", "в ТОР", "СПВ"],
    blocks: [
      { type: "madeMark" },
      {
        type: "assetImage",
        title: "Пример адаптации на упаковке",
        text:
          "В отдельных случаях допускается адаптация цвета знака под цвет упаковки товара, если сохраняется узнаваемость и контраст.",
        src: rasterAsset("made-packaging.webp"),
        alt: "Пример размещения знака Сделано в ТОР СПВ на упаковке",
      },
    ],
  },
  {
    id: "photostyle",
    eyebrow: "Imagery",
    title: "Фотостиль",
    nav: "Фото",
    tone: "dark",
    summary:
      "Фотостиль КРДВ отображает Дальний Восток и Арктику будущего: отраслевые результаты, достижения, живые люди, культура и убедительная природа регионов.",
    hero: ["инфраструктура", "люди", "природа"],
    blocks: [{ type: "photoGallery" }],
  },
  {
    id: "social",
    eyebrow: "Appendix",
    title: "Социальные сети и контакты",
    nav: "Соцсети",
    tone: "light",
    summary:
      "Для социальных сетей разработан отдельный гайд. Финальная контактная точка бренда — единое юридическое имя, телефон, сайт и знак защиты прав.",
    hero: ["erdc.ru", "8 800", "КРДВ"],
    blocks: [
      {
        type: "assetImage",
        title: "Гайд для социальных сетей",
        text:
          "Социальные публикации должны сохранять фирменную палитру, ясную сетку, читаемую типографику и корректное использование знака.",
        src: rasterAsset("social-guide.webp"),
        alt: "Пример гайда оформления социальных сетей",
      },
      { type: "contactCard" },
    ],
  },
];

const applications = [
  {
    title: "Лифлеты",
    image: "leaflets.webp",
    specs: ["Формат А4, 297×210 мм", "2 бига", "Печать 4+4, офсет или цифра", "Цветовое кодирование по режимам"],
  },
  {
    title: "Прессволл",
    image: "presswall.webp",
    specs: ["Размер 2000×3000 мм", "Для выставок, форумов и имиджевых мероприятий", "Другой дизайн согласовывается с визуальными коммуникациями"],
  },
  {
    title: "Роллап",
    image: "rollup.webp",
    specs: ["Размер 800×1800 мм", "Мобильная конструкция для мероприятий", "Макеты согласовываются перед производством"],
  },
  {
    title: "Навигация кабинетов",
    image: null,
    specs: ["Соотношение сторон 3:2", "Размер зависит от помещения", "Заказ табличек через визуальные коммуникации"],
  },
  {
    title: "Режимник",
    image: null,
    specs: ["Соотношение сторон 3:2", "Формат зависит от места размещения", "Подходит для предприятий и дочерних обществ"],
  },
  {
    title: "Наградные документы",
    image: null,
    specs: ["Формат А4", "Бумага Majestic Classic белый мрамор", "Заголовки тиснением золотой фольгой", "Рама тиснением серебряной фольгой"],
  },
];

const merch = [
  {
    title: "Блокнот",
    visual: "notebook",
    specs: ["А5 148×210 мм", "B5 190×250 мм", "мягкая или твердая обложка", "дизайн согласовывается"],
  },
  {
    title: "Канцелярия",
    visual: "pens",
    specs: ["черная письменная ручка", "матовая белая шариковая ручка", "деревянный карандаш", "тампопечать"],
  },
  {
    title: "Пакет",
    image: "package.webp",
    specs: ["плотная бумага или картон", "QR-код", "офсет или прямая печать", "макет согласовывается"],
  },
  {
    title: "Футболка",
    image: "tshirt.webp",
    specs: ["прямая печать", "шелкография", "термотрансфер", "машинная вышивка"],
  },
  {
    title: "Шоппер",
    image: "shopper.webp",
    specs: ["прямая печать на ткани", "шелкография", "термотрансфер", "машинная вышивка"],
  },
];

const photoGroups = [
  {
    id: "infra",
    title: "Инфраструктура",
    summary: "Ледоколы, порты, суда, спутники, предприятия и проекты резидентов.",
    photos: [
      ["infra-icebreaker.webp", "Ледокол и арктическая инфраструктура"],
      ["infra-team-arctic.webp", "Командный кадр как символ единства"],
      ["infra-plant.webp", "Работающее предприятие региона"],
      ["infra-resident-project.webp", "Новый проект резидента"],
    ],
  },
  {
    id: "events",
    title: "Выступления",
    summary: "Люди вовлечены, эмоциональны, действие считывается сразу.",
    photos: [
      ["events-culture.webp", "Культурно-развлекательное событие"],
      ["events-forum.webp", "Деловое мероприятие"],
      ["events-youth.webp", "Образовательное событие"],
      ["events-audience.webp", "Аудитория и контекст мероприятия"],
    ],
  },
  {
    id: "nature",
    title: "Природа",
    summary: "Высокое качество, достоверность места и выразительная красота региона.",
    photos: [
      ["nature-volcano.webp", "Вулканический пейзаж"],
      ["nature-aurora.webp", "Арктический свет"],
      ["nature-greenhouse.webp", "Природа и современная отрасль"],
      ["nature-bridge.webp", "Инфраструктура в региональном контексте"],
    ],
  },
  {
    id: "people",
    title: "Люди",
    summary: "Аутентичные сюжеты, культура, сфера деятельности и жизнь народов регионов.",
    photos: [
      ["people-dance.webp", "Культурный сюжет"],
      ["people-reindeer.webp", "Аутентичный портрет"],
      ["people-sled.webp", "Региональная деятельность"],
      ["people-performance.webp", "Выразительный портрет на чистом фоне"],
    ],
  },
];

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash || "";
}

function goTo(route) {
  const next = route ? `#/${route}` : "#/";
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

function App() {
  const [route, setRoute] = useState(getRouteFromHash);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const activeSection = useMemo(() => sections.find((section) => section.id === route), [route]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
      setDrawerOpen(false);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("drawer-locked", drawerOpen);
  }, [drawerOpen]);

  return (
    <div className="brandbook">
      <Preloader loaded={loaded} />
      <SiteHeader route={route} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <Drawer route={route} open={drawerOpen} setOpen={setDrawerOpen} />
      <main id="main" className="site-main">
        {activeSection ? <SectionPage section={activeSection} /> : <Home />}
      </main>
    </div>
  );
}

function Preloader({ loaded }) {
  return (
    <div className={`preloader ${loaded ? "is-hidden" : ""}`} aria-hidden={loaded}>
      <div className="preloader-grid">
        <img src={vectorAsset("krdv-mark.svg")} alt="" />
        <div>
          <span>{t("интерактивный брендбук")}</span>
          <strong>{t("АО «КРДВ»")}</strong>
        </div>
      </div>
    </div>
  );
}

function SiteHeader({ route, drawerOpen, setDrawerOpen }) {
  const title = sections.find((section) => section.id === route)?.nav || "Брендбук";

  return (
    <header className="site-header">
      <button className="logo-home" type="button" onClick={() => goTo("")} aria-label={t("Открыть главную")}>
        <img src={vectorAsset("krdv-mark.svg")} alt="" />
        <span>{t("КРДВ")}</span>
      </button>
      <a className="skip-link" href="#main">
        {t("К содержанию")}
      </a>
      <div className="header-current">{t(title)}</div>
      <button
        className={`menu-button ${drawerOpen ? "is-open" : ""}`}
        type="button"
        aria-label={drawerOpen ? t("Закрыть меню") : t("Открыть меню")}
        aria-expanded={drawerOpen}
        aria-controls="brandbook-drawer"
        onClick={() => setDrawerOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>
    </header>
  );
}

function Drawer({ route, open, setOpen }) {
  return (
    <aside id="brandbook-drawer" className={`drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button className="drawer-scrim" type="button" aria-label={t("Закрыть меню")} onClick={() => setOpen(false)} />
      <nav className="drawer-panel" aria-label={t("Разделы брендбука")}>
        <div className="drawer-intro">
          <span>{t("Навигация")}</span>
          <strong>{t("Бренд-система АО «КРДВ»")}</strong>
        </div>
        <button className={!route ? "is-active" : ""} type="button" onClick={() => goTo("")}>
          <span>00</span>
          <strong>{t("Главная")}</strong>
        </button>
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={route === section.id ? "is-active" : ""}
            type="button"
            onClick={() => goTo(section.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{t(section.nav)}</strong>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function Home() {
  return (
    <>
      <section className="home-hero grid-plane">
        <div className="hero-copy">
          <h1>{t("Дальний Восток и Арктика — ближе к будущему!")}</h1>
          <p>{t("Веб-брендбук превращает руководство по фирменному стилю в живую систему: логотипы, цвета, шрифты, носители, фотостиль и правила текста собраны в интерактивные разделы.")}</p>
        </div>
        <img className="hero-mark" src={vectorAsset("krdv-mark.svg")} alt="" />
        <button className="scroll-cue" type="button" onClick={() => document.querySelector("#sections")?.scrollIntoView({ behavior: "smooth" })} aria-label={t("Перейти к разделам")}>
          <span />
          <span />
        </button>
      </section>

      <section className="manifest grid-plane">
        <div className="manifest-card">
          <p>{t("Корпорация развития Дальнего Востока и Арктики помогает людям, бизнесу и территориям становиться ближе к успеху, мечте, инфраструктуре, карьере, льготам и масштабу.")}</p>
          <img src={vectorAsset("krdv-mark.svg")} alt="" />
        </div>
        <div className="manifest-rail rail-red" />
        <div className="manifest-rail rail-sky" />
      </section>

      <section id="sections" className="section-catalog" aria-labelledby="catalog-title">
        <div className="catalog-head">
          <span>{t("Содержание")}</span>
          <h2 id="catalog-title">{t("Каждый блок брендбука — отдельный интерактивный раздел")}</h2>
        </div>
        <div className="tile-grid">
          {sections.map((section, index) => (
            <button
              key={section.id}
              className={`section-tile tile-${(index % 7) + 1}`}
              type="button"
              onClick={() => goTo(section.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{t(section.title)}</strong>
              <em>{t(section.summary)}</em>
              <TileVisual index={index} section={section} />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function TileVisual({ index, section }) {
  if (section.id === "color") {
    return (
      <div className="tile-visual tile-colors" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    );
  }

  if (section.id === "photostyle") {
    return (
      <div className="tile-visual tile-photo" aria-hidden="true">
        <img src={photoAsset("nature-volcano.webp")} alt="" loading="lazy" />
      </div>
    );
  }

  if (section.id === "logo" || section.id === "made") {
    return (
      <div className="tile-visual tile-mark" aria-hidden="true">
        <img src={vectorAsset("krdv-mark.svg")} alt="" loading="lazy" />
      </div>
    );
  }

  return (
    <div className="tile-visual tile-line" aria-hidden="true">
      <span />
      <span />
      <span />
      <i style={{ "--shift": `${index + 2}` }} />
    </div>
  );
}

function SectionPage({ section }) {
  return (
    <article className={`section-page ${section.tone === "dark" ? "theme-dark" : "theme-light"}`}>
      <section className="section-hero grid-plane">
        <div className="section-label">
          <span>{t(section.eyebrow)}</span>
          <button type="button" onClick={() => goTo("")}>{t("Все разделы")}</button>
        </div>
        <div className="section-hero-text">
          <h1 aria-label={t(section.hero.join(" "))}>
            {section.hero.map((line) => (
              <span key={line}>{t(line)} </span>
            ))}
          </h1>
          <p>{t(section.summary)}</p>
        </div>
        <img className="section-mark" src={vectorAsset("krdv-mark.svg")} alt="" />
      </section>

      <div className="section-layout">
        <aside className="local-nav" aria-label={t("Соседние разделы")}>
          <span>{t("Раздел")}</span>
          <strong>{t(section.title)}</strong>
          <div>
            {sections.map((item) => (
              <button key={item.id} className={item.id === section.id ? "is-active" : ""} type="button" onClick={() => goTo(item.id)}>
                {t(item.nav)}
              </button>
            ))}
          </div>
        </aside>
        <div className="block-stack">
          {section.blocks.map((block, index) => (
            <BlockRenderer key={`${block.type}-${index}`} block={block} />
          ))}
        </div>
      </div>
    </article>
  );
}

function BlockRenderer({ block }) {
  switch (block.type) {
    case "statement":
      return <StatementBlock block={block} />;
    case "principles":
      return <PrinciplesBlock items={block.items} />;
    case "logoLab":
      return <LogoLab />;
    case "assetStrip":
      return <AssetStrip block={block} />;
    case "assetGrid":
      return <AssetGrid block={block} />;
    case "assetImage":
      return <AssetImage block={block} />;
    case "rules":
      return <RulesBlock block={block} />;
    case "regimeGrid":
      return <RegimeGrid />;
    case "palette":
      return <PaletteBlock />;
    case "typeLab":
      return <TypeLab />;
    case "textRules":
      return <TextRules />;
    case "typografDemo":
      return <TypografDemo />;
    case "miniSpec":
      return <MiniSpec specs={block.specs} />;
    case "businessCards":
      return <BusinessCards />;
    case "applicationGrid":
      return <ApplicationGrid />;
    case "merchGrid":
      return <MerchGrid />;
    case "madeMark":
      return <MadeMark />;
    case "photoGallery":
      return <PhotoGallery />;
    case "contactCard":
      return <ContactCard />;
    default:
      return null;
  }
}

function StatementBlock({ block }) {
  return (
    <section className="content-block statement-block">
      <span>{t("Смысл")}</span>
      <h2>{t(block.title)}</h2>
      <p>{t(block.text)}</p>
    </section>
  );
}

function PrinciplesBlock({ items }) {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Принципы")}</span>
        <h2>{t("Как бренд звучит в работе")}</h2>
      </div>
      <div className="principle-grid">
        {items.map(([title, text], index) => (
          <article key={title} className="principle-card">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{t(title)}</h3>
            <p>{t(text)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LogoLab() {
  const [mode, setMode] = useState("light");
  const [clearspace, setClearspace] = useState(true);
  const [scale, setScale] = useState(74);

  return (
    <section className="content-block logo-lab-block">
      <div className="block-heading">
        <span>{t("Logo lab")}</span>
        <h2>{t("Проверка фона, масштаба и охранного поля")}</h2>
      </div>
      <div className="lab-shell">
        <div className="lab-controls" aria-label={t("Настройки логотипа")}>
          <div className="segmented">
            {[
              ["light", "светлый"],
              ["dark", "синий"],
              ["photo", "фото"],
            ].map(([value, label]) => (
              <button key={value} className={mode === value ? "is-active" : ""} type="button" onClick={() => setMode(value)}>
                {t(label)}
              </button>
            ))}
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={clearspace} onChange={(event) => setClearspace(event.target.checked)} />
            <span>{t("показать охранное поле")}</span>
          </label>
          <label className="range-row">
            <span>{t("масштаб")}</span>
            <input type="range" min="48" max="100" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
          </label>
        </div>
        <div className={`logo-stage logo-stage-${mode}`}>
          <div className={`logo-safezone ${clearspace ? "is-visible" : ""}`} style={{ "--logo-width": `${scale}%` }}>
            <img src={vectorAsset("krdv-logo-full.svg")} alt={t("Логотип АО КРДВ")} />
          </div>
        </div>
      </div>
    </section>
  );
}

function AssetStrip({ block }) {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("SVG")}</span>
        <h2>{t(block.title)}</h2>
        <p>{t(block.text)}</p>
      </div>
      <div className="asset-strip">
        {block.assets.map(([src, label]) => (
          <figure key={src}>
            <div className="asset-frame">
              <img src={vectorAsset(src)} alt={t(label)} loading="lazy" />
            </div>
            <figcaption>{t(label)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function AssetGrid({ block }) {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Архитектура")}</span>
        <h2>{t(block.title)}</h2>
        <p>{t(block.text)}</p>
      </div>
      <div className="asset-grid">
        {block.assets.map(([src, label]) => (
          <figure key={src}>
            <img src={vectorAsset(src)} alt={t(label)} loading="lazy" />
            <figcaption>{t(label)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function AssetImage({ block }) {
  return (
    <section className="content-block asset-image-block">
      <div className="block-heading">
        <span>{t("Пример")}</span>
        <h2>{t(block.title)}</h2>
        <p>{t(block.text)}</p>
      </div>
      <figure className="media-figure">
        <img src={block.src} alt={t(block.alt)} loading="lazy" />
      </figure>
    </section>
  );
}

function RulesBlock({ block }) {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Правила")}</span>
        <h2>{t(block.title)}</h2>
      </div>
      <div className="rule-list">
        {block.items.map((item, index) => (
          <article key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{t(item)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MiniSpec({ specs }) {
  return (
    <section className="content-block">
      <div className="mini-spec">
        {specs.map(([label, value]) => (
          <div key={label}>
            <span>{t(label)}</span>
            <strong>{t(value)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function RegimeGrid() {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Кодирование")}</span>
        <h2>{t("Знак, сокращение и цвет работают вместе")}</h2>
      </div>
      <div className="regime-grid">
        {regimeItems.map((item) => (
          <article key={item.short} style={{ "--regime": item.color }}>
            <div className="regime-symbol">
              <span>{t(item.short)}</span>
            </div>
            <h3>{t(item.short)}</h3>
            <p>{t(item.name)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PaletteBlock() {
  const [copied, setCopied] = useState("");
  const colors = [...primaryPalette, ...secondaryPalette];

  async function copyColor(hex) {
    try {
      await navigator.clipboard?.writeText(hex);
      setCopied(hex);
      window.setTimeout(() => setCopied(""), 1100);
    } catch {
      setCopied("");
    }
  }

  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Палитра")}</span>
        <h2>{t("Коды цвета для печати и цифровой среды")}</h2>
      </div>
      <div className="palette-grid">
        {colors.map((color) => (
          <button key={color.hex} type="button" className="swatch" onClick={() => copyColor(color.hex)} style={{ "--swatch": color.hex }}>
            <span className="swatch-color" />
            <strong>{t(color.name)}</strong>
            <span>{color.hex}</span>
            <em>RGB {color.rgb}</em>
            <em>CMYK {color.cmyk}</em>
            {color.pantone ? <em>Pantone {color.pantone}</em> : null}
            <small>{copied === color.hex ? t("скопировано") : t("copy HEX")}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function TypeLab() {
  const [sample, setSample] = useState("Дальний Восток и Арктика — ближе к будущему");
  const [weight, setWeight] = useState(700);

  return (
    <section className="content-block type-block">
      <div className="block-heading">
        <span>{t("Type lab")}</span>
        <h2>{t("Живой набор вместо картинки")}</h2>
      </div>
      <div className="type-lab">
        <div className="type-controls">
          <label>
            <span>{t("текст")}</span>
            <input value={sample} onChange={(event) => setSample(event.target.value)} />
          </label>
          <label>
            <span>{t("начертание")}</span>
            <input type="range" min="400" max="800" step="100" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
          </label>
        </div>
        <div className="type-specimen" style={{ fontWeight: weight }}>
          {t(sample)}
        </div>
        <div className="type-rows">
          {[
            ["Regular", "400"],
            ["Medium", "500"],
            ["DemiBold", "600"],
            ["Bold", "700"],
            ["ExtraBold", "800"],
            ["TT Tsars", "награды"],
          ].map(([name, label]) => (
            <div key={name} className={name === "TT Tsars" ? "tsars-row" : ""}>
              <span>{t(name)}</span>
              <strong>{t(label)}</strong>
              <p>{t("Аа Бб Вв 123")}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextRules() {
  const rules = [
    ["Кавычки", "Для русскоязычных текстов используются «ёлочки», а внутри цитаты — „лапки“."],
    ["Тире", "Для тире используется длинное тире с пробелами; для числовых интервалов — среднее тире без пробелов."],
    ["Валюты", "Знак валюты после числа отбивается неразрывным пробелом: 100 000 ₽. Перед числом знак пишется слитно."],
    ["Телефоны", "Номера лучше записывать в международном формате или начинать с 8, отделяя группы неразрывными пробелами."],
    ["Сокращения", "Сокращения с усечением пишутся с точкой, кроме физических единиц СИ."],
    ["География", "Родовые термины и стороны света пишутся со строчной, названия регионов — с прописной."],
  ];

  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Редактура")}</span>
        <h2>{t("Базовые рекомендации по тексту")}</h2>
      </div>
      <div className="text-rule-grid">
        {rules.map(([title, text]) => (
          <article key={title}>
            <h3>{t(title)}</h3>
            <p>{t(text)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TypografDemo() {
  const [value, setValue] = useState("АО КРДВ помогает бизнесу и гражданам на Дальнем Востоке и в Арктике.");

  return (
    <section className="content-block typograf-block">
      <div className="block-heading">
        <span>{t("Типограф")}</span>
        <h2>{t("Предлоги и союзы не остаются в конце строки")}</h2>
      </div>
      <div className="typograf-demo">
        <label>
          <span>{t("исходный текст")}</span>
          <textarea value={value} onChange={(event) => setValue(event.target.value)} />
        </label>
        <div>
          <span>{t("вывод в интерфейсе")}</span>
          <p>{t(value)}</p>
        </div>
      </div>
    </section>
  );
}

function BusinessCards() {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Носитель")}</span>
        <h2>{t("Визитки и QR-визитки")}</h2>
      </div>
      <div className="business-grid">
        <div className="business-card-mock">
          <img src={vectorAsset("krdv-mark.svg")} alt="" />
          <div>
            <h3>{t("Имя Фамилия")}</h3>
            <p>{t("Должность, департамент")}</p>
          </div>
          <address>
            {t("+7 800 707 55 58")}
            <br />
            {t("erdc.ru")}
          </address>
        </div>
        <div className="business-card-mock qr">
          <img src={vectorAsset("krdv-mark.svg")} alt="" />
          <div className="qr-box" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <p>{t("QR-код размещается только на отведенном месте и не конфликтует с контактным блоком.")}</p>
        </div>
        <div className="spec-table">
          {[
            ["Формат", "90×50 мм"],
            ["Красочность", "4+0, односторонние"],
            ["Фамилия, имя", "10 pt, TT Norms Pro Medium"],
            ["Должность", "6,5 pt, TT Norms Pro Regular"],
            ["Контакты", "7 pt, TT Norms Pro Regular"],
            ["Материал", "матовая белая бумага или touch cover, не менее 300 г/м²"],
            ["Печать", "офсетная, цифровая или УФ-печать"],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{t(label)}</span>
              <strong>{t(value)}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ApplicationGrid() {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Материалы")}</span>
        <h2>{t("Прикладные форматы")}</h2>
      </div>
      <div className="application-grid">
        {applications.map((item) => (
          <article key={item.title}>
            <div className="application-visual">
              {item.image ? <img src={rasterAsset(item.image)} alt={t(item.title)} loading="lazy" /> : <MockApplication title={item.title} />}
            </div>
            <h3>{t(item.title)}</h3>
            <ul>
              {item.specs.map((spec) => (
                <li key={spec}>{t(spec)}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function MockApplication({ title }) {
  return (
    <div className="mock-application">
      <img src={vectorAsset("krdv-mark.svg")} alt="" />
      <span>{t(title)}</span>
    </div>
  );
}

function MerchGrid() {
  return (
    <section className="content-block">
      <div className="block-heading">
        <span>{t("Мерч")}</span>
        <h2>{t("Носители для мероприятий и подарков")}</h2>
      </div>
      <div className="merch-grid">
        {merch.map((item) => (
          <article key={item.title}>
            <div className={`merch-visual ${item.visual || ""}`}>
              {item.image ? <img src={rasterAsset(item.image)} alt={t(item.title)} loading="lazy" /> : <MerchMock type={item.visual} />}
            </div>
            <h3>{t(item.title)}</h3>
            <ul>
              {item.specs.map((spec) => (
                <li key={spec}>{t(spec)}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function MerchMock({ type }) {
  if (type === "pens") {
    return (
      <div className="pen-set" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  return (
    <div className="notebook-mock" aria-hidden="true">
      <img src={vectorAsset("krdv-mark.svg")} alt="" />
    </div>
  );
}

function MadeMark() {
  return (
    <section className="content-block made-block">
      <div className="made-stage">
        <img src={vectorAsset("krdv-mark.svg")} alt="" />
        <div>
          <span>{t("товарный знак")}</span>
          <h2>{t("Сделано в ТОР СПВ")}</h2>
          <p>{t("Знак используется после одобрения заявки резидента. Версию на английском языке рекомендуется применять при сотрудничестве с международными резидентами.")}</p>
        </div>
      </div>
      <div className="made-products">
        <img src={rasterAsset("made-products.webp")} alt={t("Пример продукции со знаком Сделано в ТОР СПВ")} loading="lazy" />
      </div>
    </section>
  );
}

function PhotoGallery() {
  const [groupId, setGroupId] = useState(photoGroups[0].id);
  const active = photoGroups.find((group) => group.id === groupId) || photoGroups[0];

  return (
    <section className="content-block photo-block">
      <div className="block-heading">
        <span>{t("Фотостиль")}</span>
        <h2>{t("Композиция и сюжет")}</h2>
        <p>{t("Фотографии должны быть убедительными, достоверными и эмоционально наполненными. Если качественного изображения нет, лучше использовать графические элементы.")}</p>
      </div>
      <div className="photo-tabs" role="tablist" aria-label={t("Категории фотостиля")}>
        {photoGroups.map((group) => (
          <button key={group.id} role="tab" aria-selected={group.id === groupId} className={group.id === groupId ? "is-active" : ""} type="button" onClick={() => setGroupId(group.id)}>
            {t(group.title)}
          </button>
        ))}
      </div>
      <div className="photo-copy">
        <h3>{t(active.title)}</h3>
        <p>{t(active.summary)}</p>
      </div>
      <div className="photo-grid">
        {active.photos.map(([src, alt]) => (
          <figure key={src}>
            <img src={photoAsset(src)} alt={t(alt)} loading="lazy" />
            <figcaption>{t(alt)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ContactCard() {
  return (
    <section className="content-block contact-block">
      <img src={vectorAsset("krdv-logo-full.svg")} alt={t("Логотип АО КРДВ")} />
      <div>
        <span>{t("Акционерное общество")}</span>
        <h2>{t("Корпорация развития Дальнего Востока и Арктики")}</h2>
        <p>{t("8 (800) 707-55-58")}</p>
        <a href="https://erdc.ru">erdc.ru</a>
        <small>{t("© Все права защищены.")}</small>
      </div>
    </section>
  );
}

export { App };
export default App;
