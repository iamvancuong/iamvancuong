-- 2026-08-12 (bản 3) — Gộp đợt học vào Goal, xóa 2 bảng thừa
--
-- CHẠY MỘT LẦN trên PRODUCTION, TRƯỚC `bash deploy.sh`.
--   cPanel → phpMyAdmin → DB → tab SQL → dán → Go
--
-- ⚠️ CÓ XÓA BẢNG. `StudyGoal` và `StudySkill` biến mất. Nếu bạn ĐÃ tạo đợt học
--    trên production thì dữ liệu đó MẤT — kiểm trước bằng:
--        SELECT COUNT(*) FROM StudyGoal;
--    Ra 0 thì chạy thẳng. Khác 0 thì dừng lại, nhập tay lại sau khi migrate
--    (chỉ vài dòng, và giờ đã học nằm ở PomoSession chứ không ở đây).
--
-- ⚠️ Chạy lần hai báo `Duplicate column` — nghĩa là đã chạy rồi, không phải hỏng.
--    Không dùng `IF NOT EXISTS` cho ALTER: cú pháp đó chỉ MariaDB hiểu.

SET NAMES utf8mb4;

-- 1) Lĩnh vực nào có bấm giờ. Mặc định TẮT hết — bật cho Tiếng Nhật ở /os/data.
ALTER TABLE `Area` ADD COLUMN `tracksStudy` BOOLEAN NOT NULL DEFAULT false;

-- 2) Goal gánh luôn vai trò đợt học. Tất cả đều NULL được: mục tiêu thường để
--    trống cả cụm, và `targetHours IS NULL` nghĩa là "không bấm giờ".
ALTER TABLE `Goal` ADD COLUMN `studyStart` DATE NULL;
ALTER TABLE `Goal` ADD COLUMN `studyEnd` DATE NULL;
ALTER TABLE `Goal` ADD COLUMN `targetHours` INTEGER NULL;
ALTER TABLE `Goal` ADD COLUMN `priorHours` INTEGER NULL;
ALTER TABLE `Goal` ADD COLUMN `dailyPomo` INTEGER NULL;
ALTER TABLE `Goal` ADD COLUMN `icon` VARCHAR(191) NULL;

-- 3) Mục tiêu con: Goal tự trỏ về Goal. Xóa cha là con đi theo (CASCADE).
ALTER TABLE `Goal` ADD COLUMN `parentId` VARCHAR(191) NULL;
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_parentId_fkey`
  FOREIGN KEY (`parentId`) REFERENCES `Goal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 4) Hiệp pomodoro giờ trỏ vào MỤC TIÊU CON thay vì StudySkill.
--    Bỏ khóa ngoại cũ TRƯỚC khi đổi tên cột, nếu không MySQL từ chối.
ALTER TABLE `PomoSession` DROP FOREIGN KEY `PomoSession_skillId_fkey`;
ALTER TABLE `PomoSession` DROP INDEX `PomoSession_skillId_idx`;
ALTER TABLE `PomoSession` CHANGE `skillId` `goalId` VARCHAR(191) NULL;
ALTER TABLE `PomoSession` ADD INDEX `PomoSession_goalId_idx` (`goalId`);
-- Hiệp cũ đang trỏ vào StudySkill đã chết → cắt về NULL ("chưa gắn"), giờ vẫn
-- còn trong tổng. Phải làm TRƯỚC khi thêm khóa ngoại mới, nếu không FK từ chối.
UPDATE `PomoSession` SET `goalId` = NULL WHERE `goalId` IS NOT NULL;
ALTER TABLE `PomoSession` ADD CONSTRAINT `PomoSession_goalId_fkey`
  FOREIGN KEY (`goalId`) REFERENCES `Goal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 5) Hai bảng thừa.
DROP TABLE IF EXISTS `StudySkill`;
DROP TABLE IF EXISTS `StudyGoal`;

-- Kiểm nhanh:
--   SHOW COLUMNS FROM `Goal` LIKE 'targetHours';     -- phải có
--   SHOW COLUMNS FROM `Area` LIKE 'tracksStudy';     -- phải có
--   SHOW TABLES LIKE 'Study%';                       -- phải TRỐNG
