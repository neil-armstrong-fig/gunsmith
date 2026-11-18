import type {Heading} from "@src/dsl/gunsmith/components/player/types/Heading";
import type {HurtWatch} from "@src/dsl/gunsmith/types/HurtWatch";

/** What `walkUntilPast` is asked: which way to walk in a held game, how far, and how finely to look. */
export interface HeldWalk {
  heading: Heading;
  /** The tile coordinate along the heading's axis to walk past: `x` for east and west, `y` for north and south. */
  limit: number;
  /** The most game time to walk before giving up, and how much to run between looks. */
  watch: HurtWatch;
}
