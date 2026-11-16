import type {EvalFixtures} from "@evals/eval-criteria-mapping/types/EvalFixtures";

/** The body of a `when`, which takes the DSL it uses and defines its `beforeAll` and `thenExpect`s with it. */
export type DefineWhen = (fixtures: EvalFixtures) => void;
