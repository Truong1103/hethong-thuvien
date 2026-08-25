import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";

const outputDir = path.resolve("video-assets");
const tempDir = path.resolve(".voice-temp");
const output = path.join(outputDir, "voiceover.mp3");
const sentences = [
  "Xin chào mọi người. Đây là Thư viện Số Lá Xanh, một không gian đọc sách trực tuyến kết hợp tra cứu, đọc sách và hỗ trợ người đọc tìm được cuốn sách phù hợp.",
  "Tại Kho sách, người dùng có thể tìm kiếm theo tên sách, tác giả, thể loại, nhà xuất bản hoặc năm xuất bản. Từ đây, bạn nhanh chóng mở được thông tin chi tiết của từng cuốn sách trong thư viện.",
  "Mỗi cuốn sách đều có phần giới thiệu riêng, hỗ trợ đọc PDF hoặc nghe audio. Tiến độ đọc và nghe được lưu lại để bạn có thể tiếp tục thuận tiện vào lần sau.",
  "Điểm nhấn nổi bật nhất của website là chatbot thủ thư ảo. Bạn có thể đặt câu hỏi bằng tiếng Việt, chẳng hạn như muốn tìm sách tâm lý dễ đọc, sách về kỹ năng lãnh đạo, hoặc cần so sánh giữa đọc PDF và nghe audio.",
  "Chatbot không chỉ trả lời câu hỏi, mà còn hỗ trợ gợi ý những cuốn sách thực sự có trong kho. Nhờ đó, người dùng có thể khám phá sách nhanh hơn và đi thẳng đến trang chi tiết để xem thêm.",
  "Bên cạnh chatbot, website còn có Feed, thử thách đọc và các hoạt động cộng đồng. Thư viện Số Lá Xanh giúp việc tìm sách, đọc sách và kết nối với bạn đọc trở nên gần gũi hơn.",
];

const run = (args) => new Promise((resolve, reject) => {
  const child = spawn(ffmpegPath, args, { stdio: "ignore" });
  child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg exit ${code}`))));
});

await fs.rm(tempDir, { recursive: true, force: true });
await fs.mkdir(tempDir, { recursive: true });
const files = [];
for (let index = 0; index < sentences.length; index += 1) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(sentences[index])}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`TTS request failed: ${response.status}`);
  const file = path.join(tempDir, `${String(index).padStart(2, "0")}.mp3`);
  await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
  files.push(file);
}
const list = path.join(tempDir, "concat.txt");
await fs.writeFile(list, files.map((file) => `file '${file.replaceAll("'", "'\\''")}'`).join("\n"));
await run(["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", output]);
await fs.rm(tempDir, { recursive: true, force: true });
console.log(`Đã tạo: ${output}`);