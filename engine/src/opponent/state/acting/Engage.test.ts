import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {aimErrorFor} from "@gunsmith/engine/opponent/state/acting/engage/aim/AimErrorFor";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {actEngage} from "@gunsmith/engine/opponent/state/acting/Engage";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";

const hall = arenaFrom([
  "##############################",
  ...Array.from({length: 10}, () => "#............................#"),
  "##############################",
]);
const TICK = 1 / 60;
const HERE = {x: 5.5, y: 5.5};

const IN_BAND = {x: HERE.x + (DIFFICULTY.nearRange + DIFFICULTY.farRange) / 2, y: HERE.y};

it("stands and faces the player, with its fire held, while it waits out its reaction time", () => {
  const act = actEngage(engaging({reactionRemainingSeconds: 0.3}), contextWith(IN_BAND));

  expect(act.input.direction).toEqual({x: 0, y: 0});
  expect(act.input.firing).toBe(false);
  expect(act.input.aimAt).toEqual(IN_BAND);
});

it("opens fire once the reaction time is over", () => {
  expect(actEngage(engaging(), contextWith(IN_BAND)).input.firing).toBe(true);
});

it("fires bursts as long as the weapon in hand takes to fire its shots, then rests", () => {
  const {fireIntervalSeconds} = equippedWeapon(contextWith(IN_BAND).opponent).weapon;
  let brain = engaging();
  let firingSeconds = 0;
  for (let tick = 0; tick < Math.round(0.9 / TICK); tick++) {
    const act = actEngage(brain, contextWith(IN_BAND));
    brain = act.brain;
    if (act.input.firing) {
      firingSeconds += TICK;
    }
  }

  expect(firingSeconds).toBeCloseTo((DIFFICULTY.burstShots - 0.5) * fireIntervalSeconds, 1);
});

it("does not ask for a reload, which is the reload state's business", () => {
  expect(actEngage(engaging(), contextWith(IN_BAND)).input.reload).toBe(false);
});

it("aims at the player exactly when the roll is zero", () => {
  const act = actEngage(engaging({aimRoll: 0, fireRemainingSeconds: 0.3}), contextWith(IN_BAND));

  expect(act.input.aimAt?.x).toBeCloseTo(IN_BAND.x, 9);
  expect(act.input.aimAt?.y).toBeCloseTo(IN_BAND.y, 9);
});

it("misses by the error its roll and the time it has had the player in sight give", () => {
  const brain = engaging({aimRoll: 0.7, seenSeconds: 0.5, fireRemainingSeconds: 0.3});
  const act = actEngage(brain, contextWith(IN_BAND));
  const aimAt = act.input.aimAt ?? {x: NaN, y: NaN};
  const turned = Math.atan2(aimAt.y - HERE.y, aimAt.x - HERE.x);

  expect(turned).toBeCloseTo(aimErrorFor({seenSeconds: 0.5, roll: 0.7}), 9);
});

