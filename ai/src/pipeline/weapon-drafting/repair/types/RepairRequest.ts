/** What `repair` is handed: the player's words, the first answer, and what was wrong with it. */
export interface RepairRequest {
  prompt: string;
  /** What the model wrote the first time, `unknown` and unchecked; `undefined` when it gave nothing at all. */
  previous: unknown;
  /** Plain sentences from `validate` or `rate`, never the player's own words (though a stray field's name may be in one). */
  errors: string[];
}
