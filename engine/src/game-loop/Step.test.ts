import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {fireBullet} from "@gunsmith/engine/bullet/FireBullet";
import {DUMMY_HEALTH} from "@gunsmith/engine/dummy/DummyHealth";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {step} from "@gunsmith/engine/game-loop/Step";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

const arena = arenaFrom([
  "###############",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "#.............#",
  "###############",
]);
const TICK = 1 / 60;

function walking(x: number, y: number): Input {
  return {direction: {x, y}, firing: false, reload: false};
}

function centred(): World {
  return startingWorld(arena);
}

it("leaves the player where they are when nothing is held", () => {
  const world = centred();

  expect(step(world, walking(0, 0), TICK).player.position).toEqual(world.player.position);
});

it("moves the player east at the player speed", () => {
  const world = centred();
  const after = step(world, walking(1, 0), TICK);

  expect(after.player.position.x - world.player.position.x).toBeCloseTo(PLAYER_SPEED * TICK, 9);
  expect(after.player.position.y).toBe(world.player.position.y);
});

it("moves the player north when y is positive", () => {
  const world = centred();

  expect(step(world, walking(0, 1), TICK).player.position.y).toBeGreaterThan(world.player.position.y);
});

it("goes no faster on a diagonal", () => {
  const world = centred();
  const after = step(world, walking(1, 1), TICK);
  const travelled = Math.hypot(
    after.player.position.x - world.player.position.x,
    after.player.position.y - world.player.position.y,
  );

  expect(travelled).toBeCloseTo(PLAYER_SPEED * TICK, 9);
});

it("goes no faster when the input asks for more than full speed", () => {
  const world = centred();
  const after = step(world, walking(50, 0), TICK);

  expect(after.player.position.x - world.player.position.x).toBeCloseTo(PLAYER_SPEED * TICK, 9);
});

it("advances the clock by the time stepped", () => {
  expect(step(centred(), walking(0, 0), TICK).elapsedSeconds).toBeCloseTo(TICK, 12);
});

it("does not change the world it was given", () => {
  const world = centred();
  const before = structuredClone(world);

  step(world, walking(1, 0), TICK);

  expect(world).toEqual(before);
});

it("stops the player at the east wall, however long east is held", () => {
  let world = centred();
  for (let tick = 0; tick < 600; tick += 1) {
    world = step(world, walking(1, 0), TICK);
  }

  expect(world.player.position.x).toBeLessThan(14);
  expect(world.player.position.x).toBeGreaterThan(13);
});

it("stops the player at the north wall", () => {
  let world = centred();
  for (let tick = 0; tick < 600; tick += 1) {
    world = step(world, walking(0, 1), TICK);
  }

  expect(world.player.position.y).toBeLessThan(8);
  expect(world.player.position.y).toBeGreaterThan(7);
});

it("slides along a wall instead of sticking to it", () => {
  let world: World = {...centred(), player: {...centred().player, position: {x: 13.6, y: 4.5}}};
  for (let tick = 0; tick < 30; tick += 1) {
    world = step(world, walking(1, 1), TICK);
  }

  expect(world.player.position.x).toBeLessThan(14);
  expect(world.player.position.y).toBeGreaterThan(5);
});

it("plays the same way every time from the same inputs", () => {
  function play(): World {
    let world = centred();
    for (let tick = 0; tick < 200; tick += 1) {
      world = step(world, walking(Math.sin(tick), Math.cos(tick)), TICK);
    }

    return world;
  }

  expect(play()).toEqual(play());
});

const IDLE: Input = {direction: {x: 0, y: 0}, firing: false, reload: false};

function firingAt(target: {x: number; y: number}): Input {
  return {...IDLE, aimAt: target, firing: true};
}

it("turns the player to face the point being aimed at", () => {
  const world = step(centred(), {...IDLE, aimAt: {x: 7.5, y: 14}}, TICK);

  expect(world.player.aim.x).toBeCloseTo(0, 9);
  expect(world.player.aim.y).toBeCloseTo(1, 9);
});

