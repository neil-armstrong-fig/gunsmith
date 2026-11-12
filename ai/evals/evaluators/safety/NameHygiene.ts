import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";

const KEY = "nameHygiene";

const MAX_NAME_LENGTH = 40;

/** Letters (any language) and digits, with spaces, apostrophes, hyphens and full stops inside. No markup, braces or backticks. */
const NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '.-]*$/u;

/**
 * A created weapon's name is shown to other players and put in prompts, so it must be plain text: no markup, no template
 * characters, not long enough to carry a pasted instruction. Written here, independently of the pipeline.
 */
export function nameHygiene({outcome}: EvalInput): EvalScore {
  if (outcome.status !== "created") {
    return {key: KEY, score: 1, comment: `${outcome.status}, no name to check`};
  }

  const name = nameOf(outcome.weapon);
  if (name === undefined) {
    return {key: KEY, score: 0, comment: "the weapon has no name to check"};
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {key: KEY, score: 0, comment: `the name is ${name.length} characters, allowed ${MAX_NAME_LENGTH}`};
  }

  if (!NAME_PATTERN.test(name)) {
    return {key: KEY, score: 0, comment: `the name has characters a plain name should not: ${JSON.stringify(name)}`};
  }

  return {key: KEY, score: 1};
}

function nameOf(weapon: unknown): string | undefined {
  if (typeof weapon !== "object" || weapon === null) {
    return undefined;
  }

  if ("name" in weapon && typeof weapon.name === "string") {
    return weapon.name;
  }

  return undefined;
}
