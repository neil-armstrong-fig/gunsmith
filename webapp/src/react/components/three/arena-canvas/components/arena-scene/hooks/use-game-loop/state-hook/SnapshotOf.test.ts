import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {snapshotOf} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/state-hook/SnapshotOf";

const world = startingWorld(arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"]));

it("reports the arena's size in tiles", () => {
  expect(snapshotOf(world).arena).toEqual({width: 5, height: 5});
});

it("reports where the player's centre is", () => {
  expect(snapshotOf(world).player).toMatchObject({x: 2.5, y: 2.5});
});

it("reports the game clock", () => {
  expect(snapshotOf({...world, elapsedSeconds: 3.5}).elapsedSeconds).toBe(3.5);
});

it("hands back a copy, so reading it cannot change the game", () => {
  const snapshot = snapshotOf(world);
  snapshot.player.x = 99;

  expect(world.player.position.x).toBe(2.5);
});

it("reports the way the player faces in degrees, 0 being east and 90 north", () => {
  const facing = (x: number, y: number): number =>
    snapshotOf({...world, player: {...world.player, aim: {x, y}}}).player.aimDegrees;

  expect(facing(1, 0)).toBe(0);
  expect(facing(0, 1)).toBe(90);
  expect(facing(0, -1)).toBe(-90);
  expect(facing(-Math.SQRT1_2, Math.SQRT1_2)).toBeCloseTo(135, 9);
});

it("reports no bullets when none are in the air", () => {
  expect(snapshotOf(world).bullets).toEqual([]);
});

it("reports where each bullet in the air is", () => {
  const flying = {
    ...world,
    bullets: [{position: {x: 1, y: 2}, direction: {x: 1, y: 0}, damage: 25, speed: 20, shooter: "player" as const}],
  };

  expect(snapshotOf(flying).bullets).toEqual([{x: 1, y: 2}]);
});

it("reports no dummies when the world has none", () => {
  expect(snapshotOf(world).dummies).toEqual([]);
});

it("reports where each dummy stands and how much health it has left", () => {
  const withDummies = {
    ...world,
    dummies: [
      {position: {x: 1.5, y: 2.5}, health: 100},
      {position: {x: 3.5, y: 1.5}, health: 25},
    ],
  };

  expect(snapshotOf(withDummies).dummies).toEqual([
    {x: 1.5, y: 2.5, health: 100},
    {x: 3.5, y: 1.5, health: 25},
  ]);
});

it("reports which slot the weapon in hand is in, counting from one", () => {
  const holding = (equippedIndex: number): number =>
    snapshotOf({...world, player: {...world.player, equippedIndex}}).weapon.slot;

  expect(holding(0)).toBe(1);
  expect(holding(1)).toBe(2);
});

it("reports the rounds in the magazine and in the reserve of the weapon in hand, not of the other", () => {
  const loadout = [
    {weapon: RIFLE, rounds: 3, reserve: 4},
    {weapon: MARKSMAN_RIFLE, rounds: 1, reserve: 2},
  ];

  expect(snapshotOf({...world, player: {...world.player, loadout, equippedIndex: 0}}).weapon).toMatchObject({
    rounds: 3,
    reserve: 4,
  });
  expect(snapshotOf({...world, player: {...world.player, loadout, equippedIndex: 1}}).weapon).toMatchObject({
    rounds: 1,
    reserve: 2,
  });
});

it("reports whether the weapon in hand is being reloaded", () => {
  const reloading = {...world, player: {...world.player, reloadRemainingSeconds: 0.5}};

  expect(snapshotOf(reloading).weapon.reloading).toBe(true);
  expect(snapshotOf(world).weapon.reloading).toBe(false);
});

it("reports the player's health", () => {
  expect(snapshotOf({...world, player: {...world.player, health: 65}}).player.health).toBe(65);
});

it("reports no opponent when the world has none", () => {
  expect(snapshotOf(world).opponent).toBeUndefined();
});

it("reports where the opponent stands and how much health it has left", () => {
  const withOpponent = startingWorld(world.arena, [], {x: 3.5, y: 1.5});
  const hurt = {...withOpponent, opponent: withOpponent.opponent && {...withOpponent.opponent, health: 40}};

  expect(snapshotOf(hurt).opponent).toEqual({x: 3.5, y: 1.5, health: 40, rounds: RIFLE.magazineSize});
});

it("reports the rounds in the magazine of the weapon the opponent holds", () => {
  const withOpponent = startingWorld(world.arena, [], {x: 3.5, y: 1.5});
  const {opponent} = withOpponent;
  const spent = {
    ...withOpponent,
    opponent: opponent && {...opponent, loadout: opponent.loadout.map(carried => ({...carried, rounds: 4}))},
  };

  expect(snapshotOf(spent).opponent?.rounds).toBe(4);
});

it("reports what the opponent is doing, when it has a brain", () => {
  const thinking = giveOpponentBrain(startingWorld(world.arena, [], {x: 3.5, y: 1.5}), 1);

  expect(snapshotOf(thinking).opponent?.behaviour).toBe("wander");
  expect(
    snapshotOf({...thinking, opponentBrain: thinking.opponentBrain && {...thinking.opponentBrain, state: "reload"}})
      .opponent?.behaviour,
  ).toBe("reload");
});

it("reports no behaviour for an opponent with no brain", () => {
  expect(snapshotOf(startingWorld(world.arena, [], {x: 3.5, y: 1.5})).opponent?.behaviour).toBeUndefined();
});

it("reports where the round stands", () => {
  expect(snapshotOf(world).round).toBe("playing");
  expect(snapshotOf({...world, round: "won"}).round).toBe("won");
  expect(snapshotOf({...world, round: "lost"}).round).toBe("lost");
});
