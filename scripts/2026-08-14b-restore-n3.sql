-- 2026-08-14 (bản 2) — Dựng lại đợt học JLPT N3 trên PRODUCTION
--
-- TRIỆU CHỨNG: trong /os, tab «Tiếng Nhật» mất hẳn khối nhịp — không có thanh
-- tiến độ, không có "nợ mấy giờ", không có "cần mấy hiệp/ngày". Hàng ô pomodoro
-- vẫn bấm được bình thường.
--
-- NGUYÊN NHÂN: `2026-08-12c-goal-merge.sql` gộp đợt học vào bảng `Goal` rồi
-- `DROP TABLE StudyGoal, StudySkill`. Nó thêm cột đúng, nhưng **không chuyển dữ
-- liệu** — nên đợt N3 đã nhập trước đó biến mất cùng hai bảng kia. Code không
-- hỏng: `getStudyGoal` không tìm thấy `Goal` nào có `targetHours`, nên cả khối
-- lặng lẽ ẩn đi. Hỏng KIỂU IM LẶNG, đó là lý do nó sống sót lâu như vậy.
--
-- ⚠️ GIỜ ĐÃ HỌC KHÔNG MẤT. Các hiệp nằm ở `PomoSession`, không nằm ở StudyGoal.
--    File này chỉ dựng lại KẾ HOẠCH (tổng giờ, ngày, nhịp, các mảng kỹ năng).
--
--   cPanel → phpMyAdmin → DB `ujxmchhx_iamvancuong` → tab SQL → dán → Go
--
-- ✅ CHẠY LẠI NHIỀU LẦN ĐƯỢC. Mọi lệnh ghi đều có `WHERE NOT EXISTS`, nên lần
--    thứ hai không tạo bản sao. Khác các file SQL trước — chúng dùng ALTER nên
--    lần hai báo `Duplicate column`; file này thì im lặng không làm gì.

SET NAMES utf8mb4;

-- ══════════════════════════════════════════════════════════════════
-- PHẦN 1 — KIỂM TRA (chỉ đọc, chạy trước để biết mình đang ở đâu)
-- ══════════════════════════════════════════════════════════════════
--
-- Chạy riêng ba câu này trước. Kết quả mong đợi TRƯỚC khi sửa:
--   tracksStudy = 0   ← lĩnh vực Tiếng Nhật chưa bật bấm giờ
--   so_dot      = 0   ← không có đợt học nào
--   so_hiep     > 0   ← nhưng giờ đã học thì vẫn còn nguyên

SELECT slug, name, tracksStudy FROM `Area` WHERE slug = 'tieng-nhat';
SELECT COUNT(*) AS so_dot FROM `Goal` WHERE targetHours IS NOT NULL AND parentId IS NULL;
SELECT COUNT(*) AS so_hiep FROM `PomoSession`;

-- ══════════════════════════════════════════════════════════════════
-- PHẦN 2 — SỬA
-- ══════════════════════════════════════════════════════════════════

-- 1) Bật bấm giờ cho lĩnh vực Tiếng Nhật.
--    Thiếu bước này thì dù đợt có tồn tại, khối nhịp VẪN ẩn: truy vấn đòi
--    `area.tracksStudy = true`. Đây là nửa thứ hai của cùng một lỗi.
UPDATE `Area` SET `tracksStudy` = 1 WHERE `slug` = 'tieng-nhat';

-- 2) Đợt cha. Khóa chính đặt tay (không phải cuid) để mục con bên dưới trỏ
--    được vào, và để chạy lại lần hai nhận ra "đã có rồi".
INSERT INTO `Goal`
  (`id`, `areaId`, `title`, `detail`, `horizon`, `status`,
   `studyStart`, `studyEnd`, `targetHours`, `dailyPomo`, `order`,
   `createdAt`, `updatedAt`)
SELECT
  'n3-2026-restore', a.`id`, 'JLPT N3',
  'Kế hoạch 12/08/2026. Ngân sách các mảng đang vượt sức chứa của nhịp 7 hiệp — xem lại ở /os/data.',
  'THIS_YEAR', 'NOT_STARTED',
  '2026-08-12', '2026-12-12', 875, 7, 0,
  NOW(3), NOW(3)
FROM `Area` a
WHERE a.`slug` = 'tieng-nhat'
  AND NOT EXISTS (
    SELECT 1 FROM `Goal` g WHERE g.`targetHours` IS NOT NULL AND g.`parentId` IS NULL
  );

-- 3) Sáu mảng kỹ năng, mỗi mảng một ngân sách giờ.
--    Ngân sách là thứ khiến MỘT HIỆP LÀ MỘT DÒNG chứ không phải một con số
--    đếm: một con số không nhớ được hiệp đó học mảng nào (STATE.md §Pomodoro).
INSERT INTO `Goal`
  (`id`, `areaId`, `parentId`, `title`, `horizon`, `status`,
   `targetHours`, `order`, `createdAt`, `updatedAt`)
SELECT
  CONCAT('n3-2026-restore-', s.n), p.`areaId`, p.`id`, s.title,
  'THIS_YEAR', 'NOT_STARTED', s.hours, s.n, NOW(3), NOW(3)
FROM `Goal` p
JOIN (
            SELECT 1 AS n, 'Từ vựng + Kanji'   AS title, 250 AS hours
  UNION ALL SELECT 2,       'Ngữ pháp',              150
  UNION ALL SELECT 3,       'Nghe',                  150
  UNION ALL SELECT 4,       'Đọc',                   150
  UNION ALL SELECT 5,       'Đề N3 + chữa lỗi',      100
  UNION ALL SELECT 6,       'Kaiwa/shadowing',        75
) s
WHERE p.`id` = 'n3-2026-restore'
  AND NOT EXISTS (
    SELECT 1 FROM (SELECT * FROM `Goal`) c
    WHERE c.`parentId` = 'n3-2026-restore' AND c.`title` = s.title
  );

-- ══════════════════════════════════════════════════════════════════
-- PHẦN 3 — KIỂM LẠI (phải ra: tracksStudy = 1, 1 đợt cha, 6 mảng)
-- ══════════════════════════════════════════════════════════════════

SELECT tracksStudy FROM `Area` WHERE slug = 'tieng-nhat';
SELECT `title`, `targetHours`, `dailyPomo`, `studyStart`, `studyEnd`
  FROM `Goal` WHERE `parentId` IS NULL AND `targetHours` IS NOT NULL;
SELECT `title`, `targetHours` FROM `Goal`
  WHERE `parentId` = 'n3-2026-restore' ORDER BY `order`;

-- Sau đó KHÔNG cần deploy lại — đây chỉ là dữ liệu. Mở lại /os là thấy khối
-- nhịp hiện ra. Nếu vẫn chưa thấy: bấm Restart ở cPanel (Setup Node.js App)
-- để xóa cache render của Next.
