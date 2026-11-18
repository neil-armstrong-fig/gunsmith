import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {ShotRequest} from "@gunsmith/engine/opponent/types/ShotRequest";

/**
 * The brain, told what a step's bullets did to it: if one of the player's hurt it, it remembers where the player stood when it
 * did, which is how it learns of a shooter it cannot see (`noticeShot` and `chooseState` act on it next step). Ring damage never
 * comes here, so the ring cannot give the player away. A fight with no opponent brain (a person plays the opponent) has nothing
 * to tell and gets nothing back.
 */
export function rememberShot(brain: OpponentBrain | undefined, shot: ShotRequest): OpponentBrain | undefined {
  if (!brain || shot.bulletDamage <= 0) {
    return brain;
  }

  return {...brain, shotFrom: shot.from};
}
