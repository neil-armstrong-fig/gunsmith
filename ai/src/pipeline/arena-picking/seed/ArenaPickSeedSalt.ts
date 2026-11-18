/**
 * Mixed into the seed before an arena pick is drawn, so the pick has a stream of its own and never shares a draw with the pickup, the
 * ring's centre, the fighters' starting places or the opponent's brain, however the caller got its seed. Engine's other streams use
 * their own salts the same way; this one differs from each.
 */
export const ARENA_PICK_SEED_SALT = 0x6a09e667;
