import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {giveOpponentBrain} from "@gunsmith/engine/opponent/GiveOpponentBrain";
import {thinkOpponent} from "@gunsmith/engine/opponent/ThinkOpponent";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";

const TICK = 1 / 60;
const room = arenaFrom([
  "########################",
  "#......................#",
  "#......................#",
  "#......................#",
  "#......................#",
  "#......................#",
  "########################",
]);
const wallInTheMiddle = arenaFrom([
  "########################",
  "#..........#...........#",
  "#..........#...........#",
  "#..........#...........#",
  "#..........#...........#",
  "#..........#...........#",
  "########################",
]);

// The player stands at the middle of the arena's centre tile; the opponent four tiles east of that, or where it is told.
function duel(seed = 1, arena = room, opponentAt = {x: 16.5, y: 3.5}): World {
  return giveOpponentBrain(startingWorld(arena, [], opponentAt), seed);
}

function brainOf(world: World): OpponentBrain {
  const decision = thinkOpponent(world, TICK);
  if (!decision.brain) {
    throw new Error("The opponent has no brain.");
  }

  return decision.brain;
}

it("asks for nothing, and has no brain, when the world has no opponent", () => {
  const decision = thinkOpponent(startingWorld(room), TICK);

  expect(decision.input).toEqual({direction: {x: 0, y: 0}, firing: false, reload: false});
  expect(decision.brain).toBeUndefined();
});

it("asks for nothing when the opponent has no brain: a still target", () => {
  const decision = thinkOpponent(startingWorld(room, [], {x: 16.5, y: 3.5}), TICK);

  expect(decision.input).toEqual({direction: {x: 0, y: 0}, firing: false, reload: false});
  expect(decision.brain).toBeUndefined();
});

it("starts to engage a player it can see", () => {
  expect(brainOf(duel()).state).toBe("engage");
});

it("remembers where the player is, and for how long it has seen them", () => {
  const world = duel();
  const brain = brainOf(world);

  expect(brain.lastSeen).toEqual(world.player.position);
  expect(brain.seenSeconds).toBeCloseTo(TICK, 9);
});

it("keeps wandering when a wall is between it and the player", () => {
  const world = duel(1, wallInTheMiddle, {x: 16.5, y: 3.5});
  const decision = thinkOpponent({...world, player: {...world.player, position: {x: 3.5, y: 3.5}}}, TICK);

  expect(decision.brain?.state).toBe("wander");
  expect(decision.input.firing).toBe(false);
});

it("does not fire at a player beyond its sight range", () => {
  const far = arenaFrom(["#".repeat(60), `#${".".repeat(58)}#`, `#${".".repeat(58)}#`, "#".repeat(60)]);
  const world = duel(1, far, {x: 55.5, y: 1.5});
  const decision = thinkOpponent({...world, player: {...world.player, position: {x: 2.5, y: 1.5}}}, TICK);

  expect(decision.brain?.state).toBe("wander");
});

it("holds its fire for its reaction time and then opens fire", () => {
  let world = duel();
  const firstDecision = thinkOpponent(world, TICK);
  expect(firstDecision.input.firing).toBe(false);

  let fired = false;
  for (let tick = 0; tick < Math.round((DIFFICULTY.reactionSeconds + 0.2) / TICK); tick++) {
    const decision = thinkOpponent(world, TICK);
    world = {...world, opponentBrain: decision.brain};
    fired = fired || decision.input.firing;
  }

  expect(fired).toBe(true);
});

it("walks in from outside the closing ring and keeps firing at the player it sees", () => {
  const closed = {
    roundSeconds: 10,
    centre: {x: 6, y: 3.5},
    startRadius: 18,
    timing: {startDelaySeconds: 0, closingSeconds: 10},
  };
  let world = {...duel(), ring: closed};
  let decision = thinkOpponent(world, TICK);
  for (let tick = 0; tick < Math.round((DIFFICULTY.reactionSeconds + 0.2) / TICK); tick++) {
    decision = thinkOpponent(world, TICK);
    world = {...world, opponentBrain: decision.brain};
  }

  expect(decision.brain?.state).toBe("engage");
  expect(decision.input.firing).toBe(true);
  expect(decision.input.direction.x).toBeCloseTo(-DIFFICULTY.speedShare, 9);
  expect(decision.input.aimAt).not.toEqual(closed.centre);
});

it("walks to the ring's centre when it wanders outside the ring and cannot see the player", () => {
  const closed = {
    roundSeconds: 10,
    centre: {x: 6, y: 3.5},
    startRadius: 18,
    timing: {startDelaySeconds: 0, closingSeconds: 10},
  };
  const world = duel(1, room, {x: 16.5, y: 3.5});
  const decision = thinkOpponent({...world, ring: closed, player: {...world.player, position: {x: 2.5, y: 30}}}, TICK);

  expect(decision.brain?.state).toBe("wander");
  expect(decision.input.direction.x).toBeCloseTo(-DIFFICULTY.speedShare, 9);
  expect(decision.input.aimAt).toEqual(closed.centre);
});

