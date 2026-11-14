import type {EvalFixtures} from "@evals/eval-criteria-mapping/types/EvalFixtures";

/** The body of a `given`: the `when`s it holds, defined by calling the mapping's own functions. */
export type DefineGiven = () => void;

/** The body of a `when`, which takes the DSL it uses and defines its `beforeAll` and `thenExpect`s with it. */
export type DefineWhen = (fixtures: EvalFixtures) => void;

/** `when` for a criterion that must hold (a regression), and `when.capability` for one that is a hill to climb. */
export interface WhenBlock {
  (description: string, define: DefineWhen): void;
  capability(description: string, define: DefineWhen): void;
}