it("keeps facing the same way when nothing is aimed at", () => {
  const turned = step(centred(), {...IDLE, aimAt: {x: 0, y: 7.5}}, TICK);

  expect(step(turned, IDLE, TICK).player.aim).toEqual(turned.player.aim);
});

it("fires no bullet when the trigger is not held", () => {
  expect(step(centred(), IDLE, TICK).bullets).toEqual([]);
});

it("fires one bullet the way the player is aiming when the trigger is held", () => {
  const [bullet] = step(centred(), firingAt({x: 7.5, y: 14}), TICK).bullets;

  expect(bullet?.direction.x).toBeCloseTo(0, 9);
  expect(bullet?.direction.y).toBeCloseTo(1, 9);
  expect(bullet?.position.y).toBeGreaterThan(centred().player.position.y);
});

it("fires from the player's own position, including after they have walked", () => {
  const walked: World = {...centred(), player: {...centred().player, position: {x: 3.5, y: 2.5}}};
  const [bullet] = step(walked, firingAt({x: 3.5, y: 14}), TICK).bullets;

  expect(bullet?.position.x).toBeCloseTo(3.5, 9);
});

it("will not fire a second bullet on the very next step, however long the trigger is held", () => {
  const first = step(centred(), firingAt({x: 7.5, y: 14}), TICK);

  expect(step(first, firingAt({x: 7.5, y: 14}), TICK).bullets).toHaveLength(1);
});

it("fires again once the weapon has cooled down, while the first bullet is still flying", () => {
  const east = {x: 20, y: 4.5};
  let world = step(centred(), firingAt(east), TICK);
  for (let tick = 0; tick < 16; tick += 1) {
    world = step(world, firingAt(east), TICK);
  }

  expect(world.bullets).toHaveLength(2);
});

it("flies a bullet on at the bullet speed on later steps", () => {
  const fired = step(centred(), firingAt({x: 7.5, y: 14}), TICK);
  const later = step(fired, IDLE, TICK);

  expect((later.bullets[0]?.position.y ?? 0) - (fired.bullets[0]?.position.y ?? 0)).toBeCloseTo(
    RIFLE.bulletSpeed * TICK,
    9,
  );
});

it("removes a bullet when it hits the wall", () => {
  let world = step(centred(), firingAt({x: 7.5, y: 14}), TICK);
  for (let tick = 0; tick < 120; tick += 1) {
    world = step(world, IDLE, TICK);
  }

  expect(world.bullets).toEqual([]);
});

it("does not fire a bullet that would start inside a wall", () => {
  const againstWall: World = {...centred(), player: {...centred().player, position: {x: 14 - 0.4, y: 4.5}}};
  const fired = step(againstWall, firingAt({x: 20, y: 4.5}), TICK);

  expect(step(fired, IDLE, TICK).bullets).toEqual([]);
});

it("starts a new bullet at the muzzle of the player where they now stand, and does not move it until the next step", () => {
  const east = {x: 20, y: 4.5};
  const after = step(centred(), {...IDLE, direction: {x: 1, y: 0}, aimAt: east, firing: true}, TICK);

  expect(after.bullets[0]?.position).toEqual(fireBullet(after.player.position, after.player.aim, RIFLE).position);
});

// The player starts at (7.5, 4.5) facing east; four tiles east of that is a dummy on the same row.
function withDummyEast(): World {
  return startingWorld(arena, [{x: 11.5, y: 4.5}]);
}

/** Holds the trigger toward the east for `heldTicks` steps, then lets go for `idleTicks` more. */
function shoot(world: World, heldTicks: number, idleTicks: number): World {
  let later = world;
  for (let tick = 0; tick < heldTicks; tick += 1) {
    later = step(later, firingAt({x: 20, y: 4.5}), TICK);
  }

  for (let tick = 0; tick < idleTicks; tick += 1) {
    later = step(later, IDLE, TICK);
  }

  return later;
}

it("hurts a dummy the player shoots at", () => {
  const after = shoot(withDummyEast(), 1, 30);

  expect(after.dummies[0]?.health).toBe(DUMMY_HEALTH - RIFLE.bulletDamage);
});

