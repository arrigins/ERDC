import { useEffect, useMemo, useRef, useState } from "react";
import { clamp, decodePhoto, downloadCanvas } from "./photo.js";
import { FONT, wrap } from "./text.js";
import { drawBrandBackground } from "./backgrounds.js";
import { BackgroundPicker, DownloadReasons, EditorBar, Segment, useLeaveWarning, useTemplateBase } from "./CardEditor.jsx";

// «Горизонтальный коллаж» по образцу поста R41: слева фирменный градиент с логотипом, заголовком и подзаголовком,
// справа сетка 2 × 2 из фотографий. Все размеры — в логических пикселях 1920 × 1080; предпросмотр и экспорт
// рисует одна функция renderCollage. Значения сняты с референса и требуют подтверждения дизайн-командой.

export const COLLAGE_TEMPLATE_VERSION = "collage-1.0-draft";
const W = 1920;
const H = 1080;
const PANEL = 946;
const GAP = 4;
const X = 84;
const TEXT_W = PANEL - X * 2;
const TOP_LIMIT = 230;
const BOTTOM = 950;
const MAX_ZOOM = 4;

const titleFont = { size: 56, line: 68, max: 5, spacing: 1 };
const subFont = { size: 38, line: 52, max: 3 };

// Ячейки фото: 2 × 2 справа от панели
const colA = PANEL;
const colB = PANEL + Math.round((W - PANEL - GAP) / 2) + GAP;
const rowB = Math.round((H - GAP) / 2) + GAP;
export const CELLS = [
  { x: colA, y: 0, w: colB - GAP - colA, h: rowB - GAP },
  { x: colB, y: 0, w: W - colB, h: rowB - GAP },
  { x: colA, y: rowB, w: colB - GAP - colA, h: H - rowB },
  { x: colB, y: rowB, w: W - colB, h: H - rowB },
];

const placeholders = {
  title: "Второй победитель «Дальневосточного квеста» отправится в Бурятию",
  subtitle: "Резидент АЗРФ открыл новый туристический проект",
};

