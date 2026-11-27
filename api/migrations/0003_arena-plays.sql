CREATE TABLE `arena_plays` (
	`day` integer NOT NULL,
	`arena` text NOT NULL,
	`plays` integer NOT NULL,
	PRIMARY KEY(`day`, `arena`)
);
