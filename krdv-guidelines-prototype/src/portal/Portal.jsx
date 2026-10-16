import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Прототип внутренней платформы оформления публикаций КРДВ (ТЗ «01_internal-platform», пилот).
// Работает целиком в браузере: без входа, сервера и сохранения проектов. Фотографии не покидают устройство.
// Все координаты шаблона — в логических пикселях макета 1080 × 1080 (ТЗ, раздел 9).

import { FRAME, MAX_ZOOM, asset, clamp, coverCrop, decodePhoto, downloadCanvas, loadImage, moveCrop, zoomCrop } from "./photo.js";
import { QuoteEditor } from "./QuoteEditor.jsx";

const tasks = [
  { id: "photo", title: "Фото с логотипом", text: "Загрузите фотографию, выберите вариант логотипа и скачайте готовый пост.", image: "assets/social/demo-photo-branded.webp", status: "ready" },
  { id: "quote", title: "Цитата", text: "Портрет, имя, должность и текст цитаты на фирменной карточке.", image: "assets/social/r14-sm.webp", status: "ready" },
  { id: "news", title: "Новость", text: "Заголовок, подзаголовок, метка и иллюстрация из библиотеки.", image: "assets/social/r01-sm.webp", status: "В полной версии" },
  { id: "series", title: "Серия карточек", text: "От 2 до 10 карточек: обложка, сообщения и завершение.", image: "assets/social/r35-sm.webp", status: "В полной версии" },
];

const overlays = {
  white: { title: "Белый", text: "Логотип хорошо читается на фоне." },
  translucent: { title: "Полупрозрачный", text: "Для спокойного контрастного фона." },
  "white-shade": { title: "Белый с затемнением", text: "Для светлого или пёстрого фона." },
  "translucent-shade": { title: "Полупрозрачный с затемнением", text: "Мягкий акцент на светлом фоне." },
  large: { title: "Укрупнённый", text: "Для первой фотографии в посте из нескольких фото." },
};
const singleOverlays = ["white", "translucent", "white-shade", "translucent-shade"];
const overlaySrc = (id, size) => asset(`assets/social/overlays/krdv-social-${id}-${size}.png`);

function Header({ onHome }) {
  return (
    <header className="pp-header">
      <button type="button" className="pp-brand" onClick={onHome} aria-label="На стартовый экран">
        <img src={asset("assets/logos/krdv-logo-ru-horizontal.svg")} alt="КРДВ" />
      </button>
      <span className="pp-header-title">Платформа публикаций</span>
      <span className="pp-badge">Прототип</span>
    </header>
  );
}

function Home({ onOpen }) {
  return (
    <main className="pp-home">
      <section className="pp-hello">
        <h1>Что оформляем?</h1>
        <p>Выберите задачу. Готовый пост можно скачать сразу — без Figma и дизайнера.</p>
      </section>
      <div className="pp-tasks">
        {tasks.map((task) => {
          const ready = task.status === "ready";
          const body = (
            <>
              <span className="pp-task-media">
                <img src={asset(task.image)} alt="" loading="lazy" />
              </span>
              <span className="pp-task-copy">
                <strong>{task.title}</strong>
                <span>{task.text}</span>
                {ready ? <em className="pp-task-go">Начать</em> : <em>{task.status}</em>}
              </span>
            </>
          );
          return ready ? (
            <button type="button" className="pp-task" key={task.id} onClick={() => onOpen(task.id)}>
              {body}
            </button>
          ) : (
            <div className="pp-task is-soon" key={task.id} aria-disabled="true">
              {body}
            </div>
          );
        })}
      </div>
      <section className="pp-recent">
        <h2>Последние проекты</h2>
        <p>Сохранение проектов появится, когда платформу подключат к корпоративному входу. В прототипе результат сразу скачивается.</p>
      </section>
      <p className="pp-privacy">Прототип работает в браузере: фотографии никуда не отправляются и не сохраняются.</p>
    </main>
  );
}

