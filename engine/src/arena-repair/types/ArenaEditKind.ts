/** Everything the repair does to a drawing, one kind each, so a caller can say what changed. */
export const ARENA_EDIT_KINDS = [
  "stairDropped",
  "stairAdded",
  "platformLowered",
  "pocketWalled",
  "doorOpened",
] as const;

export type ArenaEditKind = (typeof ARENA_EDIT_KINDS)[number];
