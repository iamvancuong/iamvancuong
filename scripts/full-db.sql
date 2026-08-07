-- MySQL dump 10.13  Distrib 8.4.11, for Linux (x86_64)
--
-- Host: localhost    Database: iamvancuong
-- ------------------------------------------------------
-- Server version	8.4.11

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Area`
--

DROP TABLE IF EXISTS `Area`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Area` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagline` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Area_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Area`
--

LOCK TABLES `Area` WRITE;
/*!40000 ALTER TABLE `Area` DISABLE KEYS */;
INSERT INTO `Area` (`id`, `slug`, `name`, `tagline`, `icon`, `order`, `active`, `createdAt`, `updatedAt`) VALUES ('cmsem65r30000r4pzhezye1jn','tieng-nhat','Tiếng Nhật','Tôi đang ở đâu trên đường tới N2?','Languages',0,1,'2026-08-04 12:08:00.927','2026-08-06 01:42:46.432'),('cmsem660e0006r4pzfyo8klx6','cong-viec','Công việc','Tôi có đang tiến gần một công việc IT ở Nhật không?','Code',1,1,'2026-08-04 12:08:01.262','2026-08-06 01:42:46.577'),('cmsem667x000br4pzx9bvmuin','ban-than','Bản thân','Tôi đang chăm mình thế nào — da, tóc, quần áo, răng?','User',2,1,'2026-08-04 12:08:01.533','2026-08-06 01:42:46.727'),('cmsem66f4000hr4pzwwxcy6bb','tinh-yeu','Tình yêu','Tôi muốn đối xử với người mình yêu ra sao?','Heart',3,1,'2026-08-04 12:08:01.792','2026-08-06 01:42:46.878'),('cmsem66l0000mr4pzf0sgods3','gia-dinh','Gia đình','Tôi làm được gì cho bố mẹ?','Home',4,1,'2026-08-04 12:08:02.004','2026-08-06 01:42:47.027'),('cmsem66sr000pr4pzbxi6vzy1','tien','Tiền','Tôi đang đứng ở đâu về tài chính?','Wallet',5,1,'2026-08-04 12:08:02.283','2026-08-06 01:42:47.178'),('cmsem6709000tr4pzwbxi4lly','suc-khoe','Sức khỏe','Cơ thể tôi có đang khỏe lên không?','Activity',6,1,'2026-08-04 12:08:02.553','2026-08-06 01:42:47.327');
/*!40000 ALTER TABLE `Area` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ContactMessage`
--

DROP TABLE IF EXISTS `ContactMessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ContactMessage` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ContactMessage`
--

LOCK TABLES `ContactMessage` WRITE;
/*!40000 ALTER TABLE `ContactMessage` DISABLE KEYS */;
/*!40000 ALTER TABLE `ContactMessage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `DailyLog`
--

DROP TABLE IF EXISTS `DailyLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `DailyLog` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `sleepAt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jpMin` int NOT NULL DEFAULT '0',
  `itMin` int NOT NULL DEFAULT '0',
  `spend` int DEFAULT NULL,
  `kSleep` tinyint(1) NOT NULL DEFAULT '0',
  `kJapanese` tinyint(1) NOT NULL DEFAULT '0',
  `kEat` tinyint(1) NOT NULL DEFAULT '0',
  `workout` tinyint(1) NOT NULL DEFAULT '0',
  `journalWhat` text COLLATE utf8mb4_unicode_ci,
  `journalLearn` text COLLATE utf8mb4_unicode_ci,
  `journalChange` text COLLATE utf8mb4_unicode_ci,
  `publishable` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `webMin` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `DailyLog_date_key` (`date`),
  KEY `DailyLog_date_idx` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `DailyLog`
--

LOCK TABLES `DailyLog` WRITE;
/*!40000 ALTER TABLE `DailyLog` DISABLE KEYS */;
/*!40000 ALTER TABLE `DailyLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FixedCost`
--

DROP TABLE IF EXISTS `FixedCost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FixedCost` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` int NOT NULL,
  `cycle` enum('MONTH','YEAR') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MONTH',
  `note` text COLLATE utf8mb4_unicode_ci,
  `startedAt` date DEFAULT NULL,
  `endedAt` date DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FixedCost`
--

LOCK TABLES `FixedCost` WRITE;
/*!40000 ALTER TABLE `FixedCost` DISABLE KEYS */;
/*!40000 ALTER TABLE `FixedCost` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `FocusItem`
--

DROP TABLE IF EXISTS `FocusItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `FocusItem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NOW','NEXT','LATER','NO') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NEXT',
  `why` text COLLATE utf8mb4_unicode_ci,
  `order` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FocusItem_status_idx` (`status`),
  KEY `FocusItem_areaId_idx` (`areaId`),
  CONSTRAINT `FocusItem_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FocusItem`
--

LOCK TABLES `FocusItem` WRITE;
/*!40000 ALTER TABLE `FocusItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `FocusItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Goal`
--

DROP TABLE IF EXISTS `Goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Goal` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `detail` text COLLATE utf8mb4_unicode_ci,
  `why` text COLLATE utf8mb4_unicode_ci,
  `horizon` enum('WEEK','MONTH','THIS_YEAR','NEXT_YEAR','AGE','LIFE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `horizonAge` int DEFAULT NULL,
  `metric` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `current` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('NOT_STARTED','DOING','DONE','DROPPED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOT_STARTED',
  `dropReason` text COLLATE utf8mb4_unicode_ci,
  `doneAt` datetime(3) DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `outcome` enum('SUCCESS','PARTIAL','FAILED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `periodStart` date DEFAULT NULL,
  `reviewNext` text COLLATE utf8mb4_unicode_ci,
  `reviewWhat` text COLLATE utf8mb4_unicode_ci,
  `reviewWhy` text COLLATE utf8mb4_unicode_ci,
  `reviewedAt` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Goal_areaId_status_idx` (`areaId`,`status`),
  KEY `Goal_horizon_periodStart_idx` (`horizon`,`periodStart`),
  CONSTRAINT `Goal_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Goal`
--

LOCK TABLES `Goal` WRITE;
/*!40000 ALTER TABLE `Goal` DISABLE KEYS */;
INSERT INTO `Goal` (`id`, `areaId`, `title`, `detail`, `why`, `horizon`, `horizonAge`, `metric`, `target`, `current`, `status`, `dropReason`, `doneAt`, `order`, `createdAt`, `updatedAt`, `outcome`, `periodStart`, `reviewNext`, `reviewWhat`, `reviewWhy`, `reviewedAt`) VALUES ('cmsem65vv0001r4pzixnyiiy9','cmsem65r30000r4pzhezye1jn','Thi đậu JLPT N3',NULL,'N3 là cửa vào — chưa có nó thì hồ sơ xin việc IT gần như không được đọc.','THIS_YEAR',NULL,NULL,NULL,NULL,'DOING',NULL,NULL,0,'2026-08-04 12:08:01.099','2026-08-04 13:23:02.137',NULL,NULL,NULL,NULL,NULL,NULL),('cmsem65vv0002r4pz15ktut62','cmsem65r30000r4pzhezye1jn','Đậu N2 và nói chuyện công việc được bằng tiếng Nhật',NULL,NULL,'AGE',25,NULL,NULL,NULL,'NOT_STARTED',NULL,NULL,1,'2026-08-04 12:08:01.099','2026-08-05 00:59:53.232',NULL,NULL,NULL,NULL,NULL,NULL),('cmsem664n0007r4pz8yls0xa4','cmsem660e0006r4pzfyo8klx6','Có 3 project thật đủ tốt để mang đi phỏng vấn',NULL,NULL,'THIS_YEAR',NULL,NULL,NULL,NULL,'NOT_STARTED',NULL,NULL,0,'2026-08-04 12:08:01.415','2026-08-04 12:08:01.415',NULL,NULL,NULL,NULL,NULL,NULL),('cmsem664n0008r4pzk0jv2q2f','cmsem660e0006r4pzfyo8klx6','Đang đi làm IT ở Nhật',NULL,'Đây là lý do tôi sang đây.','AGE',25,NULL,NULL,NULL,'NOT_STARTED',NULL,NULL,1,'2026-08-04 12:08:01.415','2026-08-04 12:08:01.415',NULL,NULL,NULL,NULL,NULL,NULL),('cmsem66pl000nr4pzfmsg4wkg','cmsem66l0000mr4pzf0sgods3','Gọi về nhà mỗi tuần một lần',NULL,'Bố mẹ không gọi trước vì sợ mình đang bận.','THIS_YEAR',NULL,NULL,NULL,NULL,'NOT_STARTED',NULL,NULL,0,'2026-08-04 12:08:02.169','2026-08-04 12:08:02.169',NULL,NULL,NULL,NULL,NULL,NULL),('cmsem66wz000qr4pz88zjxnkl','cmsem66sr000pr4pzbxi6vzy1','Có quỹ khẩn cấp bằng 3 tháng chi phí',NULL,NULL,'THIS_YEAR',NULL,NULL,NULL,NULL,'DOING',NULL,NULL,0,'2026-08-04 12:08:02.435','2026-08-04 14:33:55.281',NULL,NULL,NULL,NULL,NULL,NULL),('cmsem674g000ur4pz5u73a542','cmsem6709000tr4pzwbxi4lly','Lên 58kg mà vẫn giữ được dáng',NULL,'1m76 / 54kg đang quá gầy, ảnh hưởng cả sức lẫn ngoại hình.','THIS_YEAR',NULL,NULL,NULL,NULL,'NOT_STARTED',NULL,NULL,0,'2026-08-04 12:08:02.704','2026-08-04 12:08:02.704',NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `Goal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Item`
--

DROP TABLE IF EXISTS `Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Item` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kind` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('USING','DROPPED','WANT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'WANT',
  `startedAt` datetime(3) DEFAULT NULL,
  `endedAt` datetime(3) DEFAULT NULL,
  `cost` int DEFAULT NULL,
  `verdict` text COLLATE utf8mb4_unicode_ci,
  `note` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Item_areaId_status_idx` (`areaId`,`status`),
  CONSTRAINT `Item_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Item`
--

LOCK TABLES `Item` WRITE;
/*!40000 ALTER TABLE `Item` DISABLE KEYS */;
INSERT INTO `Item` (`id`, `areaId`, `name`, `kind`, `status`, `startedAt`, `endedAt`, `cost`, `verdict`, `note`, `createdAt`, `updatedAt`) VALUES ('cmsem65z00005r4pzkj0d5chz','cmsem65r30000r4pzhezye1jn','Anki','công cụ','USING',NULL,NULL,NULL,NULL,NULL,'2026-08-04 12:08:01.212','2026-08-04 12:08:01.212'),('cmsem66dp000fr4pzgnn3n7bc','cmsem667x000br4pzx9bvmuin','Sữa rửa mặt (điền tên thật)','skincare','USING',NULL,NULL,NULL,NULL,NULL,'2026-08-04 12:08:01.741','2026-08-04 12:08:01.741'),('cmsem66dp000gr4pz3kqz7j2n','cmsem667x000br4pzx9bvmuin','Kem chống nắng','skincare','WANT',NULL,NULL,NULL,'Thứ đáng tiền nhất cho da về lâu dài.',NULL,'2026-08-04 12:08:01.741','2026-08-04 12:08:01.741');
/*!40000 ALTER TABLE `Item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Memory`
--

DROP TABLE IF EXISTS `Memory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Memory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` date NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci,
  `learned` text COLLATE utf8mb4_unicode_ci,
  `place` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `people` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visibility` enum('PRIVATE','PUBLIC') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRIVATE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Memory_date_idx` (`date`),
  KEY `Memory_visibility_date_idx` (`visibility`,`date`),
  KEY `Memory_areaId_fkey` (`areaId`),
  CONSTRAINT `Memory_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Memory`
--

LOCK TABLES `Memory` WRITE;
/*!40000 ALTER TABLE `Memory` DISABLE KEYS */;
/*!40000 ALTER TABLE `Memory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Metric`
--

DROP TABLE IF EXISTS `Metric`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Metric` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direction` enum('UP','DOWN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UP',
  `note` text COLLATE utf8mb4_unicode_ci,
  `order` int NOT NULL DEFAULT '0',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `group` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Metric_areaId_active_idx` (`areaId`,`active`),
  CONSTRAINT `Metric_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Metric`
--

LOCK TABLES `Metric` WRITE;
/*!40000 ALTER TABLE `Metric` DISABLE KEYS */;
INSERT INTO `Metric` (`id`, `areaId`, `name`, `unit`, `target`, `direction`, `note`, `order`, `active`, `createdAt`, `updatedAt`, `group`) VALUES ('cmsgjzeia0000twpzz6xl68bb','cmsem65r30000r4pzhezye1jn','Điểm mock JLPT — tổng','/180','≥ 95','UP','Đậu N3 cần 95/180. Thi thử khoảng một lần/tháng.',0,1,'2026-08-05 20:42:18.802','2026-08-05 20:57:37.869','JLPT'),('cmsgjzely0001twpza77b1ui5','cmsem65r30000r4pzhezye1jn','Điểm mock — phần yếu nhất','/60','≥ 19','UP','Dưới 19/60 là trượt dù tổng đủ điểm. Đổi tên thành phần đang kéo bạn xuống.',1,1,'2026-08-05 20:42:18.934','2026-08-05 20:57:37.937','JLPT'),('cmsgjzepo0002twpzsbaciad9','cmsem660e0006r4pzfyo8klx6','Hồ sơ đã nộp (cộng dồn)','công ty',NULL,'UP','Ghi mỗi tuần, kể cả tuần bằng 0 — nhất là tuần bằng 0.',0,1,'2026-08-05 20:42:19.068','2026-08-05 20:57:37.992','Ra thị trường'),('cmsgjzesy0003twpz3ykhef9p','cmsem660e0006r4pzfyo8klx6','Project đủ tốt để mang đi phỏng vấn','project','3','UP','Đích 3 lấy từ mục tiêu năm nay. Chỉ đếm project dám mở ra trước mặt người phỏng vấn.',1,1,'2026-08-05 20:42:19.186','2026-08-05 20:57:38.050','Năng lực'),('cmsgjzew70004twpzisn1u3q9','cmsem6709000tr4pzwbxi4lly','Cân nặng','kg','58','UP','Đích 58 lấy từ mục tiêu năm nay. Cân cùng một giờ, mỗi tuần một lần.',0,1,'2026-08-05 20:42:19.303','2026-08-05 20:57:38.103',NULL),('cmsgjzezv0005twpzy633xjrj','cmsem66sr000pr4pzbxi6vzy1','Tổng chi tháng','¥',NULL,'DOWN','Ghi vào ngày cuối tháng. Chi tiêu theo ngày nhiễu quá, gộp tháng mới thấy xu hướng.',0,1,'2026-08-05 20:42:19.435','2026-08-05 20:57:38.162',NULL),('cmsgjzf350006twpzuns40wrf','cmsem66sr000pr4pzbxi6vzy1','Quỹ khẩn cấp','¥','= 3 tháng chi phí','UP','Đích phụ thuộc «Tổng chi tháng» — chưa biết mỗi tháng chi bao nhiêu thì chưa biết cần bao nhiêu.',1,1,'2026-08-05 20:42:19.553','2026-08-05 20:57:38.222',NULL);
/*!40000 ALTER TABLE `Metric` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MetricEntry`
--

DROP TABLE IF EXISTS `MetricEntry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MetricEntry` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metricId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` date NOT NULL,
  `value` double NOT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `MetricEntry_metricId_date_key` (`metricId`,`date`),
  KEY `MetricEntry_metricId_date_idx` (`metricId`,`date`),
  CONSTRAINT `MetricEntry_metricId_fkey` FOREIGN KEY (`metricId`) REFERENCES `Metric` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MetricEntry`
--

LOCK TABLES `MetricEntry` WRITE;
/*!40000 ALTER TABLE `MetricEntry` DISABLE KEYS */;
/*!40000 ALTER TABLE `MetricEntry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MonthBudget`
--

DROP TABLE IF EXISTS `MonthBudget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MonthBudget` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` date NOT NULL,
  `income` int DEFAULT NULL,
  `note` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MonthBudget_month_key` (`month`),
  KEY `MonthBudget_month_idx` (`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MonthBudget`
--

LOCK TABLES `MonthBudget` WRITE;
/*!40000 ALTER TABLE `MonthBudget` DISABLE KEYS */;
/*!40000 ALTER TABLE `MonthBudget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Photo`
--

DROP TABLE IF EXISTS `Photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Photo` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbUrl` text COLLATE utf8mb4_unicode_ci,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `bytes` int DEFAULT NULL,
  `caption` text COLLATE utf8mb4_unicode_ci,
  `takenAt` datetime(3) DEFAULT NULL,
  `memoryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `postId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visibility` enum('PRIVATE','PUBLIC') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRIVATE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `Photo_visibility_takenAt_idx` (`visibility`,`takenAt`),
  KEY `Photo_memoryId_idx` (`memoryId`),
  KEY `Photo_areaId_fkey` (`areaId`),
  KEY `Photo_postId_fkey` (`postId`),
  CONSTRAINT `Photo_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Photo_memoryId_fkey` FOREIGN KEY (`memoryId`) REFERENCES `Memory` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Photo_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Photo`
--

LOCK TABLES `Photo` WRITE;
/*!40000 ALTER TABLE `Photo` DISABLE KEYS */;
/*!40000 ALTER TABLE `Photo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Post`
--

DROP TABLE IF EXISTS `Post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Post` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleJa` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bodyJa` longtext COLLATE utf8mb4_unicode_ci,
  `visibility` enum('PRIVATE','PUBLIC') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PRIVATE',
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Post_slug_key` (`slug`),
  KEY `Post_visibility_publishedAt_idx` (`visibility`,`publishedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Post`
--

LOCK TABLES `Post` WRITE;
/*!40000 ALTER TABLE `Post` DISABLE KEYS */;
INSERT INTO `Post` (`id`, `slug`, `title`, `excerpt`, `body`, `titleJa`, `bodyJa`, `visibility`, `publishedAt`, `createdAt`, `updatedAt`) VALUES ('cmsepz5fo0000acpztskpx3r0','anki-lo-tu-vung-toi-lo-chien-luoc','Anki lo từ vựng, tôi lo chiến lược','Tôi từng chép từ vựng vào ba nơi khác nhau và tưởng đó là học. Đây là cách tôi chia lại việc giữa công cụ học và hệ thống theo dõi.','Có một giai đoạn tôi chép cùng một từ vựng vào ba chỗ: vở tay, một file spreadsheet, và Anki.\n\nTôi nghĩ như vậy là chăm. Thực ra tôi đang tiêu phần lớn thời gian học vào việc **sắp xếp** tài liệu chứ không phải học nó. Chép lại một từ ba lần cho cảm giác đã học ba lần, trong khi thực tế là học không lần nào tử tế.\n\nSau khi bỏ được thói quen đó, tôi rút ra một nguyên tắc mà giờ tôi áp dụng cho mọi thứ chứ không riêng tiếng Nhật:\n\n> Một công cụ chỉ nên làm đúng thứ nó làm tốt nhất. Nếu có công cụ khác làm tốt hơn thì đừng làm lại.\n\n## Anki làm việc mà tôi không làm nổi bằng tay\n\nAnki mạnh ở đúng một chỗ: nó quyết định **khi nào** tôi phải gặp lại một từ.\n\nĐó là thứ tôi tự làm không được. Tôi không thể tự nhớ rằng từ này lần trước tôi trả lời sai nên hôm nay phải xem lại, còn từ kia tôi thuộc rồi nên hai tuần nữa mới cần gặp. Với vài trăm từ thì bất khả thi, mà tới N3 thì con số là vài nghìn.\n\nCho nên mọi thứ thuộc loại \"phải nhớ đúng từng chi tiết\" tôi giao hết cho Anki: từ vựng, kanji, cách đọc, mẫu ngữ pháp, cụm từ hay gặp trong bài nghe.\n\nCái tôi **không** làm nữa là chép chúng ra chỗ khác để \"cho chắc\". Chép ra chỗ khác không làm tôi nhớ tốt hơn. Nó chỉ làm tôi mất thời gian và tạo ra hai bản dữ liệu mà sớm muộn cũng lệch nhau.\n\n## Còn lại là những câu hỏi Anki không trả lời được\n\nNhưng Anki cũng không cho tôi biết những thứ này:\n\n- Tôi đang thật sự ở mức nào so với N3?\n- Phần nào đang kéo tôi xuống?\n- Tháng vừa rồi tôi có tiến bộ không, hay chỉ đang bận rộn?\n- Với tốc độ hiện tại thì tới ngày thi tôi có kịp không?\n\nĐây mới là những câu hỏi thay đổi cách tôi học. Và chúng cần một chỗ khác để theo dõi — chỗ đó không cần chứa một từ vựng nào.\n\nTôi ghi bốn thứ, không hơn:\n\n**Điểm mock test.** Mỗi tháng làm một đề đủ, bấm giờ nghiêm túc, ghi điểm từng phần theo đúng thang thật của JLPT: từ vựng và ngữ pháp, đọc hiểu, nghe hiểu. Đây là con số duy nhất tôi tin.\n\n**Phần đang yếu nhất.** Mỗi lần chấm xong tôi chọn ra đúng một phần yếu nhất và đó là thứ tôi ưu tiên trong tháng tiếp theo. Chỉ một, không phải ba.\n\n**Số phút học mỗi ngày.** Không phải để tự khen, mà để khi điểm không lên tôi phân biệt được hai trường hợp hoàn toàn khác nhau: học chưa đủ, hay học sai cách. Hai cái đó cần hai cách xử lý ngược nhau.\n\n**Ngày thi và số ngày còn lại.** Con số này làm mọi quyết định khác trở nên rõ ràng hơn nhiều.\n\n## Vì sao tôi không dùng phần trăm\n\nTrước đây tôi hay ghi kiểu \"từ vựng 72%, ngữ pháp 61%\".\n\nNhìn thì có vẻ chính xác, nhưng nếu hỏi 72% của cái gì thì tôi không trả lời được. 72% số từ trong cuốn sách tôi đang học? Cuốn đó có đủ cho N3 không? Tôi cũng không biết. Con số đó tôi tự bịa ra dựa trên cảm giác, rồi lại dùng chính nó để yên tâm.\n\nĐiểm mock test thì khác. Nó có thang cố định, có ngưỡng đậu rõ ràng, và tháng này so với tháng trước là so sánh được. Nó cũng khó chịu hơn nhiều — vì khi điểm không lên thì không có cách nào tự giải thích cho dễ chịu.\n\nNhưng đó chính là điểm mạnh của nó.\n\n## Kaiwa và shadowing thì đo thế nào\n\nĐây là chỗ tôi từng bối rối, vì hai kỹ năng này không có điểm số.\n\nCuối cùng tôi quyết định chỉ ghi **số buổi mỗi tuần**, không ghi nội dung. Tuần này nói chuyện với người Nhật mấy lần. Shadowing mấy buổi.\n\nLý do: với hai kỹ năng này, thứ quyết định là tần suất chứ không phải chất lượng của từng buổi. Ngồi phân tích một buổi hội thoại đã qua gần như không giúp gì. Nói thêm một buổi nữa thì giúp.\n\nGhi ít đi khiến tôi thực sự ghi. Trước đây tôi định ghi chi tiết từng buổi và kết quả là không ghi buổi nào.\n\n## Cách chia việc, viết gọn lại\n\n**Anki** giữ những thứ phải nhớ chính xác: từ vựng, kanji, ngữ pháp.\n\n**Bảng theo dõi** giữ những thứ giúp tôi ra quyết định: điểm thi thử, điểm yếu, số phút học, số ngày còn lại.\n\n**Không có chỗ thứ ba.** Không vở chép lại, không file tổng hợp, không ứng dụng thứ tư.\n\nNghe đơn giản, nhưng phải mất một thời gian khá dài tôi mới bỏ được cảm giác rằng chép lại nhiều lần nghĩa là chăm chỉ. Thật ra nó chỉ là một cách bận rộn dễ chịu — nó cho tôi cảm giác đang học mà không đòi hỏi phải thật sự nhớ được gì.',NULL,NULL,'PRIVATE',NULL,'2026-08-18 00:00:00.000','2026-08-04 13:54:32.388'),('cmsepz5k90001acpz97ogex8b','ba-thoi-quen-thay-vi-ba-muoi','Ba thói quen thay vì ba mươi','Tôi từng thử theo dõi hai mươi thói quen một lúc. Bỏ sau chín ngày. Đây là ba thứ tôi giữ lại và lý do.','Lần đầu tôi thử làm habit tracker, tôi liệt kê ra khoảng hai mươi thói quen. Uống đủ nước. Dậy sớm. Thiền. Đọc sách. Học tiếng Nhật. Học code. Tập gym. Không lướt điện thoại trên giường. Skincare sáng. Skincare tối. Viết nhật ký. Ăn sáng. Đi bộ mười nghìn bước.\n\nTôi làm một cái bảng đẹp lắm, hai mươi dòng, ba mươi cột.\n\nChín ngày sau tôi bỏ.\n\nKhông phải vì tôi không làm được những việc đó. Mà vì bản thân việc **theo dõi** chúng đã trở thành một công việc riêng, và là một công việc khiến tôi thấy tệ mỗi tối khi nhìn vào bảng thấy chín ô trống.\n\n## Vấn đề của việc theo dõi quá nhiều\n\nKhi theo dõi hai mươi thứ, mỗi ngày bạn có hai mươi cơ hội để thất bại. Không ai làm đủ hai mươi việc mỗi ngày trong thời gian dài. Nên cái bảng đó, thay vì cho tôi biết mình đang đi đúng hướng hay không, chỉ liên tục nhắc tôi rằng tôi chưa đủ tốt.\n\nCòn một vấn đề tinh vi hơn: khi mọi thứ đều được đánh dấu như nhau, tôi mất khả năng phân biệt cái nào thật sự quan trọng. Uống đủ nước và học tiếng Nhật sáu mươi phút nằm cùng một hàng, cùng một dấu tích. Có những hôm tôi tích được mười lăm ô nhỏ nhặt và bỏ đúng cái ô quan trọng nhất, nhưng nhìn vào bảng thì hôm đó trông vẫn \"thành công\".\n\n## Thứ tôi tìm: thói quen kéo theo thói quen khác\n\nLần này tôi hỏi khác đi. Không hỏi \"tôi muốn có những thói quen tốt nào\", mà hỏi:\n\n> Nếu chỉ được giữ một vài thói quen, cái nào khi làm được sẽ tự động kéo theo nhiều thứ khác?\n\nCâu hỏi đó cho ra danh sách ngắn hơn hẳn.\n\n**Một — ngủ trước mười hai giờ đêm.**\n\nĐây là cái tôi đánh giá thấp lâu nhất. Nhưng khi ngủ đủ, hầu như mọi thứ khác đều dễ hơn: tôi tập trung được lâu hơn, ít thèm ăn vặt hơn, đi tập không thấy nặng nề, và tâm trạng ổn định hơn nhiều. Còn khi thiếu ngủ, tôi không làm được thứ gì tử tế và thường bù bằng cách lướt điện thoại — thứ lại khiến tôi ngủ muộn hơn nữa.\n\nNgủ đủ không phải một thói quen trong danh sách. Nó là điều kiện để những thói quen khác có thể tồn tại.\n\n**Hai — học tiếng Nhật ít nhất sáu mươi phút.**\n\nSáu mươi phút là con số tôi chọn có chủ ý. Ba mươi phút một ngày nghe hợp lý và dễ duy trì, nhưng theo tôi tính thì với tốc độ đó tôi không kịp N3 trong khoảng thời gian mình muốn. Còn hai tiếng thì tôi biết mình không giữ được quá một tuần.\n\nSáu mươi phút là chỗ vừa đủ khó để tiến bộ và vừa đủ dễ để không bỏ.\n\nTôi không quan tâm sáu mươi phút đó chia thế nào — Anki lúc đi tàu, nghe podcast lúc nấu ăn, ngồi làm ngữ pháp buổi tối. Miễn là đủ.\n\n**Ba — ăn đủ ba bữa.**\n\nTôi cao 1m76 và nặng 54kg. Với tôi, vấn đề chưa bao giờ là ăn gì cho đúng chuẩn dinh dưỡng — vấn đề là tôi hay bỏ bữa. Bận thì bỏ, lười thì bỏ, dậy muộn thì bỏ luôn bữa sáng.\n\nNên tôi không đếm calo, không cân thức ăn, không chia macro. Tôi chỉ hỏi một câu mỗi tối: hôm nay ăn đủ ba bữa chưa.\n\nVới người đang thiếu cân, câu hỏi đó giải quyết được nhiều hơn bất kỳ ứng dụng dinh dưỡng nào.\n\n## Cộng thêm một thứ, nhưng tính theo tuần\n\nTập luyện: ba buổi một tuần.\n\nTôi cố tình không đưa nó vào nhóm theo dõi hằng ngày. Nếu tính theo ngày thì bốn ngày không tập trong tuần sẽ hiện ra thành bốn dấu đỏ, trong khi thực tế ba buổi một tuần đã là đúng kế hoạch. Đó là lỗi thiết kế chứ không phải lỗi của tôi.\n\nCó những thứ nên đo theo tuần. Ép mọi thứ vào ô hằng ngày là cách nhanh nhất để tạo ra cảm giác thất bại giả.\n\n## Những thứ tôi cố tình không theo dõi\n\nDanh sách này quan trọng ngang danh sách trên.\n\nTôi không đếm số phút lướt mạng xã hội. Không ghi từng bữa ăn. Không đếm ly nước. Không đo từng khoảng thời gian làm việc. Không chấm điểm tâm trạng mỗi ngày.\n\nLý do chung: **những con số đó không dẫn tới quyết định nào cả.**\n\nBiết hôm qua tôi lướt điện thoại chín mươi tư phút thì tôi làm gì với con số đó? Không gì cả. Tôi vốn đã biết là mình lướt nhiều. Ghi lại chỉ khiến tôi thấy tệ thêm một lần nữa.\n\nNgược lại, câu hỏi \"hôm nay có làm được ba việc nền tảng không\" thì dẫn thẳng tới hành động. Nếu ba ngày liền tôi trả lời không, tôi biết ngay là có gì đó cần sửa, và sửa cái gì.\n\nĐó là tiêu chuẩn tôi dùng bây giờ: **nếu một con số không thay đổi việc tôi sẽ làm, tôi không ghi nó.**\n\n## Một điều nữa: bỏ lỡ một ngày là chuyện bình thường\n\nTôi từng nghĩ chuỗi ngày liên tục là thứ quan trọng nhất. Đứt chuỗi là hỏng hết.\n\nBây giờ tôi nghĩ khác. Bỏ một ngày là chuyện bình thường, sống thì phải có hôm bất thường. Nhưng bỏ **hai ngày liên tiếp** thì tôi coi đó là tín hiệu cần sửa hệ thống, không phải cần trách bản thân.\n\nBỏ hai ngày liên tiếp thường có nghĩa là cái ngưỡng tôi đặt ra đang quá cao so với đời sống thật của tôi lúc đó. Cách xử lý đúng là hạ ngưỡng xuống mức tôi chắc chắn làm được, chứ không phải cắn răng cố thêm rồi bỏ hẳn sau một tuần.\n\nBa thói quen thì dễ khôi phục. Hai mươi thói quen thì một khi đã đứt là không quay lại được nữa — và đó chính xác là chuyện đã xảy ra với tôi lần trước.',NULL,NULL,'PRIVATE',NULL,'2026-08-11 00:00:00.000','2026-08-04 13:54:32.553'),('cmsepz5ol0002acpz2kk6s2ru','muoi-muc-tieu-va-khong-di-toi-dau','Tôi có mười mục tiêu và không đi tới đâu cả','Vấn đề của tôi không phải lười. Vấn đề là tôi chưa bao giờ chọn. Đây là lý do tôi dựng trang web này.','Nếu bạn hỏi tôi muốn gì trong một hai năm tới, tôi trả lời được ngay, và trả lời rất nhiều:\n\nThi đậu N3, rồi lên N2. Nói tiếng Nhật trôi chảy. Làm được trong ngành IT ở Nhật. Code giỏi hơn. Kiếm được tiền và biết giữ tiền. Khỏe hơn. Tăng cân, có cơ. Da đẹp hơn. Tóc tử tế hơn. Có phong cách riêng. Ăn uống đàng hoàng. Ngủ đúng giờ. Đi nhiều nơi ở Nhật. Đọc nhiều hơn. Trưởng thành hơn.\n\nDanh sách đó không sai chỗ nào. Vấn đề là tôi giữ nguyên nó suốt một thời gian dài, và trong suốt thời gian đó tôi làm rất nhiều thứ mà gần như không có thứ nào đi tới đâu.\n\n## Bận không có nghĩa là đang tiến lên\n\nCó những ngày tôi thật sự bận. Học một ít tiếng Nhật, xem một ít video lập trình, định đi tập rồi thôi, tối lướt điện thoại tới một hai giờ sáng, hôm sau dậy mệt và lặp lại.\n\nCuối tuần nhìn lại, tôi không nói được mình đã tiến bộ ở đâu. Nhưng tôi cũng không thấy mình lười. Cảm giác đó khó chịu hơn cả lười — vì nếu lười thì ít nhất còn biết phải sửa cái gì.\n\nSau một thời gian tôi mới nhận ra: cái tôi thiếu không phải là cố gắng. Cái tôi thiếu là **chọn**.\n\nMười mục tiêu song song, mỗi cái nhích một chút, thì không cái nào đi qua được cái ngưỡng mà ở đó nó bắt đầu có ý nghĩa. Sáu tháng học tiếng Nhật ba mươi phút một ngày không đưa tôi tới N3. Sáu tháng xem video lập trình mà không build gì thì không tạo ra được thứ gì để đưa cho nhà tuyển dụng xem.\n\nTrong khi đó, nếu tôi bỏ bảy thứ đi và dồn vào ba thứ, cả ba đều sẽ đi qua được cái ngưỡng đó.\n\nTôi biết điều này về mặt lý thuyết từ lâu. Nhưng biết và làm được là hai chuyện khác nhau, và tôi cần một thứ gì đó bên ngoài đầu mình để giữ cho mình không trôi.\n\n## Cái gì nằm trong đầu thì mình tự lừa được\n\nĐây là chỗ tôi thấy rõ nhất.\n\nKhi ba việc quan trọng chỉ nằm trong đầu, tôi có thể đổi chúng bất cứ lúc nào mà không cảm thấy gì. Hôm nay tiếng Nhật quan trọng nhất. Mai đọc được một bài về đầu tư, thế là tài chính quan trọng nhất. Ngày kia thấy ai đó đăng ảnh tập gym, thế là thể hình quan trọng nhất.\n\nMỗi lần đổi tôi đều có lý do nghe rất hợp lý. Và vì không có gì ghi lại, tôi không nhận ra là mình đã đổi bảy lần trong một tháng.\n\nCho nên tôi làm một trang tên là [`/now`](/now) trên chính website này. Trên đó ghi đúng ba việc tôi đang tập trung. Ba, không phải mười. Muốn thêm việc thứ tư thì phải bỏ một trong ba việc đang có — không có cách nào khác.\n\nVà nó công khai. Ai vào cũng đọc được.\n\nĐó là điểm quan trọng nhất. Trong đầu thì tôi lừa mình dễ lắm. Viết ra chỗ người khác nhìn thấy thì khó hơn nhiều.\n\n## Tại sao là một trang web chứ không phải một cuốn sổ\n\nCó ba lý do.\n\nThứ nhất, tôi cần một chỗ ghi lại cuộc sống ở đây. Tôi đang sống ở Nhật, và tôi biết vài năm nữa nhìn lại, những chuyện tưởng như vặt vãnh bây giờ mới là thứ tôi muốn nhớ. Ảnh, chuyện xảy ra trong ngày, những thứ lần đầu tôi thử. Nếu không ghi thì nó trôi mất, và tôi chỉ còn nhớ được cảm giác chung chung là \"hồi đó mình ở Nhật\".\n\nThứ hai, tôi đang tìm việc IT ở Nhật. Nói \"tôi đang học lập trình\" thì ai cũng nói được. Đưa ra một thứ mình đã build và đang chạy thật thì khác. Chính trang web này là một trong số đó — nó viết bằng Next.js và TypeScript, đúng những thứ tôi muốn được thuê để làm.\n\nThứ ba, cái này thực dụng: viết ra thì tôi mới biết mình hiểu tới đâu. Nhiều lần tôi tưởng mình nắm được một khái niệm, tới lúc ngồi giải thích lại bằng chữ mới thấy mình chỉ nhớ mang máng.\n\n## Tôi định viết gì ở đây\n\nBốn thứ, và tôi sẽ cố không mở rộng thêm:\n\n**Tiếng Nhật** — tôi học thế nào, cái gì có tác dụng, cái gì tôi thử rồi bỏ, điểm thi thật của tôi kể cả khi nó thấp.\n\n**Lập trình** — tôi đang học gì, build gì, hỏng chỗ nào và sửa ra sao.\n\n**Sống ở Nhật** — thủ tục, chi phí, những chỗ tôi đi, những lần tôi hiểu sai văn hóa ở đây.\n\n**Ghi chép** — ảnh và những đoạn ngắn, không cần trau chuốt.\n\nMột số bài tôi sẽ viết thêm bản tiếng Nhật. Không phải bản dịch — bản tiếng Nhật sẽ ngắn hơn nhiều và viết bằng đúng trình độ hiện tại của tôi. Mục tiêu là tập viết thật, không phải chứng minh là tôi dịch được. Tôi đặt cho mình một bài mỗi tháng, thế là đủ.\n\n## Một điều tôi muốn nói trước\n\nTôi không định biến chỗ này thành nơi trưng bày phiên bản đẹp nhất của mình.\n\nHiện tại tôi cao 1m76 và nặng 54kg. Tôi ngủ không đúng giờ. Tôi ăn uống thất thường. Tôi mất tập trung dễ hơn tôi muốn thừa nhận. Trình tiếng Nhật của tôi chưa tới N3. Tôi chưa có project nào đủ tốt để tự tin đưa cho người khác xem.\n\nTôi viết những thứ đó ra ở đây, ngay bài đầu tiên, vì tôi muốn sau này còn có cái để so.\n\nNếu một năm nữa quay lại đọc bài này mà tôi không thấy khác gì, thì ít nhất tôi cũng biết chắc là mình đã không đi tới đâu — và biết chắc vẫn tốt hơn là mơ hồ tưởng mình đang tiến bộ.\n\nBắt đầu từ đây.','目標が十個あって、どれも進まなかった話','私はやりたいことが多すぎました。\n\n日本語能力試験のN3に合格したい。ITエンジニアとして働きたい。体を強くしたい。お金を貯めたい。生活を整えたい。\n\n全部大切だと思っていました。だから毎日、少しずつ全部やりました。でも半年たっても、どれも進んでいませんでした。\n\n問題は、努力が足りなかったことではありません。**選んでいなかったこと**が問題でした。\n\n目標が十個あるとき、実際に進むのはゼロです。三つだけ選べば、その三つは進みます。頭では前から分かっていましたが、できていませんでした。\n\nだから、このサイトを作りました。\n\nここには「Now」というページがあります。今集中していることを三つだけ書きます。四つ目は書きません。どうしても書きたいときは、今の三つから一つ消します。\n\n公開する理由は簡単です。頭の中だけなら、自分に嘘をつけます。人が見られる場所に書けば、嘘をつきにくくなります。\n\nもう一つ理由があります。私は日本でITの仕事を探しています。「勉強しています」と言うより、作ったものを見せるほうが早いと思いました。このサイト自体がその一つです。\n\nうまくいったことだけを書くつもりはありません。失敗も書きます。一年後にこの記事を読み返して、自分が本当に変わったかどうかを確かめたいからです。\n\nここから始めます。','PRIVATE',NULL,'2026-08-04 00:00:00.000','2026-08-04 13:58:49.843');
/*!40000 ALTER TABLE `Post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Principle`
--

DROP TABLE IF EXISTS `Principle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Principle` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `areaId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kind` enum('DO','DONT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `why` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `order` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Principle_areaId_kind_idx` (`areaId`,`kind`),
  CONSTRAINT `Principle_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Principle`
--

LOCK TABLES `Principle` WRITE;
/*!40000 ALTER TABLE `Principle` DISABLE KEYS */;
INSERT INTO `Principle` (`id`, `areaId`, `kind`, `text`, `why`, `active`, `order`, `createdAt`, `updatedAt`) VALUES ('cmsem65xc0003r4pzy9j2yqgg','cmsem65r30000r4pzhezye1jn','DO','Học mỗi ngày một ít, kể cả hôm mệt chỉ làm 10 phút Anki','Đứt chuỗi tốn nhiều sức khôi phục hơn là duy trì.',1,0,'2026-08-04 12:08:01.152','2026-08-04 12:08:01.152'),('cmsem65xc0004r4pzolwwml77','cmsem65r30000r4pzhezye1jn','DONT','Không chép lại từ vựng ra sổ hay file khác — Anki lo phần đó','Chép ba nơi cho cảm giác chăm chỉ nhưng không nhớ thêm được gì.',1,1,'2026-08-04 12:08:01.152','2026-08-04 12:08:01.152'),('cmsem66680009r4pzygcto3lj','cmsem660e0006r4pzfyo8klx6','DO','Học xong thứ gì thì phải build ra được một thứ dùng được','Xem hết khóa học không chứng minh được gì với người tuyển dụng.',1,0,'2026-08-04 12:08:01.472','2026-08-04 12:08:01.472'),('cmsem6668000ar4pzti632fss','cmsem660e0006r4pzfyo8klx6','DONT','Không tự nhận giỏi một kỹ năng nếu chưa có link chứng minh',NULL,1,1,'2026-08-04 12:08:01.472','2026-08-04 12:08:01.472'),('cmsem66c7000cr4pz1okjz46h','cmsem667x000br4pzx9bvmuin','DO','Quần áo ít nhưng vừa người, hơn nhiều mà rộng thùng thình',NULL,1,0,'2026-08-04 12:08:01.687','2026-08-04 12:08:01.687'),('cmsem66c7000dr4pz2doqulvu','cmsem667x000br4pzx9bvmuin','DONT','Không mua chỉ vì đang giảm giá','Đồ mua vì giảm giá thường nằm trong tủ không mặc.',1,1,'2026-08-04 12:08:01.687','2026-08-04 12:08:01.687'),('cmsem66c7000er4pznxw1mrzd','cmsem667x000br4pzx9bvmuin','DONT','Không đổi cả routine skincare cùng lúc','Đổi một lúc nhiều thứ thì không biết cái nào có tác dụng.',1,2,'2026-08-04 12:08:01.687','2026-08-04 12:08:01.687'),('cmsem66jd000ir4pziygj1lw8','cmsem66f4000hr4pzwwxcy6bb','DO','Nói ra điều mình cần, đừng bắt người ta đoán',NULL,1,0,'2026-08-04 12:08:01.945','2026-08-04 12:08:01.945'),('cmsem66jd000jr4pzz3fn4smz','cmsem66f4000hr4pzwwxcy6bb','DO','Cãi nhau xong phải chốt lại, không để lửng lơ qua đêm',NULL,1,1,'2026-08-04 12:08:01.945','2026-08-04 12:08:01.945'),('cmsem66jd000kr4pzshv1ouvp','cmsem66f4000hr4pzwwxcy6bb','DONT','Không im lặng bỏ đi giữa lúc đang nói chuyện',NULL,1,2,'2026-08-04 12:08:01.945','2026-08-04 12:08:01.945'),('cmsem66jd000lr4pz4tlka2p8','cmsem66f4000hr4pzwwxcy6bb','DONT','Không đem chuyện của hai người ra kể với người thứ ba',NULL,1,3,'2026-08-04 12:08:01.945','2026-08-04 12:08:01.945'),('cmsem66r2000or4pzwm0uepms','cmsem66l0000mr4pzf0sgods3','DO','Kể cả chuyện không hay, đừng chỉ báo tin tốt','Báo mỗi tin tốt thì thành người lạ lịch sự.',1,0,'2026-08-04 12:08:02.222','2026-08-04 12:08:02.222'),('cmsem66yl000rr4pz7hzfm7ai','cmsem66sr000pr4pzbxi6vzy1','DO','Ghi lại tổng chi mỗi ngày, chỉ một con số',NULL,1,0,'2026-08-04 12:08:02.493','2026-08-04 12:08:02.493'),('cmsem66yl000sr4pz2728bs3u','cmsem66sr000pr4pzbxi6vzy1','DONT','Không để tiền ăn ngoài + mua sắm + giải trí vượt 20% thu nhập',NULL,1,1,'2026-08-04 12:08:02.493','2026-08-04 12:08:02.493'),('cmsem6761000vr4pz1n8l8n50','cmsem6709000tr4pzwbxi4lly','DO','Ngủ trước 12h — thứ này kéo theo gần như mọi thứ khác',NULL,1,0,'2026-08-04 12:08:02.761','2026-08-04 12:08:02.761'),('cmsem6761000wr4pzllyj307l','cmsem6709000tr4pzwbxi4lly','DO','Ăn đủ ba bữa, không đếm calo','Vấn đề của mình là bỏ bữa, không phải ăn sai.',1,1,'2026-08-04 12:08:02.761','2026-08-04 12:08:02.761'),('cmsem6761000xr4pze42acu6v','cmsem6709000tr4pzwbxi4lly','DONT','Không bỏ bữa sáng vì dậy muộn',NULL,1,2,'2026-08-04 12:08:02.761','2026-08-04 12:08:02.761');
/*!40000 ALTER TABLE `Principle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tag`
--

DROP TABLE IF EXISTS `Tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tag` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Tag_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tag`
--

LOCK TABLES `Tag` WRITE;
/*!40000 ALTER TABLE `Tag` DISABLE KEYS */;
INSERT INTO `Tag` (`id`, `slug`, `name`, `order`, `createdAt`) VALUES ('cmseqs7ms0000qopzn021plt7','japanese','Tiếng Nhật',0,'2026-08-04 14:17:08.260'),('cmseqs7r50001qopzl4uyqtlw','dev','Dev',1,'2026-08-04 14:17:08.417'),('cmseqs7va0002qopziq6l12nf','japan-life','Sống ở Nhật',2,'2026-08-04 14:17:08.566'),('cmseqs7zg0003qopztjogeh7s','note','Ghi chép',3,'2026-08-04 14:17:08.717');
/*!40000 ALTER TABLE `Tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_PostTags`
--

DROP TABLE IF EXISTS `_PostTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_PostTags` (
  `A` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `B` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `_PostTags_AB_unique` (`A`,`B`),
  KEY `_PostTags_B_index` (`B`),
  CONSTRAINT `_PostTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `Post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_PostTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_PostTags`
--

LOCK TABLES `_PostTags` WRITE;
/*!40000 ALTER TABLE `_PostTags` DISABLE KEYS */;
INSERT INTO `_PostTags` (`A`, `B`) VALUES ('cmsepz5fo0000acpztskpx3r0','cmseqs7ms0000qopzn021plt7'),('cmsepz5k90001acpz97ogex8b','cmseqs7zg0003qopztjogeh7s'),('cmsepz5ol0002acpz2kk6s2ru','cmseqs7zg0003qopztjogeh7s');
/*!40000 ALTER TABLE `_PostTags` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-07 16:36:09
