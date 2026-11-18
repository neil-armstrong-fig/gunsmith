import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {chooseState} from "@gunsmith/engine/opponent/state/ChooseState";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {OpponentState} from "@gunsmith/engine/opponent/types/OpponentState";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

const room = arenaFrom(["##########", "#........#", "#........#", "#........#", "##########"]);
const HERE = {x: 2.5, y: 2.5};
const SEEN_AT = {x: 7.5, y: 2.5};
const WEAPON_NEAR_HERE = {x: 5.5, y: 2.5};
const OPPONENT_TO_WEAPON = 3;
const field = arenaFrom([
  "####################",
  "#..................#",
  "#..................#",
  "#..................#",
  "####################",
]);

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

it("sets out for a weapon it will win the walk to, from wandering", () => {
  const brain = chooseState(brainIn("wander"), racing({sees: false}));

  expect(brain.state).toBe("seek");
  expect(brain.goal).toBeUndefined();
  expect(brain.secondsInState).toBe(0);
});

it("sets out for the weapon in the middle of the fight too, in sight of the player, when it will win the walk", () => {
  expect(chooseState(brainIn("engage"), racing({sees: true})).state).toBe("seek");
  expect(chooseState(brainIn("search", {goal: SEEN_AT}), racing({sees: true})).state).toBe("seek");
});

it("does not set out for a weapon the player is nearer to, and goes on as it was", () => {
  const nearThePlayer = {...racing({sees: true}), pickup: {position: {x: 12.5, y: 2.5}, weapon: SUBMACHINE_GUN}};

  expect(chooseState(brainIn("engage"), nearThePlayer).state).toBe("engage");
  expect(chooseState(brainIn("wander"), {...nearThePlayer, sees: false}).state).toBe("wander");
});

it("does not set out when no weapon lies in the arena", () => {
  expect(chooseState(brainIn("engage"), {...racing({sees: true}), pickup: undefined}).state).toBe("engage");
});

it("reloads first when its magazine is empty, though it would win the walk to the weapon", () => {
  expect(chooseState(brainIn("wander"), racing({sees: false, magazine: 0})).state).toBe("reload");
});

it("sets out for the weapon once the reload is done, if it will win the walk, whether it sees the player or not", () => {
  expect(chooseState(brainIn("reload"), racing({sees: true})).state).toBe("seek");
  expect(chooseState(brainIn("reload"), racing({sees: false})).state).toBe("seek");
});

it("keeps seeking while it still wins the walk, with the time it has been at it, in sight of the player or not", () => {
  const brain = chooseState(brainIn("seek", {secondsInState: 0.8}), racing({sees: true}));

  expect(brain.state).toBe("seek");
  expect(brain.secondsInState).toBe(0.8);
  expect(chooseState(brainIn("seek"), racing({sees: false})).state).toBe("seek");
});

it("keeps seeking when the player has drawn up to within the grace it allows, which would not have sent it", () => {
  const closing = {x: WEAPON_NEAR_HERE.x + OPPONENT_TO_WEAPON - DIFFICULTY.seekGrace + 0.5, y: 2.5};
  const context = racing({sees: true, player: closing});

  expect(chooseState(brainIn("seek"), context).state).toBe("seek");
  expect(chooseState(brainIn("engage"), context).state).toBe("engage");
});

it("goes back to the fight, engaging a player it sees, once the weapon is gone", () => {
  const brain = chooseState(brainIn("seek"), {...racing({sees: true}), pickup: undefined});

  expect(brain.state).toBe("engage");
  expect(brain.reactionRemainingSeconds).toBe(DIFFICULTY.reactionSeconds);
});

it("goes to search where it last saw the player once the weapon is gone, if it cannot see them now", () => {
  const brain = chooseState(brainIn("seek"), {...racing({sees: false}), pickup: undefined});

  expect(brain.state).toBe("search");
  expect(brain.goal).toEqual(SEEN_AT);
});

it("goes to wander once the weapon is gone, if it has never seen the player", () => {
  const brain = chooseState(brainIn("seek", {lastSeen: undefined}), {...racing({sees: false}), pickup: undefined});

  expect(brain.state).toBe("wander");
});

it("turns back from the weapon when the player is nearer to it by more than the grace, and fights if it sees them", () => {
  const ahead = {x: WEAPON_NEAR_HERE.x + OPPONENT_TO_WEAPON - DIFFICULTY.seekGrace - 0.5, y: 2.5};

  expect(chooseState(brainIn("seek"), racing({sees: true, player: ahead})).state).toBe("engage");
});

function brainIn(state: OpponentState, overrides: Partial<OpponentBrain> = {}): OpponentBrain {
  return {...startingBrain({seed: 1, position: HERE}), state, lastSeen: SEEN_AT, ...overrides};
}

interface Race {
  sees: boolean;
  magazine?: number;
  player?: Point;
}

/** A weapon three tiles from the opponent, with the player nine tiles from it, so the opponent wins the walk, unless `player` says otherwise. */
function racing(race: Race): OpponentContext {
  const base = context(race.sees, race.magazine);
  const player = race.player ?? {x: 14.5, y: 2.5};

  return {
    ...base,
    arena: field,
    target: {...base.target, position: player},
    pickup: {position: WEAPON_NEAR_HERE, weapon: SUBMACHINE_GUN},
  };
}

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
