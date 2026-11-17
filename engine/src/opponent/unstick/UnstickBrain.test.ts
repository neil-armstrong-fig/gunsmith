import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import {unstickBrain} from "@gunsmith/engine/opponent/unstick/UnstickBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentState} from "@gunsmith/engine/opponent/types/OpponentState";

it("drops the goal of a wandering opponent, so it chooses another", () => {
  const brain = unstickBrain(brainIn("wander"));

  expect(brain.state).toBe("wander");
  expect(brain.goal).toBeUndefined();
});

it("drops the cover of a reloading opponent, so it looks for another", () => {
  const brain = unstickBrain(brainIn("reload"));

  expect(brain.state).toBe("reload");
  expect(brain.goal).toBeUndefined();
});

it("changes nothing that matters for a seeking opponent: the weapon is the world's, so it keeps seeking and a stuck seek is not recovered", () => {
  const seeking = brainIn("seek");

  expect(unstickBrain(seeking)).toEqual({...seeking, goal: undefined});
});

it("gives up the search and wanders instead", () => {
  const brain = unstickBrain(brainIn("search"));

  expect(brain.state).toBe("wander");
  expect(brain.goal).toBeUndefined();
});

it("turns an engaging opponent round to circle the other way, for the shortest time it holds a side", () => {
  const brain = unstickBrain(brainIn("engage"));

  expect(brain.state).toBe("engage");
  expect(brain.strafeSide).toBe(-1);
  expect(brain.strafeRemainingSeconds).toBe(DIFFICULTY.strafeMinSeconds);
});

it("turns the other side round too", () => {
  expect(unstickBrain({...brainIn("engage"), strafeSide: -1}).strafeSide).toBe(1);
});

function brainIn(state: OpponentState): OpponentBrain {
  return {
    ...startingBrain({seed: 1, position: {x: 0, y: 0}}),
    state,
    goal: {x: 5, y: 5},
    lastSeen: {x: 5, y: 5},
    strafeSide: 1,
    strafeRemainingSeconds: 1.7,
    secondsInState: 3,
  };
}
