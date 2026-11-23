-- 2026-11-23 — Giờ làm baito (bảng WorkShift, trang /os/baito)
--
-- CHẠY MỘT LẦN trên database PRODUCTION, TRƯỚC khi `bash deploy.sh`.
-- Không chạy = /os/baito chết khi mở (`Table doesn't exist`). Các trang khác
-- không đụng tới bảng này nên vẫn chạy.
--
--   cPanel → phpMyAdmin → chọn DB `ujxmchhx_iamvancuong` → tab SQL → dán file này
--
-- Chỉ TẠO một bảng mới, không đụng dữ liệu đang có.
-- DDL sinh bằng `prisma migrate diff`, không viết tay.

SET NAMES utf8mb4;

-- CreateTable
CREATE TABLE IF NOT EXISTS `WorkShift` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `start` VARCHAR(191) NULL,
    `end` VARCHAR(191) NULL,
    `breakMin` INTEGER NOT NULL DEFAULT 0,
    `minutes` INTEGER NOT NULL,
    `place` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WorkShift_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
