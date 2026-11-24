import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";

/** A short text that changes whenever the room's pre-round moves on a step (a lock, a pick, the stage), so the dialog can take the focus back when a button it held has gone. */
export function roomProgressOf(readout: RoomPreRoundReadout | undefined): string {
  if (!readout) {
    return "";
  }

  const {own} = readout;

  return [readout.stage, own.slots[0].locked, own.slots[1].locked, own.arenaLocked, own.picked, own.ready].join(",");
}