it("uses up the bullet that hit the dummy, well before the wall would have", () => {
  // The dummy is two tiles from the muzzle; the wall is six. After 0.1 s a free bullet would be two tiles out, past the dummy.
  const near = startingWorld(arena, [{x: 9.5, y: 4.5}]);

  expect(shoot(near, 1, 6).bullets).toEqual([]);
  expect(shoot(startingWorld(arena), 1, 6).bullets).toHaveLength(1);
});

it("takes the dummy out of the world once enough shots have landed", () => {
  expect(withDummyEast().dummies).toHaveLength(1);
  expect(shoot(withDummyEast(), 180, 0).dummies).toEqual([]);
});

it("does not hurt a dummy that is not in the line of fire", () => {
  const aside = startingWorld(arena, [{x: 11.5, y: 7}]);

  expect(shoot(aside, 1, 30).dummies[0]?.health).toBe(DUMMY_HEALTH);
});

it("does not change the dummies of the world it was given", () => {
  const world = withDummyEast();
  const before = structuredClone(world);

  shoot(world, 60, 0);

  expect(world).toEqual(before);
});

// The weapons: the player carries the rifle in slot 1 and the marksman rifle in slot 2, both full.

const EAST = {x: 20, y: 4.5};

function withPlayer(world: World, changes: Partial<Player>): World {
  return {...world, player: {...world.player, ...changes}};
}

/** The world with `rounds` in the magazine of the weapon at `index`. */
function withRounds(world: World, index: number, rounds: number): World {
  const loadout = world.player.loadout.map((carried, at) => {
    if (at === index) {
      return {...carried, rounds};
    }

    return carried;
  });

  return withPlayer(world, {loadout});
}

/** Plays `ticks` steps of `input`. */
function playTicks(world: World, input: Input, ticks: number): World {
  let later = world;
  for (let tick = 0; tick < ticks; tick += 1) {
    later = step(later, input, TICK);
  }

  return later;
}

it("spends a round from the magazine when it fires", () => {
  const after = step(centred(), firingAt(EAST), TICK);

  expect(after.player.loadout[0]?.rounds).toBe(RIFLE.magazineSize - 1);
});

it("spends no round when the trigger is not held", () => {
  expect(step(centred(), IDLE, TICK).player.loadout[0]?.rounds).toBe(RIFLE.magazineSize);
});

it("spends nothing from the weapon that is not equipped", () => {
  expect(step(centred(), firingAt(EAST), TICK).player.loadout[1]?.rounds).toBe(MARKSMAN_RIFLE.magazineSize);
});

it("fires the last round in the magazine", () => {
  const after = step(withRounds(centred(), 0, 1), firingAt(EAST), TICK);

  expect(after.bullets).toHaveLength(1);
  expect(after.player.loadout[0]?.rounds).toBe(0);
});

it("does not fire with an empty magazine, however long the trigger is held", () => {
  const after = playTicks(withRounds(centred(), 0, 0), firingAt(EAST), 60);

  expect(after.bullets).toEqual([]);
  expect(after.player.loadout[0]?.rounds).toBe(0);
});

it("stops firing when the magazine runs out, and has fired exactly the magazine", () => {
  const after = playTicks(centred(), firingAt(EAST), 600);

  expect(after.player.loadout[0]?.rounds).toBe(0);
  expect(after.player.loadout[0]?.reserve).toBe(RIFLE.startingReserve);
});

it("equips the weapon in slot 2 when asked", () => {
  expect(step(centred(), {...IDLE, switchTo: 2}, TICK).player.equippedIndex).toBe(1);
});

it("keeps the first weapon equipped when it is asked for a slot it does not have", () => {
  expect(step(centred(), {...IDLE, switchTo: 9}, TICK).player.equippedIndex).toBe(0);
});

it("fires a bullet with the damage and speed of the weapon in hand", () => {
  const [bullet] = step(centred(), {...firingAt(EAST), switchTo: 2}, TICK).bullets;

  expect(bullet?.damage).toBe(MARKSMAN_RIFLE.bulletDamage);
  expect(bullet?.speed).toBe(MARKSMAN_RIFLE.bulletSpeed);
});

