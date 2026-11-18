import {unreachableTier} from "@evals/eval-criteria-mapping/environment/tier/unreachable/UnreachableTier";
import type {EvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier";
import type {EvalDrivers} from "@evals/eval-criteria-mapping/drivers/types/EvalDrivers";
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

/**
 * The driver of every domain for the tier a run chose: the one place that names a tier. Everything a tier does differently lives in
 * its own classes. The chain ends in `unreachableTier`, so a tier added later cannot fall through to the paid one and spend the ledger.
 */
export function createEvalDrivers(tier: EvalTier, requestedTrials: string | undefined): EvalDrivers {
  if (tier === "fake") {
    return {
      weapon: new FakeWeaponPipelineEvalDriver(requestedTrials),
      appearance: new FakeAppearanceEvalDriver(requestedTrials),
      arena: new FakeArenaPipelineEvalDriver(requestedTrials),
      arenaSubmission: new FakeArenaSubmissionEvalDriver(requestedTrials),
    };
  }

  if (tier === "local") {
    return {
      weapon: new LocalWeaponPipelineEvalDriver(requestedTrials),
      appearance: new LocalAppearanceEvalDriver(requestedTrials),
      arena: new LocalArenaPipelineEvalDriver(requestedTrials),
      arenaSubmission: new LocalArenaSubmissionEvalDriver(requestedTrials),
    };
  }

  if (tier === "paid") {
    return {
      weapon: new PaidWeaponPipelineEvalDriver(requestedTrials),
      appearance: new PaidAppearanceEvalDriver(requestedTrials),
      arena: new PaidArenaPipelineEvalDriver(requestedTrials),
      arenaSubmission: new PaidArenaSubmissionEvalDriver(requestedTrials),
    };
  }

  return unreachableTier(tier);
}
