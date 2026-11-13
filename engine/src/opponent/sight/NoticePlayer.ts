import type {PlayerSighting} from "@gunsmith/engine/opponent/sight/types/PlayerSighting";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

/**
 * The brain with what this step showed it of the player. Seeing them, it remembers where they stand and how long it has
 * had them in sight without a break. Losing them, it forgets how long (so a player who ducks out and back is not yet
 * shot at with a sharp aim) but not where they were last seen, which is where it searches.
 */
export function noticePlayer(brain: OpponentBrain, sighting: PlayerSighting): OpponentBrain {
  if (!sighting.sees) {
    return {...brain, seenSeconds: 0};
  }

  return {...brain, seenSeconds: brain.seenSeconds + sighting.seconds, lastSeen: sighting.target};
}
