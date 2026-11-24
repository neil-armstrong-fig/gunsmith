import type {ReceivedPreRound} from "@src/dsl/gunsmith/components/room/playwright/wire/types/ReceivedPreRound";

/** The `preRound` frames among the text frames a browser received, in order. A frame that is not JSON, or not a preRound frame, is skipped. */
export function preRoundsOfFrames(frames: readonly string[]): readonly ReceivedPreRound[] {
  const preRounds: ReceivedPreRound[] = [];

  for (const frame of frames) {
    const preRound = preRoundOfFrame(frame);
    if (preRound) {
      preRounds.push(preRound);
    }
  }

  return preRounds;
}

function preRoundOfFrame(frame: string): ReceivedPreRound | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(frame);
  } catch {
    return undefined;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  if (Reflect.get(parsed, "kind") !== "preRound") {
    return undefined;
  }

  const opponent: unknown = Reflect.get(parsed, "opponent");
  const slots = slotsOf(opponent);

  return {
    opponentFirstWeaponShown: isShown(slots[0]),
    opponentSecondWeaponShown: isShown(slots[1]),
    opponentArenaShown:
      typeof opponent === "object" && opponent !== null && Reflect.get(opponent, "arena") !== undefined,
  };
}

/** The slots inside an `opponent` field of a frame, or none when it holds none. */
function slotsOf(opponent: unknown): readonly unknown[] {
  if (typeof opponent !== "object" || opponent === null) {
    return [];
  }

  const weapons: unknown = Reflect.get(opponent, "weapons");
  if (typeof weapons !== "object" || weapons === null) {
    return [];
  }

  const slots: unknown = Reflect.get(weapons, "slots");
  if (!Array.isArray(slots)) {
    return [];
  }

  return slots;
}

function isShown(slot: unknown): boolean {
  return typeof slot === "object" && slot !== null && Reflect.get(slot, "choice") !== undefined;
}
