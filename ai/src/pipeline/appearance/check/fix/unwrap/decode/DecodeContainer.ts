import {isRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/IsRecord";
import type {ContainerKind} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/types/ContainerKind";

/** The most text it will try to parse: a little over the 12 KiB an appearance may be, so a larger string is not read at all. */
const MAX_ENCODED_LENGTH = 16 * 1024;

/**
 * Reads a value the model wrote as text where a list or record belongs (a quirk of function calling: some models JSON-encode a
 * nested argument). Returns what the text holds only when it parses whole and is the container asked for, and nothing
 * otherwise, which includes any value that is not text and any text over the size limit. Never evaluates anything.
 */
export function decodeContainer(value: unknown, container: ContainerKind): unknown {
  if (typeof value !== "string" || value.length > MAX_ENCODED_LENGTH) {
    return undefined;
  }

  const decoded = parse(value);
  if (container === "array" && Array.isArray(decoded)) {
    return decoded;
  }

  if (container === "object" && isRecord(decoded)) {
    return decoded;
  }

  return undefined;
}

function parse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}
