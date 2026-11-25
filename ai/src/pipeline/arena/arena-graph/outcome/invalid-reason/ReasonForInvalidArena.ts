import type {ArenaProblemKind} from "@gunsmith/engine/arena-validation/types/ArenaProblemKind";
import type {ArenaValidationFailure} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidationFailure";

const OPENING = "We could not build a playable arena from that request:";

const UNREADABLE = "what we drew could not be read as an arena. Try describing it more simply, with fewer parts.";

/** What a player is told for each kind of fault in an arena that was read but cannot be played. Ours, never the validator's or the model's words. */
const SENTENCE_OF_KIND: Record<ArenaProblemKind, string> = {
  noFloor: "it had no floor to stand on. Ask for an arena with open ground.",
  disconnected:
    "part of the floor could not be reached from the rest. Ask for a doorway through every wall and stairs up to every raised area.",
  noStartingPlaces: "there was no room for both fighters to start. Ask for a larger open space.",
  tooWalled: "it was too full of walls to fight in. Ask for more open floor.",
};

/** The most basic fault first: no floor at all hides everything else, and a cut-off floor is the one a player can mend most easily. */
const KINDS_BY_PRIORITY: readonly ArenaProblemKind[] = ["noFloor", "disconnected", "noStartingPlaces", "tooWalled"];

/**
 * The sentence a player reads when the arena they asked for could not be made even after the one repair (the user, 2026-11-21: no
 * built-in arena is given in its place). It is chosen by code from why the last check refused the draft: the engine's kinds of fault for
 * an arena that was read but cannot be played (the most basic one, named alone), and one sentence for a drawing that could not be read.
 * No word of the model's or the validator's reaches the player, so nothing a player or a model wrote can come back through it.
 */
export function reasonForInvalidArena(
  failure: ArenaValidationFailure | undefined,
  problemKinds: readonly ArenaProblemKind[],
): string {
  if (failure === "unplayable-arena") {
    return `${OPENING} ${sentenceOfKinds(problemKinds)}`;
  }

  return `${OPENING} ${UNREADABLE}`;
}

function sentenceOfKinds(problemKinds: readonly ArenaProblemKind[]): string {
  const first = KINDS_BY_PRIORITY.find(kind => problemKinds.includes(kind));
  if (first === undefined) {
    return UNREADABLE;
  }

  return SENTENCE_OF_KIND[first];
}
