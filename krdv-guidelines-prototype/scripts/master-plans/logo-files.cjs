// Файлы логотипа для скачивания: PNG (прозрачный фон, 3000 px) и PDF (вектор) из чистых SVG + ZIP всех версий.
// Запуск: node logo-files.cjs (после extract-logos.py; сервер не нужен)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const DIR = path.join(__dirname, "../../public/master-plans/logo");
const OUT = path.join(DIR, "files");
const NAMES = ["coral", "blue", "sky", "black", "white"].flatMap((c) => [`mp-${c}`, `mp-${c}-small`]);
const W = 764.75, H = 263.75, PX = 3000;

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const pg = await b.newPage();
  for (const n of NAMES) {
    const svg = fs.readFileSync(path.join(DIR, `${n}.svg`), "utf8");
    fs.copyFileSync(path.join(DIR, `${n}.svg`), path.join(OUT, `${n}.svg`));
    const html = (w, h, unit) => `<!doctype html><style>@page{size:${w}${unit} ${h}${unit};margin:0}html,body{margin:0;background:transparent}svg{display:block;width:${w}${unit};height:${h}${unit}}</style>${svg}`;
    await pg.setViewportSize({ width: PX, height: Math.round((PX * H) / W) });
    await pg.setContent(html(PX, Math.round((PX * H) / W), "px"));
    await pg.screenshot({ path: path.join(OUT, `${n}.png`), omitBackground: true });
    await pg.setContent(html(W, H, "pt"));
    await pg.pdf({ path: path.join(OUT, `${n}.pdf`), preferCSSPageSize: true, printBackground: false });
  }
  await b.close();
  const zip = path.join(DIR, "master-plans-logo.zip");
  fs.rmSync(zip, { force: true });
  execFileSync("zip", ["-q", "-j", zip, ...fs.readdirSync(OUT).sort().map((f) => path.join(OUT, f))]);
  console.log("→", NAMES.length * 3, "файлов +", zip);
})();
