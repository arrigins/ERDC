import React from "react";
import { GrainGradient, MeshGradient, ShaderMount } from "@paper-design/shaders-react";
import { causticsShader, dawnShader, mistShader, ribbonShader } from "./shaders.js";

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
  { id: "horizon", n: "1", title: "Горизонт (был 2)", text: "Как было: прямая линия воды и неба, розовый рассвет, красная точка.", View: Horizon },
  { id: "grain", n: "2", title: "Зерно (был 3)", text: "Как было: плавный градиент с плёночным зерном.", View: Grain },
  { id: "dawn", n: "3", title: "Рассвет — 2 + 3", text: "Цвета горизонта, но линия воды живая и мягко дышит, по воде идут медленные блики. Сиреневый свет шире и плавнее, солнце — размытое, коралловое. Сверху мелкое зерно.", View: () => <Custom fragment={dawnShader} /> },
  { id: "fluted", n: "4", title: "Рифлёное стекло 2", text: "Убрала серый в переходах: соседние цвета теперь из одной гаммы — ультрамарин, голубой, сиреневый и тёплый коралловый отблеск. Мелкое зерно.", View: Fluted2 },
  { id: "caustics", n: "5", title: "Свет под водой", text: "Солнечная сетка на глубине и косые лучи сверху, как на фото океана в палитре. Спокойно, глубоко, в наших синих.", View: () => <Custom fragment={causticsShader} /> },
  { id: "ribbon", n: "6", title: "Лента", text: "Одна светящаяся шёлковая лента медленно изгибается на тёмно-синем. Цвет переходит от кораллового через сиреневый к голубому — как рассвет.", View: () => <Custom fragment={ribbonShader} /> },
  { id: "mist", n: "7", title: "Туман", text: "Слои тумана над водой плывут с разной скоростью, справа — тёплый просвет. Почти монохром, очень тихо.", View: () => <Custom fragment={mistShader} /> },
];

export function OverviewCovers() {
  return (
    <main className="oc-page">
      <header className="oc-head">
        <p className="oc-kicker">Обложка «Обзора» · черновик для выбора</p>
        <h1>Обложка «Обзора»: второй круг</h1>
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
