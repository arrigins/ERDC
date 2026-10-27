// Масштаб страниц под окно (в печати — 1:1)
function fit() {
  document.documentElement.style.setProperty("--z", Math.min(1, (window.innerWidth - 48) / 1920));
}
fit();
window.addEventListener("resize", fit);

// Правило графики: кольцо прерывается перед текстом, логотипом и репликой (отступ t).
// Вырез делаем обтравкой (clip-path, evenodd) — так кольца остаются векторными в PDF.
const NS = "http://www.w3.org/2000/svg";
let clipId = 0;

function merge(rects) {
  // пересекающиеся прямоугольники сливаем в общий габарит, иначе evenodd «вернёт» пересечение
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < rects.length; i++) {
      for (let j = i + 1; j < rects.length; j++) {
        const a = rects[i], b = rects[j];
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) {
          const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
          rects[i] = { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
          rects.splice(j, 1);
          changed = true;
          break outer;
        }
      }
    }
  }
  return rects;
}

function applyCut(svg, rects, box) {
  if (!rects.length) return;
  const outer = `M${box.x} ${box.y}h${box.w}v${box.h}h${-box.w}Z`;
  const holes = merge(rects).map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}Z`).join("");
  const id = "cut" + ++clipId;
  const cp = document.createElementNS(NS, "clipPath");
  cp.setAttribute("id", id);
  cp.setAttribute("clipPathUnits", "userSpaceOnUse");
  const p = document.createElementNS(NS, "path");
  p.setAttribute("d", outer + holes);
  p.setAttribute("clip-rule", "evenodd");
  cp.appendChild(p);
  svg.insertBefore(cp, svg.firstChild);
  svg.querySelectorAll(".rings").forEach((g) => {
    // .rings может уже содержать свою обтравку внутри — оборачиваем снаружи
    const wrap = document.createElementNS(NS, "g");
    wrap.setAttribute("clip-path", `url(#${id})`);
    g.parentNode.insertBefore(wrap, g);
    wrap.appendChild(g);
  });
}

function cutRings() {
  document.querySelectorAll("svg.art").forEach((svg) => {
    if (!svg.querySelector(".rings")) return;
    const t = parseFloat(svg.dataset.t) || 0;
    const vb = svg.viewBox.baseVal;
    const box = { x: vb.x - vb.width, y: vb.y - vb.height, w: vb.width * 3, h: vb.height * 3 };
    if (svg.classList.contains("fill")) {
      // Разделители и обложка: кольца — SVG на всю страницу, текст — в HTML поверх
      const page = svg.closest(".page");
      const pr = page.getBoundingClientRect();
      const k = 1920 / pr.width;
      const rects = [];
      page.querySelectorAll(".dv-num, .dv-title, .dv-note, .cv-plate, .cv-foot p").forEach((el) => {
        let r;
        if (el.classList.contains("cv-plate")) r = el.getBoundingClientRect();
        else { const range = document.createRange(); range.selectNodeContents(el); r = range.getBoundingClientRect(); }
        if (r.width) rects.push({ x: (r.left - pr.left) * k - t, y: (r.top - pr.top) * k - t, w: r.width * k + 2 * t, h: r.height * k + 2 * t });
      });
      applyCut(svg, rects, box);
      return;
    }
    const rects = [...svg.querySelectorAll(".ko")].map((el) => {
      const b = el.getBBox();
      return { x: b.x - t, y: b.y - t, w: b.width + 2 * t, h: b.height + 2 * t };
    });
    applyCut(svg, rects, box);
  });
  document.body.dataset.ready = "1";
}
document.fonts.ready.then(() => requestAnimationFrame(cutRings));
