import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import type {RevealReadout} from "@src/game/room-pre-round/types/RevealReadout";
import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import type {SeatReadout} from "@src/game/room-pre-round/types/SeatReadout";
import type {ShownArena} from "@src/game/room-pre-round/types/ShownArena";
import type {SlotReadout} from "@src/game/room-pre-round/types/SlotReadout";
import type {ArenaView} from "@src/online/types/pre-round/ArenaView";
import type {OpponentPreRound} from "@src/online/types/pre-round/OpponentPreRound";
import type {OwnPreRound} from "@src/online/types/pre-round/OwnPreRound";
import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";
import type {WeaponSlotView} from "@src/online/types/pre-round/WeaponSlotView";
import type {ReadoutRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/readout-of-frame/types/ReadoutRequest";

/**
 * What the screen needs of the server's frame of the pre-round, and the reveal if it has been made. The clock is in whole seconds, rounded up,
 * so the readout changes once a second at most and a running clock never says 0.
 */
export function readoutOfFrame({frame, reveal}: ReadoutRequest): RoomPreRoundReadout {
  return {
    stage: frame.stage,
    secondsLeft: wholeSecondsOf(frame.secondsLeft),
    how: frame.how,
    reveal: revealOf(frame, reveal),
    own: ownReadoutOf(frame.own),
    opponent: opponentReadoutOf(frame.opponent),
  };
}

/** The reveal belongs to the stage that shows it: a frame of any other stage shows none, whatever the server said before. */
function revealOf(frame: PreRoundFrame, reveal: RevealReadout | undefined): RevealReadout | undefined {
  if (frame.stage !== "revealing" && frame.stage !== "decided") {
    return undefined;
  }

  return reveal;
}

function ownReadoutOf(own: OwnPreRound): SeatReadout {
  return {
    slots: slotsOf(own.weapons.slots),
    arena: arenaOf(own.arena),
    arenaLocked: own.locked,
    picked: own.pick !== undefined,
    ready: own.ready ?? false,
  };
}

function opponentReadoutOf(opponent: OpponentPreRound): SeatReadout {
  return {
    slots: slotsOf(opponent.weapons.slots),
    arena: arenaOf(opponent.arena),
    arenaLocked: opponent.locked,
    picked: opponent.picked,
    ready: opponent.ready ?? false,
  };
}

function slotsOf(slots: readonly [WeaponSlotView, WeaponSlotView]): readonly [SlotReadout, SlotReadout] {
  return [slotOf(slots[0]), slotOf(slots[1])];
}

function slotOf(slot: WeaponSlotView): SlotReadout {
  return {locked: slot.locked, shown: slot.choice};
}

function arenaOf(view: ArenaView | undefined): ShownArena | undefined {
  if (!view) {
    return undefined;
  }
  if (view.kind === "saved") {
    return {name: view.name, rows: view.rows};
  }

  return {name: view.name, rows: BUILT_IN_ARENAS.find(arena => arena.name === view.name)?.rows};
}

function wholeSecondsOf(seconds: number | undefined): number | undefined {
  if (seconds === undefined) {
    return undefined;
  }

  return Math.ceil(seconds);
}
