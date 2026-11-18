import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {InputMessage} from "@src/match/messages/types/InputMessage";

/**
 * The input a player's text frame asks for, with the sequence number it carries, or `undefined` when the frame is not one: not JSON, not
 * an `input` message, or with a field of the wrong kind. Everything a client sends is `unknown` until here; the engine then caps what the
 * input may ask for (a walk longer than one tile a second is treated as one), so this checks the shape, never the speed.
 */
export function parseInputMessage(text: string): InputMessage | undefined {
  const message = parsedObject(text);
  if (!message || message["kind"] !== "input") {
    return undefined;
  }

  const seq = message["seq"];
  const direction = pointOf(message["direction"]);
  if (typeof seq !== "number" || !Number.isSafeInteger(seq) || seq < 0) {
    return undefined;
  }
  if (!direction || typeof message["firing"] !== "boolean" || typeof message["reload"] !== "boolean") {
    return undefined;
  }

  const aimAt = pointOf(message["aimAt"]);
  const crouching = message["crouching"];
  const switchTo = message["switchTo"];
  if (message["aimAt"] !== undefined && !aimAt) {
    return undefined;
  }
  if (crouching !== undefined && typeof crouching !== "boolean") {
    return undefined;
  }
  if (switchTo !== undefined && !Number.isInteger(switchTo)) {
    return undefined;
  }

  return {
    seq,
    input: {
      direction,
      aimAt,
      firing: message["firing"],
      crouching,
      reload: message["reload"],
      switchTo: typeof switchTo === "number" ? switchTo : undefined,
    },
  };
}

function parsedObject(text: string): Record<string, unknown> | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return undefined;
  }

  return parsed as Record<string, unknown>;
}

function pointOf(value: unknown): Point | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const x = Reflect.get(value, "x");
  const y = Reflect.get(value, "y");
  if (typeof x !== "number" || typeof y !== "number" || !Number.isFinite(x) || !Number.isFinite(y)) {
    return undefined;
  }

  return {x, y};
}
