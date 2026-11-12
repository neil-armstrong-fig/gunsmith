export const weaponEvalKinds = ["positive", "boundary", "negative", "adversarial", "overpowered", "too-long"] as const;
export type WeaponEvalKind = (typeof weaponEvalKinds)[number];

// "either" is for cases whose point is a safety property (nothing over the caps, nothing leaked), whatever the pipeline decides.
export type WeaponExpectation = "created" | "rejected" | "either";

export interface WeaponEvalCase {
  name: string;
  kind: WeaponEvalKind;
  prompt: string;
  expectation: WeaponExpectation;
  // The most model calls this case may cost. A rejection that needs no model has 0.
  maxModelCalls: number;
}
