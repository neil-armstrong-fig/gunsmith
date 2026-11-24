/**
 * What the fake tier's generator always answers: a valid weapon within the damage cap (24 damage every 0.2 seconds is 120 a
 * second). It is the mapping's own copy, not the DSL's test fixture, so setup never depends on a test helper. The driver's test
 * runs it through the real pipeline, so a change to the schema that this weapon no longer meets fails there.
 */
export const FAKE_WEAPON_REPLY = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};
