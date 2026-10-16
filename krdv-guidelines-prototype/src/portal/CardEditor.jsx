import { useEffect, useMemo, useRef, useState } from "react";
import { FRAME, decodePhoto, downloadCanvas } from "./photo.js";
import { badgeSources, cardKinds, compositions, directionById, directions, layoutCard, loadCached, renderCard, signSrc } from "./cardTemplate.js";
import { makeZip } from "./zip.js";

// «Новость» (ТЗ, раздел 7) и «Серия карточек» (ТЗ, раздел 8) на общем движке cardTemplate.js.

const fontRequests = ['700 96px "TT Norms Pro"', '400 40px "TT Norms Pro"', '500 30px "TT Norms Pro"'];
const MIN_CARDS = 2;
const MAX_CARDS = 10;

const placeholders = {
  news: { title: "Заголовок новости", subtitle: "Подзаголовок — одно уточнение" },
  cover: { title: "Тема серии", subtitle: "Что узнает читатель" },
  info: { title: "Главная мысль карточки", subtitle: "Первый пункт\nВторой пункт\nТретий пункт" },
  final: { title: "Узнайте больше на сайте КРДВ", subtitle: "" },
};

let nextId = 1;
const newCard = (kind, extra = {}) => ({
  id: `c${nextId++}`,
  kind,
  composition: kind === "news" ? "large" : kind === "cover" ? "text" : null,
  tone: "blue",
  title: "",
  subtitle: "",
  tag: "",
  art: null,
  qr: kind === "final" ? "https://erdc.ru" : "",
  ...extra,
});

function Segment({ name, value, options, onChange }) {
  return (
    <div className="pp-segment">
      {options.map(([optionValue, label]) => (
        <label key={optionValue} className={value === optionValue ? "is-active" : ""}>
          <input type="radio" name={name} value={optionValue} checked={value === optionValue} onChange={() => onChange(optionValue)} />
          {label}
        </label>
      ))}
    </div>
  );
}

// Шрифт и логотипы должны загрузиться до вёрстки; без фирменного шрифта экспорт блокируется (ТЗ, раздел 9)
function useTemplateBase() {
  const [fontState, setFontState] = useState("loading");
  const [badges, setBadges] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    Promise.all(fontRequests.map((font) => document.fonts.load(font)))
      .then(() => alive && setFontState(fontRequests.every((font) => document.fonts.check(font)) ? "ready" : "failed"))
      .catch(() => alive && setFontState("failed"));
    Promise.all([loadCached(badgeSources.badgeWhite), loadCached(badgeSources.badgeBlue)])
      .then(([badgeWhite, badgeBlue]) => alive && setBadges({ badgeWhite, badgeBlue }))
      .catch((problem) => alive && setError(problem.message));
    return () => {
      alive = false;
    };
  }, []);
  return { fontState, badges, error };
}

// Картинки иллюстраций: знак программы из библиотеки или загруженный PNG
function useArtImages(cards, uploads) {
  const [images, setImages] = useState({});
  useEffect(() => {
    let alive = true;
    cards.forEach((card) => {
      if (card.art?.type === "sign" && !images[`sign:${card.art.id}`]) {
        loadCached(signSrc(card.art.id)).then((image) => alive && setImages((current) => ({ ...current, [`sign:${card.art.id}`]: image })));
      }
    });
    return () => {
      alive = false;
    };
  }, [cards]); // eslint-disable-line react-hooks/exhaustive-deps
  return (art) => {
    if (!art) return null;
    if (art.type === "sign") return images[`sign:${art.id}`] || null;
    if (art.type === "upload") return uploads[art.key]?.bitmap || null;
    return null;
  };
}

// Данные для вёрстки: пустые поля в предпросмотре заменяются бледной подсказкой
function withPlaceholders(card) {
  const hint = placeholders[card.kind] || placeholders.news;
  return {
    ...card,
    title: card.title || hint.title,
    subtitle: card.subtitle || (card.kind === "info" || !card.title ? hint.subtitle : ""),
    ghost: { title: !card.title, subtitle: !card.subtitle, tag: false },
    showArtSlot: !card.art && Boolean(card.composition && compositions[card.composition]?.art),
  };
}

function missingFields(card) {
  const missing = [];
  if (!card.title.trim()) missing.push("заголовок");
  if (card.kind === "info" && !card.subtitle.trim()) missing.push("пункты");
  return missing;
}

