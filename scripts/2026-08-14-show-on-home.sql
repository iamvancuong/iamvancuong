-- 2026-08-14 — Chọn ký ức / bài viết cho dải ảnh ở trang chủ
--
-- CHẠY MỘT LẦN trên database PRODUCTION, TRƯỚC khi `bash deploy.sh`.
-- Không chạy = TRANG CHỦ chết ngay khi mở, vì `getHomeStrips()` lọc theo
-- `showOnHome` mà cột đó chưa tồn tại. Lần này hỏng ở trang CÔNG KHAI chứ
-- không phải trong /os, nên khách vào cũng thấy.
--
--   cPanel → phpMyAdmin → chọn DB `ujxmchhx_iamvancuong` → tab SQL → dán file này
--
-- KHÔNG đụng một dòng dữ liệu nào đang có — chỉ thêm hai cột và hai chỉ mục.
-- Mọi ký ức và bài viết đang có nhận `false`, tức là **không có gì tự nhảy lên
-- trang chủ sau khi deploy**. Muốn tấm nào lên thì vào /os bấm «Lên trang chủ»
-- ở đúng ký ức / bài đó.
--
-- DDL sinh bằng `prisma migrate diff`, không viết tay.
--
-- ⚠️ Chạy LẦN HAI sẽ báo `Duplicate column` / `Duplicate key name`. Đó KHÔNG
--    phải hỏng — nó có nghĩa là file này đã chạy rồi. Cố ý không dùng
--    `IF NOT EXISTS` cho ALTER: cú pháp đó chỉ có ở MariaDB, MySQL từ chối
--    thẳng ở dòng đầu và toàn bộ phần sau không chạy.

SET NAMES utf8mb4;

-- AlterTable
ALTER TABLE `Memory` ADD COLUMN `showOnHome` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `showOnHome` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Memory_showOnHome_idx` ON `Memory`(`showOnHome`);

-- CreateIndex
CREATE INDEX `Post_showOnHome_idx` ON `Post`(`showOnHome`);
