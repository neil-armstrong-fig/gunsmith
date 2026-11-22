import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";

/**
 * Whether two seats put forward the same arena: the same built-in by name, or the same saved arena by id. A saved arena is never the
 * same as a built-in one, nor as another saved one, whatever they are called.
 */
export function isSameArena(first: ChosenArena | undefined, second: ChosenArena | undefined): boolean {
  if (first?.kind === "builtIn" && second?.kind === "builtIn") {
    return first.name === second.name;
  }
  if (first?.kind === "saved" && second?.kind === "saved") {
    return first.id === second.id;
  }

  return false;
}
