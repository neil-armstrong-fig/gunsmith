/** Where the opponent stands, in tiles, and how much health it has left. It stays listed at zero, once it has fallen. */
export interface OpponentSnapshot {
  x: number;
  y: number;
  health: number;
}
