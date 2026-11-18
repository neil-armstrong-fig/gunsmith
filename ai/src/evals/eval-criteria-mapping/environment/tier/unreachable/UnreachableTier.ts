/**
 * The end of a chain of `if (tier === …)` that names every tier: the compiler rejects a tier left out, so a new tier can never fall
 * through to whichever branch came last (which for the paid tier would spend the Haiku ledger).
 */
export function unreachableTier(tier: never): never {
  throw new Error(`Unhandled eval tier: ${String(tier)}`);
}
