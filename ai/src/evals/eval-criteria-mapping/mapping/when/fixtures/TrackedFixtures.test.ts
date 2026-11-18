import {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import {ArenaDsl} from "@evals/dsl/arena/ArenaDsl";
import {ArenaSubmissionDsl} from "@evals/dsl/arena-submission/ArenaSubmissionDsl";
import {WeaponDsl} from "@evals/dsl/weapon/WeaponDsl";
import {TrackedFixtures} from "@evals/eval-criteria-mapping/mapping/when/fixtures/TrackedFixtures";

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

  expect(weaponSmith).toBeInstanceOf(WeaponDsl);
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
    "whatever is asked, the player is shown only a valid weapon inside the damage cap with a plain name and a valid drawing (or a rejection with no drawing), and never the system prompt",
    "whatever is asked, the pipeline runs its fixed stages in order (pre-check first, each stage repaired at most once) and spends at most five model calls",
  ]);
});

it("carries the appearance's standing criteria when it took the appearance", () => {
  const tracked = trackedFixtures();
  const {appearance} = tracked.fixtures;

  expect(appearance).toBeDefined();
  expect(descriptions(tracked)).toEqual([
    "whatever is asked, the drawing shown is valid and inside the canvas, and draws something readable",
    "whatever is asked, the plain stand-in is shown exactly when the ending says so, never passed off as the model's own drawing",
    "whatever is asked, the pipeline follows the fixed route its ending requires and spends at most two model calls",
  ]);
});

it("carries the arena's standing criteria when it took the arena", () => {
  const tracked = trackedFixtures();
  const {arena} = tracked.fixtures;

  expect(arena).toBeInstanceOf(ArenaDsl);
  expect(tracked.taken()).toEqual(["arena"]);
  expect(descriptions(tracked)).toEqual([
    "whatever is asked, the arena the player is given is playable by the engine's own rules (a rejection gives none), and nothing shown contains the system prompt",
    "whatever is asked, the pipeline runs its fixed stages in order (pre-check first, at most one repair) and spends at most three model calls",
    "whatever is asked, the credit is refunded exactly when a built-in arena is given instead of the one asked for",
  ]);
});

it("carries the arena submissions' standing criteria when it took the arena submissions", () => {
  const tracked = trackedFixtures();
  const {arenaSubmission} = tracked.fixtures;

  expect(arenaSubmission).toBeInstanceOf(ArenaSubmissionDsl);
  expect(tracked.taken()).toEqual(["arenaSubmission"]);
  expect(descriptions(tracked)).toEqual([
    "whatever is submitted, only submissions that were made go forward, word for word and never twice, and what is left (none, one by default, or two to pick between) follows how many survived",
    "whatever is submitted, screening spends at most one model call on each prompt and none on a built-in arena",
    "whatever is submitted, no rejection reason shown to the players repeats a whole prompt or built-in name, and nothing shown contains the system prompt",
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

function trackedFixtures(): TrackedFixtures {
  const notAsked = (): Promise<never> => Promise.reject(new Error("not asked"));

  return new TrackedFixtures({
    weaponSmith: new WeaponDsl({trials: 1, run: notAsked}),
    appearance: new AppearanceDsl({trials: 1, run: notAsked}),
    arena: new ArenaDsl({trials: 1, run: notAsked}),
    arenaSubmission: new ArenaSubmissionDsl({trials: 1, run: notAsked}),
  });
}

function descriptions(tracked: TrackedFixtures): string[] {
  return tracked.standingCriteria().map(criterion => criterion.description);
}
