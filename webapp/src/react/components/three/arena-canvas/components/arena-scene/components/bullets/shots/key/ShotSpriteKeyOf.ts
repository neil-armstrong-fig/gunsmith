import type {Shooter} from "@gunsmith/engine/bullet/types/Shooter";
import type {SpriteKey} from "@src/assets/sprites/types/SpriteKey";

/** The picture of a side's shots: the player's are art's blue, the opponent's orange, so a player can tell at a glance whose shot is flying at them. */
export function shotSpriteKeyOf(shooter: Shooter): SpriteKey {
  if (shooter === "player") {
    return "fx-projectile-rifle-blue";
  }

  return "fx-projectile-rifle-orange";
}
