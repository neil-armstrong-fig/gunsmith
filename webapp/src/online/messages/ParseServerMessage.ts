import type {ServerMessage} from "@src/online/types/ServerMessage";

/**
 * The frame the server sent, or `undefined` for text that is not one. What arrives is `unknown` until here: it checks the shape
 * of the two frames the page acts on (the seat and arena of `joined`; the fighter and round of a snapshot), not every field of
 * the engine's data, since the server is this site's own Worker.
 */
export function parseServerMessage(text: string): ServerMessage | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  const kind = Reflect.get(parsed, "kind");
  if (kind === "joined" && isJoined(parsed)) {
    return parsed as ServerMessage;
  }
  if (kind === "snapshot" && isSnapshot(parsed)) {
    return parsed as ServerMessage;
  }

  return undefined;
}

function isJoined(frame: object): boolean {
  const seat = Reflect.get(frame, "seat");
  const arena = Reflect.get(frame, "arena");

  return (seat === "first" || seat === "second") && Array.isArray(arena) && arena.every(row => typeof row === "string");
}

function isSnapshot(frame: object): boolean {
  const player: unknown = Reflect.get(frame, "player");
  const round = Reflect.get(frame, "round");
  const ack: unknown = Reflect.get(frame, "ack");
  const ready: unknown = Reflect.get(frame, "ready");

  return (
    typeof player === "object" &&
    player !== null &&
    typeof round === "string" &&
    (ack === undefined || isAck(ack)) &&
    (ready === undefined || isReadiness(ready))
  );
}

/** Who has asked to go on: two flags. A frame whose flags are not two is refused, not guessed at. */
function isReadiness(ready: unknown): boolean {
  if (typeof ready !== "object" || ready === null) {
    return false;
  }

  return typeof Reflect.get(ready, "player") === "boolean" && typeof Reflect.get(ready, "opponent") === "boolean";
}

/** How far the server has played this browser's inputs: two counts. A frame whose count is not one is refused, not guessed at. */
function isAck(ack: unknown): boolean {
  if (typeof ack !== "object" || ack === null) {
    return false;
  }

  return Number.isSafeInteger(Reflect.get(ack, "seq")) && Number.isSafeInteger(Reflect.get(ack, "held"));
}
