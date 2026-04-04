CREATE TABLE `code` (
	`code_id` text PRIMARY KEY,
	`research_project_id` text NOT NULL,
	`code_name` text NOT NULL,
	`article_id` text,
	`time_created` integer NOT NULL,
	`time_updated` integer NOT NULL,
	CONSTRAINT `fk_code_research_project_id_research_project_research_project_id_fk` FOREIGN KEY (`research_project_id`) REFERENCES `research_project`(`research_project_id`) ON DELETE CASCADE,
	CONSTRAINT `fk_code_article_id_article_article_id_fk` FOREIGN KEY (`article_id`) REFERENCES `article`(`article_id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `experiment_execution_watch` (
	`watch_id` text PRIMARY KEY,
	`exp_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`stage` text DEFAULT 'planning' NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`wandb_entity` text,
	`wandb_project` text,
	`wandb_run_id` text,
	`error_message` text,
	`started_at` integer,
	`finished_at` integer,
	`time_created` integer NOT NULL,
	`time_updated` integer NOT NULL,
	CONSTRAINT `fk_experiment_execution_watch_exp_id_experiment_exp_id_fk` FOREIGN KEY (`exp_id`) REFERENCES `experiment`(`exp_id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `local_download_watch` (
	`watch_id` text PRIMARY KEY,
	`exp_id` text NOT NULL,
	`resource_key` text NOT NULL,
	`resource_name` text NOT NULL,
	`resource_type` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`local_resource_root` text,
	`local_path` text,
	`pid` integer,
	`log_path` text,
	`status_path` text,
	`source_selection` text,
	`method` text,
	`error_message` text,
	`last_polled_at` integer,
	`time_created` integer NOT NULL,
	`time_updated` integer NOT NULL,
	CONSTRAINT `fk_local_download_watch_exp_id_experiment_exp_id_fk` FOREIGN KEY (`exp_id`) REFERENCES `experiment`(`exp_id`) ON DELETE CASCADE
);
--> statement-breakpoint
ALTER TABLE `research_project` ADD `macro_table_path` text;--> statement-breakpoint
CREATE INDEX `code_research_project_idx` ON `code` (`research_project_id`);--> statement-breakpoint
CREATE INDEX `code_article_idx` ON `code` (`article_id`);--> statement-breakpoint
CREATE INDEX `experiment_execution_watch_exp_idx` ON `experiment_execution_watch` (`exp_id`);--> statement-breakpoint
CREATE INDEX `experiment_execution_watch_status_idx` ON `experiment_execution_watch` (`status`);--> statement-breakpoint
CREATE INDEX `local_download_watch_exp_idx` ON `local_download_watch` (`exp_id`);--> statement-breakpoint
CREATE INDEX `local_download_watch_status_idx` ON `local_download_watch` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `local_download_watch_exp_resource_idx` ON `local_download_watch` (`exp_id`,`resource_key`);--> statement-breakpoint
ALTER TABLE `article` DROP COLUMN `code_path`;