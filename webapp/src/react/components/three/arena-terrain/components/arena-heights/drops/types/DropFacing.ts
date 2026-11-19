/** The sides a raised tile can drop away on, which is the list `DROP_FACINGS` and its type. */
export const DROP_FACINGS = ["west", "east", "south", "north"] as const;

export type DropFacing = (typeof DROP_FACINGS)[number];
