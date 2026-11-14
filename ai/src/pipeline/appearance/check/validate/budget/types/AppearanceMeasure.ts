/** What an appearance costs, counted: the numbers the budgets are held to. */
export interface AppearanceMeasure {
  bodyParts: number;
  projectileParts: number;
  /** Every point of every polygon and polyline, body and projectile together. */
  points: number;
  /** Of the compact JSON (`JSON.stringify`), in UTF-8. */
  bytes: number;
}
