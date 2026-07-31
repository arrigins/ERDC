import { useEffect, useMemo, useRef, useState } from "react";

const assetPath = (pathname) => `${import.meta.env.BASE_URL}${pathname.replace(/^\/+/, "")}`;

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

const contents = [
  ["Позиционирование и основные принципы", "03"],
  ["Основные элементы", "05"],
  ["Базовая графика", "22"],
  ["Корпоративные материалы", "24"],
  ["Рекламно-информационные материалы", "29"],
  ["Сувенирная продукция и мерч", "36"],
  ["Фотостиль", "43"],
  ["Приложение", "48"],
];

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
  { label: "ТОР", title: "Территории опережающего развития" },
  { label: "СПВ", title: "Свободный порт Владивосток" },
  { label: "КОРФ", title: "Курильские острова Российской Федерации" },
  { label: "САР", title: "Специальный административный район" },
  { label: "АЗРФ", title: "Арктическая зона Российской Федерации" },
  { label: "ИНТЦ", title: "Инновационный научно-технологический центр" },
  { label: "Гектар", title: "Программа земельных участков" },
  { label: "Работа", title: "Коммуникации о трудоустройстве" },
  { label: "Ипотека", title: "Льготные ипотечные программы" },
];

const photoSections = [
  {
    id: "photo-infrastructure",
    label: "Инфраструктура",
    title: "Единый прогресс, общие взгляды",
    body:
      "Ключевым аспектом деятельности КРДВ является достижение результатов, связанных с развитием инфраструктуры. В коммуникациях стоит показывать ледоколы, порты, заводы, резидентские проекты и символы Северного морского пути.",
    photos: [
      { src: assetPath("/assets/photos/infra-icebreaker.webp"), caption: "Ледоколы, порты, грузовые суда, спутники, символы Северного морского пути." },
      { src: assetPath("/assets/photos/infra-team-arctic.webp"), caption: "Командное фото как символ единства, общих целей и прогресса." },
      { src: assetPath("/assets/photos/infra-plant.webp"), caption: "Работающие предприятия и заводы Дальнего Востока и Арктики." },
      { src: assetPath("/assets/photos/infra-resident-project.webp"), caption: "Актуальные предприятия и новые проекты резидентов." },
    ],
  },
  {
    id: "photo-events",
    label: "Выступления",
    title: "Люди в центре события",
    body:
      "Для культурных, образовательных и деловых мероприятий важно выбирать кадры с участием людей. Лучшие фотографии показывают заинтересованность, вовлеченность и естественную динамику происходящего.",
    photos: [
      { src: assetPath("/assets/photos/events-culture.webp"), caption: "Участники заинтересованы, эмоциональны, кадр выглядит естественно." },
      { src: assetPath("/assets/photos/events-forum.webp"), caption: "Событийный контекст считывается через сцену, участников и среду." },
      { src: assetPath("/assets/photos/events-youth.webp"), caption: "Живой момент, лица в фокусе, действие понятно без подписи." },
      { src: assetPath("/assets/photos/events-audience.webp"), caption: "Групповые кадры должны оставаться читаемыми и композиционно ясными." },
    ],
  },
  {
    id: "photo-nature",
    label: "Природа",
    title: "Захватывающая природа",
    body:
      "Кадры природы должны демонстрировать уникальную красоту и разнообразие регионов Дальнего Востока и Арктики. Главные требования: высокое качество изображения и достоверность места.",
    photos: [
      { src: assetPath("/assets/photos/nature-volcano.webp"), caption: "Масштабные пейзажи, в которых сразу считывается уникальность территории." },
      { src: assetPath("/assets/photos/nature-aurora.webp"), caption: "Арктическая атмосфера, глубина и выразительный природный свет." },
      { src: assetPath("/assets/photos/nature-greenhouse.webp"), caption: "Современные отраслевые сюжеты на стыке природы и технологий." },
      { src: assetPath("/assets/photos/nature-bridge.webp"), caption: "Инфраструктура в природном и городском контексте региона." },
    ],
  },
  {
    id: "photo-people",
    label: "Люди",
    title: "Люди Дальнего Востока и Арктики",
    body:
      "Главный принцип съемки людей - оригинальные аутентичные сюжеты, связанные с их деятельностью, культурными обычаями и жизнью народов Дальнего Востока и Арктики.",
    photos: [
      { src: assetPath("/assets/photos/people-dance.webp"), caption: "Культурный сюжет раскрывается через действие, костюм и пространство." },
      { src: assetPath("/assets/photos/people-reindeer.webp"), caption: "Крупный план помогает создать эмоциональный и достоверный образ." },
      { src: assetPath("/assets/photos/people-sled.webp"), caption: "Региональная среда и повседневная деятельность в одном кадре." },
      { src: assetPath("/assets/photos/people-performance.webp"), caption: "Чистый фон и ясное действие усиливают выразительность портрета." },
    ],
  },
];

