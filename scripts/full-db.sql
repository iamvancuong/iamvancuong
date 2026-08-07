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
INSERT INTO `Post` (`id`, `slug`, `title`, `excerpt`, `body`, `titleJa`, `bodyJa`, `visibility`, `publishedAt`, `createdAt`, `updatedAt`) VALUES ('cmsj6zh4m00003opz81uh88n5','ngay-dau-tien','Ngày đầu tiên','Hôm nay trang này chính thức lên sóng. Không phải vì nó đã hoàn hảo, mà vì tôi cần bắt đầu dùng nó thật.','Hôm nay, 8 tháng 8 năm 2026, trang này chính thức chạy thật.\n\nTôi viết dòng code đầu tiên của nó cách đây vài ngày, và như mọi dự án cá nhân khác, tôi đã có thể sửa mãi không xong: thêm một tính năng, chỉnh một khoảng cách, đổi một cái nút. Nhưng có một sự thật đơn giản tôi phải tự nhắc — **một cái web không ai dùng thì đẹp đến mấy cũng vô nghĩa.**\n\nNên hôm nay tôi dừng việc xây, và bắt đầu việc dùng.\n\n## Trang này để làm gì\n\nĐây vừa là nơi tôi viết, vừa là công cụ tôi mở mỗi ngày. Phần công khai — chỗ bạn đang đọc — là những gì tôi muốn chia sẻ: bài viết, ảnh, và hành trình ở Nhật. Phía sau còn một phần riêng tư, nơi tôi ghi lại mọi thứ trước, rồi mới chọn ra cái đáng kể để kể ra ngoài.\n\nCách vận hành chỉ gói trong một câu: viết một lần, tick vào thì nó hiện ra đây.\n\n## Vì sao lại là hôm nay\n\nKhông có gì đặc biệt về ngày 8/8. Tôi chọn nó chỉ vì nếu không chốt một ngày, tôi sẽ không bao giờ bắt đầu.\n\nTừ hôm nay, chuỗi ngày của tôi bắt đầu lại từ số không. Số đo trống, nhật ký trống. Và đó là trạng thái đúng — vì từ đây, mọi con số sẽ là thật.\n\nHẹn gặp lại ở bài sau, khi đã có gì đó để kể.',NULL,NULL,'PUBLIC','2026-08-08 00:00:00.000','2026-08-07 17:01:45.718','2026-08-07 17:01:45.718');
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

-- Dump completed on 2026-08-07 17:02:01
