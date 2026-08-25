import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const root = process.cwd();
const assetsDir = path.join(root, "video-assets");
const output = path.join(root, "video-gioi-thieu-thu-vien.mp4");
const imageNames = [
  "01-trang-chu.png",
  "02-kho-sach.png",
  "03-chi-tiet-sach.png",
  "04-chatbot.png",
  "05-cong-dong.png",
];
const duration = 10;
const transition = 1.4;
const voice = path.join(assetsDir, "voiceover.mp3");

if (!ffmpegPath) throw new Error("Không tìm thấy FFmpeg.");
const missing = imageNames.filter((name) => !fs.existsSync(path.join(assetsDir, name)));
if (missing.length) {
  throw new Error(`Thiếu ảnh trong video-assets: ${missing.join(", ")}`);
}

const args = ["-y"];
for (const name of imageNames) {
  args.push("-i", path.join(assetsDir, name));
}
if (fs.existsSync(voice)) args.push("-i", voice);

const filters = imageNames.map((_, index) =>
  `[${index}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p,zoompan=z='min(zoom+0.0008,1.04)':d=${duration * 25}:s=1920x1080:fps=25[v${index}]`,
);
let current = "[v0]";
for (let index = 1; index < imageNames.length; index += 1) {
  const offset = index * (duration - transition);
  const next = `[v${index}]`;
  const out = `[mix${index}]`;
  filters.push(`${current}${next}xfade=transition=fade:duration=${transition}:offset=${offset}${out}`);
  current = out;
}
args.push("-filter_complex", `${filters.join(";")};${current}format=yuv420p[vout]`, "-map", "[vout]");
if (fs.existsSync(voice)) {
  args.push("-map", `${imageNames.length}:a`, "-shortest", "-c:a", "aac", "-b:a", "192k");
}
args.push("-r", "25", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", output);

const child = spawn(ffmpegPath, args, { stdio: "inherit" });
child.on("close", (code) => {
  if (code === 0) console.log(`Đã tạo: ${path.relative(root, output)}`);
  else process.exitCode = code ?? 1;
});