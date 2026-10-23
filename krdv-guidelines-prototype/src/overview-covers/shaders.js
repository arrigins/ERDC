// Свои шейдеры для вариантов обложки «Обзора» (22.10). Монтируются через ShaderMount из @paper-design/shaders-react.
// Координаты: uv 0..1, y снизу вверх; p — с учётом пропорций кадра (x растянут по ширине).

const head = `#version 300 es
precision highp float;
// точность общих uniform должна совпадать с вершинным шейдером Paper (mediump), иначе на реальных видеокартах программа не собирается
uniform mediump float u_time;
uniform mediump vec2 u_resolution;
uniform mediump float u_pixelRatio;
out vec4 fragColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
}
float fbm(vec2 p) { float v = 0.; float a = .5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= .5; } return v; }
vec3 rgb(float r, float g, float b) { return vec3(r, g, b) / 255.; }
// мелкое зерно: в пикселях экрана, меняется во времени
float grain(float t) { return hash(floor(gl_FragCoord.xy) + fract(t * 7.) * 91.) - .5; }
`;

// 3. «Рассвет» — горизонт (2) + зерно (3): мягкая живая линия воды, плавный сиреневый свет, размытое коралловое солнце
export const dawnShader = `${head}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time;

  // линия горизонта мягко дышит
  float h = .44 + .012 * sin(uv.x * 2.4 + t * .18) + .006 * sin(uv.x * 6.1 - t * .11);
  float d = uv.y - h;

  // небо
  vec3 skyTop = rgb(7., 18., 48.);
  vec3 skyMid = rgb(22., 52., 128.);
  vec3 skyLow = rgb(92., 128., 214.);
  float s = clamp(d / (1. - h), 0., 1.);
  vec3 sky = mix(skyLow, skyMid, smoothstep(0., .35, s));
  sky = mix(sky, skyTop, smoothstep(.3, 1., s));

  // море: глубже книзу, мягкие вытянутые блики-волны
  vec3 seaTop = rgb(24., 58., 140.);
  vec3 seaBot = rgb(5., 13., 34.);
  float sd = clamp(-d / h, 0., 1.);
  vec3 sea = mix(seaTop, seaBot, smoothstep(0., 1., sd));
  float persp = 1. / (sd + .08);
  float w = fbm(vec2(uv.x * ar * 1.4 + t * .02, persp * 1.6 - t * .12));
  float waves = d < 0. ? smoothstep(.55, .85, w) * (1. - sd) * .35 : 0.;

  // сиреневый свет рассвета — широкий и плавный
  vec2 sunPos = vec2(.68 + .01 * sin(t * .05), h + .035 + .01 * sin(t * .09));
  vec2 q = (uv - sunPos) * vec2(ar, 1.);
  float breathe = .88 + .12 * sin(t * .21);
  float lilac = exp(-dot(q * vec2(.7, 1.6), q * vec2(.7, 1.6)) * 2.2) * breathe;
  float rose = exp(-dot(q * vec2(1.2, 2.4), q * vec2(1.2, 2.4)) * 5.) * breathe;
  vec3 lilacCol = rgb(176., 160., 240.);
  vec3 roseCol = rgb(250., 150., 170.);

  // размытое коралловое солнце
  float sun = exp(-dot(q, q) * 900.);
  float halo = exp(-dot(q, q) * 90.);
  vec3 coral = rgb(255., 122., 102.);

  vec3 col = d > 0. ? sky : sea;
  float lightMask = d > 0. ? 1. : .45; // в воде — отражение слабее
  col = mix(col, lilacCol, clamp(lilac * .62 * lightMask, 0., 1.));
  col = mix(col, roseCol, clamp(rose * .45 * lightMask, 0., 1.));
  // дорожка солнца на воде
  float path = d < 0. ? exp(-pow((uv.x - sunPos.x) * ar * 5., 2.)) * (1. - sd) : 0.;
  col += (rgb(150., 190., 255.) * waves) + coral * path * waves * 1.6;
  // мягкое свечение линии горизонта
  col += rgb(170., 200., 255.) * exp(-abs(d) * 45.) * .18;
  col = mix(col, coral, clamp(halo * .35, 0., 1.));
  col = mix(col, rgb(255., 170., 150.), clamp(sun * .9, 0., 1.));

  col += grain(t) * .035;
  fragColor = vec4(col, 1.);
}
`;

