CREATE TABLE `generation_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer NOT NULL,
	`pipeline_version` text NOT NULL,
	`outcome` text NOT NULL,
	`code_edits` integer NOT NULL,
	`model_repairs` integer NOT NULL,
	`failure_stage` text,
	`failure_reason` text,
	`prompt` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `generation_attempts_created_at` ON `generation_attempts` (`created_at`);--> statement-breakpoint
CREATE INDEX `generation_attempts_user_id_created_at` ON `generation_attempts` (`user_id`,`created_at`);