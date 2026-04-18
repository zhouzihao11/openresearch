CREATE TABLE `remote_task` (
	`task_id` text PRIMARY KEY NOT NULL,
	`exp_id` text NOT NULL,
	`kind` text NOT NULL,
	`resource_key` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`server` text NOT NULL,
	`remote_root` text NOT NULL,
	`target_path` text,
	`screen_name` text NOT NULL,
	`command` text NOT NULL,
	`pid` integer,
	`log_path` text,
	`status_path` text,
	`source_selection` text,
	`method` text,
	`error_message` text,
	`last_polled_at` integer,
	`time_created` integer NOT NULL,
	`time_updated` integer NOT NULL,
	FOREIGN KEY (`exp_id`) REFERENCES `experiment`(`exp_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `remote_task_exp_idx` ON `remote_task` (`exp_id`);
--> statement-breakpoint
CREATE INDEX `remote_task_status_idx` ON `remote_task` (`status`);
--> statement-breakpoint
CREATE UNIQUE INDEX `remote_task_exp_kind_resource_idx` ON `remote_task` (`exp_id`,`kind`,`resource_key`);
--> statement-breakpoint
DROP TABLE `local_download_watch`;
