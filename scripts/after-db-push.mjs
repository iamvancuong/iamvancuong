/**
 * In lời nhắc sau khi `prisma db push`.
 *
 * `db push` cập nhật database VÀ sinh lại Prisma client trong `node_modules`.
 * Nhưng Turbopack **không theo dõi `node_modules`**, nên một `next dev` đang
 * chạy sẽ tiếp tục dùng client cũ. Kết quả là lỗi lúc chạy trông chẳng liên
 * quan gì tới nguyên nhân:
 *
 *   Unknown field `metrics` for include statement on model `Area`
 *   Cannot convert undefined or null to object      (Object.values trên enum mới)
 *
 * Cả hai đều đã xảy ra thật, và cả hai lần đều mất thời gian đi tìm nhầm chỗ
 * — vì code đúng, schema đúng, client trên đĩa cũng đúng. Chỉ có tiến trình
 * đang chạy là cũ.
 *
 * `predev` đã tự chạy `prisma generate`, nên khởi động lại là chắc chắn sạch.
 * Dòng nhắc này để không phải nhớ điều đó.
 */
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

console.log(
  [
    "",
    bold("  Schema đã đồng bộ."),
    "",
    "  Nếu " + bold("next dev") + " đang chạy thì " + bold("khởi động lại nó") + " —",
    "  tiến trình đang chạy vẫn giữ Prisma client cũ (Turbopack không theo dõi",
    "  node_modules), nên trường vừa thêm sẽ báo lỗi kiểu " + dim("Unknown field"),
    "  hoặc " + dim("Cannot convert undefined or null to object") + ".",
    "",
    dim("  Kẹt thì xóa cache:  rm -rf .next/dev"),
    "",
  ].join("\n"),
);
