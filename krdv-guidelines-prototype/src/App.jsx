import { useEffect, useMemo, useRef, useState } from "react";

const assetPath = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;

const sections = [
  { id: "intro", label: "Основные принципы" },
  { id: "style", label: "Композиция" },
  { id: "infrastructure", label: "Инфраструктура" },
  { id: "events", label: "Выступления" },
  { id: "nature", label: "Природа" },
  { id: "people", label: "Люди" },
  { id: "resources", label: "Ресурсы" },
];

const navigation = [
  { number: "01", title: "Позиционирование", items: ["Миссия", "Основные принципы"] },
  { number: "02", title: "Основные элементы", items: ["Логотип", "Цвета", "Типографика"] },
  { number: "03", title: "Базовая графика", items: ["Преференциальные режимы"] },
  { number: "04", title: "Корпоративные материалы", items: ["Визитки", "Бланки"] },
  { number: "05", title: "Рекламные материалы", items: ["Лифлеты", "Прессволл", "Роллап"] },
  { number: "06", title: "Мерч", items: ["Пакет", "Футболка", "Шоппер"] },
  { number: "07", title: "Фотостиль", items: sections.map((section) => section.label), active: true },
  { number: "08", title: "Приложение", items: ["Социальные сети"] },
];

const principles = [
  {
    title: "Достижения",
    body: "Выбирайте фотографии, где виден результат: инфраструктура, новые предприятия, сервисы и рабочая среда.",
  },
  {
    title: "Естественность",
    body: "Сюжеты должны выглядеть живыми: без постановочной скованности, с понятным действием и ясной эмоцией.",
  },
  {
    title: "Место",
    body: "Кадр должен быть достоверно связан с регионом, отраслью или событием, о котором идет коммуникация.",
  },
];

const imageSections = [
  {
    id: "infrastructure",
    eyebrow: "Инфраструктура",
    title: "Единый прогресс, общие взгляды",
    body:
      "Ключевым аспектом деятельности КРДВ является достижение результатов, связанных с развитием инфраструктуры. В коммуникациях стоит показывать ледоколы, порты, заводы, резидентские проекты и символы Северного морского пути.",
    photos: [
      { src: assetPath("/assets/photos/infra-icebreaker.png"), caption: "Ледоколы, порты, грузовые суда, спутники, символы Северного морского пути." },
      { src: assetPath("/assets/photos/infra-team-arctic.png"), caption: "Командное фото как символ единства, общих целей и прогресса." },
      { src: assetPath("/assets/photos/infra-plant.png"), caption: "Работающие предприятия и заводы Дальнего Востока и Арктики." },
      { src: assetPath("/assets/photos/infra-resident-project.png"), caption: "Актуальные предприятия и новые проекты резидентов." },
    ],
  },
  {
    id: "events",
    eyebrow: "Выступления",
    title: "Люди в центре события",
    body:
      "Для культурных, образовательных и деловых мероприятий важно выбирать кадры с участием людей. Лучшие фотографии показывают заинтересованность, вовлеченность и естественную динамику происходящего.",
    photos: [
      { src: assetPath("/assets/photos/events-culture.png"), caption: "Участники заинтересованы, эмоциональны, кадр выглядит естественно." },
      { src: assetPath("/assets/photos/events-forum.png"), caption: "Событийный контекст считывается через сцену, участников и среду." },
      { src: assetPath("/assets/photos/events-youth.png"), caption: "Живой момент, лица в фокусе, действие понятно без подписи." },
      { src: assetPath("/assets/photos/events-audience.png"), caption: "Групповые кадры должны оставаться читаемыми и композиционно ясными." },
    ],
  },
  {
    id: "nature",
    eyebrow: "Природа",
    title: "Захватывающая природа",
    body:
      "Кадры природы должны демонстрировать уникальную красоту и разнообразие регионов Дальнего Востока и Арктики. Главные требования: высокое качество изображения и достоверность места.",
    photos: [
      { src: assetPath("/assets/photos/nature-volcano.png"), caption: "Масштабные пейзажи, в которых сразу считывается уникальность территории." },
      { src: assetPath("/assets/photos/nature-aurora.png"), caption: "Арктическая атмосфера, глубина и выразительный природный свет." },
      { src: assetPath("/assets/photos/nature-greenhouse.png"), caption: "Современные отраслевые сюжеты на стыке природы и технологий." },
      { src: assetPath("/assets/photos/nature-bridge.png"), caption: "Инфраструктура в природном и городском контексте региона." },
    ],
  },
  {
    id: "people",
    eyebrow: "Люди",
    title: "Люди Дальнего Востока и Арктики",
    body:
      "Главный принцип съемки людей - оригинальные аутентичные сюжеты, связанные с их деятельностью, культурными обычаями и жизнью народов Дальнего Востока и Арктики.",
    photos: [
      { src: assetPath("/assets/photos/people-dance.png"), caption: "Культурный сюжет раскрывается через действие, костюм и пространство." },
      { src: assetPath("/assets/photos/people-reindeer.png"), caption: "Крупный план помогает создать эмоциональный и достоверный образ." },
      { src: assetPath("/assets/photos/people-sled.png"), caption: "Региональная среда и повседневная деятельность в одном кадре." },
      { src: assetPath("/assets/photos/people-performance.png"), caption: "Чистый фон и ясное действие усиливают выразительность портрета." },
    ],
  },
];

