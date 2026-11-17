import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/**
 * What `validateAppearance` answers: the appearance, parsed, or one plain sentence for each thing wrong with the answer, each
 * short enough to hand to a repair.
 */
export type AppearanceValidation = {ok: true; appearance: Appearance} | {ok: false; errors: string[]};
