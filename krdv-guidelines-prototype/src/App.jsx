import { useEffect, useMemo, useState } from "react";

const assetPath = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;
const brandbookAsset = (folder, filename) => assetPath(`/assets/brandbook/${folder}/${filename}`);

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
    .replace(/(\d)\s(?=\d{3}(?:\D|$))/g, `$1${NBSP}`)
    .replace(/(\d)\s*[xх×]\s*(\d)/giu, "$1×$2")
    .replace(/(№)\s+/giu, `$1${NBSP}`)
    .replace(hangingPattern, `$1$2${NBSP}`)
    .replace(/(\d)\s+(?=(?:мм|см|м²|м|г\/м²|г|кг|pt|%|₽|руб\.?|год|года|годы|ч|мин)\b)/giu, `$1${NBSP}`);
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

const regimes = [
  { label: "ТОР", title: "Территории опережающего развития", color: "#7d2675" },
  { label: "СПВ", title: "Свободный порт Владивосток", color: "#1e4b8f" },
  { label: "КОРФ", title: "Курильские острова Российской Федерации", color: "#5e9bb5" },
  { label: "САР", title: "Специальный административный район", color: "#308d86" },
  { label: "АЗРФ", title: "Арктическая зона Российской Федерации", color: "#55a9df" },
  { label: "ИНТЦ", title: "Инновационный научно-технологический центр", color: "#6f5bd6" },
  { label: "Гектар", title: "Программа земельных участков", color: "#194e42" },
  { label: "Работа", title: "Коммуникации о трудоустройстве", color: "#143746" },
  { label: "Ипотека", title: "Льготные ипотечные программы", color: "#a98da2" },
];

const photoGroups = [
  {
    title: "Инфраструктура",
    summary: "Ледоколы, порты, заводы, проекты резидентов и символы Северного морского пути.",
    photos: [
      ["infra-icebreaker.webp", "Ледоколы, порты, грузовые суда, спутники, символы Северного морского пути."],
      ["infra-team-arctic.webp", "Командное фото как символ единства, общих целей и прогресса."],
      ["infra-plant.webp", "Работающие предприятия и заводы Дальнего Востока и Арктики."],
      ["infra-resident-project.webp", "Актуальные предприятия и новые проекты резидентов."],
    ],
  },
  {
    title: "Выступления",
    summary: "Люди должны быть вовлечены, эмоциональны и композиционно читаемы.",
    photos: [
      ["events-culture.webp", "Участники заинтересованы, эмоциональны, кадр выглядит естественно."],
      ["events-forum.webp", "Событийный контекст считывается через сцену, участников и среду."],
      ["events-youth.webp", "Живой момент, лица в фокусе, действие понятно без подписи."],
      ["events-audience.webp", "Групповые кадры должны оставаться читаемыми и композиционно ясными."],
    ],
  },
  {
    title: "Природа",
    summary: "Визуально сильные, достоверные и качественные кадры регионов.",
    photos: [
      ["nature-volcano.webp", "Масштабные пейзажи, в которых сразу считывается уникальность территории."],
      ["nature-aurora.webp", "Арктическая атмосфера, глубина и выразительный природный свет."],
      ["nature-greenhouse.webp", "Современные отраслевые сюжеты на стыке природы и технологий."],
      ["nature-bridge.webp", "Инфраструктура в природном и городском контексте региона."],
    ],
  },
  {
    title: "Люди",
    summary: "Аутентичные сюжеты, деятельность, культура и жизнь народов регионов.",
    photos: [
      ["people-dance.webp", "Культурный сюжет раскрывается через действие, костюм и пространство."],
      ["people-reindeer.webp", "Крупный план помогает создать эмоциональный и достоверный образ."],
      ["people-sled.webp", "Региональная среда и повседневная деятельность в одном кадре."],
      ["people-performance.webp", "Чистый фон и ясное действие усиливают выразительность портрета."],
    ],
  },
];

