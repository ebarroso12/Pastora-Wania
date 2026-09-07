CREATE TABLE `coupleMentoringInterests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(120) NOT NULL,
	`partnerName` varchar(120),
	`contactType` enum('whatsapp','email') NOT NULL,
	`contactValue` varchar(320) NOT NULL,
	`interestStage` enum('know_more','talk_to_team') NOT NULL,
	`journeyFocus` enum('understand_fit','restore_dialogue','renew_connection','align_direction') NOT NULL DEFAULT 'understand_fit',
	`consent` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupleMentoringInterests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interaEvaluationRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(120) NOT NULL,
	`contactType` enum('whatsapp','email') NOT NULL,
	`contactValue` varchar(320) NOT NULL,
	`fragmentedArea` enum('emotional','relationships','family','professional','prosperity','purpose','faith') NOT NULL,
	`currentMoment` enum('understand_method','ready_to_start','still_evaluating') NOT NULL DEFAULT 'still_evaluating',
	`consent` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interaEvaluationRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
