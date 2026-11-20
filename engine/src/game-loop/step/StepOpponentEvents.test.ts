import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {stepFighters} from "@gunsmith/engine/game-loop/StepFighters";
import type {FighterInputs} from "@gunsmith/engine/game-loop/types/FighterInputs";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {arena} from "@gunsmith/engine/game-loop/step/testing/Arena";
import {IDLE} from "@gunsmith/engine/game-loop/step/testing/Idle";
import {TICK} from "@gunsmith/engine/game-loop/step/testing/Tick";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";

// The first fighter starts at (7.5, 4.5) facing east and the second at (11.5, 4.5) facing west, on one clear row.
const FIGHTERS_APART = {x: 11.5, y: 4.5};
const FIRST_AT = {x: 7.5, y: 4.5};
const FIRING_AT_THE_FIRST: Input = {...IDLE, aimAt: FIRST_AT, firing: true};
const FIRING_AT_THE_SECOND: Input = {...IDLE, aimAt: FIGHTERS_APART, firing: true};

it("tells the second fighter nothing in a quiet step, and nothing in a frozen world", () => {
  const world = startingWorld(arena, [], FIGHTERS_APART);

  expect(stepFighters(world, {first: IDLE, second: IDLE}, TICK).opponentEvents).toBeUndefined();
  expect(stepFighters({...world, round: "won"}, {first: IDLE, second: IDLE}, TICK).opponentEvents).toBeUndefined();
});

it("clears the second fighter's events of the step before in a frozen world", () => {
  const carrying: World = {
    ...startingWorld(arena, [], FIGHTERS_APART),
    round: "won",
    opponentEvents: [{kind: "pickupTaken"}],
  };

  expect(stepFighters(carrying, {first: IDLE, second: IDLE}, TICK).opponentEvents).toBeUndefined();
});

it("tells the second fighter the ring's damage when they stand outside it", () => {
  const ring: Ring = {
    roundSeconds: 100,
    centre: {x: 1.5, y: 1.5},
    startRadius: 12,
    timing: {startDelaySeconds: 10, closingSeconds: 20},
  };
  const after = stepFighters({...startingWorld(arena, [], FIGHTERS_APART), ring}, {first: IDLE, second: IDLE}, TICK);

  expect(after.opponentEvents).toEqual([{kind: "damageTaken", cause: "ring", amount: expect.any(Number)}]);
});

it("tells the second fighter the damage a shot of the first took off them", () => {
  const {opponentEvents} = playUntil({first: FIRING_AT_THE_SECOND, second: IDLE}, events =>
    events.some(event => event.kind === "damageTaken"),
  );

  expect(opponentEvents).toContainEqual({kind: "damageTaken", cause: "bullet", amount: expect.any(Number)});
});

it("tells the first fighter nothing of the second's damage as their own", () => {
  const {events} = playUntil({first: FIRING_AT_THE_SECOND, second: IDLE}, opponentEvents =>
    opponentEvents.some(event => event.kind === "damageTaken"),
  );

  expect(events.filter(event => event.kind === "damageTaken")).toEqual([]);
});

it("confirms the second fighter's hit on the first, as it does the first fighter's hit on the second", () => {
  const {opponentEvents} = playUntil({first: IDLE, second: FIRING_AT_THE_FIRST}, (_events, opponent) =>
    opponent.some(event => event.kind === "hitLanded"),
  );

  expect(opponentEvents).toContainEqual({kind: "hitLanded", on: "opponent"});
});

it("does not confirm a hit on a fighter the shooter, who has turned away since firing, cannot see", () => {
  let world: World = startingWorld(arena, [], FIGHTERS_APART);
  const played: Played = {events: [], opponentEvents: []};
  const turnedAway: Input = {...IDLE, aimAt: {x: 15.5, y: 4.5}};
  for (let tick = 0; tick < 60; tick += 1) {
    world = stepFighters(world, {first: IDLE, second: tick === 0 ? FIRING_AT_THE_FIRST : turnedAway}, TICK);
    played.events.push(...(world.events ?? []));
    played.opponentEvents.push(...(world.opponentEvents ?? []));
  }

  expect(played.events).toContainEqual({kind: "damageTaken", cause: "bullet", amount: expect.any(Number)});
  expect(played.opponentEvents.filter(event => event.kind === "hitLanded")).toEqual([]);
});

it("tells the first fighter which way the second's shot came from, and the second which way the first's did", () => {
  const first = playUntil({first: IDLE, second: FIRING_AT_THE_FIRST}, events =>
    events.some(event => event.kind === "heard"),
  );
  const second = playUntil({first: FIRING_AT_THE_SECOND, second: IDLE}, (_events, opponent) =>
    opponent.some(event => event.kind === "heard"),
  );

  expect(first.events).toContainEqual({kind: "heard", sound: "shot", sector: 2, loudness: "near"});
  expect(second.opponentEvents).toContainEqual({kind: "heard", sound: "shot", sector: 6, loudness: "near"});
});

it("does not tell a fighter their own shot", () => {
  const {events, opponentEvents} = playFrom(
    startingWorld(arena, [], FIGHTERS_APART),
    {first: FIRING_AT_THE_SECOND, second: IDLE},
    1,
  );

  expect(events.filter(event => event.kind === "heard")).toEqual([]);
  expect(opponentEvents.filter(event => event.kind === "heard")).toHaveLength(1);
});

it("tells the second fighter, and not the first, that they took the pickup", () => {
  const lying = {position: {x: 11.5, y: 4.5}, weapon: SUBMACHINE_GUN};
  const world = {...startingWorld(arena, [], FIGHTERS_APART), pickup: lying};

  const after = stepFighters(world, {first: IDLE, second: IDLE}, TICK);

  expect(after.opponentEvents).toEqual([{kind: "pickupTaken"}]);
  expect(after.events).not.toContainEqual({kind: "pickupTaken"});
});