it("counts the time it has been in a state", () => {
  let world = duel();
  for (let tick = 0; tick < 3; tick++) {
    world = {...world, opponentBrain: thinkOpponent(world, TICK).brain};
  }

  expect(brainOf(world).secondsInState).toBeCloseTo(4 * TICK, 9);
});

it("starts counting again when the state changes", () => {
  const world = duel();
  const wasWandering = {...world, opponentBrain: world.opponentBrain && {...world.opponentBrain, secondsInState: 3}};

  expect(brainOf(wasWandering).state).toBe("engage");
  expect(brainOf(wasWandering).secondsInState).toBeCloseTo(TICK, 9);
});

it("reloads when its magazine is empty", () => {
  const world = duel();
  const {opponent} = world;
  if (!opponent) {
    throw new Error("The world has no opponent.");
  }
  const loadout = opponent.loadout.map((carried, index) => {
    if (index === 0) {
      return {...carried, rounds: 0};
    }

    return carried;
  });
  const dry = {...world, opponent: {...opponent, loadout}};
  const decision = thinkOpponent(dry, TICK);

  expect(decision.brain?.state).toBe("reload");
  expect(decision.input.reload).toBe(true);
  expect(decision.input.firing).toBe(false);
});

it("gives the same decision for the same world", () => {
  expect(thinkOpponent(duel(5), TICK)).toEqual(thinkOpponent(duel(5), TICK));
});

it("gives a different wander for a different seed", () => {
  const far = arenaFrom(["#".repeat(60), ...Array.from({length: 20}, () => `#${".".repeat(58)}#`), "#".repeat(60)]);
  const goals = new Set<string>();
  for (let seed = 1; seed <= 10; seed++) {
    const world = duel(seed, far, {x: 55.5, y: 5.5});
    const away = {...world, player: {...world.player, position: {x: 2.5, y: 15.5}}};
    const goal = thinkOpponent(away, TICK).brain?.goal;
    goals.add(`${goal?.x},${goal?.y}`);
  }

  expect(goals.size).toBeGreaterThan(5);
});

it("notices that it is stuck and drops the goal it cannot reach", () => {
  const far = arenaFrom(["#".repeat(60), `#${".".repeat(58)}#`, `#${".".repeat(58)}#`, "#".repeat(60)]);
  const world = duel(1, far, {x: 55.5, y: 1.5});
  const away = {...world, player: {...world.player, position: {x: 2.5, y: 1.5}}};
  const wandering = thinkOpponent(away, TICK).brain;
  if (!wandering?.goal) {
    throw new Error("Expected a goal on the first step.");
  }
  const goal = wandering.goal;
  const nearlyStuck = {
    ...away,
    opponentBrain: {...wandering, stuckWatch: {anchor: {x: 55.5, y: 1.5}, seconds: DIFFICULTY.stuckSeconds - TICK / 2}},
  };
  const decision = thinkOpponent(nearlyStuck, TICK);

  expect(decision.brain?.goal).not.toEqual(goal);
  expect(decision.brain?.stuckWatch.seconds).toBe(0);
});

it("notices that it is stuck when it is walking due north, not only east or west", () => {
  const tall = arenaFrom(["#####", ...Array.from({length: 20}, () => "#...#"), "#####"]);
  const world = duel(1, tall, {x: 2.5, y: 2.5});
  const away = {...world, player: {...world.player, position: {x: 2.5, y: 30}}};
  const goal = {x: 2.5, y: 12.5};
  const nearlyStuck = {
    ...away,
    opponentBrain: away.opponentBrain && {
      ...away.opponentBrain,
      goal,
      secondsInState: 1,
      stuckWatch: {anchor: {x: 2.5, y: 2.5}, seconds: DIFFICULTY.stuckSeconds - TICK / 2},
    },
  };
  const decision = thinkOpponent(nearlyStuck, TICK);

  expect(decision.input.direction.y).toBeGreaterThan(0);
  expect(decision.brain?.goal).toBeUndefined();
});

it("plays a searching brain by the search state: it waits at the place it reached", () => {
  const world = duel(1, room, {x: 16.5, y: 3.5});
  const hidden = {...world, player: {...world.player, position: {x: 2.5, y: 30}}};
  const here = hidden.opponent?.position ?? {x: 0, y: 0};
  const searching = {
    ...hidden,
    opponentBrain: hidden.opponentBrain && {
      ...hidden.opponentBrain,
      state: "search" as const,
      goal: here,
      lastSeen: here,
    },
  };
  const decision = thinkOpponent(searching, TICK);

  expect(decision.brain?.state).toBe("search");
  expect(decision.brain?.idleSeconds).toBeCloseTo(TICK, 9);
});
