import bcrypt from "bcryptjs";
import readline from "node:readline/promises";

/**
 * Tạo chuỗi băm cho mật khẩu đăng nhập /os.
 *
 *   npm run hash-password
 *
 * Kết quả in ra dạng base64, KHÔNG phải chuỗi bcrypt thô. Lý do: bcrypt sinh
 * ra `$2b$12$...`, mà bộ nạp .env của Next.js coi `$2b` là biến môi trường rồi
 * thay bằng rỗng — kể cả khi bọc nháy đơn. Base64 không có `$` nên an toàn.
 *
 * Mật khẩu thật không bao giờ được ghi ra file hay vào repo.
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const pw = await rl.question("Nhập mật khẩu muốn dùng cho /os: ");
rl.close();

if (pw.length < 8) {
  console.error("\nMật khẩu quá ngắn — nên từ 8 ký tự trở lên.");
  process.exit(1);
}

const hash = await bcrypt.hash(pw, 12);
const b64 = Buffer.from(hash, "utf8").toString("base64");

console.log("\nDán dòng này vào file .env (thay dòng cũ):\n");
console.log(`OS_PASSWORD_HASH_B64="${b64}"`);
console.log("\nRồi khởi động lại dev server để nó nạp giá trị mới.\n");