// 5. «Свет под водой» — каустика: солнечная сетка на глубине, лучи сверху
export const causticsShader = `${head}
float caustic(vec2 p, float t) {
  vec2 i = p;
  float c = 1.;
  float inten = .005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1. - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1. / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time * .18;
  vec3 deep = rgb(6., 20., 60.);
  vec3 mid = rgb(21., 83., 183.);
  vec3 top = rgb(0., 169., 235.);
  vec3 col = mix(deep, mid, smoothstep(0., .75, uv.y));
  col = mix(col, top, smoothstep(.55, 1.15, uv.y) * .8);
  // каустика сильнее у поверхности (сверху)
  vec2 p = vec2(uv.x * ar, uv.y) * 4.2;
  vec2 cp = vec2(uv.x, uv.y / ar) * 6.2831;
  float c = caustic(cp - 250., t);
  col += rgb(200., 235., 255.) * c * (.15 + .5 * smoothstep(.2, 1., uv.y));
  // косые лучи
  float ray = 0.;
  for (int k = 0; k < 4; k++) {
    float fk = float(k);
    float x = uv.x * ar + (1. - uv.y) * .45;
    ray += smoothstep(.2, 0., abs(fract(x * .55 + fk * .27 + .03 * sin(t + fk)) - .5)) * (.5 + .5 * sin(t * .7 + fk * 1.7));
  }
  col += rgb(140., 200., 255.) * ray * .06 * smoothstep(0., 1., uv.y);
  col += grain(u_time) * .03;
  fragColor = vec4(col, 1.);
}
`;

// 6. «Лента» — одна светящаяся лента плавно изгибается на тёмно-синем
export const ribbonShader = `${head}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time * .25;
  vec3 col = mix(rgb(4., 10., 30.), rgb(12., 30., 78.), uv.y * .9);
  float x = uv.x;
  // центр и толщина ленты меняются по ширине
  float cy = .52 + .16 * sin(x * 3.1 + t) + .07 * sin(x * 7.3 - t * 1.3);
  float th = .11 + .07 * sin(x * 2.2 - t * .8) * sin(x * 1.3 + t * .4);
  float dy = (uv.y - cy) / max(abs(th), .015);
  float body = exp(-dy * dy * 1.6);
  // «шёлковый» отлив поперёк ленты
  float sheen = .5 + .5 * sin(dy * 2.4 + x * 9. - t * 2.);
  // цвет по длине: коралл → сиреневый → голубой
  vec3 c1 = rgb(255., 122., 102.);
  vec3 c2 = rgb(150., 130., 240.);
  vec3 c3 = rgb(0., 169., 235.);
  vec3 c4 = rgb(140., 200., 255.);
  float k = clamp(x * 1.1 + .05 * sin(t), 0., 1.);
  vec3 rib = k < .35 ? mix(c1, c2, k / .35) : (k < .7 ? mix(c2, c3, (k - .35) / .35) : mix(c3, c4, (k - .7) / .3));
  col = mix(col, rib * (.6 + .55 * sheen), body * .92);
  // мягкое свечение вокруг
  col += rib * exp(-dy * dy * .18) * .12;
  col += grain(u_time) * .035;
  fragColor = vec4(col, 1.);
}
`;

// 7. «Туман» — слои тумана над водой плывут с разной скоростью, монохром + тёплый просвет
export const mistShader = `${head}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time;
  vec3 col = mix(rgb(8., 20., 52.), rgb(96., 132., 205.), smoothstep(.1, 1., uv.y));
  // тёплый просвет справа сверху
  vec2 q = (uv - vec2(.78, .78)) * vec2(ar, 1.);
  col = mix(col, rgb(255., 196., 190.), exp(-dot(q, q) * 1.6) * .35);
  // слои тумана: чем ниже, тем темнее и быстрее
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float base = .78 - fi * .17;
    float edge = base + .07 * fbm(vec2(uv.x * ar * (.6 + fi * .25) + t * (.012 + fi * .01), fi * 3.1));
    float m = smoothstep(edge + .06, edge - .06, uv.y);
    vec3 layer = mix(rgb(70., 110., 190.), rgb(6., 16., 40.), fi / 4.);
    col = mix(col, layer, m * .7);
    col += rgb(180., 210., 255.) * smoothstep(.04, 0., abs(uv.y - edge)) * .08;
  }
  col += grain(t) * .03;
  fragColor = vec4(col, 1.);
}
`;

// ── Четвёртый круг (23.10) ──
// мелкое зерно, обновляется ~12 раз в секунду (без «телевизионного» мелькания)
const fineGrain = `
// целочисленный хеш: без видимой сетки, которую даёт hash() на соседних пикселях
float ihash(vec2 p) {
  uvec2 q = uvec2(ivec2(p) + 100000) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) / 4294967295.;
}
float fineGrain(float t) { return ihash(gl_FragCoord.xy + floor(t * 12.) * vec2(37., 17.)) - .5; }
`;

