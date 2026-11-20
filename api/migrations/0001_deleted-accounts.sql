CREATE TABLE `deleted_accounts` (
	`subject_digest` text PRIMARY KEY NOT NULL,
	`credit_account_id` text NOT NULL,
	`keep_until` integer NOT NULL
);
