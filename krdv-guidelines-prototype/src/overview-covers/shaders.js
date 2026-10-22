// Свои шейдеры для вариантов обложки «Обзора» (22.10). Монтируются через ShaderMount из @paper-design/shaders-react.
// Координаты: uv 0..1, y снизу вверх; p — с учётом пропорций кадра (x растянут по ширине).

const head = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
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
