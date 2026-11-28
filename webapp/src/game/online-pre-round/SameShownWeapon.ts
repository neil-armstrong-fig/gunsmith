import type {ShownWeapon} from "@src/game/online-pre-round/types/ShownWeapon";

/** Whether two weapons shown while choosing are the same: a built-in by key, a saved one by name and by whether its numbers have come. */
export function sameShownWeapon(first: ShownWeapon | undefined, second: ShownWeapon | undefined): boolean {
  if (!first || !second) {
    return first === second;
  }
  if (first.kind === "builtIn" && second.kind === "builtIn") {
    return first.key === second.key;
  }

  return (
    first.kind === "saved" &&
    second.kind === "saved" &&
    first.name === second.name &&
    (first.weapon === undefined) === (second.weapon === undefined)
  );
}
