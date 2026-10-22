import React, { useEffect, useRef } from "react";
import { ColorPanels, GrainGradient, MeshGradient, Warp } from "@paper-design/shaders-react";

// Варианты обложки «Обзора» (22.10). Отдельная страница для выбора, в гайд не встроена.
// Палитра — основная палитра КРДВ (обновлена 22.10).
const C = {
  dark: "#091b38",
  far: "#243d8d",
  deep: "#1553b7",
  sky: "#00a9eb",
  light: "#8cc8ff",
  ice: "#e5f2ff",
  red: "#de2327",
};

const shader = {
  fit: "cover",
  maxPixelCount: 2400000,
  minPixelRatio: 1,
  style: { position: "absolute", inset: 0, width: "100%", height: "100%" },
};

function Current() {
  return <ColorPanels {...shader} colors={[C.far, C.sky, C.light, C.red]} colorBack={C.dark} density={1.18} length={1.7} angle1={0.34} angle2={-0.18} blur={0.06} edges speed={0.16} gradient={0.18} />;
}

function Silk() {
  return <Warp {...shader} colors={[C.dark, "#0d2560", C.far, C.deep, C.sky, C.light]} proportion={0.5} softness={1} distortion={0.16} swirl={0.75} swirlIterations={10} shape="edge" shapeScale={0.06} rotation={0.6} speed={0.18} />;
}

function Horizon() {
  return (
    <div className="oc-horizon">
      <div className="oc-horizon-sky" />
      <div className="oc-horizon-dawn" />
      <div className="oc-horizon-sea" />
      <div className="oc-horizon-line" />
      <div className="oc-horizon-spark" />
      <div className="oc-grain" />
    </div>
  );
}

function Grain() {
  return <GrainGradient {...shader} colorBack={C.dark} colors={[C.deep, C.sky, C.light, C.far]} softness={0.75} intensity={0.35} noise={0.4} shape="corners" speed={0.5} />;
}

function Fluted() {
  return (
    <>
      <MeshGradient {...shader} colors={[C.dark, C.deep, C.sky, C.far, C.light]} distortion={0.85} swirl={0.25} speed={0.22} />
      <div className="oc-ribs" />
    </>
  );
}

// «Поверхность»: тонкие линии воды, ближе к зрителю — реже и сильнее качаются
function Surface() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (time) => {
      const t = time / 1000;
      ctx.clearRect(0, 0, w, h);
      const lines = 30;
      const horizon = h * 0.18;
      for (let i = 0; i < lines; i += 1) {
        const k = i / (lines - 1); // 0 — горизонт, 1 — ближе к зрителю
        const depth = k * k;
        const y0 = horizon + depth * (h * 0.95 - horizon);
        const amp = 2 + depth * 22;
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        const a = 0.22 + 0.45 * k + 0.25 * (1 - k);
        grad.addColorStop(0, "rgba(140, 200, 255, 0)");
        grad.addColorStop(0.35, `rgba(140, 200, 255, ${a * 0.6})`);
        grad.addColorStop(0.7, `rgba(229, 242, 255, ${a})`);
        grad.addColorStop(1, "rgba(140, 200, 255, 0.05)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.6 + depth * 1.1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const u = x / w;
          const y = y0
            + Math.sin(u * 5.2 + t * 0.35 + i * 0.42) * amp * 0.6
            + Math.sin(u * 11.7 - t * 0.22 + i * 0.9) * amp * 0.3
            + Math.sin(u * 2.1 + t * 0.12) * amp * 0.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // единственная красная метка — точка света на горизонте
      const sx = w * (0.72 + Math.sin(t * 0.08) * 0.02);
      const glow = ctx.createRadialGradient(sx, horizon, 0, sx, horizon, 26);
      glow.addColorStop(0, "rgba(255, 130, 120, 1)");
      glow.addColorStop(0.15, "rgba(222, 35, 39, 0.7)");
      glow.addColorStop(1, "rgba(222, 35, 39, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(sx - 30, horizon - 30, 60, 60);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <div className="oc-surface">
      <canvas ref={ref} />
    </div>
  );
}

const variants = [
  { id: "now", n: "0", title: "Сейчас", text: "Для сравнения: панели, которые напоминают сканер.", View: Current },
  { id: "silk", n: "1", title: "Шёлк", text: "Мягкие складки ткани в синих тонах. Спокойно, дорого, без резких граней. Движение — медленное колыхание.", View: Silk },
  { id: "horizon", n: "2", title: "Горизонт", text: "Тонкая светящаяся линия воды и неба, над ней медленно разгорается рассвет. Одна красная точка — «здесь начинается день». Связь с лотосом над водой и с идеей «Восток».", View: Horizon },
  { id: "grain", n: "3", title: "Зерно", text: "Плавный градиент с плёночным зерном. Редакционная, «журнальная» фактура, тёплая и живая.", View: Grain },
  { id: "fluted", n: "4", title: "Рифлёное стекло", text: "Живой градиент за рифлёным стеклом: свет переливается по рёбрам. Архитектурно и современно.", View: Fluted },
  { id: "surface", n: "5", title: "Поверхность", text: "Тонкие линии водной глади уходят к горизонту и медленно дышат. Графично и сдержанно, на горизонте — красная точка рассвета.", View: Surface },
];

export function OverviewCovers() {
  return (
    <main className="oc-page">
      <header className="oc-head">
        <p className="oc-kicker">Обложка «Обзора» · черновик для выбора</p>
        <h1>Пять вариантов обложки</h1>
        <p className="oc-intro">Обложки показаны в размере шапки гайда. Все варианты анимированы и собраны из основной палитры КРДВ. Выберите номер — поставлю его в гайд.</p>
      </header>
      {variants.map(({ id, n, title, text, View }) => (
        <section key={id} className="oc-variant" id={id}>
          <div className="oc-caption">
            <span className="oc-n">{n}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
            </div>
          </div>
          <div className="oc-hero">
            <View />
            <div className="oc-title">
              <span>00</span>
              <span>Обзор</span>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
