-- 2026-11-23b — Baito: hai chỗ làm + lương giờ, tính tiền
--
-- CHẠY MỘT LẦN trên database PRODUCTION, TRƯỚC khi `bash deploy.sh`.
-- Không chạy = /os/baito chết khi mở (`Unknown column jobId` /
-- `Table BaitoJob doesn't exist`). Các trang khác không bị ảnh hưởng.
--
--   cPanel → phpMyAdmin → chọn DB `ujxmchhx_iamvancuong` → tab SQL → dán file này
--
-- Thêm bảng BaitoJob + hai cột vào WorkShift, rồi tạo sẵn hai việc. Tên và
-- lương giờ sửa được ở /os/baito. Ca đã nhập trước đó giữ nguyên, chưa gán
-- việc (jobId NULL) — vẫn tính giờ, chỉ không tính tiền.
--
-- ⚠️ Chạy LẦN HAI sẽ báo `Duplicate column` ở dòng ALTER. Không phải hỏng —
--    nghĩa là file đã chạy rồi. (Không dùng `ADD COLUMN IF NOT EXISTS`: cú
--    pháp MariaDB, MySQL từ chối.)
-- DDL sinh bằng `prisma migrate diff`.

SET NAMES utf8mb4;

-- CreateTable
CREATE TABLE IF NOT EXISTS `BaitoJob` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `rate` INTEGER NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO `BaitoJob` (`id`, `name`, `rate`, `order`, `updatedAt`) VALUES
  ('job_giaobao', 'Giao báo', 1495, 0, CURRENT_TIMESTAMP(3)),
  ('job_viec2',   'Việc 2',   1200, 1, CURRENT_TIMESTAMP(3));

-- AlterTable
ALTER TABLE `WorkShift` ADD COLUMN `jobId` VARCHAR(191) NULL,
    ADD COLUMN `rate` INTEGER NULL;

-- CreateIndex
CREATE INDEX `WorkShift_jobId_idx` ON `WorkShift`(`jobId`);

-- AddForeignKey
ALTER TABLE `WorkShift` ADD CONSTRAINT `WorkShift_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BaitoJob`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
