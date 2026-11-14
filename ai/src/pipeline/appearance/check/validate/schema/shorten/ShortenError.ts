const MAX_ERROR_LENGTH = 120;

/** Cuts an error to a length a repair prompt can carry, because a stray field's name in it came from the model, or through it from the player. */
export function shortenError(error: string): string {
  return error.slice(0, MAX_ERROR_LENGTH);
}
