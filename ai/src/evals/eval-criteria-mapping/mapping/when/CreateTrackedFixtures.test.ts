import {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";
import {ArenaSubmissionDsl} from "@evals/dsl/arena-submission/ArenaSubmissionDsl";
import {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";
import {createEvalDrivers} from "@evals/eval-criteria-mapping/drivers/CreateEvalDrivers";
import {createTrackedFixtures} from "@evals/eval-criteria-mapping/mapping/when/CreateTrackedFixtures";

it("hands a `when` one DSL of each domain", () => {
  const {weaponSmith, appearance, arena, arenaSubmission} = createTrackedFixtures(
    createEvalDrivers("fake", undefined),
  ).fixtures;

  expect(weaponSmith).toBeInstanceOf(WeaponDsl);
  expect(appearance).toBeInstanceOf(AppearanceDsl);
  expect(arena).toBeInstanceOf(ArenaDsl);
  expect(arenaSubmission).toBeInstanceOf(ArenaSubmissionDsl);
});

it("gives every `when` DSLs of its own, so its `then`s share their answers and no other `when` does", () => {
  const drivers = createEvalDrivers("fake", undefined);

  const first = createTrackedFixtures(drivers).fixtures;
  const second = createTrackedFixtures(drivers).fixtures;

  expect(first.arena).not.toBe(second.arena);
  expect(first.weaponSmith).not.toBe(second.weaponSmith);
});

it("records which DSL the body took, and none until it takes one", () => {
  const tracked = createTrackedFixtures(createEvalDrivers("fake", undefined));
  expect(tracked.taken()).toEqual([]);

  expect(tracked.fixtures.appearance).toBeDefined();

  expect(tracked.taken()).toEqual(["appearance"]);
});
