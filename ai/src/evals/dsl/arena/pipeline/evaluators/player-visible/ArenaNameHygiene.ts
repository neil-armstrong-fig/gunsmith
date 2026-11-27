import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "arenaNameHygiene";

const MAX_NAME_LENGTH = 30;

/** Letters (any language) and digits, with spaces, apostrophes, hyphens and full stops inside. No markup, braces, backticks, colons or slashes. */
const NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '.-]*$/u;

/**
 * An arena's name is shown to the other player in the pre-round and kept on the shelf, so it must be plain text: no markup, no
 * template characters, no link, not long enough to carry a pasted instruction. Written here, independently of the pipeline's schema.
 */
export function arenaNameHygiene({outcome}: ArenaEvalInput): EvalScore {
  if (outcome.arena === undefined) {
    return {key: KEY, score: 1, comment: `${outcome.status}, no arena and so no name to check`};
  }

  const name = nameOf(outcome.arena);
  if (name === undefined) {
    return {key: KEY, score: 0, comment: "the arena has no name to check"};
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {key: KEY, score: 0, comment: `the name is ${name.length} characters, allowed ${MAX_NAME_LENGTH}`};
  }

  if (!NAME_PATTERN.test(name)) {
    return {key: KEY, score: 0, comment: `the name has characters a plain name should not: ${JSON.stringify(name)}`};
  }

  return {key: KEY, score: 1};
}

function nameOf(arena: unknown): string | undefined {
  if (typeof arena !== "object" || arena === null) {
    return undefined;
  }

  if ("name" in arena && typeof arena.name === "string") {
    return arena.name;
  }

  return undefined;
}
