-- prod-fix.sql — vá DB production sau đợt cập nhật 08/08/2026.
-- Idempotent: chạy nhiều lần vẫn an toàn (IF NOT EXISTS / INSERT IGNORE).
-- Cách chạy: cPanel → phpMyAdmin → chọn DB ujxmchhx_iamvancuong → tab SQL → dán file này → Go.
--
-- Sửa 2 thứ prod đang thiếu:
--   1) Bảng ContactMessage (form liên hệ ở trang chủ mới).
--   2) 7 lĩnh vực (Area) — vì sao trước đây import thiếu: schema.sql chỉ có bảng, không có data.

CREATE TABLE IF NOT EXISTS `ContactMessage` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ContactMessage_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7 lĩnh vực (chỉ thêm nếu chưa có)
INSERT IGNORE INTO `Area` VALUES ('cmsem65r30000r4pzhezye1jn','tieng-nhat','Tiếng Nhật','Tôi đang ở đâu trên đường tới N2?','Languages',0,1,'2026-08-04 12:08:00.927','2026-08-06 01:42:46.432'),('cmsem660e0006r4pzfyo8klx6','cong-viec','Công việc','Tôi có đang tiến gần một công việc IT ở Nhật không?','Code',1,1,'2026-08-04 12:08:01.262','2026-08-06 01:42:46.577'),('cmsem667x000br4pzx9bvmuin','ban-than','Bản thân','Tôi đang chăm mình thế nào — da, tóc, quần áo, răng?','User',2,1,'2026-08-04 12:08:01.533','2026-08-06 01:42:46.727'),('cmsem66f4000hr4pzwwxcy6bb','tinh-yeu','Tình yêu','Tôi muốn đối xử với người mình yêu ra sao?','Heart',3,1,'2026-08-04 12:08:01.792','2026-08-06 01:42:46.878'),('cmsem66l0000mr4pzf0sgods3','gia-dinh','Gia đình','Tôi làm được gì cho bố mẹ?','Home',4,1,'2026-08-04 12:08:02.004','2026-08-06 01:42:47.027'),('cmsem66sr000pr4pzbxi6vzy1','tien','Tiền','Tôi đang đứng ở đâu về tài chính?','Wallet',5,1,'2026-08-04 12:08:02.283','2026-08-06 01:42:47.178'),('cmsem6709000tr4pzwbxi4lly','suc-khoe','Sức khỏe','Cơ thể tôi có đang khỏe lên không?','Activity',6,1,'2026-08-04 12:08:02.553','2026-08-06 01:42:47.327');