it("closes in on a player who is far off", () => {
  const act = actEngage(engaging(), contextWith({x: HERE.x + DIFFICULTY.farRange + 4, y: HERE.y}));

  expect(act.input.direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("backs away from a player who is too close", () => {
  const act = actEngage(engaging(), contextWith({x: HERE.x + DIFFICULTY.nearRange - 1, y: HERE.y}));

  expect(act.input.direction.x).toBeCloseTo(-DIFFICULTY.speedShare, 9);
});

it("circles a player at a good range, on the side it has chosen", () => {
  const left = actEngage(engaging({strafeSide: 1}), contextWith(IN_BAND));
  const right = actEngage(engaging({strafeSide: -1}), contextWith(IN_BAND));

  expect(left.input.direction.y).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(right.input.direction.y).toBeCloseTo(-DIFFICULTY.speedShare, 9);
});

it("changes sides when the time on this one is up, and circles the new way at once", () => {
  const act = actEngage(engaging({strafeSide: 1, strafeRemainingSeconds: 0}), contextWith(IN_BAND));

  expect(act.brain.strafeSide).toBe(-1);
  expect(act.input.direction.y).toBeCloseTo(-DIFFICULTY.speedShare, 9);
});

it("carries its burst clock and strafe clock on in the brain it returns", () => {
  const act = actEngage(engaging({strafeRemainingSeconds: 1.5}), contextWith(IN_BAND));

  expect(act.brain.strafeRemainingSeconds).toBeCloseTo(1.5 - TICK, 9);
  expect(act.brain.fireRemainingSeconds).toBeGreaterThan(0);
});

it("gives the same answer for the same brain and context", () => {
  expect(actEngage(engaging(), contextWith(IN_BAND))).toEqual(actEngage(engaging(), contextWith(IN_BAND)));
});

it("ducks while it rests between bursts, holding still, when a cover block stands beside it on the line to the player", () => {
  const act = actEngage(
    engaging({fireRemainingSeconds: 0, restRemainingSeconds: 0.5}),
    contextWith(IN_BAND, {arena: hallWithABlockBesideIt()}),
  );

  expect(act.input.crouching).toBe(true);
  expect(act.input.firing).toBe(false);
  expect(act.input.direction).toEqual({x: 0, y: 0});
});

it("stands to fire, even with a cover block beside it, because a crouched shooter's bullets stop at the block", () => {
  const act = actEngage(engaging(), contextWith(IN_BAND, {arena: hallWithABlockBesideIt()}));

  expect(act.input.firing).toBe(true);
  expect(act.input.crouching).toBe(false);
});

it("stands while it waits out its reaction time, even with a cover block beside it", () => {
  const act = actEngage(
    engaging({reactionRemainingSeconds: 0.3}),
    contextWith(IN_BAND, {arena: hallWithABlockBesideIt()}),
  );

  expect(act.input.crouching).toBe(false);
});

it("stands through its rest when there is no cover block beside it", () => {
  const act = actEngage(engaging({fireRemainingSeconds: 0, restRemainingSeconds: 0.5}), contextWith(IN_BAND));

  expect(act.input.crouching).toBe(false);
  expect(Math.abs(act.input.direction.y)).toBeCloseTo(DIFFICULTY.speedShare, 9);
});

it("stands through its rest when the cover block is not on the line to the player", () => {
  const playerToTheNorth = {x: HERE.x, y: HERE.y + 4};
  const act = actEngage(
    engaging({fireRemainingSeconds: 0, restRemainingSeconds: 0.5}),
    contextWith(playerToTheNorth, {arena: hallWithABlockBesideIt()}),
  );

  expect(act.input.crouching).toBe(false);
});

it("counts its rest down while it is ducked", () => {
  const act = actEngage(
    engaging({fireRemainingSeconds: 0, restRemainingSeconds: 0.5}),
    contextWith(IN_BAND, {arena: hallWithABlockBesideIt()}),
  );

  expect(act.brain.restRemainingSeconds).toBeCloseTo(0.5 - TICK, 9);
});

function contextWith(playerAt: Point, overrides: Partial<OpponentContext> = {}): OpponentContext {
  const world = startingWorld(hall, [], HERE);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }

  return {
    arena: hall,
    opponent: world.opponent,
    target: {...world.player, position: playerAt},
    sees: true,
    seconds: TICK,
    ...overrides,
  };
}

function engaging(overrides: Partial<OpponentBrain> = {}): OpponentBrain {
  return {
    ...startingBrain({seed: 3, position: HERE}),
    state: "engage",
    reactionRemainingSeconds: 0,
    strafeSide: 1,
    strafeRemainingSeconds: 1.5,
    ...overrides,
  };
}

// The hall with a cover block, two tiles tall so that it is the same whichever way the drawing's rows run, one tile east of the opponent's tile.
function hallWithABlockBesideIt(): Arena {
  const rows = Array.from({length: 10}, (_, row) => {
    if (row === 4 || row === 5) {
      return "#.....c......................#";
    }

    return "#............................#";
  });

  return arenaFrom(["##############################", ...rows, "##############################"]);
}
