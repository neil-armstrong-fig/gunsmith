import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/**
 * Picks the built-in arena to give a player whose request could not be built. The same words always get the same arena (a
 * match must be reproducible, and nothing here may call a random generator), and different words spread over the pool by the sum of
 * their characters. Throws when the pool is empty, which is a mistake in whoever built the pipeline, never a model's fault.
 */
export function builtInArenaFor(prompt: string, builtInArenas: readonly ArenaDrawing[]): ArenaDrawing {
  let sum = 0;
  for (const character of prompt) {
    sum += character.codePointAt(0) ?? 0;
  }

  const chosen = builtInArenas[sum % builtInArenas.length];
  if (chosen === undefined) {
    throw new Error("The arena pipeline has no built-in arena to fall back to.");
  }

  return chosen;
}