function Sidebar({ activeId, drawerOpen, onClose, onNavigate }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(["07"]));

  const toggleGroup = (number) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  };

  return (
    <>
      <div className={`drawer-scrim ${drawerOpen ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${drawerOpen ? "is-open" : ""}`} aria-label="Навигация по брендбуку">
        <div className="brand-block">
          <img className="brand-logo" src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="КРДВ" />
        </div>

        <div className="guide-meta">
          <p>РУКОВОДСТВО ПО ФИРМЕННОМУ СТИЛЮ</p>
          <p>ОБНОВЛЕНО: ФЕВРАЛЬ 2025</p>
        </div>

        <nav className="nav-list" aria-label="Разделы">
          {navigation.map((group) => {
            const isOpen = openGroups.has(group.number);
            return (
              <div className={`nav-group ${group.active ? "is-active" : ""}`} key={group.number}>
                <button className="nav-row" type="button" onClick={() => toggleGroup(group.number)}>
                  <span>{group.number}</span>
                  <span>{group.title}</span>
                  <span className={`chevron ${isOpen ? "is-open" : ""}`} aria-hidden="true" />
                </button>
                <div className={`subnav ${isOpen ? "is-open" : ""}`}>
                  {group.active
                    ? sections.map((section) => (
                        <button
                          className={`subnav-link ${activeId === section.id ? "is-current" : ""}`}
                          type="button"
                          key={section.id}
                          onClick={() => {
                            onNavigate(section.id);
                            onClose();
                          }}
                        >
                          {section.label}
                        </button>
                      ))
                    : group.items.map((item) => (
                        <span className="subnav-link is-muted" key={item}>
                          {item}
                        </span>
                      ))}
                </div>
              </div>
            );
          })}
        </nav>

        <a className="download-link" href={assetPath("/assets/brand/krdv-logo-horizontal.pdf")} download>
          Скачать материалы <span aria-hidden="true">↓</span>
        </a>
      </aside>
    </>
  );
}

