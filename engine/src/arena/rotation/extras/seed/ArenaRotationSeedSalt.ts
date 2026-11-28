/**
 * Mixed into the day before the extra arenas are drawn, so the draw has a stream of its own and never shares one with the arena
 * pick, the pickup, the ring or the starting places. Engine's other streams use their own salts the same way; this one differs
 * from each.
 */
export const ARENA_ROTATION_SEED_SALT = 0x3c6ef372;
