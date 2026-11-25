import {createEvalDrivers} from "@evals/eval-criteria-mapping/drivers/CreateEvalDrivers";
import type {EvalDomain} from "@evals/dsl/shared/types/EvalDomain";
import {foldTrials} from "@evals/eval-criteria-mapping/mapping/run/fold-trials/FoldTrials";
import {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";
import type {EvalDrivers} from "@evals/dsl/types/EvalDrivers";
import {specNameOf} from "@evals/eval-criteria-mapping/environment/reporting/spec-name/SpecNameOf";
import type {CriterionResult} from "@evals/eval-criteria-mapping/environment/reporting/types/CriterionResult";
import type {ResultsRun} from "@evals/eval-criteria-mapping/environment/reporting/types/ResultsRun";
import type {EvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier";
import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";
import type {WhenContext} from "@evals/eval-criteria-mapping/mapping/types/WhenContext";

/**
 * One spec file's run: the tier it runs on and that tier's drivers, which `given`, `when`, `beforeAll` and `thenExpect` each read or
 * write as the file loads (where they are in the spec, and what each criterion came to), so none of them holds state of its own. The
 * tier is chosen once per run (`EVAL_TIER`) and each spec file keeps its own results, written when the file is done.
 */
export class EvalRun {
  readonly tier: EvalTier;
  readonly drivers: EvalDrivers;
  readonly weaponSmith: WeaponSmithDsl;
  private readonly results: CriterionResult[] = [];
  private currentGiven = "";
  private currentSuite: EvalSuite = "regression";
  private currentWhen: WhenContext | undefined;
  private tookTrials = false;
  private firstTrialDomain: EvalDomain | undefined;
  private inTrial = false;

  constructor(tier: EvalTier, requestedTrials: string | undefined) {
    this.tier = tier;
    this.drivers = createEvalDrivers(tier, requestedTrials);
    this.weaponSmith = new WeaponSmithDsl(this.drivers);
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
    this.tookTrials = false;

    return context;
  }

  /**
   * The `when`'s own body has been defined. Its trial scopes are defined afterwards (Vitest runs nested suites once their parent's body is
   * done), and each brings the `when` back (`runInScope`). A `when` that ran no trials asks nothing of any DSL, which is a mistake in the spec.
   */
  endWhen(): void {
    this.currentWhen = undefined;
    if (!this.tookTrials) {
      throw new Error(
        'Run each trial of this `when` in a scope of its own: `when("…", ({weaponSmith}) => {eachTrial(weaponSmith.weapon, weapon => {…})})`, ' +
          "or with `weaponSmith.appearance` or `weaponSmith.arena`. Without one it asks nothing.",
      );
    }
  }

  /** A request's trials are about to get a scope each: the first domain a spec file does this for decides its trial count. */
  noteTrialDomain(domain: EvalDomain): void {
    this.firstTrialDomain ??= domain;
    this.tookTrials = true;
  }

  isInTrial(): boolean {
    return this.inTrial;
  }

  /**
   * Defines something inside a `when`'s trial scope, which Vitest does after the `when`'s own body has finished: it brings back the
   * `when` the scope belongs to, so a `beforeAll` or `thenExpect` there finds its place, and marks it a trial's scope, so a `when`
   * inside it is nested. Everything is put back as it was afterwards.
   */
  runInScope(when: WhenContext, define: () => void): void {
    const before = {currentWhen: this.currentWhen, inTrial: this.inTrial};
    this.currentWhen = when;
    this.inTrial = true;
    try {
      define();
    } finally {
      this.currentWhen = before.currentWhen;
      this.inTrial = before.inTrial;
    }
  }

  /** The place in the report of a `when` inside another: the outer description, then its own after a `›`. */
  nestedWhen(outer: WhenContext, description: string): WhenContext {
    return {...outer, description: `${outer.description} › ${description}`};
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

  /** How many times a spec file's requests ran, which the first domain it ran trials for decides: each pipeline has its own. */
  trials(): number {
    return this.weaponSmith[this.firstTrialDomain ?? "weapon"].trials;
  }

  /** What the spec file came to, ready to be summarised and written when the file is done. */
  resultsRun(testPath: string | undefined): ResultsRun {
    return {
      spec: specNameOf(testPath),
      tier: this.tier,
      trials: this.trials(),
      ranAt: new Date().toISOString(),
      results: foldTrials(this.results),
    };
  }
}
