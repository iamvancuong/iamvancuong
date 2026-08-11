-- 2026-08-12 — Pomodoro tiếng Nhật + việc trong ngày + mục tiêu học
--
-- CHẠY MỘT LẦN trên database PRODUCTION, TRƯỚC khi `bash deploy.sh`.
-- Không chạy = /os chết ngay khi mở (bảng và cột chưa tồn tại).
--
--   cPanel → phpMyAdmin → chọn DB `ujxmchhx_iamvancuong` → tab SQL → dán file này
--
-- KHÔNG đụng một dòng dữ liệu nào đang có — chỉ thêm cột và bảng mới.
-- DDL sinh bằng `prisma migrate diff`, không viết tay, và đã chạy thử trên một
-- bản sao đúng hình dạng production trước khi giao.
--
-- ⚠️ Chạy LẦN HAI sẽ báo `Duplicate column` / `Duplicate key name`. Đó KHÔNG
--    phải hỏng — nó có nghĩa là file này đã chạy rồi. Cố ý không dùng
--    `IF NOT EXISTS` cho ALTER: cú pháp đó chỉ có ở MariaDB, MySQL từ chối
--    thẳng ở dòng đầu và toàn bộ phần sau không chạy.

SET NAMES utf8mb4;

-- 1) Cột đếm hiệp pomodoro trong ngày.
--    Bản sao của số dòng PomoSession; chỉ setPomodoro() được ghi. Mọi ngày cũ
--    nhận 0 — đúng, vì trước hôm nay chưa hề có hiệp nào được bấm.
ALTER TABLE `DailyLog` ADD COLUMN `jpPomo` INTEGER NOT NULL DEFAULT 0;

-- 2) Bốn bảng mới.

-- CreateTable
CREATE TABLE IF NOT EXISTS `DayTask` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `done` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DayTask_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `StudyGoal` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `startDate` DATE NOT NULL,
    `targetDate` DATE NOT NULL,
    `dailyPomo` INTEGER NOT NULL DEFAULT 7,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudyGoal_active_targetDate_idx`(`active`, `targetDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `StudySkill` (
    `id` VARCHAR(191) NOT NULL,
    `studyGoalId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `icon` VARCHAR(191) NULL,
    `targetHours` INTEGER NOT NULL DEFAULT 0,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `StudySkill_studyGoalId_order_idx`(`studyGoalId`, `order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `PomoSession` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `skillId` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PomoSession_date_idx`(`date`),
    INDEX `PomoSession_skillId_idx`(`skillId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3) Khóa ngoại. Ý nghĩa của ON DELETE ở đây là CÓ CHỦ ĐÍCH:
--      StudySkill → StudyGoal   CASCADE   xóa đợt thì các mảng của nó đi theo
--      PomoSession → StudySkill SET NULL  xóa mảng thì GIỜ ĐÃ HỌC KHÔNG MẤT,
--                                         các hiệp rơi về "chưa gắn mảng"
ALTER TABLE `StudyGoal` ADD CONSTRAINT `StudyGoal_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `StudySkill` ADD CONSTRAINT `StudySkill_studyGoalId_fkey` FOREIGN KEY (`studyGoalId`) REFERENCES `StudyGoal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `PomoSession` ADD CONSTRAINT `PomoSession_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `StudySkill`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Xong. Kiểm nhanh (phải ra 4 dòng):
--   SHOW TABLES LIKE '%Pomo%'; SHOW TABLES LIKE 'Day%'; SHOW TABLES LIKE 'Study%';
