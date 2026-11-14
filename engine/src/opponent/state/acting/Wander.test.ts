import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {actWander} from "@gunsmith/engine/opponent/state/acting/Wander";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import {hasClearLine} from "@gunsmith/engine/vision/HasClearLine";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";

const room = arenaFrom([
  "####################",
  "#..................#",
  "#..................#",
  "#...##........##...#",
  "#...##........##...#",
  "#..................#",
  "#..................#",
  "####################",
]);
const TICK = 1 / 60;
const HERE = {x: 3.5, y: 1.5};

function contextIn(arena: Arena, at: Point): OpponentContext {
  const world = startingWorld(arena, [], at);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }

  return {arena, opponent: world.opponent, target: world.player, sees: false, seconds: TICK};
}

function wandering(seed: number, at: Point): OpponentBrain {
  return startingBrain({seed, position: at});
}

it("chooses somewhere to go when it has no goal, a place it can see from where it stands and not too near", () => {
  for (let seed = 1; seed <= 30; seed++) {
    const act = actWander(wandering(seed, HERE), contextIn(room, HERE));

    if (act.brain.goal) {
      expect(hasClearLine(room, HERE, act.brain.goal)).toBe(true);
      expect(Math.hypot(act.brain.goal.x - HERE.x, act.brain.goal.y - HERE.y)).toBeGreaterThanOrEqual(
        DIFFICULTY.wanderMinDistance,
      );
    }
  }
});

it("finds a goal on the first step, whatever the seed, because it tries again when a place will not do", () => {
  for (let seed = 1; seed <= 200; seed++) {
    expect(actWander(wandering(seed, HERE), contextIn(room, HERE)).brain.goal).toBeDefined();
  }
});

it("walks toward its goal, aims along the way, and neither fires nor reloads", () => {
  const goal = {x: 15.5, y: 1.5};
  const act = actWander({...wandering(1, HERE), goal}, contextIn(room, HERE));

  expect(act.input.direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(act.input.direction.y).toBeCloseTo(0, 9);
  expect(act.input.aimAt).toEqual(goal);
  expect(act.input.firing).toBe(false);
  expect(act.input.reload).toBe(false);
});

it("keeps the goal it has while it is still on its way", () => {
  const goal = {x: 15.5, y: 1.5};
  const act = actWander({...wandering(1, HERE), goal, secondsInState: 1}, contextIn(room, HERE));

  expect(act.brain.goal).toEqual(goal);
  expect(act.brain.seed).toBe(1);
});

it("chooses another goal once it has arrived", () => {
  const goal = {x: HERE.x + DIFFICULTY.arrivalRadius - 0.05, y: HERE.y};
  const act = actWander({...wandering(1, HERE), goal}, contextIn(room, HERE));

  expect(act.brain.goal).not.toEqual(goal);
  expect(act.brain.seed).not.toBe(1);
});

it("chooses another goal when it has been walking to this one too long", () => {
  const goal = {x: 15.5, y: 1.5};
  const act = actWander(
    {...wandering(1, HERE), goal, secondsInState: DIFFICULTY.wanderRepickSeconds},
    contextIn(room, HERE),
  );

  expect(act.brain.goal).not.toEqual(goal);
  expect(act.brain.seed).not.toBe(1);
});

it("starts the clock again when it chooses a new goal", () => {
  let checked = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const act = actWander(
      {...wandering(seed, HERE), goal: {x: 15.5, y: 1.5}, secondsInState: DIFFICULTY.wanderRepickSeconds},
      contextIn(room, HERE),
    );
    if (act.brain.goal) {
      checked++;
      expect(act.brain.secondsInState).toBe(0);
    }
  }

  expect(checked).toBeGreaterThan(0);
});

it("stands still for a step when it can find nowhere to go, and tries again with a new seed", () => {
  const cell = arenaFrom(["###", "#.#", "###"]);
  const act = actWander(wandering(1, {x: 1.5, y: 1.5}), contextIn(cell, {x: 1.5, y: 1.5}));

  expect(act.brain.goal).toBeUndefined();
  expect(act.input.direction).toEqual({x: 0, y: 0});
  expect(act.brain.seed).not.toBe(1);
});

it("gives the same answer for the same brain and context", () => {
  expect(actWander(wandering(8, HERE), contextIn(room, HERE))).toEqual(
    actWander(wandering(8, HERE), contextIn(room, HERE)),
  );
});
