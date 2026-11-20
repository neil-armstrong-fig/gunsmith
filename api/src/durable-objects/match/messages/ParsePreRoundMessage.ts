import type {PreRoundAction} from "@src/durable-objects/match/messages/types/PreRoundAction";
import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";

/**
 * What a player's text frame asks of the pre-round, or `undefined` if it asks nothing the room understands: a `choose` or `lockIn` of the
 * arena step, a `choose` or `lockIn` of the weapons step, or a `pickArena`. Everything a client sends is `unknown` until here, and a choice
 * is only ever a built-in arena's name or two built-in weapons' keys (a saved item is refused until the room can check an account's library).
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
  if (kind === "choose" && Reflect.get(parsed, "step") === "weapons") {
    return chooseWeaponsOf(Reflect.get(parsed, "choice"));
  }
  if (kind === "lockIn" && Reflect.get(parsed, "step") === "weapons") {
    return {kind: "lockInWeapons"};
  }
  if (kind === "pickArena") {
    return pickOf(Reflect.get(parsed, "pick"));
  }

  return undefined;
}

function chooseOf(choice: unknown): PreRoundAction | undefined {
  if (!isRecord(choice) || Reflect.get(choice, "kind") !== "builtIn") {
    return undefined;
  }

  const name = Reflect.get(choice, "name");
  if (typeof name !== "string") {
    return undefined;
  }

  return {kind: "chooseArena", name};
}

function chooseWeaponsOf(choice: unknown): PreRoundAction | undefined {
  if (!Array.isArray(choice) || choice.length !== 2) {
    return undefined;
  }

  const first = builtInKeyOf(choice[0]);
  const second = builtInKeyOf(choice[1]);
  if (first === undefined || second === undefined) {
    return undefined;
  }

  return {kind: "chooseWeapons", keys: [first, second]};
}

function builtInKeyOf(choice: unknown): string | undefined {
  if (!isRecord(choice) || Reflect.get(choice, "kind") !== "builtIn") {
    return undefined;
  }

  const key = Reflect.get(choice, "key");
  if (typeof key !== "string") {
    return undefined;
  }

  return key;
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
