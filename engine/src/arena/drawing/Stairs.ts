import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

/** The way the stair climbs for each arrow that draws one. */
export const STAIRS: Readonly<Record<string, Uphill>> = {"^": "north", v: "south", "<": "west", ">": "east"};
