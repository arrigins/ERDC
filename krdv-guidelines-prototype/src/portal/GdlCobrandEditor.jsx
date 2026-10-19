import { useEffect, useMemo, useRef, useState } from "react";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/700.css";
import { MAX_ZOOM, asset, clamp, createTap, decodePhoto, downloadCanvas, loadImage } from "./photo.js";
import { DraftBar, clearDraft, useDraft } from "./drafts.jsx";
import { cobrandFontRequests, cobrandPhotoRect, cobrandSchemes, formats, layoutCobrand, partners, renderCobrand } from "./gdlCobrandTemplate.js";
import { DownloadReasons } from "./CardEditor.jsx";

// Пост «Государство для людей» в кобрендинге с КРДВ / Минвостокразвития: три формата по макетам дизайнеров.

const placeholders = {
  title: "Государство для бизнеса",
  sub: "Подзаголовок в одну-две строки о главном в посте",
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

const startCrop = { zoom: 1, cx: 0.5, cy: 0.5 };

export function GdlCobrandEditor({ onBack, onReset }) {
  const [format, setFormat] = useState("square");
  const [scheme, setScheme] = useState("blue");
  const [partner, setPartner] = useState("krdv");
  const [photo, setPhoto] = useState(null);
  const [crop, setCrop] = useState(startCrop);
  const [fields, setFields] = useState({ title: "", sub: "" });
  const [fileType, setFileType] = useState("png");
  const [scale, setScale] = useState(1);
  const [fontState, setFontState] = useState("loading");
  const [images, setImages] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [limit, setLimit] = useState(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const drag = useRef(null);
  const f = formats[format];

  useEffect(() => {
    let alive = true;
    // Montserrat разбит по алфавитам: кириллицу грузим явно
    const sample = "Государство для людей — ё 2026";
    Promise.all(cobrandFontRequests.map((item) => document.fonts.load(item, sample)))
      .then(() => alive && setFontState(cobrandFontRequests.every((item) => document.fonts.check(item, sample)) ? "ready" : "failed"))
      .catch(() => alive && setFontState("failed"));
    const files = { gdl: "assets/portal/gdl/gdl-logo-white.svg", ...Object.fromEntries(Object.entries(partners).map(([id, item]) => [id, item.file])) };
    Promise.all(Object.entries(files).map(([id, file]) => loadImage(asset(file)).then((image) => [id, image])))
      .then((pairs) => alive && setImages(Object.fromEntries(pairs)))
      .catch((problem) => alive && setError(problem.message));
    return () => {
      alive = false;
    };
  }, []);

  const dirty = Boolean(photo || fields.title || fields.sub);

  // Автосохранение черновика (вместе с фото)
  const snapshot = useMemo(() => ({ format, scheme, partner, fields, crop, fileType, scale, photoFile: photo?.file || null }), [format, scheme, partner, fields, crop, fileType, scale, photo]);
  const draft = useDraft("gdl", snapshot, async (d) => {
    if (d.format) setFormat(d.format);
    if (d.scheme) setScheme(d.scheme);
    if (d.partner) setPartner(d.partner);
    if (d.fields) setFields(d.fields);
    if (d.fileType) setFileType(d.fileType);
    if (d.scale) setScale(d.scale);
    if (d.photoFile) {
      setPhoto(await decodePhoto(d.photoFile));
      if (d.crop) setCrop(d.crop);
    }
  }, !dirty);
  const resetDraft = async () => {
    await clearDraft("gdl");
    onReset?.();
  };
  const tap = useRef(createTap());

  useEffect(() => () => {
    if (photo) {
      URL.revokeObjectURL(photo.url);
      photo.bitmap.close();
    }
  }, [photo]);

  const makeData = (nextFields = fields, nextFormat = format) => ({
    format: nextFormat,
    scheme,
    partner,
    title: nextFields.title || placeholders.title,
    sub: nextFields.sub || (nextFields.title ? "" : placeholders.sub),
    photo,
    crop,
    ghost: { title: !nextFields.title, sub: !nextFields.sub },
  });
  const data = useMemo(() => makeData(), [fields, format, scheme, partner, photo, crop]); // eslint-disable-line react-hooks/exhaustive-deps
  const ready = fontState === "ready" && images.gdl;
  const measure = (value) => layoutCobrand(document.createElement("canvas").getContext("2d"), value, images);
  const layout = useMemo(() => (ready ? measure(data) : null), [data, ready, images]); // eslint-disable-line react-hooks/exhaustive-deps
  const fits = (nextFields, nextFormat = format) => !ready || measure(makeData(nextFields, nextFormat)).issues.length === 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderCobrand(ctx, data, layout, images);
  }, [data, layout, images, format]);

  const issues = layout ? layout.issues : [];
  const issueFor = (field) => issues.find((issue) => issue.field === field);

  // Жёсткий предел ввода, как в остальных шаблонах портала
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

  const toLogical = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) * f.w) / rect.width, y: ((event.clientY - rect.top) * f.h) / rect.height };
  };
  const box = f.photo;
  const inside = (p) => p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;
  const shift = (dx, dy) => {
    if (!photo) return;
    setCrop((current) => {
      const rect = cobrandPhotoRect(photo, current, box);
      return { ...current, cx: clamp(current.cx - dx / rect.w, 0, 1), cy: clamp(current.cy - dy / rect.h, 0, 1) };
    });
    setDone(false);
  };
  const onPointerDown = (event) => {
    const point = toLogical(event);
    if (!inside(point)) return;
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
      event.currentTarget.style.cursor = !photo && inside(toLogical(event)) ? "pointer" : "";
      return;
    }
    const point = toLogical(event);
    shift(point.x - drag.current.x, point.y - drag.current.y);
    drag.current = point;
  };
  const onPointerUp = () => {
    // короткое нажатие по фото без сдвига — заменить фото
    if (drag.current && tap.current.up()) inputRef.current?.click();
    drag.current = null;
  };
  const onKeyDown = (event) => {
    const step = event.shiftKey ? 60 : 20;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (photo && moves[event.key]) {
      event.preventDefault();
      shift(...moves[event.key]);
    }
  };
  const setZoom = (zoom) => {
    setCrop((current) => ({ ...current, zoom: clamp(zoom, 1, MAX_ZOOM) }));
    setDone(false);
  };

  const switchFormat = (next) => {
    if (!fits(fields, next)) {
      setLimit("format");
      return;
    }
    setLimit(null);
    setFormat(next);
    setDone(false);
  };

  const blocked = !ready || issues.length > 0 || !photo || !fields.title.trim();
  const reasons = [
    fontState === "loading" ? "Загружается шрифт Montserrat — подождите пару секунд." : null,
    fontState === "failed" ? "Не загрузился шрифт Montserrat — обновите страницу." : null,
    !photo ? "Загрузите фотографию." : null,
    !fields.title.trim() ? "Добавьте заголовок." : null,
    ...issues.map((issue) => issue.text),
  ].filter(Boolean);

  const [outW, outH] = f.export[scale];
  const download = async () => {
    if (blocked) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      ctx.scale(outW / f.w, outH / f.h);
      ctx.imageSmoothingQuality = "high";
      renderCobrand(ctx, { ...data, ghost: {} }, layout, images);
      await downloadCanvas(canvas, fileType, `gdl-${format}-${outW}x${outH}.${fileType}`);
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
          <div className={`pp-stage pp-quote-stage pp-gdl-stage is-${format}`}>
            <canvas
              key={format}
              ref={canvasRef}
              width={f.w}
              height={f.h}
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
          <p className="pp-hint">{photo ? "Перетащите фото, чтобы поправить кадр. Нажмите на фото, чтобы заменить его." : "Фото встанет в светлую область. Бледный текст — подсказка, он заменится вашим."}</p>
        </section>

        <section className="pp-panel is-numbered" aria-label="Настройки">
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
            <legend className="pp-label">Формат</legend>
            <Segment name="gdl-format" value={format} options={Object.entries(formats).map(([id, item]) => [id, item.label])} onChange={switchFormat} />
            <span className="pp-note">{format === "square" ? "Пост 1:1." : format === "vertical" ? "Сторис и вертикальные посты 9:16." : "Горизонтальный пост 16:9."}</span>
            {limit === "format" ? <span className="pp-note pp-limit" role="status">Текст не поместится в этот формат — сначала сократите его.</span> : null}
          </fieldset>

          <fieldset className="pp-field">
            <legend className="pp-label">Фотография</legend>
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
              <span className="pp-note">JPG, PNG или WebP. Кадр можно поправить после загрузки.</span>
            )}
          </fieldset>

          <fieldset className="pp-field">
            <legend className="pp-label">Логотип партнёра</legend>
            <Segment name="gdl-partner" value={partner} options={Object.entries(partners).map(([id, item]) => [id, item.title])} onChange={(value) => { setPartner(value); setDone(false); }} />
            <span className="pp-note">Стоит справа от логотипа «Государство для людей», через белый разделитель.</span>
          </fieldset>

          <label className="pp-field">
            <span className="pp-label">Заголовок *</span>
            <textarea className="pp-input" rows={2} value={fields.title} onChange={setField("title")} placeholder="Например: Государство для бизнеса" />
            {limit === "title" ? <span className="pp-note pp-limit" role="status">Больше не помещается — сократите заголовок.</span> : null}
            {issueFor("title") ? <span className="pp-warning">{issueFor("title").text}</span> : null}
          </label>

          <label className="pp-field">
            <span className="pp-label">Подзаголовок</span>
            <textarea className="pp-input" rows={3} value={fields.sub} onChange={setField("sub")} placeholder="Например: САР на о. Русский расширяет возможности для защиты и структурирования активов" />
            <span className="pp-note">Необязательно.</span>
            {limit === "sub" ? <span className="pp-note pp-limit" role="status">Больше не помещается — сократите подзаголовок.</span> : null}
            {issueFor("sub") ? <span className="pp-warning">{issueFor("sub").text}</span> : null}
          </label>

          <fieldset className="pp-field">
            <legend className="pp-label">Цвет</legend>
            <Segment name="gdl-scheme" value={scheme} options={Object.entries(cobrandSchemes).map(([id, item]) => [id, item.title])} onChange={(value) => { setScheme(value); setDone(false); }} />
            <span className="pp-note">Только основные цвета проекта: синий, аквамариновый и бирюзовый.</span>
          </fieldset>

          <div className="pp-field">
            <span className="pp-label">Файл</span>
            <Segment name="gdl-type" value={fileType} options={[["png", "PNG"], ["jpg", "JPG"]]} onChange={setFileType} />
            <Segment name="gdl-scale" value={scale} options={[[1, `${f.export[1][0]} × ${f.export[1][1]}`], [2, `${f.export[2][0]} × ${f.export[2][1]}`]]} onChange={setScale} />
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
