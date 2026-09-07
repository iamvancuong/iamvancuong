-- 2026-09-08 — Sắp lại 6 mảng con của đợt JLPT N3 thành CHECKLIST HỌC MỖI NGÀY
--
-- Mục đích: trang /os/log giờ có checklist theo từng mảng — mỗi ô một hiệp
-- (POMO_MIN=50p). Số ô của mỗi mảng = `Goal.dailyPomo`. File này đặt tên +
-- icon + hiệp/ngày cho 6 mảng con, và nâng nhịp của đợt cha cho khớp.
--
-- ⚠️ CHỈ ĐỔI TÊN, KHÔNG XÓA. Đổi tên bằng UPDATE nên `goalId` giữ nguyên —
--    mọi hiệp PomoSession đã gắn mảng cũ vẫn dính đúng mảng (giờ đã học KHÔNG
--    mất, ngân sách từng mảng vẫn liền mạch). Xóa+tạo mới thì hiệp rơi về
--    «chưa gắn».
--
-- ⚠️ NGÂN SÁCH GIỜ GIỮ NGUYÊN (bê từ mảng cũ) — tổng vẫn 875h:
--      Anki 100 · Reading 150 · Listening 150 · Kaiwa 75 · Grammar/Vocab 150
--      · Kanji 250 = 875h. Muốn chia lại theo nhịp ngày thì sửa ở /os/data.
--
-- Match theo TÊN CŨ (không theo id) nên chạy được cả local lẫn production —
-- id trên hai nơi khác nhau. Scope vào con của đợt cha có `targetHours` để
-- không đụng nhầm mục tiêu khác cùng tên.
--
-- ✅ CHẠY LẠI NHIỀU LẦN ĐƯỢC: lần hai không còn dòng nào mang tên cũ nên các
--    UPDATE không khớp gì — im lặng không làm gì, không tạo bản sao.
--
--   cPanel → phpMyAdmin → DB production → tab SQL → dán → Go
--   (hoặc local: docker exec -i vancuong_mysql mysql -ucuong -pdevpass iamvancuong < file)

SET NAMES utf8mb4;

-- ── KIỂM TRƯỚC (chỉ đọc) ──────────────────────────────────────────
SELECT c.`title`, c.`dailyPomo`, c.`targetHours`
  FROM `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
 ORDER BY c.`order`;

-- ── SỬA ───────────────────────────────────────────────────────────

-- Nhịp của đợt cha: 7 → 8 hiệp/ngày (bằng tổng 6 mảng: 1+1+1+1+3+1).
UPDATE `Goal`
   SET `dailyPomo` = 8
 WHERE `parentId` IS NULL AND `targetHours` IS NOT NULL AND `title` = 'JLPT N3';

-- 6 mảng con: đổi tên + icon + hiệp/ngày. Ngân sách giờ (`targetHours`)
-- KHÔNG đụng tới — giữ nguyên như mảng cũ.
UPDATE `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
   SET c.`title` = 'Anki', c.`icon` = '🗂️', c.`dailyPomo` = 1
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
   AND c.`title` = 'Đề N3 + chữa lỗi';

UPDATE `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
   SET c.`title` = 'Reading', c.`icon` = '📖', c.`dailyPomo` = 1
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
   AND c.`title` = 'Đọc';

UPDATE `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
   SET c.`title` = 'Listening', c.`icon` = '🎧', c.`dailyPomo` = 1
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
   AND c.`title` = 'Nghe';

UPDATE `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
   SET c.`title` = 'Kaiwa', c.`icon` = '🗣️', c.`dailyPomo` = 1
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
   AND c.`title` = 'Kaiwa/shadowing';

UPDATE `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
   SET c.`title` = 'Grammar/Vocab', c.`icon` = '📝', c.`dailyPomo` = 3
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
   AND c.`title` = 'Ngữ pháp';

UPDATE `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
   SET c.`title` = 'Kanji', c.`icon` = '🈶', c.`dailyPomo` = 1
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
   AND c.`title` = 'Từ vựng + Kanji';

-- ── KIỂM LẠI (phải ra 6 mảng mới, tổng dailyPomo = 8, tổng giờ = 875) ──
SELECT c.`icon`, c.`title`, c.`dailyPomo`, c.`targetHours`
  FROM `Goal` c JOIN `Goal` p ON c.`parentId` = p.`id`
 WHERE p.`parentId` IS NULL AND p.`targetHours` IS NOT NULL
 ORDER BY c.`order`;
