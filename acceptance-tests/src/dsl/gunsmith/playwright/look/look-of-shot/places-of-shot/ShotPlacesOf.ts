import type {Point} from "@src/dsl/gunsmith/types/Point";
import type {ShotPlaces} from "@src/dsl/gunsmith/types/ShotPlaces";

/**
 * Art draws the rifle's shot as a bar 26 pixels long and 6 thick on 45 pixels to the tile, its tip at the bullet's point (`docs/art/asset-reference/effects/projectile-rifle/`),
 * so about 0.58 of a tile long and 0.13 thick. The places are chosen well inside the bar, and well outside it, so that blurred edges cannot decide a check.
 * Distances behind the tip run along the flight, and distances to the left across it.
 */
const ALONG_BEHIND_TILES = [0.06, 0.15, 0.25, 0.35, 0.45, 0.52];
const ACROSS_SPOTS: Point[] = [
  {x: 0.3, y: 0.15},
  {x: 0.3, y: -0.15},
  {x: 0.3, y: 0.25},
  {x: 0.3, y: -0.25},
  {x: 0.15, y: 0.2},
  {x: 0.15, y: -0.2},
];
const AHEAD_TILES = [-0.08, -0.15];
const BEYOND_TAIL_TILES = [0.66, 0.78];
const AT_THE_BULLET_SPOTS: Point[] = [
  {x: 0, y: 0},
  {x: 0.04, y: 0},
  {x: -0.04, y: 0},
  {x: 0, y: 0.04},
  {x: 0, y: -0.04},
];

/** The places to read over a shot whose bullet is at `bullet`, flying `directionDegrees` (0 is east, 90 is north). */
export function shotPlacesOf(bullet: Point, directionDegrees: number): ShotPlaces {
  const angle = (directionDegrees * Math.PI) / 180;
  const forward = {x: Math.cos(angle), y: Math.sin(angle)};
  const left = {x: -Math.sin(angle), y: Math.cos(angle)};
  const place = (behind: number, toTheLeft: number): Point => ({
    x: bullet.x - forward.x * behind + left.x * toTheLeft,
    y: bullet.y - forward.y * behind + left.y * toTheLeft,
  });

  return {
    along: ALONG_BEHIND_TILES.map(behind => place(behind, 0)),
    across: ACROSS_SPOTS.map(spot => place(spot.x, spot.y)),
    ahead: AHEAD_TILES.map(behind => place(behind, 0)),
    beyondTail: BEYOND_TAIL_TILES.map(behind => place(behind, 0)),
    atTheBullet: AT_THE_BULLET_SPOTS.map(spot => place(spot.x, spot.y)),
  };
}
