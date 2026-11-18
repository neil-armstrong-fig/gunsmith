import {createEvalDrivers} from "@evals/eval-criteria-mapping/drivers/CreateEvalDrivers";
import {FakeAppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/fake/FakeAppearanceEvalDriver";
import {LocalAppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/local/LocalAppearanceEvalDriver";
import {PaidAppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/paid/PaidAppearanceEvalDriver";
import {FakeArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/fake/FakeArenaPipelineEvalDriver";
import {LocalArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/local/LocalArenaPipelineEvalDriver";
import {PaidArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/paid/PaidArenaPipelineEvalDriver";
import {FakeArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/fake/FakeArenaSubmissionEvalDriver";
import {LocalArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/local/LocalArenaSubmissionEvalDriver";
import {PaidArenaSubmissionEvalDriver} from "@evals/eval-criteria-mapping/setups/arena-submission/paid/PaidArenaSubmissionEvalDriver";
import {FakeWeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/fake/FakeWeaponPipelineEvalDriver";
import {LocalWeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/local/LocalWeaponPipelineEvalDriver";
import {PaidWeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/paid/PaidWeaponPipelineEvalDriver";

// The riskiest line in the evals: the wrong class for a tier keeps every check green while a local run uses canned answers, or a
// local run spends the Haiku ledger. Each pairing is pinned, so a swap fails here and not in a bill.
it("gives the fake tier the fake driver of every domain", () => {
  const drivers = createEvalDrivers("fake", undefined);

  expect(drivers.weapon).toBeInstanceOf(FakeWeaponPipelineEvalDriver);
  expect(drivers.appearance).toBeInstanceOf(FakeAppearanceEvalDriver);
  expect(drivers.arena).toBeInstanceOf(FakeArenaPipelineEvalDriver);
  expect(drivers.arenaSubmission).toBeInstanceOf(FakeArenaSubmissionEvalDriver);
});

it("gives the local tier the local driver of every domain", () => {
  const drivers = createEvalDrivers("local", undefined);

  expect(drivers.weapon).toBeInstanceOf(LocalWeaponPipelineEvalDriver);
  expect(drivers.appearance).toBeInstanceOf(LocalAppearanceEvalDriver);
  expect(drivers.arena).toBeInstanceOf(LocalArenaPipelineEvalDriver);
  expect(drivers.arenaSubmission).toBeInstanceOf(LocalArenaSubmissionEvalDriver);
});

it("gives the paid tier the paid driver of every domain, including the two that say there is no paid tier yet", () => {
  const drivers = createEvalDrivers("paid", undefined);

  expect(drivers.weapon).toBeInstanceOf(PaidWeaponPipelineEvalDriver);
  expect(drivers.appearance).toBeInstanceOf(PaidAppearanceEvalDriver);
  expect(drivers.arena).toBeInstanceOf(PaidArenaPipelineEvalDriver);
  expect(drivers.arenaSubmission).toBeInstanceOf(PaidArenaSubmissionEvalDriver);
});

it("hands the number of trials a run asks for to every driver", () => {
  const drivers = createEvalDrivers("fake", "4");

  expect([
    drivers.weapon.trials,
    drivers.appearance.trials,
    drivers.arena.trials,
    drivers.arenaSubmission.trials,
  ]).toEqual([4, 4, 4, 4]);
});
