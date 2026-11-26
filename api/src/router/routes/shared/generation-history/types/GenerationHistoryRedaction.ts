/** Turns a submitted prompt into the text kept in internal history: personal details replaced, the rest as it was. May throw. */
export type GenerationHistoryRedaction = (prompt: string) => string;
