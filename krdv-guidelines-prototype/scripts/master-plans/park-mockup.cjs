// Стела для мокапа «Парки и скверы»: снимает плоский макет со страницы в PNG (для park-mockup.py).
// Запуск: node scripts/master-plans/park-mockup.cjs <out.png>  (при сервере на 4180 из public/)
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1968, height: 1200 }, deviceScaleFactor: 4 });
  await p.goto("http://localhost:4180/master-plans.html", { waitUntil: "networkidle" });
  await p.waitForSelector("body[data-ready]");
  await p.emulateMedia({ media: "print" });
  await p.locator("#stele-flat svg").screenshot({ path: process.argv[2] });
  await b.close();
})();
