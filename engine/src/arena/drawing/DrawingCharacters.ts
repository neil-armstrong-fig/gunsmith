import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

/** The character a wall is drawn with. */
export const WALL = "#";

/** The character floor on the low ground is drawn with. */
export const FLOOR = ".";

/** The level of each character that draws raised floor. */
export const RAISED_LEVELS: Readonly<Record<string, number>> = {"1": 1, "2": 2};

/** The way the stair climbs for each arrow that draws one. */
export const STAIRS: Readonly<Record<string, Uphill>> = {"^": "north", v: "south", "<": "west", ">": "east"};
