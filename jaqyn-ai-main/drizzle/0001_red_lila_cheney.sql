CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`date` timestamp NOT NULL,
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`newCustomers` int NOT NULL DEFAULT 0,
	`repeatVisits` int NOT NULL DEFAULT 0,
	`totalVisits` int NOT NULL DEFAULT 0,
	`averageOrderValue` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`address` text,
	`workingHoursStart` varchar(5),
	`workingHoursEnd` varchar(5),
	`peakHoursStart` varchar(5),
	`peakHoursEnd` varchar(5),
	`quietHoursStart` varchar(5),
	`quietHoursEnd` varchar(5),
	`targetROI` decimal(5,2),
	`currency` varchar(3) NOT NULL DEFAULT 'KZT',
	`onboardingComplete` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businesses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`goal` varchar(100) NOT NULL,
	`targetSegment` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`channels` varchar(255) NOT NULL,
	`scheduledFor` timestamp,
	`status` enum('draft','scheduled','sent','completed') NOT NULL DEFAULT 'draft',
	`sentCount` int NOT NULL DEFAULT 0,
	`deliveredCount` int NOT NULL DEFAULT 0,
	`clickCount` int NOT NULL DEFAULT 0,
	`conversionCount` int NOT NULL DEFAULT 0,
	`revenueGenerated` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customerInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`businessId` int NOT NULL,
	`type` enum('visit','purchase','campaign_click','campaign_conversion') NOT NULL,
	`amount` decimal(12,2),
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customerInteractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320),
	`status` enum('active','at_risk','churned','vip') NOT NULL DEFAULT 'active',
	`lastVisit` timestamp,
	`totalVisits` int NOT NULL DEFAULT 0,
	`totalSpent` decimal(12,2) NOT NULL DEFAULT '0',
	`averageOrderValue` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(50) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT false,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
