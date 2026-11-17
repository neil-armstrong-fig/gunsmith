import type {CuesRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/types/CuesRequest";
import type {FeedbackCues} from "@src/store/feedback/types/FeedbackCues";

/**
 * What the screen should know about the damage taken after one step: a step in which a bullet hurt the player is one more
 * hit (however many bullets it held: the flash is one flash), and the ring hurts only for as long as steps keep saying it
 * did, and not once the round is no longer being fought. Hits are counted even in the step that ends the round, so the
 * hit that kills still flashes. Returns `previous` itself when nothing changed, so the caller writes only when it must.
 */
export function cuesAfterTick({previous, events, round}: CuesRequest): FeedbackCues {
  const damage = events?.filter(event => event.kind === "damageTaken") ?? [];
  const bulletHits = previous.bulletHits + Number(damage.some(event => event.cause === "bullet"));
  const ringHurting = round === "playing" && damage.some(event => event.cause === "ring");

  if (bulletHits === previous.bulletHits && ringHurting === previous.ringHurting) {
    return previous;
  }

  return {bulletHits, ringHurting};
}