const sections = [
  {
    id: "positioning",
    number: "01",
    title: "Позиционирование",
    label: "Смысловая платформа",
    scope: "Миссия · принципы · тон коммуникации",
    summary:
      "Бренд говорит о Дальнем Востоке и Арктике как о территориях будущего, где инфраструктура, льготы, знания и люди превращаются в конкретные достижения.",
    blocks: [
      {
        id: "future",
        title: "Дальний Восток и Арктика - ближе к будущему!",
        kicker: "Бренд-обещание",
        text: [
          "Формула бренда связывает территорию с будущим, успехом и мечтой. Она работает как главный смысловой каркас для внешних и внутренних коммуникаций.",
          "Внутри этой системы раскрываются темы земли, знаний, инфраструктуры, карьеры, льгот, масштаба и ипотечных возможностей.",
        ],
        chips: ["ближе к успеху", "ближе к мечте", "земля", "знания", "инфраструктура", "карьера", "льготы", "гектар", "масштаб", "ипотека 2%"],
        visual: { type: "signal" },
      },
      {
        id: "principles",
        title: "Наша работа - ваши достижения",
        kicker: "Принципы сервиса",
        text: [
          "Корпорация привлекает активных граждан и организации на Дальний Восток и в Арктику, помогает успешно реализовывать проекты и снимает барьеры на пути развития регионов.",
          "Коммуникация должна оставаться прикладной: меньше деклараций, больше ясных преимуществ, маршрутов и доказательств результата.",
        ],
        specs: [
          ["Качественно", "Экспертиза, профессиональный опыт и работа с реальными задачами резидентов."],
          ["Просто", "Понятные процедуры, цифровые сервисы и короткий путь от интереса к действию."],
          ["Выгодно", "Льготы и меры поддержки, повышающие экономическую эффективность проектов."],
          ["Надежно", "Защита интересов граждан и бизнеса, сопровождение сложных вопросов."],
        ],
        visual: { type: "principles" },
      },
    ],
  },
  {
    id: "elements",
    number: "02",
    title: "Основные элементы",
    label: "Айдентика",
    scope: "Логотип · палитра · типографика · текст",
    summary:
      "Фундамент бренда: знак, версии логотипа, дочерняя архитектура, режимы, цвета, шрифты и правила набора. Эти элементы задают узнаваемость на цифровых и печатных носителях.",
    blocks: [
      {
        id: "logo",
        title: "Логотип",
        kicker: "Основной знак",
        text: [
          "Логотип АО «КРДВ» - неделимый блок из фирменного графического знака и написания. Взаимное расположение элементов зафиксировано и не меняется в макетах.",
          "Графический знак основан на стилизованном цветущем лотосе. Образ роста символизирует прогресс, развитие и способность преодолевать барьеры на благо социально-экономического развития территорий.",
        ],
        note: "Использование знака с другой фразой допускается только после письменного согласования с Департаментом визуальных коммуникаций АО «КРДВ».",
        visual: { type: "logoLab" },
        assets: [
          { src: "logo-master.svg", kind: "svg", title: "Мастер-логотип", caption: "Оригинальная связка знака и написания." },
          { src: "logo-versions.svg", kind: "svg", title: "Версии", caption: "Вертикальные, горизонтальные, русские и английские варианты." },
        ],
      },
      {
        id: "logo-rules",
        title: "Версии и использование",
        kicker: "Правила применения",
        text: [
          "Вертикальная и горизонтальная версии логотипа равноправно используются для идентификации компании. Русский или английский вариант выбирается по аудитории и языку среды.",
          "Полноцветный логотип ставится только на фон с достаточным контрастом. Если подходящей области нет, используется дополнительная плашка.",
        ],
        list: [
          "Не отделять графический знак от текстовой части.",
          "Не использовать другой текст вместо оригинального написания.",
          "Не изменять цвет, пропорции, типографику и не добавлять эффекты.",
          "Охранное поле вокруг логотипа оставлять свободным от других элементов.",
        ],
        assets: [
          { src: "logo-usage.svg", kind: "svg", title: "Контраст", caption: "Разрешенное и запрещенное размещение на фоне." },
          { src: "logo-clearspace.svg", kind: "svg", title: "Охранное поле", caption: "Свободная зона вокруг знака." },
          { src: "usage-backgrounds.webp", kind: "webp", title: "Фоновые сценарии", caption: "Фрагмент правил для светлых, темных и фотофонов.", wide: true },
          { src: "logo-misuse.svg", kind: "svg", title: "Нельзя", caption: "Типовые ошибки: пропорции, цвет, эффекты и подмена текста.", wide: true },
        ],
      },
      {
        id: "subsidiaries",
        title: "Логотипы дочерних обществ",
        kicker: "Архитектура бренда",
        text: [
          "Логотипы дочерних обществ состоят из фирменного знака и наименования общества. Основная версия - горизонтальная, дополнительная - вертикальная.",
          "Англоязычные версии используются на международных мероприятиях, англоязычных ресурсах и при взаимодействии с зарубежными партнерами.",
        ],
        assets: [
          { src: "subsidiaries-ru-a.svg", kind: "svg", title: "Дочерние общества", caption: "Основной русскоязычный набор." },
          { src: "subsidiaries-ru-b.svg", kind: "svg", title: "Дополнительный набор", caption: "Расширение линейки дочерних обществ." },
          { src: "subsidiaries-en-a.svg", kind: "svg", title: "English", caption: "Международная версия основной линейки." },
          { src: "subsidiaries-en-b.svg", kind: "svg", title: "English extended", caption: "Дополнительный англоязычный набор." },
        ],
      },
      {
        id: "regimes",
        title: "Знаки преференциальных режимов",
        kicker: "Программные обозначения",
        text: [
          "Для коммуникаций о мерах поддержки используется единая система знаков и сокращений. Она помогает быстро различать режимы, программы и направления поддержки.",
        ],
        visual: { type: "regimes" },
        assets: [{ src: "regime-signs.svg", kind: "svg", title: "Система знаков", caption: "Набор пиктограмм и сокращений для режимов.", wide: true }],
      },
      {
        id: "colors",
        title: "Фирменные цвета",
        kicker: "Цветовая система",
        text: [
          "Синий цвет связан с океанами, омывающими Дальний Восток и Арктику: Северным Ледовитым и Тихим. Красный цвет связан с восходящим на востоке солнцем.",
          "Дополнительная арктическая изумрудная палитра используется в презентациях и поддерживающих материалах, когда нужно усилить северный и технологичный характер коммуникации.",
        ],
        palette: [...primaryPalette, ...secondaryPalette],
        assets: [
          { src: "palette-primary.webp", kind: "webp", title: "Основная палитра", caption: "Синие и красный акцент." },
          { src: "palette-arctic.webp", kind: "webp", title: "Арктическая палитра", caption: "Изумрудные и ледяные оттенки." },
        ],
      },
      {
        id: "type",
        title: "Фирменные шрифты",
        kicker: "Типографика",
        text: [
          "TT Norms Pro - основное семейство для рекламно-информационных материалов Корпорации. Гротеск подходит для заголовков, интерфейса, таблиц и наборного текста.",
          "TT Norms Pro Serif используется как второй, преимущественно акцидентный элемент шрифтовой пары. TT Tsars применяется для наградных документов.",
        ],
        note: "Другие шрифты допустимы только для проектов с собственным фирменным стилем или в офисных документах, где доступны только предустановленные системные шрифты.",
        visual: { type: "type" },
        assets: [{ src: "typography-system.svg", kind: "svg", title: "Шрифтовой набор", caption: "Начертания, акценты и роль TT Tsars.", wide: true }],
      },
      {
        id: "text",
        title: "Оформление текста",
        kicker: "Редакционная гигиена",
        text: [
          "Русскоязычные тексты должны быть аккуратными: корректные кавычки, тире, интервалы, знаки валют, телефонные номера, сокращения и географические названия.",
          "В веб-версии все служебные короткие слова типографируются неразрывными пробелами, чтобы предлоги и союзы не зависали в конце строки.",
        ],
        specs: [
          ["Кавычки", "Основной тип - «елочки». Вложенные цитаты оформляются «лапками»."],
          ["Тире", "Длинное тире отбивается пробелами. Среднее тире используется для числовых интервалов без пробелов."],
          ["Валюты", "Знак после числа отбивается неразрывным пробелом; в тексте предпочтительно писать валюты словами."],
          ["Телефоны", "Номера записываются в международном формате или начинаются с 8; группы отбиваются неразрывными пробелами."],
          ["Сокращения", "Усеченные слова пишутся с точкой, кроме физических единиц СИ. Млн и млрд пишутся без точки."],
          ["География", "Родовые географические термины пишутся со строчной, названия регионов - с прописной."],
        ],
        assets: [
          { src: "text-rules-a.svg", kind: "svg", title: "Кавычки, тире, деньги", caption: "Примеры набора и интервалов." },
          { src: "text-rules-b.svg", kind: "svg", title: "Даты и названия", caption: "Сокращения, ведомства и география." },
        ],
      },
    ],
  },
  {
    id: "graphics",
    number: "03",
    title: "Базовая графика",
    label: "Кодирование режимов",
    scope: "Цвета программ · карточки · рекламные модули",
    summary:
      "Система преференциальных режимов строится на понятном цвете, коротком названии и прикладном визуальном контексте: программа должна считываться до чтения подробного текста.",
    blocks: [
      {
        id: "coding",
        title: "Цветовое кодирование",
        kicker: "Режимы и программы",
        text: [
          "Для каждого преференциального режима разработаны свой знак и цветовая палитра. В рекламных носителях это превращается в быстрый визуальный фильтр: зритель сначала видит режим, затем считывает предложение.",
        ],
        visual: { type: "regimes" },
        assets: [{ src: "regime-coding.webp", kind: "webp", title: "Карточки режимов", caption: "Цвет, фотография, знак и короткий текст работают как единая система.", wide: true }],
      },
      {
        id: "system",
        title: "Логика графической системы",
        kicker: "Принцип сборки",
        text: [
          "В коммуникационных носителях цвет режима не должен быть случайным декоративным пятном. Он связывает заголовок, графический угол, пиктограмму и фотографию в один узнаваемый блок.",
          "Система допускает адаптацию под формат, но сохраняет иерархию: знак, режим, ключевой смысл, подробность и контактное действие.",
        ],
        list: [
          "Использовать закрепленный цвет режима, а не близкий оттенок.",
          "Сохранять чистую зону логотипа и не перегружать носитель мелким текстом.",
          "Фотографию выбирать по смыслу программы, а не только по декоративности.",
          "На серии носителей поддерживать одинаковую высоту заголовочного блока.",
        ],
        visual: { type: "regimeCards" },
      },
    ],
  },
  {
    id: "corporate",
    number: "04",
    title: "Корпоративные материалы",
    label: "Деловые носители",
    scope: "Визитки · QR · дочерние общества · бланки",
    summary:
      "Корпоративные материалы удерживают строгий деловой тон: много воздуха, точная сетка, спокойная типографика и логотип как главный идентификатор.",
    blocks: [
      {
        id: "cards",
        title: "Визитки",
        kicker: "Персональная коммуникация",
        text: ["Формат визитки - 90×50 мм, красочность 4+0, односторонняя печать. В макете сохраняется свободная зона, ясная контактная структура и читаемая типографика."],
        specs: [
          ["Фамилия, имя", "10 pt, TT Norms Pro Medium."],
          ["Должность", "6,5 pt, TT Norms Pro Regular."],
          ["Контакты", "7 pt, TT Norms Pro Regular."],
          ["Адресный блок", "7 pt, TT Norms Pro Regular."],
          ["Материал", "Матовая белая бумага или touch cover, возможно тиснение и матовый ламинат, плотность не менее 300 г/м²."],
        ],
        assets: [{ src: "business-card.svg", kind: "svg", title: "Основные визитки", caption: "Два варианта персонального блока.", wide: true }],
      },
      {
        id: "qr-cards",
        title: "Визитки с QR-кодом",
        kicker: "Быстрый контакт",
        text: ["QR-code размещается только на отведенном месте и не разрушает сетку. Формат, красочность и типографика соответствуют основной визитке."],
        specs: [
          ["Формат", "90×50 мм."],
          ["Красочность", "4+0, односторонняя печать."],
          ["Материал", "Матовая белая бумага или touch cover, плотность не менее 300 г/м²."],
        ],
        assets: [{ src: "qr-card.svg", kind: "svg", title: "QR-визитки", caption: "Персональная карточка с цифровым действием.", wide: true }],
      },
      {
        id: "subsidiary-card",
        title: "Визитки дочерних обществ",
        kicker: "Единый стандарт",
        text: ["Визитки ДО используют тот же формат, одностороннюю красочность 4+0 и наборную систему TT Norms Pro. Логотип дочернего общества занимает верхнюю идентификационную зону."],
        specs: [
          ["QR-code", "Размещается только на отведенном месте."],
          ["Материал", "Матовая белая бумага или touch cover, возможно тиснение и матовый ламинат."],
          ["Печать", "Офсетная, цифровая или УФ-печать."],
        ],
        assets: [{ src: "subsidiary-card.svg", kind: "svg", title: "Визитки ДО", caption: "Логотипы дочерних обществ в общей сетке.", wide: true }],
      },
      {
        id: "letterheads",
        title: "Бланки дочерних обществ",
        kicker: "Документооборот",
        text: ["Бланк включает логотип ДЗО, наименование, полный адрес, телефон, адрес электронной почты и сайт. Для печати используется офисная или офсетная бумага."],
        note: "Бланки всех ДЗО можно найти по ссылке либо запросить у представителей дочерних обществ.",
        assets: [{ src: "letterhead.svg", kind: "svg", title: "Бланки", caption: "Два деловых шаблона с фиксированным верхним блоком.", wide: true }],
      },
    ],
  },
  {
    id: "advertising",
    number: "05",
    title: "Рекламные материалы",
    label: "Информационные носители",
    scope: "Лифлеты · стенды · роллапы · навигация · награды",
    summary:
      "Рекламные и информационные носители должны быстро объяснять предложение, удерживать фирменную систему и оставаться технологичными в производстве.",
    blocks: [
      {
        id: "leaflets",
        title: "Лифлеты",
        kicker: "Серия программ",
        text: ["Лифлеты строятся на цветовой системе преференциальных режимов: у каждого режима свой цвет, заголовок, фотографический сюжет и логотипный блок."],
        specs: [
          ["Формат", "А4, 297×210 мм, 2 бига."],
          ["Печать", "4+4, двухсторонняя, офсет или цифра."],
          ["Серия", "САР, КОРФ, Гектар, Работа, ТОР, Ипотека, АЗРФ, СПВ."],
        ],
        assets: [{ src: "leaflets.webp", kind: "webp", title: "Серия лифлетов", caption: "Полный ряд режимных носителей.", wide: true }],
      },
      {
        id: "stands",
        title: "Прессволл и роллап",
        kicker: "Событийная среда",
        text: [
          "Прессволл используется на выставках, форумах и имиджевых мероприятиях за счет простоты и скорости сборки. Роллапы работают там, где нужна быстрая вертикальная идентификация предложения.",
        ],
        specs: [
          ["Прессволл", "2000×3000 мм."],
          ["Роллап", "800×1800 мм."],
          ["Согласование", "Для другого дизайна требуется обращение в Департамент визуальных коммуникаций КРДВ."],
        ],
        assets: [
          { src: "presswall.webp", kind: "webp", title: "Прессволл", caption: "Паттерн логотипов и ведомственный блок." },
          { src: "rollup.webp", kind: "webp", title: "Роллап", caption: "Вертикальные носители с QR и программным цветом." },
        ],
      },
      {
        id: "navigation",
        title: "Навигация кабинетов и режимник",
        kicker: "Офисная среда",
        text: [
          "Формат и размер табличек зависят от строения и особенностей помещения. Рекомендованное соотношение сторон - 3:2 по вертикали и горизонтали.",
          "Режимные таблички адаптируются под помещение, в котором они размещаются, но сохраняют логотип, часы работы и контактный блок.",
        ],
        note: "Для заказа офисных табличек необходимо обратиться в Департамент визуальных коммуникаций КРДВ.",
        assets: [
          { src: "office-signs.svg", kind: "svg", title: "Кабинетные таблички", caption: "Горизонтальные и вертикальные форматы." },
          { src: "schedule-sign.svg", kind: "svg", title: "Режимник", caption: "Информационная табличка с часами работы." },
        ],
      },
      {
        id: "awards",
        title: "Наградные документы",
        kicker: "Торжественный носитель",
        text: [
          "Наградные документы выполняются в формате А4. Для производства используется бумага Majestic Classic белый мрамор под заказ, заголовки тиснятся золотой фольгой, рама - серебряной фольгой.",
        ],
        note: "После внесения ФИО и текста дизайнер убирает из макета рамку и заголовок: эти элементы передаются типографии отдельным файлом для тиснения.",
        assets: [{ src: "award-documents.svg", kind: "svg", title: "Грамоты и благодарности", caption: "TT Tsars задает торжественный характер документа.", wide: true }],
      },
    ],
  },
  {
    id: "merch",
    number: "06",
    title: "Мерч",
    label: "Сувенирная продукция",
    scope: "Блокноты · пакет · футболка · шоппер · знак резидентов",
    summary:
      "Сувенирная продукция строится на лаконичных фирменных элементах, качественных материалах и согласовании нестандартных макетов до производства.",
    blocks: [
      {
        id: "stationery",
        title: "Блокноты и канцелярия",
        kicker: "Повседневные носители",
        text: [
          "Для блокнотов предусмотрены форматы А5 148×210 мм и B5 190×250 мм, каждый - с мягкой и твердой обложкой.",
          "Канцелярия включает брендированную письменную ручку черного цвета, матовую белую шариковую ручку и деревянный карандаш с тампопечатью.",
        ],
        note: "Для заказа блокнотов с другим дизайном необходимо согласовать макеты с Департаментом визуальных коммуникаций.",
        assets: [{ src: "stationery.webp", kind: "webp", title: "Блокнот и ручки", caption: "Черно-белая сувенирная группа с малым логотипом.", wide: true }],
      },
      {
        id: "carry",
        title: "Пакет, футболка и шоппер",
        kicker: "Носители в среде",
        text: [
          "Пакет производится из плотной бумаги или картона. Вид нанесения - офсет или прямая печать.",
          "Футболка и шоппер используются на мероприятиях и в повседневной среде, поддерживая узнаваемость команды через сдержанный знак и чистую поверхность.",
        ],
        specs: [["Нанесение", "Прямая цифровая печать на ткани, шелкография, термотрансфер или машинная вышивка."]],
        assets: [
          { src: "package.webp", kind: "webp", title: "Пакет", caption: "Плотная бумага или картон." },
          { src: "tshirt.webp", kind: "webp", title: "Футболка", caption: "Черная базовая версия для мероприятий." },
          { src: "shopper.webp", kind: "webp", title: "Шоппер", caption: "Повседневный носитель фирменного знака." },
        ],
      },
      {
        id: "made-in",
        title: "Сделано в ТОР СПВ",
        kicker: "Знак для резидентов",
        text: [
          "Товарный знак «Сделано в ТОР СПВ» разработан для поддержки резидентов и дополнительной узнаваемости бренда. Он используется для брендирования продукции, произведенной резидентами, после одобрения заявки.",
          "Версию на английском языке рекомендуется использовать при сотрудничестве с международными резидентами.",
        ],
        note: "Способ нанесения на упаковку согласовывается индивидуально с каждым резидентом. В отдельных случаях допускается адаптация цвета знака под цвет упаковки товара.",
        assets: [
          { src: "made-mark.svg", kind: "svg", title: "Знак", caption: "Русская и английская версии для маркировки продукции." },
          { src: "made-products.webp", kind: "webp", title: "На продукции", caption: "Примеры нанесения на товары резидентов." },
          { src: "made-packaging.webp", kind: "webp", title: "На упаковке", caption: "Адаптация под реальные формы упаковки." },
        ],
      },
    ],
  },
  {
    id: "photostyle",
    number: "07",
    title: "Фотостиль",
    label: "Изображения",
    scope: "Инфраструктура · события · природа · люди",
    summary:
      "Фотостиль показывает Дальний Восток и Арктику будущего: отраслевые результаты, живые люди, достоверные территории и эмоционально ясные сюжеты.",
    blocks: [
      {
        id: "principles",
        title: "Основные принципы",
        kicker: "Выбор изображения",
        text: [
          "Для выполнения миссии важно подбирать убедительные фотографии отраслевых результатов и достижений, а также живые и эмоционально наполненные фотографии людей.",
          "Фотография должна не иллюстрировать абстрактную тему, а показывать достижение, среду, человека или результат, который можно почувствовать без поясняющего текста.",
        ],
        chips: ["достижения", "инфраструктура", "эмоция", "достоверность", "люди", "регион"],
        visual: { type: "photoRule" },
      },
      {
        id: "library",
        title: "Композиция и сюжет",
        kicker: "Библиотека направлений",
        text: [
          "Инфраструктура раскрывается через ледоколы, порты, грузовые суда, спутники, работающие предприятия и проекты резидентов.",
          "Мероприятия лучше показывать через вовлеченных людей, действие и живую сцену. Природа должна быть визуально сильной и достоверно связанной с регионом. Съемка людей раскрывает деятельность, культуру и жизнь народов территорий.",
        ],
        visual: { type: "photos" },
      },
    ],
  },
  {
    id: "appendix",
    number: "08",
    title: "Приложение",
    label: "Социальные сети и контакты",
    scope: "SMM-гайд · контактный блок",
    summary:
      "Финальный раздел фиксирует дополнительный гайд для социальных сетей и контактную информацию Корпорации для служебного использования.",
    blocks: [
      {
        id: "social",
        title: "Социальные сети",
        kicker: "Отдельный гайд",
        text: ["Для коммуникаций в социальных сетях КРДВ разработан отдельный гайд по оформлению. В веб-брендбуке этот блок работает как указатель на SMM-систему и показывает характер карточек."],
        assets: [{ src: "social-guide.webp", kind: "webp", title: "SMM-гайд", caption: "Пример новостной карточки и авторского шаблона.", wide: true }],
      },
      {
        id: "contacts",
        title: "Контакты",
        kicker: "АО «КРДВ»",
        text: [
          "Акционерное общество «Корпорация развития Дальнего Востока и Арктики».",
          "Телефон: 8 (800) 707-55-58. Сайт: erdc.ru. Все права защищены.",
        ],
        visual: { type: "contacts" },
      },
    ],
  },
];

