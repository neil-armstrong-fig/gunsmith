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
import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {DamageTakenEvent} from "@gunsmith/engine/combat-events/types/DamageTakenEvent";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import {OPPONENT_HEALTH} from "@gunsmith/engine/health/OpponentHealth";
import type {Ring} from "@gunsmith/engine/ring/types/Ring";
import {MAXIMUM_RING_DAMAGE_PER_SECOND} from "@gunsmith/engine/ring/damage/rate/MaximumRingDamage";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

const RING_DAMAGE_PER_TICK = MAXIMUM_RING_DAMAGE_PER_SECOND * TICK;

// The player stands at 7.5, 4.5. A ring closed to its smallest, centred in the far corner, leaves the player outside it.
const RING_AWAY_FROM_PLAYER: Ring = {
  roundSeconds: 100,
  centre: {x: 1.5, y: 1.5},
  startRadius: 12,
  timing: {startDelaySeconds: 10, closingSeconds: 20},
};

const EAST = firingAt({x: 20, y: 4.5});

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

  expect(shot.events).toEqual([{kind: "shotFired"}]);
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

it("reports the damage a bullet does to the player, with its cause", () => {
  const events = eventsWhilePlaying(shotAtPlayer(100), 30);

  expect(damageTakenIn(events)).toEqual([{kind: "damageTaken", cause: "bullet", amount: RIFLE.bulletDamage}]);
});

it("reports only the health the bullet really took from a player with less left", () => {
  const events = eventsWhilePlaying(shotAtPlayer(10), 30);

  expect(damageTakenIn(events)).toEqual([{kind: "damageTaken", cause: "bullet", amount: 10}]);
});

it("reports bullets that land together as one loss", () => {
  const world = bulletsOnPlayer(100, [RIFLE.bulletDamage, 5]);
  const after = step(world, IDLE, TICK);

  expect(damageTakenIn(after.events)).toEqual([{kind: "damageTaken", cause: "bullet", amount: RIFLE.bulletDamage + 5}]);
});

it("reports the ring's damage on every step the player stands outside it", () => {
  const first = step({...centred(), ring: RING_AWAY_FROM_PLAYER}, IDLE, TICK);
  const second = step(first, IDLE, TICK);
  const loss = [{kind: "damageTaken", cause: "ring", amount: expect.closeTo(RING_DAMAGE_PER_TICK, 9)}];

  expect(first.events).toEqual(loss);
  expect(second.events).toEqual(loss);
});

it("reports no ring damage to a player inside the ring", () => {
  const inside = {...centred(), ring: {...RING_AWAY_FROM_PLAYER, centre: {x: 7.5, y: 4.5}}};

  expect(step(inside, IDLE, TICK).events).toBeUndefined();
});

it("reports no ring damage before the ring has started", () => {
  const early = {...centred(), ring: {...RING_AWAY_FROM_PLAYER, roundSeconds: 0}};

  expect(step(early, IDLE, TICK).events).toBeUndefined();
});

it("reports a bullet and the ring in one step as two losses that add up to what the player really lost", () => {
  const world = {...bulletsOnPlayer(100, [RIFLE.bulletDamage]), ring: RING_AWAY_FROM_PLAYER};
  const after = step(world, IDLE, TICK);
  const [bullet, ring] = damageTakenIn(after.events);

  expect(damageTakenIn(after.events)).toHaveLength(2);
  expect(bullet).toEqual({kind: "damageTaken", cause: "bullet", amount: RIFLE.bulletDamage});
  expect(ring?.cause).toBe("ring");
  expect((bullet?.amount ?? 0) + (ring?.amount ?? 0)).toBeCloseTo(100 - after.player.health, 9);
});

it("gives the bullet its damage first and the ring only what health is left", () => {
  const world = {...bulletsOnPlayer(RIFLE.bulletDamage + 0.1, [RIFLE.bulletDamage]), ring: RING_AWAY_FROM_PLAYER};
  const [bullet, ring] = damageTakenIn(step(world, IDLE, TICK).events);

  expect(bullet?.amount).toBe(RIFLE.bulletDamage);
  expect(ring?.amount).toBeCloseTo(0.1, 9);
});

it("reports nothing when only the opponent is hurt by a bullet", () => {
  const bullet: Bullet = {
    position: {x: 11.2, y: 4.5},
    direction: {x: 1, y: 0},
    damage: RIFLE.bulletDamage,
    speed: RIFLE.bulletSpeed,
    shooter: "player",
    level: 0,
    crouching: false,
  };
  const after = step({...sparring(), bullets: [bullet]}, IDLE, TICK);

  expect(after.opponent?.health).toBeLessThan(OPPONENT_HEALTH);
  expect(damageTakenIn(after.events)).toEqual([]);
});

it("reports nothing when only the opponent is hurt by the ring", () => {
  const ringOnPlayer = {...RING_AWAY_FROM_PLAYER, centre: {x: 7.5, y: 4.5}};
  const after = step({...sparring(), ring: ringOnPlayer}, IDLE, TICK);

  expect(after.opponent?.health).toBeLessThan(OPPONENT_HEALTH);
  expect(damageTakenIn(after.events)).toEqual([]);
});

it("reports no damage into a frozen round", () => {
  const frozen: World = {...bulletsOnPlayer(100, [RIFLE.bulletDamage]), round: "lost"};

  expect(step(frozen, IDLE, TICK).events).toBeUndefined();
});

