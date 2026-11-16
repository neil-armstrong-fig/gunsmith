import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {chooseState} from "@gunsmith/engine/opponent/state/ChooseState";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {OpponentState} from "@gunsmith/engine/opponent/types/OpponentState";

const room = arenaFrom(["##########", "#........#", "#........#", "#........#", "##########"]);
const HERE = {x: 2.5, y: 2.5};
const SEEN_AT = {x: 7.5, y: 2.5};

it("starts to engage a player it sees while it wanders", () => {
  const brain = chooseState(brainIn("wander"), context(true));

  expect(brain.state).toBe("engage");
  expect(brain.reactionRemainingSeconds).toBe(DIFFICULTY.reactionSeconds);
});

it("starts to engage a player it sees while it searches", () => {
  expect(chooseState(brainIn("search", {goal: SEEN_AT}), context(true)).state).toBe("engage");
});

it("keeps engaging a player it still sees, without starting its reaction time again", () => {
  const brain = chooseState(brainIn("engage", {reactionRemainingSeconds: 0, fireRemainingSeconds: 0.2}), context(true));

  expect(brain.state).toBe("engage");
  expect(brain.reactionRemainingSeconds).toBe(0);
  expect(brain.fireRemainingSeconds).toBe(0.2);
});

it("goes to search the place it last saw the player when the player drops out of sight", () => {
  const brain = chooseState(brainIn("engage"), context(false));

  expect(brain.state).toBe("search");
  expect(brain.goal).toEqual(SEEN_AT);
});

it("keeps wandering while it sees nothing", () => {
  expect(chooseState(brainIn("wander"), context(false)).state).toBe("wander");
});

it("keeps searching while it still sees nothing, with its goal and its wait", () => {
  const brain = chooseState(brainIn("search", {goal: SEEN_AT, idleSeconds: 1}), context(false));

  expect(brain.state).toBe("search");
  expect(brain.goal).toEqual(SEEN_AT);
  expect(brain.idleSeconds).toBe(1);
});

it("goes to reload the moment its magazine is empty, from engaging", () => {
  expect(chooseState(brainIn("engage"), context(true, 0)).state).toBe("reload");
});

it("goes to reload from wandering and from searching too, seeing the player or not", () => {
  expect(chooseState(brainIn("wander"), context(false, 0)).state).toBe("reload");
  expect(chooseState(brainIn("search", {goal: SEEN_AT}), context(false, 0)).state).toBe("reload");
  expect(chooseState(brainIn("wander"), context(true, 0)).state).toBe("reload");
});

it("starts the reload with no goal, so it looks for cover afresh", () => {
  expect(chooseState(brainIn("engage", {goal: SEEN_AT}), context(true, 0)).goal).toBeUndefined();
});

it("keeps reloading while the magazine is still empty, with the cover it has chosen", () => {
  const brain = chooseState(brainIn("reload", {goal: {x: 1.5, y: 1.5}}), context(true, 0));

  expect(brain.state).toBe("reload");
  expect(brain.goal).toEqual({x: 1.5, y: 1.5});
});

it("goes back to engaging once the reload is done, if it sees the player", () => {
  expect(chooseState(brainIn("reload"), context(true, 5)).state).toBe("engage");
});

it("goes to search where it last saw the player once the reload is done, if it cannot see them now", () => {
  const brain = chooseState(brainIn("reload"), context(false, 5));

  expect(brain.state).toBe("search");
  expect(brain.goal).toEqual(SEEN_AT);
});

it("goes back to wandering once the reload is done, if it has never seen the player", () => {
  expect(chooseState(brainIn("reload", {lastSeen: undefined}), context(false, 5)).state).toBe("wander");
});

function context(sees: boolean, magazine = 12): OpponentContext {
  const world = startingWorld(room, [], HERE);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }
  const loadout = world.opponent.loadout.map((carried, index) => {
    if (index === 0) {
      return {...carried, rounds: magazine};
    }

    return carried;
  });

  return {arena: room, opponent: {...world.opponent, loadout}, target: world.player, sees, seconds: 1 / 60};
}

function brainIn(state: OpponentState, overrides: Partial<OpponentBrain> = {}): OpponentBrain {
  return {...startingBrain({seed: 1, position: HERE}), state, lastSeen: SEEN_AT, ...overrides};
}