function getRoute() {
  const id = window.location.hash.replace(/^#\/?/, "");
  return sections.some((section) => section.id === id) ? id : "cover";
}

function useHashRoute() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function navigateTo(sectionId) {
  window.location.hash = sectionId === "cover" ? "#/" : `#/${sectionId}`;
}

function Sidebar({ route, drawerOpen, onClose }) {
  return (
    <>
      <button className={`drawer-scrim ${drawerOpen ? "is-open" : ""}`} type="button" aria-label={t("Закрыть меню")} onClick={onClose} />
      <aside className={`sidebar ${drawerOpen ? "is-open" : ""}`} aria-label={t("Разделы брендбука")}>
        <button
          className="brand-button"
          type="button"
          onClick={() => {
            navigateTo("cover");
            onClose();
          }}
        >
          <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="КРДВ" />
        </button>
        <div className="sidebar-meta">
          <span>{t("Цифровой брендбук")}</span>
          <span>{t("АО «КРДВ» · февраль 2025")}</span>
        </div>
        <nav className="primary-nav">
          {sections.map((section) => (
            <button
              type="button"
              className={route === section.id ? "is-active" : ""}
              aria-current={route === section.id ? "page" : undefined}
              onClick={() => {
                navigateTo(section.id);
                onClose();
              }}
              key={section.id}
            >
              <span>{section.number}</span>
              <strong>{t(section.title)}</strong>
            </button>
          ))}
        </nav>
        <a className="download-link" href={assetPath("/assets/brand/krdv-logo-horizontal.pdf")} download>
          {t("Скачать логотип")}
        </a>
      </aside>
    </>
  );
}

function Cover() {
  return (
    <section className="section-view cover-view" aria-labelledby="cover-title">
      <div className="cover-hero">
        <div className="cover-logo-frame">
          <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="КРДВ" />
        </div>
        <p>{t("Внутренний интерактивный веб-брендбук")}</p>
        <h1 id="cover-title">{t("Руководство по использованию фирменного стиля")}</h1>
      </div>
      <div className="overview-grid" aria-label={t("Разделы")}>
        {sections.map((section) => (
          <button type="button" onClick={() => navigateTo(section.id)} key={section.id}>
            <span>{section.number}</span>
            <strong>{t(section.title)}</strong>
            <small>{t(section.scope)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function SectionView({ section }) {
  const [openIds, setOpenIds] = useState(() => new Set(section.blocks.map((block) => block.id)));

  useEffect(() => {
    setOpenIds(new Set(section.blocks.map((block) => block.id)));
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [section.id, section.blocks]);

  const currentIndex = sections.findIndex((item) => item.id === section.id);
  const prev = sections[currentIndex - 1] || null;
  const next = sections[currentIndex + 1] || null;

  return (
    <section className="section-view" aria-labelledby={`${section.id}-title`}>
      <header className="chapter-header">
        <span>{section.number}</span>
        <div>
          <p>{t(section.label)}</p>
          <h1 id={`${section.id}-title`}>{t(section.title)}</h1>
          <p>{t(section.summary)}</p>
        </div>
      </header>

      <div className="section-tabs" aria-label={t("Подразделы")}>
        {section.blocks.map((block) => (
          <button
            type="button"
            onClick={() => {
              setOpenIds((current) => new Set(current).add(block.id));
              document.getElementById(`${section.id}-${block.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            key={block.id}
          >
            {t(block.title)}
          </button>
        ))}
      </div>

      <div className="block-list">
        {section.blocks.map((block) => (
          <BrandBlock
            block={block}
            id={`${section.id}-${block.id}`}
            open={openIds.has(block.id)}
            onToggle={() => {
              setOpenIds((current) => {
                const nextState = new Set(current);
                if (nextState.has(block.id)) nextState.delete(block.id);
                else nextState.add(block.id);
                return nextState;
              });
            }}
            key={block.id}
          />
        ))}
      </div>

      <nav className="pager" aria-label={t("Навигация между разделами")}>
        <button type="button" onClick={() => navigateTo(prev?.id || "cover")}>
          <span>{t(prev ? "Назад" : "Обложка")}</span>
          <strong>{t(prev?.title || "На главную")}</strong>
        </button>
        <button type="button" onClick={() => navigateTo(next?.id || "cover")}>
          <span>{t(next ? "Дальше" : "Обложка")}</span>
          <strong>{t(next?.title || "На главную")}</strong>
        </button>
      </nav>
    </section>
  );
}

function BrandBlock({ block, id, open, onToggle }) {
  return (
    <article className={`brand-block-card ${open ? "is-open" : ""}`} id={id}>
      <button className="block-summary" type="button" aria-expanded={open} onClick={onToggle}>
        <span>{t(block.kicker)}</span>
        <strong>{t(block.title)}</strong>
        <i aria-hidden="true" />
      </button>
      <div className="block-panel" aria-hidden={!open}>
        <div className="block-copy">
          {block.text?.map((paragraph) => (
            <p key={paragraph}>{t(paragraph)}</p>
          ))}
          {block.note ? <p className="note">{t(block.note)}</p> : null}
          <ChipList chips={block.chips} />
          <SpecList specs={block.specs} />
          <BulletList items={block.list} />
        </div>
        <BlockVisual block={block} />
      </div>
    </article>
  );
}

function ChipList({ chips }) {
  if (!chips?.length) return null;
  return (
    <div className="chip-list">
      {chips.map((chip) => (
        <span key={chip}>{t(chip)}</span>
      ))}
    </div>
  );
}

function SpecList({ specs }) {
  if (!specs?.length) return null;
  return (
    <dl className="spec-list">
      {specs.map(([label, value]) => (
        <div key={`${label}-${value}`}>
          <dt>{t(label)}</dt>
          <dd>{t(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="bullet-list">
      {items.map((item) => (
        <li key={item}>{t(item)}</li>
      ))}
    </ul>
  );
}

function BlockVisual({ block }) {
  const hasCustomVisual = block.visual || block.palette || block.assets;

  if (!hasCustomVisual) return <QuietPanel title={block.title} kicker={block.kicker} />;

  return (
    <div className="visual-stack">
      {block.visual?.type === "signal" ? <SignalPanel /> : null}
      {block.visual?.type === "principles" ? <PrinciplesPanel /> : null}
      {block.visual?.type === "logoLab" ? <LogoPanel /> : null}
      {block.visual?.type === "regimes" ? <RegimeList /> : null}
      {block.visual?.type === "regimeCards" ? <RegimeCards /> : null}
      {block.visual?.type === "type" ? <TypePanel /> : null}
      {block.visual?.type === "photoRule" ? <PhotoRulePanel /> : null}
      {block.visual?.type === "photos" ? <PhotoLibrary /> : null}
      {block.visual?.type === "contacts" ? <ContactsPanel /> : null}
      {block.palette ? <Palette colors={block.palette} /> : null}
      <AssetGallery assets={block.assets} />
    </div>
  );
}

function AssetGallery({ assets }) {
  if (!assets?.length) return null;
  return (
    <div className={`asset-gallery ${assets.length === 1 ? "is-single" : ""}`}>
      {assets.map((asset) => (
        <figure className={`asset-card ${asset.wide ? "is-wide" : ""}`} key={asset.src}>
          <div className={`asset-frame is-${asset.kind}`}>
            <img src={brandbookAsset(asset.kind === "svg" ? "svg" : "webp", asset.src)} alt={t(asset.title)} loading="lazy" />
          </div>
          <figcaption>
            <strong>{t(asset.title)}</strong>
            <span>{t(asset.caption)}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function Palette({ colors }) {
  const [copied, setCopied] = useState("");

  async function copyColor(hex) {
    try {
      await navigator.clipboard?.writeText(hex);
      setCopied(hex);
      window.setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied(hex);
      window.setTimeout(() => setCopied(""), 1200);
    }
  }

  return (
    <div className="palette-list">
      {colors.map((color) => (
        <button className="color-row" type="button" onClick={() => copyColor(color.hex)} key={color.hex}>
          <span style={{ background: color.hex }} />
          <div>
            <strong>{t(color.name)}</strong>
            <small>{color.hex}</small>
            <small>{t(`RGB ${color.rgb}`)}</small>
            <small>{t(`CMYK ${color.cmyk}`)}</small>
            {color.pantone ? <small>{t(`Pantone ${color.pantone}`)}</small> : null}
            <em>{t(copied === color.hex ? "HEX скопирован" : "HEX")}</em>
          </div>
        </button>
      ))}
    </div>
  );
}

function RegimeList() {
  return (
    <div className="regime-list">
      {regimes.map((regime) => (
        <div style={{ "--regime": regime.color }} key={regime.label}>
          <strong>{t(regime.label)}</strong>
          <span>{t(regime.title)}</span>
        </div>
      ))}
    </div>
  );
}

function SignalPanel() {
  return (
    <div className="signal-panel">
      <span>{t("Ближе к будущему")}</span>
      <strong>{t("Развитие территорий начинается с понятного действия")}</strong>
      <img src={assetPath("/assets/brand/krdv-logo-ru.svg")} alt="" />
    </div>
  );
}

function PrinciplesPanel() {
  const items = ["Качественно", "Просто", "Выгодно", "Надежно"];
  return (
    <div className="principles-panel">
      {items.map((item, index) => (
        <div key={item}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{t(item)}</strong>
        </div>
      ))}
    </div>
  );
}

function LogoPanel() {
  return (
    <div className="logo-panel">
      <div>
        <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="" />
      </div>
      <p>{t("Знак и написание сохраняют фиксированное взаимное расположение. В макете логотип работает как единый объект.")}</p>
    </div>
  );
}

function TypePanel() {
  return (
    <div className="type-panel">
      <p>TT Norms Pro</p>
      <strong>{t("Дальний Восток и Арктика")}</strong>
      <span>{t("Regular / Medium / DemiBold / Bold / ExtraBold")}</span>
      <p>TT Tsars</p>
      <em>{t("Почетная грамота")}</em>
    </div>
  );
}

function RegimeCards() {
  return (
    <div className="regime-card-panel">
      {regimes.slice(0, 6).map((regime) => (
        <div style={{ "--regime": regime.color }} key={regime.label}>
          <span>{t(regime.label)}</span>
          <strong>{t(regime.title)}</strong>
        </div>
      ))}
    </div>
  );
}

function PhotoRulePanel() {
  return (
    <div className="photo-rule-panel">
      {photoGroups.map((group) => (
        <figure key={group.title}>
          <img src={assetPath(`/assets/photos/${group.photos[0][0]}`)} alt="" loading="lazy" />
          <figcaption>{t(group.title)}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function ContactsPanel() {
  return (
    <div className="contacts-panel">
      <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="" />
      <div>
        <strong>{t("АО «Корпорация развития Дальнего Востока и Арктики»")}</strong>
        <span>{t("8 (800) 707-55-58")}</span>
        <span>erdc.ru</span>
      </div>
    </div>
  );
}

function QuietPanel({ title, kicker }) {
  return (
    <div className="quiet-panel">
      <span>{t(kicker)}</span>
      <strong>{t(title)}</strong>
    </div>
  );
}

function PhotoLibrary() {
  const [active, setActive] = useState(photoGroups[0].title);
  const group = photoGroups.find((item) => item.title === active) || photoGroups[0];

  return (
    <div className="photo-library">
      <div className="photo-switcher">
        {photoGroups.map((item) => (
          <button type="button" className={item.title === active ? "is-active" : ""} onClick={() => setActive(item.title)} key={item.title}>
            {t(item.title)}
          </button>
        ))}
      </div>
      <p>{t(group.summary)}</p>
      <div className="photo-grid">
        {group.photos.map(([file, caption]) => (
          <figure key={file}>
            <img src={assetPath(`/assets/photos/${file}`)} alt="" loading="lazy" />
            <figcaption>{t(caption)}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const route = useHashRoute();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const section = useMemo(() => sections.find((item) => item.id === route), [route]);

  useEffect(() => {
    document.body.classList.toggle("drawer-locked", drawerOpen);
    return () => document.body.classList.remove("drawer-locked");
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [route]);

  return (
    <div className="brandbook-shell">
      <header className="mobile-header">
        <button className="mobile-logo" type="button" onClick={() => navigateTo("cover")}>
          <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="КРДВ" />
        </button>
        <button
          className={`burger ${drawerOpen ? "is-open" : ""}`}
          type="button"
          aria-label={drawerOpen ? t("Закрыть меню") : t("Открыть меню")}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <Sidebar route={route} drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="content-shell">
        {section ? <SectionView section={section} /> : <Cover />}
        <footer className="footer">
          <p>{t("АО «Корпорация развития Дальнего Востока и Арктики»")}</p>
          <p>{t("8 (800) 707-55-58 · erdc.ru")}</p>
        </footer>
      </main>
    </div>
  );
}
