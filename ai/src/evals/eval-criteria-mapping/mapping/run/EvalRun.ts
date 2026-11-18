import {createEvalDrivers} from "@evals/eval-criteria-mapping/drivers/CreateEvalDrivers";
import type {EvalDrivers} from "@evals/eval-criteria-mapping/drivers/types/EvalDrivers";
import {specNameOf} from "@evals/eval-criteria-mapping/environment/reporting/spec-name/SpecNameOf";
import type {CriterionResult} from "@evals/eval-criteria-mapping/environment/reporting/types/CriterionResult";
import type {ResultsRun} from "@evals/eval-criteria-mapping/environment/reporting/types/ResultsRun";
import type {EvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier";
import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";
import type {FixtureName} from "@evals/eval-criteria-mapping/mapping/types/FixtureName";
import type {WhenContext} from "@evals/eval-criteria-mapping/mapping/types/WhenContext";

/**
 * One spec file's run: the tier it runs on and that tier's drivers, which `given`, `when`, `beforeAll` and `thenExpect` each read or
 * write as the file loads (where they are in the spec, and what each criterion came to), so none of them holds state of its own. The
 * tier is chosen once per run (`EVAL_TIER`) and each spec file keeps its own results, written when the file is done.
 */
export class EvalRun {
  readonly tier: EvalTier;
  readonly drivers: EvalDrivers;
  private readonly results: CriterionResult[] = [];
  private currentGiven = "";
  private currentSuite: EvalSuite = "regression";
  private currentWhen: WhenContext | undefined;
  private firstTaken: FixtureName | undefined;

  constructor(tier: EvalTier, requestedTrials: string | undefined) {
    this.tier = tier;
    this.drivers = createEvalDrivers(tier, requestedTrials);
  }

  /** A `given` is being defined: the `when`s inside it take its description and its suite. */
  beginGiven(description: string, suite: EvalSuite): void {
    this.currentGiven = description;
    this.currentSuite = suite;
  }

  /** A `when` is being defined: where its `beforeAll` and `thenExpect`s find their place in the report. */
  beginWhen(description: string): WhenContext {
    const context: WhenContext = {given: this.currentGiven, description, suite: this.currentSuite};
    this.currentWhen = context;

    return context;
  }

  /** The `when` has been defined; it took this DSL first, or none. The first DSL a spec file takes decides its trial count. */
  endWhen(taken: FixtureName | undefined): void {
    this.firstTaken ??= taken;
    this.currentWhen = undefined;
  }

  /** The `when` being defined. `beforeAll` and `thenExpect` belong inside one, which a spec that puts them elsewhere is told. */
  requireWhen(caller: string): WhenContext {
    if (this.currentWhen === undefined) {
      throw new Error(`\`${caller}\` belongs inside a \`when\`.`);
    }

    return this.currentWhen;
  }

  record(result: CriterionResult): void {
    this.results.push(result);
  }

  /** How many times a spec file's requests ran, which its first DSL decides: each pipeline has its own trial count. */
  trials(): number {
    if (this.firstTaken === "appearance") {
      return this.drivers.appearance.trials;
    }

    if (this.firstTaken === "arena") {
      return this.drivers.arena.trials;
    }

    if (this.firstTaken === "arenaSubmission") {
      return this.drivers.arenaSubmission.trials;
    }

    return this.drivers.weapon.trials;
  }

  /** What the spec file came to, ready to be summarised and written when the file is done. */
  resultsRun(testPath: string | undefined): ResultsRun {
    return {
      spec: specNameOf(testPath),
      tier: this.tier,
      trials: this.trials(),
      ranAt: new Date().toISOString(),
      results: this.results,
    };
  }
}
