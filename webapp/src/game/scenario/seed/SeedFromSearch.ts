/**
 * The seed a page's query asks for (`?seed=42`), so a match can be replayed: the opponent's every choice is drawn from
 * it. Anything that is not a whole number small enough to be exact is no seed, and the page picks its own.
 */
export function seedFromSearch(search: string): number | undefined {
  const asked = new URLSearchParams(search).get("seed");
  if (asked === null || !/^-?\d+$/.test(asked)) {
    return undefined;
  }

  const seed = Number(asked);
  if (!Number.isSafeInteger(seed)) {
    return undefined;
  }

  return seed;
}
