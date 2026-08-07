// server.js — điểm khởi động cho Passenger (cPanel → Setup Node.js App).
//
// VÌ SAO CÓ FILE NÀY:
// Trên shared hosting AZDIGI (LiteSpeed + Passenger), Passenger chạy TRỰC TIẾP
// file khởi động này — KHÔNG qua `npm start`. Nhờ vậy các script predev/prestart
// (vốn gọi `docker compose up`) không bao giờ đụng tới, và ta không cần Docker
// trên server: MySQL dùng thẳng của cPanel.
//
// VÌ SAO KHÔNG DÙNG `output: "standalone"`:
// standalone gom node_modules đã trace vào .next/standalone — nếu build trên
// Windows thì nó gom nhầm binary Windows của `sharp` và Prisma engine, lên Linux
// là hỏng. Cách này tách bạch: build (.next) làm ở local vì thuần JS đa nền tảng;
// còn node_modules để cPanel tự `npm install` trên Linux (nút "Run NPM Install").
//
// QUY TRÌNH: build ở local  →  upload mã nguồn + .next (BỎ node_modules)  →
//            trên cPanel bấm "Run NPM Install" (postinstall tự chạy prisma generate)
//            →  đặt startup file = server.js  →  Restart.

const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> iamvancuong sẵn sàng trên cổng ${port}`);
  });
});
