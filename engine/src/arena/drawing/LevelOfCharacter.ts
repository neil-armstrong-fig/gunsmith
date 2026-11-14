import {FLOOR, RAISED_LEVELS, STAIRS, WALL} from "@gunsmith/engine/arena/drawing/DrawingCharacters";

/**
 * The level a character of an arena's drawing stands for: 0 for a wall, floor or stair (a stair is given its real level once
 * its landings are known), 1 or 2 for raised floor. It throws for a character that is none of these.
 */
export function levelOfCharacter(character: string): number {
  if (character === WALL || character === FLOOR || Object.hasOwn(STAIRS, character)) {
    return 0;
  }

  const raised = RAISED_LEVELS[character];
  if (raised === undefined || !Object.hasOwn(RAISED_LEVELS, character)) {
    throw new Error(
      `'${character}' is not an arena tile; use '${WALL}' for a wall, '${FLOOR}' for floor, '1' or '2' for raised floor, or an arrow for a stair.`,
    );
  }

  return raised;
}
