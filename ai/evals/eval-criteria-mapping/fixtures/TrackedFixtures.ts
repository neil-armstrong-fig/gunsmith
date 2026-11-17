import type {StandingCriterion} from "@evals/dsl/types/StandingCriterion";
import type {EvalFixtures} from "@evals/eval-criteria-mapping/types/EvalFixtures";
import {fixtureNames} from "@evals/eval-criteria-mapping/types/FixtureName";
import type {FixtureName} from "@evals/eval-criteria-mapping/types/FixtureName";

/**
 * The DSLs of one `when`, and which of them its body took. Standing criteria are registered while a spec file loads, before any
 * request runs, so the mapping cannot ask what the `when` went on to use; it asks what the `when` took. Destructuring a fixture
 * (`({appearance}) => …`) is what takes it, and happens as the body is called, which is why this knows in time.
 */
export class TrackedFixtures {
  /** What the `when` body is handed: each property read records that the body took that DSL. */
  readonly fixtures: EvalFixtures;
  private readonly takenNames = new Set<FixtureName>();

  constructor(private readonly source: EvalFixtures) {
    this.fixtures = this.watch();
  }

  /** The names of the DSLs the body took, in the order the fixtures are declared. */
  taken(): FixtureName[] {
    return fixtureNames.filter(name => this.takenNames.has(name));
  }

  /** What holds whatever was asked of the DSLs the body took. A body that took none has no way to ask, which is a mistake in the spec. */
  standingCriteria(): StandingCriterion[] {
    const taken = this.taken();
    if (taken.length === 0) {
      throw new Error(
        'Say which DSL this `when` uses: take it in the body\'s parameter, as `when("…", ({weaponSmith}) => {…})` or ' +
          "`({appearance}) => {…}` or `({arena}) => {…}`. Without one it would carry no standing criteria.",
      );
    }

    return taken.flatMap(name => this.source[name].standingCriteria());
  }

  private watch(): EvalFixtures {
    const source = this.source;
    const takenNames = this.takenNames;

    return {
      get weaponSmith() {
        takenNames.add("weaponSmith");

        return source.weaponSmith;
      },
      get appearance() {
        takenNames.add("appearance");

        return source.appearance;
      },
      get arena() {
        takenNames.add("arena");

        return source.arena;
      },
    };
  }
}
