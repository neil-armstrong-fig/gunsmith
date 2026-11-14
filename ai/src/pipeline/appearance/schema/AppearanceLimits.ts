/**
 * Every bound on an appearance, in one table: the schema is built from it, so the rule the model is told and the rule the code
 * enforces cannot drift apart. DRAFT, local to `ai/`, and **art's starting proposals, not measured caps**
 * (`docs/art/visual-schema-proposal.md`): the 24, 8, 32, 384 and 12 KiB come from there, the stroke, opacity and rotation bounds
 * are mine, and every number is a tunable until a spike measures it. `build` freezes the real contract in `HANDOFF.md`.
 */
export const APPEARANCE_LIMITS = {
  version: 1,
  /** The design space is this many units on a side; a part, stroke included, stays inside it. */
  space: 64,
  bodyParts: {min: 1, max: 24},
  projectileParts: {max: 8},
  pointsPerPart: {max: 32},
  pointsInAll: {max: 384},
  /** Of the compact JSON a model would write (`JSON.stringify`), in UTF-8. */
  bytes: {max: 12 * 1024},
  strokeWidth: {min: 0, max: 4},
  opacity: {min: 0.2, max: 1},
  rotationDegrees: {min: -180, max: 180},
} as const;
