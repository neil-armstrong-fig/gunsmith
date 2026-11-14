/** What makes one weapon different from another. Every number is a tunable, to be set by play. */
export interface Weapon {
  /** The time between one shot and the next, in seconds. */
  fireIntervalSeconds: number;
  /** What one bullet takes off whatever it hits. */
  bulletDamage: number;
  /** How fast a bullet flies, in tiles per second. */
  bulletSpeed: number;
  /** How many rounds the magazine holds, which is how many shots before a reload. */
  magazineSize: number;
  /** How long a reload takes, in seconds. */
  reloadSeconds: number;
  /** The rounds in the reserve at the start of a match: what reloads draw on. */
  startingReserve: number;
  /** How wide the detailed forward cone is, in degrees: what the holder sees round the aim. */
  visionDegrees: number;
  /** How far the cone reaches, in tiles. */
  visionRange: number;
}
