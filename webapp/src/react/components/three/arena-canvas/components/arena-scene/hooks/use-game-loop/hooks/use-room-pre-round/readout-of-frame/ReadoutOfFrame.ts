import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import {appearanceToDraw} from "@src/assets/weapon-drawings/appearance-to-draw/AppearanceToDraw";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";
import type {RevealReadout} from "@src/game/room-pre-round/types/RevealReadout";
import type {RoomPreRoundReadout} from "@src/game/room-pre-round/types/RoomPreRoundReadout";
import type {SeatReadout} from "@src/game/room-pre-round/types/SeatReadout";
import type {ShownArena} from "@src/game/room-pre-round/types/ShownArena";
import type {ShownWeapon} from "@src/game/room-pre-round/types/ShownWeapon";
import {sameShownWeapon} from "@src/game/room-pre-round/same-shown-weapon/SameShownWeapon";
import type {SlotReadout} from "@src/game/room-pre-round/types/SlotReadout";
import type {ArenaView} from "@src/online/types/pre-round/ArenaView";
import type {OpponentPreRound} from "@src/online/types/pre-round/OpponentPreRound";
import type {OpponentWeaponFrame} from "@src/online/types/OpponentWeaponFrame";
import type {OpponentWeapons} from "@src/online/types/OpponentWeapons";
import type {OwnPreRound} from "@src/online/types/pre-round/OwnPreRound";
import type {PreRoundFrame} from "@src/online/types/pre-round/PreRoundFrame";
import type {WeaponSlotView} from "@src/online/types/pre-round/WeaponSlotView";
import type {WeaponView} from "@src/online/types/pre-round/WeaponView";
import type {ReadoutRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/readout-of-frame/types/ReadoutRequest";

/**
 * What the screen needs of the server's frame of the pre-round, and the reveal if it has been made. The clock is in whole seconds, rounded up,
 * so the readout changes once a second at most and a running clock never says 0. The other player's saved weapon takes the numbers the server
 * told once (`opponentWeapons`), and a weapon shown in the `previous` readout is kept while it is the same, so it is given its drawing once.
 */
export function readoutOfFrame({frame, reveal, previous, opponentWeapons}: ReadoutRequest): RoomPreRoundReadout {
  return {
    stage: frame.stage,
    secondsLeft: wholeSecondsOf(frame.secondsLeft),
    builtInArenas: frame.builtInArenas,
    how: frame.how,
    reveal: revealOf(frame, reveal),
    own: ownReadoutOf(frame.own, previous?.own),
    opponent: opponentReadoutOf(frame.opponent, previous?.opponent, opponentWeapons),
  };
}

/** The reveal belongs to the stage that shows it: a frame of any other stage shows none, whatever the server said before. */
function revealOf(frame: PreRoundFrame, reveal: RevealReadout | undefined): RevealReadout | undefined {
  if (frame.stage !== "revealing" && frame.stage !== "decided") {
    return undefined;
  }

  return reveal;
}

function ownReadoutOf(own: OwnPreRound, previous: SeatReadout | undefined): SeatReadout {
  return {
    slots: slotsOf(own.weapons.slots, previous?.slots, undefined),
    arena: arenaOf(own.arena),
    arenaLocked: own.locked,
    picked: own.pick !== undefined,
    ready: own.ready ?? false,
  };
}

function opponentReadoutOf(
  opponent: OpponentPreRound,
  previous: SeatReadout | undefined,
  told: OpponentWeapons | undefined,
): SeatReadout {
  return {
    slots: slotsOf(opponent.weapons.slots, previous?.slots, told),
    arena: arenaOf(opponent.arena),
    arenaLocked: opponent.locked,
    picked: opponent.picked,
    ready: opponent.ready ?? false,
  };
}

function slotsOf(
  slots: readonly [WeaponSlotView, WeaponSlotView],
  previous: readonly [SlotReadout, SlotReadout] | undefined,
  told: OpponentWeapons | undefined,
): readonly [SlotReadout, SlotReadout] {
  return [slotOf(slots[0], previous?.[0], told?.[0]), slotOf(slots[1], previous?.[1], told?.[1])];
}

function slotOf(
  slot: WeaponSlotView,
  previous: SlotReadout | undefined,
  told: OpponentWeaponFrame | undefined,
): SlotReadout {
  return {locked: slot.locked, shown: shownOf(slot.choice, previous?.shown, told)};
}

/**
 * The weapon the server shows, a saved one with the numbers it told once for that slot: the one shown before when it is the same (compared after
 * the numbers are joined, so numbers that come after the name make a new one), else a new one, given its drawing here.
 */
function shownOf(
  view: WeaponView | undefined,
  previous: ShownWeapon | undefined,
  told: OpponentWeaponFrame | undefined,
): ShownWeapon | undefined {
  if (!view) {
    return undefined;
  }

  const shown = withToldNumbers(view, told);
  if (previous && sameShownWeapon(previous, shown)) {
    return previous;
  }
  if (shown.kind === "saved" && shown.weapon && told) {
    weaponAppearances.set(shown.weapon, appearanceToDraw(told.appearance));
  }

  return shown;
}

function withToldNumbers(view: WeaponView, told: OpponentWeaponFrame | undefined): ShownWeapon {
  if (view.kind === "builtIn") {
    return {kind: "builtIn", key: view.key};
  }
  if (!told) {
    return {kind: "saved", name: view.name};
  }

  return {kind: "saved", name: view.name, weapon: told.weapon};
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
