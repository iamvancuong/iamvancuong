// One-off: cắt vuông đầu-vai từ ảnh cartoon → app/icon.png + app/apple-icon.png.
// Cắt từ phần trên nên loại bỏ hẳn watermark SnapEdit ở góc dưới phải.
import sharp from "sharp";

const SRC = "public/images/logo-cartoon.png";
// Vùng vuông ôm đầu + vai, canh giữa mặt (ảnh gốc 1173x1600).
const CROP = { left: 235, top: 195, width: 760, height: 760 };

const base = sharp(SRC).extract(CROP);

await base.clone().resize(512, 512).png().toFile("app/icon.png");
await base.clone().resize(180, 180).png().toFile("app/apple-icon.png");
// Bản vuông 512 để dùng lại (og/schema/header nếu cần sau này).
await base.clone().resize(512, 512).png().toFile("public/images/logo-square.png");

console.log("done: app/icon.png, app/apple-icon.png, public/images/logo-square.png");
