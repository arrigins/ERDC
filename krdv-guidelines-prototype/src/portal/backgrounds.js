// Фирменные градиентные фоны для карточек: 5 готовых вариантов по образцам дизайн-команды
// и генератор новых из того же ограниченного набора оттенков. Логические пиксели 1080 × 1080.

const palette = {
  deep: "#0120f2",
  blue: "#0152ee",
  azure: "#0092ed",
  sky: "#00a8ea",
  cyan: "#4ddcf1",
  lavender: "#9aa6f8",
  pale: "#dff6fb",
};

const LIGHT = ["cyan", "lavender", "pale"];
const MID = ["blue", "azure", "sky"];

// blob: центр, радиус, цвет, непрозрачность; sx/rot — вытянутое пятно
export const backgroundPresets = [
  {
    id: "glow",
    title: "Сияние",
    base: "#0120f2",
    blobs: [
      { x: 160, y: -120, r: 760, c: "azure", a: 0.75 },
      { x: 1000, y: 40, r: 640, c: "cyan", a: 0.85 },
      { x: 1080, y: -40, r: 360, c: "pale", a: 0.95 },
      { x: 1080, y: 620, r: 460, c: "lavender", a: 0.55 },
      { x: -40, y: 1100, r: 560, c: "blue", a: 0.6 },
    ],
  },
  {
    id: "silk",
    title: "Шёлк",
    base: "#1a3bf2",
    edge: { x: 1560, y: -760, r: 1520, c: "lavender" },
    blobs: [
      { x: 540, y: 1220, r: 760, c: "sky", a: 0.9 },
      { x: -40, y: 1120, r: 360, c: "cyan", a: 0.95 },
      { x: 1100, y: 1100, r: 420, c: "lavender", a: 0.75 },
    ],
  },
  {
    id: "lagoon",
    title: "Лагуна",
    base: "#0130f0",
    blobs: [
      { x: -160, y: 360, r: 980, c: "sky", a: 0.85 },
      { x: -30, y: -30, r: 260, c: "cyan", a: 0.9 },
      { x: -40, y: 1120, r: 620, c: "lavender", a: 0.85 },
      { x: 1120, y: -60, r: 520, c: "deep", a: 0.9 },
    ],
  },
  {
    id: "arc",
    title: "Дуга",
    base: "#0a24f2",
    blobs: [
      { x: -170, y: 420, r: 460, c: "sky", a: 0.9, sx: 0.7, rot: 0 },
      { x: 860, y: 1110, r: 360, c: "sky", a: 0.95, sx: 0.8, rot: -0.5 },
      { x: 600, y: 980, r: 300, c: "blue", a: 0.6 },
    ],
  },
  {
    id: "rays",
    title: "Лучи",
    base: "#0a24f2",
    blobs: [
      { x: 340, y: 920, r: 320, c: "sky", a: 0.95, sx: 2.1, rot: -0.62 },
      { x: 1110, y: 470, r: 360, c: "azure", a: 0.9, sx: 0.6, rot: 0.3 },
      { x: 1100, y: 1110, r: 320, c: "azure", a: 0.8 },
    ],
  },
];

// Детерминированный генератор: одинаковое число — одинаковый фон (в превью и в файле)
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generatedSpec(seed) {
  const rand = mulberry32(seed);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const between = (min, max) => min + rand() * (max - min);
  const blobs = [];
  const count = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < count; i += 1) {
    const light = rand() < 0.45;
    const c = light ? pick(LIGHT) : pick(MID);
    // Светлые пятна — справа или снизу, чтобы белый заголовок слева сверху читался
    let x;
    let y;
    if (light) {
      if (rand() < 0.5) {
        x = between(820, 1180);
        y = between(-120, 1180);
      } else {
        x = between(-120, 1180);
        y = between(820, 1180);
      }
    } else {
      x = between(-150, 1230);
      y = between(-150, 1230);
    }
    blobs.push({
      x,
      y,
      r: between(light ? 260 : 380, light ? 620 : 900),
      c,
      a: light ? between(0.6, 0.95) : between(0.45, 0.8),
      sx: rand() < 0.4 ? between(0.55, 2.1) : 1,
      rot: between(-1.2, 1.2),
    });
  }
  // Кромка — только в правом нижнем углу, чтобы светлая дуга не проходила через текст
  const edge = rand() < 0.35 ? { x: between(1650, 1850), y: between(1650, 1850), r: between(1150, 1300), c: rand() < 0.6 ? "lavender" : "cyan" } : null;
  return { base: pick(["#0120f2", "#0a24f2", "#1a3bf2", "#0130f0"]), blobs, edge };
}

export function specFor(bg) {
  if (bg?.preset) return backgroundPresets.find((item) => item.id === bg.preset) || backgroundPresets[0];
  if (bg?.seed) return generatedSpec(bg.seed);
  return backgroundPresets[0];
}

function rgba(hex, alpha) {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
}

export function drawBrandBackground(ctx, bg) {
  const spec = specFor(bg);
  ctx.fillStyle = spec.base;
  ctx.fillRect(0, 0, 1080, 1080);

  if (spec.edge) {
    // «Шёлковая» кромка: большой круг за краем кадра со светлым ободом
    const color = palette[spec.edge.c] || spec.edge.c;
    const g = ctx.createRadialGradient(spec.edge.x, spec.edge.y, spec.edge.r * 0.55, spec.edge.x, spec.edge.y, spec.edge.r);
    g.addColorStop(0, rgba(color, 0));
    g.addColorStop(0.82, rgba(color, 0.35));
    g.addColorStop(0.985, rgba("#e6e9ff", 0.75));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
  }

  for (const blob of spec.blobs) {
    const color = palette[blob.c] || blob.c;
    ctx.save();
    ctx.translate(blob.x, blob.y);
    ctx.rotate(blob.rot || 0);
    ctx.scale(blob.sx || 1, 1);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, blob.r);
    g.addColorStop(0, rgba(color, blob.a));
    g.addColorStop(0.45, rgba(color, blob.a * 0.55));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, blob.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export const randomSeed = () => 1 + Math.floor(Math.random() * 2_000_000_000);
