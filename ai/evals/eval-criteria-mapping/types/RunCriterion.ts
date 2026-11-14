/** A `then` states one criterion and checks it; a `beforeAll` carries out the request the `when` names. Both use the DSL the `when` took. */
export type RunCriterion = () => void | Promise<void>;
