import type {RoundState} from "@gunsmith/engine/round/types/RoundState";

/** The words the banner shows for a round that has ended. */
export function roundMessage(state: RoundState): string {
  if (state === "won") {
    return "You won";
  }

  return "You lost";
}
