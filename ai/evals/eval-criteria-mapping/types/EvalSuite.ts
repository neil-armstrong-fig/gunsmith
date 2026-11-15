/**
 * `regression` criteria hold now (expected near 100%) and gate CI; `inProgress` criteria belong to a feature still being built: tracked,
 * not gated, and graduated to `regression` once the feature is done and they hold (Anthropic's "capability" evals, "Demystifying evals
 * for AI agents"). The tag is set once, on the `given` (`given.inProgress`), with a comment saying why.
 */
export const evalSuites = ["regression", "inProgress"] as const;
export type EvalSuite = (typeof evalSuites)[number];
