/**
 * `regression` criteria hold now (expected near 100%) and gate CI; `capability` criteria are a hill to climb: tracked, not gated,
 * and graduated to `regression` once they hold (Anthropic, "Demystifying evals for AI agents").
 */
export const evalSuites = ["regression", "capability"] as const;
export type EvalSuite = (typeof evalSuites)[number];
