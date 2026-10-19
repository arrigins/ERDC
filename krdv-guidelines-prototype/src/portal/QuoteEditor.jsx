import { useEffect, useMemo, useRef, useState } from "react";
import { FRAME, MAX_ZOOM, coverCrop, createTap, decodePhoto, downloadCanvas, moveCrop, zoomCrop } from "./photo.js";
import { DraftBar, clearDraft, useDraft } from "./drafts.jsx";
import { fontRequests, layoutQuote, portraitCircle, renderQuote } from "./quoteTemplate.js";
import { DownloadReasons } from "./CardEditor.jsx";

// Сценарий «Цитата» (ТЗ, раздел 6): портрет в круглой маске, имя, должность, текст цитаты.
// Предпросмотр и экспорт рисуются одной функцией renderQuote — переносы строк совпадают.

const placeholders = {
  name: "Имя Фамилия",
  role: "Должность или подпись об авторе",
  quote: "Текст цитаты в несколько строк — главная мысль, которую важно донести",
};

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

export function QuoteEditor({ onBack, onReset }) {
  const [portrait, setPortrait] = useState(null);
  const [crop, setCrop] = useState(null);
  const [withPortrait, setWithPortrait] = useState(true);
  const [fields, setFields] = useState({ name: "", role: "", quote: "" });
  const [density, setDensity] = useState("normal");
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState(1080);
  const [fontState, setFontState] = useState("loading");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const drag = useRef(null);

  // Фирменный шрифт должен загрузиться до измерения текста; подмена системным недопустима (ТЗ, раздел 9)
  useEffect(() => {
    let alive = true;
    Promise.all(fontRequests.map((font) => document.fonts.load(font)))
      .then(() => {
        if (alive) setFontState(fontRequests.every((font) => document.fonts.check(font)) ? "ready" : "failed");
      })
      .catch(() => alive && setFontState("failed"));
    return () => {
      alive = false;
    };
  }, []);

  const dirty = Boolean(portrait || fields.name || fields.role || fields.quote);

  const snapshot = useMemo(() => ({ withPortrait, fields, density, format, size, crop, photoFile: portrait?.file || null }), [withPortrait, fields, density, format, size, crop, portrait]);
  const draft = useDraft("quote", snapshot, async (d) => {
    if (typeof d.withPortrait === "boolean") setWithPortrait(d.withPortrait);
    if (d.fields) setFields(d.fields);
    if (d.density) setDensity(d.density);
    if (d.format) setFormat(d.format);
    if (d.size) setSize(d.size);
    if (d.photoFile) {
      setPortrait(await decodePhoto(d.photoFile));
      if (d.crop) setCrop(d.crop);
    }
  }, !dirty);
  const resetDraft = async () => {
    await clearDraft("quote");
    onReset?.();
  };
  const tap = useRef(createTap());

  useEffect(() => () => {
    if (portrait) {
      URL.revokeObjectURL(portrait.url);
      portrait.bitmap.close();
    }
  }, [portrait]);

  const showPortrait = withPortrait;
  const data = useMemo(() => quoteData(fields, density, showPortrait, portrait, crop), [fields, density, showPortrait, portrait, crop]);
  const [limit, setLimit] = useState(null);
  const fits = (nextFields, nextDensity) => {
    if (fontState !== "ready") return true;
    const ctx = document.createElement("canvas").getContext("2d");
    return layoutQuote(ctx, quoteData(nextFields, nextDensity, showPortrait, portrait, crop)).issues.length === 0;
  };

  // Раскладка считается на скрытом контексте, чтобы показать проблемы рядом с полями
  const layout = useMemo(() => {
    if (fontState !== "ready") return null;
    const ctx = document.createElement("canvas").getContext("2d");
    return layoutQuote(ctx, data);
  }, [data, fontState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderQuote(ctx, data, layout);
  }, [data, layout]);

  const issues = layout ? layout.issues : [];
  const issueFor = (field) => issues.find((issue) => issue.field === field);

  // Жёсткий предел: лишний текст просто не вводится; удалять можно всегда, вставку в конец обрезаем
  const setField = (key) => (event) => {
    const before = fields[key];
    let after = event.target.value;
    if (after.length > before.length && !fits({ ...fields, [key]: after }, density)) {
      let fitted = before;
      if (after.startsWith(before)) {
        let low = before.length;
        let high = after.length - 1;
        while (low < high) {
          const mid = Math.ceil((low + high) / 2);
          if (fits({ ...fields, [key]: after.slice(0, mid) }, density)) low = mid;
          else high = mid - 1;
        }
        fitted = after.slice(0, low);
      }
      setLimit(key);
      if (fitted === before) return;
      after = fitted;
    } else {
      setLimit(null);
    }
    setFields((current) => ({ ...current, [key]: after }));
    setDone(false);
  };
  const limitNote = (key) =>
    limit === key ? (
      <span className="pp-note pp-limit" role="status">
        {key === "name" ? "Больше не помещается — имя занимает не больше двух строк." : key === "role" ? "Больше не помещается — должность занимает не больше трёх строк." : density === "normal" ? "Больше не помещается. Попробуйте плотный вариант ниже или сократите цитату." : "Больше не помещается — сократите цитату или разделите её на карточки."}
      </span>
    ) : null;

  const openFile = async (file) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const next = await decodePhoto(file);
      setPortrait(next);
      setCrop(coverCrop(next.bitmap.width, next.bitmap.height));
      setWithPortrait(true);
      setDone(false);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };

  // Портрет двигается внутри круга: логические пиксели макета → единицы кадра портрета
  const toLogical = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) * FRAME) / rect.width, y: ((event.clientY - rect.top) * FRAME) / rect.height };
  };
  const cropUnit = FRAME / (portraitCircle.r * 2);
  const inCircle = (point) => Math.hypot(point.x - portraitCircle.cx, point.y - portraitCircle.cy) <= portraitCircle.r;
  const onPointerDown = (event) => {
    if (!showPortrait) return;
    const point = toLogical(event);
    if (!inCircle(point)) return;
    // Пустой круг — клик открывает выбор фото, как кнопка «Выбрать портрет»
    if (!portrait) {
      inputRef.current?.click();
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = point;
    tap.current.down(event);
  };
  const onPointerMove = (event) => {
    tap.current.move(event);
    if (!drag.current) {
      event.currentTarget.style.cursor = showPortrait && !portrait && inCircle(toLogical(event)) ? "pointer" : "";
      return;
    }
    const point = toLogical(event);
    const dx = (point.x - drag.current.x) * cropUnit;
    const dy = (point.y - drag.current.y) * cropUnit;
    drag.current = point;
    setCrop((current) => moveCrop(current, dx, dy));
    setDone(false);
  };
  const onPointerUp = () => {
    // короткое нажатие по портрету без сдвига — заменить фото
    if (drag.current && tap.current.up()) inputRef.current?.click();
    drag.current = null;
  };
  const onKeyDown = (event) => {
    if (!portrait || !showPortrait) return;
    const step = event.shiftKey ? 60 : 20;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[event.key]) {
      event.preventDefault();
      setCrop((current) => moveCrop(current, ...moves[event.key]));
    }
  };
  const setZoom = (zoom) => {
    setCrop((current) => zoomCrop(current, portrait, zoom));
    setDone(false);
  };

  const missing = [!fields.name.trim() && "имя", !cleanText(fields.quote) && "цитату", showPortrait && !portrait && "портрет"].filter(Boolean);
  const blocked = fontState !== "ready" || issues.length > 0 || missing.length > 0;
  const reasons = [
    fontState === "loading" ? "Загружается фирменный шрифт — подождите пару секунд." : null,
    fontState === "failed" ? "Не загрузился фирменный шрифт TT Norms Pro — обновите страницу." : null,
    ...missing.map((field) => (field === "портрет" ? "Загрузите портрет или выберите «Без портрета»." : `Добавьте ${field}.`)),
    ...issues.map((issue) => issue.text),
  ].filter(Boolean);

  const download = async () => {
    if (blocked) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.scale(size / FRAME, size / FRAME);
      ctx.imageSmoothingQuality = "high";
      renderQuote(ctx, data, layout);
      const slug = fields.name.trim().split(/\s+/).pop()?.toLowerCase().replace(/[^a-zа-яё0-9-]/gi, "") || "tsitata";
      await downloadCanvas(canvas, format, `krdv-tsitata-${slug}-${size}.${format}`);
      setDone(true);
    } catch (problem) {
      setError(problem.message || "Не удалось скачать файл. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    onBack();
  };

  const counter = (field, max) => {
    if (!layout) return null;
    const lines = field === "name" ? layout.nameBlock.lines.length : field === "role" ? layout.roleBlock?.lines.length || 0 : layout.quoteLines;
    if (field !== "quote" && !fields[field]) return null;
    if (field === "quote" && !fields.quote) return null;
    return <span className={`pp-counter ${issueFor(field) ? "is-over" : ""}`}>{lines} из {max} строк</span>;
  };

  return (
    <main className="pp-editor">
      <div className="pp-editor-bar">
        <button type="button" className="pp-back" onClick={goBack}>
          <span aria-hidden="true">←</span> Назад
        </button>
        <h1>Цитата</h1>
        <span className={`pp-status ${done ? "is-done" : ""}`} role="status">
          {busy ? "Готовим…" : done ? "Скачано" : ""}
        </span>
      </div>
      <DraftBar draft={draft} onReset={resetDraft} />

      <div className="pp-editor-grid">
        <section className="pp-preview-col" aria-label="Предпросмотр">
          <div className="pp-stage pp-quote-stage">
            <canvas
              ref={canvasRef}
              width={FRAME}
              height={FRAME}
              className={portrait && showPortrait ? "can-drag" : ""}
              tabIndex={portrait && showPortrait ? 0 : -1}
              role="img"
              aria-label={`Предпросмотр цитаты${fields.name ? `: ${fields.name}` : ""}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
            />
            {fontState === "loading" ? <span className="pp-stage-msg">Загружаем фирменный шрифт…</span> : null}
          </div>
          <p className="pp-hint">
            {portrait && showPortrait ? "Перетащите портрет внутри круга, чтобы поправить кадр, или нажмите на него, чтобы заменить. " : ""}
            Блеклый текст в предпросмотре — подсказка, он заменится вашим.
          </p>
        </section>

        <section className="pp-panel" aria-label="Настройки">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => {
              openFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {fontState === "failed" ? (
            <div className="pp-error" role="alert">
              Не загрузился фирменный шрифт TT Norms Pro, поэтому скачать карточку нельзя. Проверьте интернет и обновите страницу — введённый текст сохранится, пока вкладка открыта.
            </div>
          ) : null}
          {error ? (
            <div className="pp-error" role="alert">
              {error}
            </div>
          ) : null}

          <fieldset className="pp-field">
            <legend className="pp-label">1. Портрет</legend>
            <Segment
              name="with-portrait"
              value={showPortrait ? "yes" : "no"}
              options={[
                ["yes", "С портретом"],
                ["no", "Без портрета"],
              ]}
              onChange={(value) => {
                setWithPortrait(value === "yes");
                setDone(false);
              }}
            />
            {showPortrait ? (
              <>
                <button type="button" className="pp-button is-secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
                  {portrait ? "Заменить портрет" : "Выбрать портрет"}
                </button>
                {portrait ? (
                  <div className="pp-zoom">
                    <button type="button" className="pp-icon-button" onClick={() => setZoom(crop.zoom / 1.15)} disabled={crop.zoom <= 1} aria-label="Уменьшить портрет">−</button>
                    <input type="range" min="1" max={MAX_ZOOM} step="0.01" value={crop.zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Масштаб портрета" />
                    <button type="button" className="pp-icon-button" onClick={() => setZoom(crop.zoom * 1.15)} disabled={crop.zoom >= MAX_ZOOM} aria-label="Увеличить портрет">+</button>
                  </div>
                ) : (
                  <span className="pp-note">Лицо крупно и по центру. Кадр можно поправить после загрузки.</span>
                )}
              </>
            ) : (
              <span className="pp-note">Без фотографии имя и цитата поднимаются выше — пустой круг не остаётся.</span>
            )}
          </fieldset>

          <label className="pp-field">
            <span className="pp-label-row">
              <span className="pp-label">2. Имя и фамилия *</span>
              {counter("name", 2)}
            </span>
            <input className="pp-input" value={fields.name} onChange={setField("name")} placeholder={placeholders.name} autoComplete="off" />
            {limitNote("name")}
            {issueFor("name") ? <span className="pp-warning">{issueFor("name").text}</span> : null}
          </label>

          <label className="pp-field">
            <span className="pp-label-row">
              <span className="pp-label">3. Должность</span>
              {counter("role", 3)}
            </span>
            <textarea className="pp-input" rows={2} value={fields.role} onChange={setField("role")} placeholder="Например: компания «Умбатревел», резидент АЗРФ" />
            <span className="pp-note">Необязательно. Можно оставить пустым.</span>
            {limitNote("role")}
            {issueFor("role") ? <span className="pp-warning">{issueFor("role").text}</span> : null}
          </label>

          <label className="pp-field">
            <span className="pp-label-row">
              <span className="pp-label">4. Цитата *</span>
              {counter("quote", 8)}
            </span>
            <textarea className="pp-input" rows={5} value={fields.quote} onChange={setField("quote")} placeholder="Вставьте текст без кавычек — кавычки добавит шаблон" />
            {limitNote("quote")}
            {issueFor("quote") ? (
              <span className="pp-warning">
                {issueFor("quote").text}
                {density === "normal" ? " Или попробуйте плотный вариант ниже." : ""}
              </span>
            ) : null}
          </label>

          <fieldset className="pp-field">
            <legend className="pp-label">5. Вариант</legend>
            <Segment
              name="density"
              value={density}
              options={[
                ["normal", "Обычный"],
                ["dense", "Плотный"],
              ]}
              onChange={(value) => {
                if (!fits(fields, value)) {
                  setLimit("density");
                  return;
                }
                setLimit(null);
                setDensity(value);
                setDone(false);
              }}
            />
            <span className="pp-note">Плотный — для цитаты подлиннее: текст чуть мельче, отступы меньше.</span>
            {limit === "density" ? <span className="pp-note pp-limit" role="status">Цитата не поместится в обычном варианте — сначала сократите её.</span> : null}
          </fieldset>

          <div className="pp-field">
            <span className="pp-label">6. Файл</span>
            <Segment name="quote-format" value={format} options={[["png", "PNG"], ["jpg", "JPG"]]} onChange={setFormat} />
            <Segment name="quote-size" value={size} options={[[1080, "1080 × 1080"], [2160, "2160 × 2160"]]} onChange={setSize} />
          </div>

          <div className="pp-actions">
            <DownloadReasons reasons={blocked ? reasons : []} />
            <span className="pp-button-wrap" title={blocked && reasons.length ? `Скачать пока нельзя. ${reasons.join(" ")}` : undefined}>
              <button type="button" className="pp-button is-primary" onClick={download} disabled={blocked || busy}>
                {busy ? "Готовим файл…" : "Скачать"}
              </button>
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

function quoteData(fields, density, showPortrait, portrait, crop) {
  return {
    name: fields.name || placeholders.name,
    role: fields.role || (fields.name || fields.quote ? "" : placeholders.role),
    quote: fields.quote || placeholders.quote,
    density,
    portrait: showPortrait ? (portrait && crop ? { photo: portrait, crop } : { empty: true }) : null,
    ghost: { name: !fields.name, role: !fields.role, quote: !fields.quote },
  };
}

function cleanText(value) {
  return value.replace(/[«»"„“”'\s]/g, "");
}
