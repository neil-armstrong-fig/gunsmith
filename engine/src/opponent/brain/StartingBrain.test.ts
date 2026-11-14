import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";

it("begins wandering, with nothing remembered", () => {
  const brain = startingBrain({seed: 5, position: {x: 3.5, y: 4.5}});

  expect(brain.state).toBe("wander");
  expect(brain.goal).toBeUndefined();
  expect(brain.lastSeen).toBeUndefined();
  expect(brain.seenSeconds).toBe(0);
  expect(brain.secondsInState).toBe(0);
});

it("carries the seed it was given", () => {
  expect(startingBrain({seed: 5, position: {x: 0, y: 0}}).seed).toBe(5);
});

it("begins the stuck watch where the opponent stands", () => {
  expect(startingBrain({seed: 5, position: {x: 3.5, y: 4.5}}).stuckWatch).toEqual({
    anchor: {x: 3.5, y: 4.5},
    seconds: 0,
  });
});

it("is not part-way through a burst, and holds the reaction delay for when it first sees the player", () => {
  const brain = startingBrain({seed: 5, position: {x: 0, y: 0}});

  expect(brain.fireRemainingSeconds).toBe(0);
  expect(brain.restRemainingSeconds).toBe(0);
  expect(brain.reactionRemainingSeconds).toBe(DIFFICULTY.reactionSeconds);
});

it("is plain data, so it survives a round trip through JSON", () => {
  const brain = startingBrain({seed: 5, position: {x: 3.5, y: 4.5}});

  expect(JSON.parse(JSON.stringify(brain))).toEqual({...brain, goal: undefined, lastSeen: undefined});
});