// 6. «Горизонт 2» — цвета горизонта (1), море без полос: гладкий градиент и мягкая дорожка света,
// размытое коралловое солнце, сиреневый свет растекается плавно, поверх мелкое зерно
export const horizonSoftShader = `${head}${fineGrain}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time;
  float h = .42;
  float d = uv.y - h;

  // небо как у «Горизонта»: от почти чёрно-синего к светлой полосе над водой
  float s = clamp(d / (1. - h), 0., 1.);
  vec3 sky = mix(rgb(169., 198., 240.), rgb(59., 111., 207.), smoothstep(0., .06, s));
  sky = mix(sky, rgb(26., 63., 143.), smoothstep(.04, .3, s));
  sky = mix(sky, rgb(11., 29., 74.), smoothstep(.25, .7, s));
  sky = mix(sky, rgb(5., 13., 34.), smoothstep(.65, 1., s));

  // море: гладкий градиент вниз
  float sd = clamp(-d / h, 0., 1.);
  vec3 sea = mix(rgb(16., 47., 116.), rgb(10., 29., 72.), smoothstep(0., .45, sd));
  sea = mix(sea, rgb(5., 13., 34.), smoothstep(.4, 1., sd));

  vec3 col = d > 0. ? sky : sea;

  // рассвет: сиреневый и розовый свет, очень медленно «дышит»
  vec2 sunPos = vec2(.7, h + .012);
  vec2 q = (uv - sunPos) * vec2(ar, 1.);
  float breathe = .9 + .1 * sin(t * .16);
  float lilac = exp(-dot(q * vec2(.55, 1.5), q * vec2(.55, 1.5)) * 2.) * breathe;
  float rose = exp(-dot(q * vec2(.9, 2.2), q * vec2(.9, 2.2)) * 4.) * breathe;
  float above = smoothstep(-.02, .02, d);
  col = mix(col, rgb(176., 160., 240.), lilac * mix(.18, .6, above));
  col = mix(col, rgb(248., 160., 178.), rose * mix(.12, .45, above));

  // дорожка света на воде — мягкая, без полос; медленно переливается крупными пятнами
  float shimmer = .75 + .25 * noise(vec2(uv.x * 3. + 4., sd * 5. - t * .08));
  float path = exp(-pow((uv.x - sunPos.x) * ar * (2.2 + sd * 3.), 2.)) * (1. - smoothstep(0., .9, sd)) * shimmer;
  col = mix(col, rgb(222., 170., 205.), path * .35 * (1. - above));

  // линия горизонта — мягкое свечение, без жёсткого штриха
  col += rgb(190., 210., 255.) * (exp(-abs(d) * 60.) * .2 + exp(-abs(d) * 500.) * .08);

  // коралловое солнце — сильно размытое
  float r2 = dot(q, q);
  col = mix(col, rgb(255., 128., 108.), clamp(exp(-r2 * 60.) * .4, 0., 1.));
  col = mix(col, rgb(255., 178., 160.), clamp(exp(-r2 * 420.) * .75, 0., 1.));

  col += fineGrain(t) * .03;
  fragColor = vec4(col, 1.);
}
`;

// 7. «Зерно — с намёком на сияние» — как «Зерно» (2): крупные мягкие полосы голубого на тёмно-синем,
// но зерно мелкое; внутри полос — едва заметные вертикальные «занавеси», в тёмных местах редкие искры-звёзды
export const grainAuroraShader = `${head}${fineGrain}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time * .06;
  vec2 p = vec2(uv.x * ar, uv.y);

  // две крупные мягкие диагональные полосы света, как в «Зерне»
  float s = uv.x * .8 - uv.y * .6 + .12 * sin(uv.y * 2.4 + t * 2.) + .1 * (fbm(p * .5 + t) - .5);
  float b1 = exp(-pow((s - .62 - .05 * sin(t * 3.)) / .2, 2.));
  float b2 = exp(-pow((s + .05 + .04 * cos(t * 2.)) / .16, 2.));
  // занавес: мягкая вертикальная модуляция, только внутри света
  float veil = .7 + .3 * smoothstep(.25, .85, noise(vec2(p.x * 3.2 + t * 1.5, uv.y * .35)));
  float light = (b1 + b2 * .8) * veil;

  vec3 col = rgb(9., 27., 56.);
  col = mix(col, rgb(21., 83., 183.), clamp(light * 1.1, 0., 1.));
  col = mix(col, rgb(0., 169., 235.), clamp(pow(light, 1.8) * .9, 0., 1.));
  col = mix(col, rgb(140., 200., 255.), clamp(pow(light, 4.) * .55, 0., 1.));
  // лёгкий сиреневый край у верхней полосы
  col = mix(col, rgb(150., 140., 240.), exp(-pow((s - .86) / .08, 2.)) * .18);

  // редкие искры в тёмной части — как звёзды сквозь зерно
  vec2 cell = floor(gl_FragCoord.xy / 2.);
  float st = ihash(cell + 3.);
  float tw = .55 + .45 * sin(u_time * (.7 + st * 2.) + st * 50.);
  col += vec3(.8, .9, 1.) * step(.9985, st) * tw * (1. - clamp(light * 1.5, 0., 1.)) * .55;

  col += fineGrain(u_time) * .065;
  fragColor = vec4(col, 1.);
}
`;

