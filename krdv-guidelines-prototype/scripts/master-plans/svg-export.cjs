// Брендбук → SVG по страницам для правки в Illustrator: каждая строка текста — один текстовый объект,
// графика и логотипы — вектор, фото встроены. Запуск: node svg-export.cjs (нужен сервер из public/ на 4180).
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PUB = path.join(__dirname, "../../public");
const OUT = fs.mkdtempSync(path.join(require("os").tmpdir(), "mp-svg-"));  // в архив, в репозиторий не кладём
const ZIP = path.join(PUB, "master-plans/master-plans-brandbook-svg.zip");

(async () => {
  const url = process.argv[2] || "http://localhost:4180/master-plans.html";
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1968, height: 1100 } });
  await pg.emulateMedia({ media: "print" });
  await pg.goto(url);
  await pg.waitForSelector("body[data-ready]");
  await pg.waitForTimeout(800);
  const pages = await pg.evaluate(exportAll);
  pages.forEach((svg, i) => fs.writeFileSync(path.join(OUT, `master-plans-${String(i + 1).padStart(2, "0")}.svg`), svg));
  await b.close();
  fs.rmSync(ZIP, { force: true });
  execFileSync("zip", ["-q", "-j", ZIP, ...fs.readdirSync(OUT).sort().map((f) => path.join(OUT, f))]);
  fs.rmSync(OUT, { recursive: true, force: true });
  console.log(`→ ${pages.length} SVG, ${ZIP}`);
})();

