import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Player} from "@gunsmith/engine/player/types/Player";

/** A fighter after their turn's trigger was let go: the bullet that left, if one did, and the fighter a round the lighter. */
export interface FighterShot {
  fighter: Player;
  bullet?: Bullet | undefined;
}
