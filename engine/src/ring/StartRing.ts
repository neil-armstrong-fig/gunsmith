import type {Ring} from "@gunsmith/engine/ring/types/Ring";

/** The ring of a round that has just begun: none of the round has been played. */
export function startRing(): Ring {
  return {roundSeconds: 0};
}
