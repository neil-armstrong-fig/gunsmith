/** A weapon that has passed its checks and is ready to be drawn: what the stats stage hands to the drawing stage. */
export interface WeaponToDraw {
  /** The player's words, which the drawing model reads as data as the stats model did. */
  prompt: string;
  /** The validated, balanced and rated weapon. `unknown` on purpose, as in `WeaponOutcome`: the drawing never reads or changes it. */
  weapon: unknown;
  /** The stats stage's nodes so far, in order. */
  nodes: string[];
  /** The stats stage's model calls so far. */
  modelCalls: number;
}
