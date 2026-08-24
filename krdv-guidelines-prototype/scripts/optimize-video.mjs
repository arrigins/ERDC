import { spawn } from "node:child_process";
import { mkdir, rename, stat, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import ffmpegPath from "ffmpeg-static";

const args = process.argv.slice(2);

function optionValue(name, fallback) {
  const prefix = `--${name}=`;
  const inline = args.find((item) => item.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = args.indexOf(`--${name}`);
  if (index >= 0 && args[index + 1]) return args[index + 1];
  return fallback;
}

const positional = args.filter((item, index) => {
  if (item.startsWith("--")) return false;
  const previous = args[index - 1];
  return !previous?.startsWith("--") || previous.includes("=");
});

const input = positional[0];
const output = positional[1];

if (!input || !output) {
  console.error("Usage: npm run optimize:video -- <input.mp4> <output.mp4> [--max-width=1920] [--crf=28] [--fps=30]");
  process.exit(1);
}

const source = resolve(input);
const target = resolve(output);
const maxWidth = Number.parseInt(optionValue("max-width", "1920"), 10);
const crf = Number.parseInt(optionValue("crf", "28"), 10);
const fps = Number.parseInt(optionValue("fps", "30"), 10);
const tempTarget = `${target}.tmp-${process.pid}.mp4`;

if (!ffmpegPath) {
  console.error("ffmpeg-static did not provide a binary path.");
  process.exit(1);
}

await mkdir(dirname(target), { recursive: true });

const command = [
  "-y",
  "-i",
  source,
  "-map",
  "0:v:0",
  "-an",
  "-vf",
  `fps=${fps},scale=w=min(${maxWidth}\\,iw):h=-2`,
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  String(crf),
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  tempTarget,
];

const sourceSize = (await stat(source)).size;

await new Promise((resolvePromise, reject) => {
  const child = spawn(ffmpegPath, command, { stdio: ["ignore", "inherit", "inherit"] });
  child.on("error", reject);
  child.on("close", (code) => {
    if (code === 0) resolvePromise();
    else reject(new Error(`ffmpeg exited with code ${code}`));
  });
});

await rename(tempTarget, target);

const targetSize = (await stat(target)).size;
const saved = Math.max(0, 1 - targetSize / sourceSize);

console.log(
  JSON.stringify(
    {
      input: source,
      output: target,
      sourceMb: Number((sourceSize / 1024 / 1024).toFixed(2)),
      outputMb: Number((targetSize / 1024 / 1024).toFixed(2)),
      savedPercent: Number((saved * 100).toFixed(1)),
      maxWidth,
      fps,
      crf,
    },
    null,
    2,
  ),
);

try {
  await unlink(tempTarget);
} catch {}