// 8. «Разлитый свет» — вместо тонкой ленты широкий поток света в фирменных синих, медленный
export const flowShader = `${head}${fineGrain}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time * .1;
  vec2 p = vec2(uv.x * ar, uv.y);

  // ось потока: диагональ, мягко изогнутая
  float s = uv.x * .65 + uv.y * .55 + .1 * sin(uv.x * 2. + t * 1.2) + .12 * (fbm(p * .6 + vec2(t * .3, -t * .2)) - .5);
  vec3 col = mix(rgb(9., 27., 56.), rgb(36., 61., 141.), smoothstep(.15, .85, s));
  // главный поток
  float c = .78 + .04 * sin(t * .9);
  float band = exp(-pow((s - c) / .24, 2.));
  col = mix(col, rgb(21., 83., 183.), band * .9);
  col = mix(col, rgb(0., 169., 235.), pow(band, 2.2) * .75);
  col += rgb(140., 200., 255.) * pow(band, 6.) * .3;
  // второй, тихий поток ниже
  float band2 = exp(-pow((s - c + .42) / .14, 2.));
  col = mix(col, rgb(36., 61., 141.), band2 * .6);

  col += fineGrain(u_time) * .035;
  fragColor = vec4(col, 1.);
}
`;

// ── Пятый круг (23.10): «Зерно с намёком на сияние», деликатнее ──
// Зерно почти неподвижно: два статичных слоя шума медленно перетекают друг в друга (без «ряби старого телевизора»).
// Звёзды тусклые и мерцают медленно, плавно. Сияние движется в 2 раза медленнее. accentA / accentB — оттенки,
// которые подмешиваются в разные полосы (изумрудный, сиреневый).
const auroraSoft = (accentA, accentB, accentAmount) => `${head}
float ihash2(vec2 p) {
  uvec2 q = uvec2(ivec2(p) + 100000) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) / 4294967295.;
}
float calmGrain(float t) {
  vec2 px = floor(gl_FragCoord.xy);
  float k = t * .25;
  float i = floor(k);
  float f = smoothstep(0., 1., fract(k));
  return mix(ihash2(px + i * vec2(37., 17.)), ihash2(px + (i + 1.) * vec2(37., 17.)), f) - .5;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float t = u_time * .03;
  vec2 p = vec2(uv.x * ar, uv.y);

  float s = uv.x * .8 - uv.y * .6 + .1 * sin(uv.y * 2.2 + t * 2.) + .08 * (fbm(p * .45 + t) - .5);
  float b1 = exp(-pow((s - .62 - .04 * sin(t * 2.4)) / .21, 2.));
  float b2 = exp(-pow((s + .05 + .03 * cos(t * 1.7)) / .17, 2.));
  float veil = .78 + .22 * smoothstep(.25, .85, noise(vec2(p.x * 3. + t * 1.1, uv.y * .35)));
  float light = (b1 + b2 * .8) * veil;

  vec3 col = rgb(9., 27., 56.);
  col = mix(col, rgb(21., 83., 183.), clamp(light * 1.1, 0., 1.));
  col = mix(col, rgb(0., 169., 235.), clamp(pow(light, 1.8) * .85, 0., 1.));
  col = mix(col, rgb(140., 200., 255.), clamp(pow(light, 4.) * .5, 0., 1.));
  // оттенки: в нижнюю полосу — accentA, к верхнему краю верхней — accentB; доля меняется очень медленно
  float drift = .5 + .5 * sin(t * 1.3 + uv.x * 1.5);
  col = mix(col, ${accentA}, clamp(b2 * veil * ${accentAmount} * (.6 + .4 * drift), 0., 1.));
  col = mix(col, ${accentB}, exp(-pow((s - .84) / .1, 2.)) * ${accentAmount} * (.7 + .3 * (1. - drift)));

  // звёзды: редкие, тусклые, мерцают медленно и плавно
  vec2 cell = floor(gl_FragCoord.xy / 2.);
  float st = ihash2(cell + 3.);
  float tw = .5 + .5 * cos(u_time * (.25 + st * .35) + st * 60.);
  tw = tw * tw;
  col += vec3(.82, .9, 1.) * step(.9988, st) * tw * (1. - clamp(light * 1.6, 0., 1.)) * .16;

  col += calmGrain(u_time) * .05;
  fragColor = vec4(col, 1.);
}
`;