function CardCanvas({ card, layout, base, artImage, className = "", label }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !layout || !base.badges) return;
    const ctx = canvas.getContext("2d");
    const k = canvas.width / FRAME;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.clearRect(0, 0, FRAME, FRAME);
    renderCard(ctx, card, layout, { ...base.badges, art: artImage });
  });
  const size = className.includes("is-thumb") ? 270 : FRAME;
  return <canvas ref={ref} width={size} height={size} className={className} role="img" aria-label={label} />;
}

async function renderToBlob(card, layout, base, artImage, size, format) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.scale(size / FRAME, size / FRAME);
  ctx.imageSmoothingQuality = "high";
  renderCard(ctx, card, layout, { ...base.badges, art: artImage });
  return canvas;
}

async function hasTransparency(bitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 48;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, 48, 48);
  const data = ctx.getImageData(0, 0, 48, 48).data;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
}

// Поля одной карточки
function CardFields({ card, layout, onChange, uploads, onUpload, artWarning, showTone, direction }) {
  const issueFor = (field) => layout?.issues.find((issue) => issue.field === field);
  const set = (key) => (event) => onChange({ [key]: event.target.value });
  const inputRef = useRef(null);
  const composition = card.composition ? compositions[card.composition] : null;
  const canHaveArt = Boolean(composition?.art);
  const signs = directions.filter((item) => item.sign);

  return (
    <>
      {card.composition ? (
        <fieldset className="pp-field">
          <legend className="pp-label">Композиция</legend>
          <div className="pp-choice">
            {Object.entries(compositions).map(([id, item]) => (
              <label key={id} className={card.composition === id ? "is-active" : ""}>
                <input type="radio" name={`composition-${card.id}`} value={id} checked={card.composition === id} onChange={() => onChange({ composition: id })} />
                <strong>{item.title}</strong>
                <span>{item.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {showTone ? (
        <fieldset className="pp-field">
          <legend className="pp-label">Фон</legend>
          <Segment name={`tone-${card.id}`} value={card.tone} options={[["blue", "Синий"], ["milk", "Бежевый"]]} onChange={(value) => onChange({ tone: value })} />
        </fieldset>
      ) : null}

      <label className="pp-field">
        <span className="pp-label">{card.kind === "final" ? "Призыв *" : "Заголовок *"}</span>
        <textarea className="pp-input" rows={2} value={card.title} onChange={set("title")} placeholder={placeholders[card.kind]?.title} />
        {issueFor("title") ? <span className="pp-warning">{issueFor("title").text}</span> : null}
      </label>

      {card.kind !== "final" ? (
        <label className="pp-field">
          <span className="pp-label">{card.kind === "info" ? "Пункты *" : "Подзаголовок"}</span>
          <textarea
            className="pp-input"
            rows={card.kind === "info" ? 5 : 2}
            value={card.subtitle}
            onChange={set("subtitle")}
            placeholder={card.kind === "info" ? "Каждый пункт с новой строки" : "Необязательно"}
          />
          {issueFor("subtitle") ? <span className="pp-warning">{issueFor("subtitle").text}</span> : null}
        </label>
      ) : null}

      {card.kind !== "final" ? (
        <label className="pp-field">
          <span className="pp-label">Метка</span>
          <input className="pp-input" value={card.tag} onChange={set("tag")} placeholder="Например: действует 20 лет" maxLength={48} />
          <span className="pp-note">
            Необязательно. Дата, условие или действие на плашке цвета {direction.id === "none" ? "фирменного красного" : `направления «${direction.title}»`}.
          </span>
          {issueFor("tag") ? <span className="pp-warning">{issueFor("tag").text}</span> : null}
        </label>
      ) : null}

      {canHaveArt ? (
        <fieldset className="pp-field">
          <legend className="pp-label">Иллюстрация{composition.art.required ? " *" : ""}</legend>
          <div className="pp-library">
            <button type="button" className={`pp-library-item ${!card.art ? "is-active" : ""}`} onClick={() => onChange({ art: null })}>
              <span className="pp-library-empty">Нет</span>
            </button>
            {signs.map((item) => (
              <button
                type="button"
                key={item.sign}
                className={`pp-library-item ${card.art?.type === "sign" && card.art.id === item.sign ? "is-active" : ""}`}
                onClick={() => onChange({ art: { type: "sign", id: item.sign } })}
                aria-label={`Знак ${item.title}`}
              >
                <img src={signSrc(item.sign)} alt="" />
                <span>{item.title}</span>
              </button>
            ))}
            {Object.entries(uploads).map(([key, upload]) => (
              <button
                type="button"
                key={key}
                className={`pp-library-item ${card.art?.type === "upload" && card.art.key === key ? "is-active" : ""}`}
                onClick={() => onChange({ art: { type: "upload", key } })}
                aria-label={`Иллюстрация ${upload.name}`}
              >
                <img src={upload.url} alt="" />
                <span>{upload.name}</span>
              </button>
            ))}
          </div>
          <button type="button" className="pp-button is-secondary" onClick={() => inputRef.current?.click()}>
            Загрузить PNG для проверки
          </button>
          <span className="pp-note">
            Утверждённую библиотеку иллюстраций наполнит дизайн-команда. Пока доступны знаки программ и своя картинка для проверки — PNG с прозрачным фоном.
          </span>
          {artWarning ? <span className="pp-warning">{artWarning}</span> : null}
          {issueFor("art") ? <span className="pp-warning">{issueFor("art").text}</span> : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/webp"
            hidden
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onUpload(file);
            }}
          />
        </fieldset>
      ) : null}

      {card.kind === "final" ? (
        <fieldset className="pp-field">
          <legend className="pp-label">QR-код</legend>
          <Segment name={`qr-${card.id}`} value={card.qr === null ? "off" : "on"} options={[["on", "С QR-кодом"], ["off", "Без QR-кода"]]} onChange={(value) => onChange({ qr: value === "on" ? "https://erdc.ru" : null })} />
          {card.qr !== null ? (
            <>
              <input className="pp-input" value={card.qr} onChange={set("qr")} placeholder="https://erdc.ru" inputMode="url" />
              <span className="pp-note">Только адрес, начинающийся с https://. После скачивания проверьте QR-код камерой телефона.</span>
            </>
          ) : null}
          {issueFor("qr") ? <span className="pp-warning">{issueFor("qr").text}</span> : null}
        </fieldset>
      ) : null}

      {issueFor("layout") ? <span className="pp-warning">{issueFor("layout").text}</span> : null}
    </>
  );
}

function useUploads(setError) {
  const [uploads, setUploads] = useState({});
  const [artWarning, setArtWarning] = useState("");
  const add = async (file) => {
    setError("");
    setArtWarning("");
    try {
      const photo = await decodePhoto(file);
      if (!(await hasTransparency(photo.bitmap))) setArtWarning("У картинки нет прозрачного фона — вокруг иллюстрации будет видна подложка. Для библиотеки нужен PNG с прозрачностью.");
      const key = `u${Date.now()}`;
      setUploads((current) => ({ ...current, [key]: photo }));
      return key;
    } catch (problem) {
      setError(problem.message);
      return null;
    }
  };
  return { uploads, add, artWarning };
}

function useLeaveWarning(active) {
  useEffect(() => {
    if (!active) return undefined;
    const onLeave = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [active]);
}

function EditorBar({ title, status, onBack }) {
  return (
    <div className="pp-editor-bar">
      <button type="button" className="pp-back" onClick={onBack}>
        <span aria-hidden="true">←</span> Назад
      </button>
      <h1>{title}</h1>
      <span className={`pp-status ${status === "Скачано" ? "is-done" : ""}`} role="status">
        {status}
      </span>
    </div>
  );
}

function ExportFields({ format, setFormat, size, setSize, name }) {
  return (
    <div className="pp-field">
      <span className="pp-label">Файл</span>
      <Segment name={`${name}-format`} value={format} options={[["png", "PNG"], ["jpg", "JPG"]]} onChange={setFormat} />
      <Segment name={`${name}-size`} value={size} options={[[1080, "1080 × 1080"], [2160, "2160 × 2160"]]} onChange={setSize} />
    </div>
  );
}

const measureCtx = () => document.createElement("canvas").getContext("2d");

export function NewsEditor({ onBack }) {
  const base = useTemplateBase();
  const [card, setCard] = useState(() => newCard("news"));
  const [direction, setDirection] = useState("none");
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState(1080);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const { uploads, add, artWarning } = useUploads(setError);
  const artOf = useArtImages([card], uploads);

  const dirty = Boolean(card.title || card.subtitle || card.tag || card.art);
  useLeaveWarning(dirty && !done);

  const data = useMemo(() => ({ ...withPlaceholders(card), direction }), [card, direction]);
  const layout = useMemo(() => (base.fontState === "ready" ? layoutCard(measureCtx(), data) : null), [data, base.fontState]);
  const realLayout = useMemo(() => (base.fontState === "ready" ? layoutCard(measureCtx(), { ...card, direction }) : null), [card, direction, base.fontState]);

  const change = (patch) => {
    setCard((current) => ({ ...current, ...patch }));
    setDone(false);
  };
  const missing = missingFields(card);
  const issues = realLayout ? realLayout.issues : [];
  const blocked = base.fontState !== "ready" || !base.badges || missing.length > 0 || issues.length > 0;

  const download = async () => {
    if (blocked) return;
    setBusy(true);
    setError("");
    try {
      const canvas = await renderToBlob({ ...card, direction }, realLayout, base, artOf(card.art), size, format);
      await downloadCanvas(canvas, format, `krdv-novost-${size}.${format}`);
      setDone(true);
    } catch (problem) {
      setError(problem.message || "Не удалось скачать файл. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (dirty && !done && !window.confirm("Результат ещё не скачан. Выйти без сохранения?")) return;
    onBack();
  };

  return (
    <main className="pp-editor">
      <EditorBar title="Новость" status={busy ? "Готовим…" : done ? "Скачано" : dirty ? "Не скачано" : ""} onBack={goBack} />
      <div className="pp-editor-grid">
        <section className="pp-preview-col" aria-label="Предпросмотр">
          <div className="pp-stage pp-quote-stage">
            <CardCanvas card={data} layout={layout} base={base} artImage={artOf(card.art)} label={`Предпросмотр новости${card.title ? `: ${card.title}` : ""}`} />
            {base.fontState === "loading" ? <span className="pp-stage-msg">Загружаем фирменный шрифт…</span> : null}
          </div>
          <p className="pp-hint">Блеклый текст в предпросмотре — подсказка, он заменится вашим.</p>
        </section>
        <section className="pp-panel" aria-label="Настройки">
          {base.fontState === "failed" ? <div className="pp-error" role="alert">Не загрузился фирменный шрифт TT Norms Pro, поэтому скачать карточку нельзя. Проверьте интернет и обновите страницу.</div> : null}
          {error || base.error ? <div className="pp-error" role="alert">{error || base.error}</div> : null}
          <fieldset className="pp-field">
            <legend className="pp-label">Направление</legend>
            <select className="pp-input" value={direction} onChange={(event) => { setDirection(event.target.value); setDone(false); }}>
              {directions.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
            <span className="pp-note">Название направления появится на карточке, его цвет — у метки.</span>
          </fieldset>
          <CardFields
            card={card}
            layout={realLayout}
            onChange={change}
            uploads={uploads}
            onUpload={async (file) => {
              const key = await add(file);
              if (key) change({ art: { type: "upload", key } });
            }}
            artWarning={artWarning}
            showTone
            direction={directionById(direction)}
          />
          <ExportFields format={format} setFormat={setFormat} size={size} setSize={setSize} name="news" />
          <div className="pp-actions">
            {missing.length && base.fontState === "ready" ? <p className="pp-note pp-missing">Чтобы скачать, добавьте {missing.join(", ")}.</p> : null}
            <button type="button" className="pp-button is-primary" onClick={download} disabled={blocked || busy}>
              {busy ? "Готовим файл…" : "Скачать"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

const rhythms = {
  alternate: { title: "Синий и бежевый по очереди", tone: (index) => (index % 2 === 0 ? "blue" : "milk") },
  cover: { title: "Синяя обложка, остальные бежевые", tone: (index) => (index === 0 ? "blue" : "milk") },
  blue: { title: "Все синие", tone: () => "blue" },
};

export function SeriesEditor({ onBack }) {
  const base = useTemplateBase();
  const [cards, setCards] = useState(() => [newCard("cover"), newCard("info"), newCard("final")]);
  const [selected, setSelected] = useState(0);
  const [direction, setDirection] = useState("korf");
  const [rhythm, setRhythm] = useState("alternate");
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState(1080);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(null);
  const { uploads, add, artWarning } = useUploads(setError);
  const artOf = useArtImages(cards, uploads);

  const dirty = cards.some((card) => card.title || card.subtitle || card.tag || card.art);
  useLeaveWarning(dirty && !done);

  const prepared = useMemo(
    () =>
      cards.map((card, index) => {
        const real = { ...card, direction, tone: rhythms[rhythm].tone(index, cards.length) };
        return { real, preview: withPlaceholders(real) };
      }),
    [cards, direction, rhythm],
  );
  const layouts = useMemo(() => {
    if (base.fontState !== "ready") return null;
    const ctx = measureCtx();
    return prepared.map(({ real, preview }) => ({ real: layoutCard(ctx, real), preview: layoutCard(ctx, preview) }));
  }, [prepared, base.fontState]);

  const current = cards[selected] || cards[0];
  const change = (patch) => {
    setCards((list) => list.map((card, index) => (index === selected ? { ...card, ...patch } : card)));
    setDone(false);
  };

  const addCard = (kind) => {
    if (cards.length >= MAX_CARDS) return;
    const at = Math.min(selected + 1, cards.length - (cards[cards.length - 1].kind === "final" ? 1 : 0));
    setCards((list) => [...list.slice(0, at), newCard(kind), ...list.slice(at)]);
    setSelected(at);
    setDone(false);
  };
  const duplicate = () => {
    if (cards.length >= MAX_CARDS) return;
    setCards((list) => [...list.slice(0, selected + 1), { ...list[selected], id: `c${nextId++}` }, ...list.slice(selected + 1)]);
    setSelected(selected + 1);
    setDone(false);
  };
  const remove = () => {
    if (cards.length <= MIN_CARDS) return;
    setRemoved({ card: cards[selected], index: selected });
    setCards((list) => list.filter((_, index) => index !== selected));
    setSelected(Math.max(0, selected - 1));
    setDone(false);
  };
  const undo = () => {
    if (!removed) return;
    setCards((list) => [...list.slice(0, removed.index), removed.card, ...list.slice(removed.index)]);
    setSelected(removed.index);
    setRemoved(null);
  };
  const move = (delta) => {
    const target = selected + delta;
    if (target < 0 || target >= cards.length) return;
    setCards((list) => {
      const next = [...list];
      [next[selected], next[target]] = [next[target], next[selected]];
      return next;
    });
    setSelected(target);
    setDone(false);
  };

  const problems = layouts
    ? prepared.flatMap(({ real }, index) => [
        ...missingFields(real).map((field) => `Карточка ${index + 1}: добавьте ${field}.`),
        ...layouts[index].real.issues.map((issue) => `Карточка ${index + 1}: ${issue.text}`),
      ])
    : [];
  const blocked = base.fontState !== "ready" || !base.badges || problems.length > 0;

  // Все карточки по порядку в ZIP; при любой ошибке архив не создаётся (ТЗ, раздел 8)
  const download = async () => {
    if (blocked) return;
    setBusy(true);
    setError("");
    try {
      const slug = direction === "none" ? "seriya" : direction;
      const ext = format === "jpg" ? "jpg" : "png";
      const files = [];
      for (let index = 0; index < prepared.length; index += 1) {
        const { real } = prepared[index];
        const canvas = await renderToBlob(real, layouts[index].real, base, artOf(real.art), size, format);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, format === "jpg" ? "image/jpeg" : "image/png", 0.92));
        if (!blob) throw new Error(`Не удалось подготовить карточку ${index + 1}. Архив не создан — попробуйте ещё раз.`);
        files.push({ name: `krdv-${slug}-${String(index + 1).padStart(2, "0")}-${size}.${ext}`, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      const zip = makeZip(files);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zip);
      link.download = `krdv-${slug}-${files.length}-kartochek-${size}.zip`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      setDone(true);
    } catch (problem) {
      setError(problem.message || "Не удалось собрать архив. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (dirty && !done && !window.confirm("Результат ещё не скачан. Выйти без сохранения?")) return;
    onBack();
  };

  const selectedPrepared = prepared[selected] || prepared[0];
  const selectedLayout = layouts?.[selected];

  return (
    <main className="pp-editor">
      <EditorBar title="Серия карточек" status={busy ? "Готовим…" : done ? "Скачано" : dirty ? "Не скачано" : ""} onBack={goBack} />

      <div className="pp-series-strip" role="listbox" aria-label="Карточки серии">
        {prepared.map(({ preview }, index) => (
          <button
            type="button"
            key={cards[index].id}
            role="option"
            aria-selected={index === selected}
            className={`pp-series-thumb ${index === selected ? "is-active" : ""} ${layouts && (layouts[index].real.issues.length || missingFields(prepared[index].real).length) ? "has-issue" : ""}`}
            onClick={() => setSelected(index)}
          >
            <CardCanvas card={preview} layout={layouts?.[index].preview} base={base} artImage={artOf(cards[index].art)} className="is-thumb" label={`Карточка ${index + 1}`} />
            <span>
              {index + 1}. {cardKinds[cards[index].kind].title}
            </span>
          </button>
        ))}
      </div>

      <div className="pp-editor-grid">
        <section className="pp-preview-col" aria-label="Предпросмотр карточки">
          <div className="pp-stage pp-quote-stage">
            <CardCanvas card={selectedPrepared.preview} layout={selectedLayout?.preview} base={base} artImage={artOf(current.art)} label={`Карточка ${selected + 1}`} />
            {base.fontState === "loading" ? <span className="pp-stage-msg">Загружаем фирменный шрифт…</span> : null}
          </div>
          <div className="pp-card-tools">
            <button type="button" className="pp-button is-secondary" onClick={() => move(-1)} disabled={selected === 0} aria-label="Переместить левее">←</button>
            <button type="button" className="pp-button is-secondary" onClick={() => move(1)} disabled={selected === cards.length - 1} aria-label="Переместить правее">→</button>
            <button type="button" className="pp-button is-secondary" onClick={duplicate} disabled={cards.length >= MAX_CARDS}>Дублировать</button>
            <button type="button" className="pp-button is-secondary" onClick={remove} disabled={cards.length <= MIN_CARDS}>Удалить</button>
          </div>
          {removed ? (
            <div className="pp-undo" role="status">
              Карточка удалена.
              <button type="button" className="pp-button is-text" onClick={undo}>Вернуть</button>
            </div>
          ) : null}
          <div className="pp-card-add">
            <span className="pp-note">Добавить после текущей ({cards.length} из {MAX_CARDS}):</span>
            <button type="button" className="pp-button is-secondary" onClick={() => addCard("info")} disabled={cards.length >= MAX_CARDS}>+ Информационная</button>
            <button type="button" className="pp-button is-secondary" onClick={() => addCard("final")} disabled={cards.length >= MAX_CARDS}>+ Завершающая</button>
          </div>
        </section>

        <section className="pp-panel" aria-label="Настройки">
          {base.fontState === "failed" ? <div className="pp-error" role="alert">Не загрузился фирменный шрифт TT Norms Pro, поэтому скачать карточки нельзя. Проверьте интернет и обновите страницу.</div> : null}
          {error || base.error ? <div className="pp-error" role="alert">{error || base.error}</div> : null}

          <fieldset className="pp-field">
            <legend className="pp-label">Вся серия</legend>
            <select className="pp-input" value={direction} onChange={(event) => { setDirection(event.target.value); setDone(false); }} aria-label="Направление">
              {directions.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
            <select className="pp-input" value={rhythm} onChange={(event) => { setRhythm(event.target.value); setDone(false); }} aria-label="Ритм фонов">
              {Object.entries(rhythms).map(([id, item]) => (
                <option key={id} value={id}>{item.title}</option>
              ))}
            </select>
            <span className="pp-note">Направление и ритм фонов общие для всех карточек. Цвет направления — у меток, название — на каждой карточке.</span>
          </fieldset>

          <h2 className="pp-panel-title">
            Карточка {selected + 1} · {cardKinds[current.kind].title}
          </h2>
          <CardFields
            key={current.id}
            card={current}
            layout={selectedLayout?.real}
            onChange={change}
            uploads={uploads}
            onUpload={async (file) => {
              const key = await add(file);
              if (key) change({ art: { type: "upload", key } });
            }}
            artWarning={artWarning}
            showTone={false}
            direction={directionById(direction)}
          />

          <ExportFields format={format} setFormat={setFormat} size={size} setSize={setSize} name="series" />
          <div className="pp-actions">
            {problems.length && base.fontState === "ready" ? (
              <ul className="pp-problems">
                {problems.slice(0, 4).map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
                {problems.length > 4 ? <li>И ещё {problems.length - 4}.</li> : null}
              </ul>
            ) : null}
            <button type="button" className="pp-button is-primary" onClick={download} disabled={blocked || busy}>
              {busy ? "Собираем архив…" : `Скачать ${cards.length} карточ${cards.length < 5 ? "ки" : "ек"} (ZIP)`}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
