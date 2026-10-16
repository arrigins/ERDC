// Общая вёрстка текста для шаблонов платформы (canvas, логические пиксели 1080).

export const FONT = '"TT Norms Pro"';

// Вёрстка без изменения текста: короткие предлоги и союзы не остаются в конце строки,
// тире не начинает строку (как в постах КРДВ)
export function glueWords(words) {
  const glued = [];
  for (let index = 0; index < words.length; index += 1) {
    let word = words[index];
    while (index + 1 < words.length && /^[«(„"]?[а-яёa-z]{1,2}$/i.test(word.replace(/[,.;:]$/, "")) && !/[,.;:]$/.test(word)) {
      index += 1;
      word = `${word} ${words[index]}`;
    }
    // Число не отрывается от короткого слова или знака после него: «2,5 трлн ₽», «20 лет», «7,6 %»
    while (index + 1 < words.length && /^[<>~≈]?\d[\d.,]*%?$/.test(word.split("\u00a0").pop()) && /^[а-яёa-z₽$€%]{1,4}[.,:;]?$/i.test(words[index + 1])) {
      index += 1;
      word = `${word}\u00a0${words[index]}`;
    }
    if (/^(₽|%|руб\.?)$/.test(word) && glued.length) {
      glued[glued.length - 1] = `${glued[glued.length - 1]}\u00a0${word}`;
      continue;
    }
    if (/^[—–]$/.test(word) && glued.length) {
      glued[glued.length - 1] = `${glued[glued.length - 1]} ${word}`;
    } else {
      glued.push(word);
    }
  }
  return glued;
}

// Слово шире строки режется по буквам: текст никогда не выходит за правое поле
function splitWord(ctx, word, width) {
  const parts = [];
  let part = "";
  for (const char of word) {
    if (part && ctx.measureText(part + char).width > width) {
      parts.push(part);
      part = char;
    } else {
      part += char;
    }
  }
  parts.push(part);
  return parts;
}

// Перенос по словам; неразрывные пробелы и ручные переносы сохраняются
export function wrap(ctx, value, width) {
  const lines = [];
  let tooLong = false;
  for (const paragraph of value.split("\n")) {
    const words = glueWords(paragraph.split(" ").filter((word, index, all) => word !== "" || all.length === 1));
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= width) {
        line = next;
        continue;
      }
      if (line) lines.push(line);
      line = word;
      if (ctx.measureText(word).width > width) {
        tooLong = true;
        const parts = splitWord(ctx, word, width);
        lines.push(...parts.slice(0, -1));
        line = parts[parts.length - 1];
      }
    }
    lines.push(line);
  }
  return { lines, tooLong };
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
