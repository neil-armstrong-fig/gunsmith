import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";
import {firingAt} from "@gunsmith/engine/game-loop/step/testing/FiringAt";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";

const EAST = firingAt({x: 20, y: 4.5});

/** The player with an empty magazine in every weapon and `reserve` rounds behind each. */
function dry(world: World, reserve: number): World {
  return {
    ...world,
    player: {...world.player, loadout: world.player.loadout.map(carried => ({...carried, rounds: 0, reserve}))},
  };
}

it("reports nothing in a step where nothing happened", () => {
  expect(step(centred(), IDLE, TICK).events).toBeUndefined();
});

it("reports an empty click when the trigger is held on an empty magazine", () => {
  expect(step(dry(centred(), 30), EAST, TICK).events).toEqual([{kind: "fireRefused", reason: "empty"}]);
});

it("reports an empty click whether or not there is a reserve", () => {
  expect(step(dry(centred(), 0), EAST, TICK).events).toEqual([{kind: "fireRefused", reason: "empty"}]);
});

it("reports no empty click when the trigger is not held", () => {
  expect(step(dry(centred(), 30), IDLE, TICK).events).toBeUndefined();
});

it("reports no empty click while the empty weapon is being reloaded", () => {
  const reloading = step(dry(centred(), 30), {...EAST, reload: true}, TICK);

  expect(reloading.events).toBeUndefined();
});

it("reports no empty click on the shot that empties the magazine, and none while the last shot cools down", () => {
  const lastRound: World = {
    ...centred(),
    player: {...centred().player, loadout: centred().player.loadout.map(carried => ({...carried, rounds: 1}))},
  };
  const shot = step(lastRound, EAST, TICK);

  expect(shot.events).toBeUndefined();
  expect(step(shot, EAST, TICK).events).toBeUndefined();
});

it("reports the empty click once the last shot has cooled down, and again every step the trigger stays held", () => {
  let world = step(
    {
      ...centred(),
      player: {...centred().player, loadout: centred().player.loadout.map(carried => ({...carried, rounds: 1}))},
    },
    EAST,
    TICK,
  );
  const clicks: number[] = [];
  for (let tick = 1; tick < 40; tick += 1) {
    world = step(world, EAST, TICK);
    if (world.events?.some(event => event.kind === "fireRefused")) {
      clicks.push(tick);
    }
  }

  expect(clicks.length).toBeGreaterThan(1);
  expect(clicks[0]).toBeGreaterThan(5);
  expect(clicks).toEqual(clicks.map((_, index) => (clicks[0] ?? 0) + index));
});

it("carries no event into the next step", () => {
  const clicked = step(dry(centred(), 30), EAST, TICK);

  expect(step(clicked, IDLE, TICK).events).toBeUndefined();
});

it("carries no event into a frozen round", () => {
  const clicked = step({...dry(centred(), 30), round: "lost"}, EAST, TICK);

  expect(clicked.events).toBeUndefined();
  expect(step({...clicked, events: [{kind: "fireRefused", reason: "empty"}]}, EAST, TICK).events).toBeUndefined();
});

it("never reports the opponent running dry", () => {
  let world = giveOpponentBrain(startingWorld(arena, [], {x: 11.5, y: 4.5}), 1);
  let reportedAClick = false;
  for (let tick = 0; tick < 3600; tick += 1) {
    world = step(world, IDLE, TICK);
    reportedAClick = reportedAClick || world.events !== undefined;
  }

  expect(reportedAClick).toBe(false);
});
