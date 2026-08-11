-- 2026-08-12 (bản 2) — Tổng số giờ nhập tay cho một đợt học
--
-- CHẠY MỘT LẦN trên database PRODUCTION, TRƯỚC khi `bash deploy.sh`.
--
--   cPanel → phpMyAdmin → DB `ujxmchhx_iamvancuong` → tab SQL → dán → Go
--
-- Cột cho phép NULL, không có giá trị mặc định: đợt đã tạo trước đó giữ nguyên
-- cách cũ (suy tổng từ nhịp × số ngày). Không đụng một dòng dữ liệu nào.
--
-- ⚠️ Chạy lần hai sẽ báo `Duplicate column` — đó là "đã chạy rồi", không phải
--    hỏng. Cố ý không dùng `IF NOT EXISTS`: cú pháp đó chỉ có ở MariaDB.

SET NAMES utf8mb4;

ALTER TABLE `StudyGoal` ADD COLUMN `targetHours` INTEGER NULL;

-- Kiểm nhanh (phải ra 1 dòng, Null = YES):
--   SHOW COLUMNS FROM `StudyGoal` LIKE 'targetHours';
