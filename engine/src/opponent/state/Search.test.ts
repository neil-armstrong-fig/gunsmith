import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {actSearch} from "@gunsmith/engine/opponent/state/Search";
import {startingBrain} from "@gunsmith/engine/opponent/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";

const room = arenaFrom([
  "##############",
  "#............#",
  "#............#",
  "#............#",
  "#............#",
  "##############",
]);
const TICK = 1 / 60;
const HERE = {x: 2.5, y: 2.5};
const LAST_SEEN = {x: 9.5, y: 2.5};

function context(): OpponentContext {
  const world = startingWorld(room, [], HERE);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }

  return {arena: room, opponent: world.opponent, target: world.player, sees: false, seconds: TICK};
}

function searching(overrides: Partial<OpponentBrain> = {}): OpponentBrain {
  return {
    ...startingBrain({seed: 2, position: HERE}),
    state: "search",
    lastSeen: LAST_SEEN,
    goal: LAST_SEEN,
    ...overrides,
  };
}

it("walks to the place it last saw the player, looking where it goes, without firing or reloading", () => {
  const act = actSearch(searching(), context());

  expect(act.input.direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(act.input.aimAt).toEqual(LAST_SEEN);
  expect(act.input.firing).toBe(false);
  expect(act.input.reload).toBe(false);
  expect(act.brain.state).toBe("search");
});

it("stands still and waits when it has got there", () => {
  const arrived = {x: HERE.x + 0.1, y: HERE.y};
  const act = actSearch(searching({goal: arrived}), context());

  expect(act.input.direction).toEqual({x: 0, y: 0});
  expect(act.brain.idleSeconds).toBeCloseTo(TICK, 9);
  expect(act.brain.state).toBe("search");
});

it("keeps waiting, and counting, until the linger time is up", () => {
  const act = actSearch(searching({goal: HERE, idleSeconds: DIFFICULTY.searchLingerSeconds - 0.5}), context());

  expect(act.brain.state).toBe("search");
  expect(act.brain.idleSeconds).toBeCloseTo(DIFFICULTY.searchLingerSeconds - 0.5 + TICK, 9);
});

it("gives up and goes back to wandering once it has waited the linger time", () => {
  const act = actSearch(searching({goal: HERE, idleSeconds: DIFFICULTY.searchLingerSeconds - TICK / 2}), context());

  expect(act.brain.state).toBe("wander");
  expect(act.brain.goal).toBeUndefined();
  expect(act.brain.idleSeconds).toBe(0);
});

it("does not count the time spent walking there as waiting", () => {
  const act = actSearch(searching({idleSeconds: 0}), context());

  expect(act.brain.idleSeconds).toBe(0);
});

it("goes back to wandering at once when it has nowhere to search", () => {
  const act = actSearch(searching({goal: undefined, lastSeen: undefined}), context());

  expect(act.brain.state).toBe("wander");
  expect(act.input.direction).toEqual({x: 0, y: 0});
});

it("walks to a place due north of it, and does not count the walk as waiting", () => {
  const north = {x: HERE.x, y: HERE.y + 1.5};
  const act = actSearch(searching({goal: north, lastSeen: north}), context());

  expect(act.input.direction.x).toBeCloseTo(0, 9);
  expect(act.input.direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(act.brain.idleSeconds).toBe(0);
});
