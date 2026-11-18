import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startAtPlaces} from "@gunsmith/engine/arena-symmetry/StartAtPlaces";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";

const ARENA = arenaFrom(["#########", "#.......#", "#.......#", "#.......#", "#########"]);
const PLACES = {player: {x: 1.5, y: 1.5}, opponent: {x: 7.5, y: 3.5}};

it("puts the player and the opponent on their places", () => {
  const world = startAtPlaces(startingWorld(ARENA, [], PLACES.opponent), PLACES);

  expect(world.player.position).toEqual(PLACES.player);
  expect(world.opponent?.position).toEqual(PLACES.opponent);
});

it("turns each fighter to face the middle of the arena", () => {
  const world = startAtPlaces(startingWorld(ARENA, [], PLACES.opponent), PLACES);

  // The middle is (4.5, 2.5): from the player it is 3 east and 1 north, from the opponent the same the other way.
  const length = Math.hypot(3, 1);
  expect(world.player.aim.x).toBeCloseTo(3 / length, 10);
  expect(world.player.aim.y).toBeCloseTo(1 / length, 10);
  expect(world.opponent?.aim.x).toBeCloseTo(-3 / length, 10);
  expect(world.opponent?.aim.y).toBeCloseTo(-1 / length, 10);
});

it("changes nothing else about the world", () => {
  const before = startingWorld(ARENA, [], PLACES.opponent);

  const after = startAtPlaces(before, PLACES);

  expect({...after, player: before.player, opponent: before.opponent}).toEqual(before);
  expect(after.player.health).toBe(before.player.health);
});

it("leaves the world it was given as it was", () => {
  const before = startingWorld(ARENA, [], PLACES.opponent);
  const copy = structuredClone(before);

  startAtPlaces(before, PLACES);

  expect(before).toEqual(copy);
});

it("places only the player in a world with no opponent", () => {
  const world = startAtPlaces(startingWorld(ARENA), PLACES);

  expect(world.player.position).toEqual(PLACES.player);
  expect(world.opponent).toBeUndefined();
});
