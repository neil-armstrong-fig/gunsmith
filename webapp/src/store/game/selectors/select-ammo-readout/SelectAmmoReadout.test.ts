import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {selectAmmoReadout} from "@src/store/game/selectors/select-ammo-readout/SelectAmmoReadout";
import type {GameStore} from "@src/store/game/types/GameStore";

const world = startingWorld(arenaFrom(["###", "#.#", "###"]));

it("reads the rifle's ammunition at the start of a match", () => {
  expect(selectAmmoReadout(storeHolding(world))).toEqual({
    slot: 1,
    selectedName: "Rifle",
    firstName: "Rifle",
    firstIconKey: "rifle",
    secondName: "Marksman rifle",
    secondIconKey: "marksman-rifle",
    rounds: RIFLE.magazineSize,
    reserve: RIFLE.startingReserve,
    magazineSize: RIFLE.magazineSize,
    reloading: false,
    reloadSeconds: RIFLE.reloadSeconds,
  });
});

it("reads the marksman rifle's ammunition once it is in hand, counting the slot from one", () => {
  const holdingSecond = {...world, player: {...world.player, equippedIndex: 1}};

  expect(selectAmmoReadout(storeHolding(holdingSecond))).toEqual({
    slot: 2,
    selectedName: "Marksman rifle",
    firstName: "Rifle",
    firstIconKey: "rifle",
    secondName: "Marksman rifle",
    secondIconKey: "marksman-rifle",
    rounds: MARKSMAN_RIFLE.magazineSize,
    reserve: MARKSMAN_RIFLE.startingReserve,
    magazineSize: MARKSMAN_RIFLE.magazineSize,
    reloading: false,
    reloadSeconds: MARKSMAN_RIFLE.reloadSeconds,
  });
});

it("reads the rounds and the reserve the weapon in hand has left, not the other weapon's", () => {
  const loadout = [
    {weapon: RIFLE, rounds: 3, reserve: 4},
    {weapon: MARKSMAN_RIFLE, rounds: 1, reserve: 2},
  ];
  const first = selectAmmoReadout(storeHolding({...world, player: {...world.player, loadout, equippedIndex: 0}}));
  const second = selectAmmoReadout(storeHolding({...world, player: {...world.player, loadout, equippedIndex: 1}}));

  expect([first.rounds, first.reserve]).toEqual([3, 4]);
  expect([second.rounds, second.reserve]).toEqual([1, 2]);
});

it("reads the size of a full magazine even when the magazine is part empty", () => {
  const loadout = [
    {weapon: RIFLE, rounds: 3, reserve: 4},
    {weapon: MARKSMAN_RIFLE, rounds: 1, reserve: 2},
  ];
  const first = selectAmmoReadout(storeHolding({...world, player: {...world.player, loadout, equippedIndex: 0}}));
  const second = selectAmmoReadout(storeHolding({...world, player: {...world.player, loadout, equippedIndex: 1}}));

  expect([first.magazineSize, second.magazineSize]).toEqual([RIFLE.magazineSize, MARKSMAN_RIFLE.magazineSize]);
});

it("says the weapon is reloading while a reload has time left", () => {
  const reloading = {...world, player: {...world.player, reloadRemainingSeconds: 0.4}};

  expect(selectAmmoReadout(storeHolding(reloading)).reloading).toBe(true);
});

it("says the weapon is not reloading when no reload is under way", () => {
  expect(selectAmmoReadout(storeHolding(world)).reloading).toBe(false);
});

/** The store as the selector sees it, holding `held`. */
function storeHolding(held: World): GameStore {
  return {world: held, setWorld: () => undefined};
}