// ───────── выполняется в браузере ─────────
async function exportAll() {
  const NS = "http://www.w3.org/2000/svg";
  const FONT = { 400: "TTNormsPro-Rg", 500: "TTNormsPro-Md", 700: "TTNormsPro-Bd", 800: "TTNormsPro-XBd" };
  const fam = (w) => `${FONT[w] || FONT[400]}, 'TT Norms Pro'`;
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const n = (v) => Math.round(v * 100) / 100;
  const clear = (c) => !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c);
  const ctx = document.createElement("canvas").getContext("2d");
  const ascent = (w, size) => { ctx.font = `${w} ${size}px "TT Norms Pro"`; return ctx.measureText("Hg").fontBoundingBoxAscent; };
  let uid = 0;

  const svgCache = {};
  async function svgFile(href) {
    if (!svgCache[href]) svgCache[href] = await (await fetch(href)).text();
    const doc = new DOMParser().parseFromString(svgCache[href], "image/svg+xml").documentElement;
    const p = `i${++uid}-`;
    doc.querySelectorAll("[id]").forEach((e) => (e.id = p + e.id));
    let inner = doc.innerHTML.replace(/url\(#/g, `url(#${p}`).replace(/href="#/g, `href="#${p}`);
    inner = inner.replace(/<style[\s\S]*?<\/style>/g, (st) => st.replace(/\.(st\d+)/g, `.${p}$1`)).replace(/class="(st\d+)"/g, `class="${p}$1"`);
    return { viewBox: doc.getAttribute("viewBox"), inner };
  }
  const rasterCache = {};
  async function raster(href) {
    if (rasterCache[href]) return rasterCache[href];
    const img = new Image();
    img.src = href;
    await img.decode();
    const k = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
    return (rasterCache[href] = c.toDataURL("image/jpeg", 0.9));
  }
  async function imageTag(href, x, y, w, h, par = "xMidYMid meet", extra = "") {
    if (/\.svg($|\?)/.test(href)) {
      const s = await svgFile(href);
      return `<svg x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" viewBox="${s.viewBox}" preserveAspectRatio="${par}" ${extra}>${s.inner}</svg>`;
    }
    return `<image x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" preserveAspectRatio="${par}" href="${await raster(href)}" ${extra}/>`;
  }

  async function artSvg(svg, x, y, w, h) {
    const clone = svg.cloneNode(true);
    // шрифт у каждого текста — по начертанию
    const src = svg.querySelectorAll("text"), dst = clone.querySelectorAll("text");
    src.forEach((t, i) => {
      const cs = getComputedStyle(t);
      dst[i].setAttribute("font-family", fam(+cs.fontWeight));
      dst[i].setAttribute("font-weight", cs.fontWeight);
      if (!dst[i].getAttribute("fill")) dst[i].setAttribute("fill", cs.fill);
    });
    clone.querySelectorAll("tspan").forEach((t) => { if (!t.getAttribute("fill")) t.removeAttribute("fill"); });
    // id уникальные в пределах страницы
    const p = `a${++uid}-`;
    clone.querySelectorAll("[id]").forEach((e) => (e.id = p + e.id));
    clone.querySelectorAll("*").forEach((e) => {
      for (const a of ["clip-path", "fill", "stroke", "mask"]) {
        const v = e.getAttribute(a);
        if (v && v.includes("url(#")) e.setAttribute(a, v.replace(/url\(#/g, `url(#${p}`));
      }
      e.removeAttribute("class");
      e.removeAttribute("pathLength");
      [...e.attributes].filter((a) => a.name.startsWith("data-")).forEach((a) => e.removeAttribute(a.name));
      if (e.getAttribute("style")) e.setAttribute("style", e.getAttribute("style").replace(/--[\w-]+:[^;]+;?/g, ""));
    });
    for (const im of [...clone.querySelectorAll("image")]) {
      const href = im.getAttribute("href");
      const tag = await imageTag(href, +im.getAttribute("x") || 0, +im.getAttribute("y") || 0, +im.getAttribute("width"), +im.getAttribute("height"),
        im.getAttribute("preserveAspectRatio") || "xMidYMid meet", im.getAttribute("clip-path") ? `clip-path="${im.getAttribute("clip-path")}"` : "");
      const holder = document.createElementNS(NS, "g");
      holder.innerHTML = tag;
      im.replaceWith(...holder.childNodes);
    }
    return `<svg x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" viewBox="${svg.getAttribute("viewBox")}" preserveAspectRatio="${svg.getAttribute("preserveAspectRatio") || "xMidYMid meet"}" overflow="hidden">${clone.innerHTML}</svg>`;
  }

  function textLines(el, cs, pr) {
    const out = [];
    const w = +cs.fontWeight, size = parseFloat(cs.fontSize);
    const asc = ascent(w, size);
    const upper = cs.textTransform === "uppercase";
    const ls = cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing);
    for (const node of el.childNodes) {
      if (node.nodeType !== 3 || !node.textContent.trim()) continue;
      const txt = node.textContent;
      const lines = [];
      const re = /[^\s]+/g;
      let m;
      while ((m = re.exec(txt))) {
        const r = document.createRange();
        r.setStart(node, m.index);
        r.setEnd(node, m.index + m[0].length);
        const rc = r.getClientRects()[0];
        if (!rc) continue;
        const last = lines[lines.length - 1];
        if (last && Math.abs(last.top - rc.top) < size * 0.5) { last.end = m.index + m[0].length; last.right = rc.right; }
        else lines.push({ top: rc.top, left: rc.left, right: rc.right, start: m.index, end: m.index + m[0].length });
      }
      for (const L of lines) {
        let s = txt.slice(L.start, L.end).replace(/\s+/g, (sp) => (sp.includes(" ") ? " " : " "));
        if (upper) s = s.toUpperCase();
        out.push(`<text x="${n(L.left - pr.left)}" y="${n(L.top - pr.top + asc)}" font-family="${fam(w)}" font-weight="${w}" font-size="${n(size)}" fill="${cs.color}"${ls ? ` letter-spacing="${n(ls)}"` : ""}${+cs.opacity < 1 ? ` opacity="${cs.opacity}"` : ""}>${esc(s)}</text>`);
      }
    }
    return out;
  }

  function boxes(el, cs, r, pr) {
    const out = [];
    const x = r.left - pr.left, y = r.top - pr.top;
    if (!clear(cs.backgroundColor)) out.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(r.width)}" height="${n(r.height)}" rx="${parseFloat(cs.borderTopLeftRadius) || 0}" fill="${cs.backgroundColor}"/>`);
    if (cs.boxShadow && cs.boxShadow.includes("inset")) {
      const col = (cs.boxShadow.match(/rgba?\([^)]*\)/) || [])[0];
      if (col) out.push(`<rect x="${n(x + 0.5)}" y="${n(y + 0.5)}" width="${n(r.width - 1)}" height="${n(r.height - 1)}" rx="${parseFloat(cs.borderTopLeftRadius) || 0}" fill="none" stroke="${col}"/>`);
    }
    const bt = parseFloat(cs.borderTopWidth), bl = parseFloat(cs.borderLeftWidth);
    if (bt && !clear(cs.borderTopColor)) out.push(`<rect x="${n(x)}" y="${n(y)}" width="${n(r.width)}" height="${bt}" fill="${cs.borderTopColor}"/>`);
    if (bl && !clear(cs.borderLeftColor)) out.push(`<rect x="${n(x)}" y="${n(y)}" width="${bl}" height="${n(r.height)}" fill="${cs.borderLeftColor}"/>`);
    // маркеры списков и значки «так / не так» (псевдоэлементы)
    const ps = getComputedStyle(el, "::before");
    if (ps.content && ps.content !== "none" && ps.content !== "normal" && !clear(ps.backgroundColor) && parseFloat(ps.width)) {
      const px = x + (parseFloat(ps.left) || 0), py = y + (parseFloat(ps.top) || 0), pw = parseFloat(ps.width), ph = parseFloat(ps.height);
      out.push(`<rect x="${n(px)}" y="${n(py)}" width="${n(pw)}" height="${n(ph)}" rx="${n(Math.min(pw, ph) / 2)}" fill="${ps.backgroundColor}"/>`);
      const k = pw / 24;
      if (ps.backgroundImage.includes("M6 12.5")) out.push(`<path d="M6 12.5l4 4 8-9" transform="translate(${n(px)} ${n(py)}) scale(${n(k)})" fill="none" stroke="#fff" stroke-width="2.6"/>`);
      if (ps.backgroundImage.includes("M7 7")) out.push(`<path d="M7 7l10 10M17 7L7 17" transform="translate(${n(px)} ${n(py)}) scale(${n(k)})" fill="none" stroke="#fff" stroke-width="2.6"/>`);
    }
    return out;
  }

  const result = [];
  for (const page of document.querySelectorAll(".page")) {
    const pr = page.getBoundingClientRect();
    const parts = [`<rect width="1920" height="1080" fill="${getComputedStyle(page).backgroundColor}"/>`];
    for (const el of page.querySelectorAll("*")) {
      if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const tag = el.tagName.toLowerCase();
      if (tag === "svg") { parts.push(await artSvg(el, r.left - pr.left, r.top - pr.top, r.width, r.height)); continue; }
      if (tag === "img") { parts.push(await imageTag(el.getAttribute("src"), r.left - pr.left, r.top - pr.top, r.width, r.height)); continue; }
      parts.push(...boxes(el, cs, r, pr), ...textLines(el, cs, pr));
    }
    result.push(`<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080">\n${parts.join("\n")}\n</svg>\n`);
  }
  return result;
}
