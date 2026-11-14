import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";
import {actReload} from "@gunsmith/engine/opponent/state/acting/Reload";
import {startingBrain} from "@gunsmith/engine/opponent/brain/StartingBrain";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {Player} from "@gunsmith/engine/player/types/Player";

// A wall block stands in the middle, tiles x 6 to 7 and y 2 to 6, so whoever stands west of it cannot see the east.
const blocked = arenaFrom([
  "##############",
  "#............#",
  "#.....##.....#",
  "#.....##.....#",
  "#.....##.....#",
  "#.....##.....#",
  "#.....##.....#",
  "#............#",
  "##############",
]);
const open = arenaFrom([
  "##############",
  "#............#",
  "#............#",
  "#............#",
  "#............#",
  "##############",
]);
const TICK = 1 / 60;
const HERE = {x: 3.5, y: 4.5};
const PLAYER = {x: 10.5, y: 4.5};

function contextIn(arena: Arena, overrides: Partial<OpponentContext> = {}, dry = true): OpponentContext {
  const world = startingWorld(arena, [], HERE);
  if (!world.opponent) {
    throw new Error("The world has no opponent.");
  }
  const loadout = world.opponent.loadout.map((carried, index) => {
    if (index === 0 && dry) {
      return {...carried, rounds: 0};
    }

    return carried;
  });

  return {
    arena,
    opponent: {...world.opponent, loadout},
    target: {...world.player, position: PLAYER},
    sees: true,
    seconds: TICK,
    ...overrides,
  };
}

function reloading(overrides: Partial<OpponentBrain> = {}): OpponentBrain {
  return {...startingBrain({seed: 1, position: HERE}), state: "reload", ...overrides};
}

function emptied(opponent: Player, slots: readonly number[]): Player {
  const loadout = opponent.loadout.map((carried, index) => {
    if (slots.includes(index)) {
      return {...carried, rounds: 0, reserve: 0};
    }

    return carried;
  });

  return {...opponent, loadout};
}

it("asks for a reload", () => {
  expect(actReload(reloading(), contextIn(blocked)).input.reload).toBe(true);
});

it("never fires", () => {
  expect(actReload(reloading(), contextIn(blocked)).input.firing).toBe(false);
});

it("looks for cover when it sees the player and has none yet, and heads for it", () => {
  let found = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const act = actReload(reloading({seed}), contextIn(blocked));
    const {goal} = act.brain;
    if (goal) {
      found++;
      expect(hasClearLine(solidTilesOf(blocked), PLAYER, goal)).toBe(false);
      if (Math.hypot(goal.x - HERE.x, goal.y - HERE.y) >= DIFFICULTY.arrivalRadius) {
        expect(act.input.direction.x === 0 && act.input.direction.y === 0).toBe(false);
      }
    }
  }

  expect(found).toBeGreaterThan(14);
});

it("keeps the cover it has chosen, and does not look again", () => {
  const goal = {x: 1.5, y: 4.5};
  const act = actReload(reloading({goal}), contextIn(blocked));

  expect(act.brain.goal).toEqual(goal);
  expect(act.brain.seed).toBe(1);
  expect(act.input.direction.x).toBeLessThan(0);
});

it("stands still once it has reached its cover", () => {
  const act = actReload(reloading({goal: {x: HERE.x + 0.1, y: HERE.y}}), contextIn(blocked));

  expect(act.input.direction).toEqual({x: 0, y: 0});
});

it("keeps its eyes on the player while it can see them", () => {
  const act = actReload(reloading({goal: {x: 1.5, y: 4.5}}), contextIn(blocked));

  expect(act.input.aimAt).toEqual(PLAYER);
});

it("circles in the open when there is nowhere to hide, rather than standing still", () => {
  const act = actReload(reloading(), contextIn(open));

  expect(act.brain.goal).toBeUndefined();
  expect(Math.abs(act.input.direction.y)).toBeCloseTo(DIFFICULTY.speedShare, 9);
  expect(act.input.direction.x).toBeCloseTo(0, 9);
});

it("reloads where it stands, without looking for cover, when it cannot see the player", () => {
  const act = actReload(reloading(), contextIn(blocked, {sees: false}));

  expect(act.brain.goal).toBeUndefined();
  expect(act.brain.seed).toBe(1);
  expect(act.input.direction).toEqual({x: 0, y: 0});
  expect(act.input.reload).toBe(true);
});

it("switches to its other weapon when the one in hand has nothing left, rather than wait on a reload that cannot come", () => {
  const context = contextIn(blocked);
  const dry = {...context, opponent: emptied(context.opponent, [0])};
  const act = actReload(reloading(), dry);

  expect(act.input.switchTo).toBe(2);
  expect(act.input.reload).toBe(false);
});

it("reloads the weapon in hand while it still has a reserve, and does not switch", () => {
  const act = actReload(reloading(), contextIn(blocked));

  expect(act.input.switchTo).toBeUndefined();
  expect(act.input.reload).toBe(true);
});

it("has nothing to switch to when every weapon is empty, and keeps asking to reload", () => {
  const context = contextIn(blocked);
  const dry = {...context, opponent: emptied(context.opponent, [0, 1])};
  const act = actReload(reloading(), dry);

  expect(act.input.switchTo).toBeUndefined();
  expect(act.input.reload).toBe(true);
});

it("gives the same answer for the same brain and context", () => {
  expect(actReload(reloading({seed: 4}), contextIn(blocked))).toEqual(
    actReload(reloading({seed: 4}), contextIn(blocked)),
  );
});
