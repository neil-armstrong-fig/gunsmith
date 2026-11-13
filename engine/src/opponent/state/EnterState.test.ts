import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {enterState} from "@gunsmith/engine/opponent/state/EnterState";
import {startingBrain} from "@gunsmith/engine/opponent/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

const mid: OpponentBrain = {
  ...startingBrain({seed: 9, position: {x: 1.5, y: 1.5}}),
  state: "engage",
  secondsInState: 3,
  goal: {x: 7, y: 7},
  lastSeen: {x: 4.5, y: 2.5},
  seenSeconds: 2,
  reactionRemainingSeconds: 0,
  fireRemainingSeconds: 0.3,
  restRemainingSeconds: 0.6,
  idleSeconds: 2,
};

it("changes the state", () => {
  expect(enterState(mid, "reload").state).toBe("reload");
});

it("starts the time in the state again, and forgets standing at a goal", () => {
  const brain = enterState(mid, "wander");

  expect(brain.secondsInState).toBe(0);
  expect(brain.idleSeconds).toBe(0);
});

it("drops the goal for every state but search", () => {
  expect(enterState(mid, "wander").goal).toBeUndefined();
  expect(enterState(mid, "engage").goal).toBeUndefined();
  expect(enterState(mid, "reload").goal).toBeUndefined();
});

it("goes to the place it last saw the player when it searches", () => {
  expect(enterState(mid, "search").goal).toEqual({x: 4.5, y: 2.5});
});

it("has no goal to search for when it has never seen the player", () => {
  expect(enterState({...mid, lastSeen: undefined}, "search").goal).toBeUndefined();
});

it("waits its reaction time again, and is between bursts, when it starts to engage", () => {
  const brain = enterState(mid, "engage");

  expect(brain.reactionRemainingSeconds).toBe(DIFFICULTY.reactionSeconds);
  expect(brain.fireRemainingSeconds).toBe(0);
  expect(brain.restRemainingSeconds).toBe(0);
});

it("stops mid-burst when it leaves engage", () => {
  const brain = enterState(mid, "reload");

  expect(brain.fireRemainingSeconds).toBe(0);
  expect(brain.restRemainingSeconds).toBe(0);
});

it("keeps what it knows about the player, and its seed", () => {
  const brain = enterState(mid, "wander");

  expect(brain.lastSeen).toEqual({x: 4.5, y: 2.5});
  expect(brain.seenSeconds).toBe(2);
  expect(brain.seed).toBe(9);
});
