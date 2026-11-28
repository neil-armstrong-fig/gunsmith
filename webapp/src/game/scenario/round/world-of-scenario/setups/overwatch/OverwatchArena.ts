import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";

/**
 * The overwatch's arena: a corridor one tile wide, forty-six tiles long. Low ground fills the west thirty-six tiles, and a stair
 * at the east end of it (column 37) leads up to a platform one level up, nine tiles long. With one row, every shot along it hits
 * whoever stands in it, wherever they wander to, so a spec can aim at any tile of the row. The proportions are placeholders.
 */
export const OVERWATCH_ARENA = arenaFrom(["#".repeat(48), `#${".".repeat(36)}>${"1".repeat(9)}#`, "#".repeat(48)]);