function PhotoEditor({ onBack }) {
  const [photo, setPhoto] = useState(null);
  const [crop, setCrop] = useState(null);
  const [purpose, setPurpose] = useState("single");
  const [overlay, setOverlay] = useState("white");
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState(1080);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const stageRef = useRef(null);
  const pointers = useRef(new Map());
  const gesture = useRef(null);

  const activeOverlay = purpose === "album" ? "large" : overlay;

  // Предупреждение перед уходом со страницы, пока результат не скачан (ТЗ, раздел 4)
  useEffect(() => {
    if (!photo || done) return undefined;
    const onLeave = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [photo, done]);

  useEffect(() => () => {
    if (photo) {
      URL.revokeObjectURL(photo.url);
      photo.bitmap.close();
    }
  }, [photo]);

  const openFile = async (file) => {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const next = await decodePhoto(file);
      setPhoto(next);
      setCrop(coverCrop(next.bitmap.width, next.bitmap.height));
      setDone(false);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };

  const setZoom = useCallback(
    (zoom) => {
      if (!photo) return;
      setCrop((current) => zoomCrop(current, photo, zoom));
      setDone(false);
    },
    [photo],
  );

  const moveBy = useCallback((dx, dy) => {
    setCrop((current) => moveCrop(current, dx, dy));
    setDone(false);
  }, []);

  // Перетаскивание одним пальцем или мышью, масштаб двумя пальцами
  const stageScale = () => (stageRef.current ? stageRef.current.clientWidth / FRAME : 1);
  const onPointerDown = (event) => {
    if (!photo) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.current = null;
  };
  const onPointerMove = (event) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous || !crop) return;
    const next = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, next);
    if (pointers.current.size === 1) {
      const k = stageScale();
      moveBy((next.x - previous.x) / k, (next.y - previous.y) / k);
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (!gesture.current) gesture.current = { distance, zoom: crop.zoom };
      setZoom((gesture.current.zoom * distance) / gesture.current.distance);
    }
  };
  const onPointerUp = (event) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  };
  const onWheel = (event) => {
    if (!crop || !event.ctrlKey) return;
    event.preventDefault();
    setZoom(crop.zoom * (event.deltaY < 0 ? 1.05 : 0.95));
  };
  const onKeyDown = (event) => {
    const step = event.shiftKey ? 40 : 10;
    const moves = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    if (moves[event.key]) {
      event.preventDefault();
      moveBy(...moves[event.key]);
    } else if (event.key === "+" || event.key === "=") {
      setZoom(crop.zoom * 1.1);
    } else if (event.key === "-") {
      setZoom(crop.zoom / 1.1);
    }
  };

  // Сколько пикселей исходника приходится на сторону квадрата: меньше размера экспорта — предупреждаем
  const sourcePixels = photo && crop ? Math.round((FRAME / crop.w) * photo.bitmap.width) : 0;
  const lowRes = photo && sourcePixels < size;

  const download = async () => {
    if (!photo || !crop) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      const f = size / FRAME;
      context.imageSmoothingQuality = "high";
      context.drawImage(photo.bitmap, crop.x * f, crop.y * f, crop.w * f, crop.h * f);
      const mark = await loadImage(overlaySrc(activeOverlay, size));
      context.drawImage(mark, 0, 0, size, size);
      await downloadCanvas(canvas, format, `krdv-foto-${activeOverlay}-${size}.${format}`);
      setDone(true);
    } catch (problem) {
      setError(problem.message || "Не удалось скачать файл. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const goBack = () => {
    if (photo && !done && !window.confirm("Результат ещё не скачан. Выйти без сохранения?")) return;
    onBack();
  };

  const k = 100 / FRAME;
  const imageStyle = crop
    ? { left: `${crop.x * k}%`, top: `${crop.y * k}%`, width: `${crop.w * k}%`, height: `${crop.h * k}%` }
    : undefined;

  return (
    <main className="pp-editor">
      <div className="pp-editor-bar">
        <button type="button" className="pp-back" onClick={goBack}>
          <span aria-hidden="true">←</span> Назад
        </button>
        <h1>Фото с логотипом</h1>
        <span className={`pp-status ${done ? "is-done" : ""}`} role="status">
          {busy ? "Готовим…" : done ? "Скачано" : photo ? "Не скачано" : ""}
        </span>
      </div>

      <div className="pp-editor-grid">
        <section className="pp-preview-col" aria-label="Предпросмотр">
          <div
            ref={stageRef}
            className={`pp-stage ${photo ? "has-photo" : ""} ${dragOver ? "is-drag" : ""}`}
            tabIndex={photo ? 0 : -1}
            aria-label={photo ? "Предпросмотр. Перетащите фото, чтобы выбрать кадр; стрелки двигают, плюс и минус меняют масштаб" : undefined}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            onKeyDown={photo ? onKeyDown : undefined}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              openFile(event.dataTransfer.files?.[0]);
            }}
          >
            {photo ? (
              <>
                <img className="pp-stage-photo" src={photo.url} alt="" draggable={false} style={imageStyle} />
                <img className="pp-stage-mark" src={overlaySrc(activeOverlay, 1080)} alt="" draggable={false} />
              </>
            ) : (
              <button type="button" className="pp-empty" onClick={() => inputRef.current?.click()} disabled={busy}>
                <strong>{busy ? "Открываем фото…" : "Загрузите фотографию"}</strong>
                <span>JPG, PNG или WebP до 20 МБ. Можно перетащить файл сюда.</span>
              </button>
            )}
          </div>
          {photo ? <p className="pp-hint">Перетащите фото пальцем или мышью, чтобы выбрать кадр. Логотип стоит на своём месте и не двигается.</p> : null}
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

          <div className="pp-field">
            <span className="pp-label">1. Фотография</span>
            <button type="button" className="pp-button is-secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
              {photo ? "Заменить фото" : "Выбрать фото"}
            </button>
            {photo ? <span className="pp-note">{photo.name} · {photo.bitmap.width} × {photo.bitmap.height}</span> : null}
          </div>

          <fieldset className="pp-field">
            <legend className="pp-label">2. Где будет фото</legend>
            <div className="pp-segment">
              {[
                ["single", "Одна фотография"],
                ["album", "Первая из нескольких"],
              ].map(([value, label]) => (
                <label key={value} className={purpose === value ? "is-active" : ""}>
                  <input type="radio" name="purpose" value={value} checked={purpose === value} onChange={() => { setPurpose(value); setDone(false); }} />
                  {label}
                </label>
              ))}
            </div>
            <span className="pp-note">
              {purpose === "album"
                ? "Логотип ставится только на первую фотографию поста — укрупнённый, чтобы читался в превью. Остальные фото публикуются без логотипа."
                : "Логотип в левом верхнем углу, охранное поле соблюдено автоматически."}
            </span>
          </fieldset>

          {purpose === "single" ? (
            <fieldset className="pp-field">
              <legend className="pp-label">3. Вариант логотипа</legend>
              <div className="pp-overlays">
                {singleOverlays.map((id) => (
                  <label key={id} className={`pp-overlay ${overlay === id ? "is-active" : ""}`}>
                    <input type="radio" name="overlay" value={id} checked={overlay === id} onChange={() => { setOverlay(id); setDone(false); }} />
                    <span className="pp-overlay-thumb">
                      <img src={photo ? photo.url : asset("assets/social/demo-photo.webp")} alt="" style={photo ? imageStyle : undefined} />
                      <img src={overlaySrc(id, 1080)} alt="" />
                    </span>
                    <strong>{overlays[id].title}</strong>
                    <span>{overlays[id].text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="pp-field">
            <span className="pp-label">{purpose === "single" ? "4." : "3."} Кадр</span>
            <div className="pp-zoom">
              <button type="button" className="pp-icon-button" onClick={() => setZoom(crop.zoom / 1.15)} disabled={!photo || crop.zoom <= 1} aria-label="Уменьшить">−</button>
              <input
                type="range"
                min="1"
                max={MAX_ZOOM}
                step="0.01"
                value={crop ? crop.zoom : 1}
                onChange={(event) => setZoom(Number(event.target.value))}
                disabled={!photo}
                aria-label="Масштаб фотографии"
              />
              <button type="button" className="pp-icon-button" onClick={() => setZoom(crop.zoom * 1.15)} disabled={!photo || crop.zoom >= MAX_ZOOM} aria-label="Увеличить">+</button>
              <button type="button" className="pp-button is-text" onClick={() => { setCrop(coverCrop(photo.bitmap.width, photo.bitmap.height)); setDone(false); }} disabled={!photo}>
                Сбросить
              </button>
            </div>
          </div>

          <div className="pp-field">
            <span className="pp-label">{purpose === "single" ? "5." : "4."} Файл</span>
            <div className="pp-segment">
              {[
                ["png", "PNG"],
                ["jpg", "JPG"],
              ].map(([value, label]) => (
                <label key={value} className={format === value ? "is-active" : ""}>
                  <input type="radio" name="format" value={value} checked={format === value} onChange={() => setFormat(value)} />
                  {label}
                </label>
              ))}
            </div>
            <div className="pp-segment">
              {[1080, 2160].map((value) => (
                <label key={value} className={size === value ? "is-active" : ""}>
                  <input type="radio" name="size" value={value} checked={size === value} onChange={() => setSize(value)} />
                  {value} × {value}
                </label>
              ))}
            </div>
            {lowRes ? (
              <span className="pp-warning">
                Разрешения фото мало для {size} × {size}: в кадре около {sourcePixels} px. Уменьшите масштаб, выберите 1080 или загрузите фото крупнее.
              </span>
            ) : null}
          </div>

          <div className="pp-actions">
            <button type="button" className="pp-button is-primary" onClick={download} disabled={!photo || busy}>
              {busy ? "Готовим файл…" : "Скачать"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

const routes = ["photo", "quote"];
const readRoute = () => {
  const value = window.location.hash.replace(/^#\/?/, "");
  return routes.includes(value) ? value : "home";
};

export function Portal() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const go = (next) => {
    window.location.hash = next === "home" ? "" : `/${next}`;
    setRoute(next);
  };

  const screen = useMemo(
    () =>
      route === "photo" ? <PhotoEditor onBack={() => go("home")} /> : route === "quote" ? <QuoteEditor onBack={() => go("home")} /> : <Home onOpen={go} />,
    [route],
  );

  return (
    <div className="pp-app">
      <Header onHome={() => go("home")} />
      {screen}
    </div>
  );
}
