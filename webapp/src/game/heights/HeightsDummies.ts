import type {Point} from "@gunsmith/engine/geometry/types/Point";

/**
 * Where the dummies stand in `HEIGHTS_ARENA`, so there is something to see from each level. The player starts at 8.5, 3.5
 * facing east: one dummy is four tiles east on the platform, two and a half back from its edge, one four tiles west on the low
 * ground, both on the player's row, and one at the platform's edge, half a tile from it, off that row (where the climb and the
 * shots along the row do not reach it); all well inside the rifle's reach, so what hides one from the player is the height, not
 * the distance or a wall.
 */
export const HEIGHTS_DUMMIES: readonly Point[] = [
  {x: 12.5, y: 3.5},
  {x: 4.5, y: 3.5},
  {x: 10.5, y: 1.5},
];
