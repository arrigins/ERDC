// PDF брендбука: node pdf.cjs [адрес страницы] — нужен локальный сервер из public/
// (cd public && python3 -m http.server 4180)
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const url = process.argv[2] || "http://localhost:4180/master-plans.html";
  const out = path.join(__dirname, "../../public/master-plans/master-plans-brandbook.pdf");
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1968, height: 1100 } });
  await pg.emulateMedia({ media: "print" });
  await pg.goto(url);
  await pg.waitForSelector("body[data-ready]");
  await pg.waitForTimeout(800);
  await pg.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await b.close();
  console.log("→", out);
})();