const brandSections = [
  {
    number: "01",
    id: "positioning",
    title: "Позиционирование",
    heading: "Дальний Восток и Арктика - ближе к будущему",
    description:
      "Блок фиксирует смысловую платформу бренда и принцип коммуникации: работа Корпорации должна читаться через достижения людей, бизнеса и территорий.",
    items: [
      {
        id: "positioning-platform",
        label: "Позиционирование",
        page: "03",
        title: "Дальний Восток и Арктика - ближе к будущему!",
        body: [
          "Ключевая формула бренда связывает территорию с будущим, успехом и мечтой. В коммуникации рядом с этим смыслом используются темы знаний, инфраструктуры, карьеры, льгот, гектара, масштаба и ипотеки 2%.",
        ],
        chips: ["ближе к успеху", "ближе к мечте", "земля", "знания", "инфраструктура", "карьера", "льготы", "гектар", "масштаб", "ипотека 2%"],
        visual: "word-cloud",
      },
      {
        id: "positioning-principles",
        label: "Основные принципы",
        page: "04",
        title: "Наша работа - ваши достижения",
        body: [
          "КРДВ привлекает активных граждан и организации на Дальний Восток и в Арктику, помогает успешно реализовать проекты, направленные на ускоренное социально-экономическое развитие регионов, и решает проблемы.",
        ],
        specs: [
          ["Качественно", "Экспертиза и профессиональный опыт."],
          ["Просто", "Упрощенные процедуры и цифровые сервисы."],
          ["Выгодно", "Льготы и меры поддержки, повышающие экономическую эффективность проектов."],
          ["Надежно", "Защита интересов граждан и бизнеса, решение сложных задач."],
        ],
        visual: "principles",
      },
    ],
  },
  {
    number: "02",
    id: "elements",
    title: "Основные элементы",
    heading: "Логотип, цвет, типографика и текстовые правила",
    description:
      "Базовые элементы отвечают за узнаваемость КРДВ на цифровых и печатных носителях. Внутри раздела собраны правила логотипа, палитры, шрифтов и набора текста.",
    items: [
      {
        id: "logo-full",
        label: "Логотип",
        page: "06",
        title: "Полная версия логотипа",
        body: [
          "Логотип АО «КРДВ» - неделимый блок из фирменного графического знака и написания. Взаимное расположение элементов зафиксировано и не может быть изменено.",
          "Графический знак представляет стилизованное изображение цветущего лотоса. Рост лотоса символизирует прогресс, развитие и способность преодолевать барьеры на благо социально-экономического развития территорий Дальнего Востока и Арктики.",
        ],
        note: "Использование знака с другой фразой допускается только после письменного согласования с Департаментом визуальных коммуникаций АО «КРДВ».",
        visual: "logo-full",
      },
      {
        id: "logo-versions",
        label: "Версии",
        page: "07",
        title: "Основные версии логотипа",
        body: [
          "Вертикальная и горизонтальная версии могут равноправно использоваться для идентификации компании. Русский и английский варианты выбираются с учетом языковой группы аудитории.",
          "Для светлых и темных фонов используются отдельные версии, сохраняющие достаточную читаемость знака и написания.",
        ],
        visual: "logo-versions",
      },
      {
        id: "logo-usage",
        label: "Использование",
        page: "08",
        title: "Недопустимое использование логотипа",
        body: [
          "Графический знак нельзя использовать без текстовой части. Это может смешивать идентичность бренда КРДВ с брендами форумов и других компаний.",
          "Логотип нельзя использовать с другим текстом, кроме оригинального написания: Корпорация развития Дальнего Востока и Арктики.",
        ],
        bullets: ["Не отделять знак от написания.", "Не заменять фразу под знаком.", "Не нарушать взаимное расположение элементов."],
        visual: "logo-do-dont",
      },
      {
        id: "logo-clearspace",
        label: "Охранное поле",
        page: "09",
        title: "Охранное поле равно части знака логотипа",
        body: [
          "Охранное поле - пространство вокруг логотипа, в котором запрещено размещать любые графические элементы, не являющиеся частью логотипа.",
          "Если логотип используется в инвертированных цветах на синем фоне, размер фона сплошной заливки должен быть не меньше охранной зоны.",
        ],
        visual: "clearspace",
      },
      {
        id: "logo-background",
        label: "Фон и цвет",
        page: "10",
        title: "Выбор фона и работа с цветом",
        body: [
          "Полноцветный логотип допускается только на фоне с достаточным контрастом. Если подходящей области нет, рекомендуется использовать дополнительную плашку.",
        ],
        specs: [
          ["Разрешено", "Фирменные цвета и оттенки с высоким контрастом."],
          ["Разрешено", "Черный фон, если материал не снижает читаемость."],
          ["Разрешено", "Светлый однородный подтон фотоизображения."],
          ["Недопустимо", "Активные цветные паттерны и неоднородные фото без плашки."],
        ],
        visual: "backgrounds",
      },
      {
        id: "logo-errors",
        label: "Ошибки",
        page: "11",
        title: "Примеры недопустимого использования",
        body: ["Любое отступление от правил нанесения логотипа недопустимо."],
        bullets: ["Не использовать старые версии.", "Не изменять цвет.", "Не использовать знак без текстовой части.", "Не искажать пропорции.", "Не менять типографику.", "Не добавлять эффекты."],
        visual: "logo-errors",
      },
      {
        id: "subsidiary-logos",
        label: "Логотипы ДО",
        page: "12-15",
        title: "Логотипы дочерних обществ",
        body: [
          "Логотипы дочерних обществ состоят из фирменного знака и наименования общества. Основная версия - горизонтальная, дополнительная - вертикальная.",
          "Англоязычные версии используются на международных мероприятиях, англоязычных ресурсах и для взаимодействия с зарубежными партнерами.",
        ],
        specs: [
          ["Основная", "Горизонтальная версия."],
          ["Дополнительная", "Вертикальная версия, если горизонтальную использовать невозможно."],
          ["English", "Горизонтальная и вертикальная версии для международной коммуникации."],
        ],
        visual: "subsidiary-logos",
      },
      {
        id: "regime-signs",
        label: "Преференциальные режимы",
        page: "16",
        title: "Знаки преференциальных режимов",
        body: [
          "Для коммуникаций КРДВ используются отдельные знаки и сокращения преференциальных режимов: ТОР, СПВ, КОРФ, САР, АЗРФ, ИНТЦ, а также программы «Гектар», «Работа» и «Ипотека».",
        ],
        visual: "regime-grid",
      },
      {
        id: "colors-primary",
        label: "Фирменные цвета",
        page: "17",
        title: "Основная палитра",
        body: [
          "Синий цвет олицетворяет омывающие Дальний Восток и Арктику океаны - Северный Ледовитый и Тихий. Красный цвет связан с восходящим на востоке солнцем.",
        ],
        palette: primaryPalette,
      },
      {
        id: "colors-secondary",
        label: "Дополнительные цвета",
        page: "18",
        title: "Арктическая изумрудная палитра",
        body: ["Дополнительная цветовая палитра используется для оформления презентаций и поддерживающих материалов."],
        palette: secondaryPalette,
      },
      {
        id: "typography",
        label: "Фирменные шрифты",
        page: "19",
        title: "TT Norms Pro, TT Norms Pro Serif и TT Tsars",
        body: [
          "TT Norms Pro - фирменное семейство для рекламно-информационных материалов Корпорации. Универсальный гротеск подходит для наборного текста и заголовков.",
          "TT Norms Pro Serif используется как второй, преимущественно акцидентный элемент шрифтовой пары. TT Tsars применяется для наградных документов: благодарностей, благодарственных писем и почетных грамот.",
        ],
        note: "Использование других шрифтов допускается только для проектов со своим фирменным стилем или в офисных документах с предустановленными шрифтами.",
        visual: "typography",
      },
      {
        id: "text-rules",
        label: "Оформление текста",
        page: "20-21",
        title: "Базовые рекомендации по текстам",
        body: [
          "Русскоязычные тексты должны быть аккуратными: корректные кавычки, тире, интервалы, знаки валют, телефонные номера, сокращения и написание географических названий.",
        ],
        specs: [
          ["Кавычки", "Основной тип - «елочки». Вложенные цитаты оформляются «лапками»."],
          ["Тире", "Длинное тире отбивается пробелами. Среднее тире используется для числовых интервалов без пробелов."],
          ["Валюты", "Знак после числа отбивается неразрывным пробелом; в тексте предпочтительно писать валюты словами."],
          ["Телефоны", "Номера записываются в международном формате или начинаются с 8; группы отбиваются неразрывными пробелами."],
          ["Сокращения", "Усеченные слова пишутся с точкой, кроме физических единиц СИ. Млн и млрд пишутся без точки."],
          ["География", "Родовые географические термины пишутся со строчной, названия регионов - с прописной."],
        ],
        visual: "text-rules",
      },
    ],
  },
  {
    number: "03",
    id: "graphics",
    title: "Базовая графика",
    heading: "Цветовое кодирование преференциальных режимов",
    description:
      "Графическая система помогает быстро различать программы и режимы поддержки в презентациях, рекламных и информационных носителях.",
    items: [
      {
        id: "graphics-coding",
        label: "Цветовое кодирование",
        page: "22-23",
        title: "Графика для коммуникационных носителей",
        body: [
          "Для каждого преференциального режима разработан фирменный знак и цветовая палитра. Эти элементы рекомендуется использовать при работе с коммуникационными и рекламными носителями.",
        ],
        visual: "regime-grid-large",
      },
    ],
  },
  {
    number: "04",
    id: "corporate",
    title: "Корпоративные материалы",
    heading: "Деловые носители КРДВ и дочерних обществ",
    description:
      "Раздел описывает визитки, визитки с QR-кодом, материалы дочерних обществ и бланки документооборота.",
    items: [
      {
        id: "business-cards",
        label: "Визитки",
        page: "25",
        title: "Визитки КРДВ",
        body: ["Формат визитки - 90×50 мм, красочность 4+0, односторонняя печать."],
        specs: [
          ["Фамилия, имя", "10 pt, TT Norms Pro Medium."],
          ["Должность", "6,5 pt, TT Norms Pro Regular."],
          ["Контакты", "7 pt, TT Norms Pro Regular."],
          ["Адресный блок", "7 pt, TT Norms Pro Regular."],
          ["Материал", "Матовая белая бумага или touch cover, возможно тиснение и матовый ламинат, плотность не менее 300 г/м²."],
          ["Печать", "Офсетная, цифровая или УФ-печать."],
        ],
        visual: "business-card",
      },
      {
        id: "business-cards-qr",
        label: "Визитки с QR-кодом",
        page: "26",
        title: "Визитки с QR-кодом",
        body: [
          "Формат и типографика соответствуют основной визитке. QR-code размещается на отведенном под него месте и не нарушает структуру блока контактов.",
        ],
        specs: [
          ["Формат", "90×50 мм."],
          ["Красочность", "4+0, односторонняя печать."],
          ["Материал", "Матовая белая бумага или touch cover, плотность не менее 300 г/м²."],
        ],
        visual: "business-card-qr",
      },
      {
        id: "business-cards-subsidiary",
        label: "Визитки ДО",
        page: "27",
        title: "Визитки дочерних обществ",
        body: [
          "Визитки ДО используют тот же формат 90×50 мм, одностороннюю красочность 4+0 и наборную систему TT Norms Pro.",
        ],
        specs: [
          ["QR-code", "Размещается только на отведенном месте."],
          ["Материал", "Матовая белая бумага или touch cover, возможно тиснение и матовый ламинат."],
          ["Печать", "Офсетная, цифровая или УФ-печать."],
        ],
        visual: "subsidiary-card",
      },
      {
        id: "letterheads",
        label: "Бланки ДО",
        page: "28",
        title: "Бланки документооборота дочерних обществ",
        body: [
          "Бланк включает логотип ДЗО, наименование, полный адрес, телефон, адрес электронной почты и сайт. Для печати используется офисная или офсетная бумага.",
        ],
        note: "Бланки всех ДЗО можно найти по ссылке либо запросить у представителей дочерних обществ.",
        visual: "letterhead",
      },
    ],
  },
  {
    number: "05",
    id: "advertising",
    title: "Рекламные материалы",
    heading: "Лифлеты, стенды, навигация и наградные документы",
    description:
      "Рекламно-информационные материалы используют единую цветовую систему, ясную типографику и адаптацию под конкретный физический формат.",
    items: [
      {
        id: "leaflets",
        label: "Лифлеты",
        page: "30",
        title: "Лифлеты преференциальных режимов",
        body: ["В дизайне лифлетов используется цветовое кодирование: у каждого преференциального режима свой цвет."],
        specs: [
          ["Формат", "А4, 297×210 мм, 2 бига."],
          ["Печать", "4+4, двухсторонняя, офсет или цифра."],
          ["Сетка", "САР, КОРФ, Гектар, Работа, ТОР, Ипотека, АЗРФ, СПВ."],
        ],
        visual: "leaflets",
      },
      {
        id: "presswall",
        label: "Прессволл",
        page: "31",
        title: "Прессволл для мероприятий",
        body: [
          "Баннерная конструкция используется на выставках, форумах и имиджевых мероприятиях за счет простоты и скорости сборки.",
        ],
        specs: [["Размер", "2000×3000 мм."], ["Согласование", "Для заказа стоек с другим дизайном необходимо обратиться в Департамент визуальных коммуникаций КРДВ."]],
        visual: "presswall",
      },
      {
        id: "rollup",
        label: "Роллап",
        page: "32",
        title: "Мобильные конструкции",
        body: [
          "Роллапы удобно использовать на выставках, форумах и других имиджевых мероприятиях, где важны быстрая сборка и понятная идентификация бренда.",
        ],
        specs: [["Размер", "800×1800 мм."], ["Согласование", "Для другого дизайна требуется обращение в Департамент визуальных коммуникаций КРДВ."]],
        visual: "rollup",
      },
      {
        id: "office-navigation",
        label: "Навигация кабинетов",
        page: "33",
        title: "Навигационные таблички",
        body: [
          "Формат и размер табличек зависят от строения и особенностей помещения. Рекомендованное соотношение сторон - 3:2 по вертикали и горизонтали.",
        ],
        note: "Для заказа офисных табличек необходимо обратиться в Департамент визуальных коммуникаций КРДВ.",
        visual: "door-sign",
      },
      {
        id: "schedule-sign",
        label: "Режимник",
        page: "34",
        title: "Режимники работы предприятий и ДО",
        body: [
          "Режимные таблички адаптируются под помещение, в котором они размещаются. Рекомендованное соотношение сторон - 3:2.",
        ],
        visual: "schedule-sign",
      },
      {
        id: "awards",
        label: "Наградные документы",
        page: "35",
        title: "Почетные грамоты, благодарности и письма",
        body: [
          "Наградные документы выполняются в формате А4. Для производства используется бумага Majestic Classic белый мрамор под заказ, заголовки тиснятся золотой фольгой, рама - серебряной фольгой.",
        ],
        note: "После внесения ФИО и текста дизайнер должен убрать из макета рамку и заголовок: эти элементы передаются типографии отдельным файлом для тиснения.",
        visual: "award",
      },
    ],
  },
  {
    number: "06",
    id: "merch",
    title: "Мерч",
    heading: "Сувенирная продукция и брендированные носители",
    description:
      "Сувенирная продукция строится на лаконичных фирменных элементах, аккуратных материалах и согласовании нестандартных макетов.",
    items: [
      {
        id: "notebooks",
        label: "Примеры носителей",
        page: "37",
        title: "Блокноты и канцелярия",
        body: [
          "Для блокнотов предусмотрены форматы А5 148×210 мм и B5 190×250 мм, каждый - с мягкой и твердой обложкой.",
          "Канцелярия включает брендированную письменную ручку черного цвета, матовую белую шариковую ручку и деревянный карандаш с тампопечатью.",
        ],
        note: "Для заказа блокнотов с другим дизайном необходимо согласовать макеты с Департаментом визуальных коммуникаций.",
        visual: "notebook",
      },
      {
        id: "paper-bag",
        label: "Пакет",
        page: "38",
        title: "Брендированный пакет с QR-кодом",
        body: ["Пакет производится из плотной бумаги или картона. Вид нанесения - офсет или прямая печать."],
        note: "Для другого дизайна требуется согласование макета с Департаментом визуальных коммуникаций КРДВ.",
        visual: "paper-bag",
      },
      {
        id: "tshirt",
        label: "Футболка",
        page: "39",
        title: "Фирменная футболка для мероприятий",
        body: ["Футболка используется для участия в мероприятиях и поддерживает узнаваемость команды в едином визуальном поле."],
        specs: [
          ["Нанесение", "Прямая цифровая печать на ткани, шелкография, термотрансфер или машинная вышивка."],
        ],
        visual: "tshirt",
      },
      {
        id: "shopper",
        label: "Шоппер",
        page: "40",
        title: "Фирменный шоппер",
        body: ["Шоппер работает как повседневный носитель фирменного стиля и может производиться теми же способами нанесения, что и футболка."],
        specs: [
          ["Нанесение", "Прямая цифровая печать на ткани, шелкография, термотрансфер или машинная вышивка."],
        ],
        visual: "shopper",
      },
      {
        id: "made-in",
        label: "Сделано в ТОР СПВ",
        page: "41-42",
        title: "Брендирование продукции резидентов",
        body: [
          "Товарный знак «Сделано в ТОР СПВ» разработан для поддержки резидентов и дополнительной узнаваемости бренда. Он используется для брендирования продукции, произведенной резидентами, после одобрения заявки.",
          "Версию на английском языке рекомендуется использовать при сотрудничестве с международными резидентами.",
        ],
        note: "Способ нанесения на упаковку согласовывается индивидуально с каждым резидентом. В отдельных случаях допускается адаптация цвета знака под цвет упаковки товара.",
        visual: "made-in",
      },
    ],
  },
  {
    number: "07",
    id: "photostyle",
    title: "Фотостиль",
    heading: "Дальний Восток и Арктика будущего",
    description:
      "Фотостиль задает правила выбора изображений для внешних и внутренних коммуникаций: отраслевые результаты, достижения, живые люди и достоверные территории.",
    items: [
      {
        id: "photo-principles",
        label: "Основные принципы",
        page: "43",
        title: "Фотографии для коммуникаций КРДВ",
        body: [
          "Фотостиль КРДВ отображает Дальний Восток и Арктику будущего. Для выполнения миссии важно подбирать убедительные фотографии отраслевых результатов и достижений, а также живые и эмоционально наполненные фотографии людей.",
          "Рекомендации помогают создавать внешние и внутренние коммуникационные сообщения от имени КРДВ.",
        ],
        visual: "photo-principles",
      },
      {
        id: "photo-story-infrastructure",
        label: "Инфраструктура",
        page: "44",
        title: "Единый прогресс, общие взгляды",
        body: [
          "При выборе материалов для презентаций особое внимание уделяется фотографиям, отражающим ключевые достижения: ледоколы, порты, грузовые суда, спутники, работающие предприятия и проекты резидентов.",
        ],
        visual: "photo-strip-infrastructure",
      },
      {
        id: "photo-story-events",
        label: "Выступления",
        page: "45",
        title: "Выступления и мероприятия",
        body: [
          "КРДВ участвует в культурных, образовательных и деловых мероприятиях. В коммуникациях о событиях важно чаще использовать фотографии с участием людей: заинтересованных, вовлеченных и эмоциональных.",
          "Сложные фактуры, неудачная композиция, затылки на переднем плане и лица не в фокусе снижают читаемость кадра.",
        ],
        visual: "photo-strip-events",
      },
      {
        id: "photo-story-nature",
        label: "Природа",
        page: "46",
        title: "Захватывающая природа",
        body: [
          "Пейзажи и природа должны демонстрировать уникальную красоту и разнообразие регионов Дальнего Востока и Арктики. Это особенно актуально для публикаций о туризме.",
          "Главные принципы - высокое качество изображения и достоверность места, о котором идет речь. Если подходящего изображения нет, рекомендуется использовать графические элементы.",
        ],
        visual: "photo-strip-nature",
      },
      {
        id: "photo-story-people",
        label: "Люди",
        page: "47",
        title: "Люди Дальнего Востока и Арктики",
        body: [
          "Главный принцип съемки людей - запечатление оригинальных аутентичных сюжетов, связанных с их сферой деятельности, культурными обычаями и мероприятиями.",
          "Такие сюжеты помогают создать убедительные эмоциональные образы и показать культурное богатство и многообразие жизни в регионах.",
        ],
        visual: "photo-strip-people",
      },
    ],
  },
  {
    number: "08",
    id: "appendix",
    title: "Приложение",
    heading: "Социальные сети и финальные данные",
    description:
      "Финальный блок фиксирует наличие отдельного гайда для социальных сетей и контактные данные Корпорации.",
    items: [
      {
        id: "social-media",
        label: "Социальные сети",
        page: "48",
        title: "Гайд по оформлению социальных сетей",
        body: ["Для коммуникаций в социальных сетях КРДВ разработан отдельный гайд по оформлению."],
        visual: "social",
      },
      {
        id: "contacts",
        label: "Контакты",
        page: "49",
        title: "АО «Корпорация развития Дальнего Востока и Арктики»",
        body: ["Телефон: 8 (800) 707-55-58. Сайт: erdc.ru. Все права защищены."],
        visual: "contacts",
      },
    ],
  },
];

