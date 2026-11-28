import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/drafting/format/ArenaFormat";

/** What `repair` is handed: the player's words, the first answer, and what was wrong with it. */
export interface ArenaRepairRequest {
  prompt: string;
  /** What the model wrote the first time, `unknown` and unchecked; `undefined` when it gave nothing at all. */
  previous: unknown;
  /** Plain sentences from `validate`, never the player's own words (though a stray field's name may be in one). */
  errors: string[];
  /** How the model was asked to describe the arena the first time, and is asked again. */
  format: ArenaFormat;
}
