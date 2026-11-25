import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import type {SeatReadout} from "@src/game/room-pre-round/types/SeatReadout";
import type {ShownArena} from "@src/game/room-pre-round/types/ShownArena";
import type {ShownWeapon} from "@src/game/room-pre-round/types/ShownWeapon";
import type {SlotReadout} from "@src/game/room-pre-round/types/SlotReadout";

/** Whether two readouts say the same, which two absent ones do. The reveal is the same when it is the same object: it is made once from one frame. */
export function sameReadout(first: RoomPreRoundReadout | undefined, second: RoomPreRoundReadout | undefined): boolean {
  if (!first || !second) {
    return first === second;
  }

  return (
    first.stage === second.stage &&
    first.secondsLeft === second.secondsLeft &&
    first.builtInArenas.join("\n") === second.builtInArenas.join("\n") &&
    first.how === second.how &&
    first.reveal === second.reveal &&
    sameSeat(first.own, second.own) &&
    sameSeat(first.opponent, second.opponent)
  );
}

function sameSeat(first: SeatReadout, second: SeatReadout): boolean {
  return (
    first.arenaLocked === second.arenaLocked &&
    first.picked === second.picked &&
    first.ready === second.ready &&
    sameArena(first.arena, second.arena) &&
    sameSlot(first.slots[0], second.slots[0]) &&
    sameSlot(first.slots[1], second.slots[1])
  );
}

function sameSlot(first: SlotReadout, second: SlotReadout): boolean {
  return first.locked === second.locked && sameWeapon(first.shown, second.shown);
}

function sameWeapon(first: ShownWeapon | undefined, second: ShownWeapon | undefined): boolean {
  if (!first || !second) {
    return first === second;
  }
  if (first.kind === "builtIn" && second.kind === "builtIn") {
    return first.key === second.key;
  }

  return first.kind === "saved" && second.kind === "saved" && first.name === second.name;
}

function sameArena(first: ShownArena | undefined, second: ShownArena | undefined): boolean {
  if (!first || !second) {
    return first === second;
  }

  return first.name === second.name && first.rows?.join("\n") === second.rows?.join("\n");
}
