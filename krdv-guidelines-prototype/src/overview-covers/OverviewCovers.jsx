import React from "react";
import { GrainGradient, MeshGradient, ShaderMount } from "@paper-design/shaders-react";
import { flowShader, grainAuroraShader, horizonSoftShader, ribbonShader } from "./shaders.js";

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

// Зерно в основной палитре: тёмно-синий фон, Дальневосточный и глубокий синий, тёплый красный акцент
function GrainBrand() {
  return <GrainGradient {...shader} colorBack={C.dark} colors={[C.far, C.deep, "#3b2f8f", C.red]} softness={0.8} intensity={0.3} noise={0.35} shape="corners" speed={0.5} />;
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

// 4 → «Рифлёное стекло 2»: без тёмных и светлых соседей в градиенте (из-за них был серый), с ультрамарином и сиреневым
function Fluted2() {
  return (
    <>
      <MeshGradient {...shader} colors={["#0b2a8a", "#1230c9", "#00a9eb", "#6e63f0", "#1553b7", "#ff8a7a"]} distortion={0.8} swirl={0.3} speed={0.2} />
      <div className="oc-ribs" />
      <div className="oc-grain is-fine" />
    </>
  );
}

function Custom({ fragment, speed = 1 }) {
  return <ShaderMount {...shader} fragmentShader={fragment} uniforms={{}} speed={speed} />;
}

const variants = [
  { id: "horizon", n: "1", title: "Горизонт", text: "Для памяти: первый вариант.", View: Horizon },
  { id: "grain", n: "2", title: "Зерно", text: "Для памяти: первый вариант с зерном.", View: Grain },
  { id: "grain-brand", n: "3", title: "Зерно в фирменных цветах", text: "Для памяти.", View: GrainBrand },
  { id: "fluted", n: "4", title: "Рифлёное стекло 2", text: "Для памяти.", View: Fluted2 },
  { id: "ribbon", n: "5", title: "Лента", text: "Для памяти.", View: () => <Custom fragment={ribbonShader} /> },
  { id: "horizon-soft", n: "6", title: "Горизонт 2 — новый", text: "Цвета «Горизонта». На воде больше нет полос: гладкий градиент и мягкая дорожка света, которая медленно переливается. Линия горизонта — мягкое свечение. Солнце — размытое, коралловое. Сиреневый свет растекается плавно. Мелкое зерно.", View: () => <Custom fragment={horizonSoftShader} /> },
  { id: "grain-aurora", n: "7", title: "Зерно — с намёком на сияние — новый", text: "Как «Зерно»: крупные мягкие полосы голубого на тёмно-синем, но зерно мелкое, без «баллончика». Внутри света — едва заметные вертикальные занавеси, по краю лёгкий сиреневый, в тёмной части редкие искры-звёзды.", View: () => <Custom fragment={grainAuroraShader} /> },
  { id: "flow", n: "8", title: "Разлитый свет — новый", text: "Вместо тонкой ленты — широкий поток света, только фирменные синие: тёмно-синий, Дальневосточный, глубокий, голубой. Движение очень медленное. Мелкое зерно.", View: () => <Custom fragment={flowShader} /> },
];

export function OverviewCovers() {
  return (
    <main className="oc-page">
      <header className="oc-head">
        <p className="oc-kicker">Обложка «Обзора» · черновик для выбора</p>
        <h1>Обложка «Обзора»: четвёртый круг</h1>
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
