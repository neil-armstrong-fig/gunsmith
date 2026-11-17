import {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";
import {TrackedFixtures} from "@evals/eval-criteria-mapping/fixtures/TrackedFixtures";

function trackedFixtures(): TrackedFixtures {
  const notAsked = (): Promise<never> => Promise.reject(new Error("not asked"));

  return new TrackedFixtures({
    weaponSmith: new WeaponSmithDsl({trials: 1, run: notAsked}),
    appearance: new AppearanceDsl({trials: 1, run: notAsked}),
  });
}

function descriptions(tracked: TrackedFixtures): string[] {
  return tracked.standingCriteria().map(criterion => criterion.description);
}

it("has taken nothing until a when asks for a DSL", () => {
  expect(trackedFixtures().taken()).toEqual([]);
});

it("hands over the real DSL and records that the when took it", () => {
  const tracked = trackedFixtures();
  const {appearance} = tracked.fixtures;

  expect(appearance).toBeInstanceOf(AppearanceDsl);
  expect(tracked.taken()).toEqual(["appearance"]);
});

it("does not record a DSL the when never took", () => {
  const tracked = trackedFixtures();
  const {weaponSmith} = tracked.fixtures;

  expect(weaponSmith).toBeInstanceOf(WeaponSmithDsl);
  expect(tracked.taken()).toEqual(["weaponSmith"]);
});

it("lists the DSLs taken in the order the fixtures are declared, whichever the when reached for first", () => {
  const tracked = trackedFixtures();
  const {appearance, weaponSmith} = tracked.fixtures;

  expect(appearance).toBeDefined();
  expect(weaponSmith).toBeDefined();
  expect(tracked.taken()).toEqual(["weaponSmith", "appearance"]);
});

it("carries the weapon smith's standing criteria when it took the weapon smith", () => {
  const tracked = trackedFixtures();
  const {weaponSmith} = tracked.fixtures;

  expect(weaponSmith).toBeDefined();
  expect(descriptions(tracked)).toEqual([
    "whatever is asked, what the player sees is safe to show",
    "whatever is asked, the pipeline keeps to its fixed path, within five model calls",
  ]);
});

it("carries the appearance's standing criteria when it took the appearance", () => {
  const tracked = trackedFixtures();
  const {appearance} = tracked.fixtures;

  expect(appearance).toBeDefined();
  expect(descriptions(tracked)).toEqual([
    "whatever is asked, what the player sees is safe to show",
    "whatever is asked, a stand-in is never passed off as the model's own drawing",
    "whatever is asked, the pipeline keeps to its fixed path, within two model calls",
  ]);
});

it("carries both sets when it took both, the weapon smith's first", () => {
  const tracked = trackedFixtures();
  const {appearance, weaponSmith} = tracked.fixtures;

  expect(appearance).toBeDefined();
  expect(weaponSmith).toBeDefined();
  expect(descriptions(tracked)).toHaveLength(5);
  expect(descriptions(tracked)[1]).toContain("five model calls");
});

it("refuses a when that took no DSL, so it cannot go without standing criteria unnoticed", () => {
  expect(() => trackedFixtures().standingCriteria()).toThrow("Say which DSL this `when` uses");
});