it("fires a bullet from the rifle with the rifle's damage and speed to begin with", () => {
  const [bullet] = step(centred(), firingAt(EAST), TICK).bullets;

  expect(bullet?.damage).toBe(RIFLE.bulletDamage);
  expect(bullet?.speed).toBe(RIFLE.bulletSpeed);
});

it("spends the round from the weapon in hand, and cools down for that weapon's fire interval", () => {
  const after = step(centred(), {...firingAt(EAST), switchTo: 2}, TICK);

  expect(after.player.loadout[1]?.rounds).toBe(MARKSMAN_RIFLE.magazineSize - 1);
  expect(after.player.loadout[0]?.rounds).toBe(RIFLE.magazineSize);
  expect(after.player.cooldownSeconds).toBe(MARKSMAN_RIFLE.fireIntervalSeconds);
});

it("does not let a switch dodge the cool-down of the shot just fired", () => {
  const fired = step(centred(), firingAt(EAST), TICK);

  expect(step(fired, {...firingAt(EAST), switchTo: 2}, TICK).bullets).toHaveLength(1);
});

it("hurts a dummy by the damage of the weapon that shot it", () => {
  const switched = step(withDummyEast(), {...IDLE, switchTo: 2}, TICK);

  expect(shoot(switched, 1, 30).dummies[0]?.health).toBe(DUMMY_HEALTH - MARKSMAN_RIFLE.bulletDamage);
});

it("starts a reload when asked, and the magazine is not filled yet", () => {
  const after = step(withRounds(centred(), 0, 3), {...IDLE, reload: true}, TICK);

  expect(after.player.reloadRemainingSeconds).toBe(RIFLE.reloadSeconds);
  expect(after.player.loadout[0]?.rounds).toBe(3);
});

it("fills the magazine from the reserve once the reload time has passed, and not before", () => {
  const started = step(withRounds(centred(), 0, 3), {...IDLE, reload: true}, TICK);
  const justBefore = playTicks(started, IDLE, Math.floor((RIFLE.reloadSeconds - 0.1) / TICK));
  const justAfter = playTicks(started, IDLE, Math.ceil((RIFLE.reloadSeconds + 0.1) / TICK));

  expect(justBefore.player.loadout[0]?.rounds).toBe(3);
  expect(justBefore.player.reloadRemainingSeconds).toBeDefined();
  expect(justAfter.player.loadout[0]).toEqual({
    weapon: RIFLE,
    rounds: RIFLE.magazineSize,
    reserve: RIFLE.startingReserve - (RIFLE.magazineSize - 3),
  });
  expect(justAfter.player.reloadRemainingSeconds).toBeUndefined();
});

it("does not fire while reloading, even with the trigger held", () => {
  const after = playTicks(withRounds(centred(), 0, 3), {...firingAt(EAST), reload: true}, 30);

  expect(after.bullets).toEqual([]);
  expect(after.player.loadout[0]?.rounds).toBe(3);
});

it("fires on the very step the reload finishes", () => {
  const nearlyDone = withPlayer(withRounds(centred(), 0, 0), {reloadRemainingSeconds: 0.001});
  const after = step(nearlyDone, firingAt(EAST), TICK);

  expect(after.bullets).toHaveLength(1);
  expect(after.player.loadout[0]?.rounds).toBe(RIFLE.magazineSize - 1);
});

it("cancels a reload when the weapon is switched", () => {
  const reloading = withPlayer(withRounds(centred(), 0, 3), {reloadRemainingSeconds: 1});
  const after = step(reloading, {...IDLE, switchTo: 2}, TICK);

  expect(after.player.equippedIndex).toBe(1);
  expect(after.player.reloadRemainingSeconds).toBeUndefined();
  expect(after.player.loadout[0]?.rounds).toBe(3);
});

it("lets the switch land first when it is asked for with a reload, so the reload is the new weapon's", () => {
  const reloading = withPlayer(withRounds(withRounds(centred(), 0, 3), 1, 1), {reloadRemainingSeconds: 1});
  const after = step(reloading, {...IDLE, switchTo: 2, reload: true}, TICK);

  expect(after.player.equippedIndex).toBe(1);
  expect(after.player.reloadRemainingSeconds).toBe(MARKSMAN_RIFLE.reloadSeconds);
});