const allTrackedSections = brandSections.flatMap((section) => [
  section.id,
  ...section.items.map((item) => item.id),
  ...(section.id === "photostyle" ? photoSections.map((item) => item.id) : []),
]);

function Sidebar({ activeId, drawerOpen, onClose, onNavigate }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(brandSections.map((section) => section.number)));

  useEffect(() => {
    const activeGroup = brandSections.find(
      (section) =>
        section.id === activeId ||
        section.items.some((item) => item.id === activeId) ||
        (section.id === "photostyle" && photoSections.some((item) => item.id === activeId)),
    );
    if (!activeGroup) return;
    setOpenGroups((current) => {
      if (current.has(activeGroup.number)) return current;
      const next = new Set(current);
      next.add(activeGroup.number);
      return next;
    });
  }, [activeId]);

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
      <aside className={`sidebar ${drawerOpen ? "is-open" : ""}`} aria-label={t("Навигация по брендбуку")}>
        <div className="brand-block">
          <img className="brand-logo" src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="КРДВ" />
        </div>

        <div className="guide-meta">
          <p>{t("Руководство по фирменному стилю")}</p>
          <p>{t("АО «КРДВ», февраль 2025")}</p>
        </div>

        <nav className="nav-list" aria-label={t("Разделы")}>
          {brandSections.map((group) => {
            const isOpen = openGroups.has(group.number);
            const isActive =
              activeId === group.id ||
              group.items.some((item) => item.id === activeId) ||
              (group.id === "photostyle" && photoSections.some((item) => item.id === activeId));
            return (
              <div className={`nav-group ${isActive ? "is-active" : ""}`} key={group.number}>
                <button className="nav-row" type="button" onClick={() => toggleGroup(group.number)}>
                  <span>{group.number}</span>
                  <span>{t(group.title)}</span>
                  <span className={`chevron ${isOpen ? "is-open" : ""}`} aria-hidden="true" />
                </button>
                <div className={`subnav ${isOpen ? "is-open" : ""}`}>
                  {group.items.map((item) => (
                    <button
                      className={`subnav-link ${activeId === item.id ? "is-current" : ""}`}
                      type="button"
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                    >
                      {t(item.label)}
                    </button>
                  ))}
                  {group.id === "photostyle"
                    ? photoSections.map((item) => (
                        <button
                          className={`subnav-link ${activeId === item.id ? "is-current" : ""}`}
                          type="button"
                          key={item.id}
                          onClick={() => {
                            onNavigate(item.id);
                            onClose();
                          }}
                        >
                          {t(`Галерея: ${item.label}`)}
                        </button>
                      ))
                    : null}
                </div>
              </div>
            );
          })}
        </nav>

        <a className="download-link" href={assetPath("/assets/brand/krdv-logo-horizontal.pdf")} download>
          {t("Скачать логотип")} <span aria-hidden="true">↓</span>
        </a>
      </aside>
    </>
  );
}

