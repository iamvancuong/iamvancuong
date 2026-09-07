-- 2026-09-08 — Dựng 6 KỸ NĂNG học mỗi ngày cho đợt JLPT N3 (checklist /os/log)
--
-- Trang /os/log hiện một dòng checklist cho MỖI mảng con có đặt `dailyPomo`
-- (hiệp/ngày). File này làm cho đợt học đang chạy có đúng 6 mảng kỹ năng:
--     🗂️ Anki 1 · 📖 Reading 1 · 🎧 Listening 1 · 🗣️ Kaiwa 1
--     · 📝 Grammar/Vocab 3 · 🈶 Kanji 1   →  tổng 8 hiệp/ngày.
--
-- KHÁC bản trước (khớp theo tên mảng cũ 'Đọc'/'Ngữ pháp'…): production KHÔNG có
-- mấy tên đó nên bản cũ không tạo gì. Bản này KHÔNG đoán tên — nó tự neo vào
-- ĐÚNG đợt học mà trang /os/log chọn (parentId NULL · có targetHours · lĩnh vực
-- bật tracksStudy · studyEnd gần nhất), y hệt truy vấn trong app.
--
-- ⚠️ KHÔNG xóa mảng nào. Chỉ: gỡ `dailyPomo` khỏi các mảng cũ (để chúng thôi
--    hiện thành dòng gộp), thêm 6 kỹ năng, và nâng nhịp đợt cha = 8. Giờ đã học
--    (PomoSession) không đụng tới. Mảng cũ vẫn còn, chỉ thôi nằm trong checklist.
--
-- ✅ CHẠY LẠI NHIỀU LẦN ĐƯỢC: 6 kỹ năng dùng WHERE NOT EXISTS nên không nhân
--    đôi; các UPDATE cuối đặt lại hiệp/ngày + icon cho đúng dù chạy lần thứ mấy.
--
--   cPanel → phpMyAdmin → DB ujxmchhx_iamvancuong → tab SQL → dán CẢ FILE → Go
--   (Đọc khối KIỂM TRƯỚC/KIỂM LẠI ở output để chắc đúng đợt.)

SET NAMES utf8mb4;

-- Neo vào đúng đợt học mà /os/log đang dùng (cùng logic với app).
SET @pid := (
  SELECT g.`id` FROM `Goal` g JOIN `Area` a ON g.`areaId` = a.`id`
   WHERE g.`parentId` IS NULL AND g.`targetHours` IS NOT NULL AND a.`tracksStudy` = 1
   ORDER BY g.`studyEnd` ASC
   LIMIT 1
);
SET @aid := (SELECT `areaId` FROM `Goal` WHERE `id` = @pid);

-- ── KIỂM TRƯỚC (chỉ đọc) — @pid phải KHÁC NULL, và là đúng đợt N3 ──
SELECT @pid AS parent_id, @aid AS area_id;
SELECT `id`, `title`, `dailyPomo`, `targetHours`, `studyEnd` FROM `Goal` WHERE `id` = @pid;
SELECT `title`, `dailyPomo`, `targetHours` FROM `Goal` WHERE `parentId` = @pid ORDER BY `order`;

-- ── SỬA ───────────────────────────────────────────────────────────

-- 1) Gỡ hiệp/ngày khỏi MỌI mảng con hiện có → checklist thôi hiện dòng gộp cũ
--    (vd chặng "Lấp đầy kiến thức N5-4 đến 15/9"). Mảng vẫn còn, chỉ mất khỏi
--    checklist. Chạy TRƯỚC bước thêm nên không đụng 6 kỹ năng mới.
UPDATE `Goal` SET `dailyPomo` = NULL WHERE `parentId` = @pid;

-- 2) Nhịp đợt cha = 8 (bằng tổng kế hoạch 6 kỹ năng).
UPDATE `Goal` SET `dailyPomo` = 8 WHERE `id` = @pid;

-- 3) Thêm 6 kỹ năng (mảng con, KHÔNG ngày, KHÔNG ngân sách giờ) nếu chưa có.
--    Không đặt targetHours: giờ vẫn cộng vào TỔNG của đợt cha (app cộng mọi phút
--    trong khoảng ngày của cha); muốn ngân sách riêng từng mảng thì thêm sau ở
--    /os/data. `order` 101.. để nằm sau các mảng/chặng cũ.
INSERT INTO `Goal`
  (`id`, `areaId`, `parentId`, `title`, `horizon`, `status`, `dailyPomo`, `icon`, `order`, `createdAt`, `updatedAt`)
SELECT CONCAT('n3-skill-', s.`n`), @aid, @pid, s.`title`, 'THIS_YEAR', 'NOT_STARTED',
       s.`pomo`, s.`icon`, 100 + s.`n`, NOW(3), NOW(3)
FROM (
            SELECT 1 AS `n`, 'Anki'          AS `title`, '🗂️' AS `icon`, 1 AS `pomo`
  UNION ALL SELECT 2,        'Reading',            '📖',       1
  UNION ALL SELECT 3,        'Listening',          '🎧',       1
  UNION ALL SELECT 4,        'Kaiwa',              '🗣️',       1
  UNION ALL SELECT 5,        'Grammar/Vocab',      '📝',       3
  UNION ALL SELECT 6,        'Kanji',              '🈶',       1
) s
WHERE @pid IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM `Goal`) c
    WHERE c.`parentId` = @pid AND c.`title` = s.`title`
  );

-- 4) Đặt lại hiệp/ngày + icon cho 6 kỹ năng (để chạy lần 2 vẫn đúng, vì bước 1
--    đã gỡ dailyPomo của chúng).
UPDATE `Goal` SET `dailyPomo` = 1, `icon` = '🗂️' WHERE `parentId` = @pid AND `title` = 'Anki';
UPDATE `Goal` SET `dailyPomo` = 1, `icon` = '📖' WHERE `parentId` = @pid AND `title` = 'Reading';
UPDATE `Goal` SET `dailyPomo` = 1, `icon` = '🎧' WHERE `parentId` = @pid AND `title` = 'Listening';
UPDATE `Goal` SET `dailyPomo` = 1, `icon` = '🗣️' WHERE `parentId` = @pid AND `title` = 'Kaiwa';
UPDATE `Goal` SET `dailyPomo` = 3, `icon` = '📝' WHERE `parentId` = @pid AND `title` = 'Grammar/Vocab';
UPDATE `Goal` SET `dailyPomo` = 1, `icon` = '🈶' WHERE `parentId` = @pid AND `title` = 'Kanji';

-- ── KIỂM LẠI: phải ra 6 kỹ năng có hiệp/ngày (tổng 8); mảng cũ dailyPomo NULL ──
SELECT `icon`, `title`, `dailyPomo`, `targetHours`
  FROM `Goal` WHERE `parentId` = @pid
 ORDER BY `dailyPomo` IS NULL, `order`;
