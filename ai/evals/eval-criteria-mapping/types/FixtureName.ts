/** The DSLs a `when` may take, read off the list so the type and the order they are reported in cannot drift apart. */
export const fixtureNames = ["weaponSmith", "appearance"] as const;
export type FixtureName = (typeof fixtureNames)[number];