function Specs({ specs }) {
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

function Chips({ chips }) {
  if (!chips?.length) return null;
  return (
    <div className="chip-list">
      {chips.map((chip) => (
        <span key={chip}>{t(chip)}</span>
      ))}
    </div>
  );
}

function Palette({ colors }) {
  if (!colors?.length) return null;
  return (
    <div className="palette-grid">
      {colors.map((color) => (
        <article className="color-card" key={color.hex}>
          <div className="swatch" style={{ background: color.hex }} />
          <div>
            <h4>{t(color.name)}</h4>
            <p>{color.hex}</p>
            <p>{t(`RGB: ${color.rgb}`)}</p>
            <p>{t(`CMYK: ${color.cmyk}`)}</p>
            {color.pantone ? <p>{t(`Pantone ${color.pantone}`)}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function MiniLogo({ inverted = false }) {
  return (
    <div className={`mini-logo ${inverted ? "is-inverted" : ""}`}>
      <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="" />
    </div>
  );
}

function PhotoStrip({ section }) {
  return (
    <div className="photo-strip">
      {section.photos.slice(0, 3).map((photo, index) => (
        <figure key={photo.src}>
          <img src={photo.src} alt="" loading={index === 0 ? "eager" : "lazy"} />
          <figcaption>{t(photo.caption)}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function VisualBlock({ type }) {
  switch (type) {
    case "word-cloud":
      return (
        <div className="visual visual-cloud">
          <strong>{t("Ближе к будущему")}</strong>
          <span>{t("инфраструктура")}</span>
          <span>{t("масштаб")}</span>
          <span>{t("карьера")}</span>
          <span>{t("льготы")}</span>
          <span>{t("земля")}</span>
          <span>{t("мечта")}</span>
        </div>
      );
    case "principles":
      return (
        <div className="visual principles-visual">
          {["Качественно", "Просто", "Выгодно", "Надежно"].map((item, index) => (
            <span style={{ "--step": index + 1 }} key={item}>
              {t(item)}
            </span>
          ))}
        </div>
      );
    case "logo-full":
      return (
        <div className="visual logo-canvas">
          <MiniLogo />
          <div className="lotus-note">{t("Неделимый блок: знак + написание")}</div>
        </div>
      );
    case "logo-versions":
      return (
        <div className="visual logo-version-grid">
          <MiniLogo />
          <MiniLogo inverted />
          <div className="vertical-logo">{t("КРДВ")}</div>
          <div className="english-logo">{t("ERDC")}</div>
        </div>
      );
    case "logo-do-dont":
      return (
        <div className="visual do-dont-grid">
          <div className="do-card">
            <b>{t("ДА")}</b>
            <MiniLogo />
          </div>
          <div className="dont-card">
            <b>{t("НЕТ")}</b>
            <div className="broken-mark">{t("Лотос")}</div>
          </div>
        </div>
      );
    case "clearspace":
      return (
        <div className="visual clearspace-canvas">
          <div className="clearspace-box">
            <MiniLogo />
          </div>
          <span>{t("Охранное поле")}</span>
        </div>
      );
    case "backgrounds":
      return (
        <div className="visual background-grid">
          <div><MiniLogo /></div>
          <div><MiniLogo inverted /></div>
          <div className="photo-tone"><MiniLogo /></div>
          <div className="pattern-block">{t("Паттерн нельзя")}</div>
        </div>
      );
    case "logo-errors":
      return (
        <div className="visual error-grid">
          {["Старый знак", "Цвет изменен", "Нет текста", "Искажено", "Другая типографика", "Эффекты"].map((item) => (
            <span key={item}>{t(item)}</span>
          ))}
        </div>
      );
    case "subsidiary-logos":
      return (
        <div className="visual subsidiary-grid">
          <div>{t("Горизонтальная версия ДО")}</div>
          <div>{t("Вертикальная версия ДО")}</div>
          <div>{t("English horizontal")}</div>
          <div>{t("English vertical")}</div>
        </div>
      );
    case "regime-grid":
    case "regime-grid-large":
      return (
        <div className={`visual regime-grid ${type === "regime-grid-large" ? "is-large" : ""}`}>
          {regimes.map((regime) => (
            <div key={regime.label}>
              <b>{t(regime.label)}</b>
              <span>{t(regime.title)}</span>
            </div>
          ))}
        </div>
      );
    case "typography":
      return (
        <div className="visual type-visual">
          <div>
            <p>{t("TT Norms Pro")}</p>
            <strong>{t("Дальний Восток и Арктика")}</strong>
            <span>{t("Regular / Medium / DemiBold / Bold / ExtraBold")}</span>
          </div>
          <div className="tsars-sample">
            <p>{t("TT Tsars")}</p>
            <strong>{t("Почетная грамота")}</strong>
          </div>
        </div>
      );
    case "text-rules":
      return (
        <div className="visual text-rules-visual">
          <p>{t("«Цитата „внутри“ цитаты»")}</p>
          <p>{t("1992–2021 год")}</p>
          <p>{t("100 000 ₽")}</p>
          <p>{t("8 (495) 531-06-44")}</p>
        </div>
      );
    case "business-card":
    case "business-card-qr":
    case "subsidiary-card":
      return (
        <div className="visual business-card-visual">
          <div className="business-card">
            <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="" />
            <strong>{t(type === "subsidiary-card" ? "Название ДО" : "Фамилия Имя")}</strong>
            <span>{t("Должность сотрудника")}</span>
            <p>{t("+7 000 000-00-00")}</p>
            {type === "business-card-qr" ? <div className="qr-mark" /> : null}
          </div>
        </div>
      );
    case "letterhead":
      return (
        <div className="visual letterhead-visual">
          <div className="letterhead-sheet">
            <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="" />
            <span>{t("Наименование, адрес, телефон, e-mail, сайт")}</span>
          </div>
        </div>
      );
    case "leaflets":
      return (
        <div className="visual leaflet-stack">
          {["САР", "КОРФ", "ТОР", "АЗРФ"].map((item) => (
            <div key={item}>{t(item)}</div>
          ))}
        </div>
      );
    case "presswall":
      return (
        <div className="visual presswall-visual">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index}>{t("КРДВ")}</span>
          ))}
        </div>
      );
    case "rollup":
      return (
        <div className="visual rollup-visual">
          <div>
            <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="" />
            <strong>{t("Дальний Восток и Арктика")}</strong>
          </div>
        </div>
      );
    case "door-sign":
      return (
        <div className="visual door-sign-visual">
          <span>{t("Кабинет 302")}</span>
          <strong>{t("Департамент")}</strong>
        </div>
      );
    case "schedule-sign":
      return (
        <div className="visual schedule-visual">
          <strong>{t("Режим работы")}</strong>
          <span>{t("Пн–Пт 09:00–18:00")}</span>
        </div>
      );
    case "award":
      return (
        <div className="visual award-visual">
          <strong>{t("Почетная грамота")}</strong>
          <span>{t("за вклад в развитие территорий")}</span>
        </div>
      );
    case "notebook":
      return (
        <div className="visual merch-visual notebook-visual">
          <div>{t("A5")}</div>
          <div>{t("B5")}</div>
          <span>{t("ручка / карандаш")}</span>
        </div>
      );
    case "paper-bag":
      return (
        <div className="visual merch-visual bag-visual">
          <div>{t("КРДВ")}</div>
          <span>{t("QR")}</span>
        </div>
      );
    case "tshirt":
      return (
        <div className="visual merch-visual tshirt-visual">
          <div>{t("КРДВ")}</div>
        </div>
      );
    case "shopper":
      return (
        <div className="visual merch-visual shopper-visual">
          <div>{t("КРДВ")}</div>
        </div>
      );
    case "made-in":
      return (
        <div className="visual made-in-visual">
          <strong>{t("Сделано в ТОР СПВ")}</strong>
          <span>{t("Made in TOR SPV")}</span>
        </div>
      );
    case "photo-principles":
      return (
        <div className="visual photo-principles-visual">
          <span>{t("Достижения")}</span>
          <span>{t("Люди")}</span>
          <span>{t("Достоверность")}</span>
          <span>{t("Эмоция")}</span>
        </div>
      );
    case "photo-strip-infrastructure":
      return <PhotoStrip section={photoSections[0]} />;
    case "photo-strip-events":
      return <PhotoStrip section={photoSections[1]} />;
    case "photo-strip-nature":
      return <PhotoStrip section={photoSections[2]} />;
    case "photo-strip-people":
      return <PhotoStrip section={photoSections[3]} />;
    case "social":
      return (
        <div className="visual social-visual">
          <div className="post-card">
            <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="" />
            <strong>{t("Социальные сети")}</strong>
            <span>{t("единый гайд оформления")}</span>
          </div>
        </div>
      );
    case "contacts":
      return (
        <div className="visual contacts-visual">
          <strong>{t("erdc.ru")}</strong>
          <span>{t("8 (800) 707-55-58")}</span>
          <small>{t("12/2025")}</small>
        </div>
      );
    default:
      return null;
  }
}

function ContentCard({ item }) {
  return (
    <article className="content-card" id={item.id}>
      <div className="content-card-copy">
        <div className="card-meta">
          <span>{t(`Стр. ${item.page}`)}</span>
          <span>{t(item.label)}</span>
        </div>
        <h3>{t(item.title)}</h3>
        {item.body?.map((paragraph) => (
          <p key={paragraph}>{t(paragraph)}</p>
        ))}
        <Chips chips={item.chips} />
        <Specs specs={item.specs} />
        {item.bullets?.length ? (
          <ul className="bullet-list">
            {item.bullets.map((bullet) => (
              <li key={bullet}>{t(bullet)}</li>
            ))}
          </ul>
        ) : null}
        {item.note ? <p className="note">{t(item.note)}</p> : null}
      </div>
      <div className="content-card-visual">
        <Palette colors={item.palette} />
        <VisualBlock type={item.visual} />
      </div>
    </article>
  );
}

function BrandSection({ section }) {
  return (
    <section className="brand-section" id={section.id}>
      <div className="section-copy">
        <p className="section-number">{section.number}</p>
        <p className="section-eyebrow">{t(section.title)}</p>
        <h2>{t(section.heading)}</h2>
        <p>{t(section.description)}</p>
      </div>
      <div className="section-body">
        {section.items.map((item) => (
          <ContentCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

function ImagePanel({ photo, index }) {
  return (
    <figure className="image-panel">
      <div className="image-frame">
        <img src={photo.src} alt="" loading={index > 1 ? "lazy" : "eager"} />
      </div>
      <figcaption>{t(photo.caption)}</figcaption>
    </figure>
  );
}

function PhotoGallerySection({ section }) {
  return (
    <section className="photo-gallery-section" id={section.id}>
      <div className="section-copy">
        <p className="section-eyebrow">{t(section.label)}</p>
        <h2>{t(section.title)}</h2>
        <p>{t(section.body)}</p>
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
  const [activeId, setActiveId] = useState(brandSections[0].id);

  const trackedIds = useMemo(() => allTrackedSections, []);

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
      const top = target.offsetTop - 22;
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
          aria-label={drawerOpen ? t("Закрыть меню") : t("Открыть меню")}
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
        <section className="hero" id="cover">
          <div className="hero-number">АО</div>
          <div className="hero-copy">
            <img src={assetPath("/assets/brand/krdv-logo-horizontal.png")} alt="КРДВ" />
            <h1>{t("Руководство по использованию фирменного стиля")}</h1>
            <p>{t("АО «КРДВ». Версия для цифрового брендбука, февраль 2025.")}</p>
          </div>
        </section>

        <section className="lead-section">
          <p>{t("Полная интерактивная версия брендбука: позиционирование, логотип, палитра, типографика, базовая графика, деловые носители, рекламные материалы, мерч, фотостиль и приложение.")}</p>
          <div className="contents-grid">
            {contents.map(([label, page]) => (
              <div key={label}>
                <span>{page}</span>
                <strong>{t(label)}</strong>
              </div>
            ))}
          </div>
        </section>

        {brandSections.map((section) => (
          <BrandSection section={section} key={section.id} />
        ))}

        {photoSections.map((section) => (
          <PhotoGallerySection section={section} key={section.id} />
        ))}

        <section className="pager">
          <a href="#cover" onClick={(event) => { event.preventDefault(); handleNavigate("positioning-platform"); }}>
            <span>{t("К началу")}</span>
            <strong>↑</strong>
          </a>
          <a href="#contacts" onClick={(event) => { event.preventDefault(); handleNavigate("contacts"); }}>
            <span>{t("Контакты")}</span>
            <strong>→</strong>
          </a>
        </section>

        <footer className="footer">
          <div>
            <p>{t("Руководство по фирменному стилю")}</p>
            <p>{t("Версия: февраль 2025")}</p>
          </div>
          <div>
            <p>{t("Акционерное общество «Корпорация развития Дальнего Востока и Арктики»")}</p>
            <p>{t("erdc.ru")}</p>
          </div>
          <div>
            <p>{t("Вопросы по фирменному стилю")}</p>
            <p>{t("Департамент визуальных коммуникаций")}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
