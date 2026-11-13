import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import {disarmOpponent} from "@gunsmith/engine/opponent/DisarmOpponent";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";

const arena = arenaFrom(["#########", "#.......#", "#.......#", "#.......#", "#########"]);
const duel = startingWorld(arena, [], {x: 6.5, y: 2.5});

it("empties every magazine and reserve the opponent carries", () => {
  const loadout = disarmOpponent(duel).opponent?.loadout;

  expect(loadout).toHaveLength(2);
  expect(loadout?.every(carried => carried.rounds === 0 && carried.reserve === 0)).toBe(true);
});

it("keeps the opponent's weapons, health and place", () => {
  const before = duel.opponent;
  const after = disarmOpponent(duel).opponent;

  expect(after?.position).toEqual(before?.position);
  expect(after?.health).toBe(before?.health);
  expect(after?.loadout.map(carried => carried.weapon)).toEqual(before?.loadout.map(carried => carried.weapon));
});

it("leaves the player armed", () => {
  expect(disarmOpponent(duel).player).toEqual(duel.player);
});

it("returns a world with no opponent as it is", () => {
  const practice = startingWorld(arena);

  expect(disarmOpponent(practice)).toEqual(practice);
});

it("does not change the world it was given", () => {
  const before = structuredClone(duel);

  disarmOpponent(duel);

  expect(duel).toEqual(before);
});

it("leaves an opponent who never fires, however long the match runs", () => {
  let world = disarmOpponent(duel);
  for (let tick = 0; tick < 600; tick += 1) {
    world = step(world, {direction: {x: 0, y: 0}, firing: false, reload: false}, 1 / 60);
  }

  expect(world.bullets).toEqual([]);
  expect(world.player.health).toBe(duel.player.health);
});

it("takes the opponent's brain away, so it takes no action", () => {
  const thinking = giveOpponentBrain(duel, 1);

  expect(thinking.opponentBrain).toBeDefined();
  expect(disarmOpponent(thinking).opponentBrain).toBeUndefined();
});

it("leaves an opponent that stays exactly where it stood, however long the match runs", () => {
  let world = disarmOpponent(giveOpponentBrain(duel, 1));
  for (let tick = 0; tick < 600; tick += 1) {
    world = step(world, {direction: {x: 0, y: 0}, firing: false, reload: false}, 1 / 60);
  }

  expect(world.opponent?.position).toEqual(duel.opponent?.position);
  expect(world.opponent?.aim).toEqual(duel.opponent?.aim);
});
