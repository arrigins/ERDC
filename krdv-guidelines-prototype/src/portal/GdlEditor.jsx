import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/700.css";
import { FRAME, MAX_ZOOM, asset, clamp, createTap, decodePhoto, downloadCanvas, loadImage } from "./photo.js";
import { DraftBar, clearDraft, useDraft } from "./drafts.jsx";
import { circleSchemes, gdlFontRequests, layoutGdl, photoBox, photoRect, plateSchemes, renderGdl } from "./gdlTemplate.js";
import { DownloadReasons } from "./CardEditor.jsx";

// Квадратный пост в фирменном стиле проекта «Государство для людей» — для тех случаев,
// когда КРДВ публикует материалы проекта. Две композиции из логобука: «Круг» и «Плашки».

const placeholders = {
  circle: { title: "Набор с описанием содержания поста или любой другой информации в несколько строк", tag: "Тема поста", step: "Шаг 1" },
  plates: { title: "Заголовок поста в несколько строк о главном", tag: "", step: "" },
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

const startCrop = { zoom: 1, cx: 0.5, cy: 0.42 };

export function GdlEditor({ onBack, onReset }) {
  const [layoutId, setLayoutId] = useState("circle");
  const [split, setSplit] = useState("photo");
  const [scheme, setScheme] = useState({ circle: "blue", plates: "aqua" });
  const [logo, setLogo] = useState("sign");
  const [photo, setPhoto] = useState(null);
  const [crop, setCrop] = useState(startCrop);
  const [fields, setFields] = useState({ title: "", tag: "", step: "" });
  const [withStep, setWithStep] = useState(true);
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState(1080);
  const [fontState, setFontState] = useState("loading");
  const [images, setImages] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [limit, setLimit] = useState(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    let alive = true;
    // Montserrat разбит по алфавитам: грузим кириллицу явно, иначе холст возьмёт запасной шрифт
    const sample = "Государство для людей — Шаг 1, ёЁ 2024";
    Promise.all(gdlFontRequests.map((item) => document.fonts.load(item, sample)))
      .then(() => alive && setFontState(gdlFontRequests.every((item) => document.fonts.check(item, sample)) ? "ready" : "failed"))
      .catch(() => alive && setFontState("failed"));
    Promise.all([loadImage(asset("assets/portal/gdl/gdl-sign-white.png")), loadImage(asset("assets/portal/gdl/gdl-logo-white.png"))])
      .then(([sign, full]) => alive && setImages({ sign, full }))
      .catch((problem) => alive && setError(problem.message));
    return () => {
      alive = false;
    };
  }, []);

  const dirty = Boolean(photo || fields.title || fields.tag || fields.step);

  const snapshot = useMemo(() => ({ layoutId, split, scheme, logo, fields, withStep, format, size, crop, photoFile: photo?.file || null }), [layoutId, split, scheme, logo, fields, withStep, format, size, crop, photo]);
  const draft = useDraft("gdl-bb", snapshot, async (d) => {
    if (d.layoutId) setLayoutId(d.layoutId);
    if (d.split) setSplit(d.split);
    if (d.scheme) setScheme(d.scheme);
    if (d.logo) setLogo(d.logo);
    if (d.fields) setFields(d.fields);
    if (typeof d.withStep === "boolean") setWithStep(d.withStep);
    if (d.format) setFormat(d.format);
    if (d.size) setSize(d.size);
    if (d.photoFile) {
      setPhoto(await decodePhoto(d.photoFile));
      if (d.crop) setCrop(d.crop);
    }
  }, !dirty);
  const resetDraft = async () => {
    await clearDraft("gdl-bb");
    onReset?.();
  };
  const tap = useRef(createTap());

  useEffect(() => () => {
    if (photo) {
      URL.revokeObjectURL(photo.url);
      photo.bitmap.close();
    }
  }, [photo]);

  const makeData = (nextFields = fields, nextLayout = layoutId, nextSplit = split) => {
    const ph = placeholders[nextLayout];
    const any = nextFields.title || nextFields.tag || nextFields.step;
    return {
      layout: nextLayout,
      split: nextSplit,
      scheme: scheme[nextLayout],
      logo,
      title: nextFields.title || ph.title,
      tag: nextLayout === "circle" ? nextFields.tag || (any ? "" : ph.tag) : "",
      step: nextLayout === "circle" && withStep ? nextFields.step || ph.step : "",
      photo,
      crop,
      ghost: { title: !nextFields.title, tag: !nextFields.tag, step: !nextFields.step },
    };
  };
  const data = useMemo(() => makeData(), [fields, layoutId, split, scheme, logo, photo, crop, withStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const measure = (value) => {
    const ctx = document.createElement("canvas").getContext("2d");
    return layoutGdl(ctx, value);
  };
  const layout = useMemo(() => (fontState === "ready" ? measure(data) : null), [data, fontState]); // eslint-disable-line react-hooks/exhaustive-deps
  const fits = (nextFields, nextLayout = layoutId, nextSplit = split) => fontState !== "ready" || measure(makeData(nextFields, nextLayout, nextSplit)).issues.length === 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderGdl(ctx, data, layout, images);
  }, [data, layout, images]);

  const issues = layout ? layout.issues : [];
  const issueFor = (field) => issues.find((issue) => issue.field === field);

  // Жёсткий предел, как в «Новости» и «Цитате»: лишний текст не вводится
  const setField = (key) => (event) => {
    const before = fields[key];
    let after = event.target.value;
    if (after.length > before.length && !fits({ ...fields, [key]: after })) {
      let fitted = before;
      if (after.startsWith(before)) {
        let low = before.length;
        let high = after.length - 1;
        while (low < high) {
          const mid = Math.ceil((low + high) / 2);
          if (fits({ ...fields, [key]: after.slice(0, mid) })) low = mid;
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
  const limitNote = (key, text) => (limit === key ? <span className="pp-note pp-limit" role="status">{text}</span> : null);

  const openFile = async (file) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const next = await decodePhoto(file);
      setPhoto(next);
      setCrop(startCrop);
      setDone(false);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };

  // Кадр двигается перетаскиванием внутри круга или фото-плашки
  const toLogical = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) * FRAME) / rect.width, y: ((event.clientY - rect.top) * FRAME) / rect.height };
  };
  const box = photoBox(data);
  const insideBox = (point) => (box.shape === "circle" ? Math.hypot(point.x - box.cx, point.y - box.cy) <= box.r : point.y <= box.h);
  const shift = (dx, dy) => {
    if (!photo) return;
    setCrop((current) => {
      const rect = photoRect(photo, current, box);
      return { ...current, cx: clamp(current.cx - dx / rect.w, 0, 1), cy: clamp(current.cy - dy / rect.h, 0, 1) };
    });
    setDone(false);
  };
  const onPointerDown = (event) => {
    const point = toLogical(event);
    if (!insideBox(point)) return;
    // Пустая область фото — клик открывает выбор фото, как кнопка «Выбрать фото»
    if (!photo) {
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
      event.currentTarget.style.cursor = !photo && insideBox(toLogical(event)) ? "pointer" : "";
      return;
    }
    const point = toLogical(event);
    shift(point.x - drag.current.x, point.y - drag.current.y);
    drag.current = point;
  };
  const onPointerUp = () => {
    if (drag.current && tap.current.up()) inputRef.current?.click();
    drag.current = null;
  };
  const onKeyDown = (event) => {
    const stepPx = event.shiftKey ? 60 : 20;
    const moves = { ArrowLeft: [stepPx, 0], ArrowRight: [-stepPx, 0], ArrowUp: [0, stepPx], ArrowDown: [0, -stepPx] };
    if (photo && moves[event.key]) {
      event.preventDefault();
      shift(...moves[event.key]);
    }
  };
  // При смене масштаба центр кадра сохраняется
  const setZoom = (zoom) => {
    setCrop((current) => ({ ...current, zoom: clamp(zoom, 1, MAX_ZOOM) }));
    setDone(false);
  };

  const switchLayout = (next) => {
    if (!fits(fields, next)) {
      setLimit("layout");
      return;
    }
    setLimit(null);
    setLayoutId(next);
    setDone(false);
  };
  const switchSplit = (next) => {
    if (!fits(fields, layoutId, next)) {
      setLimit("split");
      return;
    }
    setLimit(null);
    setSplit(next);
    setDone(false);
  };

  const missing = [!photo && "фото", !fields.title.trim() && "текст"].filter(Boolean);
  const blocked = fontState !== "ready" || !images.full || issues.length > 0 || missing.length > 0;
  const reasons = [
    fontState === "loading" ? "Загружается шрифт Montserrat — подождите пару секунд." : null,
    fontState === "failed" ? "Не загрузился шрифт Montserrat — обновите страницу." : null,
    !photo ? "Загрузите фотографию." : null,
    !fields.title.trim() ? (layoutId === "circle" ? "Добавьте текст поста." : "Добавьте заголовок.") : null,
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
      renderGdl(ctx, { ...data, ghost: {} }, layout, images);
      await downloadCanvas(canvas, format, `gdl-post-${layoutId === "circle" ? "krug" : "plashki"}-${size}.${format}`);
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

  const schemes = layoutId === "circle" ? circleSchemes : plateSchemes;
  let n = 0;
  const num = () => `${(n += 1)}. `;

  return (
    <main className="pp-editor">
      <div className="pp-editor-bar">
        <button type="button" className="pp-back" onClick={goBack}>
          <span aria-hidden="true">←</span> Назад
        </button>
        <h1>«Государство для людей»</h1>
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
              className={photo ? "can-drag" : ""}
              tabIndex={photo ? 0 : -1}
              role="img"
              aria-label="Предпросмотр поста «Государство для людей»"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
            />
            {fontState === "loading" ? <span className="pp-stage-msg">Загружаем шрифт…</span> : null}
          </div>
          <p className="pp-hint">
            {photo ? "Перетащите фото, чтобы поправить кадр. " : ""}
            Пост в стиле проекта «Государство для людей» — по их логобуку: основные цвета, плашки и круги, шрифт Montserrat.
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
          {error ? (
            <div className="pp-error" role="alert">
              {error}
            </div>
          ) : null}

          <fieldset className="pp-field">
            <legend className="pp-label">{num()}Композиция</legend>
            <Segment name="gdl-layout" value={layoutId} options={[["circle", "Круг"], ["plates", "Плашки"]]} onChange={switchLayout} />
            <span className="pp-note">
              {layoutId === "circle" ? "Фото в круге, тема сверху и подпись снизу — как в примере поста из логобука." : "Фото в верхней плашке, заголовок и логотип на нижней. Скругление справа — 2 отступа."}
            </span>
            {limit === "layout" ? <span className="pp-note pp-limit" role="status">Текст не поместится в эту композицию — сначала сократите его.</span> : null}
          </fieldset>

          <fieldset className="pp-field">
            <legend className="pp-label">{num()}Цвет</legend>
            <Segment
              name="gdl-scheme"
              value={scheme[layoutId]}
              options={Object.entries(schemes).map(([id, item]) => [id, item.title])}
              onChange={(value) => {
                setScheme((current) => ({ ...current, [layoutId]: value }));
                setDone(false);
              }}
            />
          </fieldset>

          <fieldset className="pp-field">
            <legend className="pp-label">{num()}Фотография</legend>
            <button type="button" className="pp-button is-secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
              {photo ? "Заменить фото" : "Выбрать фото"}
            </button>
            {photo ? (
              <div className="pp-zoom">
                <button type="button" className="pp-icon-button" onClick={() => setZoom(crop.zoom / 1.15)} disabled={crop.zoom <= 1} aria-label="Уменьшить">−</button>
                <input type="range" min="1" max={MAX_ZOOM} step="0.01" value={crop.zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Масштаб фото" />
                <button type="button" className="pp-icon-button" onClick={() => setZoom(crop.zoom * 1.15)} disabled={crop.zoom >= MAX_ZOOM} aria-label="Увеличить">+</button>
              </div>
            ) : (
              <span className="pp-note">Лучше всего — человек крупно, на спокойном фоне. В контейнер нельзя ставить паттерны и сложную графику.</span>
            )}
            {layoutId === "plates" ? (
              <>
                <Segment name="gdl-split" value={split} options={[["photo", "Фото крупнее"], ["text", "Больше текста"]]} onChange={switchSplit} />
                {limit === "split" ? <span className="pp-note pp-limit" role="status">Заголовок не поместится — сначала сократите его.</span> : null}
              </>
            ) : null}
          </fieldset>

          {layoutId === "circle" ? (
            <>
              <label className="pp-field">
                <span className="pp-label">{num()}Тема</span>
                <input className="pp-input" value={fields.tag} onChange={setField("tag")} placeholder="Например: Тема карусели постов" autoComplete="off" />
                <span className="pp-note">Необязательно. Справа сверху, до двух строк.</span>
                {limitNote("tag", "Больше не помещается — тема занимает не больше двух строк.")}
              </label>
              <fieldset className="pp-field">
                <legend className="pp-label">{num()}Надпись в белом круге</legend>
                <Segment name="gdl-step" value={withStep ? "yes" : "no"} options={[["yes", "С кругом"], ["no", "Без круга"]]} onChange={(value) => { setWithStep(value === "yes"); setDone(false); }} />
                {withStep ? <input className="pp-input" value={fields.step} onChange={setField("step")} placeholder="Например: Шаг 1" autoComplete="off" /> : null}
                {limitNote("step", "Больше не помещается — одно-два коротких слова.")}
                {issueFor("step") ? <span className="pp-warning">{issueFor("step").text}</span> : null}
              </fieldset>
            </>
          ) : null}

          <label className="pp-field">
            <span className="pp-label">{num()}{layoutId === "circle" ? "Текст поста *" : "Заголовок *"}</span>
            <textarea className="pp-input" rows={3} value={fields.title} onChange={setField("title")} placeholder={layoutId === "circle" ? "Коротко о содержании поста" : "О чём пост"} />
            {limitNote("title", layoutId === "circle" ? "Больше не помещается — текст занимает не больше трёх строк." : split === "photo" ? "Больше не помещается. Выберите «Больше текста» или сократите заголовок." : "Больше не помещается — сократите заголовок.")}
            {issueFor("title") ? <span className="pp-warning">{issueFor("title").text}</span> : null}
          </label>

          {layoutId === "circle" ? (
            <fieldset className="pp-field">
              <legend className="pp-label">{num()}Логотип</legend>
              <Segment name="gdl-logo" value={logo} options={[["sign", "Знак"], ["full", "Знак и название"]]} onChange={(value) => { setLogo(value); setDone(false); }} />
            </fieldset>
          ) : null}

          <div className="pp-field">
            <span className="pp-label">{num()}Файл</span>
            <Segment name="gdl-format" value={format} options={[["png", "PNG"], ["jpg", "JPG"]]} onChange={setFormat} />
            <Segment name="gdl-size" value={size} options={[[1080, "1080 × 1080"], [2160, "2160 × 2160"]]} onChange={setSize} />
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