// 7а — с изумрудным оттенком в нижней полосе и лёгким сиреневым по краю
export const grainAuroraEmeraldShader = auroraSoft("rgb(31., 190., 165.)", "rgb(150., 140., 240.)", ".32");
// 7б — с сиреневым оттенком в нижней полосе и едва заметным изумрудным по краю
export const grainAuroraLilacShader = auroraSoft("rgb(160., 130., 245.)", "rgb(60., 200., 175.)", ".42");

// ── Финал (23.10): обложка «Обзора» в гайде — 7б без звёзд, композиция медленно меняется ──
// Полосы света плавно смещаются и чуть поворачиваются (циклы ~1,5–2,5 мин), вдоль полос бродит более яркий участок,
// поэтому за минуту картинка заметно меняется, но движение остаётся спокойным.
export const overviewCoverShader = `${head}
float ihash2(vec2 p) {
  uvec2 q = uvec2(ivec2(p) + 100000) * uvec2(1597334673u, 3812015801u);
  uint n = (q.x ^ q.y) * 1597334673u;
  n ^= n >> 16u;
  return float(n) / 4294967295.;
}
float calmGrain(float t) {
  vec2 px = floor(gl_FragCoord.xy);
  float k = t * .25;
  float i = floor(k);
  float f = smoothstep(0., 1., fract(k));
  return mix(ihash2(px + i * vec2(37., 17.)), ihash2(px + (i + 1.) * vec2(37., 17.)), f) - .5;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float ar = u_resolution.x / u_resolution.y;
  float T = u_time;
  float t = T * .03;
  vec2 p = vec2(uv.x * ar, uv.y);

  // ось полос медленно поворачивается
  float ang = .64 + .1 * sin(T * .045);
  float s = uv.x * cos(ang) * 1.25 - uv.y * sin(ang) * 1.0
          + .1 * sin(uv.y * 2.2 + t * 2.) + .08 * (fbm(p * .45 + t) - .5);
  // вдоль полос: координата для «бродящего» яркого участка
  float along = uv.x * sin(ang) + uv.y * cos(ang);

  float c1 = .6 + .14 * sin(T * .06);
  float c2 = -.04 + .12 * sin(T * .042 + 1.7);
  float b1 = exp(-pow((s - c1) / (.2 + .03 * sin(T * .05)), 2.));
  float b2 = exp(-pow((s - c2) / (.17 + .03 * cos(T * .037)), 2.));
  b1 *= .7 + .3 * sin(along * 3. - T * .07);
  b2 *= .7 + .3 * sin(along * 2.6 + T * .055 + 2.);
  float veil = .78 + .22 * smoothstep(.25, .85, noise(vec2(p.x * 3. + t * 1.1, uv.y * .35)));
  float light = (b1 + b2 * .8) * veil;

  vec3 col = rgb(9., 27., 56.);
  col = mix(col, rgb(21., 83., 183.), clamp(light * 1.1, 0., 1.));
  col = mix(col, rgb(0., 169., 235.), clamp(pow(light, 1.8) * .85, 0., 1.));
  col = mix(col, rgb(140., 200., 255.), clamp(pow(light, 4.) * .5, 0., 1.));
  float drift = .5 + .5 * sin(t * 1.3 + uv.x * 1.5);
  col = mix(col, rgb(160., 130., 245.), clamp(b2 * veil * .42 * (.6 + .4 * drift), 0., 1.));
  col = mix(col, rgb(60., 200., 175.), exp(-pow((s - c1 - .22) / .1, 2.)) * .42 * (.7 + .3 * (1. - drift)));

  col += calmGrain(T) * .05;
  fragColor = vec4(col, 1.);
}
`;