function ImagePanel({ photo, index }) {
  return (
    <figure className="image-panel">
      <div className="image-frame">
        <img src={photo.src} alt="" loading={index > 1 ? "lazy" : "eager"} />
      </div>
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

function EditorialSection({ section }) {
  return (
    <section className="editorial-section" id={section.id}>
      <div className="section-copy">
        <p className="section-eyebrow">{section.eyebrow}</p>
        <h2>{section.title}</h2>
        <p>{section.body}</p>
      </div>
      <div className="photo-grid">
        {section.photos.map((photo, index) => (
          <ImagePanel photo={photo} index={index} key={photo.src} />
        ))}
      </div>
    </section>
  );
}

export function App() {
  const pageRef = useRef(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState("intro");

  const trackedIds = useMemo(() => sections.map((section) => section.id), []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const onScroll = () => {
      const pageTop = page.getBoundingClientRect().top;
      let current = trackedIds[0];
      for (const id of trackedIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top - pageTop;
        if (top <= 180) current = id;
      }
      setActiveId(current);
    };

    page.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      page.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, [trackedIds]);

  useEffect(() => {
    document.body.classList.toggle("drawer-locked", drawerOpen);
    return () => document.body.classList.remove("drawer-locked");
  }, [drawerOpen]);

  const handleNavigate = (id) => {
    const page = pageRef.current;
    const target = document.getElementById(id);
    if (!page || !target) return;
    if (window.matchMedia("(max-width: 760px)").matches) {
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      const top = target.offsetTop - 24;
      page.scrollTo({ top, behavior: "smooth" });
    }
    setActiveId(id);
  };

  return (
    <div className="guidelines-shell">
      <header className="mobile-header">
        <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="КРДВ" />
        <button
          className={`burger ${drawerOpen ? "is-open" : ""}`}
          type="button"
          aria-label={drawerOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <Sidebar
        activeId={activeId}
        drawerOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNavigate}
      />

      <main className="page" ref={pageRef}>
        <section className="hero" id="intro">
          <div className="hero-number">07</div>
          <h1>Фотостиль</h1>
        </section>

        <section className="lead-section">
          <p>
            Фотостиль КРДВ отображает Дальний Восток и Арктику будущего. Он помогает
            убедительно говорить о социально-экономическом развитии регионов,
            показывать отраслевые результаты и живые человеческие истории.
          </p>
        </section>

        <section className="style-section" id="style">
          <div className="section-copy">
            <p className="section-eyebrow">Композиция</p>
            <h2>Основные принципы</h2>
          </div>
          <div className="principles-grid">
            <p className="principles-intro">
              Для коммуникаций от имени КРДВ важно подбирать фотографии, которые
              одновременно выглядят достоверно, современно и связаны с реальными
              достижениями территорий.
            </p>
            {principles.map((item) => (
              <article className="principle-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {imageSections.map((section) => (
          <EditorialSection section={section} key={section.id} />
        ))}

        <section className="resources-section" id="resources">
          <div className="section-copy">
            <p className="section-eyebrow">Ресурсы</p>
            <h2>Материалы для работы</h2>
          </div>
          <div className="resource-card">
            <p>Фирменный логотип, палитра, шрифтовая пара и примеры фотостиля собраны в локальной версии прототипа.</p>
            <a href={assetPath("/assets/brand/krdv-logo-horizontal.pdf")} download>
              Скачать логотип
            </a>
          </div>
        </section>

        <section className="pager">
          <a href="#style" onClick={(event) => { event.preventDefault(); handleNavigate("style"); }}>
            <span>06 Мерч</span>
            <strong>←</strong>
          </a>
          <a href="#resources" onClick={(event) => { event.preventDefault(); handleNavigate("resources"); }}>
            <span>08 Приложение</span>
            <strong>→</strong>
          </a>
        </section>

        <footer className="footer">
          <div>
            <p>Руководство по фирменному стилю</p>
            <p>Версия: февраль 2025</p>
          </div>
          <div>
            <p>Акционерное общество «Корпорация развития Дальнего Востока и Арктики»</p>
            <p>erdc.ru</p>
          </div>
          <div>
            <p>Вопросы по фирменному стилю</p>
            <p>Департамент визуальных коммуникаций</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
