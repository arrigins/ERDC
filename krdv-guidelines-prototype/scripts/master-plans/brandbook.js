// Масштаб страниц под окно (в печати — 1:1)
function fit() {
  document.documentElement.style.setProperty("--z", Math.min(1, (window.innerWidth - 48) / 1920));
}
fit();
window.addEventListener("resize", fit);

// Правило графики: кольцо прерывается перед текстом, логотипом и баблом (зазор t).
// Дуги режутся по радиусу, обрубки короче 2,5t убираются. Всё остаётся векторным в PDF.
const NS = "http://www.w3.org/2000/svg";

function arcPath(cx, cy, r, a0, a1) {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

function cutArcs(svg, rects, t) {
  if (!rects.length) return;
  const pad = t / 2;
  const inside = (x, y) => rects.some((r) => x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad);
  svg.querySelectorAll(".arc[data-arc]").forEach((el) => {
    const [cx, cy, r, a0, a1] = el.dataset.arc.split(" ").map(Number);
    const full = a1 - a0 >= 360;
    const step = Math.min(0.5, ((t / 4) / r) * (180 / Math.PI));
    const minA = ((2.5 * t) / r) * (180 / Math.PI);
    const runs = [];
    let start = null;
    for (let a = a0; a <= a1 + 1e-6; a += step) {
      const vis = !inside(cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180));
      if (vis && start === null) start = a;
      if (!vis && start !== null) { runs.push([start, a - step]); start = null; }
    }
    if (start !== null) runs.push([start, a1]);
    if (runs.length === 1 && runs[0][0] === a0 && runs[0][1] >= a1 - step) return; // дугу не задело
    if (full && runs.length > 1 && runs[0][0] === a0 && runs[runs.length - 1][1] >= a1 - step) {
      const last = runs.pop();
      runs[0] = [last[0] - 360, runs[0][1]];
    }
    runs.filter(([s, e]) => e - s >= minA).forEach(([s, e]) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("class", "arc");
      p.setAttribute("pathLength", "1");
      p.setAttribute("d", arcPath(cx, cy, r, s, e));
      el.parentNode.insertBefore(p, el);
    });
    el.remove();
  });
}

function cutRings() {
  document.querySelectorAll("svg.art").forEach((svg) => {
    if (!svg.querySelector(".arc[data-arc]")) return;
    const t = parseFloat(svg.dataset.t) || 0;
    const rects = [...svg.querySelectorAll(".ko")].map((el) => {
      const b = el.getBBox();
      return { x: b.x - t, y: b.y - t, w: b.width + 2 * t, h: b.height + 2 * t };
    });
    if (svg.classList.contains("fill")) {
      // Обложка и разделители: текст — в HTML поверх SVG на всю страницу
      const page = svg.closest(".page");
      const pr = page.getBoundingClientRect();
      const k = 1920 / pr.width;
      page.querySelectorAll(".dv-num, .dv-title, .cv-plate, .cv-title, .cv-sub").forEach((el) => {
        let r;
        if (el.classList.contains("cv-plate")) r = el.getBoundingClientRect();
        else { const range = document.createRange(); range.selectNodeContents(el); r = range.getBoundingClientRect(); }
        if (r.width) rects.push({ x: (r.left - pr.left) * k - t, y: (r.top - pr.top) * k - t, w: r.width * k + 2 * t, h: r.height * k + 2 * t });
      });
    }
    cutArcs(svg, rects, t);
  });
}

// Анимации веб-версии: блок .anim получает .play, когда виден; уходит с экрана — сбрасывается
function setupAnim() {
  document.querySelectorAll(".anim").forEach((box) => {
    const lag = box.querySelector(".map") ? 0.9 : 0;
    box.querySelectorAll(".arc, .guide").forEach((el, i) => el.style.setProperty("--d", `${lag + i * 0.08}s`));
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle("play", e.isIntersecting));
    }, { threshold: 0.45 });
    document.querySelectorAll(".anim").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".anim").forEach((el) => el.classList.add("play"));
  }
}

document.fonts.ready.then(() => requestAnimationFrame(() => {
  cutRings();
  setupAnim();
  document.body.dataset.ready = "1";
}));
