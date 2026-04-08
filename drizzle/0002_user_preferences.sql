CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`rejection_history` text NOT NULL DEFAULT '[]',
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);