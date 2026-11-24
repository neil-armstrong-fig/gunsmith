import type {PreRoundAction} from "@src/durable-objects/match/messages/types/PreRoundAction";
import type {WeaponChoice} from "@src/durable-objects/match/messages/types/WeaponChoice";
import type {WeaponSlot} from "@src/durable-objects/match/pre-round/types/WeaponSlot";
import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";

/** No id of a saved item is longer than this (a UUID is 36): a longer one is not an id. */
const LONGEST_ID = 64;

/**
 * What a player's text frame asks of the pre-round, or `undefined` if it asks nothing the room understands: a `choose` or `lockIn` of the
 * arena step, a `choose` or `lockIn` of one weapon slot, or a `pickArena`. Everything a client sends is `unknown` until here, and a choice
 * is only ever a built-in's name or key or a saved item's id, never a body: whether the id is the account's own is for the room to check.
 */
export function parsePreRoundMessage(text: string): PreRoundAction | undefined {
  const parsed = recordOf(text);
  if (!parsed) {
    return undefined;
  }

  const kind = Reflect.get(parsed, "kind");
  if (kind === "choose" && Reflect.get(parsed, "step") === "arena") {
    return chooseOf(Reflect.get(parsed, "choice"));
  }
  if (kind === "lockIn" && Reflect.get(parsed, "step") === "arena") {
    return {kind: "lockInArena"};
  }
  if (kind === "choose" && Reflect.get(parsed, "step") === "weapon") {
    return chooseWeaponOf(Reflect.get(parsed, "slot"), Reflect.get(parsed, "choice"));
  }
  if (kind === "lockIn" && Reflect.get(parsed, "step") === "weapon") {
    return lockInWeaponOf(Reflect.get(parsed, "slot"));
  }
  if (kind === "pickArena") {
    return pickOf(Reflect.get(parsed, "pick"));
  }

  return undefined;
}

function chooseOf(choice: unknown): PreRoundAction | undefined {
  if (!isRecord(choice)) {
    return undefined;
  }

  const kind = Reflect.get(choice, "kind");
  if (kind === "builtIn") {
    const name = Reflect.get(choice, "name");
    if (typeof name !== "string") {
      return undefined;
    }

    return {kind: "chooseArena", choice: {kind: "builtIn", name}};
  }

  const id = savedIdOf(choice);
  if (id === undefined) {
    return undefined;
  }

  return {kind: "chooseArena", choice: {kind: "saved", id}};
}

function chooseWeaponOf(slot: unknown, choice: unknown): PreRoundAction | undefined {
  const weaponSlot = weaponSlotOf(slot);
  const weaponChoice = weaponChoiceOf(choice);
  if (weaponSlot === undefined || weaponChoice === undefined) {
    return undefined;
  }

  return {kind: "chooseWeapon", slot: weaponSlot, choice: weaponChoice};
}

function lockInWeaponOf(slot: unknown): PreRoundAction | undefined {
  const weaponSlot = weaponSlotOf(slot);
  if (weaponSlot === undefined) {
    return undefined;
  }

  return {kind: "lockInWeapon", slot: weaponSlot};
}

function weaponSlotOf(slot: unknown): WeaponSlot | undefined {
  if (slot === 1 || slot === 2) {
    return slot;
  }

  return undefined;
}

function weaponChoiceOf(choice: unknown): WeaponChoice | undefined {
  if (!isRecord(choice)) {
    return undefined;
  }

  if (Reflect.get(choice, "kind") === "builtIn") {
    const key = Reflect.get(choice, "key");
    if (typeof key !== "string") {
      return undefined;
    }

    return {kind: "builtIn", key};
  }

  const id = savedIdOf(choice);
  if (id === undefined) {
    return undefined;
  }

  return {kind: "saved", id};
}

/** The `id` of a `{kind: "saved", id}` choice: a non-empty string no longer than an id is (a UUID is 36), else `undefined`. */
function savedIdOf(choice: object): string | undefined {
  if (Reflect.get(choice, "kind") !== "saved") {
    return undefined;
  }

  const id = Reflect.get(choice, "id");
  if (typeof id !== "string" || id.length === 0 || id.length > LONGEST_ID) {
    return undefined;
  }

  return id;
}

function pickOf(pick: unknown): PreRoundAction | undefined {
  const seatPick = seatPickOf(pick);
  if (!seatPick) {
    return undefined;
  }

  return {kind: "pickArena", pick: seatPick};
}

function seatPickOf(pick: unknown): SeatPick | undefined {
  if (!isRecord(pick)) {
    return undefined;
  }

  const kind = Reflect.get(pick, "kind");
  if (kind === "random" || kind === "nothing") {
    return {kind};
  }
  if (kind !== "arena") {
    return undefined;
  }

  const seat = Reflect.get(pick, "seat");
  if (seat === "first" || seat === "second") {
    return {kind: "arena", seat};
  }

  return undefined;
}

function recordOf(text: string): object | undefined {
  try {
    const parsed: unknown = JSON.parse(text);
    if (isRecord(parsed)) {
      return parsed;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function isRecord(value: unknown): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
