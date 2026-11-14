import type {Appearance} from "@gunsmith/ai/pipeline/appearance/schema/Appearance";

/**
 * What `checkAppearance` answers: the appearance, or one sentence for each thing still wrong with the answer, and in both cases
 * what the code did to the answer on the way (the fields it read out of text, the ones it filled), so the model's own work can be
 * told from the code's, and the nodes that ran.
 */
export type AppearanceCheck =
  | {ok: true; appearance: Appearance; changes: string[]; nodes: string[]}
  | {ok: false; errors: string[]; changes: string[]; nodes: string[]};
