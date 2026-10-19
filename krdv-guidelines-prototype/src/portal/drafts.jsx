// Автосохранение черновиков платформы (19.10).
// Черновик хранится в браузере этого компьютера (IndexedDB): текст, настройки и сами фотографии.
// Учётная запись общая, поэтому черновики не «переезжают» между компьютерами — у каждого сотрудника свой.
// На каждую задачу — один черновик; «Начать заново» стирает его.

import { useEffect, useRef, useState } from "react";

const DB = "krdv-portal-drafts";
const STORE = "drafts";
const VERSION = 1;

function open() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("no indexedDB"));
      return;
    }
    const request = indexedDB.open(DB, VERSION);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(mode, action) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const loadDraft = (key) => run("readonly", (store) => store.get(key)).catch(() => null);
export const saveDraft = (key, value) => run("readwrite", (store) => store.put({ ...value, savedAt: Date.now() }, key)).catch(() => null);
export const clearDraft = (key) => run("readwrite", (store) => store.delete(key)).catch(() => null);

// snapshot — что сохранять (обычные данные и Blob-файлы фото), restore(draft) — вернуть всё в редактор.
// Пока черновик не прочитан, ничего не сохраняем, чтобы пустой редактор не затёр работу.
export function useDraft(key, snapshot, restore, isEmpty) {
  const [state, setState] = useState({ loaded: false, restored: false, savedAt: null });
  const restoreRef = useRef(restore);
  restoreRef.current = restore;

  useEffect(() => {
    let alive = true;
    loadDraft(key).then(async (draft) => {
      if (!alive) return;
      if (draft) {
        try {
          await restoreRef.current(draft);
        } catch {
          // повреждённый черновик просто пропускаем
        }
      }
      if (alive) setState({ loaded: true, restored: Boolean(draft), savedAt: draft?.savedAt || null });
    });
    return () => {
      alive = false;
    };
  }, [key]);

  useEffect(() => {
    if (!state.loaded) return undefined;
    const timer = window.setTimeout(() => {
      if (isEmpty) {
        clearDraft(key);
        setState((current) => ({ ...current, savedAt: null }));
        return;
      }
      saveDraft(key, snapshot).then(() => setState((current) => ({ ...current, savedAt: Date.now() })));
    }, 600);
    return () => window.clearTimeout(timer);
  }, [key, snapshot, isEmpty, state.loaded]);

  return state;
}

export function draftLabel(savedAt) {
  if (!savedAt) return "";
  const time = new Date(savedAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `Черновик сохранён в ${time}`;
}

// Полоска над редактором: черновик восстановлен / «Начать заново»
export function DraftBar({ draft, onReset }) {
  if (!draft.loaded || (!draft.restored && !draft.savedAt)) return null;
  return (
    <div className="pp-draft" role="status">
      <span>{draft.restored ? "Мы вернули ваш черновик — можно продолжить с того же места." : "Работа сохраняется автоматически."}</span>
      {draft.savedAt ? <em>{draftLabel(draft.savedAt)}</em> : null}
      <button type="button" className="pp-draft-reset" onClick={onReset}>
        Начать заново
      </button>
    </div>
  );
}