it("tells the other fighter, from where the weapon lay, that a weapon was taken", () => {
  const lying = {position: {x: 11.5, y: 4.5}, weapon: SUBMACHINE_GUN};
  const world = {...startingWorld(arena, [], FIGHTERS_APART), pickup: lying};

  const after = stepFighters(world, {first: IDLE, second: IDLE}, TICK);

  expect(after.events).toEqual([{kind: "heard", sound: "pickup", sector: 2, loudness: "near"}]);
});

it("tells the second fighter a weapon the first took, and not one nobody took", () => {
  const lying = {position: FIRST_AT, weapon: SUBMACHINE_GUN};
  const world = {...startingWorld(arena, [], FIGHTERS_APART), pickup: lying};

  expect(stepFighters(world, {first: IDLE, second: IDLE}, TICK).opponentEvents).toEqual([
    {kind: "heard", sound: "pickup", sector: 6, loudness: "near"},
  ]);
  expect(stepFighters({...world, pickup: undefined}, {first: IDLE, second: IDLE}, TICK).opponentEvents).toBeUndefined();
});

it("tells the other fighter a weapon was taken from where it lay, not from where the taker ends the step", () => {
  const lying = {position: {x: 7.5, y: 4.9}, weapon: SUBMACHINE_GUN};
  const world = {...startingWorld(arena, [], FIGHTERS_APART), pickup: lying};

  const [heard] = stepFighters(world, {first: IDLE, second: IDLE}, TICK).opponentEvents ?? [];

  expect(heard).toMatchObject({sound: "pickup", loudness: "mid"});
});

it("tells the other fighter a footfall from where the walker stands after the step, not where they stood before it", () => {
  const apart = startingWorld(arena, [], {x: 12.9, y: 4.5});
  const world: World = {...apart, elapsedSeconds: 0.15 - TICK / 2};
  const walkingWest: Input = {...IDLE, direction: {x: -1, y: 0}};

  const [heard] = stepFighters(world, {first: IDLE, second: walkingWest}, TICK).events ?? [];

  expect(heard).toMatchObject({sound: "step", loudness: "mid"});
});

it("tells each fighter the other's footfalls while they walk, a stride apart", () => {
  const walkingNorth: Input = {...IDLE, direction: {x: 0, y: 1}};
  const heardByFirst = playFrom(startingWorld(arena, [], FIGHTERS_APART), {first: IDLE, second: walkingNorth}, 30);
  const heardBySecond = playFrom(startingWorld(arena, [], FIGHTERS_APART), {first: walkingNorth, second: IDLE}, 30);

  const stepsOf = (events: CombatEvent[]): CombatEvent[] => events.filter(isFootfall);

  expect(stepsOf(heardByFirst.events).length).toBeGreaterThanOrEqual(2);
  expect(stepsOf(heardByFirst.events).length).toBeLessThanOrEqual(4);
  expect(stepsOf(heardBySecond.opponentEvents).length).toBeGreaterThanOrEqual(2);
  expect(stepsOf(heardByFirst.opponentEvents)).toEqual([]);
});

it("tells nobody the footfalls of a fighter who walks crouched, or who stands still", () => {
  const crouchedNorth: Input = {...IDLE, direction: {x: 0, y: 1}, crouching: true};
  const crouched = playFrom(startingWorld(arena, [], FIGHTERS_APART), {first: IDLE, second: crouchedNorth}, 30);
  const still = playFrom(startingWorld(arena, [], FIGHTERS_APART), {first: IDLE, second: IDLE}, 30);

  expect(crouched.events.filter(isFootfall)).toEqual([]);
  expect(still.events.filter(isFootfall)).toEqual([]);
  expect(still.opponentEvents.filter(isFootfall)).toEqual([]);
});

it("tells nobody the footfalls of a fighter beyond hearing, though a shot from as far away is heard", () => {
  const apart = startingWorld(arena, [], FIGHTERS_APART);
  const world: World = {...apart, player: {...apart.player, position: {x: 1.5, y: 4.5}}};
  const walkingNorth: Input = {...IDLE, direction: {x: 0, y: 1}};

  const walked = playFrom(world, {first: IDLE, second: walkingNorth}, 30);
  const shot = playFrom(world, {first: IDLE, second: {...IDLE, aimAt: {x: 1.5, y: 4.5}, firing: true}}, 3);

  expect(walked.events.filter(isFootfall)).toEqual([]);
  expect(shot.events.filter(event => event.kind === "heard")).toHaveLength(1);
});

function isFootfall(event: CombatEvent): boolean {
  return event.kind === "heard" && event.sound === "step";
}

interface Played {
  events: CombatEvent[];
  opponentEvents: CombatEvent[];
}

function playUntil(
  inputs: FighterInputs,
  done: (events: CombatEvent[], opponentEvents: CombatEvent[]) => boolean,
): Played {
  const played: Played = {events: [], opponentEvents: []};
  let world: World = startingWorld(arena, [], FIGHTERS_APART);
  for (let tick = 0; tick < 300 && !done(played.events, played.opponentEvents); tick += 1) {
    world = stepFighters(world, inputs, TICK);
    played.events.push(...(world.events ?? []));
    played.opponentEvents.push(...(world.opponentEvents ?? []));
  }

  return played;
}

function playFrom(start: World, inputs: FighterInputs, ticks: number): Played {
  const played: Played = {events: [], opponentEvents: []};
  let world = start;
  for (let tick = 0; tick < ticks; tick += 1) {
    world = stepFighters(world, inputs, TICK);
    played.events.push(...(world.events ?? []));
    played.opponentEvents.push(...(world.opponentEvents ?? []));
  }

  return played;
}
