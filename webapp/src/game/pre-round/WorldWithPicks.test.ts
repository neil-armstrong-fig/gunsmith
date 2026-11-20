import {engine} from "@gunsmith/engine/Engine";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {DUEL_ARENA} from "@src/game/duel/DuelArena";
import {DUEL_OPPONENT} from "@src/game/duel/DuelOpponent";
import {worldWithPicks} from "@src/game/pre-round/WorldWithPicks";

const duel = engine.startingWorld(DUEL_ARENA, [], DUEL_OPPONENT);

it("gives the player the two weapons, full, with the first in hand", () => {
  const world = worldWithPicks(
    {...duel, player: {...duel.player, equippedIndex: 1}},
    {first: SUBMACHINE_GUN, second: RIFLE},
  );

  expect(world.player.loadout).toEqual([
    {weapon: SUBMACHINE_GUN, rounds: SUBMACHINE_GUN.magazineSize, reserve: SUBMACHINE_GUN.startingReserve},
    {weapon: RIFLE, rounds: RIFLE.magazineSize, reserve: RIFLE.startingReserve},
  ]);
  expect(world.player.equippedIndex).toBe(0);
});

it("ends a reload that was going", () => {
  const reloading = {...duel, player: {...duel.player, reloadRemainingSeconds: 1}};

  expect(
    worldWithPicks(reloading, {first: RIFLE, second: MARKSMAN_RIFLE}).player.reloadRemainingSeconds,
  ).toBeUndefined();
});

it("leaves the opponent and the rest of the world as they were", () => {
  const world = worldWithPicks(duel, {first: SUBMACHINE_GUN, second: SUBMACHINE_GUN});

  expect(world.opponent).toBe(duel.opponent);
  expect(world.arena).toBe(duel.arena);
  expect(world.player.position).toBe(duel.player.position);
});
