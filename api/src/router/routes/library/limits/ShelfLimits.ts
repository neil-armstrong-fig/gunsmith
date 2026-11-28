import type {ShelfLimits} from "@src/shared/accounts/types/ShelfLimits";

/**
 * How many weapons and arenas one account may keep on its shelf (the user's numbers, 2026-11-19). A tunable set by play and the
 * server, one place: the page reads it from `GET /api/library` and shows no number of its own. Every account has the same for now.
 */
export const SHELF_LIMITS: ShelfLimits = {weapons: 8, arenas: 3};