it("reports a hit landed when the player's bullet reaches an opponent in sight", () => {
  const after = step({...sparring(), bullets: [playerBulletAt(11.2)]}, IDLE, TICK);

  expect(after.opponent?.health).toBeLessThan(OPPONENT_HEALTH);
  expect(after.events).toEqual([{kind: "hitLanded", on: "opponent"}]);
});

it("reports a hit landed for each bullet that lands together", () => {
  const after = step({...sparring(), bullets: [playerBulletAt(11.2), playerBulletAt(11.1)]}, IDLE, TICK);

  expect(after.events).toEqual([
    {kind: "hitLanded", on: "opponent"},
    {kind: "hitLanded", on: "opponent"},
  ]);
});

it("reports no hit landed when the opponent is hurt out of sight, and nothing else about it", () => {
  const behind = sparring();
  const world = {...behind, player: {...behind.player, aim: {x: -1, y: 0}}, bullets: [playerBulletAt(11.2)]};
  const after = step(world, IDLE, TICK);

  expect(after.opponent?.health).toBeLessThan(OPPONENT_HEALTH);
  expect(after.events).toBeUndefined();
});

it("judges what the player sees as the step leaves them, so a turn toward the opponent in the same step counts", () => {
  const behind = sparring();
  const looking = {...behind, player: {...behind.player, aim: {x: -1, y: 0}}, bullets: [playerBulletAt(11.2)]};
  const turning = step(looking, {...IDLE, aimAt: {x: 20, y: 4.5}}, TICK);
  const notTurning = step(looking, IDLE, TICK);

  expect(turning.events).toEqual([{kind: "hitLanded", on: "opponent"}]);
  expect(notTurning.events).toBeUndefined();
});

it("reports the same events whether or not an opponent out of sight was hit", () => {
  const behind = sparring();
  const looking = {...behind, player: {...behind.player, aim: {x: -1, y: 0}}};
  const hit = step({...looking, bullets: [playerBulletAt(11.2)]}, IDLE, TICK);
  const missed = step({...looking, bullets: []}, IDLE, TICK);

  expect(hit.events).toEqual(missed.events);
});

it("reports a hit landed when the player's bullet reaches a dummy in sight, even one it knocks down", () => {
  const dummies = startingWorld(arena, [{x: 11.5, y: 4.5}]);
  const hurt = step({...dummies, bullets: [playerBulletAt(11.2)]}, IDLE, TICK);
  const felled = step({...dummies, bullets: [{...playerBulletAt(11.2), damage: 1000}]}, IDLE, TICK);

  expect(hurt.dummies).toHaveLength(1);
  expect(hurt.events).toEqual([{kind: "hitLanded", on: "dummy"}]);
  expect(felled.dummies).toEqual([]);
  expect(felled.events).toEqual([{kind: "hitLanded", on: "dummy"}]);
});

it("reports no hit landed on a dummy out of sight", () => {
  const dummies = startingWorld(arena, [{x: 11.5, y: 4.5}]);
  const world = {...dummies, player: {...dummies.player, aim: {x: -1, y: 0}}, bullets: [playerBulletAt(11.2)]};
  const after = step(world, IDLE, TICK);

  expect(after.dummies[0]?.health).toBeLessThan(DUMMY_HEALTH);
  expect(after.events).toBeUndefined();
});

it("reports no hit landed for the opponent's bullets, which hurt the player", () => {
  const events = eventsWhilePlaying(shotAtPlayer(100), 30);

  expect(events.some(event => event.kind === "hitLanded")).toBe(false);
});

/** A player's bullet at `x` on the row of the opponent, flying east and about to land on a target at 11.5. */
function playerBulletAt(x: number): Bullet {
  return {
    position: {x, y: 4.5},
    direction: {x: 1, y: 0},
    damage: RIFLE.bulletDamage,
    speed: RIFLE.bulletSpeed,
    shooter: "player",
    level: 0,
    crouching: false,
  };
}

/** Opponent's bullets one step from the player at 7.5, 4.5, one for each damage, flying west. */
function bulletsOnPlayer(health: number, damages: readonly number[]): World {
  const world = shotAtPlayer(health);
  const bullets = damages.map((damage, index): Bullet => ({
    position: {x: 7.9 + index * 0.01, y: 4.5},
    direction: {x: -1, y: 0},
    damage,
    speed: RIFLE.bulletSpeed,
    shooter: "opponent",
    level: 0,
    crouching: false,
  }));

  return {...world, bullets};
}

/** Plays `ticks` steps and gathers every event any of them reported. */
function eventsWhilePlaying(world: World, ticks: number): CombatEvent[] {
  const events: CombatEvent[] = [];
  let later = world;
  for (let tick = 0; tick < ticks; tick += 1) {
    later = step(later, IDLE, TICK);
    events.push(...(later.events ?? []));
  }

  return events;
}

function damageTakenIn(events: readonly CombatEvent[] | undefined): DamageTakenEvent[] {
  return (events ?? []).filter(event => event.kind === "damageTaken");
}

/** The player with an empty magazine in every weapon and `reserve` rounds behind each. */
function dry(world: World, reserve: number): World {
  return {
    ...world,
    player: {...world.player, loadout: world.player.loadout.map(carried => ({...carried, rounds: 0, reserve}))},
  };
}
