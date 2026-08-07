-- iamvancuong — deploy DB: 15 bảng + 7 lĩnh vực (còn lại trống)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- CreateTable
CREATE TABLE `Area` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tagline` TEXT NULL,
    `icon` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Area_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Goal` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `detail` TEXT NULL,
    `why` TEXT NULL,
    `horizon` ENUM('WEEK', 'MONTH', 'THIS_YEAR', 'NEXT_YEAR', 'AGE', 'LIFE') NOT NULL,
    `horizonAge` INTEGER NULL,
    `periodStart` DATE NULL,
    `metric` VARCHAR(191) NULL,
    `target` VARCHAR(191) NULL,
    `current` VARCHAR(191) NULL,
    `status` ENUM('NOT_STARTED', 'DOING', 'DONE', 'DROPPED') NOT NULL DEFAULT 'NOT_STARTED',
    `dropReason` TEXT NULL,
    `doneAt` DATETIME(3) NULL,
    `outcome` ENUM('SUCCESS', 'PARTIAL', 'FAILED') NULL,
    `reviewWhat` TEXT NULL,
    `reviewWhy` TEXT NULL,
    `reviewNext` TEXT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Goal_areaId_status_idx`(`areaId`, `status`),
    INDEX `Goal_horizon_periodStart_idx`(`horizon`, `periodStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Principle` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `kind` ENUM('DO', 'DONT') NOT NULL,
    `text` TEXT NOT NULL,
    `why` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Principle_areaId_kind_idx`(`areaId`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `kind` VARCHAR(191) NULL,
    `status` ENUM('USING', 'DROPPED', 'WANT') NOT NULL DEFAULT 'WANT',
    `startedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `cost` INTEGER NULL,
    `verdict` TEXT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Item_areaId_status_idx`(`areaId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Metric` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NULL,
    `target` VARCHAR(191) NULL,
    `direction` ENUM('UP', 'DOWN') NOT NULL DEFAULT 'UP',
    `note` TEXT NULL,
    `group` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Metric_areaId_active_idx`(`areaId`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricEntry` (
    `id` VARCHAR(191) NOT NULL,
    `metricId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `value` DOUBLE NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MetricEntry_metricId_date_idx`(`metricId`, `date`),
    UNIQUE INDEX `MetricEntry_metricId_date_key`(`metricId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FixedCost` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `cycle` ENUM('MONTH', 'YEAR') NOT NULL DEFAULT 'MONTH',
    `note` TEXT NULL,
    `startedAt` DATE NULL,
    `endedAt` DATE NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MonthBudget` (
    `id` VARCHAR(191) NOT NULL,
    `month` DATE NOT NULL,
    `income` INTEGER NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MonthBudget_month_key`(`month`),
    INDEX `MonthBudget_month_idx`(`month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Memory` (
    `id` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NULL,
    `date` DATE NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NULL,
    `learned` TEXT NULL,
    `place` VARCHAR(191) NULL,
    `people` VARCHAR(191) NULL,
    `visibility` ENUM('PRIVATE', 'PUBLIC') NOT NULL DEFAULT 'PRIVATE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Memory_date_idx`(`date`),
    INDEX `Memory_visibility_date_idx`(`visibility`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Photo` (
    `id` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `thumbUrl` TEXT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `bytes` INTEGER NULL,
    `caption` TEXT NULL,
    `takenAt` DATETIME(3) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `memoryId` VARCHAR(191) NULL,
    `areaId` VARCHAR(191) NULL,
    `postId` VARCHAR(191) NULL,
    `visibility` ENUM('PRIVATE', 'PUBLIC') NOT NULL DEFAULT 'PRIVATE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Photo_visibility_takenAt_idx`(`visibility`, `takenAt`),
    INDEX `Photo_memoryId_idx`(`memoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FocusItem` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `areaId` VARCHAR(191) NULL,
    `status` ENUM('NOW', 'NEXT', 'LATER', 'NO') NOT NULL DEFAULT 'NEXT',
    `why` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FocusItem_status_idx`(`status`),
    INDEX `FocusItem_areaId_idx`(`areaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyLog` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `sleepAt` VARCHAR(191) NULL,
    `jpMin` INTEGER NOT NULL DEFAULT 0,
    `itMin` INTEGER NOT NULL DEFAULT 0,
    `spend` INTEGER NULL,
    `webMin` INTEGER NOT NULL DEFAULT 0,
    `kSleep` BOOLEAN NOT NULL DEFAULT false,
    `kJapanese` BOOLEAN NOT NULL DEFAULT false,
    `kEat` BOOLEAN NOT NULL DEFAULT false,
    `workout` BOOLEAN NOT NULL DEFAULT false,
    `journalWhat` TEXT NULL,
    `journalLearn` TEXT NULL,
    `journalChange` TEXT NULL,
    `publishable` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DailyLog_date_key`(`date`),
    INDEX `DailyLog_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Tag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `body` LONGTEXT NOT NULL,
    `titleJa` VARCHAR(191) NULL,
    `bodyJa` LONGTEXT NULL,
    `visibility` ENUM('PRIVATE', 'PUBLIC') NOT NULL DEFAULT 'PRIVATE',
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Post_slug_key`(`slug`),
    INDEX `Post_visibility_publishedAt_idx`(`visibility`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PostTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_PostTags_AB_unique`(`A`, `B`),
    INDEX `_PostTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Principle` ADD CONSTRAINT `Principle_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Metric` ADD CONSTRAINT `Metric_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricEntry` ADD CONSTRAINT `MetricEntry_metricId_fkey` FOREIGN KEY (`metricId`) REFERENCES `Metric`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Memory` ADD CONSTRAINT `Memory_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_memoryId_fkey` FOREIGN KEY (`memoryId`) REFERENCES `Memory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FocusItem` ADD CONSTRAINT `FocusItem_areaId_fkey` FOREIGN KEY (`areaId`) REFERENCES `Area`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTags` ADD CONSTRAINT `_PostTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PostTags` ADD CONSTRAINT `_PostTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- 7 lĩnh vực
INSERT INTO `Area` VALUES ('cmsem65r30000r4pzhezye1jn','tieng-nhat','Tiếng Nhật','Tôi đang ở đâu trên đường tới N2?','Languages',0,1,'2026-08-04 12:08:00.927','2026-08-06 01:42:46.432'),('cmsem660e0006r4pzfyo8klx6','cong-viec','Công việc','Tôi có đang tiến gần một công việc IT ở Nhật không?','Code',1,1,'2026-08-04 12:08:01.262','2026-08-06 01:42:46.577'),('cmsem667x000br4pzx9bvmuin','ban-than','Bản thân','Tôi đang chăm mình thế nào — da, tóc, quần áo, răng?','User',2,1,'2026-08-04 12:08:01.533','2026-08-06 01:42:46.727'),('cmsem66f4000hr4pzwwxcy6bb','tinh-yeu','Tình yêu','Tôi muốn đối xử với người mình yêu ra sao?','Heart',3,1,'2026-08-04 12:08:01.792','2026-08-06 01:42:46.878'),('cmsem66l0000mr4pzf0sgods3','gia-dinh','Gia đình','Tôi làm được gì cho bố mẹ?','Home',4,1,'2026-08-04 12:08:02.004','2026-08-06 01:42:47.027'),('cmsem66sr000pr4pzbxi6vzy1','tien','Tiền','Tôi đang đứng ở đâu về tài chính?','Wallet',5,1,'2026-08-04 12:08:02.283','2026-08-06 01:42:47.178'),('cmsem6709000tr4pzwbxi4lly','suc-khoe','Sức khỏe','Cơ thể tôi có đang khỏe lên không?','Activity',6,1,'2026-08-04 12:08:02.553','2026-08-06 01:42:47.327');

SET FOREIGN_KEY_CHECKS=1;
