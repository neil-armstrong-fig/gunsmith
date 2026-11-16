/**
 * Every way a weapon's appearance can end: the model's first drawing passed as written (`valid`), passed once the code had read
 * nested fields out of text or filled what was left out (`completed`), passed after the one repair (`repaired`), or nothing passed
 * and the plain stand-in is shown (`fallback`, disclosed, never passed off as the model's own).
 */
export const appearanceOutcomeStatuses = ["valid", "completed", "repaired", "fallback"] as const;

export type AppearanceOutcomeStatus = (typeof appearanceOutcomeStatuses)[number];