function setFont(ctx, weight, size, spacing = 0) {
  ctx.font = `${weight} ${size}px ${FONT}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = `${spacing}px`;
}

// Раскладка текста: строки, координаты, проблемы. Текстовый блок прижат к низу панели.
export function layoutCollage(ctx, data) {
  const issues = [];
  setFont(ctx, 700, titleFont.size, titleFont.spacing);
  const title = wrap(ctx, data.title.trim().toUpperCase(), TEXT_W);
  if (title.lines.length > titleFont.max) issues.push({ field: "title", text: `Заголовок не помещается в ${titleFont.max} строк. Сократите его.` });
  setFont(ctx, 400, subFont.size);
  const sub = data.subtitle.trim() ? wrap(ctx, data.subtitle.trim(), TEXT_W) : { lines: [] };
  if (sub.lines.length > subFont.max) issues.push({ field: "subtitle", text: "Подзаголовок слишком длинный. Сократите его." });
  const subHeight = sub.lines.length ? 40 + sub.lines.length * subFont.line : 0;
  const height = title.lines.length * titleFont.line + subHeight;
  const top = BOTTOM - height;
  if (top < TOP_LIMIT && !issues.length) issues.push({ field: "layout", text: "Текст заходит на логотип. Сократите заголовок или подзаголовок." });
  return { issues, top, title: title.lines, sub: sub.lines, subTop: top + title.lines.length * titleFont.line + 40 };
}

// Фото в ячейке: закрывает её целиком, без растяжения; crop = { zoom, cx, cy } (центр в долях фото)
function placePhoto(bitmap, cell, crop) {
  const base = Math.max(cell.w / bitmap.width, cell.h / bitmap.height) * crop.zoom;
  const w = bitmap.width * base;
  const h = bitmap.height * base;
  const x = clamp(cell.x + cell.w / 2 - crop.cx * w, cell.x + cell.w - w, cell.x);
  const y = clamp(cell.y + cell.h / 2 - crop.cy * h, cell.y + cell.h - h, cell.y);
  return { x, y, w, h };
}

export function renderCollage(ctx, data, layout, assets) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  // Панель с фирменным градиентом: квадратный фон 1080 растягивается по ширине панели
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, PANEL, H);
  ctx.clip();
  ctx.scale(PANEL / 1080, 1);
  drawBrandBackground(ctx, data.bg);
  ctx.restore();

  // Фотографии
  CELLS.forEach((cell, index) => {
    const photo = data.photos[index];
    ctx.save();
    ctx.beginPath();
    ctx.rect(cell.x, cell.y, cell.w, cell.h);
    ctx.clip();
    if (photo) {
      const box = placePhoto(photo.bitmap, cell, photo.crop);
      ctx.drawImage(photo.bitmap, box.x, box.y, box.w, box.h);
    } else {
      ctx.fillStyle = "#e9edf5";
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h);
      ctx.fillStyle = "#8a93a6";
      setFont(ctx, 500, 28);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`Фото ${index + 1}`, cell.x + cell.w / 2, cell.y + cell.h / 2);
      ctx.textAlign = "left";
    }
    ctx.restore();
  });

  // Логотип: круг 120 с отступом 60, как на квадратных постах
  if (assets.badgeWhite) ctx.drawImage(assets.badgeWhite, 60, 60, 120, 120);

  if (!layout) return;
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = data.ghost?.title ? 0.4 : 1;
  setFont(ctx, 700, titleFont.size, titleFont.spacing);
  layout.title.forEach((line, index) => ctx.fillText(line, X, layout.top + index * titleFont.line));
  ctx.globalAlpha = data.ghost?.subtitle ? 0.4 : 1;
  setFont(ctx, 400, subFont.size);
  layout.sub.forEach((line, index) => ctx.fillText(line, X, layout.subTop + index * subFont.line));
  ctx.globalAlpha = 1;
  setFont(ctx, 400, 10);
}

const measureCtx = () => document.createElement("canvas").getContext("2d");

function withPlaceholders(data) {
  return {
    ...data,
    title: data.title.trim() ? data.title : placeholders.title,
    subtitle: data.title.trim() || data.subtitle.trim() ? data.subtitle : placeholders.subtitle,
    ghost: { title: !data.title.trim(), subtitle: !data.title.trim() && !data.subtitle.trim() },
  };
}

function cellAt(x, y) {
  return CELLS.findIndex((cell) => x >= cell.x && x <= cell.x + cell.w && y >= cell.y && y <= cell.y + cell.h);
}

export function CollageEditor({ onBack }) {
  const base = useTemplateBase();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bg, setBg] = useState({ preset: "glow" });
  const [photos, setPhotos] = useState([null, null, null, null]);
  const [selected, setSelected] = useState(0);
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState(1920);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const pickFor = useRef(0);
  const drag = useRef(null);

  const dirty = Boolean(title || subtitle || photos.some(Boolean));
  useLeaveWarning(dirty && !done);

  const real = useMemo(() => ({ title, subtitle, bg, photos }), [title, subtitle, bg, photos]);
  const preview = useMemo(() => withPlaceholders(real), [real]);
  const ready = base.fontState === "ready";
  const layout = useMemo(() => (ready ? layoutCollage(measureCtx(), preview) : null), [preview, ready]);
  const realLayout = useMemo(() => (ready ? layoutCollage(measureCtx(), real) : null), [real, ready]);

  // Предпросмотр — тот же рендер, что и экспорт
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !base.badges) return;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(canvas.width / W, 0, 0, canvas.width / W, 0, 0);
    renderCollage(ctx, preview, layout, base.badges);
  });

  const loadInto = async (index, file) => {
    if (!file) return;
    setError("");
    try {
      const photo = await decodePhoto(file);
      setPhotos((list) => list.map((item, i) => (i === index ? { ...photo, crop: { zoom: 1, cx: 0.5, cy: 0.5 } } : item)));
      setSelected(index);
      setDone(false);
    } catch (problem) {
      setError(problem.message);
    }
  };

  const openPicker = (index) => {
    pickFor.current = index;
    inputRef.current?.click();
  };

  const updateCrop = (index, patch) => {
    setPhotos((list) => list.map((item, i) => (i === index && item ? { ...item, crop: { ...item.crop, ...patch } } : item)));
    setDone(false);
  };

  // Перетаскивание фото внутри ячейки прямо на предпросмотре
  const toLogical = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * W, y: ((event.clientY - rect.top) / rect.height) * H, k: W / rect.width };
  };
  const onPointerDown = (event) => {
    const point = toLogical(event);
    const index = cellAt(point.x, point.y);
    if (index < 0) return;
    setSelected(index);
    if (!photos[index]) {
      openPicker(index);
      return;
    }
    drag.current = { index, x: event.clientX, y: event.clientY, k: point.k };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    const state = drag.current;
    if (!state) return;
    const photo = photos[state.index];
    const box = placePhoto(photo.bitmap, CELLS[state.index], photo.crop);
    const dx = (event.clientX - state.x) * state.k;
    const dy = (event.clientY - state.y) * state.k;
    state.x = event.clientX;
    state.y = event.clientY;
    updateCrop(state.index, { cx: clamp(photo.crop.cx - dx / box.w, 0, 1), cy: clamp(photo.crop.cy - dy / box.h, 0, 1) });
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(null);
    const point = toLogical(event);
    const index = cellAt(point.x, point.y);
    loadInto(index >= 0 ? index : photos.findIndex((item) => !item) >= 0 ? photos.findIndex((item) => !item) : selected, event.dataTransfer.files?.[0]);
  };

  const missing = [!title.trim() ? "заголовок" : null, photos.filter(Boolean).length < 4 ? `фотографии (загружено ${photos.filter(Boolean).length} из 4)` : null].filter(Boolean);
  const issues = realLayout ? realLayout.issues : [];
  const blocked = !ready || !base.badges || missing.length > 0 || issues.length > 0;
  const reasons = [
    base.fontState === "loading" ? "Загружается фирменный шрифт — подождите пару секунд." : null,
    base.fontState === "failed" ? "Не загрузился фирменный шрифт TT Norms Pro — обновите страницу." : null,
    ...missing.map((field) => `Добавьте ${field}.`),
    ...issues.map((issue) => issue.text),
  ].filter(Boolean);
  const lowRes = photos.some((photo, index) => photo && (photo.bitmap.width < CELLS[index].w * (size / W) * 0.8 || photo.bitmap.height < CELLS[index].h * (size / W) * 0.8));

  const download = async () => {
    if (blocked) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = Math.round((size / W) * H);
      const ctx = canvas.getContext("2d");
      ctx.scale(size / W, size / W);
      ctx.imageSmoothingQuality = "high";
      renderCollage(ctx, real, realLayout, base.badges);
      await downloadCanvas(canvas, format, `krdv-kollazh-${size}.${format}`);
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

  const current = photos[selected];
  const issueFor = (field) => realLayout?.issues.find((issue) => issue.field === field);

  return (
    <main className="pp-editor pp-collage">
      <EditorBar title="Горизонтальный коллаж" status={busy ? "Готовим…" : done ? "Скачано" : dirty ? "Не скачано" : ""} onBack={goBack} />
      <div className="pp-editor-grid">
        <section className="pp-preview-col" aria-label="Предпросмотр">
          <div
            className={`pp-stage pp-collage-stage ${dragOver !== null ? "is-drag" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={onDrop}
          >
            <canvas
              ref={canvasRef}
              width={1440}
              height={810}
              className={photos.some(Boolean) ? "can-drag" : ""}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="img"
              aria-label={`Предпросмотр коллажа${title ? `: ${title}` : ""}`}
            />
            {base.fontState === "loading" ? <span className="pp-stage-msg">Загружаем фирменный шрифт…</span> : null}
          </div>
          <p className="pp-hint">Нажмите на пустую ячейку, чтобы загрузить фото. Фото можно перетаскивать внутри ячейки. Блеклый текст — подсказка.</p>
        </section>

        <section className="pp-panel is-numbered" aria-label="Настройки">
          {base.fontState === "failed" ? <div className="pp-error" role="alert">Не загрузился фирменный шрифт TT Norms Pro, поэтому скачать коллаж нельзя. Проверьте интернет и обновите страницу.</div> : null}
          {error || base.error ? <div className="pp-error" role="alert">{error || base.error}</div> : null}

          <fieldset className="pp-field">
            <legend className="pp-label">Фотографии *</legend>
            <div className="pp-collage-slots">
              {photos.map((photo, index) => (
                <button
                  type="button"
                  key={index}
                  className={`pp-collage-slot ${selected === index ? "is-active" : ""} ${photo ? "has-photo" : ""}`}
                  onClick={() => (photo ? setSelected(index) : openPicker(index))}
                  aria-pressed={selected === index}
                  aria-label={photo ? `Фото ${index + 1}: ${photo.name}` : `Загрузить фото ${index + 1}`}
                >
                  {photo ? <img src={photo.url} alt="" /> : <span>+</span>}
                  <em>{index + 1}</em>
                </button>
              ))}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(event) => {
                loadInto(pickFor.current, event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {current ? (
              <div className="pp-collage-tools">
                <label className="pp-collage-zoom">
                  <span>Масштаб фото {selected + 1}</span>
                  <input type="range" min={1} max={MAX_ZOOM} step={0.01} value={current.crop.zoom} onChange={(event) => updateCrop(selected, { zoom: Number(event.target.value) })} />
                </label>
                <button type="button" className="pp-button is-secondary" onClick={() => openPicker(selected)}>
                  Заменить фото
                </button>
              </div>
            ) : null}
            <span className="pp-note">Четыре фото дополняют одну историю. Сначала главное — оно в левом верхнем углу сетки.</span>
            {lowRes ? <span className="pp-warning">Некоторые фото мельче ячейки — в выбранном размере они будут нечёткими.</span> : null}
          </fieldset>

          <fieldset className="pp-field">
            <legend className="pp-label">Фон</legend>
            <BackgroundPicker
              value={bg}
              onChange={(next) => {
                setBg(next);
                setDone(false);
              }}
            />
          </fieldset>

          <label className="pp-field">
            <span className="pp-label">Заголовок *</span>
            <textarea
              className="pp-input"
              rows={3}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setDone(false);
              }}
              placeholder={placeholders.title}
            />
            <span className="pp-note">Набирается заглавными буквами автоматически.</span>
            {issueFor("title") ? <span className="pp-warning">{issueFor("title").text}</span> : null}
          </label>

          <label className="pp-field">
            <span className="pp-label">Подзаголовок</span>
            <textarea
              className="pp-input"
              rows={2}
              value={subtitle}
              onChange={(event) => {
                setSubtitle(event.target.value);
                setDone(false);
              }}
              placeholder="Необязательно"
            />
            {issueFor("subtitle") ? <span className="pp-warning">{issueFor("subtitle").text}</span> : null}
            {issueFor("layout") ? <span className="pp-warning">{issueFor("layout").text}</span> : null}
          </label>

          <div className="pp-field">
            <span className="pp-label">Файл</span>
            <Segment name="collage-format" value={format} options={[["png", "PNG"], ["jpg", "JPG"]]} onChange={setFormat} />
            <Segment name="collage-size" value={size} options={[[1920, "1920 × 1080"], [3840, "3840 × 2160"]]} onChange={setSize} />
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
