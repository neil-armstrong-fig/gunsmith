import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {World} from "@gunsmith/engine/game-loop/types/World";
import {hitPlacesOfStep} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/hit-places/HitPlacesOfStep";
import type {PracticeRange} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/feedback/hit-places/types/PracticeRange";
import {worldOfScenario} from "@src/game/scenario/WorldOfScenario";

const OPPONENT_HIT: CombatEvent = {kind: "hitLanded", on: "opponent"};
const DUMMY_HIT: CombatEvent = {kind: "hitLanded", on: "dummy"};

/** The world with the player facing `toward`, so that is where they see. */
function facing(world: World, toward: Point): World {
  const {position} = world.player;
  const length = Math.hypot(toward.x - position.x, toward.y - position.y);

  return {
    ...world,
    player: {...world.player, aim: {x: (toward.x - position.x) / length, y: (toward.y - position.y) / length}},
  };
}

/** The practice range, the player facing its first dummy; the second stands behind them, out of sight. */
function practice(): PracticeRange {
  const world = worldOfScenario("practice", 1);
  const [seen, unseen] = world.dummies.map(dummy => dummy.position);
  if (!seen || !unseen) {
    throw new Error("The practice range has fewer than two dummies.");
  }

  return {world: facing(world, seen), seen, unseen};
}

/** `world` with the health of the dummy at `place` lowered by `by`, or the dummy gone when `by` is all it had. */
function withDummyHurt(world: World, place: Point, by: number): World {
  const dummies = world.dummies.flatMap(dummy => {
    if (dummy.position.x !== place.x || dummy.position.y !== place.y) {
      return [dummy];
    }

    if (dummy.health <= by) {
      return [];
    }

    return [{...dummy, health: dummy.health - by}];
  });

  return {...world, dummies};
}

it("has no place for a step in which nothing happened, or only other things", () => {
  const {world} = practice();

  expect(hitPlacesOfStep({before: world, after: world})).toEqual([]);
  expect(
    hitPlacesOfStep({
      before: world,
      after: {
        ...world,
        events: [
          {kind: "damageTaken", cause: "bullet", amount: 20},
          {kind: "fireRefused", reason: "empty"},
        ],
      },
    }),
  ).toEqual([]);
});

it("puts a hit on the opponent where the opponent stands after the step", () => {
  const sparring = worldOfScenario("sparring", 1);
  const opponent = sparring.opponent?.position;
  if (!opponent) {
    throw new Error("Sparring has no opponent.");
  }

  const after = {...facing(sparring, opponent), events: [OPPONENT_HIT]};

  expect(hitPlacesOfStep({before: sparring, after})).toEqual([opponent]);
});

it("puts bullets that land together on the opponent in one place", () => {
  const sparring = worldOfScenario("sparring", 1);
  const opponent = sparring.opponent?.position;
  if (!opponent) {
    throw new Error("Sparring has no opponent.");
  }

  const after = {...facing(sparring, opponent), events: [OPPONENT_HIT, OPPONENT_HIT]};

  expect(hitPlacesOfStep({before: sparring, after})).toEqual([opponent]);
});

it("has no place for an opponent that lost health in a step that reports no hit on it, as when it was hurt out of sight", () => {
  const sparring = worldOfScenario("sparring", 1);
  const {opponent} = sparring;
  if (!opponent) {
    throw new Error("Sparring has no opponent.");
  }

  const after = {...facing(sparring, opponent.position), opponent: {...opponent, health: opponent.health - 10}};

  expect(hitPlacesOfStep({before: sparring, after})).toEqual([]);
});

it("has no place for a hit on an opponent the world no longer has", () => {
  const {world} = practice();

  expect(hitPlacesOfStep({before: world, after: {...world, events: [OPPONENT_HIT]}})).toEqual([]);
});

it("puts a hit on a dummy where the dummy that lost health stands", () => {
  const {world, seen} = practice();
  const after = {...withDummyHurt(world, seen, 10), events: [DUMMY_HIT]};

  expect(hitPlacesOfStep({before: world, after})).toEqual([seen]);
});

it("puts the hit that fells a dummy where the dummy stood, though the world no longer has it", () => {
  const {world, seen} = practice();
  const after = {...withDummyHurt(world, seen, 1000), events: [DUMMY_HIT]};

  expect(after.dummies).toHaveLength(world.dummies.length - 1);
  expect(hitPlacesOfStep({before: world, after})).toEqual([seen]);
});

it("leaves a dummy that lost no health out", () => {
  const {world, seen, unseen} = practice();
  const after = {...withDummyHurt(world, seen, 10), events: [DUMMY_HIT]};

  expect(hitPlacesOfStep({before: world, after})).not.toContainEqual(unseen);
});

it("leaves out a dummy that lost health out of sight, though another was hit in sight in the same step", () => {
  const {world, seen, unseen} = practice();
  const after = {...withDummyHurt(withDummyHurt(world, seen, 10), unseen, 10), events: [DUMMY_HIT]};

  expect(hitPlacesOfStep({before: world, after})).toEqual([seen]);
});

it("has no place for a dummy hurt in a step that reports no hit on one", () => {
  const {world, seen} = practice();

  expect(hitPlacesOfStep({before: world, after: withDummyHurt(world, seen, 10)})).toEqual([]);
});
