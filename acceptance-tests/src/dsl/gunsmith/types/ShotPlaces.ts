import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The places to read over a drawn shot, in tiles on the arena, grouped by what each should show. */
export interface ShotPlaces {
  /** Inside the bar, along its length. */
  along: Point[];

  /** Beside the bar. */
  across: Point[];

  /** Just ahead of the bullet's point. */
  ahead: Point[];

  /** Past the bar's tail. */
  beyondTail: Point[];

  /** Right at the bullet's point, where the stand-in disc is. */
  atTheBullet: Point[];
}
