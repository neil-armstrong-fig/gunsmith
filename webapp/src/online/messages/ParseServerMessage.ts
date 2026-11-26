import type {ServerMessage} from "@src/online/types/ServerMessage";
import {PRE_ROUND_STAGES} from "@src/online/types/pre-round/PreRoundStages";

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
  if (kind === "arena" && isArena(parsed)) {
    return parsed as ServerMessage;
  }
  if (kind === "preRound" && isPreRound(parsed)) {
    return parsed as ServerMessage;
  }
  if (kind === "reveal" && isReveal(parsed)) {
    return parsed as ServerMessage;
  }
  if (kind === "opponentWeapon" && isOpponentWeapon(parsed)) {
    return parsed as ServerMessage;
  }

  return undefined;
}

function isArena(frame: object): boolean {
  const rows = Reflect.get(frame, "rows");

  return Array.isArray(rows) && rows.every(row => typeof row === "string");
}

/** The choosing: a known stage, an optional clock, and what each seat may be told, as flags and names. Refused, not guessed at, if it is not. */
function isPreRound(frame: object): boolean {
  const stage: unknown = Reflect.get(frame, "stage");
  const secondsLeft: unknown = Reflect.get(frame, "secondsLeft");
  const own: unknown = Reflect.get(frame, "own");
  const opponent: unknown = Reflect.get(frame, "opponent");

  return (
    PRE_ROUND_STAGES.some(known => known === stage) &&
    (secondsLeft === undefined || typeof secondsLeft === "number") &&
    hasFlags(own, ["locked"]) &&
    hasFlags(opponent, ["locked", "picked"]) &&
    hasOptionalFlag(own, "ready") &&
    hasOptionalFlag(opponent, "ready") &&
    hasWeaponsStep(own) &&
    hasWeaponsStep(opponent) &&
    hasArenaView(own) &&
    hasArenaView(opponent)
  );
}

/** The arena and the weapons both players carry: two on each side, each a built-in's key or a saved weapon with its numbers and drawing. */
function isReveal(frame: object): boolean {
  const weapons: unknown = Reflect.get(frame, "weapons");
  if (typeof weapons !== "object" || weapons === null) {
    return false;
  }

  return (
    isRevealedArena(Reflect.get(frame, "arena")) &&
    isRevealedPair(Reflect.get(weapons, "own")) &&
    isRevealedPair(Reflect.get(weapons, "opponent"))
  );
}

/** The other player's saved weapon in slot 1 or 2, with its numbers and drawing. */
function isOpponentWeapon(frame: object): boolean {
  const slot: unknown = Reflect.get(frame, "slot");

  return (
    (slot === 1 || slot === 2) && isRecord(Reflect.get(frame, "weapon")) && isRecord(Reflect.get(frame, "appearance"))
  );
}

function isRevealedArena(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const rows: unknown = Reflect.get(value, "rows");

  return (
    typeof Reflect.get(value, "name") === "string" && Array.isArray(rows) && rows.every(row => typeof row === "string")
  );
}

function isRevealedPair(value: unknown): boolean {
  return Array.isArray(value) && value.length === 2 && value.every(isRevealedWeapon);
}

function isRevealedWeapon(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const kind = Reflect.get(value, "kind");
  if (kind === "builtIn") {
    return typeof Reflect.get(value, "key") === "string";
  }

  return kind === "saved" && isRecord(Reflect.get(value, "weapon")) && isRecord(Reflect.get(value, "appearance"));
}

function isRecord(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Whether `value`, if it has an arena, has one the server could have sent: a built-in's name or a saved arena's name, with drawing rows if it has them. */
function hasArenaView(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const arena: unknown = Reflect.get(value, "arena");
  if (arena === undefined) {
    return true;
  }
  if (typeof arena !== "object" || arena === null || typeof Reflect.get(arena, "name") !== "string") {
    return false;
  }

  const kind = Reflect.get(arena, "kind");
  if (kind === "builtIn") {
    return true;
  }

  const rows: unknown = Reflect.get(arena, "rows");

  return (
    kind === "saved" && (rows === undefined || (Array.isArray(rows) && rows.every(row => typeof row === "string")))
  );
}

/** Whether `value` carries a weapons step: exactly two slots, each with `locked` as a flag and, if it has one, a `choice` that is a built-in's key or a saved weapon's name. */
function hasWeaponsStep(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const weapons: unknown = Reflect.get(value, "weapons");
  if (typeof weapons !== "object" || weapons === null) {
    return false;
  }

  const slots: unknown = Reflect.get(weapons, "slots");

  return Array.isArray(slots) && slots.length === 2 && slots.every(isWeaponSlot);
}

function isWeaponSlot(value: unknown): boolean {
  if (!hasFlags(value, ["locked"])) {
    return false;
  }

  const choice: unknown = typeof value === "object" && value !== null ? Reflect.get(value, "choice") : undefined;

  return choice === undefined || isWeaponView(choice);
}

function isWeaponView(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const kind = Reflect.get(value, "kind");
  if (kind === "builtIn") {
    return typeof Reflect.get(value, "key") === "string";
  }

  return kind === "saved" && typeof Reflect.get(value, "name") === "string";
}

/** Whether `value` is an object whose field `name`, if it has one, is true or false. */
function hasOptionalFlag(value: unknown, name: string): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const flag: unknown = Reflect.get(value, name);

  return flag === undefined || typeof flag === "boolean";
}

/** Whether `value` is an object whose named fields are all true or false. */
function hasFlags(value: unknown, names: readonly string[]): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return names.every(name => typeof Reflect.get(value, name) === "boolean");
}

function isJoined(frame: object): boolean {
  const seat = Reflect.get(frame, "seat");
  const arena = Reflect.get(frame, "arena");
  const token: unknown = Reflect.get(frame, "token");

  return (
    (seat === "first" || seat === "second") &&
    Array.isArray(arena) &&
    arena.every(row => typeof row === "string") &&
    (token === undefined || typeof token === "string")
  );
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
