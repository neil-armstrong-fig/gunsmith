import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import {actSeek} from "@gunsmith/engine/opponent/state/acting/Seek";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

const hall = arenaFrom([
  "####################",
  "#..................#",
  "#..................#",
  "####################",
]);

// The platform is columns 1 to 6, the stair is column 7 in the top row only (y 3), the low ground is columns 8 to 12.
const terraced = arenaFrom(["##############", "#111111<....##", "#111111.....##", "#111111.....##", "##############"]);
const HERE = {x: 3.5, y: 1.5};
const WEAPON = {x: 12.5, y: 1.5};

it("walks straight to the weapon at the opponent's share of full speed, aiming along the way, and neither fires nor reloads", () => {
  const act = actSeek(seeking(), contextOf({arena: hall, opponent: HERE, weapon: WEAPON}));

  expect(act.input.direction.x).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(act.input.direction.y).toBeCloseTo(0, 9);
  expect(act.input.aimAt).toEqual(WEAPON);
  expect(act.input.firing).toBe(false);
  expect(act.input.reload).toBe(false);
});

it("goes round a drop by its stair, not straight at a weapon on the other level", () => {
  const opponent = {x: 7.5, y: 1.5};
  const weapon = {x: 6.5, y: 1.5};
  const act = actSeek(seeking(), contextOf({arena: terraced, opponent, weapon}));

  expect(act.input.aimAt).not.toEqual(weapon);
  expect(act.input.direction.y).toBeGreaterThan(0);
  expect(act.input.direction.x).toBeCloseTo(0, 9);
});

it("stands still once it is within the arrival radius of the weapon, which is close enough to take it", () => {
  const near = {x: WEAPON.x - DIFFICULTY.arrivalRadius + 0.05, y: WEAPON.y};
  const act = actSeek(seeking(), contextOf({arena: hall, opponent: near, weapon: WEAPON}));

  expect(act.input.direction).toEqual({x: 0, y: 0});
});

it("keeps its brain as it is, since the weapon is its goal and the world holds it", () => {
  const brain = {...seeking(), secondsInState: 0.7};

  expect(actSeek(brain, contextOf({arena: hall, opponent: HERE, weapon: WEAPON})).brain).toBe(brain);
});

it("stands still when no weapon lies in the arena, and leaves the choice of what next to chooseState", () => {
  const brain = seeking();
  const act = actSeek(brain, contextOf({arena: hall, opponent: HERE}));

  expect(act.input).toEqual({direction: {x: 0, y: 0}, firing: false, reload: false});
  expect(act.brain).toBe(brain);
});

interface Places {
  arena: Arena;
  opponent: Point;
  weapon?: Point;
}

function contextOf(places: Places): OpponentContext {
  const world = startingWorld(places.arena, [], places.opponent);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }

  return {
    arena: places.arena,
    opponent: world.opponent,
    target: world.player,
    sees: true,
    seconds: 1 / 60,
    pickup: places.weapon && {position: places.weapon, weapon: SUBMACHINE_GUN},
  };
}

function seeking(): OpponentBrain {
  return {...startingBrain({seed: 1, position: HERE}), state: "seek"};
}
