/** The bass notes of an eight-bar round, as MIDI notes: D, D, Bb, C, D, F, Bb, C. Every arrangement walks it. */
const ROOTS = [38, 38, 34, 36, 38, 41, 34, 36] as const;

/** The note the bass is built on in a bar, counting bars from 0 across the track; the round starts again every eight. */
export function bassRootOf(bar: number): number {
  const root = ROOTS[bar % ROOTS.length];
  if (root === undefined) {
    throw new Error(`No bass root for bar ${bar}`);
  }

  return root;
}
