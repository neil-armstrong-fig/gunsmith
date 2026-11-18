import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {viewOfSeat} from "@gunsmith/engine/seat/ViewOfSeat";
import {worldOfSeatView} from "@gunsmith/engine/seat/WorldOfSeatView";

const room = arenaFrom([
  "########################",
  ...Array(5).fill("#" + ".".repeat(22) + "#"),
  "########################",
]);

it("builds the world a seat was told about, with the fighters it sees", () => {
  const world = duel();
  const rebuilt = worldOfSeatView(room, viewOfSeat(world, "first"));

  expect(rebuilt).toEqual(world);
});

it("builds a world with no opponent when the seat was told of none", () => {
  const world = duel();
  const turnedAway: World = {...world, player: {...world.player, aim: {x: -1, y: 0}}};
  const rebuilt = worldOfSeatView(room, viewOfSeat(turnedAway, "first"));

  expect(rebuilt.opponent).toBeUndefined();
  expect(rebuilt.player).toEqual(turnedAway.player);
});

it("survives being sent as JSON", () => {
  const sent = JSON.parse(JSON.stringify(viewOfSeat(duel(), "second"))) as ReturnType<typeof viewOfSeat>;

  expect(worldOfSeatView(room, sent).player).toEqual(duel().opponent);
});

function duel(): World {
  return startingWorld(room, [], {x: 12.5 + 4, y: 3.5});
}
