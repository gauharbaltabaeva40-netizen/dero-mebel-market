CREATE TABLE `companySettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companySettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `companySettings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionKk` text NOT NULL,
	`questionRu` text NOT NULL,
	`answerKk` text NOT NULL,
	`answerRu` text NOT NULL,
	`category` enum('company','products','materials','price','ordering','payment','delivery','installation','warranty','custom') NOT NULL,
	`keywords` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`phone` varchar(32),
	`source` enum('website_ai','instagram','whatsapp','kaspi','manager') NOT NULL DEFAULT 'website_ai',
	`product` enum('kitchen','wardrobe','unknown') NOT NULL DEFAULT 'unknown',
	`score` enum('hot','warm','cold','unqualified') NOT NULL DEFAULT 'unqualified',
	`scoreReason` text,
	`sizeMeters` float,
	`style` varchar(64),
	`material` varchar(128),
	`budgetKzt` int,
	`location` varchar(128),
	`deadline` varchar(64),
	`estimatedTotalKzt` int,
	`notes` text,
	`needsHuman` boolean NOT NULL DEFAULT false,
	`humanReason` text,
	`status` enum('new','contacted','measuring','quote_sent','closed','lost') NOT NULL DEFAULT 'new',
	`conversationId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pricingRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productType` enum('kitchen','wardrobe') NOT NULL,
	`ruleKey` varchar(64) NOT NULL,
	`value` float NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricingRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sku` varchar(32),
	`category` enum('kitchen','wardrobe') NOT NULL,
	`nameKk` text NOT NULL,
	`nameRu` text NOT NULL,
	`descriptionKk` text,
	`descriptionRu` text,
	`style` enum('modern','classic','minimalist','loft','classicModern') NOT NULL,
	`material` varchar(128) NOT NULL,
	`facade` varchar(128),
	`colors` json,
	`photoUrl` text NOT NULL,
	`widthMm` int,
	`heightMm` int,
	`depthMm` int,
	`basePriceKzt` int NOT NULL,
	`priceUnit` enum('per_meter','per_m2','fixed') NOT NULL DEFAULT 'per_meter',
	`features` json,
	`leadTimeDays` int,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
