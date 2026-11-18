import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {CuesRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/cues/types/CuesRequest";
import type {FeedbackCues} from "@src/store/feedback/types/FeedbackCues";
import type {HitMark} from "@src/store/feedback/types/HitMark";

/** How many marks the store keeps: the screen takes each at its next frame, so it only needs the few a frame's worth of steps can add. */
const MOST_HIT_MARKS = 8;

/**
 * What the screen should know about the fight after one step. A step in which a bullet hurt the player is one more hit (however many bullets it held: the flash
 * is one flash), and the ring hurts only for as long as steps keep saying it did, and not once the round is no longer being fought. Hits are counted even in the
 * step that ends the round, so the hit that kills still flashes. Each place the player's bullets hit a target they saw becomes a mark, numbered on from the last
 * (the latest few are kept), and the hit that ends the round is marked too. Returns `previous` itself when nothing changed, so the caller writes only when it must.
 */
export function cuesAfterTick({previous, events, round, hitPlaces}: CuesRequest): FeedbackCues {
  const damage = events?.filter(event => event.kind === "damageTaken") ?? [];
  const bulletHits = previous.bulletHits + Number(damage.some(event => event.cause === "bullet"));
  const ringHurting = round === "playing" && damage.some(event => event.cause === "ring");

  if (bulletHits === previous.bulletHits && ringHurting === previous.ringHurting && hitPlaces.length === 0) {
    return previous;
  }

  return {bulletHits, ringHurting, hitMarks: marksAfter(previous.hitMarks, hitPlaces)};
}

function marksAfter(previous: readonly HitMark[], hitPlaces: readonly Point[]): readonly HitMark[] {
  if (hitPlaces.length === 0) {
    return previous;
  }

  const last = previous.at(-1)?.sequence ?? 0;
  const added = hitPlaces.map(({x, y}, index) => ({sequence: last + index + 1, x, y}));

  return [...previous, ...added].slice(-MOST_HIT_MARKS);
}
