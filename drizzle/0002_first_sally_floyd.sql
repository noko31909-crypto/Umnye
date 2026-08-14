CREATE TABLE `businessProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`businessType` enum('coffee_shop','store','pharmacy','bakery','restaurant','other') NOT NULL DEFAULT 'store',
	`locationsCount` int NOT NULL DEFAULT 1,
	`productCategories` text,
	`autoOrderThreshold` decimal(3,1) NOT NULL DEFAULT '1.5',
	`preferredDeliveryDays` int NOT NULL DEFAULT 3,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businessProfiles_id` PRIMARY KEY(`id`)
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
	`goal` varchar(255),
	`targetSegment` varchar(100),
	`message` text,
	`channels` varchar(255),
	`sentCount` int NOT NULL DEFAULT 0,
	`returnedCount` int NOT NULL DEFAULT 0,
	`generatedRevenue` decimal(12,2) NOT NULL DEFAULT '0',
	`cost` decimal(10,2) NOT NULL DEFAULT '0',
	`roi` decimal(5,2) NOT NULL DEFAULT '0',
	`status` enum('draft','scheduled','sent','completed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`status` enum('new','regular','vip','at_risk','inactive') NOT NULL DEFAULT 'new',
	`totalVisits` int NOT NULL DEFAULT 0,
	`totalSpent` decimal(12,2) NOT NULL DEFAULT '0',
	`lastVisit` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '0',
	`price` decimal(10,2) NOT NULL DEFAULT '0',
	`deliveredQty` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`supplierId` int NOT NULL,
	`status` enum('pending','confirmed','collecting','in_transit','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`totalAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`expectedDeliveryDate` timestamp,
	`actualDeliveryDate` timestamp,
	`notes` text,
	`isAutoOrder` boolean NOT NULL DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`unit` varchar(32) NOT NULL DEFAULT 'шт',
	`currentStock` decimal(10,2) NOT NULL DEFAULT '0',
	`minStock` decimal(10,2) NOT NULL DEFAULT '10',
	`maxStock` decimal(10,2) NOT NULL DEFAULT '100',
	`avgSalesPerDay` decimal(10,2) NOT NULL DEFAULT '0',
	`costPrice` decimal(10,2) NOT NULL DEFAULT '0',
	`sellingPrice` decimal(10,2) NOT NULL DEFAULT '0',
	`preferredSupplierId` int,
	`autoOrderEnabled` boolean NOT NULL DEFAULT true,
	`status` enum('in_stock','low_stock','critical','out_of_stock') NOT NULL DEFAULT 'in_stock',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `salesHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`productId` int NOT NULL,
	`saleDate` timestamp NOT NULL,
	`quantity` decimal(10,2) NOT NULL DEFAULT '0',
	`revenue` decimal(12,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `salesHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplierProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supplierId` int NOT NULL,
	`productId` int NOT NULL,
	`price` decimal(10,2) NOT NULL DEFAULT '0',
	`minOrderQty` decimal(10,2) NOT NULL DEFAULT '1',
	`inStock` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supplierProducts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(128) NOT NULL,
	`contactPerson` varchar(128),
	`phone` varchar(20),
	`email` varchar(320),
	`avgDeliveryDays` decimal(3,1) NOT NULL DEFAULT '3',
	`reliabilityScore` decimal(3,1) NOT NULL DEFAULT '90',
	`lateDeliveryCount` int NOT NULL DEFAULT 0,
	`totalOrders` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `suppliers_id` PRIMARY KEY(`id`)
);
