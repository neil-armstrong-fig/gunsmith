import type {EvalFixtures} from "@evals/eval-criteria-mapping/types/EvalFixtures";

/** A `then` states one criterion and checks it; a `beforeAll` carries out the request the `when` names. */
export type RunCriterion = (fixtures: EvalFixtures) => void | Promise<void>;
