import {step} from "@gunsmith/engine/game-loop/Step";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {centred} from "@gunsmith/engine/game-loop/step/testing/Centred";
import {firingAt} from "@gunsmith/engine/game-loop/step/testing/FiringAt";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {sparring} from "@gunsmith/engine/game-loop/step/testing/Sparring";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";
import {shotAtPlayer} from "@gunsmith/engine/game-loop/step/testing/ShotAtPlayer";
import {MAXIMUM_RING_DAMAGE_PER_SECOND} from "@gunsmith/engine/ring/damage/rate/MaximumRingDamage";
import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

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
    reportedAClick = reportedAClick || world.events?.some(event => event.kind === "fireRefused") === true;
  }

  expect(reportedAClick).toBe(false);
});

const PLAYER_AT = {x: 7.5, y: 4.5};
const FAR_CORNER = {x: 1.5, y: 1.5};
const CLOSED_SECONDS = 100;

/** A ring closed to its final size and hurting at its worst, centred on `centre`. */
function ringOn(centre: Point): Ring {
  return {roundSeconds: CLOSED_SECONDS, centre, startRadius: 12, timing: {startDelaySeconds: 10, closingSeconds: 20}};
}

/** Every event of the steps from `world` until the bullet has been and gone, in order, one list per step that reported any. */
function eventsOver(world: World, ticks: number): CombatEvent[][] {
  const steps: CombatEvent[][] = [];
  let current = world;
  for (let tick = 0; tick < ticks; tick += 1) {
    current = step(current, IDLE, TICK);
    if (current.events) {
      steps.push([...current.events]);
    }
  }

  return steps;
}

it("reports the damage a bullet did to the player, once, in the step it landed", () => {
  expect(eventsOver(shotAtPlayer(100), 30)).toEqual([
    [{kind: "damageTaken", cause: "bullet", amount: RIFLE.bulletDamage}],
  ]);
});

it("reports only the health a bullet really took from a player with little left", () => {
  expect(eventsOver(shotAtPlayer(3), 30)).toEqual([[{kind: "damageTaken", cause: "bullet", amount: 3}]]);
});

it("reports the ring's damage in every step the player stands outside it", () => {
  const steps = eventsOver({...centred(), ring: ringOn(FAR_CORNER)}, 5);

  expect(steps).toHaveLength(5);
  for (const events of steps) {
    expect(events).toEqual([
      {kind: "damageTaken", cause: "ring", amount: expect.closeTo(MAXIMUM_RING_DAMAGE_PER_SECOND * TICK, 9)},
    ]);
  }
});

it("reports no damage to a player inside the ring", () => {
  expect(eventsOver({...centred(), ring: ringOn(PLAYER_AT)}, 5)).toEqual([]);
});

it("reports no damage when only the opponent stands outside the ring", () => {
  const world = {...sparring(), ring: ringOn({x: 1.5, y: 1.5})};

  expect(eventsOver({...world, player: {...world.player, position: {x: 1.5, y: 1.5}}}, 5)).toEqual([]);
});

it("reports a bullet and the ring in one step as two events, the bullet first", () => {
  const steps = eventsOver({...shotAtPlayer(100), ring: ringOn(FAR_CORNER)}, 30);
  const landed = steps.find(events => events.some(event => event.kind === "damageTaken" && event.cause === "bullet"));

  expect(landed?.map(event => event.kind === "damageTaken" && event.cause)).toEqual(["bullet", "ring"]);
});
