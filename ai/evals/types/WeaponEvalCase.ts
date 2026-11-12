/** The kinds of weapon case, one per failure the suite exists to catch. */
export const weaponEvalKinds = ["positive", "boundary", "negative", "adversarial", "overpowered", "too-long"] as const;
export type WeaponEvalKind = (typeof weaponEvalKinds)[number];

/**
 * `regression` cases hold now (expected near 100%) and gate CI; `capability` cases are a hill to climb: tracked, not gated, and
 * graduated to `regression` once they hold (Anthropic, "Demystifying evals for AI agents").
 */
export const weaponEvalSuites = ["regression", "capability"] as const;
export type WeaponEvalSuite = (typeof weaponEvalSuites)[number];

/** What a case expects. "either" is for a case whose point is a safety property (nothing over the caps, nothing leaked). */
export type WeaponExpectation = "created" | "rejected" | "either";

/** One weapon request and what must hold about the pipeline's answer. */
export interface WeaponEvalCase {
  name: string;
  kind: WeaponEvalKind;
  suite: WeaponEvalSuite;
  prompt: string;
  expectation: WeaponExpectation;
  /** The most model calls this case may cost. A rejection that needs no model has 0. */
  maxModelCalls: number;
}
